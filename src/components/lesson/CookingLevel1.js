import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Dialog,
  Stack,
  LinearProgress,
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

// Import images
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";
// Import Baconardo images
import baconardoImg from "../../assets/cookingLevel1/Baconardo.png"; 

// Import cooking ingredient images
import eggImg from "../../assets/cookingLevel1/egg.png";
import oilImg from "../../assets/cookingLevel1/oil.png";
import saltImg from "../../assets/cookingLevel1/salt.png";
import butterImg from "../../assets/cookingLevel1/butter.png";
import milkImg from "../../assets/cookingLevel1/milk.png";
import breadImg from "../../assets/cookingLevel1/bread.png";
import cheeseImg from "../../assets/cookingLevel1/cheese.png";

// Import basket image
import basketImg from "../../assets/hygienelevel4/showerbasket.png";

// Import services
import { saveStudentLessonProgress } from '../../services/progressService';

export default function FriedEggLevel1() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [collectedIngredients, setCollectedIngredients] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [animatingItems, setAnimatingItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [characterVisible, setCharacterVisible] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [hoveredIngredient, setHoveredIngredient] = useState(null);

  // Updated ingredient positions with better spacing and smaller sizes
  const correctIngredients = [
    { id: 'egg', name: 'Egg', image: eggImg, correct: true, size: 'medium', position: { left: '5%', top: '15%' } },
    { id: 'oil', name: 'Oil', image: oilImg, correct: true, size: 'small', position: { left: '25%', top: '35%' } },
    { id: 'salt', name: 'Salt', image: saltImg, correct: true, size: 'xsmall', position: { right: '15%', top: '20%' } },
    { id: 'butter', name: 'Butter', image: butterImg, correct: true, size: 'small', position: { left: '30%', top: '65%' } }
  ];

  const wrongIngredients = [
    { id: 'milk', name: 'Milk', image: milkImg, correct: false, size: 'small', position: { right: '25%', top: '60%' } },
    { id: 'cheese', name: 'Cheese', image: cheeseImg, correct: false, size: 'small', position: { right: '5%', top: '45%' } }
  ];

  const allIngredients = [...correctIngredients, ...wrongIngredients];
  const availableIngredients = allIngredients.filter(ing => 
    !collectedIngredients.some(collected => collected.id === ing.id)
  );

  const getStudentId = () => {
    try {
      const studentId = localStorage.getItem('studentId');
      const userType = localStorage.getItem('userType');
      
      console.log('Retrieving student ID:', { studentId, userType });
      
      if (!studentId || studentId === 'null' || studentId === 'undefined') {
        console.warn('No student ID found in localStorage');
        return null;
      }
      
      const parsedId = parseInt(studentId, 10);
      if (isNaN(parsedId)) {
        console.warn('Invalid student ID format:', studentId);
        return null;
      }
      
      console.log('Successfully retrieved student ID:', parsedId);
      return parsedId;
    } catch (error) {
      console.error('Error retrieving student ID:', error);
      return null;
    }
  };

  const handleStartGame = () => {
    setShowStartScreen(false);
  };

  const handleDragStart = (e, itemType) => {
    e.dataTransfer.setData('text/plain', itemType);
    setDraggedItem(itemType);
    playSound('pickup');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    const itemType = e.dataTransfer.getData('text/plain');
    const item = allIngredients.find(ing => ing.id === itemType);
    
    if (item) {
      if (item.correct) {
        // Get basket position for animation target
        const basketRect = e.currentTarget.getBoundingClientRect();
        const basketCenter = {
          x: basketRect.left + basketRect.width / 2,
          y: basketRect.top + basketRect.height / 2
        };

        // Start animation
        const animatingItem = {
          ...item,
          startX: e.clientX,
          startY: e.clientY,
          targetX: basketCenter.x,
          targetY: basketCenter.y,
          id: `${item.id}-${Date.now()}`
        };
        
        setAnimatingItems(prev => [...prev, animatingItem]);
        
        setFeedbackMessage(`Great! You added ${item.name.toLowerCase()} for your fried egg!`);
        playSound('correct');
        
        // Auto-hide feedback message after 3 seconds
        setTimeout(() => {
          setFeedbackMessage('');
        }, 3000);
        
        // Remove the item after animation completes
        setTimeout(() => {
          setAnimatingItems(prev => prev.filter(i => i.id !== animatingItem.id));
          setCollectedIngredients(prev => [...prev, item]);
          
          // Update score (25 points per correct ingredient)
          const newScore = score + 25;
          setScore(newScore);
          
          // Check if all correct items are collected
          const remainingCorrectItems = correctIngredients.filter(correct => 
            !collectedIngredients.some(collected => collected.id === correct.id) && 
            correct.id !== item.id
          );
          
          if (remainingCorrectItems.length === 0) {
            setTimeout(() => {
              setGameCompleted(true);
              setShowSuccess(true);
              setCharacterVisible(false);
              saveProgress();
            }, 1500);
          }
        }, 600);
        
      } else {
        // Incorrect item
        setFeedbackMessage(`Oops! ${item.name} isn't needed for making fried eggs. Try again!`);
        playSound('wrong');
        
        // Auto-hide feedback message after 3 seconds
        setTimeout(() => {
          setFeedbackMessage('');
        }, 3000);
      }
    }
    
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const playSound = (type) => {
    if (!autoPlayEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'correct') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (type === 'wrong') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } else if (type === 'pickup') {
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (e) {
      console.log('Audio context not supported:', e);
    }
  };

  const saveProgress = async () => {
    if (progressSaving || progressSaved) {
      console.log('Progress already saving or saved, skipping');
      return;
    }

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId) {
        console.error('Cannot save progress: No valid student ID found');
        setProgressSaving(false);
        return;
      }
      
      if (!lessonId) {
        console.error('Cannot save progress: No lesson ID available');
        setProgressSaving(false);
        return;
      }

      const progressData = {
        score: 100,
        maxScore: 100,  
        completed: true,
        starsEarned: 3
      };
      
      console.log('Saving progress data:', progressData);
      
      await saveStudentLessonProgress(
        studentId, 
        parseInt(lessonId, 10), 
        progressData
      );
      
      console.log('Progress saved successfully');
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  const getStarRating = () => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  const handleContinue = async () => {
    console.log('Continue clicked, progress state:', { progressSaved, progressSaving });
    
    if (!progressSaved && !progressSaving) {
      console.log('Saving progress before continue...');
      await saveProgress();
    } else if (progressSaving) {
      console.log('Progress is currently saving, please wait...');
      return;
    }
    
    console.log('Navigating to next level...');
    setTimeout(() => {
      navigate('/lesson/cooking/level-2');
    }, 300);
  };

  const resetGame = () => {
    setCollectedIngredients([]);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    setAnimatingItems([]);
    setFeedbackMessage('');
    setCharacterVisible(true);
    setStarAnimationStage(0);
    setHoveredIngredient(null);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  useEffect(() => {
    if (showSuccess) {
      const animateStars = async () => {
        setStarAnimationStage(0);
        const totalStars = getStarRating();
        
        for (let i = 0; i < totalStars; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setStarAnimationStage(i + 1);
        }
      };
      
      const timer = setTimeout(animateStars, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, score]);

  useEffect(() => {
    if (showSuccess) {
      const createConfetti = () => {
        const pieces = [];
        for (let i = 0; i < 150; i++) {
          pieces.push({
            id: i,
            x: Math.random() * 100,
            y: -10,
            rotation: Math.random() * 360,
            color: [
              '#FF0080', '#00FFFF', '#FF4500', '#9400D3', '#32CD32', '#FFD700', 
              '#FF1493', '#00FF7F', '#1E90FF', '#FF6347', '#ADFF2F', '#FF69B4', 
              '#00CED1', '#FFA500', '#DA70D6'
            ][Math.floor(Math.random() * 15)],
            size: Math.random() * 12 + 6,
            speed: Math.random() * 4 + 2,
            drift: (Math.random() - 0.5) * 3,
            width: Math.random() * 8 + 4,
            height: Math.random() * 12 + 6
          });
        }
        setConfettiPieces(pieces);
      };
      
      const timer = setTimeout(createConfetti, 500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Enhanced Character Component with Baconardo
  const Character = () => {
    if (!characterVisible) {
      return null;
    }

    const getCharacterAnimation = () => {
      if (feedbackMessage && feedbackMessage.includes('Oops!')) {
        return 'shake 0.5s ease-in-out';
      }
      
      if (gameCompleted) {
        return 'celebrate 2s ease-in-out infinite';
      }
      
      return 'float 3s ease-in-out infinite, subtleBlink 4s ease-in-out infinite';
    };

    const getCharacterMessage = () => {
      if (feedbackMessage && feedbackMessage.includes('Oops!')) {
        return 'Oops! Try again! 🐾';
      }
      
      if (gameCompleted) {
        return 'Perfect! All ingredients collected! 🎉';
      }
      
      return `Find cooking ingredients! ${collectedIngredients.length}/4 collected!`;
    };

    return (
      <Box
        sx={{
          position: 'fixed',
          left: 20,
          bottom: 20,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Box
          component="img"
          src={baconardoImg}
          alt="Baconardo the Cooking Cat"
          sx={{
            width: 120,
            height: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            outline: '4px solid white',
            borderRadius: '50%',
            animation: getCharacterAnimation(),
            '@keyframes float': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
              '100%': { transform: 'translateY(0px)' }
            },
            '@keyframes celebrate': {
              '0%': { transform: 'translateY(0px) rotate(0deg)' },
              '25%': { transform: 'translateY(-15px) rotate(10deg)' },
              '50%': { transform: 'translateY(-20px) rotate(0deg)' },
              '75%': { transform: 'translateY(-15px) rotate(-10deg)' },
              '100%': { transform: 'translateY(0px) rotate(0deg)' }
            },
            '@keyframes shake': {
              '0%': { transform: 'translateX(0px)' },
              '25%': { transform: 'translateX(-5px)' },
              '50%': { transform: 'translateX(5px)' },
              '75%': { transform: 'translateX(-5px)' },
              '100%': { transform: 'translateX(0px)' }
            },
            '@keyframes subtleBlink': {
              '0%, 90%, 100%': { opacity: 1 },
              '95%': { opacity: 0.7 }
            }
          }}
        />
        <Paper
          sx={{
            position: 'absolute',
            top: -80,
            left: 140,
            backgroundColor: 'white',
            color: '#280B60',
            padding: '12px 16px',
            borderRadius: '20px',
            fontSize: '1.1rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            maxWidth: '180px',
            boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            border: '3px solid #FF9800',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '-12px',
              marginTop: '-8px',
              borderWidth: '8px',
              borderStyle: 'solid',
              borderColor: 'transparent #FF9800 transparent transparent'
            }
          }}
        >
          {getCharacterMessage()}
        </Paper>
      </Box>
    );
  };

  // Start screen with fixed alignment
  if (showStartScreen) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${kitchenBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 202, 58, 0.8) 0%, rgba(255, 152, 0, 0.8) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 1,
          padding: 3
        }}>
          <Typography variant="h1" sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            mb: 4,
            fontFamily: 'Poppins, sans-serif',
            fontSize: { xs: '2.5rem', md: '4rem' },
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            textAlign: 'center',
            lineHeight: 1.2
          }}>
            Find the Right Ingredients
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 6,
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
              '100%': { transform: 'translateY(0px)' }
            },
            maxWidth: '800px',
            textAlign: 'center'
          }}>
            <Box
              component="img"
              src={baconardoImg}
              alt="Baconardo"
              sx={{
                width: 120,
                height: 'auto',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                outline: '4px solid white',
                borderRadius: '50%',
                mr: { xs: 0, md: 4 },
                mb: { xs: 3, md: 0 }
              }}
            />
            <Typography variant="h4" sx={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.5,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              maxWidth: '600px',
              textAlign: { xs: 'center', md: 'left' }
            }}>
              Hi! I'm Baconardo! Let's cook the perfect fried egg with the right ingredients!
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={3}>
            <Button 
              variant="contained"
              onClick={handleStartGame}
              sx={{ 
                background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                color: 'white',
                px: 8,
                py: 2,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.5rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Start Cooking!
            </Button>
          </Stack>
        </Box>
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
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      overflow: 'hidden'
    }}>
      {/* Animation Styles */}
      <style>
        {`
          @keyframes flyToBasket {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            70% {
              transform: translate(var(--target-x), var(--target-y)) scale(0.8);
              opacity: 0.8;
            }
            100% {
              transform: translate(var(--target-x), var(--target-y)) scale(0);
              opacity: 0;
            }
          }

          .animating-item {
            position: fixed !important;
            pointer-events: none;
            z-index: 1000;
            animation: flyToBasket 0.6s ease-in forwards;
          }
        `}
      </style>
      
      <Container maxWidth="xl" sx={{ 
        py: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Enhanced Progress Bar */}
        <Box sx={{ 
          maxWidth: '800px', 
          mx: 'auto',
          position: 'relative',
          mb: 2,
          zIndex: 1010,
          mt: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1 
          }}>
            {[...Array(4)].map((_, index) => {
              const isFilled = index < collectedIngredients.length;
              return (
                <Box
                  key={index}
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isFilled ? '#4CAF50' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: isFilled ? 'white' : '#666',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    border: '2px solid white',
                    animation: isFilled ? 'popIn 0.5s ease-out' : 'none',
                    '@keyframes popIn': {
                      '0%': { transform: 'scale(0)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }}
                >
                  {isFilled ? '✓' : index + 1}
                </Box>
              );
            })}
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={(collectedIngredients.length / 4) * 100} 
            sx={{ 
              height: 16,
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              '& .MuiLinearProgress-bar': {
                borderRadius: '10px',
                background: 'linear-gradient(90deg, #FFC107 0%, #FF9800 50%, #4CAF50 100%)',
                transition: 'width 0.5s ease-in-out'
              }
            }} 
          />
          
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            px: 2,
            py: 1,
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            textAlign: 'center',
            mt: 1,
            fontSize: '0.9rem'
          }}>
            Cooking Ingredients: {collectedIngredients.length}/4 collected
          </Typography>
        </Box>

        {/* Character Component */}
        {!showStartScreen && <Character />}

        {/* Less Distracting Navigation Buttons */}
        <Box sx={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          opacity: 0.8,
          '&:hover': {
            opacity: 1
          }
        }}>
          <Button 
            variant="contained"
            onClick={resetGame}
            sx={{ 
              background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '10px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 6px 12px rgba(255, 89, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label="Reset"
          >
            🔄
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleGoHome}
            sx={{ 
              background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
              color: 'white',
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '10px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 6px 12px rgba(25, 130, 196, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label="Home"
          >
            🏠
          </Button>

          {/* Sound Toggle Button */}
          <Button 
            variant="contained"
            onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
            sx={{ 
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              color: 'white',
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '10px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 6px 12px rgba(76, 175, 80, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label={autoPlayEnabled ? 'Mute sounds' : 'Unmute sounds'}
          >
            {autoPlayEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </Button>
        </Box>

        {/* Game Area - Basket Only, Nothing Below */}
        {!gameCompleted && (
          <Box 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              position: 'relative',
              height: 'calc(100vh - 150px)',
              overflow: 'hidden'
            }}
          >
            {/* Basket Area */}
            <Box 
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              sx={{
                width: '300px',
                height: '300px',
                mx: 'auto',
                position: 'relative',
                backgroundImage: `url(${basketImg})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                zIndex: 10,
                animation: draggedItem ? 'basketGlow 1s infinite alternate' : 'none',
                '@keyframes basketGlow': {
                  '0%': { boxShadow: '0 0 20px rgba(255, 152, 0, 0.5)' },
                  '100%': { boxShadow: '0 0 40px rgba(255, 152, 0, 0.8)' }
                },
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 30px rgba(255, 152, 0, 0.8)'
                }
              }}
            >
              {collectedIngredients.length === 0 && availableIngredients.some(item => item.correct) && (
                <Typography 
                  variant="h6"
                  sx={{ 
                    color: 'white',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    px: 3,
                    py: 2,
                    borderRadius: '15px',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    border: '2px solid #FF9800',
                    animation: 'bounce 2s infinite',
                    '@keyframes bounce': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-5px)' }
                    }
                  }}
                >
                  Drop cooking ingredients here!
                </Typography>
              )}
            </Box>

            {/* Available Ingredients with Smaller Sizes */}
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
              pointerEvents: 'none'
            }}>
              {availableIngredients.map((item, index) => {
                // Smaller size mapping
                const sizeMap = {
                  xsmall: '90px',
                  small: '120px',
                  medium: '150px', 
                  large: '180px'
                };
                
                const isHovered = hoveredIngredient === item.id;
                
                return (
                  <Box
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onMouseEnter={() => setHoveredIngredient(item.id)}
                    onMouseLeave={() => setHoveredIngredient(null)}
                    sx={{
                      position: 'absolute',
                      ...item.position,
                      width: sizeMap[item.size],
                      height: sizeMap[item.size],
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      cursor: 'grab',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                      animation: 'bounce 3s ease-in-out infinite',
                      pointerEvents: 'auto',
                      '@keyframes bounce': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-3px)' }
                      },
                      '&:hover': {
                        transform: isHovered ? 'scale(1.2) rotate(5deg)' : 'scale(1.15)',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6)) brightness(1.1)',
                        zIndex: 15,
                        animation: 'float 2s ease-in-out infinite',
                        '@keyframes float': {
                          '0%, 100%': { 
                            transform: isHovered ? 'scale(1.2) rotate(5deg) translateY(0px)' : 'scale(1.15) translateY(0px)' 
                          },
                          '50%': { 
                            transform: isHovered ? 'scale(1.2) rotate(5deg) translateY(-5px)' : 'scale(1.15) translateY(-5px)' 
                          }
                        }
                      },
                      '&:active': {
                        transform: 'scale(1.1)',
                      }
                    }}
                  />
                );
              })}
            </Box>

            {/* Animating Ingredients */}
            {animatingItems.map((item) => {
              const sizeMap = {
                xsmall: '60px',
                small: '80px',
                medium: '100px', 
                large: '120px'
              };
              
              const deltaX = item.targetX - item.startX;
              const deltaY = item.targetY - item.startY;
              
              return (
                <Box
                  key={item.id}
                  className="animating-item"
                  sx={{
                    position: 'fixed',
                    left: item.startX,
                    top: item.startY,
                    width: sizeMap[item.size],
                    height: sizeMap[item.size],
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    '--target-x': `${deltaX}px`,
                    '--target-y': `${deltaY}px`,
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* Auto-disappearing Feedback Message */}
        {feedbackMessage && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 100,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              animation: 'slideUp 0.5s ease-out, fadeOut 0.5s ease-out 2.5s forwards',
              '@keyframes slideUp': {
                '0%': { transform: 'translateX(-50%) translateY(20px)', opacity: 0 },
                '100%': { transform: 'translateX(-50%) translateY(0)', opacity: 1 }
              },
              '@keyframes fadeOut': {
                '0%': { opacity: 1 },
                '100%': { opacity: 0 }
              }
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '500px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '15px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                border: feedbackMessage.includes('Oops!') ? '2px solid #FF595E' : '2px solid #4CAF50',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              }}
            >
              <Box
                component="img"
                src={baconardoImg}
                alt="Baconardo"
                sx={{
                  width: 60,
                  height: 'auto',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  animation: feedbackMessage.includes('Oops!') ? 'shake 0.5s ease-in-out' : 'bounce 0.5s ease-in-out',
                  '@keyframes shake': {
                    '0%': { transform: 'translateX(0px)' },
                    '25%': { transform: 'translateX(-3px)' },
                    '50%': { transform: 'translateX(3px)' },
                    '75%': { transform: 'translateX(-3px)' },
                    '100%': { transform: 'translateX(0px)' }
                  },
                  '@keyframes bounce': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-5px)' }
                  }
                }}
              />
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: feedbackMessage.includes('Oops!') ? '#FF595E' : '#280B60',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1rem',
                  flex: 1
                }}
              >
                {feedbackMessage}
              </Typography>
            </Paper>
          </Box>
        )}
        
        {/* Success Dialog */}
        <Dialog
          open={showSuccess}
          fullScreen
          PaperProps={{
            sx: { 
              background: 'linear-gradient(135deg, rgba(255, 202, 58, 0.95) 0%, rgba(230, 184, 0, 0.95) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }
          }}
        >
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {confettiPieces.map(piece => (
              <Box
                key={piece.id}
                sx={{
                  position: 'absolute',
                  left: `${piece.x}%`,
                  top: `${piece.y}%`,
                  width: `${piece.width}px`,
                  height: `${piece.height}px`,
                  backgroundColor: piece.color,
                  transform: `rotate(${piece.rotation}deg)`,
                  boxShadow: `0 0 10px ${piece.color}`,
                  animation: `confettiFall 4s linear infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  '@keyframes confettiFall': {
                    '0%': {
                      transform: `translateY(-100vh) rotate(${piece.rotation}deg) scale(0.8)`,
                      opacity: 1
                    },
                    '10%': {
                      opacity: 1,
                      transform: `translateY(-90vh) rotate(${piece.rotation + 36}deg) scale(1)`
                    },
                    '90%': {
                      opacity: 0.8,
                      transform: `translateY(90vh) translateX(${piece.drift * 60}px) rotate(${piece.rotation + 324}deg) scale(0.6)`
                    },
                    '100%': {
                      transform: `translateY(100vh) translateX(${piece.drift * 70}px) rotate(${piece.rotation + 360}deg) scale(0)`,
                      opacity: 0
                    }
                  }
                }}
              />
            ))}
          </Box>
          <Box sx={{
            textAlign: 'center',
            color: 'white',
            zIndex: 1001,
            px: 3
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 4 
            }}>
              <EmojiEventsIcon sx={{ 
                fontSize: 120,
                color: 'white',
                mr: 3
              }} />
            </Box>
            <Typography variant="h1" sx={{ 
              fontWeight: 'bold',
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              fontSize: { xs: '2rem', md: '2.5rem' },
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
              mb: 2
            }}>
              Ingredients Complete!
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              {[...Array(3)].map((_, i) => {
                const isActive = i < getStarRating();
                const shouldAnimate = i < starAnimationStage;
                
                return (
                  <StarIcon 
                    key={i} 
                    sx={{ 
                      color: isActive ? 'white' : 'rgba(255,255,255,0.3)',
                      fontSize: 60,
                      mx: 1,
                      textShadow: isActive ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                      transform: shouldAnimate ? 'scale(1.3)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      animation: shouldAnimate ? 'starPop 0.6s ease-out' : 'none',
                      '@keyframes starPop': {
                        '0%': {
                          transform: 'scale(0)',
                          opacity: 0
                        },
                        '50%': {
                          transform: 'scale(1.5)',
                          opacity: 1
                        },
                        '100%': {
                          transform: 'scale(1)',
                          opacity: 1
                        }
                      }
                    }} 
                  />
                );
              })}
            </Box>
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '1rem', md: '1.2rem' }
            }}>
              Great job! You collected all the perfect ingredients for a delicious fried egg! Ready to cook!
            </Typography>
            
            {progressSaving && (
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                backgroundColor: 'rgba(25, 130, 196, 0.8)', 
                borderRadius: '15px',
                color: 'white'
              }}>
                <CircularProgress size={30} sx={{ mr: 2, color: 'white' }} />
                <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', display: 'inline' }}>
                  Saving your progress...
                </Typography>
              </Box>
            )}
            
            {progressSaved && (
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                backgroundColor: 'rgba(144, 190, 109, 0.8)', 
                borderRadius: '15px',
                color: 'white'
              }}>
                <CheckCircleIcon sx={{ mr: 2, fontSize: 30, verticalAlign: 'middle' }} />
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', display: 'inline' }}>
                  Progress saved successfully!
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                onClick={() => {
                  setShowSuccess(false);
                  resetGame();
                }} 
                variant="outlined"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  borderWidth: '2px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '2px'
                  }
                }}
              >
                Cook Again
              </Button>
              <Button 
                variant="contained"
                onClick={handleGoHome}
                sx={{ 
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(76, 175, 80, 0.5)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Back to Home
              </Button>
              <Button 
                variant="contained"
                onClick={handleContinue}
                disabled={progressSaving}
                sx={{ 
                  background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {progressSaving ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
}