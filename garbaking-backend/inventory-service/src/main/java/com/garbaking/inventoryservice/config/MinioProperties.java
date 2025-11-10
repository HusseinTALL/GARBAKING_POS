/**
 * MinIO configuration properties
 * Binds MinIO-related configuration from application.yml
 */
package com.garbaking.inventoryservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "minio")
public class MinioProperties {

    /**
     * MinIO server endpoint URL
     */
    private String endpoint;

    /**
     * MinIO access key (username)
     */
    private String accessKey;

    /**
     * MinIO secret key (password)
     */
    private String secretKey;

    /**
     * Default bucket name for product images
     */
    private String bucketName;

    /**
     * Base URL for accessing images
     */
    private String baseUrl;
}
