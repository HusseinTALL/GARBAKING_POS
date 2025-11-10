package com.garbaking.operationsservice.dto;

import com.garbaking.operationsservice.model.PrinterConnectionType;
import com.garbaking.operationsservice.model.ReceiptType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PrinterRegistrationRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String location;

    /**
     * Type of receipts this printer handles (CUSTOMER, KITCHEN, BAR, etc.)
     */
    private ReceiptType printerType;

    /**
     * IP address for network printers
     */
    private String ipAddress;

    /**
     * Port number (default: 9100 for ESC/POS)
     */
    private Integer port;

    /**
     * Connection type (NETWORK, USB, SERIAL, BLUETOOTH)
     */
    private PrinterConnectionType connectionType;

    /**
     * Paper width in characters (default: 48 for 80mm thermal)
     */
    private Integer paperWidth;

    /**
     * Enable auto-print without manual confirmation
     */
    private Boolean autoPrint;
}
