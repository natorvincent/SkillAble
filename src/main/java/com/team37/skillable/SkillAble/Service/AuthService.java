package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Admin;
import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.AdminRepository;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import com.team37.skillable.SkillAble.Repository.TeacherRepository;
import com.team37.skillable.SkillAble.dto.LoginRequest;
import com.team37.skillable.SkillAble.dto.RegisterRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AdminRepository adminRepository;

    public String register(RegisterRequest request) {
        // Check if email already exists in any repository
        if (studentRepository.findByEmail(request.getEmail()).isPresent() ||
                teacherRepository.findByEmail(request.getEmail()).isPresent() ||
                adminRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists.";
        }

        // Special case for admin registration
        if (request.getEmail() != null && request.getEmail().endsWith("@admin.skillable.com")) {
            // Create admin in the Admin table
            Admin admin = new Admin();
            admin.setEmail(request.getEmail());
            admin.setPassword(request.getPassword());
            admin.setName(request.getName() != null ? request.getName() : request.getEmail().split("@")[0]);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            adminRepository.save(admin);
            return "Admin registered successfully!";
        }

        // For all other users, always create as students
        Student student = new Student();
        student.setEmail(request.getEmail());
        student.setPassword(request.getPassword());
        student.setFirstName(request.getFirstName() != null ? request.getFirstName() : "");
        student.setLastName(request.getLastName() != null ? request.getLastName() : "");
        student.setAge(request.getAge() > 0 ? request.getAge() : 0);
        student.setCreatedAt(LocalDateTime.now());
        student.setUpdatedAt(LocalDateTime.now());
        studentRepository.save(student);
        return "Student registered successfully!";
    }

    public String login(LoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();

        // First check if it's an admin
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (admin.getPassword().equals(password)) {
                return "Login successful! Welcome, admin " + admin.getEmail();
            }
        }

        // Then check if it's a student
        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (student.getPassword().equals(password)) {
                return "Login successful! Welcome, student " + student.getEmail();
            }
        }

        // Finally check if it's a teacher
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            if (teacher.getPassword().equals(password)) {
                return "Login successful! Welcome, teacher " + teacher.getEmail();
            }
        }

        return "Invalid email or password.";
    }
}