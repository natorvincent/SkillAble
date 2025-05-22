    package com.team37.skillable.SkillAble.Controller;

    import com.team37.skillable.SkillAble.Entity.ModuleProgress;
    import com.team37.skillable.SkillAble.Service.ModuleProgressService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.HashMap;
    import java.util.List;
    import java.util.Map;

    @RestController
    @RequestMapping("/api/module-progress")
    public class ModuleProgressController {

        @Autowired
        private ModuleProgressService moduleProgressService;

        @GetMapping("/student/{studentId}")
        public List<ModuleProgress> getModuleProgressByStudentId(@PathVariable int studentId) {
            return moduleProgressService.getAllProgressByStudentId(studentId);
        }

        @GetMapping("/student/{studentId}/module/{moduleId}")
        public ResponseEntity<ModuleProgress> getModuleProgressByStudentIdAndModuleId(
                @PathVariable int studentId,
                @PathVariable int moduleId) {
            return moduleProgressService.getProgressByStudentIdAndModuleId(studentId, moduleId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        @PostMapping("/update/student/{studentId}/module/{moduleId}")
        public ModuleProgress updateModuleProgress(
                @PathVariable int studentId,
                @PathVariable int moduleId) {
            return moduleProgressService.updateModuleProgress(studentId, moduleId);
        }

        @GetMapping("/stats/student/{studentId}")
        public ResponseEntity<Map<String, Object>> getStudentModuleProgressStats(@PathVariable int studentId) {
            Map<String, Object> stats = new HashMap<>();

            stats.put("completedModules", moduleProgressService.getCompletedModulesCount(studentId));
            stats.put("totalStars", moduleProgressService.getTotalStars(studentId));

            return ResponseEntity.ok(stats);
        }
    }