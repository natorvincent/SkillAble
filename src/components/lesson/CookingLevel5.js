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
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import MusicOffIcon from '@mui/icons-material/MusicOff';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Import recipe images (using existing images as placeholders)
import sandwichRecipeImg from "../../assets/cookingLevel4/sandwhich.png";
import fruitSaladRecipeImg from "../../assets/cookingLevel4/fruitsalad.png";
import scrambledEggRecipeImg from "../../assets/cookingLevel4/scrambledegg.png";

// Import ingredient images from cookingLevel5_ingredients folder
import appleImg from "../../assets/cookingLevel5_ingredients/apple.png";
import bananaImg from "../../assets/cookingLevel5_ingredients/banana.png";
import bowlImg from "../../assets/cookingLevel5_ingredients/bowl.png";
import breadImg from "../../assets/cookingLevel5_ingredients/bread.png";
import butterImg from "../../assets/cookingLevel5_ingredients/butter.png";
import cheeseImg from "../../assets/cookingLevel5_ingredients/cheese.png";
import chocolateImg from "../../assets/cookingLevel5_ingredients/chocolate.png";
import eggImg from "../../assets/cookingLevel5_ingredients/egg.png";
import lettuceImg from "../../assets/cookingLevel5_ingredients/lettuce.png";
import milkImg from "../../assets/cookingLevel5_ingredients/milk.png";
import orangeImg from "../../assets/cookingLevel5_ingredients/orange.png";
import saltImg from "../../assets/cookingLevel5_ingredients/salt.png";
import tomatoImg from "../../assets/cookingLevel5_ingredients/tomato.png";
import watermelonImg from "../../assets/cookingLevel5_ingredients/watermelon.png";

// Import tool images from cookingLevel5_tools folder
import forkImg from "../../assets/cookingLevel5_tools/fork.png";
import graterImg from "../../assets/cookingLevel5_tools/grater.png";
import knifeImg from "../../assets/cookingLevel5_tools/knife.png";
import peelerImg from "../../assets/cookingLevel5_tools/peeler.png";
import spatulaImg from "../../assets/cookingLevel5_tools/spatula.png";
import tongsImg from "../../assets/cookingLevel5_tools/tongs.png";
import whiskImg from "../../assets/cookingLevel5_tools/whisk.png";

// Import action images from cookingLevel5_actions folder
import crackImg from "../../assets/cookingLevel5_actions/crack.png";
import cutImg from "../../assets/cookingLevel5_actions/cut.png";
import fryImg from "../../assets/cookingLevel5_actions/fry.png";
import grillImg from "../../assets/cookingLevel5_actions/grill.png";
import mixImg from "../../assets/cookingLevel5_actions/mix.png";
import spreadImg from "../../assets/cookingLevel5_actions/spread.png";
import squeezeImg from "../../assets/cookingLevel5_actions/squeeze.png";
import stirImg from "../../assets/cookingLevel5_actions/stir.png";

// Import step images from cookingLevel5_steps folder
import addLettuceAndCheeseImg from "../../assets/cookingLevel5_steps/addlettuceandcheese.png";
import beatEggsWithForkImg from "../../assets/cookingLevel5_steps/beateggswithfork.png";
import cookAndStirEggsImg from "../../assets/cookingLevel5_steps/cookandstireggs.png";
import crackEggsInBowlImg from "../../assets/cookingLevel5_steps/crackeggsinbowl.png";
import cutAppleIntoPiecesImg from "../../assets/cookingLevel5_steps/cutappleintopieces.png";
import heatPanWithButterImg from "../../assets/cookingLevel5_steps/heatpanwithbutter.png";
import mixInABowlImg from "../../assets/cookingLevel5_steps/mixinabowl.png";
import putBreadOnPlateImg from "../../assets/cookingLevel5_steps/putbreadonaplate.png";
import putTopSliceOfBreadImg from "../../assets/cookingLevel5_steps/puttopsliceofbread.png";
import sliceTheBananaImg from "../../assets/cookingLevel5_steps/slicethebanana.png";
import spreadButterOnBreadImg from "../../assets/cookingLevel5_steps/spreadbutteronbread.png";
import washTheFruitImg from "../../assets/cookingLevel5_steps/washthefruit.png";

