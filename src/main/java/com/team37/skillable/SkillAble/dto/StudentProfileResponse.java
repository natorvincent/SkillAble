package com.team37.skillable.SkillAble.dto;

import com.team37.skillable.SkillAble.Entity.Student;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class StudentProfileResponse {
    private int id;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;  // Changed from int age to LocalDate dateOfBirth
    private String userType = "STUDENT";

    public static StudentProfileResponse fromEntity(Student student) {
        StudentProfileResponse response = new StudentProfileResponse();
        response.setId(student.getId());
        response.setEmail(student.getEmail());
        response.setFirstName(student.getFirstName());
        response.setLastName(student.getLastName());
        response.setDateOfBirth(student.getDateOfBirth());  // Changed from getAge to getDateOfBirth
        return response;
    }
}