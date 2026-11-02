package com.discovify.service;

import com.discovify.model.dto.PlaylistDTO;
import com.discovify.model.dto.SongDTO;
import com.discovify.model.entity.UserFavorite;
import com.discovify.model.vo.PlaylistVO;
import com.discovify.model.vo.SongVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;

public interface IUserFavoriteService extends IService<UserFavorite> {
    Result<PageResult<SongVO>> getUserFavoriteSongs(SongDTO songDTO);
    Result collectSong(Long songId);
    Result cancelCollectSong(Long songId);
    Result<PageResult<PlaylistVO>> getUserFavoritePlaylists(PlaylistDTO playlistDTO);
    Result collectPlaylist(Long playlistId);
    Result cancelCollectPlaylist(Long playlistId);

}
