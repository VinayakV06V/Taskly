import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Habit.java
 * Domain entity representing a recurring personal/professional routine.
 * Employs a HashMap<LocalDate, Boolean> to record daily logs and compute streaks.
 */
public class Habit {
    private final String id;
    private String title;
    private String description;
    private String category;
    private String frequency; // DAILY or WEEKLY
    private int targetDaysPerWeek;
    private final Map<LocalDate, Boolean> completionHistory;
    private int currentStreak;
    private int bestStreak;
    private final LocalDate createdAt;

    public Habit(String title, String description, String category, String frequency, int targetDaysPerWeek) {
        this.id = UUID.randomUUID().toString();
        this.title = title;
        this.description = description != null ? description : "";
        this.category = category != null ? category : "Health";
        this.frequency = frequency != null ? frequency : "DAILY";
        this.targetDaysPerWeek = Math.max(1, Math.min(7, targetDaysPerWeek));
        this.completionHistory = new HashMap<>();
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.createdAt = LocalDate.now();
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    public int getTargetDaysPerWeek() { return targetDaysPerWeek; }
    public void setTargetDaysPerWeek(int targetDaysPerWeek) { this.targetDaysPerWeek = targetDaysPerWeek; }
    public Map<LocalDate, Boolean> getCompletionHistory() { return completionHistory; }
    public int getCurrentStreak() { return currentStreak; }
    public int getBestStreak() { return bestStreak; }
    public LocalDate getCreatedAt() { return createdAt; }

    /**
     * Toggles completion for a given date and recalculates streak.
     */
    public boolean toggleCompletion(LocalDate date) {
        if (date == null) date = LocalDate.now();
        boolean currentState = completionHistory.getOrDefault(date, false);
        boolean newState = !currentState;
        if (newState) {
            completionHistory.put(date, true);
        } else {
            completionHistory.remove(date);
        }
        recalculateStreak();
        return newState;
    }

    public boolean isCompletedOn(LocalDate date) {
        return Boolean.TRUE.equals(completionHistory.get(date));
    }

    /**
     * Recalculates consecutive daily streaks backwards from today or yesterday.
     */
    public void recalculateStreak() {
        LocalDate cursor = LocalDate.now();
        // If not completed today, check if yesterday was completed to maintain active streak
        if (!isCompletedOn(cursor)) {
            cursor = cursor.minusDays(1);
        }

        int streak = 0;
        while (isCompletedOn(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        this.currentStreak = streak;
        if (streak > this.bestStreak) {
            this.bestStreak = streak;
        }
    }

    @Override
    public String toString() {
        return String.format("%-25s | Category: %-10s | Streak: %2d days | Best: %2d days | Logs: %d",
                title, category, currentStreak, bestStreak, completionHistory.size());
    }
}
