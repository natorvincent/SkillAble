import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Card,
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
  saveStudentLessonProgress
} from '../../services/progressService';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Import ingredient images (using placeholders if needed)
import eggImg from "../../assets/cookingLevel1/egg.png";
import oilImg from "../../assets/cookingLevel1/oil.png"; // placeholder
import saltImg from "../../assets/cookingLevel1/salt.png"; // placeholder
import butterImg from "../../assets/cookingLevel1/butter.png"; // placeholder

export default function FriedEggLevel1() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [collectedIngredients, setCollectedIngredients] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // Level progression props
  const [currentLevel] = useState(1);
  const [maxLevel] = useState(5);

  // Fried egg ingredients with scattered positions
  const ingredients = [
    { 
      id: 1, 
      name: "EGG", 
      image: eggImg,
      description: "Fresh egg for frying",
      position: { top: '15%', left: '10%' },
      collected: false
    },
    { 
      id: 2, 
      name: "OIL", 
      image: oilImg || "🫒", // fallback to emoji if image not available
      description: "Oil to prevent sticking",
      position: { top: '20%', right: '15%' },
      collected: false
    },
    { 
      id: 3, 
      name: "SALT", 
      image: saltImg || "🧂",
      description: "Salt for seasoning",
      position: { bottom: '25%', left: '20%' },
      collected: false
    },
    { 
      id: 4, 
      name: "BUTTER", 
      image: butterImg || "🧈",
      description: "Butter for extra flavor",
      position: { bottom: '30%', right: '25%' },
      collected: false
    }
  ];

  const progressPercentage = (collectedIngredients.length / ingredients.length) * 100;
  const allCollected = collectedIngredients.length === ingredients.length;

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
          setShowTip('Drag all ingredients to the pan to cook your fried egg!');
          return;
        }
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          if (progressResponse.completed) {
            setShowTip("You've completed this before! Try collecting all ingredients again.");
          } else {
            setShowTip('Drag all ingredients to the pan to cook your fried egg!');
          }
        } else {
          setShowTip('Drag all ingredients to the pan to cook your fried egg!');
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
        setShowTip('Drag all ingredients to the pan to cook your fried egg!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  // Simple audio feedback
  const speak = (text) => {
    if (autoPlayEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  // Confetti animation function
  const triggerCorrectAnimation = () => {
    setShowCorrectAnimation(true);
    
    const pieces = [];
    for (let i = 0; i < 30; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 2,
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
      });
    }
    setConfettiPieces(pieces);
    
    setTimeout(() => {
      setShowCorrectAnimation(false);
      setConfettiPieces([]);
    }, 2000);
  };

  // Drag and drop handlers
  const handleDragStart = (e, ingredient) => {
    setDraggedItem(ingredient);
    e.dataTransfer.effectAllowed = 'move';
    speak(`Picking up ${ingredient.name}`);
    
    // Visual feedback for drag start
    e.target.style.opacity = '0.7';
    e.target.style.transform = 'scale(1.1) rotate(5deg)';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (draggedItem && !collectedIngredients.some(item => item.id === draggedItem.id)) {
      setCollectedIngredients(prev => [...prev, draggedItem]);
      
      // Enhanced feedback with sound effects
      triggerCorrectAnimation();
      
      // Multiple sound effects for different ingredients
      const soundEffects = {
        'EGG': `Crack! You added the ${draggedItem.name}! That's the main ingredient for our fried egg!`,
        'OIL': `Sizzle! The ${draggedItem.name} will keep our egg from sticking!`,
        'SALT': `Perfect! A pinch of ${draggedItem.name} adds great flavor!`,
        'BUTTER': `Delicious! ${draggedItem.name} will make our egg extra tasty!`
      };
      
      speak(soundEffects[draggedItem.name] || `Great! You added ${draggedItem.name} to the pan!`);
      
      // Visual "pop" effect on the pan
      const panElement = document.querySelector('[data-pan="true"]');
      if (panElement) {
        panElement.style.transform = 'translate(-50%, -50%) scale(1.1)';
        setTimeout(() => {
          panElement.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 200);
      }
      
      // Check if all ingredients collected
      const newCollectedCount = collectedIngredients.length + 1;
      if (newCollectedCount === ingredients.length) {
        setTimeout(() => {
          setShowCelebration(true);
          speak("Outstanding work! You collected all ingredients for your fried egg! You're ready to cook like a real chef!");
          saveProgress();
        }, 1500);
      }
    }
    
    setDraggedItem(null);
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
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: ingredients.length,
        maxScore: ingredients.length,
        completed: true,
        starsEarned: 3 // Full stars for completing the collection
      };
      
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  const resetGame = () => {
    setCollectedIngredients([]);
    setShowCelebration(false);
    setShowCorrectAnimation(false);
    setConfettiPieces([]);
    setProgressSaved(false);
    setProgressSaving(false);
    speak("Let's collect all the ingredients again!");
  };

  const goToHomepage = () => {
    if (navigate) {
      navigate('/homepage');
    } else {
      window.location.href = '/homepage';
    }
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    setTimeout(() => {
      if (currentLevel < maxLevel) {
        navigate('/lesson/cooking/level-2');
      } else {
        goToHomepage();
      }
    }, 300);
  };

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
          <CircularProgress size={50} sx={{ color: '#4CAF50' }} />
          <Typography variant="h5" sx={{ mt: 3, color: 'white', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            Loading fried egg cooking game...
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
      {/* Kitchen overlay for better readability */}
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
        
        {/* Main content container */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Header Section - Compact */}
          <Box sx={{ textAlign: 'center', width: '100%', maxWidth: '800px', mb: 2 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              color: 'white', 
              mb: 1,
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
              fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
            }}>
              🍳 Fried Egg Cooking
            </Typography>
            
            {/* Compact Top Bar with Level and Controls */}
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center" 
              alignItems="center" 
              sx={{ mb: 2 }}
            >
              <Chip 
                label={`Level ${currentLevel} - Collect Ingredients`}
                sx={{ 
                  backgroundColor: 'rgba(255, 152, 0, 0.9)', 
                  color: 'white', 
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  padding: '4px 8px'
                }}
              />
              
              {/* Compact Sound Toggle */}
              <Box sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '15px',
                padding: '4px 10px',
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
                      <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.8rem' }}>Sound</Typography>
                    </Box>
                  }
                  sx={{ margin: 0 }}
                />
              </Box>

              {/* Compact Chef Tip */}
              {showTip && (
                <Box sx={{ 
                  backgroundColor: 'rgba(76, 175, 80, 0.9)',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  maxWidth: '300px'
                }}>
                  <Box sx={{ fontSize: '1.2rem' }}>👨‍🍳</Box>
                  <Typography sx={{ 
                    fontSize: '0.8rem', 
                    color: 'white', 
                    fontWeight: '600',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    Drag ingredients to the pan!
                  </Typography>
                </Box>
              )}
            </Stack>

            {/* Cooking-themed Progress Display */}
            <Box sx={{ width: '100%', maxWidth: '500px', mx: 'auto' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body1" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                }}>
                  Ingredients: {collectedIngredients.length} of {ingredients.length}
                </Typography>
                <Chip 
                  label={`${Math.round(progressPercentage)}% Ready to Cook!`}
                  sx={{ 
                    backgroundColor: 'rgba(33, 150, 243, 0.9)', 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}
                />
              </Stack>
              
              {/* Cooking Pan Progress Bar */}
              <Box sx={{ 
                position: 'relative',
                width: '100%',
                height: '40px',
                background: 'linear-gradient(to right, #8B4513, #A0522D)',
                borderRadius: '20px',
                border: '3px solid #654321',
                overflow: 'hidden',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}>
                {/* Pan Handle */}
                <Box sx={{
                  position: 'absolute',
                  right: '-30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '8px',
                  backgroundColor: '#654321',
                  borderRadius: '4px',
                  zIndex: 2
                }} />
                
                {/* Progress Fill (like oil spreading in pan) */}
                <Box sx={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  background: allCollected 
                    ? 'linear-gradient(to right, #FFD700, #FFA500, #FF8C00)'
                    : 'linear-gradient(to right, #32CD32, #228B22, #006400)',
                  borderRadius: '17px',
                  transition: 'width 0.5s ease, background 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Shimmer effect */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    animation: 'shimmer 2s infinite',
                    '@keyframes shimmer': {
                      '0%': { left: '-100%' },
                      '100%': { left: '100%' }
                    }
                  }} />
                </Box>
                
                {/* Cooking Icons that appear as progress increases */}
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1.2rem',
                  zIndex: 3
                }}>
                  {allCollected ? '🍳' : progressPercentage > 75 ? '🔥' : progressPercentage > 50 ? '🥄' : progressPercentage > 25 ? '🫒' : '👨‍🍳'}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Enlarged Game Area */}
          <Box sx={{
            position: 'relative',
            width: { xs: '95%', sm: '90%', md: '85%', lg: '80%', xl: '75%' },
            maxWidth: '1200px',
            height: { xs: '500px', sm: '600px', md: '700px', lg: '750px' },
            background: 'linear-gradient(to bottom, #87CEEB 0%, #DEB887 100%)',
            borderRadius: '20px',
            border: '4px solid #8B4513',
            overflow: 'hidden',
            mt: 1,
            mb: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            
            {/* Kitchen Counter Background */}
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(to bottom, #DEB887, #CD853F)',
              borderRadius: '0 0 16px 16px'
            }} />

            {/* Central Cooking Pan - 2x Larger */}
            <Box
              data-pan="true"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '280px', sm: '320px', md: '360px' },
                height: { xs: '280px', sm: '320px', md: '360px' },
                background: allCollected 
                  ? 'radial-gradient(circle, #FFD700, #FFA500)'  // Golden when complete
                  : 'radial-gradient(circle, #2F2F2F, #1A1A1A)', // Dark pan
                borderRadius: '50%',
                border: { xs: '10px solid #333', md: '12px solid #333' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.3)',
                zIndex: 5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 'inset 0 12px 24px rgba(0,0,0,0.4), 0 16px 40px rgba(255, 215, 0, 0.3)'
                },
                '@keyframes chefWave': {
                  '0%, 100%': { transform: 'rotate(0deg)' },
                  '25%': { transform: 'rotate(-10deg)' },
                  '75%': { transform: 'rotate(10deg)' }
                }
              }}
            >
              <Typography sx={{
                fontSize: { xs: '80px', sm: '100px', md: '120px' },
                marginBottom: '12px',
                filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.6))',
                animation: allCollected ? 'bounce 1s infinite' : 'none'
              }}>
                🍳
              </Typography>
              <Typography sx={{
                color: 'white',
                fontSize: { xs: '14px', sm: '16px', md: '18px' },
                fontWeight: 'bold',
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                maxWidth: '80%'
              }}>
                {allCollected ? 'Ready to cook!' : 'Drag ingredients here!'}
              </Typography>
            </Box>

            {/* Scattered Ingredients on Counter */}
            {ingredients.filter(ingredient => 
              !collectedIngredients.some(collected => collected.id === ingredient.id)
            ).map((ingredient, index) => {
              // Scatter ingredients naturally on the counter
              const counterPositions = [
                { bottom: '15%', left: '15%' },  // Front left
                { bottom: '25%', right: '20%' }, // Front right  
                { bottom: '20%', left: '75%' },  // Back right
                { bottom: '30%', right: '65%' }  // Back left
              ];
              
              return (
                <Box
                  key={ingredient.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ingredient)}
                  onDragEnd={(e) => {
                    // Reset visual feedback after drag
                    e.target.style.opacity = '1';
                    e.target.style.transform = 'scale(1)';
                  }}
                  onClick={() => speak(`This is ${ingredient.name}. ${ingredient.description}`)}
                  sx={{
                    position: 'absolute',
                    ...counterPositions[index],
                    cursor: 'grab',
                    userSelect: 'none',
                    transition: 'all 0.3s ease',
                    animation: 'gentleBounce 4s infinite',
                    zIndex: 20,
                    padding: '15px',
                    '&:hover': {
                      transform: 'scale(1.2)',
                      animation: 'glow 1.5s infinite alternate, gentleBounce 4s infinite',
                      filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 1))',
                      zIndex: 25
                    },
                    '&:active': {
                      cursor: 'grabbing'
                    }
                  }}
                  title={`Click to learn about ${ingredient.name}, then drag to the pan!`}
                >
                  {typeof ingredient.image === 'string' && ingredient.image.startsWith('http') || ingredient.image.endsWith('.png') ? (
                    <img 
                      src={ingredient.image} 
                      alt={ingredient.name}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))'
                      }}
                    />
                  ) : (
                    <Box sx={{ 
                      fontSize: { xs: '80px', sm: '100px', md: '120px' },
                      filter: 'drop-shadow(4px 4px 8px rgba(0,0,0,0.4))',
                      lineHeight: 1
                    }}>
                      {ingredient.image}
                    </Box>
                  )}
                  
                  {/* Ingredient Label */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: '-35px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 12px',
                    borderRadius: '15px',
                    fontSize: { xs: '12px', sm: '14px' },
                    fontWeight: 'bold',
                    color: '#333',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                    whiteSpace: 'nowrap',
                    border: '2px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    {ingredient.name}
                  </Box>
                </Box>
              );
            })}

            {/* Cooking Effects Display */}
            {collectedIngredients.length > 0 && (
              <Box sx={{
                position: 'absolute',
                bottom: '70%',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 2,
                zIndex: 15
              }}>
                {collectedIngredients.map((ingredient, index) => (
                  <Box 
                    key={ingredient.id}
                    sx={{
                      animation: `cookingEffect 2s ease-out ${index * 0.5}s`,
                      '@keyframes cookingEffect': {
                        '0%': {
                          transform: 'translateY(0) scale(1)',
                          opacity: 1
                        },
                        '50%': {
                          transform: 'translateY(-20px) scale(1.2)',
                          opacity: 0.8
                        },
                        '100%': {
                          transform: 'translateY(-40px) scale(0.8)',
                          opacity: 0
                        }
                      }
                    }}
                  >
                    {/* Cooking effect emojis */}
                    {ingredient.name === 'EGG' && '🥚💫'}
                    {ingredient.name === 'OIL' && '🫒✨'}
                    {ingredient.name === 'SALT' && '🧂❄️'}
                    {ingredient.name === 'BUTTER' && '🧈💛'}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Floating Bottom Control Bar */}
          <Box sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            display: 'flex',
            gap: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 24px',
            borderRadius: '30px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            border: '2px solid rgba(255, 255, 255, 0.5)'
          }}>
            <Button
              onClick={() => speak("Drag the egg, oil, salt, and butter from the counter into the pan on the stove to collect all ingredients for your fried egg!")}
              variant="contained"
              size="medium"
              sx={{
                backgroundColor: '#2196F3',
                borderRadius: '20px',
                minWidth: '120px',
                '&:hover': { backgroundColor: '#1976D2' }
              }}
            >
              🔊 Instructions
            </Button>
            <Button
              onClick={resetGame}
              variant="contained"
              size="medium"
              sx={{
                backgroundColor: '#FF9800',
                borderRadius: '20px',
                minWidth: '100px',
                '&:hover': { backgroundColor: '#F57C00' }
              }}
            >
              🔄 Reset
            </Button>
            <Button
              onClick={goToHomepage}
              variant="contained"
              size="medium"
              sx={{
                backgroundColor: '#9C27B0',
                borderRadius: '20px',
                minWidth: '100px',
                '&:hover': { backgroundColor: '#7B1FA2' }
              }}
            >
              🏠 Home
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Confetti Animation */}
      {showCorrectAnimation && (
        <>
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
                borderRadius: '50%',
                animation: 'confettiFall 2s linear forwards',
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
          
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10000,
              animation: 'correctPop 2s ease-out forwards',
              '@keyframes correctPop': {
                '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
                '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 1 },
                '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 }
              },
            }}
          >
            <Box sx={{
              backgroundColor: 'rgba(76, 175, 80, 0.95)',
              color: 'white',
              padding: '20px 40px',
              borderRadius: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', margin: 0 }}>
                Great! ⭐
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/* Success Dialog - "Good Job!" popup */}
      <Dialog
        open={showCelebration}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 248, 220, 0.98)',
            border: '4px solid #4CAF50',
            backdropFilter: 'blur(15px)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
          <EmojiEventsIcon sx={{ fontSize: 100, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            Good Job!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {[...Array(3)].map((_, i) => (
              <StarIcon key={i} sx={{ color: '#FFCA3A', fontSize: 50, mx: 0.5 }} />
            ))}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold', 
            color: '#FF9800', 
            mb: 2,
            fontSize: '1.8rem'
          }}>
            Perfect! 🍳
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#2E7D32', 
            lineHeight: 1.6, 
            mb: 2,
            fontSize: '1.1rem'
          }}>
            You collected all the ingredients needed to make a delicious fried egg! 
            You gathered the egg, oil, salt, and butter - everything a chef needs!
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#666', 
            fontStyle: 'italic',
            fontSize: '1rem'
          }}>
            Now you're ready to cook! Remember to always ask an adult to help when using the stove.
          </Typography>
          
          {progressSaving && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.9)', borderRadius: '12px', color: 'white' }}>
              <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
              <Typography variant="body2">Saving your progress...</Typography>
            </Box>
          )}
          
          {progressSaved && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.9)', borderRadius: '12px', color: 'white' }}>
              <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">Progress saved successfully!</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button 
            onClick={continueToNextLevel}
            disabled={progressSaving}
            variant="contained"
            size="large"
            sx={{ 
              backgroundColor: '#4CAF50',
              borderRadius: '15px',
              minWidth: '120px'
            }}
          >
            {progressSaving ? 'Saving...' : (currentLevel < maxLevel ? '🚀 Next Level' : '🏠 Go Home')}
          </Button>
          <Button 
            onClick={resetGame}
            variant="outlined"
            size="large"
            sx={{ 
              borderColor: '#FF9800', 
              color: '#FF9800',
              borderRadius: '15px',
              minWidth: '120px',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
                backgroundColor: 'rgba(255, 152, 0, 0.1)'
              }
            }}
          >
            🔄 Play Again
          </Button>
          <Button 
            onClick={goToHomepage}
            variant="contained"
            size="large"
            sx={{ 
              backgroundColor: '#2196F3',
              borderRadius: '15px',
              minWidth: '120px'
            }}
          >
            🏠 Home
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}