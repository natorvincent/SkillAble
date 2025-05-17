package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import com.team37.skillable.SkillAble.Repository.TeacherRepository;
import com.team37.skillable.SkillAble.dto.PromoteToTeacherRequest;
import com.team37.skillable.SkillAble.dto.TeacherProfileUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TeacherService {

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    // Get teacher profile - modified to return Teacher entity directly
    public Teacher getTeacherProfile(String email) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);

        if (teacherOpt.isEmpty()) {
            throw new RuntimeException("Teacher not found");
        }

        return teacherOpt.get();
    }

    // Update teacher profile
    public void updateTeacherProfile(TeacherProfileUpdateRequest request) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(request.getEmail());

        if (teacherOpt.isEmpty()) {
            throw new RuntimeException("Teacher not found");
        }

        Teacher teacher = teacherOpt.get();
        teacher.setName(request.getName());

        teacherRepository.save(teacher);
    }

    // Delete teacher
    public void deleteTeacher(String email) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);

        if (teacherOpt.isEmpty()) {
            throw new RuntimeException("Teacher not found");
        }

        teacherRepository.delete(teacherOpt.get());
    }

    // Get all teachers
    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    // Check if is admin
    public boolean isAdmin(String email) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);
        return teacherOpt.isPresent() && email.endsWith("@admin.skillable.com");
    }

    // Promote a student to teacher
    @Transactional
    public String promoteToTeacher(PromoteToTeacherRequest request) {
        Optional<Student> studentOpt = studentRepository.findById(request.getUserId());

        if (studentOpt.isEmpty()) {
            return "Student not found";
        }

        Student student = studentOpt.get();
        String email = student.getEmail();

        // Check if already a teacher
        if (teacherRepository.findByEmail(email).isPresent()) {
            return "User is already a teacher";
        }

        // Create new teacher
        Teacher teacher = new Teacher();
        teacher.setEmail(email);
        teacher.setPassword(student.getPassword());
        teacher.setName(request.getName());
        teacher.setCreatedAt(LocalDateTime.now());
        teacher.setUpdatedAt(LocalDateTime.now());

        // Save teacher to database
        teacherRepository.save(teacher);

        // Delete the student record after promoting to teacher
        // This ensures the user only exists in one role table at a time
        studentRepository.delete(student);

        return "User promoted to teacher successfully";
    }
}