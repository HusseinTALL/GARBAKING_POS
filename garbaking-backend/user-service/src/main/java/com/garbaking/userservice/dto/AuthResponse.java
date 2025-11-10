package com.garbaking.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication Response DTO
 *
 * Returned after successful login or registration.
 * Contains access token, refresh token, and user information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    /**
     * JWT access token (short-lived, 24 hours)
     */
    private String token;

    /**
     * Refresh token (long-lived, 7 days)
     * Used to obtain new access tokens without re-authentication
     */
    private String refreshToken;

    /**
     * User information
     */
    private UserDTO user;

    /**
     * Response message
     */
    private String message;
}
