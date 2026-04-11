package com.minyeo.farm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class FarmBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmBackendApplication.class, args);
    }
}
