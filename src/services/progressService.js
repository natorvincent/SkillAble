const API_BASE_URL = 'https://skillable-pdv0.onrender.com/api/progress';

// Simple cache
const progressCache = new Map();

// Pending saves
let pendingSaves = new Map();
const PERSIST_KEY = 'skillable_pending_progress_saves';

// Load persisted saves on startup
(function loadPersistedSaves() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => pendingSaves.set(k, v));
        console.log('Loaded', pendingSaves.size, 'pending saves from localStorage');
      }
    }
  } catch (e) {
    console.warn('Could not restore pending saves from localStorage', e);
  }
})();

// Persist pending saves
const persistPendingSaves = () => {
  try {
    const plain = {};
    pendingSaves.forEach((v, k) => plain[k] = v);
    localStorage.setItem(PERSIST_KEY, JSON.stringify(plain));
  } catch (e) {
    console.warn('Failed to persist pending saves', e);
  }
};

// Helper to build auth headers
const makeHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

// -------------------- Public API --------------------

// 1. Save lesson progress - THIS IS THE MAIN ENDPOINT THAT WORKS
export const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
  if (!studentId || !lessonId) {
    throw new Error('Missing studentId or lessonId');
  }

  const key = `${studentId}-${lessonId}`;
  
  // Prepare payload
  const payload = {
    studentId: parseInt(studentId, 10),
    lessonId: parseInt(lessonId, 10),
    score: progressData.score || 0,
    maxScore: progressData.maxScore || 100,
    completed: progressData.completed !== undefined ? progressData.completed : true,
    starsEarned: progressData.starsEarned || 0
  };

  console.log('🚀 Saving progress payload:', payload);

  // Store in pending saves (for offline support)
  pendingSaves.set(key, payload);
  persistPendingSaves();

  try {
    // Try to save immediately
    const response = await fetch(`${API_BASE_URL}/lesson`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // Clear from pending if saved successfully
      pendingSaves.delete(key);
      persistPendingSaves();
      
      // Clear cache for this student/module
      if (progressData.moduleId) {
        progressCache.delete(`module-${studentId}-${progressData.moduleId}`);
      }
      
      const result = await response.json();
      console.log('✅ Progress saved successfully:', result);
      return { 
        success: true, 
        data: result,
        message: 'Progress saved successfully'
      };
    } else {
      console.warn('⚠️ Progress save failed, will retry later. Status:', response.status);
      return { 
        success: false, 
        queued: true,
        message: 'Progress queued for retry'
      };
    }
  } catch (error) {
    console.warn('🌐 Network error saving progress, will retry later:', error);
    return { 
      success: false, 
      queued: true,
      message: 'Progress queued due to network error'
    };
  }
};

// 2. Get lesson progress - Handle 404 gracefully
export const getStudentLessonProgress = async (studentId, lessonId) => {
  if (!studentId || !lessonId) {
    console.log('Missing studentId or lessonId, returning default');
    return getDefaultLessonProgress();
  }

  const key = `${studentId}-${lessonId}`;
  
  // Check pending saves first
  if (pendingSaves.has(key)) {
    console.log('Using pending save for lesson', key);
    return pendingSaves.get(key);
  }

  try {
    console.log(`Fetching lesson progress: ${studentId}/${lessonId}`);
    const response = await fetch(`${API_BASE_URL}/lesson/${studentId}/${lessonId}`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (response.status === 404) {
      console.log(`No lesson progress found for ${studentId}/${lessonId}, returning default`);
      return getDefaultLessonProgress();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch lesson progress`);
    }

    const progress = await response.json();
    console.log('Lesson progress received:', progress);
    return progress;
    
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return getDefaultLessonProgress();
  }
};

// 3. Get module progress - Handle 404 gracefully
export const getStudentModuleProgress = async (studentId, moduleId) => {
  const cacheKey = `module-${studentId}-${moduleId}`;
  
  // Return cached if available
  if (progressCache.has(cacheKey)) {
    return progressCache.get(cacheKey);
  }

  try {
    console.log(`Fetching module progress: ${studentId}/${moduleId}`);
    const response = await fetch(`${API_BASE_URL}/module/${studentId}/${moduleId}`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (response.status === 404) {
      console.log(`No module progress found for ${studentId}/${moduleId}, using default`);
      const defaultProgress = getDefaultModuleProgress();
      progressCache.set(cacheKey, defaultProgress);
      return defaultProgress;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch module progress`);
    }

    const progress = await response.json();
    console.log('Module progress received:', progress);
    progressCache.set(cacheKey, progress);
    return progress;
    
  } catch (error) {
    console.error('Error fetching module progress:', error);
    const defaultProgress = getDefaultModuleProgress();
    progressCache.set(cacheKey, defaultProgress);
    return defaultProgress;
  }
};

