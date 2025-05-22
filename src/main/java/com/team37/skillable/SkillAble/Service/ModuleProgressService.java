package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.ModuleProgress;
import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Module;
import com.team37.skillable.SkillAble.Repository.ModuleProgressRepository;
import com.team37.skillable.SkillAble.Repository.ModuleRepository;
import com.team37.skillable.SkillAble.Repository.StudentProgressRepository;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ModuleProgressService {

    @Autowired
    private ModuleProgressRepository moduleProgressRepository;

    @Autowired
    private StudentProgressRepository studentProgressRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    public List<ModuleProgress> getAllProgressByStudentId(int studentId) {
        return moduleProgressRepository.findByStudentId(studentId);
    }

    public Optional<ModuleProgress> getProgressByStudentIdAndModuleId(int studentId, int moduleId) {
        return moduleProgressRepository.findByStudentIdAndModuleId(studentId, moduleId);
    }

    @Transactional
    public ModuleProgress updateModuleProgress(int studentId, int moduleId) {
        System.out.println("=== Starting updateModuleProgress ===");
        System.out.println("StudentId: " + studentId + ", ModuleId: " + moduleId);

        Optional<Student> studentOpt = studentRepository.findById(studentId);
        Optional<Module> moduleOpt = moduleRepository.findById(moduleId);

        if (studentOpt.isEmpty()) {
            System.out.println("ERROR: Student not found with ID: " + studentId);
            throw new RuntimeException("Student not found with ID: " + studentId);
        }

        if (moduleOpt.isEmpty()) {
            System.out.println("ERROR: Module not found with ID: " + moduleId);
            throw new RuntimeException("Module not found with ID: " + moduleId);
        }

        Student student = studentOpt.get();
        Module module = moduleOpt.get();
        int totalLessons = module.getLessons().size();

        System.out.println("Total lessons in module: " + totalLessons);

        // Get completed lessons count
        long completedLessons = studentProgressRepository.countCompletedLessonsByStudentIdAndModuleId(studentId, moduleId);
        System.out.println("Completed lessons: " + completedLessons);

        // Get total stars for this module
        Integer totalStars = studentProgressRepository.getTotalStarsByStudentIdAndModuleId(studentId, moduleId);
        if (totalStars == null) totalStars = 0;
        System.out.println("Total stars: " + totalStars);

        // Get average score for this module
        Double averageScore = studentProgressRepository.getAverageScoreByStudentIdAndModuleId(studentId, moduleId);
        if (averageScore == null) averageScore = 0.0;
        System.out.println("Average score: " + averageScore);

        // Calculate if module is completed
        boolean isCompleted = completedLessons >= totalLessons && totalLessons > 0;
        System.out.println("Module completed: " + isCompleted);

        // Check if module progress exists
        Optional<ModuleProgress> existingProgressOpt =
                moduleProgressRepository.findByStudentIdAndModuleId(studentId, moduleId);

        ModuleProgress moduleProgress;

        if (existingProgressOpt.isPresent()) {
            // Update existing progress
            System.out.println("Updating existing module progress");
            moduleProgress = existingProgressOpt.get();
            moduleProgress.setCompletedLessons((int) completedLessons);
            moduleProgress.setTotalLessons(totalLessons);
            moduleProgress.setCompleted(isCompleted);
            moduleProgress.setAverageScore(averageScore);
            moduleProgress.setTotalStars(totalStars);
        } else {
            // Create new progress
            System.out.println("Creating new module progress");
            moduleProgress = new ModuleProgress();
            moduleProgress.setStudent(student);
            moduleProgress.setModule(module);
            moduleProgress.setCompletedLessons((int) completedLessons);
            moduleProgress.setTotalLessons(totalLessons);
            moduleProgress.setCompleted(isCompleted);
            moduleProgress.setAverageScore(averageScore);
            moduleProgress.setTotalStars(totalStars);
        }

        ModuleProgress savedProgress = moduleProgressRepository.save(moduleProgress);
        System.out.println("Module progress saved successfully with ID: " + savedProgress.getId());
        System.out.println("=== End updateModuleProgress ===");

        return savedProgress;
    }

    public long getCompletedModulesCount(int studentId) {
        return moduleProgressRepository.countCompletedModulesByStudentId(studentId);
    }

    public Integer getTotalStars(int studentId) {
        Integer totalStars = moduleProgressRepository.getTotalStarsByStudentId(studentId);
        return totalStars != null ? totalStars : 0;
    }
}