package com.discovify.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Data
public class SongDetailVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long songId;

    private String songName;

    private String artistName;

    private String album;

    private String lyric;

    private String duration;

    private String coverUrl;

    private String audioUrl;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate releaseTime;

    private Integer likeStatus;

    private List<CommentVO> comments;

}
