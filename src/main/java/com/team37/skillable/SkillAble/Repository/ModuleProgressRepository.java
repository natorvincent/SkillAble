package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.ModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, Integer> {

    @Query("SELECT COUNT(mp) FROM ModuleProgress mp WHERE mp.student.id = :studentId AND mp.completed = true")
    long countCompletedModulesByStudentId(@Param("studentId") int studentId);

    @Query("SELECT SUM(mp.totalStars) FROM ModuleProgress mp WHERE mp.student.id = :studentId")
    Integer getTotalStarsByStudentId(@Param("studentId") int studentId);

    Optional<ModuleProgress> findByStudentIdAndModuleId(int studentId, int moduleId);

    List<ModuleProgress> findByStudentId(int studentId);
}