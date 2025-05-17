package com.team37.skillable.SkillAble.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long badgeId;

    private String badgeName;
    private String description;

    // Getters
    public Long getBadgeId() {
        return badgeId;
    }

    public String getBadgeName() {
        return badgeName;
    }

    public String getDescription() {
        return description;
    }

    // Setters
    public void setBadgeId(Long badgeId) {
        this.badgeId = badgeId;
    }

    public void setBadgeName(String badgeName) {
        this.badgeName = badgeName;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}