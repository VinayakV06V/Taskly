import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ==============================================================================
 * TaskManager.java
 * ==============================================================================
 * 
 * CONCEPTS DEMONSTRATED:
 * 
 * 1. ARRAYLIST DATA STRUCTURE (List<Task> taskList):
 *    - Why ArrayList?
 *      * Resizable Array: Unlike fixed arrays (Task[]), an ArrayList grows dynamically
 *        when new tasks are added via addTask() and shrinks on removeTask().
 *      * High Performance Iteration: Fast O(1) random access and sequential scans.
 *      * Defensive Copies: Methods like getAllTasks() return a clone so outside code
 *        cannot tamper with internal state.
 * 
 * 2. HASHMAP DATA STRUCTURE (Map<String, List<Task>> & Map<Priority, Integer>):
 *    - Category Indexing (Map<String, List<Task>>):
 *      * Groups tasks by category key in constant time O(1).
 *    - Distribution Counting (Map<Priority, Integer> & Map<String, Integer>):
 *      * Aggregates frequency statistics for priorities and categories without
 *        needing separate database tables.
 * 
 * 3. SORTING ALGORITHMS (Comparable vs. Comparator):
 *    - Natural Order (Comparable): sortByDeadline() leverages Task's built-in compareTo().
 *    - Custom Ordering (Comparator):
 *      * sortByPriority(): Custom lambda sorting by numeric priority weight descending.
 *      * sortByTitle(): Case-insensitive alphabetical sorting.
 * 
 * 4. JAVA 8+ DATE-TIME API (java.time.LocalDateTime):
 *    - Filters overdue tasks using real-time LocalDateTime comparisons.
 * 
 * 5. OBJECT-ORIENTED PROGRAMMING (OOP) - FACADE & CONTROLLER:
 *    - Hides internal data storage mechanics behind clean business API methods.
 */
public class TaskManager {

    // 1. ARRAYLIST: Main dynamic list of active tasks
    private final List<Task> taskList;

    // 2. HASHMAP: Category-based multi-map (Category Name -> List of Tasks)
    private final Map<String, List<Task>> categoryIndex;

    public TaskManager() {
        this.taskList = new ArrayList<>();       // ARRAYLIST initialization
        this.categoryIndex = new HashMap<>();   // HASHMAP initialization
    }

    // --- ARRAYLIST CRUD OPERATIONS & PUBLIC API ---

    /**
     * ARRAYLIST INSERTION:
     * Appends a new task to the dynamic ArrayList and updates category index.
     * @param task The Task object to add
     */
    public void addTask(Task task) {
        if (task == null) return;
        taskList.add(task);          // ARRAYLIST: add element
        rebuildCategoryIndex();     // HASHMAP: refresh category grouping
    }

    /**
     * ARRAYLIST DELETION:
     * Removes task matching the given ID from the ArrayList.
     * @param id The unique task ID
     * @return true if an element was removed
     */
    public boolean removeTask(String id) {
        if (id == null) return false;
        boolean removed = taskList.removeIf(t -> t.getId().equals(id));
        if (removed) {
            rebuildCategoryIndex(); // HASHMAP: keep index synchronized
        }
        return removed;
    }

    /**
     * LOOKUP:
     * Searches the ArrayList for a task with a matching ID.
     */
    public Optional<Task> findById(String id) {
        if (id == null) return Optional.empty();
        return taskList.stream().filter(t -> t.getId().equals(id)).findFirst();
    }

    /**
     * PUBLIC BUSINESS API METHOD:
     * Toggles completion status of a task.
     * If the completed task has a recurring rule, automatically spawns
     * the next scheduled task and adds it to the ArrayList!
     */
    public Task toggleTaskCompletion(String id) {
        Optional<Task> opt = findById(id);
        if (opt.isPresent()) {
            Task task = opt.get();
            Task nextRecurring = task.toggleComplete();
            if (nextRecurring != null) {
                // Add the newly spawned recurring task to our dynamic ArrayList
                addTask(nextRecurring);
            }
            rebuildCategoryIndex();
            return task;
        }
        return null;
    }

    /**
     * HASHMAP GROUPING LOGIC:
     * Rebuilds the categoryIndex map (Category String -> ArrayList of Tasks).
     * Uses computeIfAbsent() for clean, idiomatically modern Java map population.
     */
    private void rebuildCategoryIndex() {
        categoryIndex.clear();
        for (Task t : taskList) {
            // HASHMAP: if category key doesn't exist, create a new ArrayList, then add the task
            categoryIndex.computeIfAbsent(t.getCategory(), k -> new ArrayList<>()).add(t);
        }
    }

