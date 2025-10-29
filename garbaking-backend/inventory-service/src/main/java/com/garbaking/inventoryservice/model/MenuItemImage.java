package com.garbaking.inventoryservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * MenuItemImage Entity
 *
 * Represents an image associated with a menu item.
 * Supports multiple images per menu item.
 */
@Entity
@Table(name = "menu_item_images", indexes = {
        @Index(name = "idx_image_menu_item", columnList = "menu_item_id"),
        @Index(name = "idx_image_primary", columnList = "isPrimary")
})
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    @JsonIgnore
    private MenuItem menuItem;

    @Column(name = "menu_item_id", insertable = false, updatable = false)
    private Long menuItemId;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(length = 500)
    private String storagePath;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;  // Primary image for display

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(length = 100)
    private String altText;  // Alternative text for accessibility

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
