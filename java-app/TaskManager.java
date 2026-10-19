import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * TaskManager.java
 * Demonstrates:
 * 1. ArrayList<Task> for list operations, additions, removals.
 * 2. HashMap<String, ArrayList<Task>> for category indexing.
 * 3. HashMap<Priority, Integer> for priority frequency counts.
 * 4. Custom Sorting using Comparators (Priority, Deadline, Title).
 * 5. Java Date-Time API for overdue checks and schedule projections.
 */
public class TaskManager {
    private final List<Task> taskList;
    private final Map<String, List<Task>> categoryIndex;

    public TaskManager() {
        this.taskList = new ArrayList<>();
        this.categoryIndex = new HashMap<>();
    }

    public void addTask(Task task) {
        if (task == null) return;
        taskList.add(task);
        rebuildCategoryIndex();
    }

    public boolean removeTask(String id) {
        boolean removed = taskList.removeIf(t -> t.getId().equals(id));
        if (removed) {
            rebuildCategoryIndex();
        }
        return removed;
    }

    public Optional<Task> findById(String id) {
        return taskList.stream().filter(t -> t.getId().equals(id)).findFirst();
    }

    public Task toggleTaskCompletion(String id) {
        Optional<Task> opt = findById(id);
        if (opt.isPresent()) {
            Task task = opt.get();
            Task nextRecurring = task.toggleComplete();
            if (nextRecurring != null) {
                // Add the newly spawned recurring task to our ArrayList
                addTask(nextRecurring);
            }
            rebuildCategoryIndex();
            return task;
        }
        return null;
    }

    private void rebuildCategoryIndex() {
        categoryIndex.clear();
        for (Task t : taskList) {
            categoryIndex.computeIfAbsent(t.getCategory(), k -> new ArrayList<>()).add(t);
        }
    }

    // --- SORTING METHODS ---

    /**
     * Sorts ArrayList by Deadline in ascending chronological order.
     */
    public List<Task> sortByDeadline() {
        List<Task> sorted = new ArrayList<>(taskList);
        sorted.sort(Comparator.nullsLast(Task::compareTo));
        return sorted;
    }

    /**
     * Sorts ArrayList by Priority (HIGH -> MEDIUM -> LOW).
     */
    public List<Task> sortByPriority() {
        List<Task> sorted = new ArrayList<>(taskList);
        sorted.sort((t1, t2) -> {
            int p1 = t1.getPriority() != null ? t1.getPriority().getWeight() : 0;
            int p2 = t2.getPriority() != null ? t2.getPriority().getWeight() : 0;
            return Integer.compare(p2, p1); // Descending weight
        });
        return sorted;
    }

    /**
     * Sorts ArrayList alphabetically by Title.
     */
    public List<Task> sortByTitle() {
        List<Task> sorted = new ArrayList<>(taskList);
        sorted.sort(Comparator.comparing(Task::getTitle, String.CASE_INSENSITIVE_ORDER));
        return sorted;
    }

    // --- DATE-TIME FILTERS & ALERTS ---

    /**
     * Retrieves all overdue tasks using LocalDateTime.now().
     */
    public List<Task> getOverdueTasks() {
        return taskList.stream()
                .filter(Task::isOverdue)
                .sorted(Comparator.comparing(Task::getDeadline))
                .collect(Collectors.toList());
    }

    public List<Task> getPendingTasks() {
        return taskList.stream()
                .filter(t -> !t.isCompleted())
                .collect(Collectors.toList());
    }

    public List<Task> getCompletedTasks() {
        return taskList.stream()
                .filter(Task::isCompleted)
                .collect(Collectors.toList());
    }

    // --- HASHMAP STATISTICS & METRICS ---

    /**
     * Aggregates tasks by Priority using HashMap<Priority, Integer>.
     */
    public Map<Priority, Integer> getPriorityDistribution() {
        Map<Priority, Integer> dist = new HashMap<>();
        for (Priority p : Priority.values()) {
            dist.put(p, 0);
        }
        for (Task t : taskList) {
            dist.put(t.getPriority(), dist.getOrDefault(t.getPriority(), 0) + 1);
        }
        return dist;
    }

    /**
     * Returns task count mapped by category using HashMap.
     */
    public Map<String, Integer> getCategoryCounts() {
        Map<String, Integer> counts = new HashMap<>();
        for (Map.Entry<String, List<Task>> entry : categoryIndex.entrySet()) {
            counts.put(entry.getKey(), entry.getValue().size());
        }
        return counts;
    }

    public double getCompletionRate() {
        if (taskList.isEmpty()) return 0.0;
        long completed = taskList.stream().filter(Task::isCompleted).count();
        return (double) completed / taskList.size() * 100.0;
    }

    public List<Task> getAllTasks() {
        return new ArrayList<>(taskList);
    }
}