// 4. Get all lesson progresses for a student
export const getStudentLessonProgresses = async (studentId) => {
  try {
    console.log(`Fetching all lesson progresses for student ${studentId}`);
    const response = await fetch(`${API_BASE_URL}/student/${studentId}/lessons`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (!response.ok) {
      console.warn(`Failed to get lesson progresses: ${response.status}`);
      return [];
    }

    const progresses = await response.json();
    console.log(`Found ${progresses.length} lesson progresses`);
    return progresses;
    
  } catch (error) {
    console.error('Error fetching lesson progresses:', error);
    return [];
  }
};

// 5. Get all module progresses for a student
export const getStudentModuleProgresses = async (studentId) => {
  try {
    console.log(`Fetching all module progresses for student ${studentId}`);
    const response = await fetch(`${API_BASE_URL}/student/${studentId}/modules`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (!response.ok) {
      console.warn(`Failed to get module progresses: ${response.status}`);
      return [];
    }

    const progresses = await response.json();
    console.log(`Found ${progresses.length} module progresses`);
    return progresses;
    
  } catch (error) {
    console.error('Error fetching module progresses:', error);
    return [];
  }
};

// 6. Calculate student stats
export const getStudentModuleProgressStats = async (studentId) => {
  try {
    // Get all lesson progresses
    const lessonProgresses = await getStudentLessonProgresses(studentId);
    const completedLessons = lessonProgresses.filter(lesson => lesson.completed).length;
    const totalStars = lessonProgresses.reduce((sum, lesson) => sum + (lesson.starsEarned || 0), 0);

    // Get all module progresses
    const moduleProgresses = await getStudentModuleProgresses(studentId);
    const completedModules = moduleProgresses.filter(module => module.completed).length;

    // Calculate total progress
    let totalProgress = 0;
    if (moduleProgresses.length > 0) {
      const totalCompletionRate = moduleProgresses.reduce((sum, module) => {
        if (module.totalLessons > 0) {
          return sum + ((module.completedLessons || 0) / module.totalLessons) * 100;
        }
        return sum;
      }, 0);
      totalProgress = totalCompletionRate / moduleProgresses.length;
    }

    const stats = {
      completedLessons,
      totalStars,
      completedModules,
      currentStreak: 0,
      totalProgress
    };

    console.log('Calculated stats:', stats);
    return stats;

  } catch (error) {
    console.error('Error calculating stats:', error);
    return getDefaultProgressStats();
  }
};

// 7. Get all module progress
export const getAllModuleProgress = async (studentId, modules) => {
  console.log('Getting progress for all modules');
  const progressMap = {};

  if (modules && Array.isArray(modules)) {
    // Try to get all at once
    try {
      const moduleProgresses = await getStudentModuleProgresses(studentId);
      
      // Map by module ID
      moduleProgresses.forEach(progress => {
        const moduleId = progress.moduleId || (progress.module && progress.module.id);
        if (moduleId) {
          progressMap[moduleId] = progress;
        }
      });
    } catch (error) {
      console.log('Using individual fetches for modules');
    }

    // Fill in any missing modules
    for (const module of modules) {
      if (!progressMap[module.id]) {
        try {
          const moduleProgress = await getStudentModuleProgress(studentId, module.id);
          progressMap[module.id] = moduleProgress;
        } catch (error) {
          progressMap[module.id] = getDefaultModuleProgress();
        }
      }
    }
  }

  return progressMap;
};

// 8. Manual save all pending progress
export const manualSaveProgress = async () => {
  console.log('Manual save triggered');
  const entries = Array.from(pendingSaves.entries());
  let savedCount = 0;
  
  for (const [key, payload] of entries) {
    try {
      const response = await fetch(`${API_BASE_URL}/lesson`, {
        method: 'POST',
        headers: makeHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        pendingSaves.delete(key);
        savedCount++;
      }
    } catch (error) {
      console.warn('Failed to save', key, error);
    }
  }
  
  persistPendingSaves();
  return { success: true, saved: savedCount, message: `Saved ${savedCount} pending items` };
};

// 9. Get queued saves for debugging
export const getQueuedSaves = () => {
  const out = {};
  pendingSaves.forEach((v, k) => out[k] = v);
  return out;
};

// 10. Clear queued saves
export const clearQueuedSaves = () => {
  pendingSaves.clear();
  localStorage.removeItem(PERSIST_KEY);
  console.log('Cleared all queued saves');
};

// Default progress templates
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

const getDefaultLessonProgress = () => {
  return {
    completed: false,
    score: 0,
    maxScore: 100,
    starsEarned: 0,
    completedAt: null
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

// Try to save pending progress before page unload
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    if (pendingSaves.size > 0) {
      console.log('Attempting to save', pendingSaves.size, 'pending saves before unload');
      
      // Use sendBeacon for reliability
      pendingSaves.forEach((payload) => {
        try {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon(`${API_BASE_URL}/lesson`, blob);
        } catch (e) {
          // Ignore errors
        }
      });
    }
  });
}