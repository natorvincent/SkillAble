package com.team37.skillable.SkillAble.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    private String email;

    @NotBlank(message = "Password is required.")
    private String password;

    private String userType;  // "teacher" or "student"

    private String firstName;
    private String lastName;
    private int age;
    private String name;  // For Teacher only
}