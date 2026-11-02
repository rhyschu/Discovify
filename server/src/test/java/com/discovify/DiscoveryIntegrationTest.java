package com.discovify;

import com.discovify.service.DiscoveryService;
import com.discovify.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DiscoveryIntegrationTest {
    @Autowired DiscoveryService service;
    @Autowired JdbcTemplate db;
    @Autowired StringRedisTemplate redis;

    @Test
    void guestRecommendationsArePlayableUniqueAndCached() {
        var first=service.discover(null,"");
        var second=service.discover(null,"");
        var songs=(List<Map<String,Object>>)first.get("songs");
        assertEquals(10,songs.size());
        assertEquals(10,songs.stream().map(s->s.get("songId")).distinct().count());
        assertTrue(songs.stream().allMatch(s->s.get("audioUrl")!=null));
        assertEquals("content",first.get("mode"));
        assertEquals(true,second.get("cached"));
    }

    @Test
    void playbackRetryIsIdempotentAndInvalidatesProfileCache() {
        // Isolated test principal; no user-account changes or real listening history touched.
        long uid=9223372036854775000L;
        String event=UUID.randomUUID().toString();
        var before=service.discover(uid,"");
        var songs=(List<Map<String,Object>>)before.get("songs");
        long sid=((Number)songs.get(0).get("songId")).longValue();
        try {
            service.record(uid,sid,event,30); service.record(uid,sid,event,30);
            assertEquals(1,db.queryForObject("SELECT COUNT(*) FROM tb_listening_event WHERE user_id=? AND event_id=?",Integer.class,uid,event));
            var after=service.discover(uid,"");
            assertEquals(false,after.get("cached"));
            var updated=(List<Map<String,Object>>)after.get("songs");
            assertTrue(updated.stream().noneMatch(s->((Number)s.get("songId")).longValue()==sid));
            assertEquals(before.get("songs"),service.discover(uid-1,"").get("songs"));
        } finally { db.update("DELETE FROM tb_listening_event WHERE user_id=? AND event_id=?",uid,event); }
    }

    @Test
    void tokenRoleAndRevocationAreEnforced() {
        var request=new MockHttpServletRequest();
        assertNull(service.userId(request));
        String token=JwtUtil.generateToken(Map.of("role","ROLE_USER","userId",12345,"testNonce",UUID.randomUUID().toString()));
        request.addHeader("Authorization",token);
        assertThrows(ResponseStatusException.class,()->service.userId(request));
        try {
            redis.opsForValue().set(token,token,Duration.ofMinutes(1));
            assertEquals(12345L,service.userId(request));
        } finally { redis.delete(token); }
    }

    @Test
    @org.springframework.transaction.annotation.Transactional
    void favoriteChangesDoNotReuseAnOutdatedRecommendationList() {
        // The favorite exists only inside this rolled-back test transaction.
        // Other DB connections never see it; no account or durable favorite is changed.
        Long uid=db.queryForObject("SELECT MIN(id) FROM tb_user",Long.class);
        assertNotNull(uid);
        var before=service.discover(uid,"");
        var original=(List<Map<String,Object>>)before.get("songs");
        assertFalse(original.isEmpty());
        long sid=((Number)original.get(0).get("songId")).longValue();
        db.update("INSERT INTO tb_user_favorite (user_id,type,song_id,create_time) VALUES (?,0,?,CURRENT_TIMESTAMP)",uid,sid);
        var changed=service.discover(uid,"");
        var updated=(List<Map<String,Object>>)changed.get("songs");
        assertTrue(updated.stream().noneMatch(s->((Number)s.get("songId")).longValue()==sid));
        assertNotEquals(original,updated);
        assertEquals(true,service.discover(uid,"").get("cached"));
    }
}
