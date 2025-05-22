// progressService.js - Enhanced with better error handling and logging

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Save student lesson progress
export const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
  try {
    console.log('Saving lesson progress:', { studentId, lessonId, progressData });
    
    const response = await fetch(`${API_BASE_URL}/student-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: parseInt(studentId),
        lessonId: parseInt(lessonId),
        ...progressData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to save lesson progress:', errorText);
      throw new Error(`Failed to save lesson progress: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Lesson progress saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error in saveStudentLessonProgress:', error);
    throw error;
  }
};

// Update module progress
export const updateModuleProgress = async (studentId, moduleId) => {
  try {
    console.log('Updating module progress:', { studentId, moduleId });
    
    const response = await fetch(`${API_BASE_URL}/module-progress/update/student/${studentId}/module/${moduleId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update module progress:', errorText);
      throw new Error(`Failed to update module progress: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Module progress updated successfully:', result);
    return result;
  } catch (error) {
    console.error('Error in updateModuleProgress:', error);
    throw error;
  }
};

// Get student lesson progress
export const getStudentLessonProgress = async (studentId, lessonId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/student-progress/student/${studentId}/lesson/${lessonId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No progress found - this is normal for new lessons
        return null;
      }
      throw new Error(`Failed to get lesson progress: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting lesson progress:', error);
    throw error;
  }
};

// Get student module progress
export const getStudentModuleProgress = async (studentId, moduleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/module-progress/student/${studentId}/module/${moduleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to get module progress: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting module progress:', error);
    throw error;
  }
};

// Get student module progress stats
export const getStudentModuleProgressStats = async (studentId, moduleId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/module-progress/student/${studentId}/module/${moduleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return default stats if no progress found
        return {
          completedLessons: 0,
          totalLessons: 0,
          totalStars: 0,
          averageScore: 0,
          completed: false
        };
      }
      throw new Error(`Failed to get module progress stats: ${response.status}`);
    }

    const moduleProgress = await response.json();
    
    // Transform the response to match expected stats format
    return {
      completedLessons: moduleProgress.completedLessons || 0,
      totalLessons: moduleProgress.totalLessons || 0,
      totalStars: moduleProgress.totalStars || 0,
      averageScore: moduleProgress.averageScore || 0,
      completed: moduleProgress.completed || false
    };
  } catch (error) {
    console.error('Error getting module progress stats:', error);
    // Return default stats on error
    return {
      completedLessons: 0,
      totalLessons: 0,
      totalStars: 0,
      averageScore: 0,
      completed: false
    };
  }
};