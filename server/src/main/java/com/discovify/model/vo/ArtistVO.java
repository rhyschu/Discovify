package com.discovify.model.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class ArtistVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long artistId;

    private String artistName;

    private String avatar;

}
