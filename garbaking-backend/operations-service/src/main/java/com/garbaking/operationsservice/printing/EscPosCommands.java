package com.garbaking.operationsservice.printing;

/**
 * ESC/POS Command Constants
 *
 * Standard ESC/POS commands for thermal printers
 * Based on EPSON ESC/POS Command Specification
 */
public class EscPosCommands {

    // Control characters
    public static final byte ESC = 0x1B;   // Escape
    public static final byte GS = 0x1D;    // Group Separator
    public static final byte LF = 0x0A;    // Line Feed
    public static final byte CR = 0x0D;    // Carriage Return
    public static final byte HT = 0x09;    // Horizontal Tab
    public static final byte FF = 0x0C;    // Form Feed (cut paper)

    // Initialize printer
    public static final byte[] INIT = {ESC, '@'};

    // Text formatting
    public static final byte[] BOLD_ON = {ESC, 'E', 1};
    public static final byte[] BOLD_OFF = {ESC, 'E', 0};
    public static final byte[] UNDERLINE_ON = {ESC, '-', 1};
    public static final byte[] UNDERLINE_OFF = {ESC, '-', 0};
    public static final byte[] INVERSE_ON = {GS, 'B', 1};
    public static final byte[] INVERSE_OFF = {GS, 'B', 0};

    // Text size (width x height)
    public static final byte[] TEXT_NORMAL = {GS, '!', 0x00};      // 1x1
    public static final byte[] TEXT_DOUBLE_WIDTH = {GS, '!', 0x10}; // 2x1
    public static final byte[] TEXT_DOUBLE_HEIGHT = {GS, '!', 0x01}; // 1x2
    public static final byte[] TEXT_DOUBLE_BOTH = {GS, '!', 0x11};  // 2x2
    public static final byte[] TEXT_TRIPLE_BOTH = {GS, '!', 0x22};  // 3x3

    // Alignment
    public static final byte[] ALIGN_LEFT = {ESC, 'a', 0};
    public static final byte[] ALIGN_CENTER = {ESC, 'a', 1};
    public static final byte[] ALIGN_RIGHT = {ESC, 'a', 2};

    // Paper cut
    public static final byte[] CUT_FULL = {GS, 'V', 0};    // Full cut
    public static final byte[] CUT_PARTIAL = {GS, 'V', 1}; // Partial cut (default)
    public static final byte[] CUT_PARTIAL_FEED = {GS, 'V', 66, 0}; // Partial cut with feed

    // Cash drawer
    public static final byte[] OPEN_DRAWER = {ESC, 'p', 0, 60, (byte) 120};

    // Barcode
    public static final byte[] BARCODE_HEIGHT = {GS, 'h', 50}; // Height in dots
    public static final byte[] BARCODE_WIDTH = {GS, 'w', 3};   // Width (2-6)

    // QR Code
    public static final byte[] QR_MODEL = {GS, '(', 'k', 4, 0, 49, 65, 50, 0}; // Model 2
    public static final byte[] QR_SIZE = {GS, '(', 'k', 3, 0, 49, 67, 5}; // Size 5
    public static final byte[] QR_ERROR_CORRECTION = {GS, '(', 'k', 3, 0, 49, 69, 48}; // Level L

    // Line feed
    public static final byte[] LINE_FEED = {LF};
    public static final byte[] FEED_LINES_2 = {ESC, 'd', 2};
    public static final byte[] FEED_LINES_3 = {ESC, 'd', 3};

    // Character encoding
    public static final byte[] CHARSET_USA = {ESC, 'R', 0};
    public static final byte[] CHARSET_UTF8 = {ESC, 't', 16};
}
