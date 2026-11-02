package com.discovify.service;

import com.discovify.constant.JwtClaimsConstant;
import com.discovify.util.JwtUtil;
import com.discovify.util.TypeConversionUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;

@Service
public class DiscoveryService {
    private final JdbcTemplate db;
    private final StringRedisTemplate redis;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(1)).build();
    @Value("${recommendation.url:http://127.0.0.1:8091}") private String serviceUrl;
    @Value("${recommendation.service-token:}") private String serviceToken;
    public DiscoveryService(JdbcTemplate db, StringRedisTemplate redis, ObjectMapper json) {
        this.db = db; this.redis = redis; this.json = json;
    }

    // Public cold-start endpoint; personalization requires a live user token, not a client-supplied ID.
    public Long userId(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || token.isBlank()) return null;
        if (token.startsWith("Bearer ")) token = token.substring(7);
        try {
            if (redis.opsForValue().get(token) == null) throw new IllegalArgumentException();
            Map<String,Object> claims = JwtUtil.parseToken(token);
            if (!"ROLE_USER".equals(claims.get(JwtClaimsConstant.ROLE))) throw new IllegalArgumentException();
            return TypeConversionUtil.toLong(claims.get(JwtClaimsConstant.USER_ID));
        } catch (Exception e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in again"); }
    }

    public void record(Long userId, long songId, String eventId, int seconds) {
        if (userId == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        // Unique event IDs make network retries idempotent. Only meaningful listening is accepted.
        if (seconds < 30 || seconds > 86400) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        int count = db.queryForObject("SELECT COUNT(*) FROM tb_song WHERE id=?", Integer.class, songId);
        if (count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Song not found");
        db.update("INSERT IGNORE INTO tb_listening_event (user_id,song_id,event_id,listened_seconds) VALUES (?,?,?,?)", userId, songId, eventId, seconds);
    }

    public Map<String,Object> discover(Long userId, String intent) {
        long started = System.nanoTime();
        List<Map<String,Object>> catalog = db.queryForList("""
            SELECT s.id AS songId,s.name AS songName,COALESCE(a.name,'Unknown artist') AS artistName,
            COALESCE(s.album,'') AS album,COALESCE(s.style,'') AS genres,s.duration AS duration,
            s.cover_url AS coverUrl,s.audio_url AS audioUrl,s.release_time AS releaseTime,0 AS likeStatus
            FROM tb_song s LEFT JOIN tb_artist a ON a.id=s.artist_id
            WHERE s.audio_url IS NOT NULL AND s.audio_url<>'' ORDER BY s.id
            """);
        List<Map<String,Object>> events = new ArrayList<>();
        if (userId != null) {
            events.addAll(db.queryForList("""
                SELECT song_id, 'favorite' AS kind, 0 AS age_days FROM tb_user_favorite
                WHERE user_id=? AND type=0 AND song_id IS NOT NULL ORDER BY id DESC LIMIT 300
                """, userId));
            events.addAll(db.queryForList("""
                SELECT song_id, 'listen' AS kind, GREATEST(0,TIMESTAMPDIFF(SECOND,created_at,CURRENT_TIMESTAMP)/86400.0) AS age_days
                FROM tb_listening_event WHERE user_id=? AND created_at > CURRENT_TIMESTAMP - INTERVAL 90 DAY
                ORDER BY created_at DESC LIMIT 500
                """, userId));
        }
        Set<Long> excluded = new HashSet<>();
        for (var e : events) if ("favorite".equals(e.get("kind")) || ((Number)e.get("age_days")).doubleValue()<7) excluded.add(((Number)e.get("song_id")).longValue());
        List<Map<String,Object>> payloadCatalog = catalog.stream().map(s -> Map.<String,Object>of(
            "id", s.get("songId"), "title", s.get("songName"), "artist", s.get("artistName"), "album", s.get("album"), "genres", s.get("genres"))).toList();
        // Quantize age into daily buckets for stable caching. Profile/content changes change the key.
        List<Map<String,Object>> cacheEvents = events.stream().map(e -> Map.<String,Object>of("song_id",e.get("song_id"), "kind",e.get("kind"), "age_days",Math.floor(((Number)e.get("age_days")).doubleValue()))).toList();
        Map<String,Object> payload = Map.of("catalog",payloadCatalog,"events",cacheEvents,"intent",intent,"limit",10);
        Map<String,Object> answer = null;
        String cacheKey = null;
        boolean cached = false;
        try {
            String body = json.writeValueAsString(payload);
            cacheKey = "discovify:discover:v1:" + userId + ":" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(body.getBytes(StandardCharsets.UTF_8)));
            try {
                String hit = redis.opsForValue().get(cacheKey);
                if (hit != null) { answer = json.readValue(hit, Map.class); cached = true; }
            } catch (Exception ignored) { /* Cache failures do not take down discovery. */ }
            if (answer == null) {
                HttpRequest call = HttpRequest.newBuilder(URI.create(serviceUrl + "/recommend"))
                    .timeout(Duration.ofSeconds(14)).header("Content-Type", "application/json")
                    .header("X-Service-Token", serviceToken).POST(HttpRequest.BodyPublishers.ofString(body)).build();
                HttpResponse<String> response = http.send(call,HttpResponse.BodyHandlers.ofString());
                if (response.statusCode()!=200) throw new IllegalStateException("Recommendation service unavailable");
                answer = json.readValue(response.body(),Map.class);
            }
        } catch (Exception ex) {
            if (ex instanceof InterruptedException) Thread.currentThread().interrupt();
            answer = new HashMap<>();
            answer.put("mode", "fallback");
        }
        // Rehydrate from authoritative database records; never trust model-provided media URLs or IDs.
        Map<Long,Map<String,Object>> byId = new HashMap<>();
        for (var s:catalog) byId.put(((Number)s.get("songId")).longValue(),s);
        List<Map<String,Object>> songs = new ArrayList<>();
        Set<Long> added = new HashSet<>();
        JsonNode recommendations = json.valueToTree(answer.getOrDefault("recommendations",List.of()));
        for (JsonNode choice : recommendations) {
            long sid = choice.path("song_id").asLong(-1);
            if (byId.containsKey(sid) && !excluded.contains(sid) && added.add(sid) && songs.size()<10) {
                Map<String,Object> song = new HashMap<>(byId.get(sid));
                song.put("recommendationReason",choice.path("reason").asText("Selected for your discovery mix."));
                songs.add(song);
            }
        }
        if (songs.size()<Math.min(10,byId.keySet().stream().filter(id -> !excluded.contains(id)).count())) {
            answer.put("mode","fallback");
            Set<String> artists = new HashSet<>();
            for(int pass=0;pass<2 && songs.size()<10;pass++) for(var s:catalog) {
                long sid=((Number)s.get("songId")).longValue();
                if(songs.size()>=10) break;
                if(excluded.contains(sid)||added.contains(sid)||(pass==0&&artists.contains(s.get("artistName").toString()))) continue;
                Map<String,Object> song=new HashMap<>(s);
                song.put("recommendationReason","Explore a playable track from the catalog.");
                songs.add(song); added.add(sid); artists.add(s.get("artistName").toString());
            }
        }
        if (!cached && cacheKey!=null && !"fallback".equals(answer.get("mode"))) try {
            redis.opsForValue().set(cacheKey,json.writeValueAsString(answer),Duration.ofMinutes(5));
        } catch (Exception ignored) { }
        return Map.of("songs",songs,"mode",answer.getOrDefault("mode","content"),"cached",cached,
            "elapsedMs",(System.nanoTime()-started)/1_000_000,"personalized",!events.isEmpty());
    }
}
