package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import com.team37.skillable.SkillAble.Repository.TeacherRepository;
import com.team37.skillable.SkillAble.dto.StudentProfileUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    public void updateStudentProfile(StudentProfileUpdateRequest request) {
        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());

        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        Student student = studentOpt.get();
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setDateOfBirth(request.getDateOfBirth());  // Changed from setAge to setDateOfBirth

        studentRepository.save(student);
    }



    public Student getStudentProfile(String email) {
        Optional<Student> studentOpt = studentRepository.findByEmail(email);

        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        return studentOpt.get();
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public void deleteStudent(String email) {
        Optional<Student> studentOpt = studentRepository.findByEmail(email);

        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        studentRepository.delete(studentOpt.get());
    }

    public void confirmStudentRole(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found with email: " + email));

        student.setUpdatedAt(LocalDateTime.now());
        studentRepository.save(student);
    }
    public void changePassword(String email, String newPassword) {
        Optional<Student> studentOpt = studentRepository.findByEmail(email);

        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        Student student = studentOpt.get();

        // Validate new password
        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters long");
        }

        // Update password with BCrypt encoding
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        student.setPassword(encoder.encode(newPassword));
        studentRepository.save(student);
    }

    public List<Student> getStudentsNotTeachers() {
        List<Student> allStudents = studentRepository.findAll();
        List<String> teacherEmails = teacherRepository.findAll().stream()
                .map(Teacher::getEmail)
                .collect(Collectors.toList());

        return allStudents.stream()
                .filter(student -> !teacherEmails.contains(student.getEmail()))
                .collect(Collectors.toList());
    }
}