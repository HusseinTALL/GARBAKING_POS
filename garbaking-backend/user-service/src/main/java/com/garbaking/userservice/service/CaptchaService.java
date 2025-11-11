package com.garbaking.userservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.garbaking.userservice.config.CaptchaProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * CAPTCHA Verification Service
 *
 * Integrates with Google reCAPTCHA v3 to verify user tokens and prevent bot attacks.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CaptchaService {

    private final CaptchaProperties captchaProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Verify CAPTCHA token with Google reCAPTCHA
     *
     * @param token The CAPTCHA token from the frontend
     * @param action The expected action (e.g., "login", "register")
     * @return true if verification succeeds, false otherwise
     */
    public boolean verify(String token, String action) {
        // If CAPTCHA is disabled, always return true
        if (!captchaProperties.isEnabled()) {
            log.debug("CAPTCHA verification disabled, skipping check");
            return true;
        }

        // Validate inputs
        if (token == null || token.isEmpty()) {
            log.warn("CAPTCHA token is null or empty");
            return false;
        }

        try {
            // Build verification request
            String requestBody = buildRequestBody(token);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(captchaProperties.getVerifyUrl()))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .timeout(Duration.ofMillis(captchaProperties.getConnectionTimeout()))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            // Send request to Google
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofMillis(captchaProperties.getConnectionTimeout()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Parse response
            JsonNode jsonResponse = objectMapper.readTree(response.body());
            boolean success = jsonResponse.path("success").asBoolean(false);

            if (!success) {
                log.warn("CAPTCHA verification failed. Errors: {}",
                        jsonResponse.path("error-codes"));
                return false;
            }

            // Check score (reCAPTCHA v3 specific)
            double score = jsonResponse.path("score").asDouble(0.0);
            String responseAction = jsonResponse.path("action").asText("");

            log.debug("CAPTCHA verification: score={}, action={}, expected={}",
                    score, responseAction, action);

            // Verify action matches
            if (action != null && !action.isEmpty() && !action.equals(responseAction)) {
                log.warn("CAPTCHA action mismatch. Expected: {}, Got: {}", action, responseAction);
                return false;
            }

            // Check score threshold
            if (score < captchaProperties.getThreshold()) {
                log.warn("CAPTCHA score {} below threshold {}", score, captchaProperties.getThreshold());
                return false;
            }

            log.info("CAPTCHA verification successful: action={}, score={}", action, score);
            return true;

        } catch (IOException e) {
            log.error("CAPTCHA verification failed due to IOException: {}", e.getMessage());
            // In production, you might want to fail closed (return false)
            // For now, we'll fail open to avoid blocking legitimate users
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("CAPTCHA verification interrupted: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.error("Unexpected error during CAPTCHA verification: {}", e.getMessage(), e);
            return true; // Fail open
        }
    }

    /**
     * Build URL-encoded request body for Google verification
     */
    private String buildRequestBody(String token) {
        return "secret=" + URLEncoder.encode(captchaProperties.getSecretKey(), StandardCharsets.UTF_8) +
               "&response=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
    }

    /**
     * Verify CAPTCHA without action validation
     */
    public boolean verify(String token) {
        return verify(token, null);
    }
}
