package com.discovify.enumeration;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum FavoriteTypeEnum {

    SONG(0, "Liked songs"),
    PLAYLIST(1, "Saved playlists");

    @EnumValue
    private final Integer id;
    private final String favoriteType;

    FavoriteTypeEnum(Integer id, String favoriteType) {
        this.id = id;
        this.favoriteType = favoriteType;
    }

}
