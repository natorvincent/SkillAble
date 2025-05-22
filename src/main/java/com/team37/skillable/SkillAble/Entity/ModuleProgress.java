package com.team37.skillable.SkillAble.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "module_progress")
public class ModuleProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonBackReference("student-moduleprogress")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    @JsonBackReference
    private Module module;

    @Column(nullable = false)
    private int completedLessons;

    @Column(nullable = false)
    private int totalLessons;

    @Column(nullable = false)
    private boolean completed;

    @Column(nullable = false)
    private double averageScore;

    @Column(nullable = false)
    private int totalStars;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    private LocalDateTime lastAccessedAt;

    @PrePersist
    public void prePersist() {
        startedAt = LocalDateTime.now();
        lastAccessedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        lastAccessedAt = LocalDateTime.now();

        // If just completed, set the completed timestamp
        if (completed && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}