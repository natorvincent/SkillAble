package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Lesson;
import com.team37.skillable.SkillAble.Entity.Module;
import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.StudentProgress;
import com.team37.skillable.SkillAble.Repository.LessonRepository;
import com.team37.skillable.SkillAble.Repository.StudentProgressRepository;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentProgressService {

    @Autowired
    private StudentProgressRepository studentProgressRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ModuleProgressService moduleProgressService;

    public List<StudentProgress> getAllProgressByStudentId(int studentId) {
        return studentProgressRepository.findByStudentId(studentId);
    }

    public List<StudentProgress> getProgressByStudentIdAndModuleId(int studentId, int moduleId) {
        return studentProgressRepository.findByStudentIdAndLessonModuleId(studentId, moduleId);
    }

    public Optional<StudentProgress> getProgressByStudentIdAndLessonId(int studentId, int lessonId) {
        return studentProgressRepository.findByStudentIdAndLessonId(studentId, lessonId);
    }

    public StudentProgress saveOrUpdateProgress(int studentId, int lessonId, StudentProgress progress) {
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        Optional<Lesson> lessonOpt = lessonRepository.findById(lessonId);

        if (studentOpt.isEmpty() || lessonOpt.isEmpty()) {
            throw new RuntimeException("Student or Lesson not found");
        }

        Student student = studentOpt.get();
        Lesson lesson = lessonOpt.get();
        Module module = lesson.getModule();

        // Check if progress already exists
        Optional<StudentProgress> existingProgressOpt =
                studentProgressRepository.findByStudentIdAndLessonId(studentId, lessonId);

        StudentProgress studentProgress;

        if (existingProgressOpt.isPresent()) {
            // Update existing progress
            studentProgress = existingProgressOpt.get();
            studentProgress.setScore(progress.getScore());
            studentProgress.setMaxScore(progress.getMaxScore());
            studentProgress.setCompleted(progress.isCompleted());
            studentProgress.setStarsEarned(progress.getStarsEarned());
        } else {
            // Create new progress
            studentProgress = new StudentProgress();
            studentProgress.setStudent(student);
            studentProgress.setLesson(lesson);
            studentProgress.setScore(progress.getScore());
            studentProgress.setMaxScore(progress.getMaxScore());
            studentProgress.setCompleted(progress.isCompleted());
            studentProgress.setStarsEarned(progress.getStarsEarned());
        }

        // Save student progress
        StudentProgress savedProgress = studentProgressRepository.save(studentProgress);

        // Update module progress if lesson is completed
        if (progress.isCompleted()) {
            moduleProgressService.updateModuleProgress(studentId, module.getId());
        }

        return savedProgress;
    }

    public long getCompletedLessonsCount(int studentId) {
        return studentProgressRepository.countCompletedLessonsByStudentId(studentId);
    }

    public long getCompletedLessonsCountByModule(int studentId, int moduleId) {
        return studentProgressRepository.countCompletedLessonsByStudentIdAndModuleId(studentId, moduleId);
    }

    public Integer getTotalStars(int studentId) {
        Integer totalStars = studentProgressRepository.getTotalStarsByStudentId(studentId);
        return totalStars != null ? totalStars : 0;
    }

    public Integer getTotalStarsByModule(int studentId, int moduleId) {
        Integer totalStars = studentProgressRepository.getTotalStarsByStudentIdAndModuleId(studentId, moduleId);
        return totalStars != null ? totalStars : 0;
    }

    public Double getAverageScoreByModule(int studentId, int moduleId) {
        Double averageScore = studentProgressRepository.getAverageScoreByStudentIdAndModuleId(studentId, moduleId);
        return averageScore != null ? averageScore : 0.0;
    }
}