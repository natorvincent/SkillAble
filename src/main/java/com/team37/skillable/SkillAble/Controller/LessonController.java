package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Lesson;
import com.team37.skillable.SkillAble.Entity.Module;
import com.team37.skillable.SkillAble.dto.LessonDTO;
import com.team37.skillable.SkillAble.Service.LessonService;
import com.team37.skillable.SkillAble.Service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    @Autowired
    private LessonService lessonService;

    @Autowired
    private ModuleService moduleService;

    @GetMapping
    public List<LessonDTO> getAllLessons() {
        List<Lesson> lessons = lessonService.getAllLessons();
        return lessons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/module/{moduleId}")
    public List<LessonDTO> getLessonsByModuleId(@PathVariable int moduleId) {
        List<Lesson> lessons = lessonService.getLessonsByModuleId(moduleId);
        return lessons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/module/{moduleId}/level/{level}")
    public List<LessonDTO> getLessonsByModuleIdAndLevel(@PathVariable int moduleId, @PathVariable int level) {
        List<Lesson> lessons = lessonService.getLessonsByModuleIdAndLevel(moduleId, level);
        return lessons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LessonDTO> getLessonById(@PathVariable int id) {
        return lessonService.getLessonById(id)
                .map(lesson -> ResponseEntity.ok(convertToDTO(lesson)))
                .orElse(ResponseEntity.notFound().build());
    }

    // NEW ENDPOINT for activity-based queries
    @GetMapping("/activity/{activity}")
    public List<LessonDTO> getLessonsByActivity(@PathVariable String activity) {
        List<Lesson> lessons = lessonService.getLessonsByActivity(activity);
        return lessons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // NEW ENDPOINT for interactive lessons
    @GetMapping("/interactive")
    public List<LessonDTO> getInteractiveLessons() {
        List<Lesson> lessons = lessonService.getInteractiveLessons();
        return lessons.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<LessonDTO> createLesson(@RequestBody Lesson lesson) {
        try {
            // Ensure the module exists and is properly set
            if (lesson.getModule() != null && lesson.getModule().getId() > 0) {
                Module module = moduleService.getModuleById(lesson.getModule().getId())
                        .orElseThrow(() -> new RuntimeException("Module not found"));
                lesson.setModule(module);
            }

            Lesson savedLesson = lessonService.saveLesson(lesson);
            return ResponseEntity.ok(convertToDTO(savedLesson));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LessonDTO> updateLesson(@PathVariable int id, @RequestBody Lesson lesson) {
        return lessonService.getLessonById(id)
                .map(existingLesson -> {
                    try {
                        lesson.setId(id);

                        // Ensure the module exists and is properly set
                        if (lesson.getModule() != null && lesson.getModule().getId() > 0) {
                            Module module = moduleService.getModuleById(lesson.getModule().getId())
                                    .orElseThrow(() -> new RuntimeException("Module not found"));
                            lesson.setModule(module);
                        }

                        Lesson updatedLesson = lessonService.saveLesson(lesson);
                        return ResponseEntity.ok(convertToDTO(updatedLesson));
                    } catch (Exception e) {
                        return ResponseEntity.badRequest().<LessonDTO>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable int id) {
        return lessonService.getLessonById(id)
                .map(lesson -> {
                    lessonService.deleteLesson(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private LessonDTO convertToDTO(Lesson lesson) {
        return new LessonDTO(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getDescription(),
                lesson.getLevel(),
                lesson.getDisplayOrder(),
                lesson.isActive(),
                lesson.getType(),
                lesson.getActivity(),
                lesson.getActivityPath(),
                lesson.getCreatedAt(),
                lesson.getUpdatedAt(),
                lesson.getModule() != null ? lesson.getModule().getId() : 0,
                lesson.getModule() != null ? lesson.getModule().getName() : "Unknown Module"
        );
    }
}