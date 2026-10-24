/**
 * ==============================================================================
 * Priority.java
 * ==============================================================================
 * 
 * CONCEPT DEMONSTRATED: OBJECT-ORIENTED PROGRAMMING (OOP) - ENUMERATION & ENCAPSULATION
 * 
 * WHY USE AN ENUM (OOP)?
 * - Type Safety: Instead of using plain Strings like "High" or numbers like 1,
 *   an Enum prevents invalid values or typos (e.g., "high", "HIGHH").
 * - Encapsulation: Each priority level bundles both a display label and a 
 *   numeric weight together in a single self-contained unit.
 * 
 * WHY WEIGHT VALUES (SORTING)?
 * - Numeric weights (HIGH = 3, MEDIUM = 2, LOW = 1) allow straightforward
 *   custom sorting using Comparators in TaskManager without complex string logic.
 */
public enum Priority {
    HIGH(3, "CRITICAL"),
    MEDIUM(2, "STANDARD"),
    LOW(1, "OPTIONAL");

    // Private fields: Encapsulates priority metadata (OOP Data Hiding)
    private final int weight;
    private final String label;

    // Constructor: Assigns weight and label to each constant
    Priority(int weight, String label) {
        this.weight = weight;
        this.label = label;
    }

    // Public Getter: Exposes numeric weight for custom sorting algorithms
    public int getWeight() {
        return weight;
    }

    // Public Getter: Exposes human-readable label for UI/console display
    public String getLabel() {
        return label;
    }
}
