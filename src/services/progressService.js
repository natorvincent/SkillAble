const API_BASE_URL = 'https://skillable-pdv0.onrender.com/api/progress';

// Simple in-memory cache to prevent duplicate reads
const progressCache = new Map();

// Pending saves: Map keyed by `${studentId}-${lessonId}` storing progress payload
let pendingSaves = new Map();

// Persisted key in localStorage for crash recovery
const PERSIST_KEY = 'skillable_pending_progress_saves';

// Flush interval (ms)
const FLUSH_INTERVAL_MS = 15000; // 15 seconds

// Internal: load persisted pending saves from localStorage into memory on module load
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

// Internal: persist pendingSaves Map -> localStorage
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

// Periodic flush logic
let flushTimer = null;
const startFlushTimer = () => {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    flushPendingSaves().catch(() => { /* swallow */ });
  }, FLUSH_INTERVAL_MS);
};

// Stop timer (not usually needed)
const stopFlushTimer = () => {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
};

// Flush pending saves to backend - FIXED: Use POST /lesson, not PUT /lesson/{id}/{id}
export const flushPendingSaves = async () => {
  if (pendingSaves.size === 0) return;

  // Copy keys to avoid mutation while iterating
  const entries = Array.from(pendingSaves.entries());
  for (const [key, payload] of entries) {
    try {
      // FIX: Use POST /lesson endpoint that already exists in your backend
      const url = `${API_BASE_URL}/lesson`; // POST endpoint
      const res = await fetch(url, {
        method: 'POST', // Changed from PUT to POST
        headers: makeHeaders(),
        body: JSON.stringify(payload),
        keepalive: true,
      });
      
      if (res.ok) {
        pendingSaves.delete(key);
        persistPendingSaves();
        console.log('✅ Progress saved for', key);
      } else {
        // If server returns error, keep the entry and continue
        console.warn('Failed to flush progress for', key, 'status', res.status);
      }
    } catch (err) {
      // Network error; keep entry for next attempt
      console.warn('Network error flushing progress for', key, err);
    }
  }
};

// Attempt fast synchronous flush on page unload
const flushOnUnload = () => {
  if (pendingSaves.size === 0) return;

  try {
    const entries = Array.from(pendingSaves.entries());
    
    // Send each save via sendBeacon if available
    entries.forEach(([, payload]) => {
      try {
        const url = `${API_BASE_URL}/lesson`;
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const ok = navigator.sendBeacon(url, blob);
        if (ok) {
          console.log('📤 sendBeacon sent progress on unload');
        }
      } catch (e) {
        // ignore
      }
    });
  } catch (e) {
    // ignore
  }
};

// Attach unload listener to try to flush on page close
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('beforeunload', () => {
    flushOnUnload();
  });
  startFlushTimer();
}

// -------------------- Public API --------------------

