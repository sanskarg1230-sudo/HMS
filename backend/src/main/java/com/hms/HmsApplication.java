package com.hms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the HMS Spring Boot application.
 * Run this class to start the embedded Tomcat server on port 8080.
 */
@SpringBootApplication
public class HmsApplication {
    public static void main(String[] args) {
        SpringApplication.run(HmsApplication.class, args);
    }
}
