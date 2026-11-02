package com.discovify.service;

import com.discovify.model.dto.PlaylistAddDTO;
import com.discovify.model.dto.PlaylistDTO;
import com.discovify.model.dto.PlaylistUpdateDTO;
import com.discovify.model.entity.Playlist;
import com.discovify.model.vo.PlaylistDetailVO;
import com.discovify.model.vo.PlaylistVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface IPlaylistService extends IService<Playlist> {
    Result<PageResult<PlaylistVO>> getAllPlaylists(PlaylistDTO playlistDTO);
    Result<PageResult<Playlist>> getAllPlaylistsInfo(PlaylistDTO playlistDTO);
    Result<List<PlaylistVO>> getRecommendedPlaylists(HttpServletRequest request);
    Result<PlaylistDetailVO> getPlaylistDetail(Long playlistId, HttpServletRequest request);
    Result<Long> getAllPlaylistsCount(String style);
    Result addPlaylist(PlaylistAddDTO playlistAddDTO);
    Result updatePlaylist(PlaylistUpdateDTO playlistUpdateDTO);
    Result updatePlaylistCover(Long playlistId, String coverUrl);
    Result deletePlaylist(Long playlistId);
    Result deletePlaylists(List<Long> playlistIds);

}
