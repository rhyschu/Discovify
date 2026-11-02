package com.discovify.mapper;

import com.discovify.model.entity.Artist;
import com.discovify.model.vo.ArtistDetailVO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ArtistMapper extends BaseMapper<Artist> {
    ArtistDetailVO getArtistDetailById(Long artistId);

}
