package com.garbaking.inventoryservice.dto;

import lombok.Builder;
import lombok.Value;

/**
 * Response returned after successfully uploading an image.
 */
@Value
@Builder
public class MenuItemImageUploadResponse {
    MenuItemImageDTO image;
    String signedUrl;
}
