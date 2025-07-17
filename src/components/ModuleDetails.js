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
import module1 from "../assets/hygiene.png";
import module2 from "../assets/culinary-skills.jpg";
import { useGlobalBackgroundMusic } from "./background music/useGlobalBackgroundMusic";
import AudioToggleButton from "../components/background music/AudioToggleButton";
import backgroundMusic from '../assets/background-music.mp3';


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
  module2
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
      
      const response = await fetch(`http://localhost:8080/api/lessons/module/${moduleId}`, {
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
      const response = await fetch(`http://localhost:8080/api/modules/${moduleId}`, {
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
      const response = await fetch(`http://localhost:8080/api/lessons/module/${moduleId}`, {
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

  const isLessonLocked = (lesson, index) => {
    if (index === 0) return false;
    
    const previousLesson = lessons[index - 1];
    if (previousLesson && !isLessonCompleted(previousLesson)) {
      return true;
    }
    
    return false;
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
        
        <Container maxWidth="lg" sx={{ py: 5 }}>
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link 
              color="inherit" 
              href="/homepage"
              sx={{ 
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Home
            </Link>
            <Typography color="text.primary">{module?.name || 'Module Details'}</Typography>
          </Breadcrumbs>
          
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/homepage')}
            sx={{ mb: 3 }}
          >
            Back to Modules
          </Button>
          <AudioToggleButton audioPlaying={audioPlaying} toggleAudio={toggleAudio} />
          
          {progressStats && (
            <Card sx={{ mb: 4, p: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" gutterBottom>
                Your Progress
              </Typography>
              
              <LinearProgress
                variant="determinate"
                value={getLessonProgressPercentage()}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Completed Lessons
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {progressStats.completedLessons || 0}/{lessons.length}
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Stars Earned
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main', display: 'flex', alignItems: 'center' }}>
                    {progressStats.totalStars || 0}
                    <StarIcon fontSize="small" sx={{ ml: 0.5, color: 'warning.main' }} />
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Average Score
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {progressStats.averageScore ? Math.round(progressStats.averageScore) + '%' : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={moduleProgress?.completed ? "Completed" : "In Progress"}
                    color={moduleProgress?.completed ? "success" : "primary"}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Card>
          )}
          
          <Card
            sx={{
              mb: 4,
              borderRadius: '16px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}
          >
            <CardMedia
              component="img"
              sx={{
                height: 200,
                objectFit: 'cover'
              }}
              image={getModuleImage(module?.id)}
              alt={`${module?.name || 'Module'} cover`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div
              style={{
                height: 200,
                backgroundColor: '#4a6cf7',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOutlined sx={{ fontSize: 100, color: 'white' }} />
            </div>

            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {module?.name || 'Module'}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {module?.description || 'No description available'}
              </Typography>
              
              <Box sx={{ display: 'flex', mt: 2, gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BookOutlined sx={{ mr: 1, color: '#4a6cf7' }} />
                  <Typography variant="body2">
                    {lessons.length} Lessons
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ mr: 1, color: '#4a6cf7' }} />
                  <Typography variant="body2">
                    {formatTime(lessons.reduce((total, lesson) => total + (lesson.estimatedTimeMinutes || 0), 0))}
                  </Typography>
                </Box>
              </Box>

              {progressStats && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Chip 
                    icon={<CheckCircle />} 
                    label={`${progressStats.completedLessons || 0}/${lessons.length} Lessons Completed`} 
                    color={progressStats.completedLessons === lessons.length ? "success" : "primary"}
                    variant="outlined"
                  />
                  
                  <Chip 
                    icon={<StarIcon />}
                    label={`${progressStats.totalStars || 0} Stars Earned`}
                    color="warning"
                    variant="outlined"
                  />
                  
                  {progressStats.averageScore !== undefined && (
                    <Chip 
                      icon={<ScoreIcon />}
                      label={`${Math.round(progressStats.averageScore)}% Average Score`}
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
          
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Lessons
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {lessons.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                This module doesn't have any lessons yet.
              </Alert>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Stack 
                  direction="row" 
                  spacing={3} 
                  sx={{ 
                    pb: 2, 
                    minWidth: lessons.length * 250
                  }}
                >
                  {lessons.map((lesson, index) => {
                    const completed = isLessonCompleted(lesson);
                    const locked = isLessonLocked(lesson, index);
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
                          width: 280,
                          height: '100%',
                          borderRadius: '16px',
                          border: '1px solid',
                          borderColor: completed ? '#4caf50' : '#e0e0e0',
                          backgroundColor: completed ? 'rgba(76, 175, 80, 0.05)' : 'white',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: locked ? 'none' : 'translateY(-5px)',
                            boxShadow: locked ? '0 2px 5px rgba(0,0,0,0.1)' : '0 10px 20px rgba(0,0,0,0.1)'
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
                            bgcolor: completed ? '#4caf50' : 
                                    locked ? '#9e9e9e' : '#4a6cf7',
                            color: 'white',
                            height: 100,
                            position: 'relative'
                          }}
                        >
                          {completed ? (
                            <CheckCircle sx={{ fontSize: 48 }} />
                          ) : locked ? (
                            <Lock sx={{ fontSize: 48 }} />
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
                              color: 'rgba(255,255,255,0.7)'
                            }}
                          >
                            {index + 1}
                          </Typography>
                        </Box>
                        <CardContent sx={{ pt: 2 }}>
                          <Typography variant="h6" component="div" gutterBottom noWrap title={lessonTitle}>
                            {lessonTitle}
                          </Typography>
                          
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {hasActivity && (
                              <Chip 
                                label="Interactive Game" 
                                size="small" 
                                color="primary"
                                sx={{ mb: 1 }}
                              />
                            )}
                            {formattedActivityType && (
                              <Chip 
                                label={formattedActivityType} 
                                size="small" 
                                sx={{ mb: 1 }}
                              />
                            )}
                            {lesson.level && (
                              <Chip 
                                label={`Level ${lesson.level}`} 
                                size="small" 
                                sx={{ mb: 1 }}
                              />
                            )}
                          </Box>
                          
                          {completed && starsEarned > 0 && (
                            <Box sx={{ display: 'flex', mt: 1, mb: 1 }}>
                              {[...Array(3)].map((_, i) => (
                                <StarIcon 
                                  key={i} 
                                  sx={{ 
                                    fontSize: 20, 
                                    color: i < starsEarned ? 'warning.main' : 'grey.300',
                                    mr: 0.5
                                  }} 
                                />
                              ))}
                              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                                {starsEarned}/3
                              </Typography>
                            </Box>
                          )}
                          
                          {lesson.estimatedTimeMinutes && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <AccessTime sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {lesson.estimatedTimeMinutes} min
                              </Typography>
                            </Box>
                          )}
                          
                          {lessonDescription && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mt: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {lessonDescription}
                            </Typography>
                          )}
                        </CardContent>
                        <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={locked ? <Lock /> : <PlayArrow />}
                            onClick={() => handleStartLesson(lesson, index)}
                            disabled={locked}
                            sx={{
                              borderRadius: '8px',
                              backgroundColor: completed ? '#4caf50' : 
                                            locked ? '#9e9e9e' : '#4a6cf7',
                              '&:hover': {
                                backgroundColor: completed ? '#3d8b40' : 
                                              locked ? '#757575' : '#3a5ce5'
                              }
                            }}
                          >
                            {completed ? 'Review' : locked ? 'Locked' : 'Start'}
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