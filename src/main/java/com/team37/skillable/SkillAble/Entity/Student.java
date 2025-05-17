package com.team37.skillable.SkillAble.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;
    private String firstName;
    private String lastName;
    private int age;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
}