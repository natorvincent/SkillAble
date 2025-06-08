package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.ModuleProgress;
import com.team37.skillable.SkillAble.Entity.StudentProgress;
import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Service.ProgressService;
import com.team37.skillable.SkillAble.Service.TeacherService;
import com.team37.skillable.SkillAble.dto.ModuleProgressDTO;
import com.team37.skillable.SkillAble.dto.StudentProgressDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "*")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @Autowired
    private TeacherService teacherService;

    @PostMapping("/lesson")
    public ResponseEntity<StudentProgressDTO> saveStudentLessonProgress(@RequestBody Map<String, Object> request) {
        try {
            int studentId = Integer.parseInt(request.get("studentId").toString());
            int lessonId = Integer.parseInt(request.get("lessonId").toString());
            int score = Integer.parseInt(request.get("score").toString());
            int maxScore = Integer.parseInt(request.get("maxScore").toString());
            boolean completed = Boolean.parseBoolean(request.get("completed").toString());
            int starsEarned = Integer.parseInt(request.get("starsEarned").toString());

            StudentProgress progress = progressService.saveStudentLessonProgress(
                    studentId, lessonId, score, maxScore, completed, starsEarned);

            return ResponseEntity.ok(convertToStudentProgressDTO(progress));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/lesson/{studentId}/{lessonId}")
    public ResponseEntity<StudentProgressDTO> getStudentLessonProgress(
            @PathVariable int studentId,
            @PathVariable int lessonId) {

        return progressService.getStudentLessonProgress(studentId, lessonId)
                .map(progress -> ResponseEntity.ok(convertToStudentProgressDTO(progress)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/module/{studentId}/{moduleId}")
    public ResponseEntity<ModuleProgressDTO> getStudentModuleProgress(
            @PathVariable int studentId,
            @PathVariable int moduleId) {

        return progressService.getStudentModuleProgress(studentId, moduleId)
                .map(progress -> ResponseEntity.ok(convertToModuleProgressDTO(progress)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}/lessons")
    public ResponseEntity<List<StudentProgressDTO>> getStudentLessonProgresses(@PathVariable int studentId) {
        List<StudentProgress> progresses = progressService.getStudentLessonProgresses(studentId);
        List<StudentProgressDTO> dtos = progresses.stream()
                .map(this::convertToStudentProgressDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/student/{studentId}/modules")
    public ResponseEntity<List<ModuleProgressDTO>> getStudentModuleProgresses(@PathVariable int studentId) {
        List<ModuleProgress> progresses = progressService.getStudentModuleProgresses(studentId);
        List<ModuleProgressDTO> dtos = progresses.stream()
                .map(this::convertToModuleProgressDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/teacher/{teacherEmail}/students-progress")
    public ResponseEntity<List<Map<String, Object>>> getTeacherStudentsProgress(@PathVariable String teacherEmail) {
        try {
            List<Student> students = teacherService.getTeacherStudents(teacherEmail);
            List<Map<String, Object>> studentsWithProgress = students.stream()
                    .map(student -> {
                        List<ModuleProgress> moduleProgresses = progressService.getStudentModuleProgresses(student.getId());

                        Map<String, Object> studentData = Map.of(
                                "id", student.getId(),
                                "firstName", student.getFirstName() != null ? student.getFirstName() : "",
                                "lastName", student.getLastName() != null ? student.getLastName() : "",
                                "email", student.getEmail(),
                                "moduleProgresses", moduleProgresses.stream()
                                        .map(this::convertToModuleProgressDTO)
                                        .collect(Collectors.toList())
                        );
                        return studentData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(studentsWithProgress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/teacher/{teacherEmail}/student/{studentId}/detailed")
    public ResponseEntity<Map<String, Object>> getDetailedStudentProgress(
            @PathVariable String teacherEmail,
            @PathVariable int studentId) {
        try {
            List<Student> teacherStudents = teacherService.getTeacherStudents(teacherEmail);
            boolean isTeacherStudent = teacherStudents.stream()
                    .anyMatch(student -> student.getId() == studentId);

            if (!isTeacherStudent) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Student student = teacherStudents.stream()
                    .filter(s -> s.getId() == studentId)
                    .findFirst()
                    .orElse(null);

            if (student == null) {
                return ResponseEntity.notFound().build();
            }

            List<ModuleProgress> moduleProgresses = progressService.getStudentModuleProgresses(studentId);
            List<StudentProgress> lessonProgresses = progressService.getStudentLessonProgresses(studentId);

            Map<String, Object> detailedProgress = Map.of(
                    "student", Map.of(
                            "id", student.getId(),
                            "firstName", student.getFirstName() != null ? student.getFirstName() : "",
                            "lastName", student.getLastName() != null ? student.getLastName() : "",
                            "email", student.getEmail()
                    ),
                    "moduleProgresses", moduleProgresses.stream()
                            .map(this::convertToModuleProgressDTO)
                            .collect(Collectors.toList()),
                    "lessonProgresses", lessonProgresses.stream()
                            .map(this::convertToStudentProgressDTO)
                            .collect(Collectors.toList())
            );

            return ResponseEntity.ok(detailedProgress);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/teacher/{teacherEmail}/completion-rate")
    public ResponseEntity<Map<String, Object>> getTeacherCompletionRate(@PathVariable String teacherEmail) {
        try {
            List<Student> students = teacherService.getTeacherStudents(teacherEmail);

            if (students.isEmpty()) {
                return ResponseEntity.ok(Map.of("averageCompletionRate", 0.0));
            }

            double totalCompletionRate = 0.0;
            int studentsWithProgress = 0;

            for (Student student : students) {
                List<ModuleProgress> moduleProgresses = progressService.getStudentModuleProgresses(student.getId());

                if (!moduleProgresses.isEmpty()) {
                    int totalCompleted = moduleProgresses.stream()
                            .mapToInt(ModuleProgress::getCompletedLessons)
                            .sum();
                    int totalLessons = moduleProgresses.stream()
                            .mapToInt(ModuleProgress::getTotalLessons)
                            .sum();

                    if (totalLessons > 0) {
                        double studentCompletionRate = (double) totalCompleted / totalLessons * 100;
                        totalCompletionRate += studentCompletionRate;
                        studentsWithProgress++;
                    }
                }
            }

            double averageCompletionRate = studentsWithProgress > 0 ? totalCompletionRate / studentsWithProgress : 0.0;

            return ResponseEntity.ok(Map.of(
                    "averageCompletionRate", Math.round(averageCompletionRate * 100.0) / 100.0,
                    "studentsWithProgress", studentsWithProgress,
                    "totalStudents", students.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private StudentProgressDTO convertToStudentProgressDTO(StudentProgress progress) {
        return new StudentProgressDTO(
                progress.getId(),
                progress.getStudent().getId(),
                progress.getLesson().getId(),
                progress.getLesson().getTitle(),
                progress.getScore(),
                progress.getMaxScore(),
                progress.isCompleted(),
                progress.getStarsEarned(),
                progress.getCompletedAt(),
                progress.getCreatedAt(),
                progress.getUpdatedAt()
        );
    }

    private ModuleProgressDTO convertToModuleProgressDTO(ModuleProgress progress) {
        return new ModuleProgressDTO(
                progress.getId(),
                progress.getStudent().getId(),
                progress.getModule().getId(),
                progress.getModule().getName(),
                progress.getCompletedLessons(),
                progress.getTotalLessons(),
                progress.getTotalStars(),
                progress.getAverageScore(),
                progress.isCompleted(),
                progress.getCompletedAt(),
                progress.getCreatedAt(),
                progress.getUpdatedAt()
        );
    }
}