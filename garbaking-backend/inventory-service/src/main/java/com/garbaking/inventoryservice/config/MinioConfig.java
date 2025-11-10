/**
 * MinIO configuration and client setup
 * Creates MinIO client bean and ensures bucket exists on startup
 */
package com.garbaking.inventoryservice.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MinioConfig {

    private final MinioProperties minioProperties;

    /**
     * Creates MinIO client bean with configured credentials
     * Bean is created lazily to avoid startup failures when MinIO is unavailable
     */
    @Bean
    @org.springframework.context.annotation.Lazy
    public MinioClient minioClient() {
        try {
            return MinioClient.builder()
                    .endpoint(minioProperties.getEndpoint())
                    .credentials(minioProperties.getAccessKey(), minioProperties.getSecretKey())
                    .build();
        } catch (Exception e) {
            log.error("Failed to create MinIO client - image uploads will be disabled: {}", e.getMessage());
            throw e; // Re-throw to prevent bean creation
        }
    }

    /**
     * Initializes MinIO bucket on application startup
     * Creates bucket if it doesn't exist and sets public read policy
     *
     * NOTE: This method is non-blocking - if MinIO is unavailable,
     * the service will start anyway with image uploads disabled
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initializeBucket() {
        try {
            MinioClient client = minioClient();
            String bucketName = minioProperties.getBucketName();

            // Check if bucket exists
            boolean exists = client.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            if (!exists) {
                log.info("Creating MinIO bucket: {}", bucketName);

                // Create bucket
                client.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(bucketName)
                                .build()
                );

                // Set bucket policy to allow public read access
                String policy = """
                        {
                            "Version": "2012-10-17",
                            "Statement": [
                                {
                                    "Effect": "Allow",
                                    "Principal": {"AWS": "*"},
                                    "Action": ["s3:GetObject"],
                                    "Resource": ["arn:aws:s3:::%s/*"]
                                }
                            ]
                        }
                        """.formatted(bucketName);

                client.setBucketPolicy(
                        SetBucketPolicyArgs.builder()
                                .bucket(bucketName)
                                .config(policy)
                                .build()
                );

                log.info("MinIO bucket '{}' created successfully with public read access", bucketName);
            } else {
                log.info("MinIO bucket '{}' already exists", bucketName);
            }
        } catch (Exception e) {
            log.warn("MinIO not available - image storage will be disabled. Service will continue without image upload functionality.", e);
            log.warn("To enable image uploads, ensure MinIO is running on: {}", minioProperties.getEndpoint());
            // Don't throw - let the service start anyway
        }
    }
}
