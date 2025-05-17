package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Admin;
import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.AdminRepository;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import com.team37.skillable.SkillAble.Repository.TeacherRepository;
import com.team37.skillable.SkillAble.dto.PromoteToTeacherRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AdminRepository adminRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public List<Student> getStudentsNotTeachers() {
        // Get all students
        List<Student> allStudents = studentRepository.findAll();

        // Get all email addresses of teachers
        List<String> teacherEmails = teacherRepository.findAll().stream()
                .map(Teacher::getEmail)
                .collect(Collectors.toList());

        // Filter students whose emails are not in the teacher list
        return allStudents.stream()
                .filter(student -> !teacherEmails.contains(student.getEmail()))
                .collect(Collectors.toList());
    }

    public Admin getAdminByEmail(String email) {
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    @Transactional
    public String promoteToTeacher(PromoteToTeacherRequest request) {
        // Find student by ID
        Optional<Student> studentOpt = studentRepository.findById(request.getUserId());

        if (studentOpt.isEmpty()) {
            return "Student not found";
        }

        Student student = studentOpt.get();

        // Check if the student is already a teacher
        if (teacherRepository.findByEmail(student.getEmail()).isPresent()) {
            return "Student is already a teacher";
        }

        // Create a new Teacher entity
        Teacher teacher = new Teacher();
        teacher.setEmail(student.getEmail());
        teacher.setPassword(student.getPassword());
        teacher.setCreatedAt(student.getCreatedAt());
        teacher.setUpdatedAt(LocalDateTime.now());
        teacher.setName(request.getName());

        // Save the teacher entity
        teacherRepository.save(teacher);

        return "Student successfully promoted to teacher";
    }

    public boolean isAdmin(String email) {
        return adminRepository.findByEmail(email).isPresent();
    }
}