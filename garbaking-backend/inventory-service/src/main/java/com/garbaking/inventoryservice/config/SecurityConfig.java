package com.garbaking.inventoryservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration
 *
 * Configures Spring Security for the Inventory Service.
 * Since authentication is handled by API Gateway, this service doesn't need JWT validation.
 * We use method-level security to enforce permissions based on headers from the gateway.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = false)  // Disabled for development
public class SecurityConfig {

    /**
     * Configure HTTP security
     * Since API Gateway handles authentication, we allow all requests here.
     * Individual endpoints are protected with @PreAuthorize annotations.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()  // Allow actuator endpoints
                        .anyRequest().permitAll()  // Allow all other requests (Gateway handles auth)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        return http.build();
    }
}
