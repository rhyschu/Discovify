package com.discovify;

import com.discovify.mapper.SongMapper;
import com.discovify.model.vo.SongVO;
import com.discovify.model.vo.SongAdminVO;
import com.discovify.model.dto.SongDTO;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.validation.Validator;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CatalogSortingTest {
    @Autowired SongMapper songs;
    @Autowired JdbcTemplate jdbc;
    @Autowired Validator validator;

    @Test
    void allSixOrdersMatchDatabaseAcrossPageBoundary() {
        var columns = Map.of("artistName", "a.name", "songName", "s.name", "album", "s.album");
        for (var entry : columns.entrySet()) {
            for (String direction : new String[]{"asc", "desc"}) {
                // Column and direction come exclusively from the fixed test cases above.
                var expected = jdbc.queryForList("SELECT s.id FROM tb_song s LEFT JOIN tb_artist a ON s.artist_id=a.id ORDER BY "
                        + entry.getValue() + " " + direction + ", s.name ASC, s.id ASC", Long.class);
                for (int number = 1; number <= 2; number++) {
                    var publicPage = new Page<SongVO>(number, 20);
                    publicPage.setOptimizeCountSql(false);
                    var result = songs.getSongsWithArtist(publicPage, "", "", "", entry.getKey(), direction);
                    int start = Math.min((number - 1) * 20, expected.size());
                    int end = Math.min(number * 20, expected.size());
                    assertEquals(expected.subList(start, end), result.getRecords().stream().map(SongVO::getSongId).toList());
                    assertEquals(expected.size(), result.getTotal());
                    var adminPage = new Page<SongAdminVO>(number, 20);
                    adminPage.setOptimizeCountSql(false);
                    var admin = songs.getSongsWithArtistName(adminPage, null, null, null, entry.getKey(), direction);
                    assertEquals(expected.subList(start, end), admin.getRecords().stream().map(SongAdminVO::getSongId).toList());
                    assertEquals(expected.size(), admin.getTotal());
                }
            }
        }
    }

    @Test
    void defaultSortAndInvalidInputAreValidated() {
        var request = new SongDTO();
        request.setPageNum(1);
        request.setPageSize(20);
        assertEquals("artistName", request.getSortBy());
        assertEquals("asc", request.getSortOrder());
        assertTrue(validator.validate(request).isEmpty());
        request.setSortBy("name; DROP TABLE tb_song");
        assertFalse(validator.validate(request).isEmpty());
        request.setSortBy("album");
        request.setSortOrder("invalid");
        assertFalse(validator.validate(request).isEmpty());
    }
}
