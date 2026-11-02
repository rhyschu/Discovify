package com.discovify.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import jakarta.validation.constraints.Pattern;

import java.io.Serial;
import java.io.Serializable;

@Data
public class SongDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private Integer pageNum;

    @NotNull
    private Integer pageSize;

    private String songName;

    private String artistName;

    private String album;

    @Pattern(regexp = "songName|artistName|album", message = "Unsupported sort field")
    private String sortBy = "artistName";
    @Pattern(regexp = "asc|desc", message = "Unsupported sort direction")
    private String sortOrder = "asc";
}

