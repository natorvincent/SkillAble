package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.ModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, Integer> {
    Optional<ModuleProgress> findByStudentIdAndModuleId(int studentId, int moduleId);
    List<ModuleProgress> findByStudentId(int studentId);
}