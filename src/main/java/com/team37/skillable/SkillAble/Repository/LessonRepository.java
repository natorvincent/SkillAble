package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Integer> {
    List<Lesson> findByModuleIdAndActiveTrue(int moduleId);
    List<Lesson> findByModuleIdAndLevelAndActiveTrue(int moduleId, int level);
}