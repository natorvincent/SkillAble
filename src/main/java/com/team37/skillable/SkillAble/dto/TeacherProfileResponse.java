package com.team37.skillable.SkillAble.dto;

import com.team37.skillable.SkillAble.Entity.Teacher;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeacherProfileResponse {
    private int id;
    private String email;
    private String name;
    private String userType = "TEACHER";

    public static TeacherProfileResponse fromEntity(Teacher teacher) {
        TeacherProfileResponse response = new TeacherProfileResponse();
        response.setId(teacher.getId());
        response.setEmail(teacher.getEmail());
        response.setName(teacher.getName());
        return response;
    }
}