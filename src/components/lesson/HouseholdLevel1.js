import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  Stack,
  Fade,
  Slide,
  Zoom,
  Collapse,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  VolumeUp,
  Refresh,
  EmojiEvents,
  Star,
  CheckCircle,
  Home,
  Info,
  Close,
  PlayArrow,
  Pause,
  School,
  LocalLaundryService,
  AutoAwesome,
  Celebration,
  Lock,
  StarBorder,
  CloudUpload,
  CloudDone
} from '@mui/icons-material';
import { createTheme, ThemeProvider, keyframes } from '@mui/material/styles';

// Progress API functions
const API_BASE_URL = 'http://localhost:8080/api/progress';

const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
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

const getStudentLessonProgress = async (studentId, lessonId) => {
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

const updateModuleProgress = async (studentId, moduleId) => {
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

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    secondary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    success: {
      main: '#66BB6A',
    },
    warning: {
      main: '#FFA726',
    },
    background: {
      default: '#f8faff',
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
      },
    },
  },
});

// Animations
const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const sparkle = keyframes`
  0%, 100% { 
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% { 
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% { 
    transform: translateY(0px);
  }
  50% { 
    transform: translateY(-10px);
  }
`;

const HouseholdLevel1 = ({ studentId = "student123", lessonId = "household-level-1", moduleId = "household-chores" }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Progress tracking state
  const [nextLevelAvailable, setNextLevelAvailable] = useState(true);
  const [previousProgress, setPreviousProgress] = useState(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  
  // Game state
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverBin, setDragOverBin] = useState(null);
  const [bins, setBins] = useState({
    whites: [],
    colors: [],
    delicates: []
  });
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [celebrationItems, setCelebrationItems] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [correctStreaks, setCorrectStreaks] = useState(0);
  const [lastCorrectBin, setLastCorrectBin] = useState(null);
  const [shakeWrongBin, setShakeWrongBin] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  const laundryItems = [
    { id: 1, name: 'White T-Shirt', type: 'whites', emoji: '👕', color: '#ffffff', difficulty: 'easy' },
    { id: 2, name: 'Blue Jeans', type: 'colors', emoji: '👖', color: '#1976d2', difficulty: 'easy' },
    { id: 3, name: 'Red Dress', type: 'colors', emoji: '👗', color: '#d32f2f', difficulty: 'medium' },
    { id: 4, name: 'White Socks', type: 'whites', emoji: '🧦', color: '#ffffff', difficulty: 'easy' },
    { id: 5, name: 'Silk Blouse', type: 'delicates', emoji: '👚', color: '#e91e63', difficulty: 'hard' },
    { id: 6, name: 'White Underwear', type: 'whites', emoji: '🩲', color: '#ffffff', difficulty: 'easy' },
    { id: 7, name: 'Green Sweater', type: 'colors', emoji: '🧥', color: '#388e3c', difficulty: 'medium' },
    { id: 8, name: 'Lace Bra', type: 'delicates', emoji: '👙', color: '#f8bbd9', difficulty: 'hard' },
    { id: 9, name: 'Black Pants', type: 'colors', emoji: '👖', color: '#424242', difficulty: 'medium' },
    { id: 10, name: 'Wool Scarf', type: 'delicates', emoji: '🧣', color: '#9e9e9e', difficulty: 'hard' },
    { id: 11, name: 'White Towel', type: 'whites', emoji: '🏳️', color: '#ffffff', difficulty: 'easy' },
    { id: 12, name: 'Yellow Shirt', type: 'colors', emoji: '👕', color: '#fbc02d', difficulty: 'easy' }
  ];

  const [availableItems, setAvailableItems] = useState(laundryItems);

  const binInfo = {
    whites: {
      title: 'Whites',
      description: 'White clothes and linens',
      color: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      icon: '🤍',
      borderColor: '#2196F3',
      accentColor: '#64B5F6'
    },
    colors: {
      title: 'Colors',
      description: 'Colored clothes and fabrics',
      color: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      icon: '🌈',
      borderColor: '#4CAF50',
      accentColor: '#81C784'
    },
    delicates: {
      title: 'Delicates',
      description: 'Silk, lace, and special fabrics',
      color: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
      icon: '🌸',
      borderColor: '#e91e63',
      accentColor: '#f06292'
    }
  };

  // Calculate maximum possible score
  const calculateMaxScore = () => {
    let maxScore = 0;
    laundryItems.forEach((item, index) => {
      const baseScore = 10;
      const difficultyBonus = item.difficulty === 'hard' ? 5 : item.difficulty === 'medium' ? 3 : 0;
      const streakBonus = index * 2; // Maximum possible streak bonus
      maxScore += baseScore + difficultyBonus + streakBonus;
    });
    return maxScore;
  };

  // Calculate stars based on performance
  const calculateStars = (finalScore, totalAttempts, timeTaken) => {
    const maxScore = calculateMaxScore();
    const accuracy = (laundryItems.length / totalAttempts) * 100;
    const scorePercentage = (finalScore / maxScore) * 100;
    const timeBonus = timeTaken < 120000 ? 1 : 0; // Bonus for completing under 2 minutes

    let stars = 0;
    
    // Basic completion = 1 star
    stars = 1;
    
    // Good performance = 2 stars (70%+ accuracy or 60%+ score)
    if (accuracy >= 70 || scorePercentage >= 60) {
      stars = 2;
    }
    
    // Excellent performance = 3 stars (90%+ accuracy and 80%+ score, or time bonus)
    if ((accuracy >= 90 && scorePercentage >= 80) || (accuracy >= 85 && timeBonus)) {
      stars = 3;
    }

    return stars;
  };

  // Load previous progress on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await getStudentLessonProgress(studentId, lessonId);
        if (progress) {
          setPreviousProgress(progress);
          setStarsEarned(progress.starsEarned || 0);
        }
      } catch (error) {
        console.error('Failed to load previous progress:', error);
      }
    };

    loadProgress();
    setStartTime(Date.now());
  }, [studentId, lessonId]);

  // Save progress when game is completed
  const saveProgress = async (finalScore, totalAttempts, timeTaken) => {
    setIsSavingProgress(true);
    try {
      const maxScore = calculateMaxScore();
      const stars = calculateStars(finalScore, totalAttempts, timeTaken);
      
      const progressData = {
        score: finalScore,
        maxScore: maxScore,
        completed: true,
        starsEarned: stars,
        accuracy: (laundryItems.length / totalAttempts) * 100,
        timeTaken: timeTaken,
        attempts: totalAttempts
      };

      await saveStudentLessonProgress(studentId, lessonId, progressData);
      
      // Update module progress
      await updateModuleProgress(studentId, moduleId);
      
      setStarsEarned(stars);
      setProgressSaved(true);
      
      setSnackbar({
        open: true,
        message: `Progress saved! You earned ${stars} star${stars !== 1 ? 's' : ''}! ⭐`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save progress. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDragOverBin(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, binType) => {
    e.preventDefault();
    setDragOverBin(binType);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverBin(null);
    }
  };

  const createCelebrationEffect = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    const newItems = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: i * 100,
      left: Math.random() * 100,
      size: Math.random() * 10 + 5
    }));
    
    setCelebrationItems(newItems);
    setTimeout(() => setCelebrationItems([]), 2000);
  };

  const handleDrop = (e, binType) => {
    e.preventDefault();
    setDragOverBin(null);
    
    if (!draggedItem) return;

    const isCorrect = draggedItem.type === binType;
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      setBins(prev => ({
        ...prev,
        [binType]: [...prev[binType], draggedItem]
      }));
      setAvailableItems(prev => prev.filter(item => item.id !== draggedItem.id));
      
      // Enhanced scoring with streaks
      const baseScore = 10;
      const difficultyBonus = draggedItem.difficulty === 'hard' ? 5 : draggedItem.difficulty === 'medium' ? 3 : 0;
      const streakBonus = correctStreaks * 2;
      const totalScore = baseScore + difficultyBonus + streakBonus;
      
      setScore(prev => prev + totalScore);
      setCorrectStreaks(prev => prev + 1);
      setLastCorrectBin(binType);
      
      createCelebrationEffect();
      
      const streakMessages = [
        'Great job! ✨',
        'Perfect! You\'re on a roll! 🎯',
        'Amazing streak! Keep going! 🔥',
        'Incredible! You\'re a sorting master! 🌟',
        'Phenomenal! Nothing can stop you! 🚀'
      ];
      
      const message = streakMessages[Math.min(correctStreaks, streakMessages.length - 1)];
      
      setSnackbar({
        open: true,
        message: totalScore > baseScore ? `${message} +${totalScore} points!` : message,
        severity: 'success'
      });
      
      playSuccessSound();
      
      // Check if all items are sorted
      if (availableItems.length === 1) {
        setTimeout(() => {
          const timeTaken = Date.now() - startTime;
          saveProgress(score + totalScore, attempts + 1, timeTaken);
          setShowSuccess(true);
          
          if (!nextLevelAvailable) {
            setTimeout(() => {
              setSnackbar({
                open: true,
                message: '🎓 Great job! Ask your teacher to create Level 2 to continue learning!',
                severity: 'info'
              });
            }, 2000);
          }
        }, 800);
      }
    } else {
      setCorrectStreaks(0);
      setShakeWrongBin(binType);
      setTimeout(() => setShakeWrongBin(null), 600);
      
      setSnackbar({
        open: true,
        message: 'Oops! Try again! Think about the item carefully. 🤔',
        severity: 'warning'
      });
      
      playErrorSound();
    }

    setDraggedItem(null);
  };

  const playSuccessSound = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Great job!');
      utterance.rate = 1.2;
      utterance.pitch = 1.3;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const playErrorSound = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Try again!');
      utterance.rate = 1;
      utterance.pitch = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const resetGame = () => {
    setBins({ whites: [], colors: [], delicates: [] });
    setAvailableItems(laundryItems);
    setScore(0);
    setShowSuccess(false);
    setAttempts(0);
    setCorrectStreaks(0);
    setLastCorrectBin(null);
    setCelebrationItems([]);
    setProgressSaved(false);
    setStartTime(Date.now());
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const getProgressValue = () => {
    return ((laundryItems.length - availableItems.length) / laundryItems.length) * 100;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderStars = (stars, size = 'medium') => {
    const starSize = size === 'small' ? 16 : size === 'large' ? 32 : 24;
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {[1, 2, 3].map((star) => (
          star <= stars ? (
            <Star key={star} sx={{ color: '#FFD700', fontSize: starSize }} />
          ) : (
            <StarBorder key={star} sx={{ color: '#E0E0E0', fontSize: starSize }} />
          )
        ))}
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Celebration particles */}
        {celebrationItems.map(item => (
          <Box
            key={item.id}
            sx={{
              position: 'absolute',
              left: `${item.left}%`,
              top: '20%',
              width: `${item.size}px`,
              height: `${item.size}px`,
              backgroundColor: item.color,
              borderRadius: '50%',
              animation: `${sparkle} 2s ease-out ${item.delay}ms`,
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          />
        ))}

        <Box sx={{ position: 'relative', zIndex: 1, p: isMobile ? 2 : 3 }}>
          {/* Enhanced Header */}
          <Card sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            border: '2px solid rgba(255,255,255,0.8)'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: 2
              }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${float} 3s ease-in-out infinite`
                    }}
                  >
                    <LocalLaundryService sx={{ color: '#667eea', fontSize: '2.5rem' }} />
                    Level 1: Laundry Sorting
                    <AutoAwesome sx={{ color: '#764ba2', fontSize: '1.5rem' }} />
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, fontSize: '1.1rem' }}>
                    Drag each item into the correct laundry bin and become a sorting champion! 🏆
                  </Typography>
                  
                  {/* Previous Progress Display */}
                  {previousProgress && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Previous Best:
                      </Typography>
                      {renderStars(previousProgress.starsEarned, 'small')}
                      <Typography variant="body2" color="text.secondary">
                        {previousProgress.score}/{previousProgress.maxScore} points
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Tooltip title="Go back to homepage">
                    <Button
                      variant="outlined"
                      startIcon={<Home />}
                      onClick={() => navigate('/homepage')}
                      sx={{ 
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Home
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title={isPlaying ? "Stop instructions" : "Play instructions"}>
                    <Button
                      variant="contained"
                      startIcon={isPlaying ? <Pause /> : <VolumeUp />}
                      onClick={() => playAudio("Welcome to laundry sorting! Drag clothes into the right bins. White clothes go in the whites bin, colored clothes in the colors bin, and delicate fabrics in the delicates bin.")}
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #5a6fd8, #6a4190)'
                        }
                      }}
                    >
                      {isPlaying ? 'Stop' : 'Instructions'}
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Show help">
                    <Button
                      variant="outlined"
                      startIcon={<School />}
                      onClick={() => setShowInstructions(true)}
                      sx={{ 
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Help
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Enhanced Progress and Score */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'flex-start' : 'center', 
                  mb: 2,
                  gap: 2
                }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Progress: {laundryItems.length - availableItems.length} of {laundryItems.length} items sorted
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      icon={<Star />} 
                      label={`Score: ${score}`} 
                      color="primary" 
                      variant="filled"
                      sx={{ 
                        fontWeight: 600,
                        animation: lastCorrectBin ? `${bounce} 0.6s ease-out` : 'none'
                      }}
                    />
                    <Chip 
                      icon={<EmojiEvents />}
                      label={`Streak: ${correctStreaks}`} 
                      color="warning" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                      label={`Attempts: ${attempts}`} 
                      color="default" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    {isSavingProgress && (
                      <Chip 
                        icon={<CircularProgress size={16} />}
                        label="Saving..." 
                        color="info" 
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                    {progressSaved && (
                      <Chip 
                        icon={<CloudDone />}
                        label="Saved!" 
                        color="success" 
                        variant="filled"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressValue()} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    background: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      borderRadius: 6
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Enhanced Available Items */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
                border: '2px solid rgba(255,255,255,0.8)'
              }}>
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: '#667eea',
                      fontWeight: 700
                    }}
                  >
                    🧺 Laundry Basket
                    <Chip 
                      label={availableItems.length} 
                      size="small" 
                      color="primary"
                      sx={{ ml: 'auto' }}
                    />
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                    Drag items to the correct bins below ⬇️
                  </Typography>
                  
                  <Stack spacing={2}>
                    {availableItems.map((item, index) => (
                      <Fade in={true} timeout={300 + index * 100} key={item.id}>
                        <Paper
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          onDragEnd={handleDragEnd}
                          sx={{
                            p: 2,
                            cursor: 'move',
                            border: '3px dashed #e0e0e0',
                            borderRadius: 3,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              backgroundColor: '#f0f4ff',
                              transform: 'translateY(-4px) scale(1.02)',
                              boxShadow: '0 12px 28px rgba(102, 126, 234, 0.3)'
                            },
                            '&:active': {
                              transform: 'scale(0.98)'
                            }
                          }}
                        >
                          {/* Difficulty indicator */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getDifficultyColor(item.difficulty)
                            }}
                          />
                          
                          <Avatar 
                            sx={{ 
                              bgcolor: item.color === '#ffffff' ? '#f5f5f5' : item.color,
                              border: '2px solid rgba(102, 126, 234, 0.2)',
                              width: 48,
                              height: 48,
                              fontSize: '1.5rem'
                            }}
                          >
                            {item.emoji}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.difficulty} level
                            </Typography>
                          </Box>
                        </Paper>
                      </Fade>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Enhanced Sorting Bins */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {Object.entries(binInfo).map(([binType, info], index) => (
                  <Grid item xs={12} sm={4} key={binType}>
                    <Zoom in={true} timeout={500 + index * 200}>
                      <Card
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, binType)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, binType)}
                        sx={{
                          minHeight: 380,
                          border: `4px dashed ${dragOverBin === binType ? info.accentColor : info.borderColor}`,
                          background: dragOverBin === binType 
                            ? `linear-gradient(135deg, ${info.accentColor}20, ${info.accentColor}40)`
                            : info.color,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          animation: shakeWrongBin === binType ? `${shake} 0.6s ease-in-out` : 
                                   lastCorrectBin === binType ? `${bounce} 0.8s ease-out` : 'none',
                          transform: dragOverBin === binType ? 'scale(1.05)' : 'scale(1)',
                          '&:hover': {
                            transform: 'translateY(-4px) scale(1.02)',
                            boxShadow: '0 12px 32px rgba(0,0,0,0.2)'
                          }
                        }}
                      >
                        {/* Glow effect for drag over */}
                        {dragOverBin === binType && (
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              background: `radial-gradient(circle, ${info.accentColor}30 0%, transparent 70%)`,
                              pointerEvents: 'none'
                            }}
                          />
                        )}
                        
                        <CardContent>
                          <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography 
                              variant="h2" 
                              sx={{ 
                                mb: 1,
                                fontSize: '3.5rem',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                              }}
                            >
                              {info.icon}
                            </Typography>
                            <Typography 
                              variant="h6" 
                              gutterBottom
                              sx={{ 
                                fontWeight: 700,
                                color: info.borderColor,
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              {info.title}
                              <Chip 
                                label={bins[binType].length} 
                                size="small" 
                                sx={{ ml: 1, bgcolor: info.borderColor, color: 'white' }}
                              />
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ fontWeight: 500 }}
                            >
                              {info.description}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ mb: 2, borderColor: info.borderColor }} />
                          
                          <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto' }}>
                            {bins[binType].map((item, index) => (
                              <Slide 
                                direction="up" 
                                in={true} 
                                timeout={300 + index * 100}
                                key={item.id}
                              >
                                <Paper
                                  sx={{
                                    p: 1.5,
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    border: `2px solid ${info.borderColor}`,
                                    borderRadius: 3,
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar 
                                      sx={{ 
                                        width: 28, 
                                        height: 28,
                                        bgcolor: item.color === '#ffffff' ? '#f5f5f5' : item.color
                                      }}
                                    >
                                      {item.emoji}
                                    </Avatar>
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontWeight: 600,
                                        flex: 1
                                      }}
                                    >
                                      {item.name}
                                    </Typography>
                                    <CheckCircle 
                                      sx={{ 
                                        color: 'success.main', 
                                        fontSize: 20,
                                        animation: `${bounce} 0.6s ease-out`
                                      }} 
                                    />
                                  </Box>
                                </Paper>
                              </Slide>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          {/* Enhanced Reset Button with Demo Toggle */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={resetGame}
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                mr: 2,
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8, #6a4190)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                }
              }}
            >
              Start Over
            </Button>
            
            {/* Demo button to toggle next level availability */}
            <Button
              variant="outlined"
              onClick={() => setNextLevelAvailable(!nextLevelAvailable)}
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {nextLevelAvailable ? '🔒 Disable Level 2' : '🔓 Enable Level 2'} (Demo)
            </Button>
          </Box>

          {/* Enhanced Success Dialog */}
          <Dialog
            open={showSuccess}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { 
                borderRadius: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }
            }}
          >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <EmojiEvents 
                    sx={{ 
                      fontSize: 80, 
                      color: '#FFD700',
                      animation: `${bounce} 1s ease-out infinite`
                    }} 
                  />
                  <Celebration
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      fontSize: 30,
                      color: '#ff6b6b',
                      animation: `${sparkle} 2s ease-out infinite`
                    }}
                  />
                </Box>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                  Fantastic! 🎉
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                  Laundry Sorting Champion!
                </Typography>
                
                {/* Stars Display */}
                <Box sx={{ mt: 2 }}>
                  {renderStars(starsEarned, 'large')}
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
                    You earned {starsEarned} star{starsEarned !== 1 ? 's' : ''}!
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                You've successfully sorted all the laundry! 
                {nextLevelAvailable 
                  ? " You're ready for the next level!" 
                  : " You've completed all available levels!"
                }
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 700 }}>
                      {score}
                    </Typography>
                    <Typography variant="body2">Final Score</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Typography variant="h4" sx={{ color: '#81C784', fontWeight: 700 }}>
                      {attempts}
                    </Typography>
                    <Typography variant="body2">Total Attempts</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Typography variant="h4" sx={{ color: '#64B5F6', fontWeight: 700 }}>
                      {Math.round((laundryItems.length / attempts) * 100)}%
                    </Typography>
                    <Typography variant="body2">Accuracy</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                You've mastered the basics of laundry sorting! 
                {nextLevelAvailable 
                  ? " Time to learn about sweeping and cleaning!"
                  : " Ask your teacher to unlock the next level!"
                }
              </Typography>
              
              {progressSaved && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CloudDone sx={{ color: '#81C784' }} />
                  <Typography variant="body2" sx={{ color: '#81C784', fontWeight: 600 }}>
                    Progress saved successfully!
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setShowSuccess(false);
                  resetGame();
                }}
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Play Again
              </Button>
              
              {nextLevelAvailable ? (
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={() => navigate('/household-level-2')}
                  sx={{
                    bgcolor: 'white',
                    color: '#667eea',
                    '&:hover': {
                      bgcolor: '#f5f5f5'
                    }
                  }}
                >
                  Next Level
                </Button>
              ) : (
                <Tooltip title="The next level hasn't been created by your teacher yet. Great job completing this level!" arrow>
                  <span>
                    <Button
                      variant="outlined"
                      disabled
                      startIcon={<Lock />}
                      sx={{
                        color: 'rgba(255,255,255,0.6)',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&.Mui-disabled': {
                          color: 'rgba(255,255,255,0.6)',
                          borderColor: 'rgba(255,255,255,0.3)'
                        }
                      }}
                    >
                      🔒 Level 2 Coming Soon
                    </Button>
                  </span>
                </Tooltip>
              )}
              
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => navigate('/homepage')}
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Home
              </Button>
            </DialogActions>
          </Dialog>

          {/* Enhanced Instructions Dialog */}
          <Dialog
            open={showInstructions}
            onClose={() => setShowInstructions(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { 
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
              }
            }}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                  🧺 How to Sort Laundry Like a Pro!
                </Typography>
                <IconButton 
                  onClick={() => setShowInstructions(false)}
                  sx={{ 
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {Object.entries(binInfo).map(([key, info]) => (
                  <Grid item xs={12} md={4} key={key}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center', 
                        background: info.color,
                        border: `2px solid ${info.borderColor}`,
                        borderRadius: 3,
                        height: '100%'
                      }}
                    >
                      <Typography variant="h2" sx={{ mb: 2 }}>
                        {info.icon}
                      </Typography>
                      <Typography variant="h6" gutterBottom sx={{ color: info.borderColor, fontWeight: 700 }}>
                        {info.title}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {info.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Paper sx={{ p: 3, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#667eea', fontWeight: 700 }}>
                  📝 How to Play:
                </Typography>
                <Box component="ol" sx={{ pl: 2, '& li': { mb: 1 } }}>
                  <li>
                    <Typography variant="body1">
                      <strong>Look</strong> at each item in the laundry basket
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <strong>Think</strong> about which category it belongs to
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <strong>Drag</strong> the item to the correct bin
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <strong>Score</strong> points for correct sorting!
                    </Typography>
                  </li>
                </Box>
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#388E3C' }}>
                    💡 Pro Tip: Build streaks for bonus points! Harder items give more points!
                  </Typography>
                </Box>
              </Paper>
              
              {/* Star Rating System */}
              <Paper sx={{ p: 3, bgcolor: 'rgba(255, 193, 7, 0.05)', borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#F57C00', fontWeight: 700 }}>
                  ⭐ Star Rating System:
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {renderStars(1, 'small')}
                    <Typography variant="body2">Complete the level</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {renderStars(2, 'small')}
                    <Typography variant="body2">70%+ accuracy OR 60%+ score</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {renderStars(3, 'small')}
                    <Typography variant="body2">90%+ accuracy AND 80%+ score OR speed bonus</Typography>
                  </Box>
                </Stack>
              </Paper>
            </DialogContent>
          </Dialog>

          {/* Enhanced Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ 
                width: '100%',
                borderRadius: 3,
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HouseholdLevel1;