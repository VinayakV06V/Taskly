import java.time.LocalDateTime;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Task.java
 * Core domain entity representing a deadline-driven action item.
 * Demonstrates Object-Oriented Principles: Encapsulation, abstraction,
 * Comparable interface for sorting, and Java 8+ Date-Time API.
 */
public class Task implements Comparable<Task> {
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

    public Task(String title, String description, Priority priority, String category, LocalDateTime deadline) {
        this(UUID.randomUUID().toString(), title, description, priority, category, deadline, new RecurrenceRule());
    }

    public Task(String id, String title, String description, Priority priority, String category, LocalDateTime deadline, RecurrenceRule recurrence) {
        this.id = id != null ? id : UUID.randomUUID().toString();
        this.title = title;
        this.description = description != null ? description : "";
        this.priority = priority != null ? priority : Priority.MEDIUM;
        this.category = category != null && !category.trim().isEmpty() ? category : "General";
        this.deadline = deadline;
        this.isCompleted = false;
        this.completedAt = null;
        this.createdAt = LocalDateTime.now();
        this.recurrence = recurrence != null ? recurrence : new RecurrenceRule();
    }

    // Getters and Setters
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

    /**
     * Toggles task completion state.
     * If the task is recurring and being marked complete, returns a newly scheduled Task.
     */
    public Task toggleComplete() {
        if (!this.isCompleted) {
            this.isCompleted = true;
            this.completedAt = LocalDateTime.now();

            if (this.recurrence != null && this.recurrence.isRecurring()) {
                LocalDateTime nextDue = this.recurrence.calculateNextDueDate(this.deadline);
                return new Task(this.title, this.description, this.priority, this.category, nextDue);
            }
        } else {
            this.isCompleted = false;
            this.completedAt = null;
        }
        return null;
    }

    /**
     * Checks if task is past due using Date-Time comparison.
     */
    public boolean isOverdue() {
        if (isCompleted || deadline == null) {
            return false;
        }
        return LocalDateTime.now().isAfter(deadline);
    }

    /**
     * Calculates duration in hours until or past deadline.
     */
    public long getHoursRemaining() {
        if (deadline == null) return 0;
        return Duration.between(LocalDateTime.now(), deadline).toHours();
    }

    /**
     * Default natural ordering by deadline (earliest deadline first).
     */
    @Override
    public int compareTo(Task other) {
        if (other == null) return 1;
        if (this.deadline == null && other.deadline == null) return 0;
        if (this.deadline == null) return 1;
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
