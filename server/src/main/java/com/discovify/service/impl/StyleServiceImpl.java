package com.discovify.service.impl;

import com.discovify.model.entity.Style;
import com.discovify.mapper.StyleMapper;
import com.discovify.service.IStyleService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.stereotype.Service;

@Service
public class StyleServiceImpl extends ServiceImpl<StyleMapper, Style> implements IStyleService {

}
