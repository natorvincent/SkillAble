package com.team37.skillable.SkillAble.Service;

import com.team37.skillable.SkillAble.Entity.Badge;
import com.team37.skillable.SkillAble.Repository.BadgeRepository;
import com.team37.skillable.SkillAble.Repository.LessonRepository;
import com.team37.skillable.SkillAble.Repository.ModuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    public Optional<Badge> getBadgeById(Long id) {
        return badgeRepository.findById(id);
    }

    public Badge createBadge(Badge badge) {
        return badgeRepository.save(badge);
    }

    public Badge updateBadge(Long id, Badge badgeDetails) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Badge not found with id: " + id));

        badge.setBadgeName(badgeDetails.getBadgeName());
        badge.setDescription(badgeDetails.getDescription());

        return badgeRepository.save(badge);
    }

    public void deleteBadge(Long id) {
        Badge badge = badgeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Badge not found with id: " + id));

        badgeRepository.delete(badge);
    }

    public Map<String, Object> calculateStudentBadges(Long studentId) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> badges = new ArrayList<>();

        try {
            System.out.println("Calculating badges for student: " + studentId);

            // Get student progress stats with null safety
            Map<String, Object> progressStats = progressService.getStudentModuleProgressStats(studentId, 1);

            if (progressStats == null) {
                progressStats = new HashMap<>();
            }

            // Get admin-created content counts
            int totalAdminLessons = getTotalAdminCreatedLessons();
            int totalAdminModules = getTotalAdminCreatedModules();

            // Safely extract values with proper null checking and type safety
            int completedLessons = extractIntValue(progressStats, "completedLessons", 0);
            int totalStars = extractIntValue(progressStats, "totalStars", 0);
            int completedModules = extractIntValue(progressStats, "completedModules", 0);
            int currentStreak = extractIntValue(progressStats, "currentStreak", 0);
            double totalProgress = extractDoubleValue(progressStats, "totalProgress", 0.0);

            // Limit completed counts to admin-created content only
            int validCompletedLessons = Math.min(completedLessons, totalAdminLessons);
            int validCompletedModules = Math.min(completedModules, totalAdminModules);

            // Calculate progress percentage based on admin-created content
            double validProgressPercentage = 0.0;
            if (totalAdminLessons > 0) {
                validProgressPercentage = (double) validCompletedLessons / totalAdminLessons * 100.0;
            }

            System.out.println("Admin content - Lessons: " + totalAdminLessons + ", Modules: " + totalAdminModules);
            System.out.println("Valid completed - Lessons: " + validCompletedLessons + ", Modules: " + validCompletedModules);
            System.out.println("Valid progress: " + validProgressPercentage + "%");

            // Calculate badges using filtered counts
            badges.addAll(calculateLessonBadges(validCompletedLessons, totalAdminLessons));
            badges.addAll(calculateStarBadges(totalStars));
            badges.addAll(calculateModuleBadges(validCompletedModules, totalAdminModules));
            badges.addAll(calculateMajorAchievementBadges(validCompletedLessons, totalStars, validCompletedModules, totalAdminLessons, totalAdminModules));
            badges.addAll(calculateStreakBadges(currentStreak));
            badges.addAll(calculateProgressBadges(validProgressPercentage));

            // Calculate earned count
            int earnedCount = (int) badges.stream()
                    .filter(badge -> badge.get("earned") != null && (Boolean) badge.get("earned"))
                    .count();

            result.put("badges", badges);
            result.put("earnedCount", earnedCount);
            result.put("totalCount", badges.size());
            result.put("adminCreatedLessons", totalAdminLessons);
            result.put("adminCreatedModules", totalAdminModules);

            System.out.println("Total badges calculated: " + badges.size() + ", Earned: " + earnedCount);

        } catch (Exception e) {
            System.err.println("Error calculating student badges: " + e.getMessage());
            e.printStackTrace();

            // Return safe defaults if there's an error
            result.put("badges", new ArrayList<>());
            result.put("earnedCount", 0);
            result.put("totalCount", 0);
            result.put("adminCreatedLessons", 0);
            result.put("adminCreatedModules", 0);
        }

        return result;
    }

    // New method to get total admin-created lessons
    private int getTotalAdminCreatedLessons() {
        try {
            // Count all lessons using the built-in count() method
            return (int) lessonRepository.count();

            // Alternative: Count only active lessons with activities
            // List<Lesson> activeLessons = lessonRepository.findByActivityIsNotNullAndActiveTrue();
            // return activeLessons.size();
        } catch (Exception e) {
            System.err.println("Error getting admin-created lessons count: " + e.getMessage());
            return 0;
        }
    }

    // New method to get total admin-created modules
    private int getTotalAdminCreatedModules() {
        try {
            // Count all modules using the built-in count() method
            return (int) moduleRepository.count();

            // Alternative: Count only active modules
            // List<Module> activeModules = moduleRepository.findByActiveTrue();
            // return activeModules.size();
        } catch (Exception e) {
            System.err.println("Error getting admin-created modules count: " + e.getMessage());
            return 0;
        }
    }

    // Helper method to safely extract integer values
    private int extractIntValue(Map<String, Object> map, String key, int defaultValue) {
        try {
            Object value = map.get(key);
            if (value == null) {
                return defaultValue;
            }
            if (value instanceof Integer) {
                return (Integer) value;
            }
            if (value instanceof Number) {
                return ((Number) value).intValue();
            }
            if (value instanceof String) {
                return Integer.parseInt((String) value);
            }
            return defaultValue;
        } catch (Exception e) {
            System.err.println("Error extracting int value for key '" + key + "': " + e.getMessage());
            return defaultValue;
        }
    }

    // Helper method to safely extract double values
    private double extractDoubleValue(Map<String, Object> map, String key, double defaultValue) {
        try {
            Object value = map.get(key);
            if (value == null) {
                return defaultValue;
            }
            if (value instanceof Double) {
                return (Double) value;
            }
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
            if (value instanceof String) {
                return Double.parseDouble((String) value);
            }
            return defaultValue;
        } catch (Exception e) {
            System.err.println("Error extracting double value for key '" + key + "': " + e.getMessage());
            return defaultValue;
        }
    }

    private List<Map<String, Object>> calculateLessonBadges(int completedLessons, int totalAdminLessons) {
        List<Map<String, Object>> badges = new ArrayList<>();

        // Only create badges if there are admin-created lessons
        if (totalAdminLessons == 0) {
            return badges;
        }

        int threshold50 = Math.min(50, totalAdminLessons);
        int threshold25 = Math.min(25, totalAdminLessons);
        int threshold10 = Math.min(10, totalAdminLessons);

        if (completedLessons >= threshold50 && threshold50 > 0) {
            badges.add(createBadge("lesson-master", "Lesson Master", "Completed " + threshold50 + "+ lessons",
                    "Lessons", true, completedLessons + "/" + threshold50, "#4a6cf7"));
        } else if (completedLessons >= threshold25 && threshold25 > 0) {
            badges.add(createBadge("lesson-expert", "Lesson Expert", "Completed " + threshold25 + "+ lessons",
                    "Lessons", true, completedLessons + "/" + threshold25, "#4a6cf7"));
        } else if (completedLessons >= threshold10 && threshold10 > 0) {
            badges.add(createBadge("lesson-achiever", "Achiever", "Completed " + threshold10 + "+ lessons",
                    "Lessons", true, completedLessons + "/" + threshold10, "#4a6cf7"));
        }

        return badges;
    }

    private List<Map<String, Object>> calculateStarBadges(int totalStars) {
        List<Map<String, Object>> badges = new ArrayList<>();

        if (totalStars >= 100) {
            badges.add(createBadge("star-collector", "Star Collector", "Earned 100+ stars",
                    "Stars", true, totalStars + "/100", "#ffc107"));
        } else if (totalStars >= 50) {
            badges.add(createBadge("rising-star", "Rising Star", "Earned 50+ stars",
                    "Stars", true, totalStars + "/50", "#ffc107"));
        }

        return badges;
    }

    private List<Map<String, Object>> calculateModuleBadges(int completedModules, int totalAdminModules) {
        List<Map<String, Object>> badges = new ArrayList<>();

        // Only create badges if there are admin-created modules
        if (totalAdminModules == 0) {
            return badges;
        }

        int threshold10 = Math.min(10, totalAdminModules);
        int threshold5 = Math.min(5, totalAdminModules);

        if (completedModules >= threshold10 && threshold10 > 0) {
            badges.add(createBadge("module-champion", "Champion", "Completed " + threshold10 + "+ modules",
                    "Modules", true, completedModules + "/" + threshold10, "#28a745"));
        } else if (completedModules >= threshold5 && threshold5 > 0) {
            badges.add(createBadge("module-warrior", "Warrior", "Completed " + threshold5 + "+ modules",
                    "Modules", true, completedModules + "/" + threshold5, "#48bb78"));
        }

        return badges;
    }

    private List<Map<String, Object>> calculateMajorAchievementBadges(int completedLessons, int totalStars, int completedModules, int totalAdminLessons, int totalAdminModules) {
        List<Map<String, Object>> badges = new ArrayList<>();

        // Only show major achievement badges if admin content exists
        if (totalAdminLessons > 0) {
            int superLearnerThreshold = Math.min(100, totalAdminLessons);
            badges.add(createBadge("super-learner", "Super Learner", "Complete " + superLearnerThreshold + " lessons",
                    "Lessons", completedLessons >= superLearnerThreshold, completedLessons + "/" + superLearnerThreshold,
                    completedLessons >= superLearnerThreshold ? "#4a6cf7" : "#ccc"));
        }

        // Star Master Badge (can remain as is since stars aren't limited by admin content)
        badges.add(createBadge("star-master", "Star Master", "Earn 500 stars",
                "Stars", totalStars >= 500, totalStars + "/500",
                totalStars >= 500 ? "#ffc107" : "#ccc"));

        // Module Legend Badge
        if (totalAdminModules > 0) {
            int moduleLegendThreshold = Math.min(25, totalAdminModules);
            String moduleProgress = completedModules + "/" + moduleLegendThreshold;
            badges.add(createBadge("module-legend", "Module Legend", "Complete " + moduleLegendThreshold + " modules",
                    "Modules", completedModules >= moduleLegendThreshold, moduleProgress,
                    completedModules >= moduleLegendThreshold ? "#28a745" : "#ccc"));
        }

        return badges;
    }

    private List<Map<String, Object>> calculateStreakBadges(int currentStreak) {
        List<Map<String, Object>> badges = new ArrayList<>();

        if (currentStreak >= 30) {
            badges.add(createBadge("streak-legend", "Streak Legend", "30+ day streak",
                    "Streaks", true, currentStreak + "/30", "#dc3545"));
        } else if (currentStreak >= 15) {
            badges.add(createBadge("streak-keeper", "Streak Keeper", "15+ day streak",
                    "Streaks", true, currentStreak + "/15", "#fd7e14"));
        } else if (currentStreak >= 7) {
            badges.add(createBadge("streak-starter", "Streak Starter", "7+ day streak",
                    "Streaks", true, currentStreak + "/7", "#ffc107"));
        }

        return badges;
    }

    private List<Map<String, Object>> calculateProgressBadges(double totalProgress) {
        List<Map<String, Object>> badges = new ArrayList<>();

        if (totalProgress >= 100) {
            badges.add(createBadge("perfectionist", "Perfectionist", "100% completion",
                    "Progress", true, String.format("%.1f", totalProgress) + "%", "#ffd700"));
        } else if (totalProgress >= 90) {
            badges.add(createBadge("almost-perfect", "Almost Perfect", "90%+ completion",
                    "Progress", true, String.format("%.1f", totalProgress) + "%", "#17a2b8"));
        } else if (totalProgress >= 75) {
            badges.add(createBadge("high-achiever", "High Achiever", "75%+ completion",
                    "Progress", true, String.format("%.1f", totalProgress) + "%", "#6f42c1"));
        }

        return badges;
    }

    private Map<String, Object> createBadge(String id, String label, String description,
                                            String category, boolean earned, String progress, String color) {
        Map<String, Object> badge = new HashMap<>();
        badge.put("id", id != null ? id : "unknown");
        badge.put("label", label != null ? label : "Unknown Badge");
        badge.put("description", description != null ? description : "No description");
        badge.put("category", category != null ? category : "General");
        badge.put("earned", earned);
        badge.put("progress", progress != null ? progress : "0/0");
        badge.put("color", color != null ? color : "#ccc");
        return badge;
    }

    // NEW: Method to get badge summary for a student
    public Map<String, Object> getStudentBadgeSummary(Long studentId) {
        Map<String, Object> badgeData = calculateStudentBadges(studentId);
        Map<String, Object> summary = new HashMap<>();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> badges = (List<Map<String, Object>>) badgeData.get("badges");

        // Count by category
        Map<String, Integer> categoryCount = new HashMap<>();
        Map<String, Integer> earnedByCategory = new HashMap<>();

        for (Map<String, Object> badge : badges) {
            String category = (String) badge.get("category");
            boolean earned = (Boolean) badge.get("earned");

            categoryCount.put(category, categoryCount.getOrDefault(category, 0) + 1);
            if (earned) {
                earnedByCategory.put(category, earnedByCategory.getOrDefault(category, 0) + 1);
            }
        }

        summary.put("totalBadges", badgeData.get("totalCount"));
        summary.put("earnedBadges", badgeData.get("earnedCount"));
        summary.put("categoryBreakdown", categoryCount);
        summary.put("earnedByCategory", earnedByCategory);
        summary.put("adminCreatedLessons", badgeData.get("adminCreatedLessons"));
        summary.put("adminCreatedModules", badgeData.get("adminCreatedModules"));

        return summary;
    }
}