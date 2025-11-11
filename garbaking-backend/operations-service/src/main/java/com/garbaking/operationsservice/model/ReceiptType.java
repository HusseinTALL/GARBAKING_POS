package com.garbaking.operationsservice.model;

/**
 * Receipt Type
 *
 * Different types of receipts that can be printed
 */
public enum ReceiptType {
    /**
     * Customer receipt - given to customer with payment info
     */
    CUSTOMER,

    /**
     * Kitchen receipt - sent to kitchen with order details
     */
    KITCHEN,

    /**
     * Bar receipt - sent to bar for drink orders
     */
    BAR,

    /**
     * Reprint - duplicate of original receipt
     */
    REPRINT,

    /**
     * Gift receipt - no prices shown
     */
    GIFT,

    /**
     * Refund receipt - for returns/refunds
     */
    REFUND,

    /**
     * Invoice - more detailed than receipt, for business customers
     */
    INVOICE,

    /**
     * Delivery note - for delivery drivers
     */
    DELIVERY
}
