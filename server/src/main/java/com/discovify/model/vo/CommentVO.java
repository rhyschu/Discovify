package com.discovify.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class CommentVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long commentId;

    private String username;

    private String userAvatar;

    private String content;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createTime;

    private Long likeCount;

}
