package com.discovify.model.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PlaylistVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long playlistId;

    private String title;

    private String coverUrl;

}
