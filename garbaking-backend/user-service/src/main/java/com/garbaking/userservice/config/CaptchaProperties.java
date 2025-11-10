package com.garbaking.userservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * CAPTCHA Configuration Properties
 *
 * Configures Google reCAPTCHA v3 integration for bot protection.
 */
@Component
@ConfigurationProperties(prefix = "captcha.recaptcha")
@Data
public class CaptchaProperties {

    /**
     * Enable/disable CAPTCHA verification
     * Set to false in development, true in production
     */
    private boolean enabled = false;

    /**
     * reCAPTCHA site key (public key)
     * Used on the frontend to render CAPTCHA
     */
    private String siteKey;

    /**
     * reCAPTCHA secret key (private key)
     * Used on the backend to verify tokens
     */
    private String secretKey;

    /**
     * Google reCAPTCHA verification URL
     */
    private String verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    /**
     * Minimum score threshold (0.0 to 1.0)
     * Scores below this are considered bots
     * Recommended: 0.5 for balanced security
     */
    private double threshold = 0.5;

    /**
     * Connection timeout for verification API call (milliseconds)
     */
    private int connectionTimeout = 5000;

    /**
     * Read timeout for verification API call (milliseconds)
     */
    private int readTimeout = 5000;
}
