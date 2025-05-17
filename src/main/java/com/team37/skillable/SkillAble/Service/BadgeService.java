package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Badge;
import com.team37.skillable.SkillAble.Repository.BadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;


    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    public Optional<Badge> getBadgeById(Long id) {
        return badgeRepository.findById(id);
    }


    public Badge createBadge(Badge badge) {
        return badgeRepository.save(badge);
    }


    public Badge updateBadge(Long id, Badge badgeDetails) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Badge not found with id: " + id));

        badge.setBadgeName(badgeDetails.getBadgeName());
        badge.setDescription(badgeDetails.getDescription());

        return badgeRepository.save(badge);
    }


    public void deleteBadge(Long id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Badge not found with id: " + id));

        badgeRepository.delete(badge);
    }
}