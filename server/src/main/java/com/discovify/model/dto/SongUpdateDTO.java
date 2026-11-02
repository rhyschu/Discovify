package com.discovify.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class SongUpdateDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long songId;

    private Long artistId;

    private String songName;

    private String album;

    private String style;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate releaseTime;

}
