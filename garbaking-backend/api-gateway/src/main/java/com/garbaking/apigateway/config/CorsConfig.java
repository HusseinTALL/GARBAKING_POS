package com.garbaking.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

/**
 * CORS Configuration for API Gateway
 *
 * Enables Cross-Origin Resource Sharing for frontend applications
 * to communicate with the Spring Boot microservices through the API Gateway.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // DO NOT use applyPermitDefaultValues() as it sets allowedOrigins to "*"
        // which conflicts with allowCredentials=true

        // Allow all origins for development (use specific origins in production)
        corsConfig.addAllowedOrigin("*");

        // Allow all HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Allow all headers
        corsConfig.addAllowedHeader("*");

        // Disable credentials to allow wildcard origins (enable in production with specific origins)
        corsConfig.setAllowCredentials(false);

        // Cache preflight response for 1 hour
        corsConfig.setMaxAge(3600L);

        // Expose headers that frontend can read
        corsConfig.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Total-Count"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsWebFilter(source);
    }
}
