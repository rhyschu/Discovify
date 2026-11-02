package com.discovify.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class ArtistAddDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String artistName;

    private Integer gender;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birth;

    private String area;

    private String introduction;

}
