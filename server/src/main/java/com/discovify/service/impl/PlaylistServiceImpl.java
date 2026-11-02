package com.discovify.service.impl;

import com.discovify.constant.JwtClaimsConstant;
import com.discovify.constant.MessageConstant;
import com.discovify.enumeration.LikeStatusEnum;
import com.discovify.enumeration.RoleEnum;
import com.discovify.mapper.PlaylistMapper;
import com.discovify.mapper.UserFavoriteMapper;
import com.discovify.model.dto.PlaylistAddDTO;
import com.discovify.model.dto.PlaylistDTO;
import com.discovify.model.dto.PlaylistUpdateDTO;
import com.discovify.model.entity.Playlist;
import com.discovify.model.entity.UserFavorite;
import com.discovify.model.vo.PlaylistDetailVO;
import com.discovify.model.vo.PlaylistVO;
import com.discovify.model.vo.SongVO;
import com.discovify.result.PageResult;
import com.discovify.result.Result;
import com.discovify.service.IPlaylistService;
import com.discovify.service.MinioService;
import com.discovify.util.JwtUtil;
import com.discovify.util.TypeConversionUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@CacheConfig(cacheNames = "playlistCache")
public class PlaylistServiceImpl extends ServiceImpl<PlaylistMapper, Playlist> implements IPlaylistService {

    @Autowired
    private PlaylistMapper playlistMapper;
    @Autowired
    private UserFavoriteMapper userFavoriteMapper;
    @Autowired
    private MinioService minioService;

    @Override
    @Cacheable(key = "#playlistDTO.pageNum + '-' + #playlistDTO.pageSize + '-' + #playlistDTO.title + '-' + #playlistDTO.style")
    public Result<PageResult<PlaylistVO>> getAllPlaylists(PlaylistDTO playlistDTO) {
        Page<Playlist> page = new Page<>(playlistDTO.getPageNum(), playlistDTO.getPageSize());
        QueryWrapper<Playlist> queryWrapper = new QueryWrapper<>();
        if (playlistDTO.getTitle() != null) {
            queryWrapper.like("title", playlistDTO.getTitle());
        }
        if (playlistDTO.getStyle() != null) {
            queryWrapper.eq("style", playlistDTO.getStyle());
        }

        IPage<Playlist> playlistPage = playlistMapper.selectPage(page, queryWrapper);
        if (playlistPage.getRecords().size() == 0) {
            return Result.success(MessageConstant.DATA_NOT_FOUND, new PageResult<>(0L, null));
        }
        List<PlaylistVO> playlistVOList = playlistPage.getRecords().stream()
                .map(playlist -> {
                    PlaylistVO playlistVO = new PlaylistVO();
                    BeanUtils.copyProperties(playlist, playlistVO);
                    return playlistVO;
                }).toList();

        return Result.success(new PageResult<>(playlistPage.getTotal(), playlistVOList));
    }

    @Override
    @Cacheable(key = "#playlistDTO.pageNum + '-' + #playlistDTO.pageSize + '-' + #playlistDTO.title + '-' + #playlistDTO.style + '-admin'")
    public Result<PageResult<Playlist>> getAllPlaylistsInfo(PlaylistDTO playlistDTO) {
        Page<Playlist> page = new Page<>(playlistDTO.getPageNum(), playlistDTO.getPageSize());
        QueryWrapper<Playlist> queryWrapper = new QueryWrapper<>();
        if (playlistDTO.getTitle() != null) {
            queryWrapper.like("title", playlistDTO.getTitle());
        }
        if (playlistDTO.getStyle() != null) {
            queryWrapper.eq("style", playlistDTO.getStyle());
        }
        queryWrapper.orderByDesc("id");

        IPage<Playlist> playlistPage = playlistMapper.selectPage(page, queryWrapper);
        if (playlistPage.getRecords().size() == 0) {
            return Result.success(MessageConstant.DATA_NOT_FOUND, new PageResult<>(0L, null));
        }

        return Result.success(new PageResult<>(playlistPage.getTotal(), playlistPage.getRecords()));
    }

