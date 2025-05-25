package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.*;
import com.team37.skillable.SkillAble.Entity.Module;
import com.team37.skillable.SkillAble.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

        int totalLessons = module.getLessons().size();
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
        moduleProgress.setCompleted(completedLessons >= totalLessons);

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
}