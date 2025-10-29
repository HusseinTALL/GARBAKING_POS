package com.garbaking.inventoryservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

/**
 * Exposes the on-disk upload directory via Spring MVC so locally stored assets
 * can be served while CDN propagation is unavailable.
 */
@Configuration
@RequiredArgsConstructor
public class ImageResourceConfig implements WebMvcConfigurer {

    private final ImageStorageProperties properties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path directory = properties.resolveDirectory();
        String resourceLocation = directory.toUri().toString();
        registry.addResourceHandler("/images/**")
                .addResourceLocations(resourceLocation)
                .setCachePeriod(StringUtils.hasText(properties.getCdnBaseUrl()) ? 60 : 0);
    }
}
