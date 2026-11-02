package com.discovify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching   
@SpringBootApplication
public class DiscovifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(DiscovifyApplication.class, args);
    }

}
