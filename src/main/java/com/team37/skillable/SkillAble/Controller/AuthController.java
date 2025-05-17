package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Admin;
import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.AdminRepository;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import com.team37.skillable.SkillAble.Repository.TeacherRepository;
import com.team37.skillable.SkillAble.Service.AuthService;
import com.team37.skillable.SkillAble.dto.LoginRequest;
import com.team37.skillable.SkillAble.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AdminRepository adminRepository;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        String email = request.getEmail();

        // First check if it's an admin
        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            if (admin.get().getPassword().equals(request.getPassword())) {
                return ResponseEntity.ok(generateTokenWithRole(admin.get().getId(), email, "ADMIN"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }
        }

        // Try in student repository
        Optional<Student> student = studentRepository.findByEmail(email);
        if (student.isPresent()) {
            if (student.get().getPassword().equals(request.getPassword())) {
                return ResponseEntity.ok(generateTokenWithRole(student.get().getId(), email, "STUDENT"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }
        }

        // Try in teacher repository
        Optional<Teacher> teacher = teacherRepository.findByEmail(email);
        if (teacher.isPresent()) {
            if (teacher.get().getPassword().equals(request.getPassword())) {
                return ResponseEntity.ok(generateTokenWithRole(teacher.get().getId(), email, "TEACHER"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
    }

    private String generateTokenWithRole(int userId, String email, String role) {
        return "user_" + userId + "_" + role + "_" + System.currentTimeMillis();
    }
}