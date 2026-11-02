package com.discovify.service;

import com.discovify.model.dto.FeedbackDTO;
import com.discovify.model.entity.Feedback;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface IFeedbackService extends IService<Feedback> {
    Result<PageResult<Feedback>> getAllFeedbacks(FeedbackDTO feedbackDTO);
    Result deleteFeedback(Long feedbackId);
    Result deleteFeedbacks(List<Long> feedbackIds);
    Result addFeedback(String content);

}
