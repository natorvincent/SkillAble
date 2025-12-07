import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Divider,
  IconButton,
  Chip,
  Card, 
  CardContent,
  CardMedia,
  CardActions,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
  Stack,
  LinearProgress
} from '@mui/material';
import {
  BookOutlined,
  PlayArrow,
  CheckCircle,
  AccessTime,
  ArrowBack,
  QuizOutlined,
  DragIndicatorOutlined,
  VideoLibraryOutlined,
  TextSnippetOutlined,
  Lock,
  LockOpen,
  Star as StarIcon,
  Score as ScoreIcon
} from '@mui/icons-material';
import Navbar from './Navbar';
import Background from './Background';
import { 
  getStudentModuleProgress, 
  getStudentModuleProgressStats,
  getStudentLessonProgress 
} from '../services/progressService';
import module2 from "../assets/hygiene.png";
import module1 from "../assets/culinary-skills.jpg";
import module3 from "../assets/chores.jpg";
import { useGlobalBackgroundMusic } from "./background music/useGlobalBackgroundMusic";
import AudioToggleButton from "../components/background music/AudioToggleButton";
import backgroundMusic from '../assets/background-music.mp3';
import exitbtn from '../assets/exitbtn.png'; // ADD THIS IMPORT



function ModuleDetails() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [moduleProgress, setModuleProgress] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const { audioPlaying, toggleAudio } = useGlobalBackgroundMusic(backgroundMusic);

  const moduleImages = [
  module1,
  module2,
  module3
];


  useEffect(() => {
    Promise.all([
      fetchModuleDetails(),
      fetchLessons(),
      fetchModuleProgress(),
      fetchLessonProgress()
    ])
      .then(() => setLoading(false))
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to load module data. Please try again.');
        setLoading(false);
      });
  }, [moduleId]);
  
  const getModuleImage = (moduleId) => {
    const index = moduleId ? (moduleId - 1) % moduleImages.length : 0;
    return moduleImages[index];
  };

  const fetchModuleProgress = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
      
      if (!studentId || !moduleId) return;
      
      const moduleProgressResponse = await getStudentModuleProgress(studentId, moduleId);
      setModuleProgress(moduleProgressResponse);
      
      const progressStatsResponse = await getStudentModuleProgressStats(studentId, moduleId);
      setProgressStats(progressStatsResponse);
    } catch (error) {
      console.error('Error fetching module progress:', error);
    }
  };

  const fetchLessonProgress = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
      
      if (!studentId || !moduleId) return;
      
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/lessons/module/${moduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }

      const lessonsData = await response.json();
      
      const progressPromises = lessonsData.map(async (lesson) => {
        try {
          const progressResponse = await getStudentLessonProgress(studentId, lesson.id);
          return { lessonId: lesson.id, progress: progressResponse };
        } catch (error) {
          return { lessonId: lesson.id, progress: null };
        }
      });
      
      const progressResults = await Promise.all(progressPromises);
      
      const progressMap = {};
      progressResults.forEach(item => {
        progressMap[item.lessonId] = item.progress;
      });
      
      setLessonProgress(progressMap);
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  const fetchModuleDetails = async () => {
    try {
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/modules/${moduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch module details');
      }

      const data = await response.json();
      setModule(data);
      return data;
    } catch (err) {
      console.error('Error fetching module details:', err);
      setError('Failed to load module details. Please try again.');
      throw err;
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/lessons/module/${moduleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }

      const data = await response.json();
      setLessons(data);
      return data;
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setError('Failed to load lessons. Please try again.');
      throw err;
    }
  };



  const handleStartLesson = (lesson, index) => {
  console.log("🚀 Starting lesson:", lesson);
  console.log("📍 Module ID:", moduleId);
  
  // Check if the lesson has a custom activity path
  if (lesson.activityPath) {
    // Special handling for hygiene Level 2 that needs moduleId
    if (lesson.activityPath === '/lesson/hygiene/level-2') {
      const navigationPath = `${lesson.activityPath}/${moduleId}/${lesson.id}`;
      console.log("📍 Navigating to hygiene level 2:", navigationPath);
      navigate(navigationPath);
    } 
    // ADD THIS: Special handling for hygiene Level 3 that also needs moduleId
    else if (lesson.activityPath === '/lesson/hygiene/level-3') {
      const navigationPath = `${lesson.activityPath}/${moduleId}/${lesson.id}`;
      console.log("📍 Navigating to hygiene level 3:", navigationPath);
      navigate(navigationPath);
    }
    else {
      // All other lessons (including hygiene level 1) use original format
      const navigationPath = `${lesson.activityPath}/${lesson.id}`;
      console.log("📍 Navigating to other lesson:", navigationPath);
      navigate(navigationPath);
    }
  } else {
    // Default lesson route
    console.log("📍 Navigating to default lesson route");
    navigate(`/lessons/${lesson.id}`);
  }
};
  const getLessonIcon = (activityType) => {
    switch (activityType) {
      case 'MULTIPLE_CHOICE':
        return <QuizOutlined fontSize="large" />;
      case 'DRAG_DROP_SEQUENCE':
      case 'DRAG_DROP':
        return <DragIndicatorOutlined fontSize="large" />;
      case 'VIDEO_LESSON':
        return <VideoLibraryOutlined fontSize="large" />;
      case 'TEXT_LESSON':
        return <TextSnippetOutlined fontSize="large" />;
      default:
        return <BookOutlined fontSize="large" />;
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    
    if (remainingMins === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMins} min`;
  };

  const isLessonCompleted = (lesson) => {
    return lessonProgress[lesson.id]?.completed === true;
  };

  // MODIFIED: Always return false to unlock all lessons
  const isLessonLocked = (lesson, index) => {
    return false; // All lessons are unlocked
  };

  const getLessonProgressPercentage = () => {
    if (!lessons || lessons.length === 0) return 0;
    
    const completedCount = lessons.filter(lesson => isLessonCompleted(lesson)).length;
    return (completedCount / lessons.length) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <Background />
      </div>
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Navbar />
        
        <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 2 }}>
          <Button
            onClick={() => navigate('/studentdashboard')}
            sx={{ 
              padding: '1px',
              minWidth: 'auto',
              backgroundColor: 'transparent',
              boxShadow: 'none',
              marginLeft: { xs: 0, sm: '-60px', md: '-120px' },
              '&:hover': {
                backgroundColor: 'transparent',
                boxShadow: 'none',
                transform: 'scale(1.1)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            <img 
              src={exitbtn} 
              alt="Exit" 
              style={{ 
                width: '100%',
                maxWidth: '85px',
                height: 'auto',
                maxHeight: '85px'
              }} 
            />
          </Button>
          
          <AudioToggleButton audioPlaying={audioPlaying} toggleAudio={toggleAudio} />
        </Box>
          
          <Paper
            sx={{
              backgroundColor: 'transparent'
            }}
          >
            
            {lessons.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                This module doesn't have any lessons yet.
              </Alert>
            ) : (
              <Box sx={{ overflowX: 'auto', width: '100%', pb: 2 }}>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ 
                    pb: 2,
                    alignItems: { xs: 'center', sm: 'flex-start' }
                  }}
                >
                  {lessons.map((lesson, index) => {
                    const completed = isLessonCompleted(lesson);
                    const locked = isLessonLocked(lesson, index); // Now always returns false
                    const starsEarned = lessonProgress[lesson.id]?.starsEarned || 0;
                    const lessonTitle = lesson?.title || `Lesson ${index + 1}`;
                    const lessonDescription = lesson?.description || '';
                    const activityType = lesson?.activityType || lesson?.type || '';
                    const formattedActivityType = typeof activityType === 'string' 
                      ? activityType.replace(/_/g, ' ') 
                      : '';
                    
                    const hasActivity = lesson.activity && lesson.activityPath;
                    
                    return (
                      <Card
                        key={lesson.id || index}
                        sx={{
                          width: { xs: '100%', sm: 280 },
                          maxWidth: { xs: '400px', sm: 280 },
                          height: { xs: 'auto', sm: 350 },
                          minHeight: { xs: 300, sm: 350 },
                          borderRadius: '20px 20px 50px 20px',
                          border: '1px solid',
                          borderColor: completed ? '#4caf50' : '#e0e0e0',
                          backgroundColor: completed ? 'rgba(76, 175, 80, 0.05)' : 'white',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            boxShadow: '0px 10px 20px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        {completed && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 10, 
                              right: 10, 
                              bgcolor: 'success.main',
                              color: 'white',
                              borderRadius: '50%',
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 1,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                          >
                            <CheckCircle />
                          </Box>
                        )}
                        
                        {hasActivity && !completed && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 10, 
                              right: 10, 
                              bgcolor: '#4a6cf7',
                              color: 'white',
                              borderRadius: '12px',
                              px: 1,
                              py: 0.5,
                              zIndex: 1,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                          >
                            <Typography variant="caption" fontWeight="bold">
                              Interactive
                            </Typography>
                          </Box>
                        )}
                        
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            bgcolor: completed ? '#4caf50' : '#4a6cf7', 
                            color: 'white',
                            height: { xs: 80, sm: 100 },
                            position: 'relative'
                          }}
                        >
                          {completed ? (
                            <CheckCircle sx={{ fontSize: { xs: 36, sm: 42, md: 48 } }} />
                          ) : (
                            getLessonIcon(activityType) 
                          )}
                          <Typography
                            variant="h4"
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 10,
                              fontWeight: 'bold',
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                            }}
                          >
                            {index + 1}
                          </Typography>
                        </Box>
                        <CardContent sx={{ pt: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="h5" component="div" gutterBottom title={lessonTitle}
                            sx={{ 
                              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {lessonTitle}
                          </Typography>
  
                        </CardContent>
                        <CardActions sx={{ 
                          pt: 10, 
                          pb: 0, 
                          px: 0, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'flex-end' // Changed from 'flex-start' to 'flex-end'
                        }}>
                          <Button
                            variant="contained"
                            onClick={() => handleStartLesson(lesson, index)}
                            disabled={false} 
                            sx={{
                              backgroundColor: 'transparent',
                              boxShadow: 'none',
                              minWidth: 'auto',
                              padding: '1px',
                              '&:hover': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                transform: 'scale(1.2)',
                                transition: 'transform 0.2s ease-in-out'
                              },
                              '&:active': {
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <img 
                              src="/assets/playbtn.png" 
                              alt="Start Lesson" 
                              style={{ 
                                width: '100%',
                                maxWidth: '85px',
                                height: 'auto',
                                maxHeight: '85px'
                              }} 
                            />
                          </Button>
                        </CardActions>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Paper>
        </Container>
      </div>
      
      <Snackbar
        open={notification !== null}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notification && (
          <Alert
            onClose={() => setNotification(null)}
            severity={notification.severity || 'info'}
            sx={{ width: '100%' }}
          >
            {notification.message || ''}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
}

export default ModuleDetails;