package com.garbaking.userservice.controller;

import com.garbaking.userservice.dto.AuthResponse;
import com.garbaking.userservice.dto.LoginRequest;
import com.garbaking.userservice.dto.UserDTO;
import com.garbaking.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 *
 * REST endpoints for user authentication (login, register).
 * Routes accessible at: /api/auth (for consistency with frontend expectations)
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;

    /**
     * Register new user
     * POST /auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserDTO userDTO) {
        log.info("POST /auth/register - Email: {}", userDTO.getEmail());
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
        AuthResponse response = userService.login(loginRequest);
        return ResponseEntity.ok(response);
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
