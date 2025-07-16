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

// Import ingredient images
import eggImg from "../../assets/cookingLevel1/egg.png";
import milkImg from "../../assets/cookingLevel1/milk.png";
import breadImg from "../../assets/cookingLevel1/bread.png";
import appleImg from "../../assets/cookingLevel1/apple.png";

export default function CookingLevel1() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [currentIngredient, setCurrentIngredient] = useState(0);
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
  
  // Level progression props
  const [currentLevel] = useState(1); // Level 1
  const [maxLevel] = useState(3); // Total number of levels available
  const [moduleIdentifier] = useState('cooking-basics'); // Module identifier
  const [lessonIdentifier] = useState('ingredients'); // Lesson identifier

  const ingredients = [
    { 
      id: 1, 
      name: "EGG", 
      image: eggImg, // Changed from emoji to image
      color: "#FFF3E0",
      sound: "egg",
      description: "We crack eggs to cook them",
      encouragement: "Great job! Eggs are for breakfast!"
    },
    { 
      id: 2, 
      name: "MILK", 
      image: milkImg, // Changed from emoji to image
      color: "#E8F5E8",
      sound: "milk", 
      description: "Milk is white and good to drink",
      encouragement: "Wonderful! Milk comes from cows!"
    },
    { 
      id: 3, 
      name: "BREAD", 
      image: breadImg, // Changed from emoji to image
      color: "#FFF8E1",
      sound: "bread",
      description: "Bread is soft and we can make toast",
      encouragement: "Excellent! Bread is yummy!"
    },
    { 
      id: 4, 
      name: "APPLE", 
      image: appleImg, // Changed from emoji to image
      color: "#FFEBEE",
      sound: "apple",
      description: "Apples are red and crunchy",
      encouragement: "Amazing! Apples are healthy!"
    }
  ];

  const currentItem = ingredients[currentIngredient];
  const progressPercentage = ((currentIngredient + 1) / ingredients.length) * 100;

  // Get student ID from localStorage
  const getStudentId = () => {
    const studentId = localStorage.getItem('studentId');
    const userType = localStorage.getItem('userType');
    
    console.log("Getting student ID - Type:", userType, "ID:", studentId);
    
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
          console.log('Missing studentId or lessonId:', { studentId, lessonId });
          setLoading(false);
          setShowTip('Let\'s learn about cooking ingredients!');
          return;
        }
        
        console.log('Fetching progress for student:', studentId, 'lesson:', lessonId);
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Great job! You finished this before. Want to try again?");
          } else {
            setShowTip('Let\'s learn about cooking ingredients!');
          }
          console.log('Loaded existing progress:', progressResponse);
        } else {
          console.log('No existing progress found - starting fresh');
          setShowTip('Let\'s learn about cooking ingredients!');
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
        setShowTip('Let\'s learn about cooking ingredients!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  // Simple audio feedback (using speech synthesis)
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const handleLearnMode = () => {
    if (autoPlayEnabled) {
      speak(currentItem.name);
    }
  };

  useEffect(() => {
    if (gameMode === 'learn' && !loading) {
      handleLearnMode();
    }
  }, [currentIngredient, gameMode, loading]);

  const nextIngredient = () => {
    if (currentIngredient < ingredients.length - 1) {
      setCurrentIngredient(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      // All ingredients learned, offer practice
      setGameMode('practice');
      setCurrentIngredient(0);
    }
  };

  const previousIngredient = () => {
    if (currentIngredient > 0) {
      setCurrentIngredient(prev => prev - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePracticeAnswer = (answerId) => {
    setSelectedAnswer(answerId);
    setShowFeedback(true);
    
    const isCorrect = answerId === currentItem.id;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setCompleted(prev => [...prev, currentItem.id]);
      speak(currentItem.encouragement);
      
      setTimeout(() => {
        if (currentIngredient < ingredients.length - 1) {
          setCurrentIngredient(prev => prev + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        } else {
          setShowCelebration(true);
          saveProgress();
          speak("Wonderful job! You learned all the ingredients!");
        }
      }, 3000);
    } else {
      speak(`Try again! This is ${currentItem.name}`);
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, 2000);
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
      
      const finalScore = score + (completed.length > score ? 1 : 0); // Account for current correct answer
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: ingredients.length,
        completed: true,
        starsEarned: getStarRating(finalScore)
      };
      
      console.log('Saving progress for student:', studentId, progressData);
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      
      console.log('Progress saved successfully!');
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  // Calculate star rating based on score
  const getStarRating = (finalScore = score) => {
    const percentage = (finalScore / ingredients.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const resetGame = () => {
    setCurrentIngredient(0);
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
        // Navigate to Level 2
        if (navigate) {
          navigate('/lesson/cooking/level-2');
        } else {
          window.location.href = '/lesson/cooking/level-2';
        }
      } else {
        goToHomepage();
      }
    }, 300);
  };

  const hasNextLevel = currentLevel < maxLevel;

  // Loading state with Material-UI styling
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
          <CircularProgress size={50} sx={{ color: '#4CAF50' }} />
          <Typography variant="h5" sx={{ mt: 3, color: 'white', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Loading cooking lesson...
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
                 Learning Ingredients
              </Typography>
              
              <Chip 
                label={`Level ${currentLevel} of ${maxLevel}`}
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.9)', 
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
                  backgroundColor: 'rgba(33, 150, 243, 0.9)',
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
                    backgroundColor: gameMode === 'learn' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#4CAF50',
                    color: gameMode === 'learn' ? 'white' : '#4CAF50',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #4CAF50',
                    '&:hover': {
                      backgroundColor: gameMode === 'learn' ? 'rgba(69, 160, 73, 0.9)' : 'rgba(76, 175, 80, 0.1)',
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
                    backgroundColor: gameMode === 'practice' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#4CAF50',
                    color: gameMode === 'practice' ? 'white' : '#4CAF50',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #4CAF50',
                    '&:hover': {
                      backgroundColor: gameMode === 'practice' ? 'rgba(69, 160, 73, 0.9)' : 'rgba(76, 175, 80, 0.1)',
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
                  Ingredient {currentIngredient + 1} of {ingredients.length}
                </Typography>
                <Chip 
                  label={`Score: ${score}/${ingredients.length}`} 
                  sx={{ 
                    backgroundColor: 'rgba(255, 152, 0, 0.9)', 
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
                    backgroundColor: '#4CAF50'
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
                {/* Ingredient Display Card */}
                <Card sx={{
                  backgroundColor: 'rgba(255, 250, 244, 0.95)',
                  borderRadius: '20px',
                  padding: '25px',
                  mb: 3,
                  border: '3px solid #4CAF50',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  width: '100%',
                  backdropFilter: 'blur(15px)'
                }}>
                  {/* Ingredient image */}
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
                    color: '#2E7D32', 
                    mb: 1,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {currentItem.name}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#1976D2', 
                    lineHeight: 1.4,
                    fontSize: '1.1rem'
                  }}>
                    {currentItem.description}
                  </Typography>
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
                    🔊 Say Name
                  </Button>
                  <Button
                    onClick={() => speak(currentItem.description)}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#FF9800',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#F57C00' }
                    }}
                  >
                    📖 Read Info
                  </Button>
                </Stack>

                {/* Navigation Buttons */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    onClick={previousIngredient}
                    disabled={currentIngredient === 0}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      minWidth: '80px',
                      opacity: currentIngredient === 0 ? 0.5 : 1,
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    ⬅️ Prev
                  </Button>
                  <Button
                    onClick={nextIngredient}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      minWidth: '80px',
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    {currentIngredient === ingredients.length - 1 ? '🎯 Practice' : '➡️ Next'}
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
                  border: '3px solid #4CAF50',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  width: '100%',
                  backdropFilter: 'blur(15px)'
                }}>
                  <Typography sx={{ fontSize: '3rem', mb: 1 }}>❓</Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold', 
                    color: '#2E7D32', 
                    mb: 2
                  }}>
                    Which ingredient is this?
                  </Typography>
                  {/* Ingredient image for question */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    <img 
                      src={currentItem.image} 
                      alt="Guess this ingredient"
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
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  width: '100%',
                  maxWidth: '400px',
                  mb: 3
                }}>
                  {ingredients.map((ingredient) => (
                    <Card
                      key={ingredient.id}
                      onClick={() => !showFeedback && handlePracticeAnswer(ingredient.id)}
                      sx={{
                        padding: '15px',
                        borderRadius: '15px',
                        border: '2px solid',
                        borderColor: showFeedback && selectedAnswer === ingredient.id && ingredient.id === currentItem.id 
                          ? '#4CAF50' 
                          : showFeedback && selectedAnswer === ingredient.id && ingredient.id !== currentItem.id 
                          ? '#F44336'
                          : '#E0E0E0',
                        cursor: showFeedback ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        backgroundColor: showFeedback && selectedAnswer === ingredient.id && ingredient.id === currentItem.id 
                          ? 'rgba(200, 230, 201, 0.95)'
                          : showFeedback && selectedAnswer === ingredient.id && ingredient.id !== currentItem.id 
                          ? 'rgba(255, 205, 210, 0.95)'
                          : 'rgba(255, 255, 255, 0.95)',
                        transition: 'all 0.3s ease',
                        transform: showFeedback && selectedAnswer === ingredient.id && ingredient.id === currentItem.id 
                          ? 'scale(1.05)' : 'scale(1)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        '&:hover': {
                          transform: showFeedback ? 'scale(1)' : 'scale(1.02)',
                          boxShadow: showFeedback ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 6px 25px rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      {/* Ingredient image for options */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}>
                        <img 
                          src={ingredient.image} 
                          alt={ingredient.name}
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
                        color: '#2E7D32',
                        fontSize: '0.9rem'
                      }}>
                        {ingredient.name}
                      </Typography>
                    </Card>
                  ))}
                </Box>

                {/* Feedback Section */}
                {showFeedback && (
                  <Card sx={{
                    padding: '15px',
                    borderRadius: '15px',
                    textAlign: 'center',
                    backgroundColor: selectedAnswer === currentItem.id ? 'rgba(200, 230, 201, 0.95)' : 'rgba(255, 205, 210, 0.95)',
                    border: '2px solid',
                    borderColor: selectedAnswer === currentItem.id ? '#4CAF50' : '#F44336',
                    mb: 3,
                    width: '100%',
                    backdropFilter: 'blur(15px)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold',
                      mb: 1 
                    }}>
                      {selectedAnswer === currentItem.id ? '🎉 Correct!' : '💪 Try Again!'}
                    </Typography>
                    <Typography variant="body1">
                      {selectedAnswer === currentItem.id 
                        ? currentItem.encouragement
                        : `This is ${currentItem.name}. ${currentItem.description}`
                      }
                    </Typography>
                  </Card>
                )}

                {/* Control Buttons */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    onClick={resetGame}
                    variant="contained"
                    size="medium"
                    sx={{
                      backgroundColor: '#FF9800',
                      borderRadius: '15px',
                      minWidth: '100px',
                      '&:hover': { backgroundColor: '#F57C00' }
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

      {/* Success Dialog */}
      <Dialog
        open={showCelebration}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 250, 244, 0.98)',
            border: '4px solid #4CAF50',
            backdropFilter: 'blur(15px)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
          <EmojiEventsIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            Great Job!
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
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF9800', mb: 1 }}>
            You learned all {ingredients.length} ingredients!
          </Typography>
          <Typography variant="body1" sx={{ color: '#2E7D32', lineHeight: 1.4, mb: 2 }}>
            Level {currentLevel} Complete! 
            {hasNextLevel ? ` Ready for Level ${currentLevel + 1}?` : ' You finished all levels!'}
          </Typography>
          
          {progressSaving && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.9)', borderRadius: '12px', color: 'white', backdropFilter: 'blur(10px)' }}>
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
              borderColor: '#4CAF50', 
              color: '#2E7D32',
              borderRadius: '10px',
              minWidth: '120px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
              }
            }}
          >
            🔄 Replay
          </Button>
          
          <Button 
            onClick={goToHomepage}
            variant="contained"
            size="medium"
            sx={{ 
              backgroundColor: 'rgba(255, 152, 0, 0.9)',
              borderRadius: '10px',
              minWidth: '120px',
              backdropFilter: 'blur(10px)',
              '&:hover': { backgroundColor: 'rgba(245, 124, 0, 0.9)' }
            }}
          >
            🏠 Home
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}