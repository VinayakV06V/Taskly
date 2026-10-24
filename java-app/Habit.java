import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * ==============================================================================
 * Habit.java
 * ==============================================================================
 * 
 * CONCEPTS DEMONSTRATED:
 * 
 * 1. OBJECT-ORIENTED PROGRAMMING (OOP):
 *    - Encapsulation: State (title, streaks, completionHistory) is private.
 *    - Abstraction: The complex logic of walking backwards through calendar days
 *      to compute streaks is hidden inside recalculateStreak().
 * 
 * 2. HASHMAP DATA STRUCTURE (Map<LocalDate, Boolean>):
 *    - Why HashMap?
 *      * O(1) Instant Lookup: Checking if a habit was completed on any given date
 *        takes constant time: completionHistory.get(date).
 *      * Sparse Storage: Only stores dates where check-ins occurred, rather than
 *        allocating memory for all 365 days of a calendar year.
 *      * Dynamic additions/removals: Easily add entries via .put() or delete via .remove().
 * 
 * 3. JAVA 8+ DATE-TIME API (java.time.LocalDate):
 *    - Uses LocalDate (date only, no time component) which is optimal for daily habit logs.
 *    - Uses cursor.minusDays(1) to step backwards through days accurately across month
 *      and leap year boundaries.
 * 
 * 4. PUBLIC API METHODS:
 *    - toggleCompletion(): User-facing check-in method that encapsulates data storage and streak recalculation.
 */
public class Habit {

    // --- ENCAPSULATED PRIVATE FIELDS (OOP) ---
    private final String id;
    private String title;
    private String description;
    private String category;
    private String frequency; // e.g., "DAILY" or "WEEKLY"
    private int targetDaysPerWeek;
    
    // HASHMAP: Stores completion history keyed by calendar date (LocalDate -> Boolean)
    private final Map<LocalDate, Boolean> completionHistory;
    
    private int currentStreak;
    private int bestStreak;
    private final LocalDate createdAt;

    // --- CONSTRUCTOR ---
    public Habit(String title, String description, String category, String frequency, int targetDaysPerWeek) {
        this.id = UUID.randomUUID().toString();
        this.title = title != null ? title.trim() : "Untitled Habit";
        this.description = description != null ? description.trim() : "";
        this.category = category != null ? category.trim() : "General";
        this.frequency = frequency != null ? frequency.toUpperCase() : "DAILY";
        this.targetDaysPerWeek = Math.max(1, Math.min(7, targetDaysPerWeek)); // Clamp 1 to 7
        this.completionHistory = new HashMap<>(); // HASHMAP Initialization
        this.currentStreak = 0;
        this.bestStreak = 0;
        this.createdAt = LocalDate.now(); // Date-Time API: capture current date
    }

    // --- GETTERS AND SETTERS (OOP Accessors) ---

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
    public void setTargetDaysPerWeek(int targetDaysPerWeek) { 
        this.targetDaysPerWeek = Math.max(1, Math.min(7, targetDaysPerWeek)); 
    }
    
    // Returns the HashMap containing daily log history
    public Map<LocalDate, Boolean> getCompletionHistory() { return completionHistory; }
    
    public int getCurrentStreak() { return currentStreak; }
    public int getBestStreak() { return bestStreak; }
    public LocalDate getCreatedAt() { return createdAt; }

    // --- PUBLIC API BUSINESS METHODS ---

    /**
     * HASHMAP & API USAGE:
     * Toggles habit check-in for a specific calendar date in the HashMap.
     * If checked in, adds to HashMap; if unchecked, removes from HashMap.
     * Automatically triggers streak recalculation.
     * 
     * @param date The calendar date to toggle (defaults to today if null)
     * @return true if marked completed, false if unchecked
     */
    public boolean toggleCompletion(LocalDate date) {
        if (date == null) {
            date = LocalDate.now(); // Date-Time API default
        }

        // HASHMAP O(1) Check
        boolean currentState = completionHistory.getOrDefault(date, false);
        boolean newState = !currentState;

        if (newState) {
            completionHistory.put(date, true); // HASHMAP Insert
        } else {
            completionHistory.remove(date);     // HASHMAP Delete
        }

        // Encapsulated streak update
        recalculateStreak();
        return newState;
    }

    /**
     * HASHMAP O(1) Query:
     * Checks if habit was logged on a specific date.
     */
    public boolean isCompletedOn(LocalDate date) {
        return Boolean.TRUE.equals(completionHistory.get(date));
    }

    /**
     * DATE-TIME API & ALGORITHM:
     * Recalculates consecutive daily streaks backwards starting from today (or yesterday).
     * Uses LocalDate.minusDays(1) to step backwards day-by-day.
     */
    public void recalculateStreak() {
        LocalDate cursor = LocalDate.now();

        // If today is not checked in yet, check if yesterday was completed to keep streak alive
        if (!isCompletedOn(cursor)) {
            cursor = cursor.minusDays(1);
        }

        int streak = 0;
        // Step backwards as long as each consecutive day is present in our HashMap
        while (isCompletedOn(cursor)) {
            streak++;
            cursor = cursor.minusDays(1); // Date-Time API step
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
