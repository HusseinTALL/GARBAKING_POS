package com.garbaking.operationsservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Printer Device Entity
 *
 * Represents a physical or virtual printer
 */
@Entity
@Table(name = "printer_devices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrinterDevice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Printer name
     */
    @Column(nullable = false)
    private String name;

    /**
     * Printer location (Kitchen, Bar, Front Desk, etc.)
     */
    @Column(nullable = false)
    private String location;

    /**
     * Printer type (CUSTOMER, KITCHEN, BAR, etc.)
     */
    @Enumerated(EnumType.STRING)
    private ReceiptType printerType;

    /**
     * IP address or network path
     */
    private String ipAddress;

    /**
     * Port number
     */
    private Integer port;

    /**
     * Connection type (NETWORK, USB, SERIAL)
     */
    @Enumerated(EnumType.STRING)
    private PrinterConnectionType connectionType;

    /**
     * Paper width in characters (e.g., 48 for 80mm thermal)
     */
    @Builder.Default
    private Integer paperWidth = 48;

    /**
     * Current status
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrinterStatus status;

    /**
     * Last heartbeat/ping
     */
    private Instant lastHeartbeat;

    /**
     * Whether printer is enabled
     */
    @Builder.Default
    private boolean enabled = true;

    /**
     * Auto-print without confirmation
     */
    @Builder.Default
    private boolean autoPrint = false;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = PrinterStatus.OFFLINE;
        }
    }
}
