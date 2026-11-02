package com.discovify.enumeration;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

@Getter
public enum BannerStatusEnum {

    ENABLE(0, "Enable"),
    DISABLE(1, "Disable");

    @EnumValue
    private final Integer id;
    private final String bannerStatus;

    BannerStatusEnum(Integer id, String bannerStatus) {
        this.id = id;
        this.bannerStatus = bannerStatus;
    }

}
