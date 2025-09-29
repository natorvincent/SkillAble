package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Service.StudentService;
import com.team37.skillable.SkillAble.dto.StudentProfileResponse;
import com.team37.skillable.SkillAble.dto.StudentProfileUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<?> getStudentProfile(@RequestParam String email) {
        try {
            Student student = studentService.getStudentProfile(email);
            StudentProfileResponse response = StudentProfileResponse.fromEntity(student);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }
    @PostMapping("/change-password")
    public ResponseEntity<String> changeStudentPassword(
            @RequestParam String email,
            @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");

            if (newPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("New password is required");
            }

            studentService.changePassword(email, newPassword);
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/set-role")
    public ResponseEntity<String> setStudentRole(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String role = request.get("role");

            if (email == null || !role.equals("STUDENT")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid request");
            }

            // User stays in student table, no action needed except maybe updating updatedAt
            studentService.confirmStudentRole(email);
            return ResponseEntity.ok("Student role confirmed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
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