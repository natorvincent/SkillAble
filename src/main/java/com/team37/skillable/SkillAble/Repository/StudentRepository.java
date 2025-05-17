package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    Optional<Student> findByEmail(String email);
}