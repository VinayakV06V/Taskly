import java.time.LocalDate;
import java.util.*;

/**
 * HabitTracker.java
 * Manages recurring habits, daily logs, and streak metrics using ArrayList and HashMap.
 */
public class HabitTracker {
    private final List<Habit> habitList;
    private final Map<String, Habit> idLookupMap;

    public HabitTracker() {
        this.habitList = new ArrayList<>();
        this.idLookupMap = new HashMap<>();
    }

    public void addHabit(Habit habit) {
        if (habit == null) return;
        habitList.add(habit);
        idLookupMap.put(habit.getId(), habit);
    }

    public boolean removeHabit(String id) {
        idLookupMap.remove(id);
        return habitList.removeIf(h -> h.getId().equals(id));
    }

    public Habit getById(String id) {
        return idLookupMap.get(id);
    }

    public boolean logHabitDay(String id, LocalDate date) {
        Habit habit = idLookupMap.get(id);
        if (habit != null) {
            return habit.toggleCompletion(date);
        }
        return false;
    }

    public List<Habit> getAllHabits() {
        return new ArrayList<>(habitList);
    }

    public int getMaxStreak() {
        return habitList.stream().mapToInt(Habit::getBestStreak).max().orElse(0);
    }

    public int getTotalCheckins() {
        return habitList.stream().mapToInt(h -> h.getCompletionHistory().size()).sum();
    }
}
