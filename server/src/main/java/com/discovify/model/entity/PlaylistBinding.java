package com.discovify.model.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;

import java.io.Serial;
import java.io.Serializable;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("tb_playlist_binding")
public class PlaylistBinding implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "playlist_id", type = IdType.AUTO)
    private Long playlistId;

    @TableField("song_id")
    private Long songId;

}
