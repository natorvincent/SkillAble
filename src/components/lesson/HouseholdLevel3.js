// HouseholdLevel3.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import kitchenBg from "../../assets/householdLevel3/kitchen.jpg";
import { useParams } from 'react-router-dom'; 
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import progress service - ADD updateModuleProgress
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress  // ADD THIS IMPORT
} from '../../services/progressService';

// Import all assets
import sponge from "../../assets/householdLevel3/sponge.png";
import dishLiquid from "../../assets/householdLevel3/dishwashingliquid.png";
import sink from "../../assets/householdLevel3/sink.png";
import glass from "../../assets/householdLevel3/glass.png";
import spoon from "../../assets/householdLevel3/spoon.png";
import plate from "../../assets/householdLevel3/plate.png";
import fork from "../../assets/householdLevel3/fork.png";
import pot from "../../assets/householdLevel3/pot.png";
import cleanGlass from "../../assets/householdLevel3/cleanglass.png";
import cleanSpoon from "../../assets/householdLevel3/cleanspoon.png";
import cleanFork from "../../assets/householdLevel3/cleanfork.png";
import cleanPlate from "../../assets/householdLevel3/cleanplate.png";
import cleanPot from "../../assets/householdLevel3/cleanpot.png";

// Page constants
const PAGES = {
  LANDING: 'landing',
  INSTRUCTIONS: 'instructions',
  GAME: 'game'
};

// Tools data for instructions page
const tools = [
  {
    id: 1,
    name: "Sponge",
    image: sponge,
    description: "Used for scrubbing dishes clean with soap"
  },
  {
    id: 2,
    name: "Dish Liquid",
    image: dishLiquid,
    description: "Soap that helps remove grease and food particles"
  },
  {
    id: 3,
    name: "Sink",
    image: sink,
    description: "Where you wash and rinse the dishes"
  },
  {
    id: 4,
    name: "Glass",
    image: glass,
    description: "Wash glasses first as they are least dirty"
  },
  {
    id: 5,
    name: "Spoon",
    image: spoon,
    description: "Utensils are washed after glasses"
  },
  {
    id: 6,
    name: "Fork",
    image: fork,
    description: "Utensils with multiple prongs"
  },
  {
    id: 7,
    name: "Plate",
    image: plate,
    description: "Plates are washed after utensils"
  },
  {
    id: 8,
    name: "Cooking Pot",
    image: pot,
    description: "Pots and pans are washed last as they are most greasy"
  }
];

// Game data
const washingOrder = [
  { id: 1, name: "Glass", dirty: glass, clean: cleanGlass, type: "glass" },
  { id: 2, name: "Spoon", dirty: spoon, clean: cleanSpoon, type: "utensil" },
  { id: 3, name: "Fork", dirty: fork, clean: cleanFork, type: "utensil" },
  { id: 4, name: "Plate", dirty: plate, clean: cleanPlate, type: "plate" },
  { id: 5, name: "Pot", dirty: pot, clean: cleanPot, type: "pot" }
];

// Scoring constants
const MAX_POSSIBLE_SCORE = 100;
const POINTS_PER_DISH = 20; // 20 points per dish (5 dishes × 20 = 100 total)
const DISHES_COUNT = washingOrder.length;

