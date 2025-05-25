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
    Optional<StudentProgress> findByStudentIdAndLessonId(int studentId, int lessonId);

    List<StudentProgress> findByStudentId(int studentId);

    @Query("SELECT sp FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.lesson.module.id = :moduleId")
    List<StudentProgress> findByStudentIdAndModuleId(@Param("studentId") int studentId, @Param("moduleId") int moduleId);

    @Query("SELECT COUNT(sp) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.lesson.module.id = :moduleId AND sp.completed = true")
    int countCompletedLessonsByStudentAndModule(@Param("studentId") int studentId, @Param("moduleId") int moduleId);
}