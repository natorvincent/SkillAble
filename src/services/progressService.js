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

// Flush pending saves to backend
export const flushPendingSaves = async () => {
  if (pendingSaves.size === 0) return;

  // Copy keys to avoid mutation while iterating
  const entries = Array.from(pendingSaves.entries());
  for (const [key, payload] of entries) {
    const { studentId, lessonId } = payload;
    try {
      // Attempt PUT to upsert the lesson progress
      const url = `${API_BASE_URL}/lesson/${studentId}/${lessonId}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: makeHeaders(),
        body: JSON.stringify(payload),
        keepalive: true,
      });
      if (res.ok) {
        pendingSaves.delete(key);
        persistPendingSaves();
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
    // Send aggregated payload via sendBeacon if available
    if (navigator && typeof navigator.sendBeacon === 'function') {
      // Build a bulk endpoint payload
      const bulk = entries.map(([, payload]) => payload);
      const url = `${API_BASE_URL}/bulk-lessons`; // Backend may ignore; send anyway
      const blob = new Blob([JSON.stringify(bulk)], { type: 'application/json' });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) {
        // If sendBeacon accepted, clear persisted queue (we cannot verify server success)
        pendingSaves.clear();
        persistPendingSaves();
        return;
      }
    }

    // Fallback: try synchronous fetch with keepalive
    entries.forEach(([key, payload]) => {
      try {
        fetch(`${API_BASE_URL}/lesson/${payload.studentId}/${payload.lessonId}`, {
          method: 'PUT',
          headers: makeHeaders(),
          body: JSON.stringify(payload),
          keepalive: true
        });
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

// Fetch module progress (cached)
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

export const getStudentModuleProgressStats = async (studentId) => {
  try {
    const statsResponse = await fetch(`${API_BASE_URL}/student/${studentId}/stats`, {
      method: 'GET',
      headers: makeHeaders()
    });

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      return {
        completedLessons: stats.completedLessons || 0,
        totalStars: stats.totalStars || 0,
        completedModules: stats.completedModules || 0,
        currentStreak: stats.currentStreak || 0,
        totalProgress: stats.totalProgress || 0.0
      };
    }

    // Fallback: calculate by enumerating modules (same as prior logic)
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
          if (moduleProgress.completedLessons > 0 &&
            moduleProgress.completedLessons === moduleProgress.totalLessons) {
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
// payload should at least contain { studentId, lessonId, ...progressData }
export const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
  if (!studentId || !lessonId) {
    throw new Error('Missing studentId or lessonId in saveStudentLessonProgress');
  }

  const key = `${studentId}-${lessonId}`;
  // Augment payload with identifiers and timestamp
  const payload = {
    studentId,
    lessonId,
    ...progressData,
    lastUpdatedAt: new Date().toISOString()
  };

  // Update pendingSaves (overwrite latest)
  pendingSaves.set(key, payload);
  persistPendingSaves();

  // Ensure timer is running
  startFlushTimer();

  // Return quickly — queued for background upload
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

// Update module-level aggregated progress immediately (not queued)
// This attempts a direct PUT; failures are logged.
export const updateModuleProgress = async (studentId, moduleId, progressBody = {}) => {
  if (!studentId || !moduleId) {
    throw new Error('Missing studentId or moduleId for updateModuleProgress');
  }
  try {
    const url = `${API_BASE_URL}/module/${studentId}/${moduleId}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: makeHeaders(),
      body: JSON.stringify(progressBody),
      keepalive: true
    });
    if (!res.ok) {
      console.warn('updateModuleProgress returned non-ok status', res.status);
    }
    return res.ok;
  } catch (e) {
    console.warn('Network error in updateModuleProgress', e);
    return false;
  }
};
// Get all module progress without making individual API calls
// Returns a map of module IDs to default progress objects
export const getAllModuleProgress = async (studentId, modules) => {
  console.log('Getting progress for all modules');
  const progressMap = {};
  if (modules && Array.isArray(modules)) {
    modules.forEach(module => {
      progressMap[module.id] = getDefaultModuleProgress();
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