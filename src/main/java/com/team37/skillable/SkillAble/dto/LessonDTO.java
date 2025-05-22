package com.team37.skillable.SkillAble.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data // This provides getters, setters, toString, equals, hashCode
@NoArgsConstructor // Default constructor
@AllArgsConstructor // Constructor with all fields
public class LessonDTO {
    @JsonProperty("id")
    private int id;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("level")
    private int level;

    @JsonProperty("displayOrder")
    private int displayOrder;

    @JsonProperty("active")
    private boolean active;

    @JsonProperty("type")
    private String type;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    // Module information
    @JsonProperty("moduleId")
    private int moduleId;

    @JsonProperty("moduleName")
    private String moduleName;
}