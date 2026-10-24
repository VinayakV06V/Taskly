import java.time.LocalDateTime;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * ==============================================================================
 * Task.java
 * ==============================================================================
 * 
 * CONCEPTS DEMONSTRATED:
 * 
 * 1. OBJECT-ORIENTED PROGRAMMING (OOP):
 *    - Encapsulation: All state fields (id, title, priority, deadline, isCompleted)
 *      are private and accessed only through controlled public getters/setters.
 *    - Composition ("has-a" relationship): A Task has-a Priority enum and has-a
 *      RecurrenceRule object.
 *    - Interface & Polymorphism: Implements Comparable<Task> to provide standard
 *      natural sorting behavior.
 * 
 * 2. SORTING (Comparable<Task>):
 *    - By implementing Comparable<Task>, Task objects can be sorted directly
 *      using Collections.sort(taskList) or ArrayList.sort() without additional comparator code.
 *    - Natural Order: Earliest deadline first (chronological order).
 * 
 * 3. JAVA 8+ DATE-TIME API (java.time.LocalDateTime & java.time.Duration):
 *    - LocalDateTime provides accurate timestamp comparisons (e.g., .isAfter() for overdue detection).
 *    - Duration.between() calculates exact hours remaining until or past a deadline.
 *    - DateTimeFormatter formats dates cleanly into human-readable strings.
 * 
 * 4. PUBLIC API & BUSINESS LOGIC:
 *    - toggleComplete(): Marks completion and spawns the next recurring instance automatically.
 *    - isOverdue(): Real-time evaluation against current system clock.
 */
public class Task implements Comparable<Task> {

    // --- ENCAPSULATED PRIVATE FIELDS (OOP) ---
    private final String id;
    private String title;
    private String description;
    private Priority priority;
    private String category;
    private LocalDateTime deadline;
    private boolean isCompleted;
    private LocalDateTime completedAt;
    private final LocalDateTime createdAt;
    private RecurrenceRule recurrence;

    // --- CONSTRUCTORS (OOP Overloading for Convenience) ---

    /**
     * Convenience Constructor: Defaults to a randomly generated UUID and non-recurring rule.
     */
    public Task(String title, String description, Priority priority, String category, LocalDateTime deadline) {
        this(UUID.randomUUID().toString(), title, description, priority, category, deadline, new RecurrenceRule());
    }

    /**
     * Full Constructor: Initializes all core properties with safe fallbacks.
     */
    public Task(String id, String title, String description, Priority priority, String category, LocalDateTime deadline, RecurrenceRule recurrence) {
        this.id = (id != null && !id.trim().isEmpty()) ? id : UUID.randomUUID().toString();
        this.title = title != null ? title.trim() : "Untitled Task";
        this.description = description != null ? description.trim() : "";
        this.priority = priority != null ? priority : Priority.MEDIUM;
        this.category = (category != null && !category.trim().isEmpty()) ? category.trim() : "General";
        this.deadline = deadline;
        this.isCompleted = false;
        this.completedAt = null;
        this.createdAt = LocalDateTime.now(); // Date-Time API: capture current creation timestamp
        this.recurrence = recurrence != null ? recurrence : new RecurrenceRule();
    }

    // --- GETTERS AND SETTERS (OOP Encapsulation Accessors) ---

    public String getId() { return id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    
    public boolean isCompleted() { return isCompleted; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    public RecurrenceRule getRecurrence() { return recurrence; }
    public void setRecurrence(RecurrenceRule recurrence) { this.recurrence = recurrence; }

    // --- PUBLIC API BUSINESS METHODS ---

    /**
     * BUSINESS LOGIC & API METHOD:
     * Toggles task completion state.
     * If marking complete on a recurring task, calculates next due date and returns
     * a newly scheduled Task instance for continuous habit/workflow automation.
     * 
     * @return Newly scheduled recurring Task if applicable, or null if non-recurring or re-opened.
     */
    public Task toggleComplete() {
        if (!this.isCompleted) {
            this.isCompleted = true;
            this.completedAt = LocalDateTime.now(); // Date-Time API: stamp completion time

            // If recurring, spawn the subsequent cycle
            if (this.recurrence != null && this.recurrence.isRecurring()) {
                LocalDateTime nextDue = this.recurrence.calculateNextDueDate(this.deadline);
                return new Task(this.title, this.description, this.priority, this.category, nextDue, this.recurrence);
            }
        } else {
            // Re-open completed task
            this.isCompleted = false;
            this.completedAt = null;
        }
        return null;
    }

    /**
     * DATE-TIME API USAGE:
     * Checks if current time has passed the deadline for pending tasks.
     * Uses LocalDateTime.now().isAfter(deadline).
     */
    public boolean isOverdue() {
        if (isCompleted || deadline == null) {
            return false;
        }
        return LocalDateTime.now().isAfter(deadline);
    }

    /**
     * DATE-TIME API USAGE (Duration):
     * Calculates hours remaining until deadline, or negative hours if overdue.
     */
    public long getHoursRemaining() {
        if (deadline == null) return 0;
        return Duration.between(LocalDateTime.now(), deadline).toHours();
    }

    // --- SORTING IMPLEMENTATION (Comparable<Task>) ---

    /**
     * SORTING CONCEPT:
     * Natural Ordering: Earliest deadline first.
     * Returns:
     *   negative if this task's deadline is before other's deadline
     *   zero if both deadlines are equal
     *   positive if this task's deadline is after other's deadline
     */
    @Override
    public int compareTo(Task other) {
        if (other == null) return 1;
        if (this.deadline == null && other.deadline == null) return 0;
        if (this.deadline == null) return 1; // Tasks without deadlines go to the end
        if (other.deadline == null) return -1;
        return this.deadline.compareTo(other.deadline);
    }

    @Override
    public String toString() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        String deadlineStr = deadline != null ? deadline.format(dtf) : "No deadline";
        String status = isCompleted ? "[COMPLETED]" : (isOverdue() ? "[OVERDUE!]" : "[PENDING]");
        return String.format("%s %-25s | Priority: %-6s | Category: %-10s | Due: %s",
                status, title, priority, category, deadlineStr);
    }
}
