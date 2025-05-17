package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Service.TeacherService;
import com.team37.skillable.SkillAble.dto.TeacherProfileUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @GetMapping("/profile")
    public ResponseEntity<Teacher> getTeacherProfile(@RequestParam String email) {
        try {
            Teacher profile = teacherService.getTeacherProfile(email);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateTeacherProfile(
            @RequestBody TeacherProfileUpdateRequest request) {
        try {
            teacherService.updateTeacherProfile(request);
            return ResponseEntity.ok("Teacher profile updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Teacher not found");
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteTeacher(@RequestParam String email) {
        try {
            teacherService.deleteTeacher(email);
            return ResponseEntity.ok("Teacher deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Teacher not found");
        }
    }
}