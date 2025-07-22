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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
        String password = request.getPassword();
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // First check if it's an admin
        Optional<Admin> admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            if (verifyPassword(password, admin.get().getPassword(), encoder)) {
                return ResponseEntity.ok(generateTokenWithRole(admin.get().getId(), email, "ADMIN"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }
        }

        // Try in student repository
        Optional<Student> student = studentRepository.findByEmail(email);
        if (student.isPresent()) {
            if (verifyPassword(password, student.get().getPassword(), encoder)) {
                return ResponseEntity.ok(generateTokenWithRole(student.get().getId(), email, "STUDENT"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }
        }

        // Try in teacher repository
        Optional<Teacher> teacher = teacherRepository.findByEmail(email);
        if (teacher.isPresent()) {
            if (verifyPassword(password, teacher.get().getPassword(), encoder)) {
                return ResponseEntity.ok(generateTokenWithRole(teacher.get().getId(), email, "TEACHER"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
    }

    private boolean verifyPassword(String rawPassword, String storedPassword, BCryptPasswordEncoder encoder) {
        // Check if stored password is a BCrypt hash (starts with $2a$, $2b$, or $2y$)
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            // Use BCrypt verification for hashed passwords
            return encoder.matches(rawPassword, storedPassword);
        } else {
            // Legacy plain text comparison for old passwords
            return rawPassword.equals(storedPassword);
        }
    }

    private String generateTokenWithRole(int userId, String email, String role) {
        return "user_" + userId + "_" + role + "_" + System.currentTimeMillis();
    }
}