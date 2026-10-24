import java.time.LocalDateTime;

/**
 * ==============================================================================
 * RecurrenceRule.java
 * ==============================================================================
 * 
 * CONCEPTS DEMONSTRATED:
 * 1. OOP (COMPOSITION & ENCAPSULATION):
 *    - Instead of cluttering the Task class with multiple frequency and interval fields,
 *      recurrence logic is encapsulated in this specialized class.
 *    - A Task "has-a" RecurrenceRule (Object Composition).
 * 
 * 2. JAVA 8+ DATE-TIME API (java.time.LocalDateTime):
 *    - Modern java.time methods like .plusDays(), .plusWeeks(), and .plusMonths()
 *      provide clean, leap-year-aware, and daylight-savings-aware date math.
 *    - Immutability: LocalDateTime objects are immutable and thread-safe.
 * 
 * 3. CLEAN API DESIGN:
 *    - Provides high-level public methods like calculateNextDueDate() and isRecurring()
 *      so caller code does not need to know the inner switch/case details.
 */
public class RecurrenceRule {

    // Nested Enum for allowed recurrence cycles (OOP type safety)
    public enum Frequency {
        NONE, DAILY, WEEKLY, MONTHLY
    }

    // Private member variables (Encapsulation)
    private Frequency frequency;
    private int interval; // e.g., repeat every 1 day, every 2 weeks

    // Default Constructor: Creates a non-recurring rule
    public RecurrenceRule() {
        this(Frequency.NONE, 1);
    }

    // Parameterized Constructor: Enforces valid intervals (at least 1)
    public RecurrenceRule(Frequency frequency, int interval) {
        this.frequency = frequency != null ? frequency : Frequency.NONE;
        this.interval = Math.max(1, interval);
    }

    // --- GETTERS AND SETTERS (OOP Accessors & Mutators) ---

    public Frequency getFrequency() {
        return frequency;
    }

    public void setFrequency(Frequency frequency) {
        this.frequency = frequency != null ? frequency : Frequency.NONE;
    }

    public int getInterval() {
        return interval;
    }

    public void setInterval(int interval) {
        this.interval = Math.max(1, interval);
    }

    // --- BUSINESS LOGIC & PUBLIC API METHODS ---

    /**
     * Checks if this rule represents an active recurring schedule.
     * @return true if frequency is set to DAILY, WEEKLY, or MONTHLY.
     */
    public boolean isRecurring() {
        return frequency != null && frequency != Frequency.NONE;
    }

    /**
     * DATE-TIME API USAGE:
     * Calculates the subsequent due date based on the current deadline and recurrence frequency.
     * 
     * @param currentDeadline The existing task deadline (java.time.LocalDateTime)
     * @return The updated future deadline, or null if non-recurring or deadline is null
     */
    public LocalDateTime calculateNextDueDate(LocalDateTime currentDeadline) {
        if (!isRecurring() || currentDeadline == null) {
            return null;
        }

        // Use modern java.time methods which cleanly handle month ends and leap years
        switch (frequency) {
            case DAILY:
                return currentDeadline.plusDays(interval);
            case WEEKLY:
                return currentDeadline.plusWeeks(interval);
            case MONTHLY:
                return currentDeadline.plusMonths(interval);
            default:
                return currentDeadline;
        }
    }

    @Override
    public String toString() {
        if (!isRecurring()) {
            return "No recurrence";
        }
        return frequency.name() + " (Interval: " + interval + ")";
    }
}
