package com.garbaking.operationsservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Receipt Template Entity
 *
 * Customizable templates for different receipt types
 */
@Entity
@Table(name = "receipt_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Template name
     */
    @Column(nullable = false)
    private String name;

    /**
     * Template type
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReceiptType type;

    /**
     * Header template (Thymeleaf syntax)
     */
    @Column(columnDefinition = "TEXT")
    private String headerTemplate;

    /**
     * Line item template (Thymeleaf syntax)
     */
    @Column(columnDefinition = "TEXT")
    private String lineItemTemplate;

    /**
     * Footer template (Thymeleaf syntax)
     */
    @Column(columnDefinition = "TEXT")
    private String footerTemplate;

    /**
     * Paper width in characters
     */
    @Builder.Default
    private Integer paperWidth = 48;

    /**
     * Font size (0=normal, 1=double width, 2=double height, 3=double both)
     */
    @Builder.Default
    private Integer fontSize = 0;

    /**
     * Whether this is the default template for this type
     */
    @Builder.Default
    private boolean isDefault = false;

    /**
     * Whether template is active
     */
    @Builder.Default
    private boolean active = true;

    /**
     * Created timestamp
     */
    private Instant createdAt;

    /**
     * Last updated timestamp
     */
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}
