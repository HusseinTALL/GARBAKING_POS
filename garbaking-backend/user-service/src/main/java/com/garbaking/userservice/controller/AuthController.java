package com.garbaking.userservice.controller;

import com.garbaking.userservice.dto.*;
import com.garbaking.userservice.exception.CaptchaVerificationException;
import com.garbaking.userservice.service.CaptchaService;
import com.garbaking.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication Controller
 *
 * REST endpoints for user authentication (login, register, refresh, logout).
 * Routes accessible at: /api/auth (for consistency with frontend expectations)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final CaptchaService captchaService;

    /**
     * Register new user
     * POST /auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserDTO userDTO) {
        log.info("POST /auth/register - Email: {}", userDTO.getEmail());

        // Verify CAPTCHA
        if (!captchaService.verify(userDTO.getCaptchaToken(), "register")) {
            throw new CaptchaVerificationException("CAPTCHA verification failed. Please try again.");
        }

        AuthResponse response = userService.register(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login user
     * POST /auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("POST /auth/login - Email: {}", loginRequest.getEmail());

        // Verify CAPTCHA
        if (!captchaService.verify(loginRequest.getCaptchaToken(), "login")) {
            throw new CaptchaVerificationException("CAPTCHA verification failed. Please try again.");
        }

        AuthResponse response = userService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    /**
     * Refresh access token using refresh token
     * POST /auth/refresh
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("POST /auth/refresh");
        AuthResponse response = userService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    /**
     * Logout user by revoking refresh token
     * POST /auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@Valid @RequestBody LogoutRequest request) {
        log.info("POST /auth/logout");
        userService.logout(request.getRefreshToken());
        return ResponseEntity.ok(Map.of(
                "message", "Logged out successfully"
        ));
    }

    /**
     * Logout from all devices
     * POST /auth/logout-all/{userId}
     */
    @PostMapping("/logout-all/{userId}")
    public ResponseEntity<Map<String, String>> logoutAll(@PathVariable Long userId) {
        log.info("POST /auth/logout-all/{}", userId);
        userService.logoutAll(userId);
        return ResponseEntity.ok(Map.of(
                "message", "Logged out from all devices successfully"
        ));
    }

    /**
     * Health check endpoint for auth service
     * GET /auth/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Auth service is healthy");
    }
}
