import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * ==============================================================================
 * Main.java
 * ==============================================================================
 * 
 * DEMONSTRATION & TEST HARNESS FOR ALL CORE CONCEPTS:
 * 
 * 1. OBJECT-ORIENTED PROGRAMMING (OOP):
 *    - Domain Modeling: Task, Habit, Priority, and RecurrenceRule model real-world entities.
 *    - Encapsulation: Fields are protected by accessors/mutators.
 *    - Composition: Task has-a RecurrenceRule, TaskManager has-a List of Tasks.
 * 
 * 2. ARRAYLIST DATA STRUCTURE:
 *    - Dynamic addition, iteration, removal, and defensive copying of task & habit lists.
 * 
 * 3. SORTING MECHANISMS:
 *    - Comparable (Natural order by deadline chronological asc).
 *    - Comparator (Custom lambda sorting by Priority weight descending, and Title alphabetically).
 * 
 * 4. JAVA 8+ DATE-TIME API:
 *    - java.time.LocalDateTime for deadline timestamps and overdue checking.
 *    - java.time.LocalDate for day-only habit check-in histories.
 *    - java.time.Duration for calculating hours until or past deadline.
 * 
 * 5. HASHMAP DATA STRUCTURE:
 *    - Category Multi-Map: HashMap<String, List<Task>>
 *    - Priority Frequency Counter: HashMap<Priority, Integer>
 *    - Habit Calendar Check-ins: HashMap<LocalDate, Boolean>
 * 
 * 6. CLEAN APPLICATION API:
 *    - High-level methods: addTask(), toggleTaskCompletion(), sortByPriority(), getOverdueTasks().
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("       TASK & HABIT MANAGEMENT SYSTEM (JAVA OOP DEMONSTRATION)");
        System.out.println("================================================================================");

        // Instantiate manager services (OOP Service Layer)
        TaskManager taskManager = new TaskManager();
        HabitTracker habitTracker = new HabitTracker();

        // -------------------------------------------------------------------------
        // 1. SEEDING SAMPLE DATA (OOP DOMAIN MODELING & COMPOSITION)
        // -------------------------------------------------------------------------
        LocalDateTime now = LocalDateTime.now(); // Date-Time API

        // Overdue High-Priority Task (Deadline in the past by 4 hours)
        Task t1 = new Task(
                "Submit Cloud Architecture Report",
                "Complete final system diagram and reliability analysis",
                Priority.HIGH, 
                "Engineering", 
                now.minusHours(4) // Date-Time API: 4 hours in the past
        );
        taskManager.addTask(t1); // ARRAYLIST: add task

        // Upcoming Recurring High-Priority Task (Repeats every 1 day)
        RecurrenceRule dailyRule = new RecurrenceRule(RecurrenceRule.Frequency.DAILY, 1);
        Task t2 = new Task(
                "Review PRs & Code Pipeline",
                "Review open pull requests on task management repo",
                Priority.HIGH, 
                "Engineering", 
                now.plusHours(5), // Date-Time API: 5 hours in future
                dailyRule         // OOP: Composition (Task has-a RecurrenceRule)
        );
        taskManager.addTask(t2);

        // Medium Priority Task
        Task t3 = new Task(
                "Complete Data Structures Homework",
                "Implement ArrayList vs HashMap benchmarks",
                Priority.MEDIUM, 
                "Academics", 
                now.plusDays(1).withHour(18).withMinute(0)
        );
        taskManager.addTask(t3);

        // Low Priority Task
        Task t4 = new Task(
                "Schedule Weekly Sprint Retro",
                "Coordinate calendar invite with team leads",
                Priority.LOW, 
                "Operations", 
                now.plusDays(3)
        );
        taskManager.addTask(t4);

        // High Priority Task
        Task t5 = new Task(
                "Database Index Optimization",
                "Analyze query execution plan and tune B-Tree indices",
                Priority.HIGH, 
                "Engineering", 
                now.plusDays(2)
        );
        taskManager.addTask(t5);

        // -------------------------------------------------------------------------
        // SEEDING HABITS (HASHMAP & DATE-TIME STREAK TRACKING)
        // -------------------------------------------------------------------------
        Habit h1 = new Habit("Deep Work & Coding Session", "At least 90 minutes of focused problem solving", "Work", "DAILY", 5);
        // Simulate consecutive logs for the last 4 days (HASHMAP insertion via LocalDate key)
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

        // -------------------------------------------------------------------------
        // EXECUTION & DEMONSTRATION OUTPUTS
        // -------------------------------------------------------------------------

        // 1. ARRAYLIST: Standard insertion order
        printSectionHeader("1. ALL TASKS (INITIAL ORDER IN ARRAYLIST)");
        for (Task t : taskManager.getAllTasks()) {
            System.out.println("  " + t);
        }

        // 2. SORTING: Natural Order (Comparable<Task> by Deadline Ascending)
        printSectionHeader("2. SORTING DEMONSTRATION: BY DEADLINE (NATURAL ORDER ASCENDING)");
        List<Task> byDeadline = taskManager.sortByDeadline();
        for (Task t : byDeadline) {
            System.out.println("  " + t);
        }

        // 3. SORTING: Custom Comparator (Priority Weight Descending: HIGH -> MEDIUM -> LOW)
        printSectionHeader("3. SORTING DEMONSTRATION: BY PRIORITY WEIGHT (CUSTOM COMPARATOR)");
        List<Task> byPriority = taskManager.sortByPriority();
        for (Task t : byPriority) {
            System.out.println("  " + t);
        }

        // 4. SORTING: Custom Comparator (Title Alphabetical)
        printSectionHeader("4. SORTING DEMONSTRATION: BY TITLE ALPHABETICALLY");
        List<Task> byTitle = taskManager.sortByTitle();
        for (Task t : byTitle) {
            System.out.println("  " + t);
        }

        // 5. DATE-TIME API: Overdue Detection (now.isAfter(deadline))
        printSectionHeader("5. OVERDUE ALERTS (DATE-TIME API CHECK)");
        List<Task> overdue = taskManager.getOverdueTasks();
        if (overdue.isEmpty()) {
            System.out.println("  No overdue tasks currently!");
        } else {
            for (Task ot : overdue) {
                System.out.printf("  [ALERT - OVERDUE] %s (Past deadline by %d hours)%n",
                        ot.getTitle(), Math.abs(ot.getHoursRemaining()));
            }
        }

        // 6. HASHMAP: Priority Frequency Counting & Category Multi-Map
        printSectionHeader("6. HASHMAP DATA STRUCTURE METRICS & CATEGORY BREAKDOWN");
        Map<Priority, Integer> priorityMap = taskManager.getPriorityDistribution();
        System.out.println("  Priority Frequency Map (HashMap<Priority, Integer>):");
        priorityMap.forEach((p, count) -> System.out.printf("    %-8s: %d tasks%n", p, count));

        Map<String, Integer> categoryMap = taskManager.getCategoryCounts();
        System.out.println("  Category Distribution Map (HashMap<String, Integer>):");
        categoryMap.forEach((cat, count) -> System.out.printf("    %-12s: %d tasks%n", cat, count));

        // 7. HASHMAP + DATE-TIME: Habit Streak Tracking
        printSectionHeader("7. HABIT STREAK TRACKING (HASHMAP<LOCALDATE, BOOLEAN>)");
        for (Habit h : habitTracker.getAllHabits()) {
            System.out.println("  " + h);
        }

        // 8. WORKFLOW SIMULATION: Complete recurring task and verify dynamic rescheduling
        printSectionHeader("8. SIMULATING TASK COMPLETION & RECURRING SPAWN");
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
