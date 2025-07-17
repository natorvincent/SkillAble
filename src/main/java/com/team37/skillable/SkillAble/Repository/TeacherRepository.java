package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Integer> {
    Optional<Teacher> findByEmail(String email);
    Optional<Teacher> findById(Long id);
}