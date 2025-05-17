package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    // You can add custom query methods here if needed
}