package com.discovify.controller;

import com.discovify.model.dto.PlaylistDTO;
import com.discovify.model.dto.SongDTO;
import com.discovify.model.vo.PlaylistVO;
import com.discovify.model.vo.SongVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.discovify.service.IUserFavoriteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/favorite")
public class UserFavoriteController {

    @Autowired
    private IUserFavoriteService userFavoriteService;

    @PostMapping("/getFavoriteSongs")
    public Result<PageResult<SongVO>> getUserFavoriteSongs(@RequestBody @Valid SongDTO songDTO) {
        return userFavoriteService.getUserFavoriteSongs(songDTO);
    }

    @PostMapping("/collectSong")
    public Result collectSong(@RequestParam Long songId) {
        return userFavoriteService.collectSong(songId);
    }

    @DeleteMapping("/cancelCollectSong")
    public Result cancelCollectSong(@RequestParam Long songId) {
        return userFavoriteService.cancelCollectSong(songId);
    }

    @PostMapping("/getFavoritePlaylists")
    public Result<PageResult<PlaylistVO>> getFavoritePlaylists(@RequestBody @Valid PlaylistDTO playlistDTO) {
        return userFavoriteService.getUserFavoritePlaylists(playlistDTO);
    }

    @PostMapping("/collectPlaylist")
    public Result collectPlaylist(@RequestParam Long playlistId) {
        return userFavoriteService.collectPlaylist(playlistId);
    }

    @DeleteMapping("/cancelCollectPlaylist")
    public Result cancelCollectPlaylist(@RequestParam Long playlistId) {
        return userFavoriteService.cancelCollectPlaylist(playlistId);
    }
}
