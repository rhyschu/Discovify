package com.discovify.service;

import com.discovify.model.dto.SongAddDTO;
import com.discovify.model.dto.SongAndArtistDTO;
import com.discovify.model.dto.SongDTO;
import com.discovify.model.dto.SongUpdateDTO;
import com.discovify.model.entity.Song;
import com.discovify.model.vo.SongAdminVO;
import com.discovify.model.vo.SongDetailVO;
import com.discovify.model.vo.SongVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface ISongService extends IService<Song> {
    Result<PageResult<SongVO>> getAllSongs(SongDTO songDTO, HttpServletRequest request);
    Result<PageResult<SongAdminVO>> getAllSongsByArtist(SongAndArtistDTO songDTO);
    Result<List<SongVO>> getRecommendedSongs(HttpServletRequest request);
    Result<SongDetailVO> getSongDetail(Long songId, HttpServletRequest request);
    Result<Long> getAllSongsCount(String style);
    Result addSong(SongAddDTO songAddDTO);
    Result updateSong(SongUpdateDTO songUpdateDTO);
    Result updateSongCover(Long songId, String coverUrl);
    Result updateSongAudio(Long songId, String audioUrl, String duration);
    Result deleteSong(Long songId);
    Result deleteSongs(List<Long> songIds);

}
