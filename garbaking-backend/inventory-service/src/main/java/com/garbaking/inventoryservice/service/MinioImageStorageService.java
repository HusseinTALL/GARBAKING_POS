/**
 * MinIO-based image storage service for menu item images
 * Handles uploading, deleting, and generating URLs for images stored in MinIO
 */
package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.config.MinioProperties;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioImageStorageService {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    /**
     * Uploads an image to MinIO and returns the storage details
     *
     * @param menuItemId ID of the menu item
     * @param file       The image file to upload
     * @return ImageUploadResult containing storage path and URLs
     * @throws IOException if upload fails
     */
    public ImageUploadResult store(Long menuItemId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Uploaded file is empty");
        }

        String originalFilename = StringUtils.hasText(file.getOriginalFilename())
                ? file.getOriginalFilename().trim()
                : "image";

        String extension = extractExtension(originalFilename);
        String generatedName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        // Store with path: menu-items/{menuItemId}/{uuid}.{ext}
        String objectName = "menu-items/" + menuItemId + "/" + generatedName;

        try (InputStream inputStream = file.getInputStream()) {
            // Upload to MinIO
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            log.info("Stored menu item image {} for item {} in MinIO", generatedName, menuItemId);
        } catch (Exception e) {
            log.error("Failed to upload image to MinIO", e);
            throw new IOException("Failed to upload image to MinIO", e);
        }

        // Generate public URL
        String publicUrl = minioProperties.getBaseUrl() + "/" + objectName;

        return new ImageUploadResult(objectName, publicUrl, publicUrl);
    }

    /**
     * Deletes an image from MinIO
     *
     * @param objectName The object name/path in MinIO
     * @return true if deletion was successful
     */
    public boolean delete(String objectName) {
        if (!StringUtils.hasText(objectName)) {
            return false;
        }

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioProperties.getBucketName())
                            .object(objectName)
                            .build()
            );

            log.info("Deleted image {} from MinIO", objectName);
            return true;
        } catch (Exception e) {
            log.warn("Failed to delete image {} from MinIO", objectName, e);
            return false;
        }
    }

    /**
     * Generates a presigned URL for temporary access to an image
     *
     * @param objectName    The object name/path in MinIO
     * @param durationHours Duration in hours for which the URL is valid
     * @return Presigned URL
     */
    public String generatePresignedUrl(String objectName, int durationHours) {
        if (!StringUtils.hasText(objectName)) {
            return null;
        }

        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(minioProperties.getBucketName())
                            .object(objectName)
                            .expiry(durationHours, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for {}", objectName, e);
            return null;
        }
    }

    /**
     * Extracts file extension from filename
     */
    private String extractExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx == -1) {
            return "";
        }
        return filename.substring(idx + 1);
    }

    /**
     * Result of image upload operation
     */
    @Value
    public static class ImageUploadResult {
        /**
         * Object name/path in MinIO
         */
        String storagePath;

        /**
         * Public URL to access the image
         */
        String publicUrl;

        /**
         * CDN URL (same as public URL for MinIO)
         */
        String cdnUrl;
    }
}
