package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Lesson;
import com.team37.skillable.SkillAble.Repository.LessonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LessonService {

    @Autowired
    private LessonRepository lessonRepository;

    public List<Lesson> getAllLessons() {
        return lessonRepository.findAll();
    }

    public List<Lesson> getLessonsByModuleId(int moduleId) {
        return lessonRepository.findByModuleIdAndActiveTrue(moduleId);
    }

    public List<Lesson> getLessonsByModuleIdAndLevel(int moduleId, int level) {
        return lessonRepository.findByModuleIdAndLevelAndActiveTrue(moduleId, level);
    }

    public Optional<Lesson> getLessonById(int id) {
        return lessonRepository.findById(id);
    }

    public Lesson saveLesson(Lesson lesson) {
        return lessonRepository.save(lesson);
    }

    public void deleteLesson(int id) {
        lessonRepository.deleteById(id);
    }
}