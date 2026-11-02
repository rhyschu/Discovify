package com.discovify.service.impl;

import com.discovify.model.entity.Genre;
import com.discovify.mapper.GenreMapper;
import com.discovify.service.IGenreService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class GenreServiceImpl extends ServiceImpl<GenreMapper, Genre> implements IGenreService {

}
