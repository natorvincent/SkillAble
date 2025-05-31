package com.team37.skillable.SkillAble.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;  // Changed from int age to LocalDate dateOfBirth
    private String name; // For admin registration
}