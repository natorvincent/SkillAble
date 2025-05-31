package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import com.team37.skillable.SkillAble.Repository.TeacherRepository;
import com.team37.skillable.SkillAble.dto.EnrollStudentRequest;
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

    public Teacher getTeacherProfile(String email) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);

        if (teacherOpt.isEmpty()) {
            throw new RuntimeException("Teacher not found");
        }

        return teacherOpt.get();
    }

    public void updateTeacherProfile(TeacherProfileUpdateRequest request) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(request.getEmail());

        if (teacherOpt.isEmpty()) {
            throw new RuntimeException("Teacher not found");
        }

        Teacher teacher = teacherOpt.get();
        teacher.setName(request.getName());

        teacherRepository.save(teacher);
    }

    public void deleteTeacher(String email) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);

        if (teacherOpt.isEmpty()) {
            throw new RuntimeException("Teacher not found");
        }

        teacherRepository.delete(teacherOpt.get());
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public boolean isAdmin(String email) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);
        return teacherOpt.isPresent() && email.endsWith("@admin.skillable.com");
    }

    @Transactional
    public String promoteToTeacher(PromoteToTeacherRequest request) {
        Optional<Student> studentOpt = studentRepository.findById(request.getUserId());

        if (studentOpt.isEmpty()) {
            return "Student not found";
        }

        Student student = studentOpt.get();
        String email = student.getEmail();

        if (teacherRepository.findByEmail(email).isPresent()) {
            return "User is already a teacher";
        }

        Teacher teacher = new Teacher();
        teacher.setEmail(email);
        teacher.setPassword(student.getPassword());
        teacher.setName(request.getName());
        teacher.setCreatedAt(LocalDateTime.now());
        teacher.setUpdatedAt(LocalDateTime.now());

        teacherRepository.save(teacher);
        studentRepository.delete(student);

        return "User promoted to teacher successfully";
    }

    public List<Student> getTeacherStudents(String teacherEmail) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(teacherEmail);
        if (teacherOpt.isEmpty()) {
            throw new RuntimeException("Teacher not found");
        }

        Teacher teacher = teacherOpt.get();
        return teacher.getStudents();
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Student> searchStudents(String searchTerm) {
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return studentRepository.findAll();
        }
        return studentRepository.searchStudents(searchTerm.trim());
    }

    public List<Student> getUnassignedStudents() {
        return studentRepository.findByTeacherIsNull();
    }

    @Transactional
    public void assignStudentToTeacher(String teacherEmail, String studentEmail) {
        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getTeacher() != null) {
            throw new RuntimeException("Student is already assigned to another teacher");
        }

        student.setTeacher(teacher);
        studentRepository.save(student);
    }

    @Transactional
    public void unassignStudentFromTeacher(String teacherEmail, String studentEmail) {
        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getTeacher() == null || !student.getTeacher().getEmail().equals(teacherEmail)) {
            throw new RuntimeException("Student is not assigned to this teacher");
        }

        student.setTeacher(null);
        studentRepository.save(student);
    }
}