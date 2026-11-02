package com.discovify.model.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class CommentPlaylistDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long playlistId;

    private String content;

}
