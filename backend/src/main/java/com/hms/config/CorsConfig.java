package com.hms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${HMS_FRONTEND_URL:}")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Build allowed origins list — always include dev + the production frontend
        List<String> origins = new ArrayList<>(List.of(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173"
        ));
        // Add the production frontend URL from env var (avoids hardcoding)
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            origins.add(frontendUrl);
        }
        // Hardcoded fallback for Vercel
        if (!origins.contains("https://hms-nine-lime.vercel.app")) {
            origins.add("https://hms-nine-lime.vercel.app");
        }
        config.setAllowedOrigins(origins);

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "X-Hostel-Id",
            "Accept",
            "Origin",
            "X-Requested-With"
        ));
        // Expose custom headers so the browser JS can read them
        config.setExposedHeaders(List.of("Authorization", "X-Hostel-Id"));
        config.setAllowCredentials(true);
        // Cache preflight response for 1 hour (reduces OPTIONS requests)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
