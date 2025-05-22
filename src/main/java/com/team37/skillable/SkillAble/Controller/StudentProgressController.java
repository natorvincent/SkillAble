package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.StudentProgress;
import com.team37.skillable.SkillAble.Service.StudentProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/progress")
public class StudentProgressController {

    @Autowired
    private StudentProgressService progressService;

    @GetMapping("/student/{studentId}")
    public List<StudentProgress> getProgressByStudentId(@PathVariable int studentId) {
        return progressService.getAllProgressByStudentId(studentId);
    }

    @GetMapping("/student/{studentId}/module/{moduleId}")
    public List<StudentProgress> getProgressByStudentIdAndModuleId(
            @PathVariable int studentId,
            @PathVariable int moduleId) {
        return progressService.getProgressByStudentIdAndModuleId(studentId, moduleId);
    }

    @GetMapping("/student/{studentId}/lesson/{lessonId}")
    public ResponseEntity<StudentProgress> getProgressByStudentIdAndLessonId(
            @PathVariable int studentId,
            @PathVariable int lessonId) {
        return progressService.getProgressByStudentIdAndLessonId(studentId, lessonId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/student/{studentId}/lesson/{lessonId}")
    public StudentProgress saveProgress(
            @PathVariable int studentId,
            @PathVariable int lessonId,
            @RequestBody StudentProgress progress) {
        return progressService.saveOrUpdateProgress(studentId, lessonId, progress);
    }

    @GetMapping("/stats/student/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentProgressStats(@PathVariable int studentId) {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalCompletedLessons", progressService.getCompletedLessonsCount(studentId));
        stats.put("totalStars", progressService.getTotalStars(studentId));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/student/{studentId}/module/{moduleId}")
    public ResponseEntity<Map<String, Object>> getStudentModuleProgressStats(
            @PathVariable int studentId,
            @PathVariable int moduleId) {
        Map<String, Object> stats = new HashMap<>();

        stats.put("completedLessons", progressService.getCompletedLessonsCountByModule(studentId, moduleId));
        stats.put("totalStars", progressService.getTotalStarsByModule(studentId, moduleId));
        stats.put("averageScore", progressService.getAverageScoreByModule(studentId, moduleId));

        return ResponseEntity.ok(stats);
    }
}
