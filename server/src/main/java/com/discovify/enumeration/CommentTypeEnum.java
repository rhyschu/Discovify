package com.discovify.enumeration;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum CommentTypeEnum {

    SONG(0, "Song comments"),
    PLAYLIST(1, "Playlist comments");

    @EnumValue
    private final Integer id;
    private final String commentType;

    CommentTypeEnum(Integer id, String commentType) {
        this.id = id;
        this.commentType = commentType;
    }

}
