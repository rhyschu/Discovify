package com.discovify.service;

import com.discovify.model.dto.BannerDTO;
import com.discovify.model.entity.Banner;
import com.discovify.model.vo.BannerVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.baomidou.mybatisplus.extension.service.IService;

import java.util.List;

public interface IBannerService extends IService<Banner> {
    Result<PageResult<Banner>> getAllBanners(BannerDTO bannerDTO);
    Result addBanner(String bannerUrl);
    Result updateBanner(Long bannerId, String bannerUrl);
    Result updateBannerStatus(Long bannerId, Integer bannerStatus);
    Result deleteBanner(Long bannerId);
    Result deleteBanners(List<Long> bannerIds);
    Result<List<BannerVO>> getBannerList();
}
