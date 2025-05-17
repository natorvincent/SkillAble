package com.team37.skillable.SkillAble.dto;

public class PromoteToTeacherRequest {
    private int userId;
    private String name; // Teacher name

    // Getters and setters
    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}