package com.garbaking.employeeservice.model;

/**
 * Status of employee certification
 */
public enum CertificationStatus {
    ACTIVE,          // Certification is active and valid
    EXPIRING_SOON,   // Certification expiring within 30 days
    EXPIRED,         // Certification has expired
    REVOKED,         // Certification has been revoked
    PENDING          // Certification pending verification
}
