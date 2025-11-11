package com.garbaking.userservice.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.garbaking.userservice.dto.AuthResponse;
import com.garbaking.userservice.dto.LoginRequest;
import com.garbaking.userservice.dto.LogoutRequest;
import com.garbaking.userservice.dto.RefreshTokenRequest;
import com.garbaking.userservice.dto.UserDTO;
import com.garbaking.userservice.model.User;
import com.garbaking.userservice.repository.RefreshTokenRepository;
import com.garbaking.userservice.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration Tests for Authentication Flow
 *
 * Tests the complete authentication lifecycle including:
 * - User registration
 * - Login with credentials
 * - Token refresh
 * - Logout (single and all devices)
 * - Rate limiting
 * - CAPTCHA validation (when enabled)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    private static final String TEST_EMAIL = "integration.test@garbaking.com";
    private static final String TEST_PASSWORD = "TestPassword123!";
    private static final String TEST_NAME = "Integration Test User";

    @BeforeEach
    @Transactional
    void setUp() {
        // Clean up test data before each test
        userRepository.findByEmail(TEST_EMAIL).ifPresent(user -> {
            refreshTokenRepository.deleteAll(refreshTokenRepository.findByUser(user));
            userRepository.delete(user);
        });
    }

    @Test
    @Order(1)
    @DisplayName("Complete Authentication Flow: Register → Login → Refresh → Logout")
    void testCompleteAuthenticationFlow() throws Exception {
        // Step 1: Register new user
        UserDTO registerRequest = UserDTO.builder()
                .name(TEST_NAME)
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .phone("1234567890")
                .build();

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.user.name").value(TEST_NAME))
                .andReturn();

        AuthResponse registerResponse = objectMapper.readValue(
                registerResult.getResponse().getContentAsString(),
                AuthResponse.class
        );

        String accessToken = registerResponse.getToken();
        String refreshToken = registerResponse.getRefreshToken();

        assertThat(accessToken).isNotNull().isNotEmpty();
        assertThat(refreshToken).isNotNull().isNotEmpty();

        // Step 2: Login with same credentials
        LoginRequest loginRequest = LoginRequest.builder()
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                AuthResponse.class
        );

        String newAccessToken = loginResponse.getToken();
        String newRefreshToken = loginResponse.getRefreshToken();

        assertThat(newAccessToken).isNotNull().isNotEmpty();
        assertThat(newRefreshToken).isNotNull().isNotEmpty();

        // Step 3: Verify we can make authenticated requests
        mockMvc.perform(get("/api/auth/health")
                        .header("Authorization", "Bearer " + newAccessToken))
                .andExpect(status().isOk());

        // Step 4: Refresh the access token
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken(newRefreshToken);

        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn();

        AuthResponse refreshResponse = objectMapper.readValue(
                refreshResult.getResponse().getContentAsString(),
                AuthResponse.class
        );

        String refreshedAccessToken = refreshResponse.getToken();
        assertThat(refreshedAccessToken).isNotNull().isNotEmpty();
        assertThat(refreshedAccessToken).isNotEqualTo(newAccessToken);

        // Step 5: Logout (revoke refresh token)
        LogoutRequest logoutRequest = new LogoutRequest();
        logoutRequest.setRefreshToken(newRefreshToken);

        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out successfully"));

        // Step 6: Verify refresh token is now invalid
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(2)
    @DisplayName("Registration with duplicate email should fail")
    void testDuplicateRegistration() throws Exception {
        // Register first user
        UserDTO registerRequest = UserDTO.builder()
                .name(TEST_NAME)
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .phone("1234567890")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        // Try to register again with same email
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("Conflict"));
    }

    @Test
    @Order(3)
    @DisplayName("Login with invalid credentials should fail")
    void testInvalidLogin() throws Exception {
        // Register user first
        UserDTO registerRequest = UserDTO.builder()
                .name(TEST_NAME)
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .phone("1234567890")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        // Try to login with wrong password
        LoginRequest loginRequest = LoginRequest.builder()
                .email(TEST_EMAIL)
                .password("WrongPassword123!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(4)
    @DisplayName("Login with non-existent user should fail")
    void testLoginNonExistentUser() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("nonexistent@garbaking.com")
                .password("SomePassword123!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    @DisplayName("Validation errors should return 400")
    void testValidationErrors() throws Exception {
        // Invalid email format
        UserDTO invalidEmailRequest = UserDTO.builder()
                .name(TEST_NAME)
                .email("invalid-email")
                .password(TEST_PASSWORD)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidEmailRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));

        // Missing email
        UserDTO missingEmailRequest = UserDTO.builder()
                .name(TEST_NAME)
                .password(TEST_PASSWORD)
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(missingEmailRequest)))
                .andExpect(status().isBadRequest());

        // Password too short
        UserDTO shortPasswordRequest = UserDTO.builder()
                .name(TEST_NAME)
                .email(TEST_EMAIL)
                .password("12345")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortPasswordRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(6)
    @DisplayName("Logout from all devices should revoke all tokens")
    @Transactional
    void testLogoutAllDevices() throws Exception {
        // Register user
        UserDTO registerRequest = UserDTO.builder()
                .name(TEST_NAME)
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .phone("1234567890")
                .build();

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse registerResponse = objectMapper.readValue(
                registerResult.getResponse().getContentAsString(),
                AuthResponse.class
        );

        Long userId = registerResponse.getUser().getId();

        // Login from "second device" to get another token
        LoginRequest loginRequest = LoginRequest.builder()
                .email(TEST_EMAIL)
                .password(TEST_PASSWORD)
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse loginResponse = objectMapper.readValue(
                loginResult.getResponse().getContentAsString(),
                AuthResponse.class
        );

        // Now we have 2 refresh tokens (from register and login)
        User user = userRepository.findById(userId).orElseThrow();
        long tokenCountBefore = refreshTokenRepository.findByUser(user).size();
        assertThat(tokenCountBefore).isEqualTo(2);

        // Logout from all devices
        mockMvc.perform(post("/api/auth/logout-all/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Logged out from all devices successfully"));

        // Verify both tokens are now revoked/invalid
        RefreshTokenRequest refreshRequest1 = new RefreshTokenRequest();
        refreshRequest1.setRefreshToken(registerResponse.getRefreshToken());

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest1)))
                .andExpect(status().isBadRequest());

        RefreshTokenRequest refreshRequest2 = new RefreshTokenRequest();
        refreshRequest2.setRefreshToken(loginResponse.getRefreshToken());

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest2)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(7)
    @DisplayName("Rate limiting should block excessive login attempts")
    void testLoginRateLimiting() throws Exception {
        // Note: This test may fail if rate limiting is disabled in test profile
        // Rate limit for login is 5 attempts per 15 minutes per IP

        LoginRequest loginRequest = LoginRequest.builder()
                .email("ratelimit.test@garbaking.com")
                .password("WrongPassword123!")
                .build();

        // Make 5 attempts (should all fail due to wrong password but allowed by rate limiter)
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt should be rate limited (HTTP 429)
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("Too many requests"));
    }

    @Test
    @Order(8)
    @DisplayName("Rate limiting should block excessive registration attempts")
    void testRegistrationRateLimiting() throws Exception {
        // Rate limit for registration is 3 attempts per hour per IP

        // Make 3 registration attempts
        for (int i = 0; i < 3; i++) {
            UserDTO registerRequest = UserDTO.builder()
                    .name("Rate Limit Test " + i)
                    .email("ratelimit.test" + i + "@garbaking.com")
                    .password(TEST_PASSWORD)
                    .phone("1234567890")
                    .build();

            mockMvc.perform(post("/api/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(registerRequest)))
                    .andExpect(status().isCreated());
        }

        // 4th attempt should be rate limited (HTTP 429)
        UserDTO fourthAttempt = UserDTO.builder()
                .name("Rate Limit Test 4")
                .email("ratelimit.test4@garbaking.com")
                .password(TEST_PASSWORD)
                .phone("1234567890")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fourthAttempt)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("Too many requests"));
    }

    @Test
    @Order(9)
    @DisplayName("Health endpoint should be accessible without authentication")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/auth/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Auth service is healthy"));
    }

    @Test
    @Order(10)
    @DisplayName("Invalid refresh token should return 404")
    void testInvalidRefreshToken() throws Exception {
        RefreshTokenRequest refreshRequest = new RefreshTokenRequest();
        refreshRequest.setRefreshToken("invalid-token-that-does-not-exist");

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }
}
