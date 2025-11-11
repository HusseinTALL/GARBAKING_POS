package com.garbaking.employeeservice.model;

/**
 * Document type enumeration
 */
public enum DocumentType {
    CONTRACT("Contract", "Employment contract"),
    IDENTIFICATION("Identification", "ID documents"),
    CERTIFICATION("Certification", "Professional certifications"),
    TRAINING("Training", "Training completion certificates"),
    BACKGROUND_CHECK("Background Check", "Background check documents"),
    TAX_FORM("Tax Form", "Tax-related documents"),
    PERFORMANCE_REVIEW("Performance Review", "Performance review documents"),
    DISCIPLINARY("Disciplinary", "Disciplinary action records"),
    OTHER("Other", "Other documents");

    private final String displayName;
    private final String description;

    DocumentType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
