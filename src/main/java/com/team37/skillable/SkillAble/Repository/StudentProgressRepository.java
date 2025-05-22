package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.StudentProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends JpaRepository<StudentProgress, Integer> {

    List<StudentProgress> findByStudentId(int studentId);

    List<StudentProgress> findByStudentIdAndLessonModuleId(int studentId, int moduleId);

    Optional<StudentProgress> findByStudentIdAndLessonId(int studentId, int lessonId);

    @Query("SELECT COUNT(sp) FROM StudentProgress sp WHERE sp.student.id = ?1 AND sp.completed = true")
    long countCompletedLessonsByStudentId(int studentId);

    @Query("SELECT COUNT(sp) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.lesson.module.id = :moduleId AND sp.completed = true")
    long countCompletedLessonsByStudentIdAndModuleId(@Param("studentId") int studentId, @Param("moduleId") int moduleId);

    @Query("SELECT SUM(sp.starsEarned) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.lesson.module.id = :moduleId AND sp.completed = true")
    Integer getTotalStarsByStudentIdAndModuleId(@Param("studentId") int studentId, @Param("moduleId") int moduleId);

    @Query("SELECT AVG(sp.score * 100.0 / sp.maxScore) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.lesson.module.id = :moduleId AND sp.completed = true AND sp.maxScore > 0")
    Double getAverageScoreByStudentIdAndModuleId(@Param("studentId") int studentId, @Param("moduleId") int moduleId);

    // For overall student stats
    @Query("SELECT SUM(sp.starsEarned) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.completed = true")
    Integer getTotalStarsByStudentId(@Param("studentId") int studentId);
}