package com.garbaking.inventoryservice.model;

/**
 * Measurement units for inventory items
 */
public enum Unit {
    // Weight
    KILOGRAM("kg", "Kilogram", "WEIGHT"),
    GRAM("g", "Gram", "WEIGHT"),
    POUND("lb", "Pound", "WEIGHT"),
    OUNCE("oz", "Ounce", "WEIGHT"),

    // Volume
    LITER("L", "Liter", "VOLUME"),
    MILLILITER("ml", "Milliliter", "VOLUME"),
    GALLON("gal", "Gallon", "VOLUME"),
    FLUID_OUNCE("fl oz", "Fluid Ounce", "VOLUME"),
    CUP("cup", "Cup", "VOLUME"),

    // Count
    PIECE("pc", "Piece", "COUNT"),
    DOZEN("dz", "Dozen", "COUNT"),
    CASE("case", "Case", "COUNT"),
    BOX("box", "Box", "COUNT"),
    BAG("bag", "Bag", "COUNT"),

    // Other
    SERVING("serving", "Serving", "OTHER"),
    BATCH("batch", "Batch", "OTHER");

    private final String symbol;
    private final String displayName;
    private final String type;

    Unit(String symbol, String displayName, String type) {
        this.symbol = symbol;
        this.displayName = displayName;
        this.type = type;
    }

    public String getSymbol() {
        return symbol;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getType() {
        return type;
    }
}
