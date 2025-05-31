package com.team37.skillable.SkillAble.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class EnrollStudentRequest {
    private String teacherEmail;
    private String studentEmail;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
}