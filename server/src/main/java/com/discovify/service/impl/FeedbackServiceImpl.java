package com.discovify.service.impl;

import com.discovify.constant.JwtClaimsConstant;
import com.discovify.constant.MessageConstant;
import com.discovify.mapper.FeedbackMapper;
import com.discovify.model.dto.FeedbackDTO;
import com.discovify.model.entity.Feedback;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.discovify.service.IFeedbackService;
import com.discovify.util.ThreadLocalUtil;
import com.discovify.util.TypeConversionUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@CacheConfig(cacheNames = "feedbackCache")
public class FeedbackServiceImpl extends ServiceImpl<FeedbackMapper, Feedback> implements IFeedbackService {

    @Autowired
    private FeedbackMapper feedbackMapper;

    @Override
    @Cacheable(key = "'getFeedbackList' + #feedbackDTO.pageNum + #feedbackDTO.pageSize + #feedbackDTO.keyword")
    public Result<PageResult<Feedback>> getAllFeedbacks(FeedbackDTO feedbackDTO) {
        Page<Feedback> page = new Page<>(feedbackDTO.getPageNum(), feedbackDTO.getPageSize());
        QueryWrapper<Feedback> queryWrapper = new QueryWrapper<>();
        if (feedbackDTO.getKeyword() != null) {
            queryWrapper.like("feedback", feedbackDTO.getKeyword());
        }
        queryWrapper.orderByDesc("create_time");

        IPage<Feedback> feedbackPage = feedbackMapper.selectPage(page, queryWrapper);
        if (feedbackPage.getRecords().size() == 0) {
            return Result.success(MessageConstant.DATA_NOT_FOUND, new PageResult<>(0L, null));
        }

        return Result.success(new PageResult<>(feedbackPage.getTotal(), feedbackPage.getRecords()));
    }

    @Override
    @CacheEvict(cacheNames = "feedbackCache", allEntries = true)
    public Result deleteFeedback(Long feedbackId) {
        if (feedbackMapper.deleteById(feedbackId) == 0) {
            return Result.error(MessageConstant.DELETE + MessageConstant.FAILED);
        }
        return Result.success(MessageConstant.DELETE + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "feedbackCache", allEntries = true)
    public Result deleteFeedbacks(List<Long> feedbackIds) {
        if (feedbackMapper.deleteByIds(feedbackIds) == 0) {
            return Result.error(MessageConstant.DELETE + MessageConstant.FAILED);
        }
        return Result.success(MessageConstant.DELETE + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "feedbackCache", allEntries = true)
    public Result addFeedback(String content) {
        Map<String, Object> map = ThreadLocalUtil.get();
        Object userIdObj = map.get(JwtClaimsConstant.USER_ID);
        Long userId = TypeConversionUtil.toLong(userIdObj);

        Feedback feedback = new Feedback();
        feedback.setUserId(userId).setFeedback(content).setCreateTime(LocalDateTime.now());

        if (feedbackMapper.insert(feedback) == 0) {
            return Result.error(MessageConstant.ADD + MessageConstant.FAILED);
        }
        return Result.success(MessageConstant.ADD + MessageConstant.SUCCESS);
    }

}
