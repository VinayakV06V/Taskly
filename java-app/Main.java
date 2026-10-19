import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Main.java
 * Entry point for local Java execution of the Task & Habit Management System.
 * Demonstrates:
 * - OOP: Domain modeling with encapsulation and composition
 * - ArrayList: Storage, reordering, and sub-selection
 * - HashMap: Category grouping, habit date-keyed lookup, and metric aggregation
 * - Sorting: Comparator implementations (Deadline, Priority weight, Title)
 * - Date-Time API: Java 8+ java.time (LocalDateTime, LocalDate, Duration, ChronoUnit)
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("       TASK & HABIT MANAGEMENT SYSTEM (JAVA OOP DEMONSTRATION)");
        System.out.println("================================================================================");

        TaskManager taskManager = new TaskManager();
        HabitTracker habitTracker = new HabitTracker();

        // 1. Seed Sample Tasks demonstrating OOP, Priority, and Recurrence
        LocalDateTime now = LocalDateTime.now();

        // Overdue High-Priority Task
        Task t1 = new Task("Submit Cloud Architecture Report",
                "Complete final system diagram and reliability analysis",
                Priority.HIGH, "Engineering", now.minusHours(4));
        taskManager.addTask(t1);

        // Upcoming High-Priority Recurring Task
        RecurrenceRule dailyRule = new RecurrenceRule(RecurrenceRule.Frequency.DAILY, 1);
        Task t2 = new Task("Review PRs & Code Pipeline",
                "Review open pull requests on task management repo",
                Priority.HIGH, "Engineering", now.plusHours(5), dailyRule);
        taskManager.addTask(t2);

        // Medium Priority Tasks
        Task t3 = new Task("Complete Data Structures Homework",
                "Implement ArrayList vs HashMap benchmarks",
                Priority.MEDIUM, "Academics", now.plusDays(1).withHour(18).withMinute(0));
        taskManager.addTask(t3);

        Task t4 = new Task("Schedule Weekly Sprint Retro",
                "Coordinate calendar invite with team leads",
                Priority.LOW, "Operations", now.plusDays(3));
        taskManager.addTask(t4);

        Task t5 = new Task("Database Index Optimization",
                "Analyze query execution plan and tune B-Tree indices",
                Priority.HIGH, "Engineering", now.plusDays(2));
        taskManager.addTask(t5);

        // Seed Sample Habits with Date-Time tracking and HashMap
        Habit h1 = new Habit("Deep Work & Coding Session", "At least 90 minutes of focused problem solving", "Work", "DAILY", 5);
        // Log last 4 consecutive days
        h1.toggleCompletion(LocalDate.now().minusDays(3));
        h1.toggleCompletion(LocalDate.now().minusDays(2));
        h1.toggleCompletion(LocalDate.now().minusDays(1));
        h1.toggleCompletion(LocalDate.now());
        habitTracker.addHabit(h1);

        Habit h2 = new Habit("Exercise & Hydration", "Cardio or strength training + 2.5L water", "Health", "DAILY", 7);
        h2.toggleCompletion(LocalDate.now().minusDays(1));
        h2.toggleCompletion(LocalDate.now());
        habitTracker.addHabit(h2);

        Habit h3 = new Habit("Read Technical Documentation", "Read 1 RFC or Java SE specification chapter", "Learning", "DAILY", 4);
        habitTracker.addHabit(h3);

        // Run automated demonstration
        printSectionHeader("1. ALL TASKS (INITIAL ORDER IN ARRAYLIST)");
        for (Task t : taskManager.getAllTasks()) {
            System.out.println("  " + t);
        }

        printSectionHeader("2. SORTING DEMONSTRATION: BY DEADLINE (ASCENDING)");
        List<Task> byDeadline = taskManager.sortByDeadline();
        for (Task t : byDeadline) {
            System.out.println("  " + t);
        }

        printSectionHeader("3. SORTING DEMONSTRATION: BY PRIORITY WEIGHT (HIGH -> LOW)");
        List<Task> byPriority = taskManager.sortByPriority();
        for (Task t : byPriority) {
            System.out.println("  " + t);
        }

        printSectionHeader("4. OVERDUE ALERTS (DATE-TIME API CHECK)");
        List<Task> overdue = taskManager.getOverdueTasks();
        if (overdue.isEmpty()) {
            System.out.println("  No overdue tasks currently!");
        } else {
            for (Task ot : overdue) {
                System.out.printf("  [ALERT - OVERDUE] %s (Past deadline by %d hours)%n",
                        ot.getTitle(), Math.abs(ot.getHoursRemaining()));
            }
        }

        printSectionHeader("5. HASHMAP DATA STRUCTURE METRICS & CATEGORY BREAKDOWN");
        Map<Priority, Integer> priorityMap = taskManager.getPriorityDistribution();
        System.out.println("  Priority Frequency Map (HashMap<Priority, Integer>):");
        priorityMap.forEach((p, count) -> System.out.printf("    %-8s: %d tasks%n", p, count));

        Map<String, Integer> categoryMap = taskManager.getCategoryCounts();
        System.out.println("  Category Distribution Map (HashMap<String, Integer>):");
        categoryMap.forEach((cat, count) -> System.out.printf("    %-12s: %d tasks%n", cat, count));

        printSectionHeader("6. HABIT STREAK TRACKING (HASHMAP<LOCALDATE, BOOLEAN>)");
        for (Habit h : habitTracker.getAllHabits()) {
            System.out.println("  " + h);
        }

        printSectionHeader("7. SIMULATING TASK COMPLETION & RECURRENCE GENERATION");
        System.out.println("  Completing recurring task: " + t2.getTitle());
        taskManager.toggleTaskCompletion(t2.getId());
        System.out.println("  Updated Task List size in ArrayList: " + taskManager.getAllTasks().size());
        System.out.printf("  New Overall Completion Rate: %.1f%%%n", taskManager.getCompletionRate());

        System.out.println("\n================================================================================");
        System.out.println("  Java OOP Demonstration Completed Successfully.");
        System.out.println("================================================================================");
    }

    private static void printSectionHeader(String title) {
        System.out.println("\n--- " + title + " ---");
    }
}
