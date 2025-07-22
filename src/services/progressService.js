// const API_BASE_URL = 'http://localhost:8080/api/progress';

// export const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/lesson`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         studentId: studentId,
//         lessonId: lessonId,
//         score: progressData.score,
//         maxScore: progressData.maxScore,
//         completed: progressData.completed,
//         starsEarned: progressData.starsEarned
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to save progress');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error saving lesson progress:', error);
//     throw error;
//   }
// };

// export const getStudentLessonProgress = async (studentId, lessonId) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/lesson/${studentId}/${lessonId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.status === 404) {
//       return null;
//     }

//     if (!response.ok) {
//       throw new Error('Failed to fetch lesson progress');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching lesson progress:', error);
//     throw error;
//   }
// };

// export const getStudentModuleProgress = async (studentId, moduleId) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/module/${studentId}/${moduleId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.status === 404) {
//       return null;
//     }

//     if (!response.ok) {
//       throw new Error('Failed to fetch module progress');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching module progress:', error);
//     throw error;
//   }
// };

// export const updateModuleProgress = async (studentId, moduleId) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/module/${studentId}/${moduleId}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to update module progress');
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error updating module progress:', error);
//     throw error;
//   }
// };

// export const getStudentModuleProgressStats = async (studentId, moduleId) => {
//   try {
//     const moduleProgress = await getStudentModuleProgress(studentId, moduleId);
//     return moduleProgress;
//   } catch (error) {
//     console.error('Error fetching module progress stats:', error);
//     return null;
//   }
// };


const API_BASE_URL = 'http://localhost:8080/api/progress';

export const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lesson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: studentId,
        lessonId: lessonId,
        score: progressData.score,
        maxScore: progressData.maxScore,
        completed: progressData.completed,
        starsEarned: progressData.starsEarned
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving lesson progress:', error);
    throw error;
  }
};

export const getStudentLessonProgress = async (studentId, lessonId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lesson/${studentId}/${lessonId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch lesson progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    throw error;
  }
};

export const getStudentModuleProgress = async (studentId, moduleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/module/${studentId}/${moduleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch module progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching module progress:', error);
    throw error;
  }
};

export const updateModuleProgress = async (studentId, moduleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/module/${studentId}/${moduleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to update module progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating module progress:', error);
    throw error;
  }
};

// UPDATED FUNCTION - Now calls the stats endpoint instead of module endpoint
export const getStudentModuleProgressStats = async (studentId, moduleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats/${studentId}/${moduleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Return default stats if endpoint fails
      return {
        completedLessons: 0,
        totalStars: 0,
        completedModules: 0,
        currentStreak: 0,
        totalProgress: 0.0
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching module progress stats:', error);
    // Return default stats instead of null
    return {
      completedLessons: 0,
      totalStars: 0,
      completedModules: 0,
      currentStreak: 0,
      totalProgress: 0.0
    };
  }
};