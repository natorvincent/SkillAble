package com.team37.skillable.SkillAble.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "student_progress")
public class StudentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonBackReference("student-progress")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    @JsonBackReference("lesson-progress")
    private Lesson lesson;

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private int maxScore;

    @Column(nullable = false)
    private boolean completed;

    @Column(nullable = false)
    private int starsEarned;

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