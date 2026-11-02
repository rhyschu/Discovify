package com.discovify.mapper;

import com.discovify.model.entity.Playlist;
import com.discovify.model.vo.PlaylistDetailVO;
import com.discovify.model.vo.PlaylistVO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PlaylistMapper extends BaseMapper<Playlist> {
    PlaylistDetailVO getPlaylistDetailById(Long playlistId);
    List<String> getFavoritePlaylistStyles(List<Long> favoritePlaylistIds);
    List<PlaylistVO> getRecommendedPlaylistsByStyles(List<Long> sortedStyleIds, List<Long> favoritePlaylistIds, int limit);
    @Select("""
            SELECT 
                p.id AS playlistId, 
                p.title AS title, 
                p.cover_url AS coverUrl
            FROM tb_playlist p
            ORDER BY RAND() 
            LIMIT #{limit}
            """)
    List<PlaylistVO> getRandomPlaylists(int limit);
    IPage<PlaylistVO> getPlaylistsByIds(
            Long userId,
            Page<PlaylistVO> page,
            @Param("playlistIds") List<Long> playlistIds,
            @Param("title") String title,
            @Param("style") String style);
}
