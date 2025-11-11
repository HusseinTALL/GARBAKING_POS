package com.garbaking.userservice.exception;

/**
 * CAPTCHA Verification Exception
 *
 * Thrown when CAPTCHA verification fails.
 */
public class CaptchaVerificationException extends RuntimeException {

    public CaptchaVerificationException(String message) {
        super(message);
    }

    public CaptchaVerificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
