package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Badge;
import com.team37.skillable.SkillAble.Service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    @Autowired
    private BadgeService badgeService;

    // Get all badges
    @GetMapping
    public ResponseEntity<List<Badge>> getAllBadges() {
        List<Badge> badges = badgeService.getAllBadges();
        return new ResponseEntity<>(badges, HttpStatus.OK);
    }

    // Get badge by ID
    @GetMapping("/{id}")
    public ResponseEntity<Badge> getBadgeById(@PathVariable Long id) {
        return badgeService.getBadgeById(id)
                .map(badge -> new ResponseEntity<>(badge, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Create a new badge
    @PostMapping
    public ResponseEntity<Badge> createBadge(@RequestBody Badge badge) {
        Badge createdBadge = badgeService.createBadge(badge);
        return new ResponseEntity<>(createdBadge, HttpStatus.CREATED);
    }

    // Update a badge
    @PutMapping("/{id}")
    public ResponseEntity<Badge> updateBadge(@PathVariable Long id, @RequestBody Badge badgeDetails) {
        try {
            Badge updatedBadge = badgeService.updateBadge(id, badgeDetails);
            return new ResponseEntity<>(updatedBadge, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete a badge
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteBadge(@PathVariable Long id) {
        try {
            badgeService.deleteBadge(id);
            return new ResponseEntity<>(Map.of("deleted", true), HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}