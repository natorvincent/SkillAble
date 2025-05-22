package com.team37.skillable.SkillAble.Controller;

import com.team37.skillable.SkillAble.Entity.Module;
import com.team37.skillable.SkillAble.Service.ModuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "*")
public class ModuleController {

    @Autowired
    private ModuleService moduleService;

    @GetMapping
    public ResponseEntity<List<Module>> getAllModules() {
        List<Module> modules = moduleService.getAllModules();
        return new ResponseEntity<>(modules, HttpStatus.OK);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Module>> getActiveModules() {
        List<Module> activeModules = moduleService.getAllActiveModules();
        return new ResponseEntity<>(activeModules, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Module> getModuleById(@PathVariable int id) {
        Optional<Module> module = moduleService.getModuleById(id);
        return module.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping("/create")
    public ResponseEntity<Module> createModule(@RequestBody Module module) {
        try {
            Module savedModule = moduleService.saveModule(module);
            return new ResponseEntity<>(savedModule, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Module> updateModule(@PathVariable int id, @RequestBody Module module) {
        try {
            Optional<Module> moduleData = moduleService.getModuleById(id);
            if (moduleData.isPresent()) {
                Module existingModule = moduleData.get();
                existingModule.setName(module.getName());
                existingModule.setDescription(module.getDescription());
                existingModule.setDisplayOrder(module.getDisplayOrder());
                existingModule.setActive(module.isActive());
                return new ResponseEntity<>(moduleService.saveModule(existingModule), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    // New endpoint for toggling active status
    @PutMapping("/{id}/active")
    public ResponseEntity<Module> toggleModuleActive(@PathVariable int id, @RequestParam boolean active) {
        try {
            Optional<Module> moduleData = moduleService.getModuleById(id);
            if (moduleData.isPresent()) {
                Module existingModule = moduleData.get();
                existingModule.setActive(active);
                return new ResponseEntity<>(moduleService.saveModule(existingModule), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteModule(@PathVariable int id) {
        try {
            moduleService.deleteModule(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}