export default function HouseholdLevel3() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  
  // Instructions page state
  const [clickedItems, setClickedItems] = useState(new Set());
  
  // Voice feature state
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Game page state
  const [currentStep, setCurrentStep] = useState(0);
  const [gameState, setGameState] = useState({
    spongeHasSoap: false,
    dishesPlaced: [],
    dishesCleaned: [],
    dishesOnRack: [],
    dishScores: {} // Track scores for each dish individually
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Progress saving state
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const [draggingSoap, setDraggingSoap] = useState(false);
  const [spongeActive, setSpongeActive] = useState(false);
  const [scrubbingDish, setScrubbingDish] = useState(null);
  const [scrubProgress, setScrubProgress] = useState(0);

  const steps = [
    "Add dish liquid to sponge",
    "Place dirty dishes in sink in correct order",
    "Scrub each dish with sponge",
    "Move clean dishes to drying rack"
  ];

  const progressPercentage = ((currentStep + (gameCompleted ? 1 : 0)) / steps.length) * 100;
  const { lessonId } = useParams();

  // Get student ID from localStorage - IMPROVED VERSION
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

  // Fetch user progress when lessonId changes - IMPROVED VERSION
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          console.log('Missing studentId or lessonId:', { studentId, lessonId });
          return;
        }
        
        console.log('Fetching progress for student:', studentId, 'lesson:', lessonId);
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setFeedbackMessage("Great job! You finished this before. Want to try again?");
            setShowFeedback(true);
          }
        } else {
          console.log('No existing progress found, starting fresh');
          setScore(0);
        }
      } catch (error) {
        console.log('Error fetching progress (starting fresh):', error);
        setScore(0);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  // Page navigation handlers
  const goToInstructions = () => setCurrentPage(PAGES.INSTRUCTIONS);
  const goToGame = () => setCurrentPage(PAGES.GAME);
  const goToHome = () => navigate('/homepage');

  // Voice feature handlers
  const speakText = (text) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.rate = 0.8;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeech(speech);
    };

    speech.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };

    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
    }
  };

  const handleItemClickWithVoice = (itemId) => {
    const tool = tools.find(t => t.id === itemId);
    if (tool) {
      const speechText = `${tool.name}. ${tool.description}`;
      speakText(speechText);
    }
    
    const newClickedItems = new Set(clickedItems);
    newClickedItems.add(itemId);
    setClickedItems(newClickedItems);
  };

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Instructions page handlers
  const handleItemClick = (itemId) => {
    const newClickedItems = new Set(clickedItems);
    newClickedItems.add(itemId);
    setClickedItems(newClickedItems);
  };

  const allItemsClicked = clickedItems.size === tools.length;

  // UPDATED Progress saving function - MATCHES SORTINGLEVEL1 PATTERN
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      // Calculate score percentage capped at 100%
      const cappedScore = Math.min(score, MAX_POSSIBLE_SCORE);
      const finalScore = cappedScore;
      
      console.log('Attempting to save progress with data:', {
        studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: MAX_POSSIBLE_SCORE,
        completed: true,
        starsEarned: getStarRating()
      });
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: MAX_POSSIBLE_SCORE,
        completed: true,
        starsEarned: getStarRating()
      };
      
      // Try to save lesson progress
      try {
        const lessonProgress = await saveStudentLessonProgress(studentId, lessonId, progressData);
        console.log('Lesson progress saved successfully:', lessonProgress);
      } catch (lessonError) {
        console.error('Failed to save lesson progress:', lessonError);
        // Don't throw here - we'll try module progress as fallback
      }
      
      // Try to update module progress as fallback (with better error handling)
      try {
        // Use the correct module ID for household chores (adjust based on your actual module ID)
        const moduleId = 4; // This should match your household chores module ID
        const moduleProgress = await updateModuleProgress(studentId, moduleId, {
          score: finalScore,
          completed: true,
          starsEarned: getStarRating()
        });
        if (moduleProgress) {
          console.log('Module progress updated successfully:', moduleProgress);
        } else {
          console.log('Module progress update skipped (endpoint may not exist)');
        }
      } catch (moduleError) {
        console.log('Module progress update failed (expected if endpoint not available):', moduleError);
      }
      
      setProgressSaved(true);
      console.log('Progress saving process completed');
      
    } catch (error) {
      console.error('Error in save progress process:', error);
      // Even if there's an error, we mark it as saved to prevent infinite retries
      setProgressSaved(true);
    } finally {
      setProgressSaving(false);
    }
  };

  // Star rating calculation
  const getStarRating = () => {
    const percentage = (Math.min(score, MAX_POSSIBLE_SCORE) / MAX_POSSIBLE_SCORE) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Game page handlers with new scoring system
  const handleSpongeClick = () => {
    if (currentStep === 0) {
      setGameState(prev => ({ ...prev, spongeHasSoap: true }));
      setCurrentStep(1);
      setFeedbackMessage("Great! Now place the dishes in the sink in the correct order.");
      setShowFeedback(true);
      // No points for instructions/soap step
    }
  };

  const handleDishDrop = (dish) => {
    if (currentStep === 1) {
      const expectedDish = washingOrder[gameState.dishesPlaced.length];
      
      if (dish.id === expectedDish.id) {
        const newDishesPlaced = [...gameState.dishesPlaced, dish];
        
        // Award points for correct dish placement
        const placementPoints = 5; // First step of 4 for this dish
        const newScore = Math.min(score + placementPoints, MAX_POSSIBLE_SCORE);
        
        setGameState(prev => ({ 
          ...prev, 
          dishesPlaced: newDishesPlaced,
          dishScores: {
            ...prev.dishScores,
            [dish.id]: (prev.dishScores[dish.id] || 0) + placementPoints
          }
        }));
        
        setScore(newScore);
        setFeedbackMessage(`Correct! ${dish.name} is next. Now scrub it with the sponge!`);
        setShowFeedback(true);

        // Move to scrubbing step after placing a dish
        setCurrentStep(2);
      } else {
        setFeedbackMessage(`Try again! Remember the order: Glasses → Utensils → Plates → Pots`);
        setShowFeedback(true);
        // No penalty points, just try again
      }
    }
  };

  const handleScrubComplete = (dishId) => {
    if (currentStep === 2 && gameState.spongeHasSoap) {
      const dish = washingOrder.find(d => d.id === dishId);
      if (dish && !gameState.dishesCleaned.includes(dishId)) {
        // Award points for scrubbing completion
        const scrubPoints = 5; // Second step of 4 for this dish
        const newScore = Math.min(score + scrubPoints, MAX_POSSIBLE_SCORE);
        
        setGameState(prev => ({
          ...prev,
          dishesCleaned: [...prev.dishesCleaned, dishId],
          dishScores: {
            ...prev.dishScores,
            [dishId]: (prev.dishScores[dishId] || 0) + scrubPoints
          }
        }));
        
        setScore(newScore);
        setFeedbackMessage(`Good job! ${dish.name} is now clean. Drag it to the drying rack.`);
        setShowFeedback(true);
      }
    }
  };

  const handleScrubStart = (dishId) => {
    if (currentStep === 2 && spongeActive) {
      setScrubbingDish(dishId);
      setScrubProgress(0);
      
      const scrubInterval = setInterval(() => {
        setScrubProgress(prev => {
          if (prev >= 100) {
            clearInterval(scrubInterval);
            handleScrubComplete(dishId);
            setScrubbingDish(null);
            return 100;
          }
          return prev + 20;
        });
      }, 1000);
    }
  };

  const handleScrubCancel = () => {
    setScrubbingDish(null);
    setScrubProgress(0);
  };

  const handleMoveToRack = (dishId) => {
    if (currentStep === 3) {
      const dish = washingOrder.find(d => d.id === dishId);
      
      // Award points for moving to rack (final step for this dish)
      const rackPoints = 10; // Third and fourth steps combined (5 + 5)
      const newScore = Math.min(score + rackPoints, MAX_POSSIBLE_SCORE);
      
      setGameState(prev => {
        const updatedDishesPlaced = prev.dishesPlaced.filter(dish => dish.id !== dishId);
        const updatedDishesCleaned = prev.dishesCleaned.filter(id => id !== dishId);
        const updatedDishesOnRack = [...(prev.dishesOnRack || []), dishId];
        
        // Check if all dishes are on rack
        const allDishesOnRack = updatedDishesOnRack.length === washingOrder.length;
        
        if (allDishesOnRack) {
          setGameCompleted(true);
          setFeedbackMessage("Congratulations! You've successfully washed all the dishes!");
          setShowFeedback(true);
          
          // AUTO-SAVE PROGRESS WHEN GAME COMPLETES (LIKE SORTINGLEVEL1)
          setTimeout(() => {
            if (!progressSaved) {
              saveProgress();
            }
          }, 1000);
        } else {
          setCurrentStep(1);
          setFeedbackMessage("Great! Now place the next dish in the sink.");
          setShowFeedback(true);
        }
        
        setScore(newScore);
        
        return {
          ...prev,
          dishesPlaced: updatedDishesPlaced,
          dishesCleaned: updatedDishesCleaned,
          dishesOnRack: updatedDishesOnRack,
          dishScores: {
            ...prev.dishScores,
            [dishId]: (prev.dishScores[dishId] || 0) + rackPoints
          }
        };
      });
    }
  };

  const getDishStatus = (dishId) => {
    if (gameState.dishesOnRack?.includes(dishId)) return 'on-rack';
    if (gameState.dishesCleaned.includes(dishId)) return 'clean';
    if (gameState.dishesPlaced.find(d => d.id === dishId)) return 'in-sink';
    return 'dirty';
  };

  const resetGame = () => {
    setCurrentStep(0);
    setGameState({
      spongeHasSoap: false,
      dishesPlaced: [],
      dishesCleaned: [],
      dishesOnRack: [],
      dishScores: {}
    });
    setGameCompleted(false);
    setScore(0);
    setShowFeedback(false);
    setSpongeActive(false);
    setScrubbingDish(null);
    setScrubProgress(0);
    setProgressSaving(false);
    setProgressSaved(false);
  };

  // Handle continue to next module
  const handleContinue = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    navigate(`/lesson/household-chores/level-4/${lessonId}`);
  };

  // Render different pages based on currentPage state
  const renderLandingPage = () => (
    <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(144, 190, 109, 0.8) 0%, rgba(25, 130, 196, 0.8) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        zIndex: 1
    }}>
        <Typography variant="h1" sx={{ 
        color: 'white', 
        fontWeight: 'bold', 
        mb: 2,
        fontFamily: 'Poppins, sans-serif',
        fontSize: { xs: '3rem', md: '5rem' },
        textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
        textAlign: 'center'
        }}>
        🏠 Household Helper 🧽
        </Typography>
        <Typography variant="h4" sx={{ 
        color: 'rgba(255, 255, 255, 0.95)', 
        mb: 6,
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1.5,
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        maxWidth: '600px',
        px: 2
        }}>
        Learn how to properly wash dishes and keep your kitchen clean!
        </Typography>
        <Button 
        variant="contained"
        onClick={goToInstructions}
        sx={{ 
            background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
            color: 'white',
            px: 10,
            py: 4,
            borderRadius: '30px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            fontSize: '2rem',
            textTransform: 'none',
            boxShadow: '0 15px 30px rgba(255, 89, 94, 0.6)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': {
            transform: 'scale(1.1) translateY(-8px)',
            boxShadow: '0 20px 40px rgba(255, 89, 94, 0.8)',
            background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)'
            },
            '&:active': {
            transform: 'scale(1.05) translateY(-4px)'
            }
        }}
        >
        <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>🎮</span>
        Start Learning
        </Button>
    </Box>
    );

  const renderInstructionsPage = () => (
    <Container maxWidth="xl" sx={{ py: 1, flex: 1 }}>
        <Paper elevation={10} sx={{ 
        p: 1, 
        backgroundColor: 'rgba(255, 255, 255, 0.7)', 
        borderRadius: '15px', 
        mb: 1,
        flexShrink: 0 // Prevent growing
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ 
            color: '#1982C4', 
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            textAlign: 'center'
          }}>
            🧽 Kitchen Tools & Dish Order
          </Typography>
          <IconButton 
            onClick={stopSpeech}
            sx={{ 
              color: '#1982C4',
              backgroundColor: 'rgba(25, 130, 196, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(25, 130, 196, 0.2)'
              }
            }}
          >
            {isSpeaking ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </IconButton>
        </Box>
        
        <Typography variant="h6" sx={{ 
          color: '#280B60', 
          mb: 4,
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6
        }}>
          Click on each item to learn about it. Remember the proper washing order!
        </Typography>
      </Paper>

        <Box sx={{ 
        flex: 1, 
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gridTemplateRows: 'repeat(2, 1fr)', 
        gap: '16px',
        overflow: 'hidden',
        height: '100%'
        }}>
        {tools.map((tool) => (
            <Card 
            key={tool.id}
            onClick={() => handleItemClickWithVoice(tool.id)}
            sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: clickedItems.has(tool.id) ? '4px solid #90BE6D' : '4px solid transparent',
                backgroundColor: clickedItems.has(tool.id) ? '#f0f9f0' : 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 0, 
                position: 'relative',
                '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 6
                }
            }}
            >
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <VolumeUpIcon sx={{ color: '#1982C4', fontSize: '1rem' }} />
            </Box>
            <Box sx={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
                <CardMedia
                component="img"
                image={tool.image}
                alt={tool.name}
                sx={{ 
                    objectFit: 'contain', 
                    maxHeight: '80px',
                    maxWidth: '80px'
                }}
                />
            </Box>
            <CardContent sx={{ textAlign: 'center', py: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1982C4', fontSize: '1rem', mb: 1 }}>
                {tool.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem', lineHeight: '1.2' }}>
                {tool.description}
                </Typography>
                {clickedItems.has(tool.id) && (
                <Typography variant="caption" sx={{ color: '#90BE6D', fontWeight: 'bold', mt: 1 }}>
                    ✓ Learned
                </Typography>
                )}
            </CardContent>
            </Card>
        ))}
        </Box>

        <Box sx={{ 
        textAlign: 'center', 
        py: 1,
        flexShrink: 0 
        }}>
        <Button 
          variant="contained"
          onClick={goToGame}
          disabled={!allItemsClicked}
          sx={{ 
            background: allItemsClicked 
              ? 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)'
              : '#ccc',
            color: 'white',
            px: 6,
            py: 2,
            borderRadius: '25px',
            fontSize: '1.3rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            textTransform: 'none',
            '&:hover': allItemsClicked ? {
              transform: 'scale(1.05)',
              boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)'
            } : {},
            '&.Mui-disabled': {
              backgroundColor: '#ccc'
            }
          }}
        >
          {allItemsClicked ? '🚀 Start Game' : 'Click all items to continue'}
        </Button>
        
        {!allItemsClicked && (
          <Typography variant="body2" sx={{ color: '#666', mt: 2 }}>
            {tools.length - clickedItems.size} items remaining
          </Typography>
        )}
      </Box>
    </Container>
  );

  const renderGamePage = () => (
    <Container maxWidth="xl" sx={{ py: 2, flex: 1 }}>
      {/* Progress Section */}
      <Box mb={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            px: 2,
            py: 1,
            borderRadius: '10px'
          }}>
            Step {currentStep + 1} of {steps.length}
          </Typography>
          <Chip 
            label={`Score: ${score}/100`} 
            sx={{
              backgroundColor: '#FF595E',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage} 
          sx={{ 
            height: 8, 
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            '& .MuiLinearProgress-bar': {
              borderRadius: '10px',
              backgroundColor: '#90BE6D'
            }
          }} 
        />
        <Typography variant="body2" sx={{ color: 'white', mt: 1, textAlign: 'center' }}>
          {steps[currentStep]}
        </Typography>
      </Box>

      {/* Game Area */}
        <Box sx={{ 
        display: 'flex', 
        height: '70vh',
        gap: 3
        }}>
        {/* Left Section - Drying Rack with individual boxes */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ 
            textAlign: 'center', 
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            py: 1,
            borderRadius: '10px',
            fontWeight: 'bold'
          }}>
            🏠 Drying Rack
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 2,
            flex: 1
          }}>
            {washingOrder.map(dish => (
              <Paper 
                key={dish.id}
                draggable={getDishStatus(dish.id) === 'clean' && currentStep === 3}
                onDragStart={(e) => {
                  if (getDishStatus(dish.id) === 'clean' && currentStep === 3) {
                    e.dataTransfer.setData('cleanDishId', dish.id);
                  }
                }}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: getDishStatus(dish.id) === 'on-rack' 
                    ? 'rgba(144, 190, 109, 0.95)'  // More opaque when on rack
                    : getDishStatus(dish.id) === 'clean' 
                    ? 'rgba(255, 255, 255, 0.9)'   // Much less transparent for clean dishes
                    : 'rgba(255, 255, 255, 0.4)',  // Slightly more visible for dirty dishes
                  borderRadius: '10px',
                  p: 1,
                  opacity: getDishStatus(dish.id) === 'on-rack' ? 1 : 0.9, // Make clean but not dragged dishes semi-transparent
                  transition: 'all 0.3s ease',
                  cursor: getDishStatus(dish.id) === 'clean' && currentStep === 3 ? 'grab' : 'default',
                  border: getDishStatus(dish.id) === 'on-rack' 
                    ? '3px solid #90BE6D' 
                    : getDishStatus(dish.id) === 'clean'
                    ? '2px dashed #1976d2'
                    : '1px solid #ccc',
                  // Only glow for dishes that are actually on the rack
                  boxShadow: getDishStatus(dish.id) === 'on-rack' 
                    ? '0 0 20px rgba(144, 190, 109, 1), 0 0 30px rgba(144, 190, 109, 0.7)' 
                    : 'none',
                }}
              >
                <img 
                  src={dish.clean} 
                  alt={dish.name}
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    objectFit: 'contain',
                    // Enhanced styling for different states
                    filter: getDishStatus(dish.id) === 'on-rack' 
                      ? 'none' 
                      : getDishStatus(dish.id) === 'clean'
                      ? 'grayscale(30%) opacity(90%)'
                      : 'grayscale(100%) opacity(40%)'
                  }}
                />
                <Typography variant="caption" sx={{ 
                  mt: 1, 
                  fontWeight: 'bold',
                  color: getDishStatus(dish.id) === 'on-rack' 
                    ? '#90BE6D' 
                    : getDishStatus(dish.id) === 'clean'
                    ? '#1976d2'
                    : '#666'
                }}>
                  {dish.name}
                </Typography>
                {getDishStatus(dish.id) === 'on-rack' && (
                  <Typography variant="caption" sx={{ 
                    color: '#90BE6D', 
                    fontSize: '0.6rem', 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    px: 1,
                    borderRadius: '4px'
                  }}>
                    ✓ ON RACK
                  </Typography>
                )}
                {getDishStatus(dish.id) === 'clean' && currentStep === 3 && (
                  <Typography variant="caption" sx={{ 
                    color: '#1976d2', 
                    fontSize: '0.5rem', 
                    fontStyle: 'italic',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    px: 0.5,
                    borderRadius: '3px'
                  }}>
                    Drag to rack →
                  </Typography>
                )}
              </Paper>
            ))}
            
            {/* Drop zone for drying rack */}
            <Box 
              sx={{ 
                gridColumn: '1 / -1',
                border: '2px dashed #90BE6D',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60px',
                backgroundColor: 'rgba(144, 190, 109, 0.1)'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (currentStep === 3) {
                  const dishId = parseInt(e.dataTransfer.getData('cleanDishId'));
                  handleMoveToRack(dishId);
                }
              }}
            >
              <Typography variant="body2" sx={{ color: '#90BE6D', textAlign: 'center', fontWeight: 'bold' }}>
                {currentStep === 3 ? 'Drag clean dishes here to dry' : 'Dishes will appear here after cleaning'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Center Section - Sink Area */}
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ 
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Tools at top right corner */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 1,
              mb: 2 
            }}>
              {/* Soap - Only draggable before sponge activation */}
              <Box 
                draggable={!spongeActive}
                onDragStart={(e) => {
                  if (!spongeActive) {
                    setDraggingSoap(true);
                  } else {
                    e.preventDefault();
                  }
                }}
                onDragEnd={() => setDraggingSoap(false)}
                sx={{ 
                  textAlign: 'center',
                  p: 1,
                  border: '3px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  width: '80px',
                  cursor: spongeActive ? 'not-allowed' : 'grab',
                  opacity: spongeActive ? 0.6 : 1,
                  userSelect: 'none',
                }}
              >
                <img 
                  src={dishLiquid} 
                  alt="Dish Liquid" 
                  style={{ 
                    width: '40px', 
                    height: '40px',
                    pointerEvents: 'none'
                  }} 
                />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                  Soap
                </Typography>
              </Box>
              
              {/* Sponge */}
              <Box 
                draggable={spongeActive} // Make sponge draggable when activated
                onDragStart={(e) => {
                  if (spongeActive) {
                    // Set data to identify this as a sponge drag
                    e.dataTransfer.setData('sponge', 'true');
                  } else {
                    e.preventDefault();
                  }
                }}
                onDragEnd={() => {
                  // Optional: Add any drag end logic for sponge
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (currentStep === 0 && !spongeActive) {
                    setSpongeActive(true);
                    setGameState(prev => ({ ...prev, spongeHasSoap: true }));
                    setCurrentStep(1);
                    setFeedbackMessage("Great! Now drag dishes to the sink in the correct order.");
                    setShowFeedback(true);
                  }
                }}
                sx={{ 
                  textAlign: 'center',
                  p: 1,
                  border: spongeActive ? '3px solid #90BE6D' : '3px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: spongeActive ? '#f0f9f0' : 'white',
                  width: '80px',
                  cursor: spongeActive ? 'grab' : 'default'
                }}
              >
                <img src={sponge} alt="Sponge" style={{ 
                  width: '40px', 
                  height: '40px',
                  animation: spongeActive ? 'pulse 1s infinite' : 'none',
                  pointerEvents: 'none'
                }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                  Sponge {spongeActive && '🧼'}
                </Typography>
                <style>{`
                  @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                  }
                `}</style>
              </Box>
            </Box>

            {/* Sink with drop zone */}
            <Box sx={{ 
              position: 'relative', 
              height: '250px',
              background: 'linear-gradient(180deg, #87CEEB 0%, #4682B4 100%)',
              borderRadius: '10px',
              border: '4px solid #696969',
              mb: 2,
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              <img 
                src={sink} 
                alt="Sink" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  borderRadius: '6px'
                }} 
              />
              
              {/* Drop zone for dishes - only show current dish that hasn't been moved to rack */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  width: '120px',
                  height: '120px',
                  border: '2px dashed rgba(255, 255, 255, 0.5)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (currentStep === 1 && gameState.dishesPlaced.length < washingOrder.length) {
                    const dishId = parseInt(e.dataTransfer.getData('dishId'));
                    const dish = washingOrder.find(d => d.id === dishId);
                    if (dish) handleDishDrop(dish);
                  } else if (currentStep === 2 && spongeActive && gameState.dishesPlaced.length > 0) {
                    // Only allow scrubbing if there's a dish in sink and we're on scrubbing step
                    const currentDish = gameState.dishesPlaced[gameState.dishesPlaced.length - 1];
                    if (!gameState.dishesCleaned.includes(currentDish.id) && !gameState.dishesOnRack?.includes(currentDish.id)) {
                      handleScrubStart(currentDish.id);
                    }
                  }
                }}
              >
                {/* Only show dish in sink if it hasn't been moved to rack yet */}
                {gameState.dishesPlaced.length > 0 && 
                !gameState.dishesOnRack?.includes(gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id) ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img 
                      src={getDishStatus(gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id) === 'clean' 
                        ? gameState.dishesPlaced[gameState.dishesPlaced.length - 1].clean 
                        : gameState.dishesPlaced[gameState.dishesPlaced.length - 1].dirty}
                      alt={gameState.dishesPlaced[gameState.dishesPlaced.length - 1].name}
                      style={{ 
                        width: '80px',
                        height: '80px',
                      }}
                    />
                    {scrubbingDish === gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id && (
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={scrubProgress} 
                          sx={{ height: 8, borderRadius: '4px' }}
                        />
                        <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem' }}>
                          Scrubbing... {scrubProgress}%
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={{ color: 'white', textAlign: 'center' }}>
                    {currentStep === 1 ? 'Drop next dish here' : 'Ready for next dish'}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Instructions */}
            <Typography variant="body2" sx={{ 
            textAlign: 'center', 
            color: 'black',
            mb: 2,
            fontStyle: 'italic',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            p: 1,
            borderRadius: '5px'
            }}>
            {currentStep === 0 && "Drag the soap to the sponge to activate it"}
            {currentStep === 1 && "Drag dishes to the sink in correct order: Glass → Spoon → Fork → Plate → Pot"}
            {currentStep === 2 && "Drag the sponge to the dish in the sink and hold for 5 seconds to scrub"}
            {currentStep === 3 && "Drag clean dishes to the drying rack"}
            </Typography>
        </Paper>
        </Box>

        {/* Right Section - Dirty Dishes */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ 
            textAlign: 'center', 
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            py: 1,
            borderRadius: '10px',
            fontWeight: 'bold',
            mb: 2
            }}>
            Dirty Dishes
            </Typography>
            <Paper sx={{ 
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
            }}>
            {washingOrder.map(dish => (
                <Box 
                key={dish.id}
                draggable={currentStep === 1 && !gameState.dishesPlaced.find(d => d.id === dish.id)}
                onDragStart={(e) => {
                    if (currentStep === 1) {
                    e.dataTransfer.setData('dishId', dish.id);
                    }
                }}
                sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1,
                    borderRadius: '8px',
                    backgroundColor: gameState.dishesPlaced.find(d => d.id === dish.id) ? 'rgba(0,0,0,0.1)' : 'transparent',
                    opacity: gameState.dishesPlaced.find(d => d.id === dish.id) ? 0.5 : 1,
                    cursor: currentStep === 1 && !gameState.dishesPlaced.find(d => d.id === dish.id) ? 'grab' : 'default',
                    transition: 'all 0.3s ease'
                }}
                >
                <img 
                    src={dish.dirty} 
                    alt={dish.name}
                    style={{ width: '40px', height: '40px' }}
                />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dish.name}
                </Typography>
                </Box>
            ))}
            </Paper>
        </Box>
    </Box>

      
      {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Button 
            variant="contained"
            onClick={() => setCurrentPage(PAGES.INSTRUCTIONS)}
            sx={{ 
            backgroundColor: 'white',
            color: '#1976d2',
            '&:hover': {
                backgroundColor: '#f5f5f5'
            }
            }}
        >
            ↩️ Back to Instructions
        </Button>
        <Button 
            variant="contained"
            onClick={resetGame}
            sx={{ 
            backgroundColor: 'white',
            color: '#1976d2',
            '&:hover': {
                backgroundColor: '#f5f5f5'
            }
            }}
        >
            🔄 Restart Game
        </Button>
        <Button 
            variant="contained"
            onClick={goToHome}
            sx={{ 
            backgroundColor: '#FF595E',
            color: 'white',
            '&:hover': {
                backgroundColor: '#E04549'
            }
            }}
        >
            🏠 Go Home
        </Button>
        </Stack>
    </Container>
  );

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
      
      {/* Render current page based on state */}
      {currentPage === PAGES.LANDING && renderLandingPage()}
      {currentPage === PAGES.INSTRUCTIONS && renderInstructionsPage()}
      {currentPage === PAGES.GAME && renderGamePage()}

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onClose={() => {
        setShowFeedback(false);
        if (feedbackMessage.includes("Drag it to the drying rack")) {
          setCurrentStep(3);
        }
      }}>
        <DialogTitle>
          {feedbackMessage.includes("Congratulations") ? "🎉 Level Complete!" : "💡 Tip"}
        </DialogTitle>
        <DialogContent>
          <Typography>{feedbackMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowFeedback(false);
            if (feedbackMessage.includes("Drag it to the drying rack")) {
              setCurrentStep(3);
            }
          }}>
            {gameCompleted ? "View Score" : "Continue"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog open={gameCompleted} fullScreen>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #FFCA3A 0%, #FFB347 100%)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          color: 'white'
        }}>
          <Typography variant="h1" sx={{ mb: 3 }}>🏆</Typography>
          <Typography variant="h2" sx={{ mb: 2 }}>Excellent Work!</Typography>
          <Typography variant="h4" sx={{ mb: 4 }}>Final Score: {score}/100</Typography>
          
          {/* Star Rating */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            {[...Array(getStarRating())].map((_, i) => (
              <StarIcon key={i} sx={{ 
                color: 'white', 
                fontSize: 80,
                mx: 1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }} />
            ))}
            {[...Array(3 - getStarRating())].map((_, i) => (
              <StarIcon key={i} sx={{ 
                color: 'rgba(255,255,255,0.3)', 
                fontSize: 80,
                mx: 1
              }} />
            ))}
          </Box>
          
          <Typography variant="h6" sx={{ mb: 4 }}>
            You've mastered the proper dishwashing technique!
          </Typography>
          
          {/* Progress Saving Status */}
          {progressSaving && (
            <Box sx={{ 
              mb: 4, 
              p: 3, 
              backgroundColor: 'rgba(25, 130, 196, 0.8)', 
              borderRadius: '15px',
              color: 'white'
            }}>
              <CircularProgress size={30} sx={{ mr: 2, color: 'white' }} />
              <Typography variant="h5" sx={{ display: 'inline' }}>
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
              <Typography variant="h6" sx={{ display: 'inline' }}>
                Progress saved successfully!
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="contained"
              onClick={goToHome}
              sx={{ 
                backgroundColor: '#FF595E',
                px: 4,
                minWidth: '140px',
                '&:hover': {
                  backgroundColor: '#E04549'
                }
              }}
            >
              🏠 Return Home
            </Button>
            <Button 
              variant="outlined"
              onClick={() => {
                resetGame();
                setGameCompleted(false);
              }}
              sx={{ 
                borderColor: 'white',
                color: 'white',
                px: 3,
                minWidth: '140px'
              }}
            >
              🔄 Play Again
            </Button>
            <Button 
              variant="contained"
              onClick={handleContinue}
              disabled={progressSaving}
              sx={{ 
                backgroundColor: '#90BE6D',
                px: 4,
                minWidth: '140px',
                '&:hover': {
                  backgroundColor: '#7DA95D'
                }
              }}
            >
              {progressSaving ? 'Saving...' : '➡️ Next Module'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
}