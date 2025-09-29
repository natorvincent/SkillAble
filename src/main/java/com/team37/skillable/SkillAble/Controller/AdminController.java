package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Admin;
import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.AdminRepository;
import com.team37.skillable.SkillAble.Service.StudentService;
import com.team37.skillable.SkillAble.Service.TeacherService;
import com.team37.skillable.SkillAble.dto.PromoteToTeacherRequest;
import com.team37.skillable.SkillAble.dto.DemoteToStudentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private AdminRepository adminRepository;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getAdminProfile(@RequestParam String email) {
        try {
            Optional<Admin> admin = adminRepository.findByEmail(email);

            if (admin.isPresent()) {
                Map<String, Object> profile = new HashMap<>();
                Admin adminUser = admin.get();

                profile.put("id", adminUser.getId());
                profile.put("email", adminUser.getEmail());
                profile.put("firstName", "Admin");  // Always "Admin"
                profile.put("lastName", "");        // Empty or you can use "User"
                profile.put("role", "ADMIN");

                return ResponseEntity.ok(profile);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }


    @GetMapping("/students")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/students/non-teachers")
    public ResponseEntity<List<Student>> getStudentsNotTeachers() {
        return ResponseEntity.ok(studentService.getStudentsNotTeachers());
    }

    @PostMapping("/promote-to-teacher")
    public ResponseEntity<String> promoteToTeacher(@RequestBody PromoteToTeacherRequest request) {
        String result = teacherService.promoteToTeacher(request);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<String> deleteTeacher(@PathVariable Long id) {
        try {
            teacherService.deleteTeacherById(id);
            return ResponseEntity.ok("Teacher deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @PostMapping("/demote-teacher")
    public ResponseEntity<String> demoteToStudent(@RequestBody DemoteToStudentRequest request) {
        String result = teacherService.demoteToStudent(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<Teacher>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @GetMapping("/check")
    public ResponseEntity<Boolean> checkAdminStatus(@RequestParam String email) {
        // Now checking directly against the admin repository
        boolean isAdmin = adminRepository.findByEmail(email).isPresent();
        return ResponseEntity.ok(isAdmin);
    }
}