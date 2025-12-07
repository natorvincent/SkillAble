const API_BASE_URL = 'https://skillable-pdv0.onrender.com/api/progress';

// Simple in-memory cache
const progressCache = new Map();

// Pending saves
let pendingSaves = new Map();
const PERSIST_KEY = 'skillable_pending_progress_saves';
const FLUSH_INTERVAL_MS = 30000; // 30 seconds

// Load persisted saves
(function loadPersistedSaves() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        Object.entries(obj).forEach(([k, v]) => pendingSaves.set(k, v));
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
    pendingSaves.forEach((v, k) => {
      plain[k] = v;
    });
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

// Flush pending saves to backend
export const flushPendingSaves = async () => {
  if (pendingSaves.size === 0) return;

  const entries = Array.from(pendingSaves.entries());
  
  for (const [key, payload] of entries) {
    try {
      // Use POST /lesson endpoint that exists in your backend
      const res = await fetch(`${API_BASE_URL}/lesson`, {
        method: 'POST',
        headers: makeHeaders(),
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        pendingSaves.delete(key);
        persistPendingSaves();
        console.log('✅ Progress saved for', key);
      } else {
        console.warn('Failed to save progress for', key, 'status', res.status);
      }
    } catch (err) {
      console.warn('Network error saving progress for', key, err);
    }
  }
};

// Start periodic flush
let flushTimer = null;
const startFlushTimer = () => {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    flushPendingSaves().catch(() => {});
  }, FLUSH_INTERVAL_MS);
};

// -------------------- Public API --------------------

// 1. Get module progress - THIS ENDPOINT EXISTS
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

    // Handle 404 - return default progress
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

// 2. Get lesson progress - THIS ENDPOINT EXISTS
export const getStudentLessonProgress = async (studentId, lessonId) => {
  // Check pending saves first (most recent)
  const key = `${studentId}-${lessonId}`;
  if (pendingSaves.has(key)) {
    return pendingSaves.get(key);
  }

  try {
    console.log(`Fetching lesson progress: ${studentId}/${lessonId}`);
    const response = await fetch(`${API_BASE_URL}/lesson/${studentId}/${lessonId}`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (response.status === 404) {
      console.log(`No lesson progress found for ${studentId}/${lessonId}`);
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

// 3. Save lesson progress - THIS ENDPOINT EXISTS
export const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
  if (!studentId || !lessonId) {
    throw new Error('Missing studentId or lessonId');
  }

  const key = `${studentId}-${lessonId}`;
  
  // Prepare payload in backend format
  const payload = {
    studentId: parseInt(studentId, 10),
    lessonId: parseInt(lessonId, 10),
    score: progressData.score || 0,
    maxScore: progressData.maxScore || 100,
    completed: progressData.completed || false,
    starsEarned: progressData.starsEarned || 0
  };

  console.log('Saving progress:', payload);

  // Add to pending queue
  pendingSaves.set(key, payload);
  persistPendingSaves();
  startFlushTimer();

  // Try to save immediately
  try {
    const response = await fetch(`${API_BASE_URL}/lesson`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // Clear from pending queue if saved successfully
      pendingSaves.delete(key);
      persistPendingSaves();
      
      // Clear cache for this module to force refresh
      progressCache.delete(`module-${studentId}-${progressData.moduleId}`);
      
      console.log('✅ Progress saved immediately');
      return { success: true, message: 'Progress saved' };
    } else {
      console.warn('Progress save failed, will retry later');
      return { success: false, queued: true, message: 'Progress queued for retry' };
    }
  } catch (error) {
    console.warn('Network error saving progress, will retry later:', error);
    return { success: false, queued: true, message: 'Progress queued due to network error' };
  }
};

// 4. Get student stats - CALCULATE FROM EXISTING ENDPOINTS
export const getStudentModuleProgressStats = async (studentId) => {
  try {
    // Get all lesson progresses (this endpoint exists)
    console.log('Fetching all lesson progresses for student', studentId);
    const lessonsResponse = await fetch(`${API_BASE_URL}/student/${studentId}/lessons`, {
      method: 'GET',
      headers: makeHeaders()
    });

    let completedLessons = 0;
    let totalStars = 0;

    if (lessonsResponse.ok) {
      const lessonProgresses = await lessonsResponse.json();
      console.log('Lesson progresses:', lessonProgresses);
      
      completedLessons = lessonProgresses.filter(lesson => lesson.completed).length;
      totalStars = lessonProgresses.reduce((sum, lesson) => sum + (lesson.starsEarned || 0), 0);
    }

    // Get all module progresses (this endpoint exists)
    console.log('Fetching all module progresses for student', studentId);
    const modulesResponse = await fetch(`${API_BASE_URL}/student/${studentId}/modules`, {
      method: 'GET',
      headers: makeHeaders()
    });

    let completedModules = 0;
    let totalProgress = 0;

    if (modulesResponse.ok) {
      const moduleProgresses = await modulesResponse.json();
      console.log('Module progresses:', moduleProgresses);
      
      completedModules = moduleProgresses.filter(module => module.completed).length;
      
      // Calculate total progress as average of module completion rates
      if (moduleProgresses.length > 0) {
        const totalCompletionRate = moduleProgresses.reduce((sum, module) => {
          if (module.totalLessons > 0) {
            return sum + ((module.completedLessons || 0) / module.totalLessons) * 100;
          }
          return sum;
        }, 0);
        totalProgress = totalCompletionRate / moduleProgresses.length;
      }
    }

    const stats = {
      completedLessons,
      totalStars,
      completedModules,
      currentStreak: 0, // You can implement streak tracking later
      totalProgress
    };

    console.log('Calculated stats:', stats);
    return stats;

  } catch (error) {
    console.error('Error calculating stats:', error);
    return getDefaultProgressStats();
  }
};

// 5. Get all module progress at once
export const getAllModuleProgress = async (studentId, modules) => {
  console.log('Getting progress for all modules');
  const progressMap = {};

  if (modules && Array.isArray(modules)) {
    // Try to get all module progresses at once
    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentId}/modules`, {
        method: 'GET',
        headers: makeHeaders()
      });
      
      if (response.ok) {
        const moduleProgresses = await response.json();
        // Map by module ID
        moduleProgresses.forEach(progress => {
          const moduleId = progress.moduleId || (progress.module && progress.module.id);
          if (moduleId) {
            progressMap[moduleId] = progress;
          }
        });
      }
    } catch (error) {
      console.log('Using individual module progress fetches');
    }

    // Fill in any missing modules with defaults or individual fetches
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

  console.log('Progress map:', progressMap);
  return progressMap;
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

// Manual flush
export const manualSaveProgress = async () => {
  await flushPendingSaves();
  return { success: true, message: 'All progress saved' };
};

// Get queued saves for debugging
export const getQueuedSaves = () => {
  const out = {};
  pendingSaves.forEach((v, k) => out[k] = v);
  return out;
};

// Clear queued saves
export const clearQueuedSaves = () => {
  pendingSaves.clear();
  localStorage.removeItem(PERSIST_KEY);
  console.log('Cleared all queued saves');
};

// Start flush timer on load
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    if (pendingSaves.size > 0) {
      console.log('Attempting to save pending progress before unload...');
      // Try to save using sendBeacon
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
  
  // Start periodic flush
  setTimeout(() => startFlushTimer(), 5000);
}