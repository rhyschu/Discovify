package com.discovify.service.impl;

import com.discovify.constant.MessageConstant;
import com.discovify.enumeration.BannerStatusEnum;
import com.discovify.mapper.BannerMapper;
import com.discovify.model.dto.BannerDTO;
import com.discovify.model.entity.Banner;
import com.discovify.model.vo.BannerVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.discovify.service.IBannerService;
import com.discovify.service.MinioService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@CacheConfig(cacheNames = "bannerCache")
public class BannerServiceImpl extends ServiceImpl<BannerMapper, Banner> implements IBannerService {

    @Autowired
    private BannerMapper bannerMapper;
    @Autowired
    private MinioService minioService;

    @Override
    @Cacheable(key = "'bannerList' + #bannerDTO.pageNum + #bannerDTO.pageSize + #bannerDTO.bannerStatus")
    public Result<PageResult<Banner>> getAllBanners(BannerDTO bannerDTO) {
        Page<Banner> page = new Page<>(bannerDTO.getPageNum(), bannerDTO.getPageSize());
        QueryWrapper<Banner> queryWrapper = new QueryWrapper<>();
        if (bannerDTO.getBannerStatus() != null) {
            queryWrapper.eq("status", bannerDTO.getBannerStatus().getId());
        }
        queryWrapper.orderByDesc("id");

        IPage<Banner> bannerPage = bannerMapper.selectPage(page, queryWrapper);
        if (bannerPage.getRecords().size() == 0) {
            return Result.success(MessageConstant.DATA_NOT_FOUND, new PageResult<>(0L, null));
        }

        return Result.success(new PageResult<>(bannerPage.getTotal(), bannerPage.getRecords()));
    }

    @Override
    @CacheEvict(cacheNames = "bannerCache", allEntries = true)
    public Result addBanner(String bannerUrl) {
        Banner banner = new Banner();
        banner.setBannerUrl(bannerUrl).setBannerStatus(BannerStatusEnum.ENABLE);

        if (bannerMapper.insert(banner) == 0) {
            return Result.error(MessageConstant.ADD + MessageConstant.FAILED);
        }
        return Result.success(MessageConstant.ADD + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "bannerCache", allEntries = true)
    public Result updateBanner(Long bannerId, String bannerUrl) {
        Banner banner = bannerMapper.selectById(bannerId);
        String oldBannerUrl = banner.getBannerUrl();
        if (oldBannerUrl != null && !oldBannerUrl.isEmpty()) {
            minioService.deleteFile(oldBannerUrl);
        }

        banner.setBannerUrl(bannerUrl);
        if (bannerMapper.updateById(banner) == 0) {
            return Result.error(MessageConstant.UPDATE + MessageConstant.FAILED);
        }

        return Result.success(MessageConstant.UPDATE + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "bannerCache", allEntries = true)
    public Result updateBannerStatus(Long bannerId, Integer bannerStatus) {
        BannerStatusEnum statusEnum;
        if (bannerStatus == 0) {
            statusEnum = BannerStatusEnum.ENABLE;
        } else if (bannerStatus == 1) {
            statusEnum = BannerStatusEnum.DISABLE;
        } else {
            return Result.error(MessageConstant.BANNER_STATUS_INVALID);
        }
        Banner banner = new Banner();
        banner.setBannerId(bannerId).setBannerStatus(statusEnum);

        if (bannerMapper.updateById(banner) == 0) {
            return Result.error(MessageConstant.UPDATE + MessageConstant.FAILED);
        }
        return Result.success(MessageConstant.UPDATE + MessageConstant.SUCCESS);

    }

    @Override
    @CacheEvict(cacheNames = "bannerCache", allEntries = true)
    public Result deleteBanner(Long bannerId) {
        Banner banner = bannerMapper.selectById(bannerId);
        if (banner == null) {
            return Result.error(MessageConstant.DATA_NOT_FOUND);
        }
        String bannerUrl = banner.getBannerUrl();
        if (bannerUrl != null && !bannerUrl.isEmpty()) {
            minioService.deleteFile(bannerUrl);
        }

        if (bannerMapper.deleteById(bannerId) == 0) {
            return Result.error(MessageConstant.DELETE + MessageConstant.FAILED);
        }
        return Result.success(MessageConstant.DELETE + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "bannerCache", allEntries = true)
    public Result deleteBanners(List<Long> bannerIds) {
        List<Banner> banners = bannerMapper.selectByIds(bannerIds);
        List<String> bannerUrlList = banners.stream()
                .map(Banner::getBannerUrl)
                .filter(url -> url != null && !url.isEmpty())
                .toList();
        bannerUrlList.forEach(url -> minioService.deleteFile(url));

        if (bannerMapper.deleteByIds(bannerIds) == 0) {
            return Result.error(MessageConstant.DELETE + MessageConstant.FAILED);
        }
        return Result.success(MessageConstant.DELETE + MessageConstant.SUCCESS);
    }

    @Override
    @Cacheable(key = "'bannerList'")
    public Result<List<BannerVO>> getBannerList() {
        List<Banner> banners = bannerMapper.selectList(new QueryWrapper<Banner>()
                .eq("status", BannerStatusEnum.ENABLE.getId())
                .orderByDesc("id")
                .last("limit 9"));
        List<BannerVO> bannerVOList = banners.stream()
                .map(banner -> {
                    BannerVO bannerVO = new BannerVO();
                    BeanUtils.copyProperties(banner, bannerVO);
                    return bannerVO;
                }).toList();

        return Result.success(bannerVOList);
    }

}
