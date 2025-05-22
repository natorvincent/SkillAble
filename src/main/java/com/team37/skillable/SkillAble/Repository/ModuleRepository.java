package com.team37.skillable.SkillAble.Repository;

import com.team37.skillable.SkillAble.Entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Integer> {
    List<Module> findByActiveTrue();
    List<Module> findByActiveTrueOrderByDisplayOrderAsc();
    List<Module> findAllByOrderByDisplayOrderAsc();
}
