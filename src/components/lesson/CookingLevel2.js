import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Card, 
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Import cooking action images
import crackImg from "../../assets/cookingLevel2/crack.png";
import pourImg from "../../assets/cookingLevel2/pour.png";
import sliceImg from "../../assets/cookingLevel2/slice.png";
import washImg from "../../assets/cookingLevel2/wash.png";
import mixImg from "../../assets/cookingLevel2/mix.png";

export default function CookingActionsLevel2() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [currentAction, setCurrentAction] = useState(0);
  const [gameMode, setGameMode] = useState('learn'); // 'learn' or 'practice'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  
  // Level progression props
  const [currentLevel] = useState(2); // Level 2
  const [maxLevel] = useState(5); // Updated to 5 total levels
  const [moduleIdentifier] = useState('cooking-basics');
  const [lessonIdentifier] = useState('cooking-actions');

  // Level 2: Basic Cooking Actions - Building on ingredient knowledge
  const cookingActions = [
    { 
      id: 1, 
      name: "CRACK", 
      image: crackImg, // Changed from emoji to image
      color: "#FFF3E0",
      sound: "crack",
      description: "We crack eggs by tapping them gently on a bowl",
      encouragement: "Great! You know how to crack eggs safely!",
      demonstration: "Tap the egg, then pull apart with your thumbs"
    },
    { 
      id: 2, 
      name: "POUR", 
      image: pourImg, // Changed from emoji to image
      color: "#E8F5E8",
      sound: "pour", 
      description: "We pour milk slowly into a cup or bowl",
      encouragement: "Perfect! Pouring slowly prevents spills!",
      demonstration: "Tilt the container slowly and steadily"
    },
    { 
      id: 3, 
      name: "SLICE", 
      image: sliceImg, // Changed from emoji to image
      color: "#FFF8E1",
      sound: "slice",
      description: "We slice bread carefully with a knife",
      encouragement: "Excellent! Always be careful with knives!",
      demonstration: "Use a sawing motion, keep fingers away from blade"
    },
    { 
      id: 4, 
      name: "WASH", 
      image: washImg, // Changed from emoji to image
      color: "#FFEBEE",
      sound: "wash",
      description: "We wash apples with clean water before eating",
      encouragement: "Wonderful! Clean food is healthy food!",
      demonstration: "Rinse under running water and rub gently"
    },
    { 
      id: 5, 
      name: "MIX", 
      image: mixImg, // Changed from emoji to image
      color: "#F3E5F5",
      sound: "mix",
      description: "We mix ingredients together with a spoon",
      encouragement: "Amazing! Mixing makes ingredients combine!",
      demonstration: "Stir in circles, scrape the sides of the bowl"
    }
  ];

  const currentItem = cookingActions[currentAction];
  const progressPercentage = ((currentAction + 1) / cookingActions.length) * 100;

  // Get student ID from localStorage
  const getStudentId = () => {
    const studentId = localStorage.getItem('studentId');
    const userType = localStorage.getItem('userType');
    
    if (userType !== 'STUDENT') {
      console.error('User is not a student:', userType);
      return null;
    }
    
    if (!studentId || studentId === 'null') {
      console.error('No student ID found in localStorage');
      return null;
    }
    
    const parsedId = parseInt(studentId, 10);
    if (isNaN(parsedId)) {
      console.error('Invalid student ID format:', studentId);
      return null;
    }
    
    return parsedId;
  };

  // Load previous progress on component mount
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          setLoading(false);
          setShowTip('Let\'s learn cooking actions!');
          return;
        }
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Great job! You finished this before. Want to try again?");
          } else {
            setShowTip('Let\'s learn cooking actions!');
          }
        } else {
          setShowTip('Let\'s learn cooking actions!');
        }
      } catch (error) {
        console.log('Error fetching progress:', error);
        setShowTip('Let\'s learn cooking actions!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  // Gentle audio feedback for cooking instructions
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7; // Slower for cooking instructions
      utterance.pitch = 1.1; 
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleLearnMode = () => {
    if (autoPlayEnabled) {
      setTimeout(() => {
        speak(`${currentItem.name}. ${currentItem.description}`);
      }, 500);
    }
  };

  useEffect(() => {
    if (gameMode === 'learn' && !loading) {
      handleLearnMode();
    }
  }, [currentAction, gameMode, loading]);

  const nextAction = () => {
    if (currentAction < cookingActions.length - 1) {
      setCurrentAction(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setGameMode('practice');
      setCurrentAction(0);
    }
  };

  const previousAction = () => {
    if (currentAction > 0) {
      setCurrentAction(prev => prev - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  // Confetti animation function
  const triggerCorrectAnimation = () => {
    setShowCorrectAnimation(true);
    
    // Generate confetti pieces
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 3,
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
      });
    }
    setConfettiPieces(pieces);
    
    // Hide animation after 3 seconds
    setTimeout(() => {
      setShowCorrectAnimation(false);
      setConfettiPieces([]);
    }, 3000);
  };

  const handlePracticeAnswer = (answerId) => {
    setSelectedAnswer(answerId);
    setShowFeedback(true);
    
    const isCorrect = answerId === currentItem.id;
    
    if (isCorrect) {
      // Show confetti animation and "Correct!" popup
      triggerCorrectAnimation();
      
      setScore(prev => prev + 1);
      setCompleted(prev => [...prev, currentItem.id]);
      
      setTimeout(() => {
        speak(currentItem.encouragement);
      }, 300);
      
      setTimeout(() => {
        if (currentAction < cookingActions.length - 1) {
          setCurrentAction(prev => prev + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        } else {
          setShowCelebration(true);
          saveProgress();
          setTimeout(() => {
            speak("Fantastic! You learned all the cooking actions!");
          }, 500);
        }
      }, 3500);
    } else {
      setTimeout(() => {
        speak(`Let's try again. This cooking action is ${currentItem.name}`);
      }, 300);
      
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, 2500);
    }
  };

  // Save progress to database
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      const finalScore = score + (completed.length > score ? 1 : 0);
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: cookingActions.length,
        completed: true,
        starsEarned: getStarRating(finalScore)
      };
      
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  // Calculate star rating based on score
  const getStarRating = (finalScore = score) => {
    const percentage = (finalScore / cookingActions.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const resetGame = () => {
    setCurrentAction(0);
    setGameMode('learn');
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCompleted([]);
    setShowCelebration(false);
    setProgressSaved(false);
    setProgressSaving(false);
  };

  const goToHomepage = () => {
    if (navigate) {
      navigate('/homepage');
    } else if (window.history && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/homepage';
    }
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    const hasNextLevel = currentLevel < maxLevel;
    
    setTimeout(() => {
      if (hasNextLevel) {
        if (navigate) {
          navigate('/lesson/cooking/level-3');
        } else {
          window.location.href = '/lesson/cooking/level-3';
        }
      } else {
        goToHomepage();
      }
    }, 300);
  };

  const hasNextLevel = currentLevel < maxLevel;

  // Loading state
  if (loading) {
    return (
      <div style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${kitchenBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}>
        <Box sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1
        }} />
        <Navbar />
        <Container sx={{ py: 8, textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <CircularProgress size={50} sx={{ color: '#FF9800' }} />
          <Typography variant="h5" sx={{ mt: 3, color: 'white', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Loading cooking actions...
          </Typography>
        </Container>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url(${kitchenBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      {/* Kitchen overlay for better text readability */}
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: 1
      }} />
      
      <Box sx={{ 
        position: 'relative', 
        zIndex: 2,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar />
        
        {/* Main content container - SCROLLABLE */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Content wrapper */}
          <Box sx={{
            width: '100%',
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', width: '100%', maxWidth: '800px' }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', 
                color: 'white', 
                mb: 1,
                textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
              }}>
                Cooking Actions
              </Typography>
              
              <Chip 
                label={`Level ${currentLevel} of ${maxLevel}`}
                sx={{ 
                  backgroundColor: 'rgba(255, 152, 0, 0.9)', 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  padding: '8px 12px',
                  mb: 2,
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              />

              {showTip && (
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 152, 0, 0.9)',
                  borderRadius: '12px',
                  padding: '8px 16px',
                  mb: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Typography sx={{ 
                    fontSize: '0.9rem', 
                    color: 'white', 
                    fontWeight: '500',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {showTip}
                  </Typography>
                </Box>
              )}
              
              {/* Controls Row */}
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 2 }}>
                {/* Audio Toggle */}
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '20px',
                  padding: '6px 15px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoPlayEnabled}
                        onChange={(e) => setAutoPlayEnabled(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {autoPlayEnabled ? <VolumeUpIcon fontSize="small" /> : <VolumeOffIcon fontSize="small" />}
                        <Typography variant="body2" fontWeight="bold">Sound</Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Mode Toggle */}
                <Button
                  onClick={() => setGameMode('learn')}
                  variant={gameMode === 'learn' ? 'contained' : 'outlined'}
                  size="medium"
                  sx={{
                    borderRadius: '20px',
                    minWidth: '100px',
                    backgroundColor: gameMode === 'learn' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#FF9800',
                    color: gameMode === 'learn' ? 'white' : '#FF9800',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #FF9800',
                    '&:hover': {
                      backgroundColor: gameMode === 'learn' ? 'rgba(245, 124, 0, 0.9)' : 'rgba(255, 152, 0, 0.1)',
                    }
                  }}
                >
                  📚 Learn
                </Button>
                <Button
                  onClick={() => setGameMode('practice')}
                  variant={gameMode === 'practice' ? 'contained' : 'outlined'}
                  size="medium"
                  sx={{
                    borderRadius: '20px',
                    minWidth: '100px',
                    backgroundColor: gameMode === 'practice' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#FF9800',
                    color: gameMode === 'practice' ? 'white' : '#FF9800',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #FF9800',
                    '&:hover': {
                      backgroundColor: gameMode === 'practice' ? 'rgba(245, 124, 0, 0.9)' : 'rgba(255, 152, 0, 0.1)',
                    }
                  }}
                >
                  🎯 Practice
                </Button>
              </Stack>
            </Box>

            {/* Progress bar */}
            <Box sx={{ width: '100%', maxWidth: '700px' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}>
                  Action {currentAction + 1} of {cookingActions.length}
                </Typography>
                <Chip 
                  label={`Score: ${score}/${cookingActions.length}`} 
                  sx={{ 
                    backgroundColor: 'rgba(33, 150, 243, 0.9)', 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    padding: '4px 8px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#FF9800'
                  }
                }} 
              />
            </Box>

            {gameMode === 'learn' ? (
              /* Learn Mode */
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px',
                pb: 4
              }}>
                {/* Action Display Card */}
                <Card sx={{
                  backgroundColor: 'rgba(255, 250, 244, 0.95)',
                  borderRadius: '20px',
                  padding: '25px',
                  mb: 3,
                  border: '3px solid #FF9800',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  width: '100%',
                  backdropFilter: 'blur(15px)'
                }}>
                  {/* Action image display */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    <img 
                      src={currentItem.image} 
                      alt={currentItem.name}
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'contain',
                        borderRadius: '15px'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#E65100', 
                    mb: 1,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {currentItem.name}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#5D4037', 
                    lineHeight: 1.4,
                    fontSize: '1.1rem',
                    mb: 2
                  }}>
                    {currentItem.description}
                  </Typography>
                  
                  {/* Demonstration box */}
                  <Box sx={{
                    backgroundColor: '#FFF8E1',
                    border: '1px solid #FFE0B2',
                    borderRadius: '12px',
                    padding: '12px',
                    fontStyle: 'italic',
                    color: '#795548'
                  }}>
                    <Typography variant="body2">
                      💡 How to: {currentItem.demonstration}
                    </Typography>
                  </Box>
                </Card>

                {/* Control Buttons */}
                <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    onClick={() => speak(currentItem.name)}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#2196F3',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#1976D2' }
                    }}
                  >
                    🔊 Say Action
                  </Button>
                  <Button
                    onClick={() => speak(currentItem.demonstration)}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#4CAF50',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#45a049' }
                    }}
                  >
                    📝 How To
                  </Button>
                </Stack>

                {/* Navigation Buttons */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    onClick={previousAction}
                    disabled={currentAction === 0}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      minWidth: '80px',
                      opacity: currentAction === 0 ? 0.5 : 1,
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    ⬅️ Back
                  </Button>
                  <Button
                    onClick={nextAction}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      minWidth: '80px',
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    {currentAction === cookingActions.length - 1 ? '🎯 Practice' : '➡️ Next'}
                  </Button>
                  <Button
                    onClick={goToHomepage}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#2196F3',
                      borderRadius: '15px',
                      minWidth: '80px',
                      '&:hover': { backgroundColor: '#1976D2' }
                    }}
                  >
                    🏠 Home
                  </Button>
                </Stack>
              </Box>
            ) : (
              /* Practice Mode */
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px',
                pb: 4
              }}>
                {/* Question Display */}
                <Card sx={{
                  backgroundColor: 'rgba(255, 250, 244, 0.95)',
                  borderRadius: '20px',
                  padding: '25px',
                  mb: 3,
                  border: '3px solid #FF9800',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  width: '100%',
                  backdropFilter: 'blur(15px)'
                }}>
                  <Typography sx={{ fontSize: '3rem', mb: 1 }}>🤔</Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold', 
                    color: '#E65100', 
                    mb: 2
                  }}>
                    What do we do with this?
                  </Typography>
                  {/* Action image for question */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    <img 
                      src={currentItem.image} 
                      alt="Guess this action"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }}
                    />
                  </Box>
                </Card>

                {/* Answer Options */}
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 2,
                  width: '100%',
                  maxWidth: '500px',
                  mb: 3
                }}>
                  {cookingActions.map((action) => (
                    <Card
                      key={action.id}
                      onClick={() => !showFeedback && handlePracticeAnswer(action.id)}
                      sx={{
                        padding: '15px',
                        borderRadius: '15px',
                        border: '2px solid',
                        borderColor: showFeedback && selectedAnswer === action.id && action.id === currentItem.id 
                          ? '#4CAF50' 
                          : showFeedback && selectedAnswer === action.id && action.id !== currentItem.id 
                          ? '#F44336'
                          : '#E0E0E0',
                        cursor: showFeedback ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        backgroundColor: showFeedback && selectedAnswer === action.id && action.id === currentItem.id 
                          ? 'rgba(200, 230, 201, 0.95)'
                          : showFeedback && selectedAnswer === action.id && action.id !== currentItem.id 
                          ? 'rgba(255, 205, 210, 0.95)'
                          : 'rgba(255, 255, 255, 0.95)',
                        transition: 'all 0.3s ease',
                        transform: showFeedback && selectedAnswer === action.id && action.id === currentItem.id 
                          ? 'scale(1.05)' : 'scale(1)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          transform: showFeedback ? 'scale(1)' : 'scale(1.02)',
                          boxShadow: showFeedback ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 6px 25px rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      {/* Action image for options */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}>
                        <img 
                          src={action.image} 
                          alt={action.name}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'contain',
                            borderRadius: '8px'
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ 
                        fontWeight: 'bold', 
                        color: '#E65100',
                        fontSize: '0.8rem'
                      }}>
                        {action.name}
                      </Typography>
                    </Card>
                  ))}
                </Box>

                {/* Control Buttons */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    onClick={resetGame}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#4CAF50',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#45a049' }
                    }}
                  >
                    📚 Learn Again
                  </Button>
                  <Button
                    onClick={goToHomepage}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#2196F3',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#1976D2' }
                    }}
                  >
                    🏠 Go Home
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Confetti Animation and "Correct!" Popup */}
      {showCorrectAnimation && (
        <>
          {/* Confetti pieces */}
          {confettiPieces.map((piece) => (
            <Box
              key={piece.id}
              sx={{
                position: 'fixed',
                top: '-10px',
                left: `${piece.left}%`,
                width: '10px',
                height: '10px',
                backgroundColor: piece.backgroundColor,
                zIndex: 9999,
                borderRadius: '2px',
                animation: 'confettiFall 3s linear forwards',
                animationDelay: `${piece.animationDelay}s`,
                '@keyframes confettiFall': {
                  '0%': {
                    transform: 'translateY(-10px) rotateZ(0deg)',
                    opacity: 1,
                  },
                  '100%': {
                    transform: 'translateY(100vh) rotateZ(720deg)',
                    opacity: 0,
                  },
                },
              }}
            />
          ))}
          
          {/* "Correct!" Popup */}
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10000,
              animation: 'correctPop 3s ease-out forwards',
              '@keyframes correctPop': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(0)',
                  opacity: 0,
                },
                '20%': {
                  transform: 'translate(-50%, -50%) scale(1.2)',
                  opacity: 1,
                },
                '40%': {
                  transform: 'translate(-50%, -50%) scale(1)',
                  opacity: 1,
                },
                '100%': {
                  transform: 'translate(-50%, -50%) scale(1)',
                  opacity: 0,
                },
              },
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(255, 152, 0, 0.95)',
                color: 'white',
                padding: '20px 40px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '4px solid #FF9800',
                backdropFilter: 'blur(10px)',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontSize: { xs: '2.5rem', sm: '3.5rem' },
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                🎉 Correct! 🎉
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* Success Dialog */}
      <Dialog
        open={showCelebration}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 250, 244, 0.98)',
            border: '4px solid #FF9800',
            backdropFilter: 'blur(15px)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
          <EmojiEventsIcon sx={{ fontSize: 80, color: '#FF9800', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#E65100' }}>
            Great Cooking!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {[...Array(getStarRating())].map((_, i) => (
              <StarIcon key={i} sx={{ color: '#FFCA3A', fontSize: 40, mx: 0.5 }} />
            ))}
            {[...Array(3 - getStarRating())].map((_, i) => (
              <StarIcon key={i} sx={{ color: '#E0E0E0', fontSize: 40, mx: 0.5 }} />
            ))}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#E65100', mb: 1 }}>
            You learned all {cookingActions.length} cooking actions!
          </Typography>
          <Typography variant="body1" sx={{ color: '#5D4037', lineHeight: 1.4, mb: 2 }}>
            Level {currentLevel} Complete! 
            {hasNextLevel ? ` Ready for Level ${currentLevel + 1}?` : ' You\'re becoming a great cook!'}
          </Typography>
          
          {progressSaving && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 152, 0, 0.9)', borderRadius: '12px', color: 'white', backdropFilter: 'blur(10px)' }}>
              <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
              <Typography variant="body2">
                Saving your progress...
              </Typography>
            </Box>
          )}
          
          {progressSaved && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.9)', borderRadius: '12px', color: 'white', backdropFilter: 'blur(10px)' }}>
              <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">
                Progress saved successfully!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button 
            onClick={continueToNextLevel}
            disabled={progressSaving}
            variant="contained"
            size="medium"
            sx={{ 
              backgroundColor: hasNextLevel ? 'rgba(76, 175, 80, 0.9)' : 'rgba(33, 150, 243, 0.9)',
              borderRadius: '10px',
              minWidth: '120px',
              backdropFilter: 'blur(10px)',
              '&:hover': { 
                backgroundColor: hasNextLevel ? 'rgba(69, 160, 73, 0.9)' : 'rgba(25, 118, 210, 0.9)'
              }
            }}
          >
            {progressSaving ? 'Saving...' : (hasNextLevel ? '🚀 Next Level' : '🏠 Go Home')}
          </Button>
          
          <Button 
            onClick={resetGame}
            variant="outlined"
            size="medium"
            sx={{ 
              borderColor: '#FF9800', 
              color: '#E65100',
              borderRadius: '10px',
              minWidth: '120px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
              }
            }}
          >
            🔄 Practice Again
          </Button>
          
          <Button 
            onClick={goToHomepage}
            variant="contained"
            size="medium"
            sx={{ 
              backgroundColor: 'rgba(156, 39, 176, 0.9)',
              borderRadius: '10px',
              minWidth: '120px',
              backdropFilter: 'blur(10px)',
              '&:hover': { backgroundColor: 'rgba(123, 31, 162, 0.9)' }
            }}
          >
            🏠 Home
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}