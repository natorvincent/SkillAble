package com.team37.skillable.SkillAble.dto;

public class DemoteToStudentRequest {
    private Long teacherId;
    private String email;

    public DemoteToStudentRequest() {}

    public DemoteToStudentRequest(Long teacherId, String email) {
        this.teacherId = teacherId;
        this.email = email;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}