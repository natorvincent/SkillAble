package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.StudentProgress;
import com.team37.skillable.SkillAble.Entity.Lesson;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import com.team37.skillable.SkillAble.Repository.StudentProgressRepository;
import com.team37.skillable.SkillAble.Repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/difficulty")
@CrossOrigin(origins = "http://localhost:3000")
public class DifficultyController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private StudentProgressRepository studentProgressRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @PostMapping("/set-student-difficulty")
    public ResponseEntity<?> setStudentDifficulty(@RequestBody Map<String, Object> request) {
        try {
            int studentId = (Integer) request.get("studentId");
            int lessonId = (Integer) request.get("lessonId");
            String difficulty = (String) request.get("difficulty");

            // Validate difficulty level
            if (!isValidDifficulty(difficulty)) {
                return ResponseEntity.badRequest().body("Invalid difficulty level. Must be 'easy', 'intermediate', or 'difficult'");
            }

            Optional<Student> studentOpt = studentRepository.findById(studentId);
            Optional<Lesson> lessonOpt = lessonRepository.findById(lessonId);

            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Student not found");
            }

            if (lessonOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Lesson not found");
            }

            Student student = studentOpt.get();
            Lesson lesson = lessonOpt.get();

            // Check if progress record exists
            Optional<StudentProgress> existingProgress = studentProgressRepository
                    .findByStudentAndLesson(student, lesson);

            StudentProgress progress;
            if (existingProgress.isPresent()) {
                // Update existing progress
                progress = existingProgress.get();
                progress.setDifficulty(difficulty);
            } else {
                // Create new progress record
                progress = new StudentProgress();
                progress.setStudent(student);
                progress.setLesson(lesson);
                progress.setDifficulty(difficulty);
                progress.setMaxScore(10); // Default max score
            }

            studentProgressRepository.save(progress);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Difficulty set successfully");
            response.put("studentId", studentId);
            response.put("lessonId", lessonId);
            response.put("difficulty", difficulty);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error setting difficulty: " + e.getMessage());
        }
    }

    @GetMapping("/student-difficulty/{studentId}/{lessonId}")
    public ResponseEntity<?> getStudentDifficulty(@PathVariable int studentId, @PathVariable int lessonId) {
        try {
            Optional<Student> studentOpt = studentRepository.findById(studentId);
            Optional<Lesson> lessonOpt = lessonRepository.findById(lessonId);

            if (studentOpt.isEmpty() || lessonOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Student or lesson not found");
            }

            Optional<StudentProgress> progressOpt = studentProgressRepository
                    .findByStudentAndLesson(studentOpt.get(), lessonOpt.get());

            if (progressOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("difficulty", progressOpt.get().getDifficulty());
                response.put("studentId", studentId);
                response.put("lessonId", lessonId);
                return ResponseEntity.ok(response);
            } else {
                // Return default difficulty if no progress record exists
                Map<String, Object> response = new HashMap<>();
                response.put("difficulty", "easy");
                response.put("studentId", studentId);
                response.put("lessonId", lessonId);
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving difficulty: " + e.getMessage());
        }
    }

    @GetMapping("/student-difficulties/{studentId}")
    public ResponseEntity<?> getAllStudentDifficulties(@PathVariable int studentId) {
        try {
            Optional<Student> studentOpt = studentRepository.findById(studentId);

            if (studentOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Student not found");
            }

            List<StudentProgress> progressList = studentProgressRepository.findByStudent(studentOpt.get());

            Map<String, Object> response = new HashMap<>();
            response.put("studentId", studentId);
            response.put("difficulties", progressList.stream().map(progress -> {
                Map<String, Object> item = new HashMap<>();
                item.put("lessonId", progress.getLesson().getId());
                item.put("lessonTitle", progress.getLesson().getTitle());
                item.put("difficulty", progress.getDifficulty());
                item.put("completed", progress.isCompleted());
                item.put("score", progress.getScore());
                item.put("maxScore", progress.getMaxScore());
                return item;
            }).toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving difficulties: " + e.getMessage());
        }
    }

    private boolean isValidDifficulty(String difficulty) {
        return difficulty != null &&
                (difficulty.equals("easy") || difficulty.equals("intermediate") || difficulty.equals("difficult"));
    }
}