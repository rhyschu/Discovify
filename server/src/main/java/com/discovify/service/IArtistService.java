package com.discovify.service;

import com.discovify.model.dto.ArtistAddDTO;
import com.discovify.model.dto.ArtistDTO;
import com.discovify.model.dto.ArtistUpdateDTO;
import com.discovify.model.entity.Artist;
import com.discovify.model.vo.ArtistDetailVO;
import com.discovify.model.vo.ArtistNameVO;
import com.discovify.model.vo.ArtistVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface IArtistService extends IService<Artist> {
    Result<PageResult<ArtistVO>> getAllArtists(ArtistDTO artistDTO);
    Result<PageResult<Artist>> getAllArtistsAndDetail(ArtistDTO artistDTO);
    Result<List<ArtistNameVO>> getAllArtistNames();
    Result<List<ArtistVO>> getRandomArtists();
    Result<ArtistDetailVO> getArtistDetail(Long artistId, HttpServletRequest request);
    Result<Long> getAllArtistsCount(Integer gender, String area);
    Result addArtist(ArtistAddDTO artistAddDTO);
    Result updateArtist(ArtistUpdateDTO artistUpdateDTO);
    Result updateArtistAvatar(Long artistId, String avatar);
    Result deleteArtist(Long ArtistId);
    Result deleteArtists(List<Long> artistIds);

}
