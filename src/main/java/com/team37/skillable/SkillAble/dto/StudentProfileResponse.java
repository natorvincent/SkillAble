package com.team37.skillable.SkillAble.dto;

import com.team37.skillable.SkillAble.Entity.Student;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentProfileResponse {
    private int id;
    private String email;
    private String firstName;
    private String lastName;
    private int age;
    private String userType = "STUDENT";

    public static StudentProfileResponse fromEntity(Student student) {
        StudentProfileResponse response = new StudentProfileResponse();
        response.setId(student.getId());
        response.setEmail(student.getEmail());
        response.setFirstName(student.getFirstName());
        response.setLastName(student.getLastName());
        response.setAge(student.getAge());
        return response;
    }
}