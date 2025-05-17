package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.StudentRepository;
import com.team37.skillable.SkillAble.Repository.TeacherRepository;
import com.team37.skillable.SkillAble.dto.StudentProfileUpdateRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    // Update student profile
    public void updateStudentProfile(StudentProfileUpdateRequest request) {
        Optional<Student> studentOpt = studentRepository.findByEmail(request.getEmail());

        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        Student student = studentOpt.get();
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setAge(request.getAge());

        studentRepository.save(student);
    }

    // Get student profile - modified to return Student entity directly
    public Student getStudentProfile(String email) {
        Optional<Student> studentOpt = studentRepository.findByEmail(email);

        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        return studentOpt.get();
    }

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Delete student
    public void deleteStudent(String email) {
        Optional<Student> studentOpt = studentRepository.findByEmail(email);

        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student not found");
        }

        studentRepository.delete(studentOpt.get());
    }

    // Get students that are not teachers
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