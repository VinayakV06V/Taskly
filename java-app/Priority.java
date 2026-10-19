/**
 * Priority.java
 * Enum representing task urgency levels with priority weights for sorting.
 */
public enum Priority {
    HIGH(3, "CRITICAL"),
    MEDIUM(2, "STANDARD"),
    LOW(1, "OPTIONAL");

    private final int weight;
    private final String label;

    Priority(int weight, String label) {
        this.weight = weight;
        this.label = label;
    }

    public int getWeight() {
        return weight;
    }

    public String getLabel() {
        return label;
    }
}
