package com.discovify.model.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class ArtistNameVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long artistId;

    private String artistName;

}