    @Override
    public Result<List<PlaylistVO>> getRecommendedPlaylists(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        Map<String, Object> map = null;
        if (token != null && !token.isEmpty()) {
            map = JwtUtil.parseToken(token);
        }

        Long userId = null;
        if (map != null) {
            String role = (String) map.get(JwtClaimsConstant.ROLE);
            if (role.equals(RoleEnum.USER.getRole())) {
                Object userIdObj = map.get(JwtClaimsConstant.USER_ID);
                userId = TypeConversionUtil.toLong(userIdObj);
            }
        }
        if (userId == null) {
            return Result.success(playlistMapper.getRandomPlaylists(10));
        }
        List<Long> favoritePlaylistIds = userFavoriteMapper.getFavoritePlaylistIdsByUserId(userId);
        if (favoritePlaylistIds.isEmpty()) {
            return Result.success(playlistMapper.getRandomPlaylists(10));
        }
        List<String> favoriteStyles = playlistMapper.getFavoritePlaylistStyles(favoritePlaylistIds);
        List<Long> favoriteStyleIds = userFavoriteMapper.getFavoriteIdsByStyle(favoriteStyles);
        Map<Long, Long> styleFrequency = favoriteStyleIds.stream()
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
        List<Long> sortedStyleIds = styleFrequency.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        List<PlaylistVO> recommendedPlaylists = playlistMapper.getRecommendedPlaylistsByStyles(sortedStyleIds, favoritePlaylistIds, 10);
        if (recommendedPlaylists.size() < 10) {
            List<PlaylistVO> randomPlaylists = playlistMapper.getRandomPlaylists(10);
            Set<Long> addedPlaylistIds = recommendedPlaylists.stream().map(PlaylistVO::getPlaylistId).collect(Collectors.toSet());

            for (PlaylistVO playlist : randomPlaylists) {
                if (recommendedPlaylists.size() >= 10) break;
                if (!addedPlaylistIds.contains(playlist.getPlaylistId())) {
                    recommendedPlaylists.add(playlist);
                }
            }
        }

        return Result.success(recommendedPlaylists);
    }

    @Override
    @Cacheable(key = "#playlistId")
    public Result<PlaylistDetailVO> getPlaylistDetail(Long playlistId, HttpServletRequest request) {
        PlaylistDetailVO playlistDetailVO = playlistMapper.getPlaylistDetailById(playlistId);
        List<SongVO> songVOList = playlistDetailVO.getSongs();
        songVOList.forEach(songVO -> songVO.setLikeStatus(LikeStatusEnum.DEFAULT.getId()));
        playlistDetailVO.setLikeStatus(LikeStatusEnum.DEFAULT.getId());
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        Map<String, Object> map = null;
        if (token != null && !token.isEmpty()) {
            map = JwtUtil.parseToken(token);
        }
        if (map != null) {
            String role = (String) map.get(JwtClaimsConstant.ROLE);
            if (role.equals(RoleEnum.USER.getRole())) {
                Object userIdObj = map.get(JwtClaimsConstant.USER_ID);
                Long userId = TypeConversionUtil.toLong(userIdObj);
                UserFavorite favoritePlaylist = userFavoriteMapper.selectOne(new QueryWrapper<UserFavorite>()
                        .eq("user_id", userId)
                        .eq("type", 1)
                        .eq("playlist_id", playlistId));
                if (favoritePlaylist != null) {
                    playlistDetailVO.setLikeStatus(LikeStatusEnum.LIKE.getId());
                }
                List<UserFavorite> favoriteSongs = userFavoriteMapper.selectList(new QueryWrapper<UserFavorite>()
                        .eq("user_id", userId)
                        .eq("type", 0));
                Set<Long> favoriteSongIds = favoriteSongs.stream()
                        .map(UserFavorite::getSongId)
                        .collect(Collectors.toSet());
                for (SongVO songVO : songVOList) {
                    if (favoriteSongIds.contains(songVO.getSongId())) {
                        songVO.setLikeStatus(LikeStatusEnum.LIKE.getId());
                    }
                }
            }
        }

        return Result.success(playlistDetailVO);
    }

