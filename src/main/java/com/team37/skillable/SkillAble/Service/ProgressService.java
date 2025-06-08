package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.*;
import com.team37.skillable.SkillAble.Entity.Module;
import com.team37.skillable.SkillAble.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProgressService {

    @Autowired
    private StudentProgressRepository studentProgressRepository;

    @Autowired
    private ModuleProgressRepository moduleProgressRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Transactional
    public StudentProgress saveStudentLessonProgress(int studentId, int lessonId, int score, int maxScore, boolean completed, int starsEarned) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Optional<StudentProgress> existingProgress = studentProgressRepository.findByStudentIdAndLessonId(studentId, lessonId);

        StudentProgress progress;
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
            // Update with new score and stars earned
            progress.setScore(score);
            // Always update stars earned - use the new value instead of max
            progress.setStarsEarned(starsEarned);
        } else {
            progress = new StudentProgress();
            progress.setStudent(student);
            progress.setLesson(lesson);
            progress.setScore(score);
            progress.setStarsEarned(starsEarned);
        }

        progress.setMaxScore(maxScore);
        progress.setCompleted(completed);

        StudentProgress savedProgress = studentProgressRepository.save(progress);

        // Update module progress after saving lesson progress
        updateModuleProgress(studentId, lesson.getModule().getId());

        return savedProgress;
    }

    @Transactional
    public void updateModuleProgress(int studentId, int moduleId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found"));

        // Get all lesson progresses for this student and module
        List<StudentProgress> lessonProgresses = studentProgressRepository.findByStudentIdAndModuleId(studentId, moduleId);

        int totalLessons = module.getLessons() != null ? module.getLessons().size() : 0;
        int completedLessons = (int) lessonProgresses.stream().filter(StudentProgress::isCompleted).count();

        // Calculate total stars by summing all stars earned from lesson progresses
        int totalStars = lessonProgresses.stream().mapToInt(StudentProgress::getStarsEarned).sum();

        // Calculate average score from completed lessons only
        double averageScore = lessonProgresses.stream()
                .filter(StudentProgress::isCompleted)
                .mapToDouble(p -> (double) p.getScore() / p.getMaxScore() * 100)
                .average()
                .orElse(0.0);

        Optional<ModuleProgress> existingModuleProgress = moduleProgressRepository.findByStudentIdAndModuleId(studentId, moduleId);

        ModuleProgress moduleProgress;
        if (existingModuleProgress.isPresent()) {
            moduleProgress = existingModuleProgress.get();
        } else {
            moduleProgress = new ModuleProgress();
            moduleProgress.setStudent(student);
            moduleProgress.setModule(module);
        }

        // Update all module progress fields
        moduleProgress.setCompletedLessons(completedLessons);
        moduleProgress.setTotalLessons(totalLessons);
        moduleProgress.setTotalStars(totalStars); // This will now reflect current total
        moduleProgress.setAverageScore(averageScore);
        moduleProgress.setCompleted(completedLessons >= totalLessons && totalLessons > 0);

        moduleProgressRepository.save(moduleProgress);
    }

    public Optional<StudentProgress> getStudentLessonProgress(int studentId, int lessonId) {
        return studentProgressRepository.findByStudentIdAndLessonId(studentId, lessonId);
    }

    public Optional<ModuleProgress> getStudentModuleProgress(int studentId, int moduleId) {
        return moduleProgressRepository.findByStudentIdAndModuleId(studentId, moduleId);
    }

    public List<StudentProgress> getStudentLessonProgresses(int studentId) {
        return studentProgressRepository.findByStudentId(studentId);
    }

    public List<ModuleProgress> getStudentModuleProgresses(int studentId) {
        return moduleProgressRepository.findByStudentId(studentId);
    }

    // FIXED: User-specific progress calculation
    public Map<String, Object> getStudentModuleProgressStats(Long studentId, int moduleId) {
        Map<String, Object> stats = new HashMap<>();

        try {
            System.out.println("Calculating progress stats for SPECIFIC student: " + studentId); // Debug log

            // Convert Long to int for comparison
            int targetStudentId = studentId.intValue();

            // IMPORTANT: Only get module progresses for THIS specific student
            List<ModuleProgress> moduleProgresses = moduleProgressRepository.findByStudentId(targetStudentId);

            System.out.println("Found " + moduleProgresses.size() + " module progresses for student " + studentId); // Debug log

            // Initialize counters
            int totalCompletedLessons = 0;
            int totalStars = 0;
            int completedModules = 0;
            int totalLessons = 0;

            // Safely calculate totals FOR THIS STUDENT ONLY
            for (ModuleProgress moduleProgress : moduleProgresses) {
                if (moduleProgress != null && moduleProgress.getStudent() != null) {
                    // FIXED: Proper comparison using intValue()
                    int moduleStudentId = moduleProgress.getStudent().getId();
                    if (moduleStudentId == targetStudentId) {
                        System.out.println("Processing module " + moduleProgress.getModule().getId() +
                                " for student " + studentId +
                                " - Completed Lessons: " + moduleProgress.getCompletedLessons() +
                                " - Total Stars: " + moduleProgress.getTotalStars()); // Debug log

                        totalCompletedLessons += moduleProgress.getCompletedLessons();
                        totalStars += moduleProgress.getTotalStars();
                        totalLessons += moduleProgress.getTotalLessons();

                        // Check if module is completed
                        if (moduleProgress.isCompleted()) {
                            completedModules++;
                        }
                    } else {
                        System.out.println("Skipping module progress for different student: " + moduleStudentId + " (looking for " + targetStudentId + ")");
                    }
                }
            }

            // Also get lesson progresses for this specific student
            List<StudentProgress> lessonProgresses = studentProgressRepository.findByStudentId(targetStudentId);

            System.out.println("Found " + lessonProgresses.size() + " lesson progresses for student " + studentId); // Debug log

            // Verify lesson count by counting actual completed lessons for this student
            int actualCompletedLessons = 0;
            int actualTotalStars = 0;

            for (StudentProgress lessonProgress : lessonProgresses) {
                if (lessonProgress != null && lessonProgress.getStudent() != null) {
                    // FIXED: Proper comparison using intValue()
                    int lessonStudentId = lessonProgress.getStudent().getId();
                    if (lessonStudentId == targetStudentId) {
                        if (lessonProgress.isCompleted()) {
                            actualCompletedLessons++;
                        }
                        actualTotalStars += lessonProgress.getStarsEarned();
                    } else {
                        System.out.println("Skipping lesson progress for different student: " + lessonStudentId + " (looking for " + targetStudentId + ")");
                    }
                }
            }

            // Use the actual lesson data if it's different from module summary
            if (actualCompletedLessons != totalCompletedLessons) {
                System.out.println("Using actual lesson count: " + actualCompletedLessons + " instead of module summary: " + totalCompletedLessons);
                totalCompletedLessons = actualCompletedLessons;
            }

            if (actualTotalStars != totalStars) {
                System.out.println("Using actual star count: " + actualTotalStars + " instead of module summary: " + totalStars);
                totalStars = actualTotalStars;
            }

            // Calculate overall progress percentage
            double totalProgress = totalLessons > 0 ? (double) totalCompletedLessons / totalLessons * 100 : 0.0;

            // For now, set currentStreak to 0 - you can implement streak calculation later
            int currentStreak = 0;

            // Ensure no null values are returned
            stats.put("completedLessons", totalCompletedLessons);
            stats.put("totalStars", totalStars);
            stats.put("completedModules", completedModules);
            stats.put("currentStreak", currentStreak);
            stats.put("totalProgress", totalProgress);

            System.out.println("FINAL Progress Stats for student " + studentId +
                    " - Completed Modules: " + completedModules +
                    ", Total Stars: " + totalStars +
                    ", Completed Lessons: " + totalCompletedLessons); // Debug log

        } catch (Exception e) {
            System.err.println("Error calculating progress stats for student " + studentId + ": " + e.getMessage());
            e.printStackTrace();

            // Return safe default values if there's an error
            stats.put("completedLessons", 0);
            stats.put("totalStars", 0);
            stats.put("completedModules", 0);
            stats.put("currentStreak", 0);
            stats.put("totalProgress", 0.0);
        }

        return stats;
    }

    // Additional method to recalculate module progress for debugging
    @Transactional
    public void recalculateModuleProgress(int studentId, int moduleId) {
        System.out.println("Recalculating module progress for student: " + studentId + ", module: " + moduleId);

        List<StudentProgress> lessonProgresses = studentProgressRepository.findByStudentIdAndModuleId(studentId, moduleId);

        System.out.println("Found " + lessonProgresses.size() + " lesson progresses");

        int totalStars = 0;
        for (StudentProgress progress : lessonProgresses) {
            System.out.println("Lesson " + progress.getLesson().getId() + ": " + progress.getStarsEarned() + " stars");
            totalStars += progress.getStarsEarned();
        }

        System.out.println("Total stars calculated: " + totalStars);

        updateModuleProgress(studentId, moduleId);
    }

    // NEW METHOD: Get detailed progress stats for debugging
    public Map<String, Object> getDetailedProgressStats(Long studentId) {
        Map<String, Object> stats = new HashMap<>();

        try {
            int targetStudentId = studentId.intValue();
            List<ModuleProgress> moduleProgresses = moduleProgressRepository.findByStudentId(targetStudentId);
            List<StudentProgress> lessonProgresses = studentProgressRepository.findByStudentId(targetStudentId);

            stats.put("studentId", targetStudentId);
            stats.put("moduleProgressCount", moduleProgresses.size());
            stats.put("lessonProgressCount", lessonProgresses.size());
            stats.put("moduleProgresses", moduleProgresses);
            stats.put("lessonProgresses", lessonProgresses);

            // Add student validation info
            stats.put("moduleProgressStudentIds", moduleProgresses.stream()
                    .map(mp -> mp.getStudent().getId())
                    .distinct()
                    .toList());
            stats.put("lessonProgressStudentIds", lessonProgresses.stream()
                    .map(lp -> lp.getStudent().getId())
                    .distinct()
                    .toList());

        } catch (Exception e) {
            System.err.println("Error getting detailed progress stats: " + e.getMessage());
            stats.put("error", e.getMessage());
        }

        return stats;
    }

    // NEW METHOD: Validate student data separation
    public Map<String, Object> validateStudentDataSeparation(Long studentId) {
        Map<String, Object> validation = new HashMap<>();

        try {
            int targetStudentId = studentId.intValue();

            // Check if data is properly separated
            List<ModuleProgress> allModuleProgress = moduleProgressRepository.findAll();
            List<StudentProgress> allLessonProgress = studentProgressRepository.findAll();

            long moduleProgressForThisStudent = allModuleProgress.stream()
                    .filter(mp -> mp.getStudent().getId() == targetStudentId)
                    .count();

            long lessonProgressForThisStudent = allLessonProgress.stream()
                    .filter(lp -> lp.getStudent().getId() == targetStudentId)
                    .count();

            validation.put("targetStudentId", targetStudentId);
            validation.put("totalModuleProgressRecords", allModuleProgress.size());
            validation.put("totalLessonProgressRecords", allLessonProgress.size());
            validation.put("moduleProgressForThisStudent", moduleProgressForThisStudent);
            validation.put("lessonProgressForThisStudent", lessonProgressForThisStudent);

            // Check for data contamination
            boolean hasDataContamination = allModuleProgress.stream()
                    .anyMatch(mp -> mp.getStudent().getId() != targetStudentId);

            validation.put("hasDataFromOtherStudents", hasDataContamination);

        } catch (Exception e) {
            validation.put("error", e.getMessage());
        }

        return validation;
    }
}