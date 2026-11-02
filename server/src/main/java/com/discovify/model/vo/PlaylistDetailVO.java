package com.discovify.model.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Data
public class PlaylistDetailVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long playlistId;

    private String title;

    private String coverUrl;

    private String introduction;

    private List<SongVO> songs;

    private Integer likeStatus;

    private List<CommentVO> comments;

}
