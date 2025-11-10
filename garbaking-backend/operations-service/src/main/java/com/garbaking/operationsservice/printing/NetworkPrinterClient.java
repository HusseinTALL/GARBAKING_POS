package com.garbaking.operationsservice.printing;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;

/**
 * Network Printer Client
 *
 * Communicates with thermal printers over TCP/IP
 * Standard port for thermal printers is 9100
 */
@Component
@Slf4j
public class NetworkPrinterClient {

    private static final int CONNECTION_TIMEOUT = 5000; // 5 seconds
    private static final int READ_TIMEOUT = 10000; // 10 seconds

    /**
     * Test connection to printer
     */
    public boolean testConnection(String ipAddress, int port) {
        log.debug("Testing connection to printer: {}:{}", ipAddress, port);

        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(ipAddress, port), CONNECTION_TIMEOUT);
            log.info("Successfully connected to printer: {}:{}", ipAddress, port);
            return true;
        } catch (SocketTimeoutException e) {
            log.warn("Connection timeout to printer: {}:{}", ipAddress, port);
            return false;
        } catch (IOException e) {
            log.warn("Failed to connect to printer: {}:{} - {}", ipAddress, port, e.getMessage());
            return false;
        }
    }

    /**
     * Print data to network printer
     */
    public boolean print(String ipAddress, int port, byte[] data) {
        log.info("Printing to network printer: {}:{}, {} bytes", ipAddress, port, data.length);

        try (Socket socket = new Socket()) {
            // Connect to printer
            socket.connect(new InetSocketAddress(ipAddress, port), CONNECTION_TIMEOUT);
            socket.setSoTimeout(READ_TIMEOUT);

            // Send data
            try (OutputStream out = socket.getOutputStream()) {
                out.write(data);
                out.flush();

                log.info("Successfully sent {} bytes to printer: {}:{}", data.length, ipAddress, port);
                return true;
            }

        } catch (SocketTimeoutException e) {
            log.error("Timeout while printing to: {}:{}", ipAddress, port, e);
            return false;
        } catch (IOException e) {
            log.error("Error printing to: {}:{}", ipAddress, port, e);
            return false;
        }
    }

    /**
     * Print with retry logic
     */
    public boolean printWithRetry(String ipAddress, int port, byte[] data, int maxRetries) {
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            log.debug("Print attempt {} of {}", attempt, maxRetries);

            if (print(ipAddress, port, data)) {
                return true;
            }

            if (attempt < maxRetries) {
                try {
                    Thread.sleep(1000 * attempt); // Exponential backoff
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }

        log.error("Failed to print after {} attempts", maxRetries);
        return false;
    }

    /**
     * Check printer status (basic ping)
     */
    public PrinterNetworkStatus getStatus(String ipAddress, int port) {
        boolean connected = testConnection(ipAddress, port);

        if (connected) {
            return PrinterNetworkStatus.ONLINE;
        } else {
            return PrinterNetworkStatus.OFFLINE;
        }
    }

    public enum PrinterNetworkStatus {
        ONLINE,
        OFFLINE,
        ERROR
    }
}
