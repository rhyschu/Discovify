package com.discovify.model.dto;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class PlaylistAddDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String title;

    private String introduction;

    private String style;

}
