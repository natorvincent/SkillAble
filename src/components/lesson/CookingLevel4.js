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
  FormControlLabel,
  Grid
} from '@mui/material';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Import cooking images for Level 4
import breadImg from "../../assets/cookingLevel4/sliceofbread.png";
import butterImg from "../../assets/cookingLevel4/butter.png";
import cheeseImg from "../../assets/cookingLevel4/cheeseslice.png";
import lettuceImg from "../../assets/cookingLevel4/lettuceleaf.png";
import sandwichImg from "../../assets/cookingLevel4/plate.png";
import washImg from "../../assets/cookingLevel4/washfruit.png";
import appleImg from "../../assets/cookingLevel4/apple.png";
import bananaImg from "../../assets/cookingLevel4/banana.png";
import bowlImg from "../../assets/cookingLevel4/fruitsalad.png";
import mixingImg from "../../assets/cookingLevel4/spoon.png";
import eggImg from "../../assets/cookingLevel4/egg.png";
import forkImg from "../../assets/cookingLevel4/fork.png";
import stoveImg from "../../assets/cookingLevel4/stove.png";
import fryingpanImg from "../../assets/cookingLevel4/fryingpan.png";
import plateImg from "../../assets/cookingLevel4/plate.png";
import cerealBowlImg from "../../assets/cookingLevel4/cereal.png";
import milkImg from "../../assets/cookingLevel4/milk.png";
import spoonImg from "../../assets/cookingLevel4/spoon.png";
import happyfaceImg from "../../assets/cookingLevel4/happyface.png";
import saltImg from "../../assets/cookingLevel4/salt.png";

