package com.discovify.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

@Data
public class SongVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long songId;

    private String songName;

    private String artistName;

    private String album;

    private String duration;

    private String coverUrl;

    private String audioUrl;

    private Integer likeStatus;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate releaseTime;

}
