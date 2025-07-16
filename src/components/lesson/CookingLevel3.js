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

// Import kitchen tool images
import spoonImg from "../../assets/cookingLevel3/spoon.png";
import forkImg from "../../assets/cookingLevel3/fork.png";
import knifeImg from "../../assets/cookingLevel3/knife.png";
import whiskImg from "../../assets/cookingLevel3/whisk.png";

// Import food images for matching questions
import eggImg from "../../assets/cookingLevel3/egg.png";
import appleImg from "../../assets/cookingLevel3/apple.png";
import soupImg from "../../assets/cookingLevel3/soup.png";
import pastaImg from "../../assets/cookingLevel3/pasta.png";

export default function CookingActionsLevel3() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [gamePhase, setGamePhase] = useState('introduction'); // 'introduction', 'matching', 'celebration'
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]); // Track individual correct answers
  const [completedTools, setCompletedTools] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');
  const [showToolAnimation, setShowToolAnimation] = useState(false);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  
  // Level progression props
  const [currentLevel] = useState(3); // Level 3
  const [maxLevel] = useState(5); // Updated to 5 total levels
  const [moduleIdentifier] = useState('cooking-basics');
  const [lessonIdentifier] = useState('cooking-tools');

  // Level 3: Kitchen Tools - Advanced cooking knowledge
  const kitchenTools = [
    {
      id: 'spoon',
      name: 'SPOON',
      image: spoonImg, // Changed from emoji to image
      color: '#E3F2FD',
      borderColor: '#2196F3',
      description: 'We use a spoon to scoop and stir food',
      use: 'scoop or stir',
      animation: 'stirring motion',
      examples: ['soup', 'cereal', 'yogurt'],
      sound: 'This is a spoon. We use it to scoop or stir food.',
      encouragement: 'Perfect! A spoon is great for mixing and eating!'
    },
    {
      id: 'fork',
      name: 'FORK',
      image: forkImg, // Changed from emoji to image
      color: '#E8F5E8',
      borderColor: '#4CAF50',
      description: 'We use a fork to pick up and eat soft food',
      use: 'pick up food',
      animation: 'picking motion',
      examples: ['pasta', 'salad', 'fruit'],
      sound: 'This is a fork. We use it to pick up and eat soft food.',
      encouragement: 'Excellent! Forks help us eat neatly!'
    },
    {
      id: 'knife',
      name: 'KNIFE',
      image: knifeImg, // Changed from emoji to image
      color: '#FFF3E0',
      borderColor: '#FF9800',
      description: 'We use a knife to cut and slice food. Be careful!',
      use: 'cut or slice',
      animation: 'cutting motion',
      examples: ['bread', 'apple', 'cheese'],
      sound: 'This is a knife. We use it to cut or slice food. Be careful!',
      safety: true,
      encouragement: 'Great! Remember to always be careful with knives!'
    },
    {
      id: 'whisk',
      name: 'WHISK',
      image: whiskImg, // Changed from emoji to image
      color: '#FCE4EC',
      borderColor: '#E91E63',
      description: 'We use a whisk to mix eggs and liquids',
      use: 'mix and beat',
      animation: 'whisking motion',
      examples: ['eggs', 'batter', 'cream'],
      sound: 'This is a whisk. We use it to mix eggs and liquids.',
      encouragement: 'Amazing! Whisks make the best scrambled eggs!'
    }
  ];

  // Matching questions that use the tools (updated to match available tools)
  const matchingQuestions = [
    {
      id: 1,
      action: 'We mix the egg',
      image: eggImg, // Changed from emoji to image
      correctTool: 'whisk',
      choices: ['knife', 'whisk', 'spoon'],
      feedback: 'Great! A whisk is perfect for mixing eggs!'
    },
    {
      id: 2,
      action: 'We cut the apple',
      image: appleImg, // Changed from emoji to image
      correctTool: 'knife',
      choices: ['fork', 'spoon', 'knife'],
      feedback: 'Excellent! A knife cuts the apple into pieces!'
    },
    {
      id: 3,
      action: 'We scoop the soup',
      image: soupImg, // Changed from emoji to image
      correctTool: 'spoon',
      choices: ['spoon', 'whisk', 'fork'],
      feedback: 'Perfect! A spoon is great for scooping soup!'
    },
    {
      id: 4,
      action: 'We pick up pasta',
      image: pastaImg, // Changed from emoji to image
      correctTool: 'fork',
      choices: ['fork', 'knife', 'spoon'],
      feedback: 'Amazing! A fork picks up pasta easily!'
    }
  ];

  const currentTool = kitchenTools[currentToolIndex];
  const currentQuestion = matchingQuestions[currentQuestionIndex];
  const progressPercentage = gamePhase === 'introduction' 
    ? ((currentToolIndex + 1) / kitchenTools.length) * 100
    : ((currentQuestionIndex + 1) / matchingQuestions.length) * 100;

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
          setShowTip('Ready to learn kitchen tools? Let\'s get started!');
          return;
        }
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Fantastic! You've mastered kitchen tools before. Want to practice more?");
          } else {
            setShowTip('Ready to learn kitchen tools? Let\'s get started!');
          }
        } else {
          setShowTip('Ready to learn kitchen tools? Let\'s get started!');
        }
      } catch (error) {
        console.log('Error fetching progress:', error);
        setShowTip('Ready to learn kitchen tools? Let\'s get started!');
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
    if (autoPlayEnabled && currentTool) {
      setTimeout(() => {
        speak(currentTool.sound);
      }, 500);
    }
  };

  useEffect(() => {
    if (gamePhase === 'introduction' && !loading) {
      handleLearnMode();
    }
  }, [currentToolIndex, gamePhase, loading]);

  // Auto-speak when question changes
  useEffect(() => {
    if (gamePhase === 'matching' && autoPlayEnabled && currentQuestion && !loading) {
      setTimeout(() => {
        speak(`${currentQuestion.action}. What tool do we use?`);
      }, 1000);
    }
  }, [currentQuestionIndex, gamePhase, autoPlayEnabled, loading]);

  // Tool introduction navigation
  const nextTool = () => {
    if (currentToolIndex < kitchenTools.length - 1) {
      setCurrentToolIndex(currentToolIndex + 1);
    } else {
      setGamePhase('matching');
      setCurrentQuestionIndex(0);
    }
  };

  const previousTool = () => {
    if (currentToolIndex > 0) {
      setCurrentToolIndex(currentToolIndex - 1);
    }
  };

  const repeatToolInfo = () => {
    if (autoPlayEnabled && currentTool) {
      speak(currentTool.sound);
    }
    setShowToolAnimation(true);
    setTimeout(() => setShowToolAnimation(false), 2000);
  };

  // Matching game functions
  const handlePracticeAnswer = (toolId) => {
    setSelectedAnswer(toolId);
    setShowFeedback(true);
    
    const isCorrect = toolId === currentQuestion.correctTool;
    
    if (isCorrect) {
      // Show confetti animation and "Correct!" popup
      triggerCorrectAnimation();
      
      // Only increment score if this answer hasn't been correct before
      if (!correctAnswers.includes(currentQuestion.id)) {
        setScore(prev => prev + 1);
        setCorrectAnswers(prev => [...prev, currentQuestion.id]);
      }
      
      setTimeout(() => {
        speak(currentQuestion.feedback);
      }, 300);
      
      setTimeout(() => {
        if (currentQuestionIndex < matchingQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        } else {
          setShowCelebration(true);
          saveProgress();
          setTimeout(() => {
            speak("Fantastic! You learned all the kitchen tools!");
          }, 500);
        }
      }, 3500);
    } else {
      setTimeout(() => {
        speak(`Let's try again. This cooking action uses ${currentQuestion.correctTool.replace('-', ' ')}`);
      }, 300);
      
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, 2500);
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
      
      const finalScore = score + (correctAnswers.length > score ? 1 : 0);
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: matchingQuestions.length,
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
    const percentage = (finalScore / matchingQuestions.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const resetGame = () => {
    setGamePhase('introduction');
    setCurrentToolIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCorrectAnswers([]);
    setCompletedTools([]);
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
        // Navigate to Level 4
        if (navigate) {
          navigate('/lesson/cooking/level-4');
        } else {
          window.location.href = '/lesson/cooking/level-4';
        }
      } else {
        goToHomepage();
      }
    }, 300);
  };

  const hasNextLevel = currentLevel < maxLevel; // Now true since we have levels 4 and 5

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
            Loading kitchen tools...
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
                🍴 Kitchen Tools
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

                {/* Phase Toggle */}
                <Button
                  onClick={() => setGamePhase('introduction')}
                  variant={gamePhase === 'introduction' ? 'contained' : 'outlined'}
                  size="medium"
                  sx={{
                    borderRadius: '20px',
                    minWidth: '100px',
                    backgroundColor: gamePhase === 'introduction' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#FF9800',
                    color: gamePhase === 'introduction' ? 'white' : '#FF9800',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #FF9800',
                    '&:hover': {
                      backgroundColor: gamePhase === 'introduction' ? 'rgba(245, 124, 0, 0.9)' : 'rgba(255, 152, 0, 0.1)',
                    }
                  }}
                >
                  📚 Learn
                </Button>
                <Button
                  onClick={() => setGamePhase('matching')}
                  variant={gamePhase === 'matching' ? 'contained' : 'outlined'}
                  size="medium"
                  sx={{
                    borderRadius: '20px',
                    minWidth: '100px',
                    backgroundColor: gamePhase === 'matching' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#FF9800',
                    color: gamePhase === 'matching' ? 'white' : '#FF9800',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #FF9800',
                    '&:hover': {
                      backgroundColor: gamePhase === 'matching' ? 'rgba(245, 124, 0, 0.9)' : 'rgba(255, 152, 0, 0.1)',
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
                  {gamePhase === 'introduction' 
                    ? `Tool ${currentToolIndex + 1} of ${kitchenTools.length}`
                    : `Question ${currentQuestionIndex + 1} of ${matchingQuestions.length}`
                  }
                </Typography>
                <Chip 
                  label={`Score: ${score}/${matchingQuestions.length}`} 
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

            {gamePhase === 'introduction' ? (
              /* Learn Mode - Tool Introduction */
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px',
                pb: 4
              }}>
                {/* Tool Display Card */}
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
                  {/* Tool image display */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    transform: showToolAnimation ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s ease'
                  }}>
                    <img 
                      src={currentTool.image} 
                      alt={currentTool.name}
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
                    {currentTool.name}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#5D4037', 
                    lineHeight: 1.4,
                    fontSize: '1.1rem',
                    mb: 2
                  }}>
                    {currentTool.description}
                  </Typography>
                  
                  {/* Safety Warning */}
                  {currentTool.safety && (
                    <Box sx={{
                      backgroundColor: '#FFEBEE',
                      border: '2px solid #F44336',
                      borderRadius: '12px',
                      padding: '12px',
                      mb: 2,
                      color: '#C62828'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ⚠️ Always ask an adult for help with knives!
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Examples box */}
                  <Box sx={{
                    backgroundColor: '#FFF8E1',
                    border: '1px solid #FFE0B2',
                    borderRadius: '12px',
                    padding: '12px',
                    fontStyle: 'italic',
                    color: '#795548'
                  }}>
                    <Typography variant="body2">
                      💡 We use this to: {currentTool.use}
                    </Typography>
                  </Box>
                </Card>

                {/* Control Buttons */}
                <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    onClick={repeatToolInfo}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#2196F3',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#1976D2' }
                    }}
                  >
                    🔊 Say Name
                  </Button>
                  <Button
                    onClick={() => speak(currentTool.description)}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#4CAF50',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#45a049' }
                    }}
                  >
                    📝 What It Does
                  </Button>
                </Stack>

                {/* Navigation Buttons */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    onClick={previousTool}
                    disabled={currentToolIndex === 0}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      minWidth: '80px',
                      opacity: currentToolIndex === 0 ? 0.5 : 1,
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    ⬅️ Back
                  </Button>
                  <Button
                    onClick={nextTool}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      minWidth: '80px',
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    {currentToolIndex === kitchenTools.length - 1 ? '🎯 Practice' : '➡️ Next'}
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
              /* Practice Mode - Tool Matching */
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
                    {currentQuestion.action}
                  </Typography>
                  {/* Action image for question */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    mb: 2
                  }}>
                    <img 
                      src={currentQuestion.image} 
                      alt={currentQuestion.action}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#5D4037'
                  }}>
                    What tool do we use?
                  </Typography>
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
                  {currentQuestion.choices.map((toolId) => {
                    const tool = kitchenTools.find(t => t.id === toolId);
                    const isSelected = selectedAnswer === toolId;
                    const isCorrect = toolId === currentQuestion.correctTool;
                    const showResult = showFeedback && isSelected;
                    
                    return (
                      <Card
                        key={toolId}
                        onClick={() => !showFeedback && handlePracticeAnswer(toolId)}
                        sx={{
                          padding: '15px',
                          borderRadius: '15px',
                          border: '2px solid',
                          borderColor: showResult && isCorrect 
                            ? '#4CAF50' 
                            : showResult && !isCorrect 
                            ? '#F44336'
                            : '#E0E0E0',
                          cursor: showFeedback ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          backgroundColor: showResult && isCorrect 
                            ? 'rgba(200, 230, 201, 0.95)'
                            : showResult && !isCorrect 
                            ? 'rgba(255, 205, 210, 0.95)'
                            : 'rgba(255, 255, 255, 0.95)',
                          transition: 'all 0.3s ease',
                          transform: showResult && isCorrect 
                            ? 'scale(1.05)' : 'scale(1)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            transform: showFeedback ? 'scale(1)' : 'scale(1.02)',
                            boxShadow: showFeedback ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 6px 25px rgba(0,0,0,0.3)'
                          }
                        }}
                      >
                        {/* Tool image for options */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          mb: 1,
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}>
                          <img 
                            src={tool.image} 
                            alt={tool.name}
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
                          {tool.name}
                        </Typography>
                        {showResult && (
                          <Typography sx={{ 
                            fontSize: '2rem', 
                            mt: 1,
                            lineHeight: 1
                          }}>
                            {isCorrect ? '✅' : '❌'}
                          </Typography>
                        )}
                      </Card>
                    );
                  })}
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
                    onClick={() => speak(`${currentQuestion.action}. What tool do we use?`)}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#2196F3',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#1976D2' }
                    }}
                  >
                    🔊 Repeat
                  </Button>
                  <Button
                    onClick={goToHomepage}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    🏠 Home
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
                backgroundColor: 'rgba(76, 175, 80, 0.95)',
                color: 'white',
                padding: '20px 40px',
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                border: '4px solid #4CAF50',
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
            Kitchen Tool Master!
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
            You learned all {kitchenTools.length} kitchen tools!
          </Typography>
          <Typography variant="body1" sx={{ color: '#5D4037', lineHeight: 1.4, mb: 2 }}>
            Level {currentLevel} Complete! 
            {hasNextLevel ? ` Ready for Level ${currentLevel + 1}?` : ' You\'re now a kitchen tool expert! 🍴'}
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