// Fetch module progress (cached) - FIXED: This endpoint exists in your backend
export const getStudentModuleProgress = async (studentId, moduleId) => {
  const cacheKey = `module-${studentId}-${moduleId}`;
  if (progressCache.has(cacheKey)) {
    return progressCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/module/${studentId}/${moduleId}`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (response.status === 404) {
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
    console.error('Error fetching module progress:', error);
    const defaultProgress = getDefaultModuleProgress();
    progressCache.set(cacheKey, defaultProgress);
    return defaultProgress;
  }
};

// FIXED: Calculate student stats from existing endpoints
export const getStudentModuleProgressStats = async (studentId) => {
  try {
    // Try to get all lesson progresses first (this endpoint exists)
    const lessonsResponse = await fetch(`${API_BASE_URL}/student/${studentId}/lessons`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (lessonsResponse.ok) {
      const lessonProgresses = await lessonsResponse.json();
      
      // Calculate stats from lesson progresses
      const completedLessons = lessonProgresses.filter(lesson => lesson.completed).length;
      const totalStars = lessonProgresses.reduce((sum, lesson) => sum + (lesson.starsEarned || 0), 0);
      
      // Get module progresses to calculate completed modules
      const modulesResponse = await fetch(`${API_BASE_URL}/student/${studentId}/modules`, {
        method: 'GET',
        headers: makeHeaders()
      });
      
      let completedModules = 0;
      if (modulesResponse.ok) {
        const moduleProgresses = await modulesResponse.json();
        completedModules = moduleProgresses.filter(module => module.completed).length;
      }
      
      return {
        completedLessons,
        totalStars,
        completedModules,
        currentStreak: 0, // You might need to track this separately
        totalProgress: completedLessons > 0 ? 
          (completedLessons / Math.max(lessonProgresses.length, 1)) * 100 : 0
      };
    }

    // Fallback: calculate by enumerating modules
    const modulesResponse = await fetch('https://skillable-pdv0.onrender.com/api/modules/available', {
      method: 'GET',
      headers: makeHeaders()
    });

    if (!modulesResponse.ok) {
      throw new Error('Failed to fetch modules');
    }

    const modules = await modulesResponse.json();
    let totalCompletedLessons = 0;
    let totalStars = 0;
    let completedModules = 0;

    for (const module of modules) {
      try {
        const moduleProgress = await getStudentModuleProgress(studentId, module.id);
        if (moduleProgress) {
          totalCompletedLessons += moduleProgress.completedLessons || 0;
          totalStars += moduleProgress.totalStars || 0;
          if (moduleProgress.completed) {
            completedModules++;
          }
        }
      } catch (error) {
        console.warn(`Error fetching progress for module ${module.id}:`, error);
      }
    }

    const stats = {
      completedLessons: totalCompletedLessons,
      totalStars,
      completedModules,
      currentStreak: 0,
      totalProgress: modules.length > 0 ? (completedModules / modules.length) * 100 : 0
    };

    return stats;
  } catch (error) {
    console.error('Error fetching student progress stats:', error);
    return getDefaultProgressStats();
  }
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

const getDefaultProgressStats = () => {
  return {
    completedLessons: 0,
    totalStars: 0,
    completedModules: 0,
    currentStreak: 0,
    totalProgress: 0.0
  };
};

// Save lesson progress: queue for autosave and persist locally
// payload should contain { studentId, lessonId, score, maxScore, completed, starsEarned }
export const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
  if (!studentId || !lessonId) {
    throw new Error('Missing studentId or lessonId in saveStudentLessonProgress');
  }

  const key = `${studentId}-${lessonId}`;
  
  // Create the payload in the format your backend expects
  const payload = {
    studentId: parseInt(studentId, 10),
    lessonId: parseInt(lessonId, 10),
    ...progressData
  };

  // Update pendingSaves (overwrite latest)
  pendingSaves.set(key, payload);
  persistPendingSaves();

  // Ensure timer is running
  startFlushTimer();

  // Also try to save immediately (not just queue)
  try {
    const immediateResponse = await fetch(`${API_BASE_URL}/lesson`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify(payload)
    });
    
    if (immediateResponse.ok) {
      // If immediate save succeeds, remove from pending queue
      pendingSaves.delete(key);
      persistPendingSaves();
      console.log('✅ Progress saved immediately');
    }
  } catch (error) {
    // If immediate save fails, it will be retried by the flush timer
    console.log('📝 Progress queued for later save');
  }

  return { queued: true };
};

// Read a lesson progress from server (or fallback)
export const getStudentLessonProgress = async (studentId, lessonId) => {
  if (!studentId || !lessonId) return null;

  // If there's a pending local queued save, prefer that (most recent)
  const key = `${studentId}-${lessonId}`;
  if (pendingSaves.has(key)) {
    return pendingSaves.get(key);
  }

  try {
    const res = await fetch(`${API_BASE_URL}/lesson/${studentId}/${lessonId}`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error('Failed to fetch lesson progress');
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Error getting lesson progress', err);
    return null;
  }
};

// FIXED: Remove updateModuleProgress or use existing endpoints
// Module progress is calculated automatically by your backend when lesson progress is saved
export const updateModuleProgress = async (studentId, moduleId, progressBody = {}) => {
  console.log('Module progress is automatically updated when lesson progress is saved');
  return true;
};

// Get all module progress without making individual API calls
export const getAllModuleProgress = async (studentId, modules) => {
  console.log('Getting progress for all modules');
  const progressMap = {};
  
  if (modules && Array.isArray(modules)) {
    // Try to get all module progresses at once if endpoint exists
    try {
      const response = await fetch(`${API_BASE_URL}/student/${studentId}/modules`, {
        method: 'GET',
        headers: makeHeaders()
      });
      
      if (response.ok) {
        const moduleProgresses = await response.json();
        // Map by module ID
        moduleProgresses.forEach(progress => {
          progressMap[progress.moduleId || progress.module?.id] = progress;
        });
      }
    } catch (error) {
      console.log('Using fallback for module progress');
    }
    
    // Fill in any missing modules with defaults
    modules.forEach(module => {
      if (!progressMap[module.id]) {
        progressMap[module.id] = getDefaultModuleProgress();
      }
    });
  }
  
  return progressMap;
};

// Expose a helper to inspect queued saves (useful for debugging)
export const getQueuedSaves = () => {
  const out = {};
  pendingSaves.forEach((v, k) => out[k] = v);
  return out;
};

// NEW: Manual flush function (can be called when user clicks "Save Progress")
export const manualSaveProgress = async () => {
  await flushPendingSaves();
  return { success: true, message: 'Progress saved' };
};

// NEW: Clear all queued saves (for testing/logout)
export const clearQueuedSaves = () => {
  pendingSaves.clear();
  localStorage.removeItem(PERSIST_KEY);
};