package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Entity.StudentProgress;
import com.team37.skillable.SkillAble.Entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends JpaRepository<StudentProgress, Integer> {

    // Existing methods
    Optional<StudentProgress> findByStudentIdAndLessonId(int studentId, int lessonId);

    List<StudentProgress> findByStudentId(int studentId);

    @Query("SELECT sp FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.lesson.module.id = :moduleId")
    List<StudentProgress> findByStudentIdAndModuleId(@Param("studentId") int studentId, @Param("moduleId") int moduleId);

    @Query("SELECT COUNT(sp) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.lesson.module.id = :moduleId AND sp.completed = true")
    int countCompletedLessonsByStudentAndModule(@Param("studentId") int studentId, @Param("moduleId") int moduleId);

    // New methods for difficulty management

    // Find progress by student and lesson entities (needed for difficulty controller)
    Optional<StudentProgress> findByStudentAndLesson(Student student, Lesson lesson);

    // Find all progress records for a specific student entity
    List<StudentProgress> findByStudent(Student student);

    // Find all progress records for a specific lesson entity
    List<StudentProgress> findByLesson(Lesson lesson);

    // Find all progress records for a specific lesson ID
    List<StudentProgress> findByLessonId(int lessonId);

    // Find progress records by student entity and completion status
    List<StudentProgress> findByStudentAndCompleted(Student student, boolean completed);

    // Find progress records by student ID and completion status
    List<StudentProgress> findByStudentIdAndCompleted(int studentId, boolean completed);

    // Find progress records by lesson ID and completion status
    List<StudentProgress> findByLessonIdAndCompleted(int lessonId, boolean completed);

    // Find progress records by difficulty level
    List<StudentProgress> findByDifficulty(String difficulty);

    // Find progress records by student ID and difficulty level
    List<StudentProgress> findByStudentIdAndDifficulty(int studentId, String difficulty);

    // Find progress records by lesson ID and difficulty level
    List<StudentProgress> findByLessonIdAndDifficulty(int lessonId, String difficulty);

    // Custom query to get progress summary for a student
    @Query("SELECT sp FROM StudentProgress sp WHERE sp.student.id = :studentId ORDER BY sp.lesson.module.id, sp.lesson.id")
    List<StudentProgress> findByStudentIdOrderByModuleAndLesson(@Param("studentId") int studentId);

    // Custom query to count total lessons completed by a student
    @Query("SELECT COUNT(sp) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.completed = true")
    int countCompletedLessonsByStudent(@Param("studentId") int studentId);

    // Custom query to get average score for a student
    @Query("SELECT AVG(sp.score) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.completed = true")
    Double getAverageScoreByStudent(@Param("studentId") int studentId);

    // Custom query to get total stars earned by a student
    @Query("SELECT SUM(sp.starsEarned) FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.completed = true")
    Integer getTotalStarsByStudent(@Param("studentId") int studentId);

    // Custom query to find progress by student ID and difficulty with completion status
    @Query("SELECT sp FROM StudentProgress sp WHERE sp.student.id = :studentId AND sp.difficulty = :difficulty AND sp.completed = :completed")
    List<StudentProgress> findByStudentIdAndDifficultyAndCompleted(@Param("studentId") int studentId, @Param("difficulty") String difficulty, @Param("completed") boolean completed);
}