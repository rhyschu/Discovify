package com.discovify.enumeration;

import lombok.Getter;

@Getter
public enum LikeStatusEnum {

    DEFAULT(0, "Default"),
    LIKE(1, "Liked songs");

    private final Integer id;
    private final String likeStatus;

    LikeStatusEnum(Integer id, String likeStatus) {
        this.id = id;
        this.likeStatus = likeStatus;
    }

}
