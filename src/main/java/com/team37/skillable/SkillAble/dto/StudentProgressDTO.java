package com.team37.skillable.SkillAble.dto;

import lombok.Data;

@Data
public class StudentProgressDTO {
    private int score;
    private boolean completed;
    private int starsEarned;
}