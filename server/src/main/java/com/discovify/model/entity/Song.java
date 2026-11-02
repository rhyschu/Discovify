package com.discovify.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("tb_song")
public class Song implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long songId;

    @TableField("artist_id")
    private Long artistId;

    @TableField("name")
    private String songName;

    @TableField("album")
    private String album;

    @TableField("lyric")
    private String lyric;

    @TableField("duration")
    private String duration;

    @TableField("style")
    private String style;

    @TableField("cover_url")
    private String coverUrl;

    @TableField("audio_url")
    private String audioUrl;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @TableField("release_time")
    private LocalDate releaseTime;

}
