package com.discovify.model.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class BannerVO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long bannerId;

    private String bannerUrl;

}
