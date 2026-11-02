package com.discovify;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest
public class RedisConnectionTest {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @Test
    public void testRedisConnection() {
        String key = "testKey";
        String value = "testValue";
        stringRedisTemplate.opsForValue().set(key, value);
        String retrievedValue = stringRedisTemplate.opsForValue().get(key);
        assertEquals(value, retrievedValue, "RedisConnection successful; values match");
        stringRedisTemplate.delete(key);
        assertNull(stringRedisTemplate.opsForValue().get(key), "Test key deleted");
    }

}