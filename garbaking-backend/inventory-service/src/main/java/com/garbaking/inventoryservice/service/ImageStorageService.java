package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.config.ImageStorageProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.GeneralSecurityException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

/**
 * Handles writing menu item images to disk and generating signed URLs for temporary access.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ImageStorageService {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private final ImageStorageProperties properties;

    @PostConstruct
    void ensureDirectoryExists() {
        try {
            Files.createDirectories(properties.resolveDirectory());
        } catch (IOException ex) {
            log.error("Failed to initialize image upload directory", ex);
            throw new IllegalStateException("Unable to initialize image storage", ex);
        }
    }

    public ImageUploadResult store(Long menuItemId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Uploaded file is empty");
        }

        String originalFilename = StringUtils.hasText(file.getOriginalFilename())
                ? file.getOriginalFilename().trim()
                : "image";
        String extension = extractExtension(originalFilename);
        String generatedName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        Path menuItemDirectory = properties.resolveDirectory().resolve(String.valueOf(menuItemId));
        Files.createDirectories(menuItemDirectory);
        Path target = menuItemDirectory.resolve(generatedName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String relativePath = menuItemId + "/" + generatedName;
        String publicUrl = UriComponentsBuilder.fromUriString(properties.getBaseUrl())
                .pathSegment(relativePath.split("/"))
                .build()
                .toUriString();

        String cdnUrl = StringUtils.hasText(properties.getCdnBaseUrl())
                ? UriComponentsBuilder.fromUriString(properties.getCdnBaseUrl())
                .pathSegment(relativePath.split("/"))
                .build()
                .toUriString()
                : publicUrl;

        log.debug("Stored menu item image {} for item {}", generatedName, menuItemId);
        return new ImageUploadResult(relativePath, publicUrl, cdnUrl);
    }

    public boolean delete(String storagePath) {
        if (!StringUtils.hasText(storagePath)) {
            return false;
        }
        Path path = properties.resolveDirectory().resolve(storagePath).normalize();
        try {
            return Files.deleteIfExists(path);
        } catch (IOException ex) {
            log.warn("Failed to delete image {}", storagePath, ex);
            return false;
        }
    }

    public String generateSignedUrl(String url, Duration customDuration) {
        if (!StringUtils.hasText(url)) {
            return url;
        }
        Duration duration = customDuration != null ? customDuration : properties.getSignedUrlDuration();
        long expires = Instant.now().plus(duration).getEpochSecond();
        String data = url + ":" + expires;
        String signature = hmac(data, properties.getSigningSecret());
        return UriComponentsBuilder.fromUriString(url)
                .queryParam("expires", expires)
                .queryParam("signature", signature)
                .build()
                .toUriString();
    }

    private String extractExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        if (idx == -1) {
            return "";
        }
        return filename.substring(idx + 1);
    }

    private String hmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Unable to generate signed URL", ex);
        }
    }

    @Value
    public static class ImageUploadResult {
        String storagePath;
        String publicUrl;
        String cdnUrl;
    }
}
