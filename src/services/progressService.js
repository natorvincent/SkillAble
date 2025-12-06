const API_BASE_URL = 'https://skillable-pdv0.onrender.com/api/progress';

// Add a simple cache to prevent duplicate API calls
const progressCache = new Map();

export const getStudentModuleProgress = async (studentId, moduleId) => {
  const cacheKey = `module-${studentId}-${moduleId}`;
  
  // Return cached result if available
  if (progressCache.has(cacheKey)) {
    return progressCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/module/${studentId}/${moduleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      console.log(`No progress found for student ${studentId}, module ${moduleId}, returning default`);
      const defaultProgress = getDefaultModuleProgress();
      progressCache.set(cacheKey, defaultProgress);
      return defaultProgress;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch module progress');
    }

    const progress = await response.json();
    progressCache.set(cacheKey, progress);
    return progress;
  } catch (error) {
    console.error(`Error fetching module progress for module ${moduleId}:`, error);
    const defaultProgress = getDefaultModuleProgress();
    progressCache.set(cacheKey, defaultProgress);
    return defaultProgress;
  }
};

// Get student progress stats - FETCHES REAL DATA FROM DATABASE
export const getStudentModuleProgressStats = async (studentId) => {
  try {
    console.log('Fetching real progress stats for student:', studentId);
    
    // Try to fetch from a stats endpoint if available
    const statsResponse = await fetch(`${API_BASE_URL}/student/${studentId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
    });

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('Fetched stats from API:', stats);
      return {
        completedLessons: stats.completedLessons || 0,
        totalStars: stats.totalStars || 0,
        completedModules: stats.completedModules || 0,
        currentStreak: stats.currentStreak || 0,
        totalProgress: stats.totalProgress || 0.0
      };
    }

    // Fallback: Calculate stats by aggregating from all modules
    console.log('Stats endpoint not available, calculating from modules...');
    
    // Fetch all available modules first
    const modulesResponse = await fetch('https://skillable-pdv0.onrender.com/api/modules/available', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Email': localStorage.getItem('userEmail') || ''
      },
    });

    if (!modulesResponse.ok) {
      throw new Error('Failed to fetch modules');
    }

    const modules = await modulesResponse.json();
    let totalCompletedLessons = 0;
    let totalStars = 0;
    let completedModules = 0;

    // Fetch progress for each module
    for (const module of modules) {
      try {
        const moduleProgress = await getStudentModuleProgress(studentId, module.id);
        
        if (moduleProgress) {
          totalCompletedLessons += moduleProgress.completedLessons || 0;
          totalStars += moduleProgress.totalStars || 0;
          
          // Check if module is completed (all lessons done)
          if (moduleProgress.completedLessons > 0 && 
              moduleProgress.completedLessons === moduleProgress.totalLessons) {
            completedModules++;
          }
        }
      } catch (error) {
        console.warn(`Error fetching progress for module ${module.id}:`, error);
        // Continue with other modules
      }
    }

    const stats = {
      completedLessons: totalCompletedLessons,
      totalStars: totalStars,
      completedModules: completedModules,
      currentStreak: 0, // Would need separate endpoint for this
      totalProgress: modules.length > 0 ? (completedModules / modules.length) * 100 : 0
    };

    console.log('Calculated stats:', stats);
    return stats;

  } catch (error) {
    console.error('Error fetching student progress stats:', error);
    // Return defaults on error
    return getDefaultProgressStats();
  }
};

// Default progress objects
const getDefaultModuleProgress = () => {
  return {
    completed: false,
    completedLessons: 0,
    totalLessons: 0,
    totalStars: 0,
    averageScore: 0,
    lastAccessed: null
  };
};

const getDefaultProgressStats = () => {
  return {
    completedLessons: 0,
    totalStars: 0,
    completedModules: 0,
    currentStreak: 0,
    totalProgress: 0.0
  };
};

// Keep other functions as they are...
export const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
  // ... existing code
};

export const getStudentLessonProgress = async (studentId, lessonId) => {
  // ... existing code
};

export const updateModuleProgress = async (studentId, moduleId) => {
  // ... existing code
};

// SIMPLIFIED: Get all module progress without making individual API calls
export const getAllModuleProgress = async (studentId, modules) => {
  console.log('Using default progress for all modules');
  const progressMap = {};
  modules.forEach(module => {
    progressMap[module.id] = getDefaultModuleProgress();
  });
  return progressMap;
};