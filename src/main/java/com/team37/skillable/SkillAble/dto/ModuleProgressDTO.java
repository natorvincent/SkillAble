package com.team37.skillable.SkillAble.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ModuleProgressDTO {
    private int id;
    private int studentId;
    private int moduleId;
    private String moduleName;
    private int completedLessons;
    private int totalLessons;
    private int totalStars;
    private double averageScore;
    private boolean completed;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}