    // --- SORTING METHODS (COMPARABLE & COMPARATOR) ---

    /**
     * SORTING (NATURAL ORDER VIA Comparable<Task>):
     * Creates a new ArrayList copy and sorts it by deadline chronologically
     * using Task's own compareTo() implementation.
     */
    public List<Task> sortByDeadline() {
        List<Task> sorted = new ArrayList<>(taskList); // Copy to preserve original list order
        sorted.sort(Comparator.nullsLast(Task::compareTo)); // SORTING: natural order
        return sorted;
    }

    /**
     * SORTING (CUSTOM COMPARATOR BY PRIORITY WEIGHT):
     * Sorts tasks in descending order of Priority weight (HIGH = 3 -> MEDIUM = 2 -> LOW = 1).
     * Uses an explicit Comparator comparing numeric weights.
     */
    public List<Task> sortByPriority() {
        List<Task> sorted = new ArrayList<>(taskList);
        sorted.sort((t1, t2) -> {
            int p1 = (t1.getPriority() != null) ? t1.getPriority().getWeight() : 0;
            int p2 = (t2.getPriority() != null) ? t2.getPriority().getWeight() : 0;
            // Descending order: higher weight appears first
            return Integer.compare(p2, p1);
        });
        return sorted;
    }

    /**
     * SORTING (CUSTOM COMPARATOR BY TITLE):
     * Sorts tasks alphabetically (case-insensitive) by title.
     */
    public List<Task> sortByTitle() {
        List<Task> sorted = new ArrayList<>(taskList);
        sorted.sort(Comparator.comparing(Task::getTitle, String.CASE_INSENSITIVE_ORDER));
        return sorted;
    }

    // --- DATE-TIME FILTERS & ALERTS ---

    /**
     * DATE-TIME API USAGE:
     * Filters all tasks that are pending and whose deadline is in the past.
     * Uses task.isOverdue() (which compares LocalDateTime.now() against deadline).
     */
    public List<Task> getOverdueTasks() {
        return taskList.stream()
                .filter(Task::isOverdue)
                .sorted(Comparator.comparing(Task::getDeadline, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    /**
     * Filters tasks that have not yet been completed.
     */
    public List<Task> getPendingTasks() {
        return taskList.stream()
                .filter(t -> !t.isCompleted())
                .collect(Collectors.toList());
    }

    /**
     * Filters tasks that are marked completed.
     */
    public List<Task> getCompletedTasks() {
        return taskList.stream()
                .filter(Task::isCompleted)
                .collect(Collectors.toList());
    }

    // --- HASHMAP STATISTICS & METRICS ---

    /**
     * HASHMAP AGGREGATION (Priority Frequency Count):
     * Returns a HashMap<Priority, Integer> mapping each Priority level
     * to the number of tasks assigned to that priority.
     */
    public Map<Priority, Integer> getPriorityDistribution() {
        Map<Priority, Integer> dist = new HashMap<>(); // HASHMAP for counting
        for (Priority p : Priority.values()) {
            dist.put(p, 0); // Initialize counts to 0
        }
        for (Task t : taskList) {
            Priority p = t.getPriority();
            dist.put(p, dist.getOrDefault(p, 0) + 1); // HASHMAP increment
        }
        return dist;
    }

    /**
     * HASHMAP AGGREGATION (Category Count):
     * Extracts counts directly from categoryIndex (HashMap<String, Integer>).
     */
    public Map<String, Integer> getCategoryCounts() {
        Map<String, Integer> counts = new HashMap<>();
        for (Map.Entry<String, List<Task>> entry : categoryIndex.entrySet()) {
            counts.put(entry.getKey(), entry.getValue().size());
        }
        return counts;
    }

    /**
     * AGGREGATE API METRIC:
     * Calculates the percentage of completed tasks (0.0% to 100.0%).
     */
    public double getCompletionRate() {
        if (taskList.isEmpty()) return 0.0;
        long completed = taskList.stream().filter(Task::isCompleted).count();
        return ((double) completed / taskList.size()) * 100.0;
    }

    /**
     * ARRAYLIST DEFENSIVE COPYING (OOP Data Hiding):
     * Returns a copy of the task list so internal taskList cannot be cleared externally.
     */
    public List<Task> getAllTasks() {
        return new ArrayList<>(taskList);
    }
}
