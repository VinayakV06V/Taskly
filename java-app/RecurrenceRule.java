import java.time.LocalDateTime;

/**
 * RecurrenceRule.java
 * Encapsulates recurrence frequency (DAILY, WEEKLY, MONTHLY)
 * and calculates the subsequent due date using java.time API.
 */
public class RecurrenceRule {
    public enum Frequency {
        NONE, DAILY, WEEKLY, MONTHLY
    }

    private Frequency frequency;
    private int interval; // e.g. every 1 day, every 2 weeks

    public RecurrenceRule() {
        this.frequency = Frequency.NONE;
        this.interval = 1;
    }

    public RecurrenceRule(Frequency frequency, int interval) {
        this.frequency = frequency;
        this.interval = Math.max(1, interval);
    }

    public Frequency getFrequency() {
        return frequency;
    }

    public void setFrequency(Frequency frequency) {
        this.frequency = frequency;
    }

    public int getInterval() {
        return interval;
    }

    public void setInterval(int interval) {
        this.interval = interval;
    }

    public boolean isRecurring() {
        return frequency != null && frequency != Frequency.NONE;
    }

    public LocalDateTime calculateNextDueDate(LocalDateTime currentDeadline) {
        if (!isRecurring() || currentDeadline == null) {
            return null;
        }
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
        if (!isRecurring()) return "No recurrence";
        return frequency.name() + " (Interval: " + interval + ")";
    }
}
