import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Stack,
  Card,
  CardContent,
  CardActions,
  Dialog
} from '@mui/material';
import {
  BookOutlined,
  PlayArrow,
  CheckCircle,
  QuizOutlined,
  DragIndicatorOutlined,
  VideoLibraryOutlined,
  TextSnippetOutlined
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
import exitbtn from '../assets/exitbtn.png';

// Import badge images for the claim popup
import FirstLessonIcon from '../assets/badges/first_lesson.png';
import StarMasterIcon from '../assets/badges/star_master.png';
import FirstModuleIcon from '../assets/badges/first_module.png';
import SuperLearnerIcon from '../assets/badges/super_learner.png';

// Import audio files for badge popups
import congratulationsSound from '../assets/badges/success-sound.mp3';
import badgeSound from '../assets/badges/badge.mp3';

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
  
  // New state for badge claiming
  const [newBadgeUnlocked, setNewBadgeUnlocked] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [claimedBadges, setClaimedBadges] = useState({});
  const [previousProgress, setPreviousProgress] = useState(null);

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
    
    // Load claimed badges from localStorage
    const savedClaimedBadges = localStorage.getItem('claimedBadges');
    if (savedClaimedBadges) {
      setClaimedBadges(JSON.parse(savedClaimedBadges));
    }
  }, [moduleId]);
  
  const getModuleImage = (moduleId) => {
    const index = moduleId ? (moduleId - 1) % moduleImages.length : 0;
    return moduleImages[index];
  };

  // Function to play badge sounds
  const playBadgeSounds = () => {
    try {
      // Create audio elements
      const congratsAudio = new Audio(congratulationsSound);
      const badgeAudio = new Audio(badgeSound);
      
      // Set volume (0 to 1)
      congratsAudio.volume = 0.7;
      badgeAudio.volume = 0.7;
      
      // Play congratulations sound first
      congratsAudio.play().catch(e => console.log('Error playing congratulations sound:', e));
      
      // Play badge sound after a short delay
      setTimeout(() => {
        badgeAudio.play().catch(e => console.log('Error playing badge sound:', e));
      }, 500);
      
    } catch (error) {
      console.error('Error playing badge sounds:', error);
    }
  };

  const fetchModuleProgress = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
      
      if (!studentId || !moduleId) return;
      
      const moduleProgressResponse = await getStudentModuleProgress(studentId, moduleId);
      setModuleProgress(moduleProgressResponse);
      
      const progressStatsResponse = await getStudentModuleProgressStats(studentId);
      console.log("Current progress stats:", progressStatsResponse);
      
      // Check for new badges when we get progress stats
      if (progressStatsResponse) {
        checkForNewBadges(progressStatsResponse);
      }
      
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

  // Helper function to calculate badges based on progress
  const calculateBadges = (stats) => {
    if (!stats) return [];
    
    const completedLessons = Number(stats.completedLessons) || 0;
    const totalStars = Number(stats.totalStars) || 0;
    const completedModules = Number(stats.completedModules) || 0;

    const badges = [
      // First Lesson Badge
      {
        id: 'first-lesson',
        label: 'First Lesson',
        earned: completedLessons >= 1,
        description: 'Complete your first lesson',
        icon: FirstLessonIcon,
        progress: completedLessons >= 1 ? '1/1' : '0/1'
      },
      // First Module Badge
      {
        id: 'first-module',
        label: 'First Module',
        earned: completedModules >= 1,
        description: 'Complete your first module',
        icon: FirstModuleIcon,
        progress: completedModules >= 1 ? '1/1' : '0/1'
      },
      // Super Learner Badge
      {
        id: 'super-learner',
        label: 'Super Learner',
        earned: completedLessons >= 10,
        description: 'Complete 10 lessons',
        icon: SuperLearnerIcon,
        progress: `${completedLessons}/10`
      },
      // Star Master Badge
      {
        id: 'star-master',
        label: 'Star Master',
        earned: totalStars >= 15,
        description: 'Earn 15 stars',
        icon: StarMasterIcon,
        progress: `⭐ ${totalStars}/15`
      },
      // Module Legend Badge 
      {
        id: 'module-legend',
        label: 'Module Legend',
        earned: completedModules >= 3,
        description: 'Complete 3 modules',
        icon: FirstModuleIcon, // Using same icon for now
        progress: `${completedModules}/3`
      }
    ];

    return badges;
  };

  // Check for newly unlocked badges
  const checkForNewBadges = (currentStats) => {
    const savedClaimedBadges = JSON.parse(localStorage.getItem('claimedBadges') || '{}');
    
    // Calculate badges based on current progress
    const currentBadges = calculateBadges(currentStats);
    
    // Find badges that are earned but not claimed
    const newlyEarnedBadges = currentBadges.filter(badge => 
      badge.earned && !savedClaimedBadges[badge.id]
    );
    
    if (newlyEarnedBadges.length > 0) {
      // Play congratulation sounds when badge pops up
      playBadgeSounds();
      
      // Show the first newly earned badge
      setNewBadgeUnlocked(newlyEarnedBadges[0]);
      setShowBadgeModal(true);
    }
  };

  // Handle claiming a badge
  const handleClaimBadge = () => {
    if (newBadgeUnlocked) {
      // Mark this badge as claimed
      const updatedClaimedBadges = {
        ...claimedBadges,
        [newBadgeUnlocked.id]: true
      };
      
      // Save to localStorage
      localStorage.setItem('claimedBadges', JSON.stringify(updatedClaimedBadges));
      setClaimedBadges(updatedClaimedBadges);
      
      // Close modal
      setShowBadgeModal(false);
      setNewBadgeUnlocked(null);
      
      // Show success notification
      setNotification({
        message: `Congratulations! You've earned the "${newBadgeUnlocked.label}" badge!`,
        severity: 'success'
      });
    }
  };

  const handleStartLesson = (lesson, index) => {
    console.log("🚀 Starting lesson:", lesson);
    console.log("📍 Module ID:", moduleId);
    
    // Save current progress before starting lesson
    const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
    if (studentId) {
      getStudentModuleProgressStats(studentId)
        .then(stats => {
          localStorage.setItem('previousProgress', JSON.stringify(stats));
        })
        .catch(error => console.error('Error saving previous progress:', error));
    }
    
    // Check if the lesson has a custom activity path
    if (lesson.activityPath) {
      if (lesson.activityPath === '/lesson/hygiene/level-2') {
        const navigationPath = `${lesson.activityPath}/${moduleId}/${lesson.id}`;
        console.log("📍 Navigating to hygiene level 2:", navigationPath);
        navigate(navigationPath);
      } 
      else if (lesson.activityPath === '/lesson/hygiene/level-3') {
        const navigationPath = `${lesson.activityPath}/${moduleId}/${lesson.id}`;
        console.log("📍 Navigating to hygiene level 3:", navigationPath);
        navigate(navigationPath);
      }
      else {
        const navigationPath = `${lesson.activityPath}/${lesson.id}`;
        console.log("📍 Navigating to other lesson:", navigationPath);
        navigate(navigationPath);
      }
    } else {
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

  const isLessonCompleted = (lesson) => {
    return lessonProgress[lesson.id]?.completed === true;
  };

  // MODIFIED: Always return false to unlock all lessons
  const isLessonLocked = (lesson, index) => {
    return false; // All lessons are unlocked
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
        
        {/* Badge Claim Modal */}
        <Dialog
          open={showBadgeModal}
          onClose={() => setShowBadgeModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: 'white',
              color: 'white',
              textAlign: 'center',
              overflow: 'hidden'
            }
          }}
        >
          <Box sx={{ 
            position: 'relative',
            padding: { xs: 3, sm: 4, md: 5 }
          }}>
      
            <Typography variant="h4" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              color: '#280b60'
              }}>
              🎉 Congratulations! 🎉
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 3, color: '#280b60' }}>
              You've unlocked a new badge!
            </Typography>
            
            {newBadgeUnlocked && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}>
                  <img 
                    src={newBadgeUnlocked.icon} 
                    alt={newBadgeUnlocked.label}
                    style={{ width: 200, height: 200 }}
                  />
   
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#280b60' }}>
                  {newBadgeUnlocked.label}
                </Typography>
                
                <Typography variant="body1" sx={{ mb: 2, color: '#280b60' }}>
                  {newBadgeUnlocked.description}
                </Typography>
              </Box>
            )}
            
            <Button
  variant="contained"
  onClick={handleClaimBadge}
  sx={{
    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: '18px',
    padding: '12px 40px',
    borderRadius: '25px',
    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)', // Initial white shadow
    animation: 'pulseGlow 2s infinite', // Added animation
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      background: 'linear-gradient(135deg, #ffed4e 0%, #ffd700 100%)',
      transform: 'scale(1.05)',
      animation: 'none', // Stop animation on hover
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      width: '200%',
      height: '200%',
      background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
      transform: 'rotate(45deg)',
      animation: 'shimmer 2.5s infinite', // White shimmer effect
    },
    transition: 'all 0.3s ease',
    // Keyframes for white pulse and glow effect
    '@keyframes pulseGlow': {
      '0%': {
        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
        transform: 'scale(1)',
      },
      '50%': {
        boxShadow: '0 0 25px rgba(255, 255, 255, 0.8), 0 0 35px rgba(255, 255, 255, 0.6), 0 0 45px rgba(255, 255, 255, 0.4)',
        transform: 'scale(1.08)',
      },
      '100%': {
        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
        transform: 'scale(1)',
      },
    },
    // Keyframes for white shimmer effect
    '@keyframes shimmer': {
      '0%': {
        transform: 'translateX(-100%) rotate(45deg)',
      },
      '100%': {
        transform: 'translateX(100%) rotate(45deg)',
      },
    },
  }}
>
  {/* Add a subtle arrow icon to hint clicking */}
  <Box component="span" sx={{ 
    display: 'inline-flex', 
    alignItems: 'center',
    gap: 1,
    position: 'relative',
    zIndex: 2, // Ensure text stays above the shimmer
  }}>
    Claim Your Badge!
  </Box>
</Button>
          </Box>
        </Dialog>
        
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
                          backgroundColor: 'white',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
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
                        
                        <CardContent sx={{ 
                          pt: { xs: 1.5, sm: 2 },
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography 
                            variant="h5" 
                            component="div" 
                            gutterBottom 
                            title={lessonTitle}
                            sx={{ 
                              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              flexGrow: 1
                            }}
                          >
                            {lessonTitle}
                          </Typography>
                        </CardContent>
                        
                        <CardActions sx={{ 
                          pt: 0,
                          pb: 2,
                          px: 2,
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'flex-end',
                          minHeight: '70px'
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