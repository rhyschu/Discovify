package com.discovify.controller;

import com.discovify.model.dto.*;
import com.discovify.model.entity.Artist;
import com.discovify.model.entity.Playlist;
import com.discovify.model.vo.ArtistNameVO;
import com.discovify.model.vo.SongAdminVO;
import com.discovify.model.vo.UserManagementVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.discovify.service.*;
import com.discovify.util.BindingResultUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private IAdminService adminService;
    @Autowired
    private IUserService userService;
    @Autowired
    private IArtistService artistService;
    @Autowired
    private ISongService songService;
    @Autowired
    private IPlaylistService playlistService;
    @Autowired
    private MinioService minioService;

    @PostMapping("/register")
    public Result register(@RequestBody @Valid AdminDTO adminDTO, BindingResult bindingResult) {
        String errorMessage = BindingResultUtil.handleBindingResultErrors(bindingResult);
        if (errorMessage != null) {
            return Result.error(errorMessage);
        }

        return adminService.register(adminDTO);
    }

    @PostMapping("/login")
    public Result login(@RequestBody @Valid AdminDTO adminDTO, BindingResult bindingResult) {
        String errorMessage = BindingResultUtil.handleBindingResultErrors(bindingResult);
        if (errorMessage != null) {
            return Result.error(errorMessage);
        }

        return adminService.login(adminDTO);
    }

    @PostMapping("/logout")
    public Result logout(@RequestHeader("Authorization") String token) {
        return adminService.logout(token);
    }

    /**********************************************************************************************/

    @GetMapping("/getAllUsersCount")
    public Result<Long> getAllUsersCount() {
        return userService.getAllUsersCount();
    }

    @PostMapping("/getAllUsers")
    public Result<PageResult<UserManagementVO>> getAllUsers(@RequestBody UserSearchDTO userSearchDTO) {
        return userService.getAllUsers(userSearchDTO);
    }

    @PostMapping("/addUser")
    public Result addUser(@RequestBody @Valid UserAddDTO userAddDTO, BindingResult bindingResult) {
        String errorMessage = BindingResultUtil.handleBindingResultErrors(bindingResult);
        if (errorMessage != null) {
            return Result.error(errorMessage);
        }

        return userService.addUser(userAddDTO);
    }

    @PutMapping("/updateUser")
    public Result updateUser(@RequestBody @Valid UserDTO userDTO, BindingResult bindingResult) {
        String errorMessage = BindingResultUtil.handleBindingResultErrors(bindingResult);
        if (errorMessage != null) {
            return Result.error(errorMessage);
        }

        return userService.updateUser(userDTO);
    }

    @PatchMapping("/updateUserStatus/{id}/{status}")
    public Result updateUserStatus(@PathVariable("id") Long userId, @PathVariable("status") Integer userStatus) {
        return userService.updateUserStatus(userId, userStatus);
    }

    @DeleteMapping("/deleteUser/{id}")
    public Result deleteUser(@PathVariable("id") Long userId) {
        return userService.deleteUser(userId);
    }

    @DeleteMapping("/deleteUsers")
    public Result deleteUsers(@RequestBody List<Long> userIds) {
        return userService.deleteUsers(userIds);
    }

    /**********************************************************************************************/

    @GetMapping("/getAllArtistsCount")
    public Result<Long> getAllArtistsCount(@RequestParam(required = false) Integer gender, @RequestParam(required = false) String area) {
        return artistService.getAllArtistsCount(gender, area);
    }

    @PostMapping("/getAllArtists")
    public Result<PageResult<Artist>> getAllArtists(@RequestBody ArtistDTO artistDTO) {
        return artistService.getAllArtistsAndDetail(artistDTO);
    }

    @PostMapping("/addArtist")
    public Result addArtist(@RequestBody ArtistAddDTO artistAddDTO) {
        return artistService.addArtist(artistAddDTO);
    }

    @PutMapping("/updateArtist")
    public Result updateArtist(@RequestBody ArtistUpdateDTO artistUpdateDTO) {
        return artistService.updateArtist(artistUpdateDTO);
    }

    @PatchMapping("/updateArtistAvatar/{id}")
    public Result updateArtistAvatar(@PathVariable("id") Long artistId, @RequestParam("avatar") MultipartFile avatar) {
        String avatarUrl = minioService.uploadFile(avatar, "artists");
        return artistService.updateArtistAvatar(artistId, avatarUrl);
    }

    @DeleteMapping("/deleteArtist/{id}")
    public Result deleteArtist(@PathVariable("id") Long artistId) {
        return artistService.deleteArtist(artistId);
    }

    @DeleteMapping("/deleteArtists")
    public Result deleteArtists(@RequestBody List<Long> artistIds) {
        return artistService.deleteArtists(artistIds);
    }

    /**********************************************************************************************/

    @GetMapping("/getAllSongsCount")
    public Result<Long> getAllSongsCount(@RequestParam(required = false) String style) {
        return songService.getAllSongsCount(style);
    }

    @GetMapping("/getAllArtistNames")
    public Result<List<ArtistNameVO>> getAllArtistNames() {
        return artistService.getAllArtistNames();
    }

    @PostMapping("/getAllSongsByArtist")
    public Result<PageResult<SongAdminVO>> getAllSongsByArtist(@RequestBody @Valid SongAndArtistDTO songDTO) {
        return songService.getAllSongsByArtist(songDTO);
    }

    @PostMapping("/addSong")
    public Result addSong(@RequestBody SongAddDTO songAddDTO) {
        return songService.addSong(songAddDTO);
    }

    @PutMapping("/updateSong")
    public Result UpdateSong(@RequestBody SongUpdateDTO songUpdateDTO) {
        return songService.updateSong(songUpdateDTO);
    }

    @PatchMapping("/updateSongCover/{id}")
    public Result updateSongCover(@PathVariable("id") Long songId, @RequestParam("cover") MultipartFile cover) {
        String coverUrl = minioService.uploadFile(cover, "songCovers");
        return songService.updateSongCover(songId, coverUrl);
    }

    @PatchMapping("/updateSongAudio/{id}")
    public Result updateSongAudio(@PathVariable("id") Long songId, @RequestParam("audio") MultipartFile audio, @RequestParam("duration") String duration) {
        String audioUrl = minioService.uploadFile(audio, "songs");
        return songService.updateSongAudio(songId, audioUrl, duration);
    }

    @DeleteMapping("/deleteSong/{id}")
    public Result deleteSong(@PathVariable("id") Long songId) {
        return songService.deleteSong(songId);
    }

    @DeleteMapping("/deleteSongs")
    public Result deleteSongs(@RequestBody List<Long> songIds) {
        return songService.deleteSongs(songIds);
    }

    /**********************************************************************************************/

    @GetMapping("/getAllPlaylistsCount")
    public Result<Long> getAllPlaylistsCount(@RequestParam(required = false) String style) {
        return playlistService.getAllPlaylistsCount(style);
    }

    @PostMapping("/getAllPlaylists")
    public Result<PageResult<Playlist>> getAllPlaylists(@RequestBody PlaylistDTO playlistDTO) {
        return playlistService.getAllPlaylistsInfo(playlistDTO);
    }

    @PostMapping("/addPlaylist")
    public Result addPlaylist(@RequestBody PlaylistAddDTO playlistAddDTO) {
        return playlistService.addPlaylist(playlistAddDTO);
    }

    @PutMapping("/updatePlaylist")
    public Result updatePlaylist(@RequestBody PlaylistUpdateDTO playlistUpdateDTO) {
        return playlistService.updatePlaylist(playlistUpdateDTO);
    }

    @PatchMapping("/updatePlaylistCover/{id}")
    public Result updatePlaylistCover(@PathVariable("id") Long playlistId, @RequestParam("cover") MultipartFile cover) {
        String coverUrl = minioService.uploadFile(cover, "playlists");
        return playlistService.updatePlaylistCover(playlistId, coverUrl);
    }

    @DeleteMapping("/deletePlaylist/{id}")
    public Result deletePlaylist(@PathVariable("id") Long playlistId) {
        return playlistService.deletePlaylist(playlistId);
    }

    @DeleteMapping("/deletePlaylists")
    public Result deletePlaylists(@RequestBody List<Long> playlistIds) {
        return playlistService.deletePlaylists(playlistIds);
    }

}