    @Override
    public Result<Long> getAllPlaylistsCount(String style) {
        QueryWrapper<Playlist> queryWrapper = new QueryWrapper<>();
        if (style != null) {
            queryWrapper.eq("style", style);
        }

        return Result.success(playlistMapper.selectCount(queryWrapper));
    }

    @Override
    @CacheEvict(cacheNames = "playlistCache", allEntries = true)
    public Result addPlaylist(PlaylistAddDTO playlistAddDTOO) {
        QueryWrapper<Playlist> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("title", playlistAddDTOO.getTitle());
        if (playlistMapper.selectCount(queryWrapper) > 0) {
            return Result.error(MessageConstant.PLAYLIST + MessageConstant.ALREADY_EXISTS);
        }

        Playlist playlist = new Playlist();
        BeanUtils.copyProperties(playlistAddDTOO, playlist);
        playlistMapper.insert(playlist);

        return Result.success(MessageConstant.ADD + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "playlistCache", allEntries = true)
    public Result updatePlaylist(PlaylistUpdateDTO playlistUpdateDTO) {
        Long playlistId = playlistUpdateDTO.getPlaylistId();

        Playlist playlistByTitle = playlistMapper.selectOne(new QueryWrapper<Playlist>().eq("title", playlistUpdateDTO.getTitle()));
        if (playlistByTitle != null && !playlistByTitle.getPlaylistId().equals(playlistId)) {
            return Result.error(MessageConstant.PLAYLIST + MessageConstant.ALREADY_EXISTS);
        }

        Playlist playlist = new Playlist();
        BeanUtils.copyProperties(playlistUpdateDTO, playlist);
        if (playlistMapper.updateById(playlist) == 0) {
            return Result.error(MessageConstant.UPDATE + MessageConstant.FAILED);
        }

        return Result.success(MessageConstant.UPDATE + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "playlistCache", allEntries = true)
    public Result updatePlaylistCover(Long playlistId, String coverUrl) {
        Playlist playlist = playlistMapper.selectById(playlistId);
        String cover = playlist.getCoverUrl();
        if (cover != null && !cover.isEmpty()) {
            minioService.deleteFile(cover);
        }

        playlist.setCoverUrl(coverUrl);
        if (playlistMapper.updateById(playlist) == 0) {
            return Result.error(MessageConstant.UPDATE + MessageConstant.FAILED);
        }

        return Result.success(MessageConstant.UPDATE + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "playlistCache", allEntries = true)
    public Result deletePlaylist(Long playlistId) {
        Playlist playlist = playlistMapper.selectById(playlistId);
        if (playlist == null) {
            return Result.error(MessageConstant.PLAYLIST + MessageConstant.NOT_FOUND);
        }
        String coverUrl = playlist.getCoverUrl();
        if (coverUrl != null && !coverUrl.isEmpty()) {
            minioService.deleteFile(coverUrl);
        }
        if (playlistMapper.deleteById(playlistId) == 0) {
            return Result.error(MessageConstant.DELETE + MessageConstant.FAILED);
        }

        return Result.success(MessageConstant.DELETE + MessageConstant.SUCCESS);
    }

    @Override
    @CacheEvict(cacheNames = "playlistCache", allEntries = true)
    public Result deletePlaylists(List<Long> playlistIds) {
        List<Playlist> playlists = playlistMapper.selectBatchIds(playlistIds);
        List<String> coverUrlList = playlists.stream()
                .map(Playlist::getCoverUrl)
                .filter(coverUrl -> coverUrl != null && !coverUrl.isEmpty())
                .toList();
        for (String coverUrl : coverUrlList) {
            minioService.deleteFile(coverUrl);
        }
        if (playlistMapper.deleteBatchIds(playlistIds) == 0) {
            return Result.error(MessageConstant.DELETE + MessageConstant.FAILED);
        }

        return Result.success(MessageConstant.DELETE + MessageConstant.SUCCESS);
    }

}
