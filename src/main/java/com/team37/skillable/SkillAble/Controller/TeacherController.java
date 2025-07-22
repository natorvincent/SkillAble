package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Service.TeacherService;
import com.team37.skillable.SkillAble.dto.EnrollStudentRequest;
import com.team37.skillable.SkillAble.dto.TeacherProfileResponse;
import com.team37.skillable.SkillAble.dto.TeacherProfileUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin(origins = "*")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    @GetMapping("/profile")
    public ResponseEntity<?> getTeacherProfile(@RequestParam String email) {
        try {
            Teacher teacher = teacherService.getTeacherProfile(email);
            TeacherProfileResponse response = TeacherProfileResponse.fromEntity(teacher);
            return ResponseEntity.ok(response);
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


    @PostMapping("/change-password")
    public ResponseEntity<String> changeTeacherPassword(
            @RequestParam String email,
            @RequestBody Map<String, String> request) {
        try {
            String newPassword = request.get("newPassword");

            if (newPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("New password is required");
            }

            teacherService.changePassword(email, newPassword);
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
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

    @GetMapping("/students")
    public ResponseEntity<List<Student>> getTeacherStudents(@RequestParam String email) {
        try {
            List<Student> students = teacherService.getTeacherStudents(email);
            return ResponseEntity.ok(students);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    @GetMapping("/all-students")
    public ResponseEntity<List<Student>> getAllStudents() {
        try {
            List<Student> students = teacherService.getAllStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/search-students")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam(required = false) String searchTerm) {
        try {
            List<Student> students = teacherService.searchStudents(searchTerm);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @GetMapping("/unassigned-students")
    public ResponseEntity<List<Student>> getUnassignedStudents() {
        try {
            List<Student> students = teacherService.getUnassignedStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @PostMapping("/assign-student")
    public ResponseEntity<String> assignStudentToTeacher(@RequestBody Map<String, String> request) {
        try {
            String teacherEmail = request.get("teacherEmail");
            String studentEmail = request.get("studentEmail");

            if (teacherEmail == null || studentEmail == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Teacher email and student email are required");
            }

            teacherService.assignStudentToTeacher(teacherEmail, studentEmail);
            return ResponseEntity.ok("Student assigned successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/unassign-student")
    public ResponseEntity<String> unassignStudentFromTeacher(@RequestBody Map<String, String> request) {
        try {
            String teacherEmail = request.get("teacherEmail");
            String studentEmail = request.get("studentEmail");

            if (teacherEmail == null || studentEmail == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Teacher email and student email are required");
            }

            teacherService.unassignStudentFromTeacher(teacherEmail, studentEmail);
            return ResponseEntity.ok("Student unassigned successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(e.getMessage());
        }
    }
}