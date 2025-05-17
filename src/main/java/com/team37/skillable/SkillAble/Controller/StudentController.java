package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Service.StudentService;
import com.team37.skillable.SkillAble.dto.StudentProfileUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<Student> getStudentProfile(@RequestParam String email) {
        try {
            Student profile = studentService.getStudentProfile(email);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    @PostMapping("/update")
    public ResponseEntity<String> updateStudentProfile(
            @RequestBody StudentProfileUpdateRequest request) {
        try {
            studentService.updateStudentProfile(request);
            return ResponseEntity.ok("Student profile updated successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteStudent(@RequestParam String email) {
        try {
            studentService.deleteStudent(email);
            return ResponseEntity.ok("Student deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student not found");
        }
    }
}