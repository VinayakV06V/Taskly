# Task & Habit Management System (Java OOP Architecture)

A Java Object-Oriented system adhering to the syllabus specifications:
- **OOP Modeling**: `Task`, `Habit`, `Priority`, and `RecurrenceRule` domain entities with encapsulation and immutability where appropriate.
- **ArrayList**: In-memory collections managing dynamic additions, removals, and sublists.
- **HashMap**: Category indexing (`HashMap<String, List<Task>>`), habit date completion histories (`HashMap<LocalDate, Boolean>`), and priority counts (`HashMap<Priority, Integer>`).
- **Sorting**: Comparator implementations for sorting tasks by Deadline, Priority weight, and Title.
- **Date-Time API**: Modern `java.time` (`LocalDateTime`, `LocalDate`, `Duration`) for overdue alerts and streak calculations.

## How to Run Locally

### Prerequisites
- Java JDK 11 or higher (OpenJDK, Oracle JDK, Temurin, or Amazon Corretto).
- Terminal / Command Prompt / PowerShell.

### Step 1: Navigate to the Java folder
```bash
cd java-app
```

### Step 2: Compile the Java source files
```bash
javac *.java
```

### Step 3: Execute the Main demonstration
```bash
java Main
```

### Expected Output
The program executes all syllabus test cases:
1. Seeds sample tasks with Priorities (HIGH, MEDIUM, LOW) and Recurrence.
2. Demonstrates sorting tasks by Deadline and Priority.
3. Evaluates overdue tasks using `java.time.LocalDateTime`.
4. Outputs HashMap frequency tables for Categories and Priorities.
5. Calculates habit streaks with `java.time.LocalDate`.
6. Spawns next recurring task upon completion.
