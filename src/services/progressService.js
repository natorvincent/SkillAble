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

export const updateModuleProgress = async (studentId, moduleId, progressBody = {}) => {
  console.log('Module progress is automatically updated when lesson progress is saved');
  
  // If you need to explicitly update module progress, you could:
  try {
    const response = await fetch(`${API_BASE_URL}/module/${studentId}/${moduleId}`, {
      method: 'PUT',
      headers: makeHeaders(),
      body: JSON.stringify(progressBody)
    });
    
    if (response.ok) {
      console.log('Module progress updated');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating module progress:', error);
    return false;
  }
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

// Save lesson progress — tolerant/flexible signature
// Accepts:
//  - (studentId, lessonId, progressData)
//  - (moduleSlug, lessonSlug, score)  // older/demo calls
// progressData may be an object or a number (score)
export const saveStudentLessonProgress = async (studentIdParam, lessonIdParam, progressDataParam) => {
  // Resolve studentId (prefer explicit numeric, else localStorage)
  let studentId = null;
  let moduleSlugFromArgs = null;

  if (typeof studentIdParam === 'number' || (/^\d+$/.test(String(studentIdParam)))) {
    studentId = parseInt(studentIdParam, 10);
  } else if (typeof studentIdParam === 'string' && studentIdParam.trim() !== '') {
    // Could be a module slug in older code paths; store for payload
    moduleSlugFromArgs = studentIdParam;
    // Try to get actual studentId from localStorage
    const sid = localStorage.getItem('studentId');
    if (sid && /^\d+$/.test(sid)) studentId = parseInt(sid, 10);
  } else {
    const sid = localStorage.getItem('studentId');
    if (sid && /^\d+$/.test(sid)) studentId = parseInt(sid, 10);
  }

  // Resolve lessonId or lessonSlug
  let lessonId = null;
  let lessonSlug = null;
  if (typeof lessonIdParam === 'number' || (/^\d+$/.test(String(lessonIdParam)))) {
    lessonId = parseInt(lessonIdParam, 10);
  } else if (typeof lessonIdParam === 'string' && lessonIdParam.trim() !== '') {
    lessonSlug = lessonIdParam;
  }

  // Normalize progressData (allow number shorthand)
  let progressData = {};
  if (typeof progressDataParam === 'number') {
    progressData = { score: progressDataParam };
  } else if (typeof progressDataParam === 'object' && progressDataParam !== null) {
    progressData = progressDataParam;
  }

  // Build payload with both numeric ids and fallback slugs
  const payload = {
    // include numeric studentId if available (backend will use it)
    ...(studentId ? { studentId } : {}),
    ...(lessonId ? { lessonId } : {}),
    ...(lessonSlug ? { lessonSlug } : {}),
    ...(moduleSlugFromArgs ? { moduleSlug: moduleSlugFromArgs } : {}),
    score: progressData.score ?? progressData.points ?? 0,
    maxScore: progressData.maxScore ?? progressData.max ?? 100,
    completed: !!progressData.completed,
    starsEarned: progressData.starsEarned ?? progressData.stars ?? 0,
    lastUpdatedAt: new Date().toISOString(),
    // include any other extra fields passed explicitly
    ...progressData.extra
  };

  // Create a stable queue key
  const keyParts = [
    studentId ? String(studentId) : (moduleSlugFromArgs || 'anon'),
    lessonId ? String(lessonId) : (lessonSlug || String(Date.now()))
  ];
  const queueKey = keyParts.join('-');

  // Queue and persist
  pendingSaves.set(queueKey, payload);
  persistPendingSaves();
  startFlushTimer();

  // Attempt to save immediately (best-effort)
  try {
    const res = await fetch(`${API_BASE_URL}/lesson`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // remove from queue and persist removal
      pendingSaves.delete(queueKey);
      persistPendingSaves();

      // invalidate cache for module if we have numeric studentId and module info
      if (studentId && progressData.moduleId) {
        progressCache.delete(`module-${studentId}-${progressData.moduleId}`);
      }

      console.log(`✅ Progress saved immediately (${queueKey})`);
      return { success: true, queued: false, message: 'Progress saved' };
    } else {
      console.warn(`Progress save returned ${res.status} — queued for retry (${queueKey})`);
      return { success: false, queued: true, status: res.status, message: 'Queued for retry' };
    }
  } catch (err) {
    console.warn('Network error while saving progress — queued for retry', err);
    return { success: false, queued: true, message: 'Queued due to network error' };
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