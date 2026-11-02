package com.discovify.service;

import com.discovify.model.dto.CommentPlaylistDTO;
import com.discovify.model.dto.CommentSongDTO;
import com.discovify.model.entity.Comment;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;

public interface ICommentService extends IService<Comment> {
    Result addSongComment(CommentSongDTO commentSongDTO);
    Result addPlaylistComment(CommentPlaylistDTO commentPlaylistDTO);
    Result likeComment(Long commentId);
    Result cancelLikeComment(Long commentId);
    Result deleteComment(Long commentId);

}
