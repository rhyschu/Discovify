package com.discovify.controller;

import com.discovify.model.dto.BannerDTO;
import com.discovify.model.entity.Banner;
import com.discovify.model.vo.BannerVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.discovify.service.IBannerService;
import com.discovify.service.MinioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class BannerController {

    @Autowired
    private IBannerService bannerService;
    @Autowired
    private MinioService minioService;

    @PostMapping("/admin/getAllBanners")
    public Result<PageResult<Banner>> getAllBanners(@RequestBody BannerDTO bannerDTO) {
        return bannerService.getAllBanners(bannerDTO);
    }

    @PostMapping("/admin/addBanner")
    public Result addBanner(@RequestParam("banner") MultipartFile banner) {
        String bannerUrl = minioService.uploadFile(banner, "banners");
        return bannerService.addBanner(bannerUrl);
    }

    @PatchMapping("/admin/updateBanner/{id}")
    public Result updateBanner(@PathVariable("id") Long bannerId, @RequestParam("banner") MultipartFile banner) {
        String bannerUrl = minioService.uploadFile(banner, "banners");
        return bannerService.updateBanner(bannerId, bannerUrl);
    }

    @PatchMapping("/admin/updateBannerStatus/{id}")
    public Result updateBannerStatus(@PathVariable("id") Long bannerId, @RequestParam("status") Integer bannerStatus) {
        return bannerService.updateBannerStatus(bannerId, bannerStatus);
    }

    @DeleteMapping("/admin/deleteBanner/{id}")
    public Result deleteBanner(@PathVariable("id") Long bannerId) {
        return bannerService.deleteBanner(bannerId);
    }

    @DeleteMapping("/admin/deleteBanners")
    public Result deleteBanners(@RequestBody List<Long> bannerIds) {
        return bannerService.deleteBanners(bannerIds);
    }

    @GetMapping("/banner/getBannerList")
    public Result<List<BannerVO>> getBannerList() {
        return bannerService.getBannerList();
    }
}
