package com.discovify.model.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PlaylistUpdateDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long playlistId;

    private String title;

    private String introduction;

    private String style;

}
