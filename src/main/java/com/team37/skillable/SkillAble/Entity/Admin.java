package com.team37.skillable.SkillAble.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "admin")
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(nullable = false, unique = true)
    private String email;

    private String password;
    private String name;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}