export default function CookingLevel4() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [gamePhase, setGamePhase] = useState('intro'); // 'intro', 'game', 'complete'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState('sandwich');
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('Ready to learn recipe sequences? Let\'s start cooking step by step!');
  const [score, setScore] = useState(0);
  const [completedRecipes, setCompletedRecipes] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  
  // Level progression props
  const [currentLevel] = useState(4); // Level 4
  const [maxLevel] = useState(5); // Total number of levels
  const [moduleIdentifier] = useState('cooking-basics');
  const [lessonIdentifier] = useState('recipe-sequences');

  const recipes = {
    sandwich: {
      name: "Sandwich",
      emoji: sandwichImg, // Changed from emoji to actual image
      steps: [
        { completed: "Step 1: We put the bread on the plate.", image: breadImg, description: "A slice of bread on a plate" },
        { completed: "Step 2: We spread butter on the bread.", image: butterImg, description: "Butter spread on bread" },
        { completed: "Step 3: We add cheese to the bread.", image: cheeseImg, description: "Cheese placed on buttered bread" },
        { completed: "Step 4: We add lettuce on top.", image: lettuceImg, description: "Fresh lettuce on the cheese" },
        { completed: "Step 5: We put the top slice of bread.", image: sandwichImg, description: "Complete sandwich with top bread" }
      ],
      choices: [
        [
          { text: "Spread butter", image: butterImg, correct: true },
          { text: "Cut apple", image: appleImg, correct: false },
          { text: "Get spoon", image: spoonImg, correct: false }
        ],
        [
          { text: "Add cheese", image: cheeseImg, correct: true },
          { text: "Get spoon", image: spoonImg, correct: false },
          { text: "Wash hands", image: washImg, correct: false }
        ],
        [
          { text: "Add lettuce", image: lettuceImg, correct: true },
          { text: "Drink milk", image: milkImg, correct: false },
          { text: "Cut banana", image: bananaImg, correct: false }
        ],
        [
          { text: "Put top bread", image: breadImg, correct: true },
          { text: "Add ketchup", image: plateImg, correct: false },
          { text: "Use fork", image: forkImg, correct: false }
        ]
      ]
    },
    fruitSalad: {
      name: "Fruit Salad",
      emoji: bowlImg, // Changed from emoji to actual image
      steps: [
        { completed: "Step 1: We wash the fruits.", image: washImg, description: "Clean fruits under running water" },
        { completed: "Step 2: We cut the apple into pieces.", image: appleImg, description: "Apple cut into small pieces" },
        { completed: "Step 3: We slice the banana.", image: bananaImg, description: "Banana sliced into rounds" },
        { completed: "Step 4: We put everything in a bowl.", image: bowlImg, description: "All fruits in a mixing bowl" },
        { completed: "Step 5: We mix gently with a spoon.", image: mixingImg, description: "Beautiful mixed fruit salad" }
      ],
      choices: [
        [
          { text: "Cut apple", image: appleImg, correct: true },
          { text: "Mix with spoon", image: spoonImg, correct: false },
          { text: "Add juice", image: milkImg, correct: false }
        ],
        [
          { text: "Slice banana", image: bananaImg, correct: true },
          { text: "Crack egg", image: eggImg, correct: false },
          { text: "Get knife", image: forkImg, correct: false }
        ],
        [
          { text: "Put in bowl", image: bowlImg, correct: true },
          { text: "Cut more apple", image: appleImg, correct: false },
          { text: "Drink water", image: milkImg, correct: false }
        ],
        [
          { text: "Mix with spoon", image: spoonImg, correct: true },
          { text: "Add more fruit", image: appleImg, correct: false },
          { text: "Put in fridge", image: plateImg, correct: false }
        ]
      ]
    },
    scrambledEggs: {
      name: "Scrambled Eggs",
      emoji: fryingpanImg, // Changed from emoji to actual image
      steps: [
        { completed: "Step 1: We crack the eggs into a bowl.", image: eggImg, description: "Eggs cracked into mixing bowl" },
        { completed: "Step 2: We beat the eggs with a fork.", image: forkImg, description: "Eggs beaten until smooth" },
        { completed: "Step 3: We heat the pan on the stove.", image: stoveImg, description: "Pan heating on the stove" },
        { completed: "Step 4: We pour eggs into the hot pan.", image: fryingpanImg, description: "Beaten eggs poured into pan" },
        { completed: "Step 5: We scramble and serve!", image: plateImg, description: "Perfect scrambled eggs on plate" }
      ],
      choices: [
        [
          { text: "Beat with fork", image: forkImg, correct: true },
          { text: "Add cereal", image: cerealBowlImg, correct: false },
          { text: "Get bowl", image: bowlImg, correct: false }
        ],
        [
          { text: "Heat the pan", image: stoveImg, correct: true },
          { text: "Add cheese", image: cheeseImg, correct: false },
          { text: "Beat more", image: forkImg, correct: false }
        ],
        [
          { text: "Pour eggs in pan", image: fryingpanImg, correct: true },
          { text: "Turn off heat", image: stoveImg, correct: false },
          { text: "Add salt", image: saltImg, correct: false }
        ],
        [
          { text: "Scramble and serve", image: plateImg, correct: true },
          { text: "Add more eggs", image: eggImg, correct: false },
          { text: "Let it sit", image: stoveImg, correct: false }
        ]
      ]
    },
    cereal: {
      name: "Cereal with Milk",
      emoji: cerealBowlImg, // Changed from emoji to actual image
      steps: [
        { completed: "Step 1: We get a clean bowl.", image: bowlImg, description: "Empty bowl ready for cereal" },
        { completed: "Step 2: We pour cereal into the bowl.", image: cerealBowlImg, description: "Cereal in the bowl" },
        { completed: "Step 3: We pour milk over the cereal.", image: milkImg, description: "Milk poured over cereal" },
        { completed: "Step 4: We get a spoon to eat.", image: spoonImg, description: "Spoon ready for eating" },
        { completed: "Step 5: We enjoy our breakfast!", image: happyfaceImg, description: "Delicious cereal breakfast" }
      ],
      choices: [
        [
          { text: "Pour cereal", image: cerealBowlImg, correct: true },
          { text: "Crack egg", image: eggImg, correct: false },
          { text: "Add fruit", image: bananaImg, correct: false }
        ],
        [
          { text: "Pour milk", image: milkImg, correct: true },
          { text: "Add sugar", image: spoonImg, correct: false },
          { text: "Get another bowl", image: bowlImg, correct: false }
        ],
        [
          { text: "Get a spoon", image: spoonImg, correct: true },
          { text: "Add more cereal", image: cerealBowlImg, correct: false },
          { text: "Put in microwave", image: stoveImg, correct: false }
        ],
        [
          { text: "Enjoy breakfast", image: happyfaceImg, correct: true },
          { text: "Add more milk", image: milkImg, correct: false },
          { text: "Put in fridge", image: plateImg, correct: false }
        ]
      ]
    }
  };

  const currentRecipe = recipes[selectedRecipe];

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
          return;
        }
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Great job! You've mastered recipe sequences before. Want to practice more?");
          }
        }
      } catch (error) {
        console.log('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  // Speech synthesis
  const speak = (text) => {
    if ('speechSynthesis' in window && autoPlayEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
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

  const handleChoice = (choice) => {
    setSelectedAnswer(choice);
    setShowFeedback(true);

    if (choice.correct) {
      // Show confetti animation
      triggerCorrectAnimation();
      
      setCorrectAnswers(prev => prev + 1);
      speak("Correct! Great job following the recipe!");

      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
        if (currentStep < currentRecipe.choices.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          if (!completedRecipes.includes(selectedRecipe)) {
            setScore(prev => prev + 1);
            setCompletedRecipes(prev => [...prev, selectedRecipe]);
          }
          setGamePhase('complete');
          setShowCelebration(true);
          saveProgress();
          speak(`Wonderful! You finished making ${currentRecipe.name}!`);
        }
      }, 3000);
    } else {
      speak("Try again! Think about what comes next in the recipe.");
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedAnswer(null);
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
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: score,
        maxScore: Object.keys(recipes).length,
        completed: completedRecipes.length >= Object.keys(recipes).length,
        starsEarned: getStarRating()
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
    const percentage = (finalScore / Object.keys(recipes).length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const resetGame = () => {
    setCurrentStep(0);
    setGamePhase('intro');
    setShowFeedback(false);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
  };

  const startGame = () => {
    setCurrentStep(0);
    setGamePhase('game');
    setShowFeedback(false);
    setCorrectAnswers(0);
    setSelectedAnswer(null);
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
    
    const hasNextLevel = currentLevel < maxLevel;
    
    setTimeout(() => {
      if (hasNextLevel) {
        if (navigate) {
          navigate('/lesson/cooking/level-5');
        } else {
          window.location.href = '/lesson/cooking/level-5';
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
            Loading recipe sequences...
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
            {gamePhase === 'intro' && (
              <>
                {/* Header Section */}
                <Box sx={{ textAlign: 'center', width: '100%', maxWidth: '800px' }}>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold', 
                    color: 'white', 
                    mb: 1,
                    textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
                  }}>
                    👨‍🍳 Recipe Sequences
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

                  <Chip 
                    label={`Completed: ${score}/${Object.keys(recipes).length} recipes`}
                    sx={{ 
                      backgroundColor: 'rgba(76, 175, 80, 0.9)', 
                      color: 'white', 
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      padding: '8px 12px',
                      mb: 2,
                      ml: 1,
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
                  
                  {/* Audio Toggle */}
                  <Box sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '20px',
                    padding: '6px 15px',
                    backdropFilter: 'blur(10px)',
                    mb: 2,
                    display: 'inline-block'
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
                </Box>

                {/* Recipe Selection */}
                <Grid container spacing={3} sx={{ maxWidth: '800px', mb: 3 }}>
                  {Object.entries(recipes).map(([key, recipe]) => (
                    <Grid item xs={12} sm={6} md={3} key={key}>
                      <Card
                        onClick={() => setSelectedRecipe(key)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: '15px',
                          border: selectedRecipe === key ? '3px solid #FF9800' : '2px solid #e0e0e0',
                          backgroundColor: selectedRecipe === key 
                            ? 'rgba(255, 152, 0, 0.1)' 
                            : 'rgba(255, 255, 255, 0.95)',
                          transform: selectedRecipe === key ? 'scale(1.05)' : 'scale(1)',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          position: 'relative',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                          }
                        }}
                      >
                        {completedRecipes.includes(key) && (
                          <Box sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            zIndex: 1
                          }}>
                            ✓
                          </Box>
                        )}
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Typography sx={{ fontSize: '3rem', mb: 1 }}>{recipe.emoji}</Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {recipe.name}
                          </Typography>
                          {completedRecipes.includes(key) && (
                            <Chip 
                              label="Completed! ✨" 
                              size="small"
                              sx={{ 
                                backgroundColor: '#d1fae5', 
                                color: '#059669',
                                fontWeight: 'bold'
                              }} 
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Start Button */}
                <Button
                  onClick={startGame}
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: '#4CAF50',
                    borderRadius: '15px',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    py: 2,
                    px: 4,
                    mb: 2,
                    '&:hover': { backgroundColor: '#45a049' }
                  }}
                  startIcon={<PlayArrowIcon />}
                >
                  Start Cooking!
                </Button>

                {/* Navigation Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    onClick={goToHomepage}
                    variant="contained"
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    🏠 Home
                  </Button>
                </Stack>
              </>
            )}

            {gamePhase === 'game' && (
              <>
                {/* Game Header */}
                <Box sx={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: 'white', 
                    mb: 1,
                    textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
                  }}>
                    Making {currentRecipe.name} {currentRecipe.emoji}
                  </Typography>
                  
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                    <Chip 
                      label={`Step ${currentStep + 1}/${currentRecipe.steps.length}`}
                      sx={{ 
                        backgroundColor: 'rgba(33, 150, 243, 0.9)', 
                        color: 'white', 
                        fontWeight: 'bold'
                      }}
                    />
                    <Chip 
                      label={`Correct: ${correctAnswers}`}
                      sx={{ 
                        backgroundColor: 'rgba(76, 175, 80, 0.9)', 
                        color: 'white', 
                        fontWeight: 'bold'
                      }}
                    />
                  </Stack>
                </Box>

                {/* Current Step Card */}
                <Card sx={{
                  backgroundColor: 'rgba(255, 250, 244, 0.95)',
                  borderRadius: '20px',
                  padding: '25px',
                  mb: 3,
                  border: '3px solid #FF9800',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '600px',
                  backdropFilter: 'blur(15px)'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    <img 
                      src={currentRecipe.steps[currentStep].image} 
                      alt={currentRecipe.steps[currentStep].completed}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'contain',
                        borderRadius: '15px'
                      }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold', 
                    color: '#E65100', 
                    mb: 1
                  }}>
                    {currentRecipe.steps[currentStep].completed}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#5D4037', 
                    mb: 3,
                    fontSize: '1.1rem'
                  }}>
                    {currentRecipe.steps[currentStep].description}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: '#E65100',
                    mb: 2
                  }}>
                    What comes next?
                  </Typography>
                </Card>

                {/* Answer Choices */}
                {currentRecipe.choices[currentStep] && (
                  <Grid container spacing={2} sx={{ maxWidth: '600px', mb: 3 }}>
                    {currentRecipe.choices[currentStep].map((choice, idx) => (
                      <Grid item xs={12} sm={4} key={idx}>
                        <Card
                          onClick={() => !showFeedback && handleChoice(choice)}
                          sx={{
                            cursor: showFeedback ? 'not-allowed' : 'pointer',
                            borderRadius: '15px',
                            border: '2px solid',
                            borderColor: showFeedback && selectedAnswer === choice && choice.correct
                              ? '#4CAF50' 
                              : showFeedback && selectedAnswer === choice && !choice.correct
                              ? '#F44336'
                              : '#E0E0E0',
                            backgroundColor: showFeedback && selectedAnswer === choice && choice.correct
                              ? 'rgba(200, 230, 201, 0.95)'
                              : showFeedback && selectedAnswer === choice && !choice.correct
                              ? 'rgba(255, 205, 210, 0.95)'
                              : 'rgba(255, 255, 255, 0.95)',
                            transition: 'all 0.3s ease',
                            transform: showFeedback && selectedAnswer === choice && choice.correct
                              ? 'scale(1.05)' : 'scale(1)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                              transform: showFeedback ? 'scale(1)' : 'scale(1.02)',
                              boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                            }
                          }}
                        >
                          <CardContent sx={{ textAlign: 'center', p: 2 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'center', 
                              mb: 1,
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                            }}>
                              <img 
                                src={choice.image} 
                                alt={choice.text}
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
                              fontSize: '0.9rem'
                            }}>
                              {choice.text}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Control Buttons */}
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    onClick={resetGame}
                    variant="contained"
                    startIcon={<RotateLeftIcon />}
                    sx={{
                      backgroundColor: '#9C27B0',
                      borderRadius: '15px',
                      '&:hover': { backgroundColor: '#7B1FA2' }
                    }}
                  >
                    Change Recipe
                  </Button>
                  <Button
                    onClick={goToHomepage}
                    variant="contained"
                    sx={{
                      backgroundColor: '#2196F3',
                      borderRadius: '15px',
                      '&:hover': { backgroundColor: '#1976D2' }
                    }}
                  >
                    🏠 Home
                  </Button>
                </Stack>
              </>
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
            Recipe Complete!
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
            You finished making {currentRecipe.name}! 🎊
          </Typography>
          <Typography variant="body1" sx={{ color: '#5D4037', lineHeight: 1.4, mb: 2 }}>
            Level {currentLevel} Progress: {completedRecipes.length}/{Object.keys(recipes).length} recipes completed
            {completedRecipes.length >= Object.keys(recipes).length 
              ? ` - Level Complete! ${hasNextLevel ? 'Ready for the next level?' : 'You\'ve mastered all recipes!'}` 
              : ' - Keep cooking to complete more recipes!'
            }
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
          {completedRecipes.length >= Object.keys(recipes).length ? (
            // All recipes completed - show next level option
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
          ) : (
            // Still recipes to complete - show continue cooking option
            <Button 
              onClick={() => {
                setGamePhase('intro');
                setShowCelebration(false);
                setCurrentStep(0);
                setCorrectAnswers(0);
              }}
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
              🍳 Cook More Recipes
            </Button>
          )}
          
          <Button 
            onClick={() => {
              setGamePhase('game');
              setShowCelebration(false);
              setCurrentStep(0);
              setCorrectAnswers(0);
            }}
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
            🔄 Cook Again
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