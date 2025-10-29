package com.garbaking.inventoryservice.config;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

/**
 * Configuration properties for menu item image storage.
 */
@Data
@Validated
@ConfigurationProperties(prefix = "image.upload")
public class ImageStorageProperties {

    /**
     * Root directory where image files will be written.
     */
    @NotBlank
    private String directory;

    /**
     * Base URL exposed by the service for serving static images.
     */
    @NotBlank
    private String baseUrl;

    /**
     * Optional CDN base URL used when generating public links.
     */
    private String cdnBaseUrl;

    /**
     * Secret used to generate signed URLs for temporary access.
     */
    @NotBlank
    private String signingSecret = "change-me";

    /**
     * Default validity window for signed URLs.
     */
    @DefaultValue("PT15M")
    private Duration signedUrlDuration = Duration.ofMinutes(15);

    /**
     * Trim leading/trailing whitespace from configured values.
     */
    public void setDirectory(String directory) {
        this.directory = directory != null ? directory.trim() : null;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl != null ? baseUrl.trim() : null;
    }

    public void setCdnBaseUrl(String cdnBaseUrl) {
        this.cdnBaseUrl = cdnBaseUrl != null && !cdnBaseUrl.isBlank() ? cdnBaseUrl.trim() : null;
    }

    public Path resolveDirectory() {
        return Paths.get(directory).toAbsolutePath().normalize();
    }

    public Duration getSignedUrlDuration() {
        return signedUrlDuration == null ? Duration.ofMinutes(15) : signedUrlDuration;
    }
}
