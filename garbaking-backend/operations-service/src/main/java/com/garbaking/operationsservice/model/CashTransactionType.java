package com.garbaking.operationsservice.model;

public enum CashTransactionType {
    STARTING_FLOAT,  // Initial cash when opening drawer
    SALE,            // Cash received from a sale
    REFUND,          // Cash returned to customer
    DROP,            // Cash removed and deposited to safe
    PAYOUT,          // Cash paid out (petty cash, vendor payment)
    NO_SALE          // Drawer opened without transaction (for change making)
}
