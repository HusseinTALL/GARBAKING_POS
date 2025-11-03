package com.garbaking.inventoryservice.service;

import com.garbaking.inventoryservice.config.ImageStorageProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class ImageStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storePersistsFileAndGeneratesUrls() throws IOException {
        ImageStorageProperties properties = new ImageStorageProperties();
        properties.setDirectory(tempDir.toString());
        properties.setBaseUrl("http://localhost/images");
        properties.setCdnBaseUrl("https://cdn.example.com/menu-items");
        properties.setSigningSecret("secret");

        ImageStorageService service = new ImageStorageService(properties);
        service.ensureDirectoryExists();

        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", new byte[]{1, 2, 3});
        ImageStorageService.ImageUploadResult result = service.store(5L, file);

        assertThat(result.getStoragePath()).contains("5");
        assertThat(result.getCdnUrl()).startsWith("https://cdn.example.com/menu-items/5");
        assertThat(result.getPublicUrl()).startsWith("http://localhost/images/5");
        assertThat(Files.exists(properties.resolveDirectory().resolve(result.getStoragePath()))).isTrue();

        String signedUrl = service.generateSignedUrl(result.getCdnUrl(), null);
        assertThat(signedUrl).contains("signature");
    }
}
