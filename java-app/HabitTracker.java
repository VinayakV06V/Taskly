import java.time.LocalDate;
import java.util.*;

/**
 * ==============================================================================
 * HabitTracker.java
 * ==============================================================================
 * 
 * CONCEPTS DEMONSTRATED:
 * 
 * 1. ARRAYLIST DATA STRUCTURE (List<Habit> habitList):
 *    - Why ArrayList?
 *      * Dynamic Sizing: Unlike a static Habit[10] array, an ArrayList grows and
 *        shrinks dynamically as users create and delete habits.
 *      * Ordered Collection: Preserves the order in which habits were added.
 *      * Defensive Copying: getAllHabits() returns `new ArrayList<>(habitList)`
 *        to preserve OOP encapsulation so outside callers cannot corrupt internal state.
 * 
 * 2. HASHMAP DATA STRUCTURE (Map<String, Habit> idLookupMap):
 *    - Why use a secondary HashMap alongside ArrayList?
 *      * High-Performance Lookup: Finding a habit by ID via HashMap (idLookupMap.get(id))
 *        is O(1) constant time, avoiding slow O(N) linear scans across large lists.
 * 
 * 3. OBJECT-ORIENTED PROGRAMMING (OOP) - SERVICE LAYER:
 *    - HabitTracker acts as a manager / facade service object that coordinates
 *      habit entities, check-in operations, and aggregate metrics.
 * 
 * 4. PUBLIC API METHODS:
 *    - addHabit(), removeHabit(), logHabitDay(), getMaxStreak(), getTotalCheckins().
 */
public class HabitTracker {

    // 1. ARRAYLIST: Primary ordered storage for habit objects
    private final List<Habit> habitList;

    // 2. HASHMAP: Fast index mapping habit ID -> Habit object for O(1) lookup
    private final Map<String, Habit> idLookupMap;

    public HabitTracker() {
        this.habitList = new ArrayList<>(); // ARRAYLIST initialization
        this.idLookupMap = new HashMap<>(); // HASHMAP initialization
    }

    /**
     * ARRAYLIST & HASHMAP INSERTION:
     * Adds habit to both data structures to maintain order and fast index.
     * @param habit The Habit object to add
     */
    public void addHabit(Habit habit) {
        if (habit == null) return;
        habitList.add(habit);                 // ARRAYLIST: append to end of list
        idLookupMap.put(habit.getId(), habit); // HASHMAP: index by ID
    }

    /**
     * ARRAYLIST & HASHMAP REMOVAL:
     * Removes habit from both data structures.
     * @param id The unique ID of the habit to remove
     * @return true if habit was found and removed
     */
    public boolean removeHabit(String id) {
        if (id == null) return false;
        idLookupMap.remove(id); // HASHMAP: remove key
        return habitList.removeIf(h -> h.getId().equals(id)); // ARRAYLIST: remove matching item
    }

    /**
     * HASHMAP O(1) LOOKUP API:
     * Instantly retrieves a habit by its ID without looping through the list.
     */
    public Habit getById(String id) {
        if (id == null) return null;
        return idLookupMap.get(id); // HASHMAP: O(1) fetch
    }

    /**
     * PUBLIC API METHOD:
     * Logs or unlogs a check-in for a specific habit on a given date.
     * 
     * @param id The habit ID
     * @param date The calendar date
     * @return true if marked complete, false if unchecked or habit not found
     */
    public boolean logHabitDay(String id, LocalDate date) {
        Habit habit = getById(id);
        if (habit != null) {
            return habit.toggleCompletion(date);
        }
        return false;
    }

    /**
     * ARRAYLIST DEFENSIVE COPYING (OOP Principle):
     * Returns a new ArrayList containing the habits. This prevents caller code
     * from clearing or modifying our internal habitList directly.
     */
    public List<Habit> getAllHabits() {
        return new ArrayList<>(habitList);
    }

    /**
     * AGGREGATE METRIC API:
     * Finds the maximum streak across all tracked habits.
     */
    public int getMaxStreak() {
        int max = 0;
        for (Habit h : habitList) {
            if (h.getBestStreak() > max) {
                max = h.getBestStreak();
            }
        }
        return max;
    }

    /**
     * AGGREGATE METRIC API:
     * Sums total lifetime check-ins across all habits.
     */
    public int getTotalCheckins() {
        int total = 0;
        for (Habit h : habitList) {
            total += h.getCompletionHistory().size(); // HASHMAP size for each habit
        }
        return total;
    }
}
