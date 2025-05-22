package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Module;
import com.team37.skillable.SkillAble.Entity.Student;
import com.team37.skillable.SkillAble.Repository.ModuleRepository;
import com.team37.skillable.SkillAble.dto.ModuleDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ModuleService {

    @Autowired
    private ModuleRepository moduleRepository;

    // Get all modules regardless of active status (for management interface)
    public List<Module> getAllModules() {
        return moduleRepository.findAllByOrderByDisplayOrderAsc();
    }

    public Optional<Module> getModuleById(int id) {
        return moduleRepository.findById(id);
    }

    public Module saveModule(Module module) {
        return moduleRepository.save(module);
    }

    public void deleteModule(int id) {
        moduleRepository.deleteById(id);
    }

    // Get all active modules (for public display)
    public List<Module> getAllActiveModules() {
        return moduleRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    // Create new module using DTO
    public Module createModule(ModuleDTO moduleDTO) {
        Module module = new Module();
        module.setName(moduleDTO.getName());
        module.setDescription(moduleDTO.getDescription());
        module.setDisplayOrder(moduleDTO.getDisplayOrder());
        module.setActive(true);

        return moduleRepository.save(module);
    }

    // Get modules available for a student based on progress
    public List<Module> getAvailableModulesForStudent(Student student) {
        List<Module> allModules = getAllActiveModules();
        // For now, all active modules are available to all students
        // In a more complex implementation, you could filter based on prerequisites
        return allModules;
    }
}