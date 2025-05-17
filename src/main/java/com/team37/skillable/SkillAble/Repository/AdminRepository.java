package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Integer> {
    Optional<Admin> findByEmail(String email);
}