const CookingLevel5 = () => {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [currentPhase, setCurrentPhase] = useState('introduction');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [sequenceSteps, setSequenceSteps] = useState([]);
  const [draggedSteps, setDraggedSteps] = useState([]);
  const [score, setScore] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCorrectPopup, setShowCorrectPopup] = useState(false);
  const [completedRecipes, setCompletedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);

  // Level info
  const [currentLevel] = useState(5);
  const [maxLevel] = useState(5);
  const [moduleIdentifier] = useState('cooking-basics');
  const [lessonIdentifier] = useState('cooking-recipes');

  const recipes = {
    sandwich: {
      name: "Classic Sandwich",
      image: sandwichRecipeImg,
      description: "Let's make a delicious sandwich together!",
      difficulty: "Easy",
      time: "5 min",
      correctIngredients: ["bread", "lettuce", "cheese"],
      correctTool: "knife",
      correctAction: "spread",
      ingredients: [
        { id: "bread", name: "Bread", image: breadImg, correct: true },
        { id: "lettuce", name: "Lettuce", image: lettuceImg, correct: true },
        { id: "cheese", name: "Cheese", image: cheeseImg, correct: true },
        { id: "tomato", name: "Tomato", image: tomatoImg, correct: false },
        { id: "chocolate", name: "Chocolate", image: chocolateImg, correct: false }
      ],
      tools: [
        { id: "knife", name: "Knife", image: knifeImg, correct: true },
        { id: "spatula", name: "Spatula", image: spatulaImg, correct: false },
        { id: "tongs", name: "Tongs", image: tongsImg, correct: false }
      ],
      actions: [
        { id: "spread", name: "Spread", image: spreadImg, correct: true },
        { id: "grill", name: "Grill", image: grillImg, correct: false },
        { id: "mix", name: "Mix", image: mixImg, correct: false }
      ],
      steps: [
        { id: 1, text: "Put bread on plate", image: putBreadOnPlateImg },
        { id: 2, text: "Spread butter on bread", image: spreadButterOnBreadImg },
        { id: 3, text: "Add lettuce and cheese", image: addLettuceAndCheeseImg },
        { id: 4, text: "Put top slice of bread", image: putTopSliceOfBreadImg }
      ]
    },
    fruitSalad: {
      name: "Fruit Salad",
      image: fruitSaladRecipeImg,
      description: "Let's make a healthy fruit salad!",
      difficulty: "Easy",
      time: "10 min",
      correctIngredients: ["apple", "banana", "bowl"],
      correctTool: "knife",
      correctAction: "cut",
      ingredients: [
        { id: "apple", name: "Apple", image: appleImg, correct: true },
        { id: "banana", name: "Banana", image: bananaImg, correct: true },
        { id: "bowl", name: "Bowl", image: bowlImg, correct: true },
        { id: "orange", name: "Orange", image: orangeImg, correct: false },
        { id: "watermelon", name: "Watermelon", image: watermelonImg, correct: false }
      ],
      tools: [
        { id: "knife", name: "Knife", image: knifeImg, correct: true },
        { id: "peeler", name: "Peeler", image: peelerImg, correct: false },
        { id: "grater", name: "Grater", image: graterImg, correct: false }
      ],
      actions: [
        { id: "cut", name: "Cut", image: cutImg, correct: true },
        { id: "squeeze", name: "Squeeze", image: squeezeImg, correct: false },
        { id: "stir", name: "Stir", image: stirImg, correct: false }
      ],
      steps: [
        { id: 1, text: "Wash the fruits", image: washTheFruitImg },
        { id: 2, text: "Cut apple into pieces", image: cutAppleIntoPiecesImg },
        { id: 3, text: "Slice the banana", image: sliceTheBananaImg },
        { id: 4, text: "Mix in bowl", image: mixInABowlImg }
      ]
    },
    scrambledEggs: {
      name: "Scrambled Eggs",
      image: scrambledEggRecipeImg,
      description: "Let's cook some fluffy scrambled eggs!",
      difficulty: "Medium",
      time: "8 min",
      correctIngredients: ["egg", "butter", "bowl"],
      correctTool: "fork",
      correctAction: "crack",
      ingredients: [
        { id: "egg", name: "Egg", image: eggImg, correct: true },
        { id: "butter", name: "Butter", image: butterImg, correct: true },
        { id: "bowl", name: "Bowl", image: bowlImg, correct: true },
        { id: "milk", name: "Milk", image: milkImg, correct: false },
        { id: "salt", name: "Salt", image: saltImg, correct: false }
      ],
      tools: [
        { id: "fork", name: "Fork", image: forkImg, correct: true },
        { id: "tongs", name: "Tongs", image: tongsImg, correct: false },
        { id: "whisk", name: "Whisk", image: whiskImg, correct: false }
      ],
      actions: [
        { id: "crack", name: "Crack", image: crackImg, correct: true },
        { id: "fry", name: "Fry", image: fryImg, correct: false },
        { id: "stir", name: "Stir", image: stirImg, correct: false }
      ],
      steps: [
        { id: 1, text: "Crack eggs in bowl", image: crackEggsInBowlImg },
        { id: 2, text: "Beat eggs with fork", image: beatEggsWithForkImg },
        { id: 3, text: "Heat pan with butter", image: heatPanWithButterImg },
        { id: 4, text: "Cook and stir eggs", image: cookAndStirEggsImg }
      ]
    }
  };

  // Initialize loading state and load progress
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          setLoading(false);
          setShowTip('Welcome to Cooking Adventure! Choose a recipe to start your culinary journey!');
          return;
        }
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("🌟 Fantastic! You've mastered cooking recipes before. Want to practice more?");
          } else {
            setShowTip('Welcome to Cooking Adventure! Choose a recipe to start your culinary journey!');
          }
        } else {
          setShowTip('Welcome to Cooking Adventure! Choose a recipe to start your culinary journey!');
        }
      } catch (error) {
        console.log('Error fetching progress:', error);
        setShowTip('Welcome to Cooking Adventure! Choose a recipe to start your culinary journey!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

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

  // Confetti animation effect
  useEffect(() => {
    if (showCelebration || showCorrectAnimation) {
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
      }));
      setConfettiPieces(pieces);
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setShowCorrectAnimation(false);
        setConfettiPieces([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showCelebration, showCorrectAnimation]);

  // Auto progression logic
  useEffect(() => {
    if (phaseComplete) {
      const timer = setTimeout(() => {
        progressToNextPhase();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phaseComplete]);

  const progressToNextPhase = () => {
    setPhaseComplete(false);
    setSelectedItems([]);
    setShowFeedback(false);
    
    if (currentPhase === 'introduction') {
      setCurrentPhase('ingredients');
    } else if (currentPhase === 'ingredients') {
      setCurrentPhase('tools');
    } else if (currentPhase === 'tools') {
      setCurrentPhase('actions');
    } else if (currentPhase === 'actions') {
      setCurrentPhase('sequencing');
      setSequenceSteps([...selectedRecipe.steps].sort(() => Math.random() - 0.5));
      setDraggedSteps([]);
    } else if (currentPhase === 'sequencing') {
      setCurrentPhase('celebration');
      setCompletedRecipes([...completedRecipes, selectedRecipe.name]);
      setShowCelebration(true);
      setScore(score + 100);
      saveProgress();
    }
  };

  const selectRecipe = (recipeKey) => {
    setSelectedRecipe(recipes[recipeKey]);
    setCurrentPhase('ingredients');
    setScore(0);
    setCompletedRecipes([]);
  };

  const handleItemSelect = (item) => {
    const newSelectedItems = [...selectedItems, item.id];
    setSelectedItems(newSelectedItems);
    
    let correct = false;
    let message = '';
    
    if (currentPhase === 'ingredients') {
      const correctIngredients = selectedRecipe.correctIngredients;
      if (newSelectedItems.length === correctIngredients.length) {
        correct = newSelectedItems.every(id => correctIngredients.includes(id));
        message = correct ? 'Perfect! You chose all the right ingredients!' : 'Oops! Some ingredients don\'t belong in this recipe.';
      } else if (newSelectedItems.length < correctIngredients.length) {
        message = `Good choice! You need ${correctIngredients.length - newSelectedItems.length} more ingredient${correctIngredients.length - newSelectedItems.length === 1 ? '' : 's'}.`;
        return;
      }
    } else if (currentPhase === 'tools') {
      correct = item.id === selectedRecipe.correctTool;
      message = correct ? 'Excellent! That\'s the right tool for the job!' : 'Not quite right. Try a different tool!';
    } else if (currentPhase === 'actions') {
      correct = item.id === selectedRecipe.correctAction;
      message = correct ? 'Great! That\'s the correct cooking action!' : 'That\'s not the right action for this recipe.';
    }
    
    setIsCorrect(correct);
    setFeedbackMessage(message);
    setShowFeedback(true);
    
    if (correct) {
      setPhaseComplete(true);
      setShowCorrectAnimation(true);
      setScore(score + 25);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const stepId = parseInt(e.dataTransfer.getData('text/plain'));
    const step = sequenceSteps.find(s => s.id === stepId);
    
    if (step && !draggedSteps.find(s => s.id === stepId)) {
      const newDraggedSteps = [...draggedSteps, step];
      setDraggedSteps(newDraggedSteps);
      
      if (newDraggedSteps.length === selectedRecipe.steps.length) {
        const correct = newDraggedSteps.every((step, index) => step.id === selectedRecipe.steps[index].id);
        setIsCorrect(correct);
        setFeedbackMessage(correct ? 'Perfect! You got the steps in the right order!' : 'Not quite right. Try again!');
        setShowFeedback(true);
        
        if (correct) {
          setPhaseComplete(true);
          setShowCorrectAnimation(true);
          setScore(score + 50);
        } else {
          setTimeout(() => {
            setDraggedSteps([]);
            setShowFeedback(false);
          }, 2000);
        }
      }
    }
  };

  // Save progress to database
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId) {
        console.error('Cannot save progress - missing student ID');
        return;
      }
      
      const lessonId = 5;
      const finalScore = score;
      const maxScore = 200;
      
      const progressData = {
        studentId: studentId,
        lessonId: lessonId,
        score: finalScore,
        maxScore: maxScore,
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

  // Calculate star rating
  const getStarRating = () => {
    const totalPossibleScore = 200;
    const percentage = (score / totalPossibleScore) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Get progress percentage
  const getProgressPercentage = () => {
    const phases = ['introduction', 'ingredients', 'tools', 'actions', 'sequencing'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentPhase === 'celebration') return 100;
    return ((currentIndex + 1) / phases.length) * 100;
  };

  const resetGame = () => {
    setCurrentPhase('introduction');
    setSelectedRecipe(null);
    setSelectedItems([]);
    setShowFeedback(false);
    setPhaseComplete(false);
    setScore(0);
    setCompletedRecipes([]);
    setShowCelebration(false);
    setProgressSaved(false);
    setSequenceSteps([]);
    setDraggedSteps([]);
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
    
    setTimeout(() => {
      goToHomepage();
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
            Loading cooking adventure...
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
                🍳 Cooking Adventure
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
                  padding: '12px 20px',
                  mb: 2,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Typography sx={{ 
                    fontSize: '1.1rem', 
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
                {/* Music Toggle */}
                <Box sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '20px',
                  padding: '6px 15px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={backgroundMusicEnabled}
                        onChange={(e) => setBackgroundMusicEnabled(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {backgroundMusicEnabled ? <MusicNoteIcon fontSize="small" /> : <MusicOffIcon fontSize="small" />}
                        <Typography variant="body2" fontWeight="bold">Music</Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Phase Toggles */}
                <Button
                  onClick={() => setCurrentPhase('introduction')}
                  variant={currentPhase === 'introduction' ? 'contained' : 'outlined'}
                  size="medium"
                  sx={{
                    borderRadius: '20px',
                    minWidth: '100px',
                    backgroundColor: currentPhase === 'introduction' ? 'rgba(255, 152, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#FF9800',
                    color: currentPhase === 'introduction' ? 'white' : '#FF9800',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #FF9800',
                    '&:hover': {
                      backgroundColor: currentPhase === 'introduction' ? 'rgba(245, 124, 0, 0.9)' : 'rgba(255, 152, 0, 0.1)',
                    }
                  }}
                >
                  📚 Learn
                </Button>
                <Button
                  onClick={() => setCurrentPhase('ingredients')}
                  disabled={!selectedRecipe}
                  variant={currentPhase !== 'introduction' && selectedRecipe ? 'contained' : 'outlined'}
                  size="medium"
                  sx={{
                    borderRadius: '20px',
                    minWidth: '100px',
                    backgroundColor: currentPhase !== 'introduction' && selectedRecipe ? 'rgba(255, 152, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: '#FF9800',
                    color: currentPhase !== 'introduction' && selectedRecipe ? 'white' : '#FF9800',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #FF9800',
                    opacity: selectedRecipe ? 1 : 0.6,
                    '&:hover': {
                      backgroundColor: currentPhase !== 'introduction' && selectedRecipe ? 'rgba(245, 124, 0, 0.9)' : 'rgba(255, 152, 0, 0.1)',
                    }
                  }}
                >
                  🎯 Practice
                </Button>

                {/* Score Display */}
                <Chip 
                  label={`Score: ${score}`} 
                  sx={{ 
                    backgroundColor: 'rgba(33, 150, 243, 0.9)', 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    padding: '8px 12px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}
                />

                {/* Reset Button */}
                <Button
                  onClick={resetGame}
                  variant="contained"
                  size="medium"
                  sx={{
                    backgroundColor: 'rgba(156, 39, 176, 0.9)',
                    borderRadius: '20px',
                    minWidth: '80px',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    '&:hover': { backgroundColor: 'rgba(123, 31, 162, 0.9)' }
                  }}
                >
                  🔄 Reset
                </Button>

                {/* Home Button */}
                <Button
                  onClick={goToHomepage}
                  variant="contained"
                  size="medium"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#FF9800',
                    borderRadius: '20px',
                    minWidth: '80px',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid #FF9800',
                    '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.1)' }
                  }}
                >
                  🏠 Home
                </Button>
              </Stack>
            </Box>

            {/* Progress bar */}
            {selectedRecipe && currentPhase !== 'introduction' && (
              <Box sx={{ width: '100%', maxWidth: '700px' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body1" sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    Making: {selectedRecipe.name}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}>
                    Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={getProgressPercentage()} 
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
            )}

            {/* Main Game Content */}
            {currentPhase === 'introduction' ? (
              /* Recipe Selection */
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
                pb: 4
              }}>
                <Typography variant="h4" sx={{
                  fontWeight: 'bold',
                  color: 'white',
                  mb: 3,
                  textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
                }}>
                  Choose Your Recipe!
                </Typography>
                
                {/* MODERNIZED Recipe Selection - Responsive Grid Layout */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    sm: 'repeat(2, 1fr)', 
                    lg: 'repeat(3, 1fr)' 
                  },
                  gap: { xs: 2, sm: 2.5, lg: 3 },
                  width: '100%',
                  maxWidth: '900px',
                  px: { xs: 1, sm: 0 }
                }}>
                  {Object.entries(recipes).map(([key, recipe]) => (
                    <Card
                      key={key}
                      onClick={() => selectRecipe(key)}
                      sx={{
                        position: 'relative',
                        backgroundColor: 'rgba(255, 255, 255, 0.97)',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid rgba(255, 152, 0, 0.2)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        height: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(255, 152, 0, 0.15)',
                        
                        // Gradient border effect
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: '16px',
                          padding: '2px',
                          background: 'linear-gradient(135deg, #FF9800, #FFC107, #FF9800)',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'xor',
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                          zIndex: -1
                        },
                        
                        '&:hover': {
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: '0 20px 40px rgba(255, 152, 0, 0.25)',
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                          
                          '&::before': {
                            opacity: 1
                          },
                          
                          // Image zoom effect
                          '& .recipe-image': {
                            transform: 'scale(1.1)'
                          },
                          
                          // Badge hover effects
                          '& .difficulty-badge': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)'
                          },
                          
                          '& .time-badge': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)'
                          }
                        }
                      }}
                    >
                      {/* Recipe Image with Container */}
                      <Box sx={{ 
                        position: 'relative',
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 2,
                        overflow: 'hidden',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 248, 225, 0.8)',
                        padding: '12px',
                        height: '90px'
                      }}>
                        <img 
                          src={recipe.image} 
                          alt={recipe.name}
                          className="recipe-image"
                          style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            transition: 'transform 0.4s ease',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                          }}
                        />
                      </Box>

                      {/* Recipe Title */}
                      <Typography variant="h6" sx={{ 
                        fontWeight: '700', 
                        color: '#D84315',
                        mb: 1.5,
                        fontSize: { xs: '1.1rem', sm: '1.2rem' },
                        lineHeight: 1.2,
                        fontFamily: '"Inter", "Roboto", sans-serif',
                        letterSpacing: '-0.025em'
                      }}>
                        {recipe.name}
                      </Typography>

                      {/* Badges Container */}
                      <Stack 
                        direction="row" 
                        spacing={1} 
                        justifyContent="center" 
                        sx={{ mb: 2 }}
                      >
                        <Chip
                          label={recipe.difficulty}
                          className="difficulty-badge"
                          size="small"
                          sx={{
                            backgroundColor: '#E3F2FD',
                            color: '#1565C0',
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            height: '24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(21, 101, 192, 0.2)',
                            transition: 'all 0.3s ease',
                            '& .MuiChip-label': {
                              padding: '0 8px'
                            }
                          }}
                        />
                        <Chip
                          label={recipe.time}
                          className="time-badge"
                          size="small"
                          sx={{
                            backgroundColor: '#E8F5E8',
                            color: '#2E7D32',
                            fontWeight: '600',
                            fontSize: '0.75rem',
                            height: '24px',
                            borderRadius: '12px',
                            border: '1px solid rgba(46, 125, 50, 0.2)',
                            transition: 'all 0.3s ease',
                            '& .MuiChip-label': {
                              padding: '0 8px'
                            }
                          }}
                        />
                      </Stack>

                      {/* Description with Better Text Handling */}
                      <Box sx={{ 
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#6D4C41',
                            lineHeight: 1.4,
                            fontSize: '0.875rem',
                            fontWeight: '400',
                            textAlign: 'center',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            fontFamily: '"Inter", "Roboto", sans-serif',
                            letterSpacing: '0.01em'
                          }}
                        >
                          {recipe.description}
                        </Typography>
                      </Box>

                      {/* Subtle Call-to-Action */}
                      <Box sx={{
                        mt: 'auto',
                        pt: 1.5,
                        borderTop: '1px solid rgba(255, 152, 0, 0.1)',
                        opacity: 0.7,
                        transition: 'opacity 0.3s ease'
                      }}>
                        <Typography variant="caption" sx={{
                          color: '#FF9800',
                          fontWeight: '600',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Click to Cook →
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            ) : currentPhase === 'sequencing' ? (
              /* Sequencing Phase */
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '1000px',
                pb: 4
              }}>
                <Card sx={{
                  backgroundColor: 'rgba(255, 250, 244, 0.95)',
                  borderRadius: '20px',
                  padding: '20px',
                  mb: 2.5,
                  border: '3px solid #FF9800',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '600px',
                  backdropFilter: 'blur(15px)'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#E65100', 
                    mb: 1.5,
                    fontSize: '1.5rem'
                  }}>
                    📋 Put the Steps in Order
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 1.5,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    <img 
                      src={selectedRecipe.image} 
                      alt={selectedRecipe.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold', 
                    color: '#5D4037', 
                    mb: 1,
                    fontSize: '1.1rem'
                  }}>
                    {selectedRecipe.name}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#5D4037',
                    fontSize: '1rem'
                  }}>
                    Drag the steps to arrange them in the correct cooking order:
                  </Typography>
                </Card>

                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                  gap: 2.5,
                  width: '100%'
                }}>
                  {/* Available Steps */}
                  <Card sx={{
                    backgroundColor: 'rgba(255, 250, 244, 0.95)',
                    borderRadius: '20px',
                    padding: '15px',
                    border: '3px solid #2196F3',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(15px)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#1976D2', 
                      mb: 1.5,
                      textAlign: 'center',
                      fontSize: '1.1rem'
                    }}>
                      📝 Available Steps
                    </Typography>
                    <Stack spacing={1.5}>
                      {sequenceSteps.filter(step => !draggedSteps.find(d => d.id === step.id)).map(step => (
                        <Box
                          key={step.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', step.id.toString())}
                          sx={{
                            backgroundColor: '#f3f4f6',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '2px solid #2196F3',
                            cursor: 'move',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            transition: 'transform 0.2s ease',
                            minHeight: '60px',
                            '&:hover': {
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                            flexShrink: 0
                          }}>
                            <img 
                              src={step.image} 
                              alt={step.text}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'contain',
                                borderRadius: '6px'
                              }}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 'bold', 
                            color: '#1976D2',
                            flex: 1,
                            fontSize: '0.9rem',
                            lineHeight: 1.2
                          }}>
                            {step.text}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Card>
                  
                  {/* Cooking Order */}
                  <Card sx={{
                    backgroundColor: 'rgba(255, 250, 244, 0.95)',
                    borderRadius: '20px',
                    padding: '15px',
                    border: '3px solid #9C27B0',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(15px)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: '#7B1FA2', 
                      mb: 1.5,
                      textAlign: 'center',
                      fontSize: '1.1rem'
                    }}>
                      🎯 Cooking Order
                    </Typography>
                    <Box
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      sx={{
                        minHeight: '250px',
                        backgroundColor: '#f3f4f6',
                        border: '2px dashed #9C27B0',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5
                      }}
                    >
                      {draggedSteps.map((step, index) => (
                        <Box key={step.id} sx={{
                          backgroundColor: '#e1bee7',
                          padding: '12px',
                          borderRadius: '12px',
                          border: '2px solid #9C27B0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          minHeight: '60px'
                        }}>
                          <Box sx={{
                            backgroundColor: '#9C27B0',
                            color: 'white',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                            flexShrink: 0
                          }}>
                            <img 
                              src={step.image} 
                              alt={step.text}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'contain',
                                borderRadius: '6px'
                              }}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ 
                            fontWeight: 'bold', 
                            color: '#7B1FA2',
                            flex: 1,
                            fontSize: '0.9rem',
                            lineHeight: 1.2
                          }}>
                            {step.text}
                          </Typography>
                        </Box>
                      ))}
                      {draggedSteps.length === 0 && (
                        <Box sx={{
                          textAlign: 'center',
                          color: '#9C27B0',
                          padding: '30px',
                          fontSize: '1rem'
                        }}>
                          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>👆</Typography>
                          <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Drop steps here in the correct order
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Box>
              </Box>
            ) : currentPhase === 'celebration' ? (
              /* Celebration Phase */
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px',
                pb: 4
              }}>
                <Card sx={{
                  backgroundColor: 'rgba(255, 193, 7, 0.95)',
                  borderRadius: '20px',
                  padding: '40px',
                  border: '4px solid #FFC107',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  width: '100%',
                  backdropFilter: 'blur(15px)'
                }}>
                  <Typography sx={{ fontSize: '4rem', mb: 2 }}>🎉</Typography>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#E65100', 
                    mb: 2
                  }}>
                    Congratulations!
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#5D4037', 
                    mb: 3
                  }}>
                    You successfully cooked {selectedRecipe.name}!
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 3,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    <img 
                      src={selectedRecipe.image} 
                      alt={selectedRecipe.name}
                      style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'contain',
                        borderRadius: '15px'
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    {[...Array(getStarRating())].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#FFCA3A', fontSize: 50, mx: 0.5 }} />
                    ))}
                    {[...Array(3 - getStarRating())].map((_, i) => (
                      <StarIcon key={i} sx={{ color: '#E0E0E0', fontSize: 50, mx: 0.5 }} />
                    ))}
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold', 
                    color: '#E65100', 
                    mb: 3
                  }}>
                    Final Score: {score} points
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ flexWrap: 'wrap', gap: 2 }}>
                    <Button
                      onClick={resetGame}
                      variant="contained"
                      sx={{
                        backgroundColor: '#FF9800',
                        borderRadius: '15px',
                        minWidth: '120px',
                        fontSize: '1rem',
                        '&:hover': { backgroundColor: '#F57C00' }
                      }}
                    >
                      🍳 Cook Again!
                    </Button>
                    <Button
                      onClick={goToHomepage}
                      variant="outlined"
                      sx={{
                        borderColor: '#FF9800',
                        color: '#E65100',
                        borderRadius: '15px',
                        minWidth: '120px',
                        fontSize: '1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        }
                      }}
                    >
                      🏠 Go Home
                    </Button>
                  </Stack>
                </Card>
              </Box>
            ) : (
              /* Other Game Phases */
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '800px',
                pb: 4
              }}>
                <Card sx={{
                  backgroundColor: 'rgba(255, 250, 244, 0.95)',
                  borderRadius: '20px',
                  padding: '20px',
                  mb: 2.5,
                  border: '3px solid #FF9800',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '600px',
                  backdropFilter: 'blur(15px)'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    color: '#E65100', 
                    mb: 1.5,
                    fontSize: '1.5rem'
                  }}>
                    {currentPhase === 'ingredients' && '🥕 Choose the Ingredients'}
                    {currentPhase === 'tools' && '🔪 Pick the Right Tool'}
                    {currentPhase === 'actions' && '⚡ Choose the Cooking Action'}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 1.5,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                  }}>
                    <img 
                      src={selectedRecipe.image} 
                      alt={selectedRecipe.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 'bold', 
                    color: '#5D4037', 
                    mb: 0.5,
                    fontSize: '1.1rem'
                  }}>
                    {selectedRecipe.name}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: '#5D4037',
                    fontSize: '1rem',
                    lineHeight: 1.4
                  }}>
                    {currentPhase === 'ingredients' && `Select the ingredients needed for ${selectedRecipe.name}:`}
                    {currentPhase === 'tools' && 'Which tool do you need?'}
                    {currentPhase === 'actions' && 'What should you do with the ingredients?'}
                  </Typography>
                </Card>

                {/* FIXED Choice Items - Single Row Layout */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  gap: 2,
                  width: '100%',
                  maxWidth: '800px',
                  overflowX: 'auto',
                  pb: 1
                }}>
                  {selectedRecipe[currentPhase]?.map(item => (
                    <Box key={item.id} sx={{ 
                      flex: '0 0 140px',
                      minWidth: '140px',
                      display: 'flex'
                    }}>
                      <Card
                        onClick={() => handleItemSelect(item)}
                        sx={{
                          padding: '15px',
                          borderRadius: '15px',
                          border: '3px solid',
                          borderColor: selectedItems.includes(item.id) ? '#4CAF50' : '#E0E0E0',
                          cursor: 'pointer',
                          textAlign: 'center',
                          backgroundColor: selectedItems.includes(item.id) 
                            ? 'rgba(200, 230, 201, 0.95)'
                            : 'rgba(255, 255, 255, 0.95)',
                          transition: 'all 0.3s ease',
                          transform: selectedItems.includes(item.id) ? 'scale(1.05)' : 'scale(1)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                          width: '100%',
                          height: '120px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          mb: 1,
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}>
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }}
                          />
                        </Box>
                        <Typography variant="body1" sx={{ 
                          fontWeight: 'bold', 
                          color: '#E65100',
                          fontSize: '0.8rem',
                          lineHeight: 1.2,
                          textAlign: 'center'
                        }}>
                          {item.name}
                        </Typography>
                        {selectedItems.includes(item.id) && (
                          <CheckCircleIcon sx={{ color: '#4CAF50', fontSize: 18, mt: 0.5 }} />
                        )}
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Feedback Message */}
      {showFeedback && (
        <Box sx={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: isCorrect ? 'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          zIndex: 1000,
          textAlign: 'center',
          maxWidth: '90%',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          {feedbackMessage}
        </Box>
      )}

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
                backgroundColor: piece.color,
                zIndex: 9999,
                borderRadius: '2px',
                animation: 'confettiFall 3s linear forwards',
                animationDelay: `${piece.delay}s`,
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
            Cooking Master!
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
            You completed the cooking adventure!
          </Typography>
          <Typography variant="body1" sx={{ color: '#5D4037', lineHeight: 1.4, mb: 2 }}>
            Level {currentLevel} Complete! You've mastered cooking {selectedRecipe?.name}! 🍴
            {hasNextLevel ? ' Ready for the next level?' : ' You\'re now a cooking expert!'}
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
};

export default CookingLevel5;