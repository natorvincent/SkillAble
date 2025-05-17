package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.Teacher;
import com.team37.skillable.SkillAble.Repository.AdminRepository;
import com.team37.skillable.SkillAble.Service.StudentService;
import com.team37.skillable.SkillAble.Service.TeacherService;
import com.team37.skillable.SkillAble.dto.PromoteToTeacherRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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