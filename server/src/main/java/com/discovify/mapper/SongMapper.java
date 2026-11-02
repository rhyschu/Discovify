package com.discovify.mapper;

import com.discovify.model.entity.Song;
import com.discovify.model.vo.SongAdminVO;
import com.discovify.model.vo.SongDetailVO;
import com.discovify.model.vo.SongVO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface SongMapper extends BaseMapper<Song> {
    @Select("""
                SELECT 
                    s.id AS songId, 
                    s.name AS songName, 
                    s.album, 
                    s.duration, 
                    s.cover_url AS coverUrl, 
                    s.audio_url AS audioUrl, 
                    s.release_time AS releaseTime, 
                    a.name AS artistName
                FROM tb_song s
                LEFT JOIN tb_artist a ON s.artist_id = a.id
                WHERE 
                    (#{songName} IS NULL OR s.name LIKE CONCAT('%', #{songName}, '%'))
                    AND (#{artistName} IS NULL OR a.name LIKE CONCAT('%', #{artistName}, '%'))
                    AND (#{album} IS NULL OR s.album LIKE CONCAT('%', #{album}, '%'))
            ORDER BY
 CASE WHEN #{sortBy} = 'songName' AND #{sortOrder} = 'asc' THEN s.name END ASC,
 CASE WHEN #{sortBy} = 'songName' AND #{sortOrder} = 'desc' THEN s.name END DESC,
 CASE WHEN #{sortBy} = 'album' AND #{sortOrder} = 'asc' THEN s.album END ASC,
 CASE WHEN #{sortBy} = 'album' AND #{sortOrder} = 'desc' THEN s.album END DESC,
 CASE WHEN #{sortBy} = 'artistName' AND #{sortOrder} = 'asc' THEN a.name END ASC,
 CASE WHEN #{sortBy} = 'artistName' AND #{sortOrder} = 'desc' THEN a.name END DESC,
 s.name ASC, s.id ASC
            """)
    IPage<SongVO> getSongsWithArtist(Page<SongVO> page,
                                     @Param("songName") String songName,
                                     @Param("artistName") String artistName,
                                     @Param("album") String album,
 @Param("sortBy") String sortBy, @Param("sortOrder") String sortOrder);
    @Select("""
                SELECT 
                    s.id AS songId, 
                    s.name AS songName, 
                    s.artist_id AS artistId, 
                    s.album, 
                    s.lyric, 
                    s.duration, 
                    s.style, 
                    s.cover_url AS coverUrl, 
                    s.audio_url AS audioUrl, 
                    s.release_time AS releaseTime, 
                    a.name AS artistName
                FROM tb_song s
                LEFT JOIN tb_artist a ON s.artist_id = a.id
                WHERE 
                    (#{artistId} IS NULL OR s.artist_id = #{artistId})
                    AND(#{songName} IS NULL OR s.name LIKE CONCAT('%', #{songName}, '%'))
                    AND (#{album} IS NULL OR s.album LIKE CONCAT('%', #{album}, '%'))
                
            ORDER BY
 CASE WHEN #{sortBy} = 'songName' AND #{sortOrder} = 'asc' THEN s.name END ASC,
 CASE WHEN #{sortBy} = 'songName' AND #{sortOrder} = 'desc' THEN s.name END DESC,
 CASE WHEN #{sortBy} = 'album' AND #{sortOrder} = 'asc' THEN s.album END ASC,
 CASE WHEN #{sortBy} = 'album' AND #{sortOrder} = 'desc' THEN s.album END DESC,
 CASE WHEN #{sortBy} = 'artistName' AND #{sortOrder} = 'asc' THEN a.name END ASC,
 CASE WHEN #{sortBy} = 'artistName' AND #{sortOrder} = 'desc' THEN a.name END DESC,
 s.name ASC, s.id ASC
            """)
    IPage<SongAdminVO> getSongsWithArtistName(Page<SongAdminVO> page,
                                              @Param("artistId") Long artistId,
                                              @Param("songName") String songName,
                                              @Param("album") String album,
 @Param("sortBy") String sortBy, @Param("sortOrder") String sortOrder);
    @Select("""
                SELECT 
                    s.id AS songId, 
                    s.name AS songName, 
                    s.album, 
                    s.duration, 
                    s.cover_url AS coverUrl, 
                    s.audio_url AS audioUrl, 
                    s.release_time AS releaseTime, 
                    a.name AS artistName
                FROM tb_song s
                LEFT JOIN tb_artist a ON s.artist_id = a.id
                ORDER BY RAND() LIMIT 20
            """)
    List<SongVO> getRandomSongsWithArtist();
    SongDetailVO getSongDetailById(Long songId);
    IPage<SongVO> getSongsByIds(Page<SongVO> page, @Param("userId") Long userId,
                                @Param("songIds") List<Long> songIds,
                                @Param("songName") String songName,
                                @Param("artistName") String artistName,
                                @Param("album") String album);
    List<Long> getFavoriteSongStyles(@Param("favoriteSongIds") List<Long> favoriteSongIds);
    List<SongVO> getRecommendedSongsByStyles(@Param("sortedStyleIds") List<Long> sortedStyleIds,
                                             @Param("favoriteSongIds") List<Long> favoriteSongIds,
                                             @Param("limit") int limit);

}
