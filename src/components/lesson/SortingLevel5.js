import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container,
  Button,
  Dialog,
  Stack,
  LinearProgress,
  Chip,
  CardMedia,
  CircularProgress,
  TextField
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

// Import food images
import chicken from "../../assets/sortingLevel3/chicken.png";
import fish from "../../assets/sortingLevel2/fish.png";
import beef from "../../assets/sortingLevel3/steak.png";
import rice from "../../assets/sortingLevel2/rice.png";
import bread from "../../assets/sortingLevel2/bread.png";
import pasta from "../../assets/sortingLevel3/pasta.png";
import broccoli from "../../assets/sortingLevel2/broccoli.png";
import carrots from "../../assets/sortingLevel2/carrots.png";
import salad from "../../assets/sortingLevel4/salad.png";
import apple from "../../assets/sortingLevel2/apple.png";
import banana from "../../assets/sortingLevel2/banana.png";
import milk from "../../assets/sortingLevel3/milk.png";
import yogurt from "../../assets/sortingLevel3/yogurt.png";
import soda from "../../assets/sortingLevel1/soda.png";
import chips from "../../assets/sortingLevel1/potatochips.png";
import water from "../../assets/sortingLevel1/water.png";
import avocado from "../../assets/sortingLevel5/avocado.png";
import pizza from "../../assets/sortingLevel5/pizza.png";
import fries from "../../assets/sortingLevel5/fries.png";
import burger from "../../assets/sortingLevel5/burger.png";
import donut from "../../assets/sortingLevel5/donut.png";
import eggs from "../../assets/sortingLevel3/eggs.png";
import plateBg from "../../assets/sortingLevel4/platebg2.png";

export default function SortingLevel5() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [currentCase, setCurrentCase] = useState(1);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    isCorrect: false,
    message: ""
  });
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [selectedHealthyFoods, setSelectedHealthyFoods] = useState([]);
  const [selectedPlateItems, setSelectedPlateItems] = useState([]);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [mysteryFoodAnswer, setMysteryFoodAnswer] = useState({
    name: '',
    healthy: '',
    category: '',
    mealPair: ''
  });
  const [mysteryFoodCorrect, setMysteryFoodCorrect] = useState({
    name: false,
    healthy: false,
    category: false,
    mealPair: false
  });
  const [case1Completed, setCase1Completed] = useState(false);
  const [case2Completed, setCase2Completed] = useState(false);
  const [case3Completed, setCase3Completed] = useState(false);
  const [case1Progress, setCase1Progress] = useState(0);
  const [case2Progress, setCase2Progress] = useState(0);
  const [case3Progress, setCase3Progress] = useState(0);

  // Food categories for Case 3
  const categories = {
    protein: { name: "Protein", color: "#FF9AA2" },
    grains: { name: "Grains", color: "#B5EAD7" },
    veggies: { name: "Vegetables/Fruits", color: "#C7CEEA" },
    dairy: { name: "Dairy", color: "#FFDAC1" },
    fats: { name: "Healthy Fats", color: "#E2F0CB" },
    avoid: { name: "Avoid", color: "#B5B5B5" }
  };

  // All food items
  const allFoodItems = [
    // Healthy foods
    { id: 0, name: "Grilled Chicken", category: "protein", healthy: true, imageUrl: chicken },
    { id: 1, name: "Baked Fish", category: "protein", healthy: true, imageUrl: fish },
    { id: 2, name: "Lean Beef", category: "protein", healthy: true, imageUrl: beef },
    { id: 3, name: "Brown Rice", category: "grains", healthy: true, imageUrl: rice },
    { id: 4, name: "Whole Wheat Bread", category: "grains", healthy: true, imageUrl: bread },
    { id: 5, name: "Whole Grain Pasta", category: "grains", healthy: true, imageUrl: pasta },
    { id: 6, name: "Broccoli", category: "veggies", healthy: true, imageUrl: broccoli },
    { id: 7, name: "Carrots", category: "veggies", healthy: true, imageUrl: carrots },
    { id: 8, name: "Green Salad", category: "veggies", healthy: true, imageUrl: salad },
    { id: 9, name: "Apple", category: "veggies", healthy: true, imageUrl: apple },
    { id: 10, name: "Banana", category: "veggies", healthy: true, imageUrl: banana },
    { id: 11, name: "Yogurt", category: "dairy", healthy: true, imageUrl: yogurt },
    { id: 12, name: "Milk", category: "dairy", healthy: true, imageUrl: milk },
    { id: 13, name: "Water", category: "drink", healthy: true, imageUrl: water },
    { id: 16, name: "Avocado", category: "fats", healthy: true, imageUrl: avocado },
    { id: 17, name: "Eggs", category: "protein", healthy: true, imageUrl: eggs },
    
    // Unhealthy foods
    { id: 14, name: "Soda", category: "avoid", healthy: false, imageUrl: soda },
    { id: 15, name: "Chips", category: "avoid", healthy: false, imageUrl: chips },
    { id: 18, name: "Pizza", category: "avoid", healthy: false, imageUrl: pizza },
    { id: 19, name: "French Fries", category: "avoid", healthy: false, imageUrl: fries },
    { id: 20, name: "Burger", category: "avoid", healthy: false, imageUrl: burger },
    { id: 21, name: "Donut", category: "avoid", healthy: false, imageUrl: donut }
  ];

  // Case 1: Mixed healthy and unhealthy foods
  const case1Foods = [
    allFoodItems[0],  // Chicken (healthy)
    allFoodItems[14], // Soda (unhealthy)
    allFoodItems[6],  // Broccoli (healthy)
    allFoodItems[15], // Chips (unhealthy)
    allFoodItems[9],  // Apple (healthy)
    allFoodItems[18], // Pizza (unhealthy)
    allFoodItems[3],  // Brown Rice (healthy)
    allFoodItems[19], // Fries (unhealthy)
    allFoodItems[16], // Avocado (healthy)
    allFoodItems[21], // Donut (unhealthy)
    allFoodItems[7],  // Carrots (healthy)
    allFoodItems[20], // Burger (unhealthy)
    allFoodItems[10], // Banana (healthy)
    allFoodItems[14], // Soda (unhealthy)
    allFoodItems[1],  // Fish (healthy)
    allFoodItems[15], // Chips (unhealthy)
    allFoodItems[8],  // Salad (healthy)
    allFoodItems[18], // Pizza (unhealthy)
    allFoodItems[4],  // Bread (healthy)
    allFoodItems[19]  // Fries (unhealthy)
  ];

  // Case 2: Unbalanced meals with options to fix
  const case2Meals = [
    {
      id: 1,
      description: "Fix this unhealthy meal: Pizza + Fries + Soda",
      initialItems: [allFoodItems[18], allFoodItems[19], allFoodItems[14]],
      correctItems: [
        { category: "protein", count: 1 },
        { category: "veggies", count: 1 },
        { category: "grains", count: 1 }
      ],
      requiresDrink: true,
      drinkMustBeWater: true
    },
    {
      id: 2,
      description: "Fix this unhealthy meal: Burger + Fries + Soda",
      initialItems: [allFoodItems[20], allFoodItems[19], allFoodItems[14]],
      correctItems: [
        { category: "protein", count: 1 },
        { category: "veggies", count: 2 }
      ],
      requiresDrink: true
    },
    {
      id: 3,
      description: "Fix this unbalanced meal: Pasta + Bread",
      initialItems: [allFoodItems[5], allFoodItems[4]],
      correctItems: [
        { category: "grains", count: 1 },
        { category: "protein", count: 1 },
        { category: "veggies", count: 1 }
      ],
      requiresDrink: false
    },
    {
      id: 4,
      description: "Fix this unbalanced meal: Chicken + Rice + Soda",
      initialItems: [allFoodItems[0], allFoodItems[3], allFoodItems[14]],
      correctItems: [
        { category: "protein", count: 1 },
        { category: "grains", count: 1 },
        { category: "veggies", count: 1 }
      ],
      requiresDrink: true
    },
    {
      id: 5,
      description: "Fix this unbalanced meal: Donut + Banana + Milk",
      initialItems: [allFoodItems[21], allFoodItems[10], allFoodItems[12]],
      correctItems: [
        { category: "protein", count: 1 },
        { category: "grains", count: 1 },
        { category: "veggies", count: 1 }
      ],
      requiresDrink: false
    }
  ];

  // Case 3: Mystery foods to identify
  const mysteryFoods = [
    {
      id: 1,
      name: "Avocado",
      imageUrl: avocado,
      healthy: "Yes",
      category: "fats",
      mealPair: "Salad or toast"
    },
    {
      id: 2,
      name: "Eggs",
      imageUrl: eggs,
      healthy: "Yes",
      category: "protein",
      mealPair: "Whole wheat toast"
    },
    {
      id: 3,
      name: "Pizza",
      imageUrl: pizza,
      healthy: "No",
      category: "avoid",
      mealPair: "Salad (to balance)"
    },
    {
      id: 4,
      name: "Yogurt",
      imageUrl: yogurt,
      healthy: "Yes",
      category: "dairy",
      mealPair: "Berries and granola"
    },
    {
      id: 5,
      name: "Brown Rice",
      imageUrl: rice,
      healthy: "Yes",
      category: "grains",
      mealPair: "Vegetables and protein"
    }
  ];

  const [currentMysteryFood, setCurrentMysteryFood] = useState(mysteryFoods[0]);
  const [currentMeal, setCurrentMeal] = useState(case2Meals[0]);
  const [availableOptions, setAvailableOptions] = useState([]);
  const [draggableAnswers, setDraggableAnswers] = useState([]);

  const progressPercentage = ((case1Progress + case2Progress + case3Progress) / 30 * 100);

  useEffect(() => {
    if (!showLevelIntro && !gameCompleted) {
      if (currentCase === 2) {
        setCurrentMeal(case2Meals[case2Progress]);
        setSelectedPlateItems([...currentMeal.initialItems]);
        setAvailableOptions(allFoodItems.filter(item => 
          !currentMeal.initialItems.some(initItem => initItem.id === item.id)
        ));
      } else if (currentCase === 3) {
        setCurrentMysteryFood(mysteryFoods[case3Progress]);
        // Create draggable answers for the mystery food
        const answers = [
          { type: 'name', value: currentMysteryFood.name, options: [
            "Avocado", "Eggs", "Pizza", "Yogurt", "Brown Rice", "Chicken", "Fish", "Apple"
          ] },
          { type: 'healthy', value: currentMysteryFood.healthy, options: ["Yes", "No"] },
          { type: 'category', value: currentMysteryFood.category, options: [
            "Protein", "Grains", "Vegetables/Fruits", "Dairy", "Healthy Fats", "Avoid"
          ] },
          { type: 'mealPair', value: currentMysteryFood.mealPair, options: [
            "Salad or toast", "Whole wheat toast", "Salad (to balance)", 
            "Berries and granola", "Vegetables and protein", "Nothing (avoid)"
          ] }
        ];
        setDraggableAnswers(answers);
        setMysteryFoodAnswer({
          name: '',
          healthy: '',
          category: '',
          mealPair: ''
        });
        setMysteryFoodCorrect({
          name: false,
          healthy: false,
          category: false,
          mealPair: false
        });
      }
    }
  }, [currentCase, case2Progress, case3Progress, showLevelIntro, gameCompleted]);

  const getStudentId = () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId || studentId === 'null') {
      console.error('No student ID found');
      return null;
    }
    return parseInt(studentId, 10);
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
  };

  const handleHealthyFoodClick = (item) => {
    if (submitted || case1Completed) return;
    
    // Check if the food is already selected
    if (selectedHealthyFoods.some(selected => selected.id === item.id)) {
      return;
    }
    
    // Only allow healthy foods to be selected
    if (item.healthy) {
      setSelectedHealthyFoods(prev => [...prev, item]);
      setCase1Progress(prev => prev + 1);
      
      // Check if 10 healthy foods have been selected
      if (selectedHealthyFoods.length + 1 >= 10) {
        setCase1Completed(true);
        setFeedbackData({
          isCorrect: true,
          message: "Great job! You've identified all the healthy foods. Ready for the next case?"
        });
        setShowFeedback(true);
      }
    }
  };

  const handlePlateDrop = (e) => {
    e.preventDefault();
    if (submitted || case2Completed) return;
    
    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    // Don't allow drinks on plate
    if (item.category === "drink") return;
    
    // Check if item is already selected
    if (selectedPlateItems.some(selected => selected.id === item.id)) {
      return;
    }
    
    setSelectedPlateItems(prev => [...prev, item]);
  };

  const handleDrinkDrop = (e) => {
    e.preventDefault();
    if (submitted || case2Completed) return;
    
    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    // Only allow drinks in drink area
    if (item.category !== "drink") return;

    if (currentMeal.drinkMustBeWater && item.name !== "Water") return;
    
    setSelectedDrink(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removePlateItem = (index) => {
    if (submitted || case2Completed) return;
    setSelectedPlateItems(prev => prev.filter((_, i) => i !== index));
  };

  const removeDrink = () => {
    if (submitted || case2Completed) return;
    setSelectedDrink(null);
  };

  const checkMeal = () => {
    if (selectedPlateItems.length === 0) return;
    
    setSubmitted(true);
    
    // Count selected items by category
    const selectedCounts = {};
    selectedPlateItems.forEach(item => {
      selectedCounts[item.category] = (selectedCounts[item.category] || 0) + 1;
    });
    
    // Check against meal requirements
    let correct = true;
    let feedbackMessage = "";
    
    // Check for any avoid items on plate
    if (selectedPlateItems.some(item => item.category === "avoid")) {
      correct = false;
      feedbackMessage = "You still have unhealthy items to avoid! Try again.";
    } 
    // Check drink requirements
    else if (currentMeal.requiresDrink && !selectedDrink) {
      correct = false;
      feedbackMessage = "Don't forget to include a drink!";
    }
    else if (currentMeal.drinkMustBeWater && selectedDrink?.name !== "Water") {
      correct = false;
      feedbackMessage = "This meal should be paired with water!";
    }
    // Check each required category
    else {
      for (const req of currentMeal.correctItems) {
        const selected = selectedCounts[req.category] || 0;
        
        if (selected < req.count) {
          correct = false;
          feedbackMessage = `Almost! Remember to include more ${req.category}.`;
          break;
        }
      }
    }
    
    if (correct) {
      feedbackMessage = "Perfect! You've balanced this meal.";
      setCase2Progress(prev => prev + 1);
      
      // Check if all meals are fixed
      if (case2Progress + 1 >= case2Meals.length) {
        setCase2Completed(true);
      }
    }
    
    setFeedbackData({
      isCorrect: correct,
      message: feedbackMessage
    });
    setShowFeedback(true);
  };

  const handleAnswerDrop = (e, field) => {
    e.preventDefault();
    const answer = e.dataTransfer.getData('text/plain');
    setMysteryFoodAnswer(prev => ({
      ...prev,
      [field]: answer
    }));
  };

  const checkMysteryFood = () => {
    const correct = {
      name: mysteryFoodAnswer.name === currentMysteryFood.name,
      healthy: mysteryFoodAnswer.healthy === currentMysteryFood.healthy,
      category: mysteryFoodAnswer.category === currentMysteryFood.category,
      mealPair: mysteryFoodAnswer.mealPair === currentMysteryFood.mealPair
    };
    
    setMysteryFoodCorrect(correct);
    
    const correctCount = Object.values(correct).filter(Boolean).length;
    const newScore = score + correctCount;
    setScore(newScore);
    setCase3Progress(prev => prev + 1);
    
    setFeedbackData({
      isCorrect: correctCount > 2,
      message: `You got ${correctCount} out of 4 correct! ${correctCount > 2 ? "Great job!" : "Try again next time!"}`
    });
    
    // Check if all mystery foods are done
    if (case3Progress + 1 >= mysteryFoods.length) {
      setCase3Completed(true);
    }
    
    setShowFeedback(true);
  };

  const handleNextCase = () => {
    setShowFeedback(false);
    
    if (currentCase < 3) {
      setCurrentCase(prev => prev + 1);
      setSubmitted(false);
      setSelectedHealthyFoods([]);
      setSelectedPlateItems([]);
      setSelectedDrink(null);
    } else {
      setGameCompleted(true);
      setShowSuccess(true);
      saveProgress();
    }
  };

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;
    
    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      if (!studentId || !lessonId) return;

      const progressData = {
        studentId,
        lessonId: parseInt(lessonId, 10),
        score,
        maxScore: 20, // 5 foods * 4 points each
        completed: true,
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

  const resetGame = () => {
    setCurrentCase(1);
    setScore(0);
    setGameCompleted(false);
    setShowFeedback(false);
    setShowSuccess(false);
    setProgressSaved(false);
    setSelectedHealthyFoods([]);
    setSelectedPlateItems([]);
    setSelectedDrink(null);
    setCase1Completed(false);
    setCase2Completed(false);
    setCase3Completed(false);
    setCase1Progress(0);
    setCase2Progress(0);
    setCase3Progress(0);
    setShowLevelIntro(true);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  const handleContinue = () => {
    navigate('/homepage');
  };

  const getStarRating = () => {
    const percentage = (score / 20) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Calculate positions for plate sections
  const getPlatePosition = (index, total) => {
    const angle = (index / total) * Math.PI * 2;
    const radius = 120;
    const centerX = 200;
    const centerY = 200;
    
    return {
      x: centerX + radius * Math.cos(angle) - 40,
      y: centerY + radius * Math.sin(angle) - 40
    };
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      display: "flex",
      flexDirection: "column"
    }}>
      <Navbar />
      
      {/* Level Introduction Dialog */}
      {showLevelIntro && (
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
            🕵️‍♀️ The Nutrition Detective 🕵️‍♂️
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
            Use all your nutrition knowledge to solve these food mysteries!
          </Typography>
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            p: 4,
            mb: 4,
            maxWidth: '800px'
          }}>
            <Typography variant="h5" sx={{ 
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              mb: 2,
              textAlign: 'center'
            }}>
              Cases to Solve:
            </Typography>
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 2
            }}>
              <Chip 
                label="Case 1: Sort the Evidence"
                sx={{ 
                  backgroundColor: '#FF9AA2',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  p: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <Chip 
                label="Case 2: Fix the Unhealthy Meal"
                sx={{ 
                  backgroundColor: '#B5EAD7',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  p: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
              <Chip 
                label="Case 3: The Mystery Food"
                sx={{ 
                  backgroundColor: '#C7CEEA',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  p: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}
              />
            </Box>
          </Box>
          <Button 
            variant="contained"
            onClick={() => setShowLevelIntro(false)}
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
            <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>🕵️‍♀️</span>
            Start Investigating!
          </Button>
        </Box>
      )}

      {/* Main Game Content */}
      {!showLevelIntro && (
        <Container maxWidth="xl" sx={{ py: 1, flex: 1 }}>
          {/* Progress Section */}
          <Box mb={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ maxWidth: '600px', mx: 'auto' }}>
              <Typography variant="body1" sx={{ 
                color: '#280B60', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: 'rgba(255, 250, 244, 0.85)',
                px: 2,
                py: 1,
                borderRadius: '10px'
              }}>
                Case {currentCase}: {currentCase === 1 ? "Sort the Evidence" : currentCase === 2 ? "Fix the Meal" : "Mystery Food"}
              </Typography>
              <Chip 
                label={`Score: ${score}/20`} 
                sx={{
                  backgroundColor: '#FF595E',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '15px'
                }}
              />
            </Stack>
            <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ 
                  height: 8, 
                  borderRadius: '10px',
                  backgroundColor: 'rgba(40, 11, 96, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: '10px',
                    backgroundColor: '#90BE6D'
                  }
                }} 
              />
            </Box>
          </Box>

          {/* Case 1: Sort the Evidence */}
          {currentCase === 1 && !case1Completed && (
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" sx={{ 
                color: '#280B60', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: 'rgba(255, 250, 244, 0.85)',
                display: 'inline-block',
                px: 3,
                py: 1.5,
                borderRadius: '15px',
                fontSize: '1.1rem',
                maxWidth: '800px',
                mx: 'auto'
              }}>
                Find and select 10 healthy foods hidden among unhealthy options
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#280B60', 
                fontFamily: 'Poppins, sans-serif',
                mt: 2
              }}>
                Selected: {selectedHealthyFoods.length}/10
              </Typography>
              
              {/* Food Grid */}
              <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 3,
                mt: 4,
                px: 2
              }}>
                {case1Foods.map((item, index) => (
                  <Box 
                    key={`${item.id}-${index}`}
                    onClick={() => handleHealthyFoodClick(item)}
                    sx={{
                      cursor: 'pointer',
                      opacity: selectedHealthyFoods.some(selected => selected.id === item.id) ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={item.imageUrl}
                      alt={item.name}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        objectFit: 'contain',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}
                    />
                    <Typography variant="body2" sx={{ 
                      textAlign: 'center', 
                      mt: 1,
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 'bold',
                      color: '#280B60'
                    }}>
                      {item.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Case 2: Fix the Unhealthy Meal */}
          {currentCase === 2 && !case2Completed && (
            <Box sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              pt: 1,
              mb: 4,
              gap: 4
            }}>
              {/* Instructions */}
              <Box sx={{ 
                mb: 3,
                textAlign: 'center',
                width: '100%'
              }}>
                <Typography variant="body1" sx={{ 
                  color: '#280B60', 
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: 'rgba(255, 250, 244, 0.85)',
                  display: 'inline-block',
                  px: 3,
                  py: 1.5,
                  borderRadius: '15px',
                  fontSize: '1.1rem',
                  maxWidth: '800px',
                  mx: 'auto'
                }}>
                  {currentMeal.description}
                </Typography>
              </Box>

              {/* Available Ingredients */}
              <Box sx={{ 
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                flexWrap: 'wrap',
                mb: 4,
                px: 2,
                maxWidth: '1000px'
              }}>
                {availableOptions.map((item, index) => (
                  <Box 
                    key={`${item.id}-${index}`}
                    draggable={!submitted}
                    onDragStart={(e) => handleDragStart(e, item)}
                    sx={{
                      cursor: !submitted ? 'grab' : 'default',
                      opacity: selectedPlateItems.some(selected => selected.id === item.id) || 
                              (selectedDrink?.id === item.id) ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: !submitted ? 'scale(1.05)' : 'none'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={item.imageUrl}
                      alt={item.name}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        objectFit: 'contain',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                      }}
                    />
                    <Typography variant="body2" sx={{ 
                      textAlign: 'center', 
                      mt: 1,
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 'bold',
                      color: '#280B60'
                    }}>
                      {item.name}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Plate and Drink Area */}
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                gap: 4
              }}>
                {/* Plate Drop Zone */}
                <Box 
                  onDrop={handlePlateDrop}
                  onDragOver={handleDragOver}
                  sx={{
                    backgroundImage: `url(${plateBg})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    width: '400px',
                    height: '400px',
                    position: 'relative',
                    border: '4px dashed rgba(40, 11, 96, 0.3)',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: !submitted ? 'rgba(40, 11, 96, 0.6)' : 'rgba(40, 11, 96, 0.3)'
                    }
                  }}
                >
                  {/* Selected items on plate - arranged in plate sections */}
                  {selectedPlateItems.map((item, index) => {
                    // Calculate position based on plate sections
                    let position;
                    if (item.category === "protein") {
                      position = getPlatePosition(0, 4); // Left quarter
                    } else if (item.category === "grains") {
                      position = getPlatePosition(1, 4); // Right quarter
                    } else {
                      // Veggies go in bottom half (spread out)
                      const veggieIndex = selectedPlateItems.filter(i => i.category === "veggies").findIndex(i => i.id === item.id);
                      position = getPlatePosition(2 + (veggieIndex * 0.5), 4);
                    }
                    
                    return (
                      <Box 
                        key={`selected-${index}`}
                        sx={{
                          position: 'absolute',
                          width: '80px',
                          height: '80px',
                          left: `${position.x}px`,
                          top: `${position.y}px`,
                          cursor: !submitted ? 'pointer' : 'default',
                          '&:hover': {
                            transform: !submitted ? 'scale(1.1)' : 'none'
                          }
                        }}
                        onClick={() => removePlateItem(index)}
                      >
                        <CardMedia
                          component="img"
                          image={item.imageUrl}
                          alt={item.name}
                          sx={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain',
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>

                {/* Drink Drop Zone */}
                <Box 
                  onDrop={handleDrinkDrop}
                  onDragOver={handleDragOver}
                  sx={{
                    width: '150px',
                    height: '150px',
                    backgroundColor: 'rgba(226, 240, 203, 0.5)',
                    border: '4px dashed rgba(40, 11, 96, 0.3)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: !submitted ? 'rgba(40, 11, 96, 0.6)' : 'rgba(40, 11, 96, 0.3)'
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 'bold',
                    color: '#280B60',
                    mb: 1
                  }}>
                    Drink Here
                  </Typography>
                  {selectedDrink && (
                    <Box 
                      sx={{
                        width: '80px',
                        height: '80px',
                        cursor: !submitted ? 'pointer' : 'default',
                        '&:hover': {
                          transform: !submitted ? 'scale(1.1)' : 'none'
                        }
                      }}
                      onClick={removeDrink}
                    >
                      <CardMedia
                        component="img"
                        image={selectedDrink.imageUrl}
                        alt={selectedDrink.name}
                        sx={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain',
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Check Button */}
              <Button
                variant="contained"
                onClick={checkMeal}
                disabled={selectedPlateItems.length === 0 || submitted}
                sx={{
                  background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  padding: '16px 32px',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(25, 130, 196, 0.4)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(25, 130, 196, 0.6)',
                    background: 'linear-gradient(135deg, #3A9BD4 0%, #1568A0 100%)'
                  },
                  '&:disabled': {
                    background: '#B5B5B5',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                <span style={{ fontSize: '1.8rem', marginRight: '12px' }}>✅</span>
                Check My Meal
              </Button>
            </Box>
          )}

          {/* Case 3: The Mystery Food */}
          {currentCase === 3 && !case3Completed && (
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              mt: 4
            }}>
              <Typography variant="h5" sx={{ 
                color: '#280B60', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: 'rgba(255, 250, 244, 0.85)',
                px: 3,
                py: 1.5,
                borderRadius: '15px',
                fontSize: '1.1rem',
                maxWidth: '800px',
                textAlign: 'center'
              }}>
                Identify this mystery food by answering the questions below
              </Typography>
              
              {/* Mystery Food Image */}
              <Box sx={{ 
                width: '200px',
                height: '200px',
                border: '4px solid #280B60',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
              }}>
                <CardMedia
                  component="img"
                  image={currentMysteryFood.imageUrl}
                  alt="Mystery Food"
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                />
              </Box>
              
              {/* Answer Drop Zones */}
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
                width: '100%',
                maxWidth: '800px'
              }}>
                <Box 
                  onDrop={(e) => handleAnswerDrop(e, 'name')}
                  onDragOver={handleDragOver}
                  sx={{
                    p: 2,
                    border: '2px dashed #280B60',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 250, 244, 0.7)',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 'bold',
                    color: '#280B60',
                    mb: 1
                  }}>
                    What is this food?
                  </Typography>
                  {mysteryFoodAnswer.name ? (
                    <Chip 
                      label={mysteryFoodAnswer.name}
                      sx={{ 
                        backgroundColor: mysteryFoodCorrect.name ? '#90BE6D' : '#FF595E',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: '#280B60' }}>
                      Drop answer here
                    </Typography>
                  )}
                </Box>
                
                <Box 
                  onDrop={(e) => handleAnswerDrop(e, 'healthy')}
                  onDragOver={handleDragOver}
                  sx={{
                    p: 2,
                    border: '2px dashed #280B60',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 250, 244, 0.7)',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 'bold',
                    color: '#280B60',
                    mb: 1
                  }}>
                    Is this food healthy?
                  </Typography>
                  {mysteryFoodAnswer.healthy ? (
                    <Chip 
                      label={mysteryFoodAnswer.healthy}
                      sx={{ 
                        backgroundColor: mysteryFoodCorrect.healthy ? '#90BE6D' : '#FF595E',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: '#280B60' }}>
                      Drop answer here
                    </Typography>
                  )}
                </Box>
                
                <Box 
                  onDrop={(e) => handleAnswerDrop(e, 'category')}
                  onDragOver={handleDragOver}
                  sx={{
                    p: 2,
                    border: '2px dashed #280B60',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 250, 244, 0.7)',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 'bold',
                    color: '#280B60',
                    mb: 1
                  }}>
                    Which food group does it belong to?
                  </Typography>
                  {mysteryFoodAnswer.category ? (
                    <Chip 
                      label={mysteryFoodAnswer.category}
                      sx={{ 
                        backgroundColor: mysteryFoodCorrect.category ? '#90BE6D' : '#FF595E',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: '#280B60' }}>
                      Drop answer here
                    </Typography>
                  )}
                </Box>
                
                <Box 
                  onDrop={(e) => handleAnswerDrop(e, 'mealPair')}
                  onDragOver={handleDragOver}
                  sx={{
                    p: 2,
                    border: '2px dashed #280B60',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 250, 244, 0.7)',
                    minHeight: '80px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body1" sx={{ 
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 'bold',
                    color: '#280B60',
                    mb: 1
                  }}>
                    What would you pair it with in a meal?
                  </Typography>
                  {mysteryFoodAnswer.mealPair ? (
                    <Chip 
                      label={mysteryFoodAnswer.mealPair}
                      sx={{ 
                        backgroundColor: mysteryFoodCorrect.mealPair ? '#90BE6D' : '#FF595E',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: '#280B60' }}>
                      Drop answer here
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {/* Draggable Answers */}
              <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 2,
                mt: 3,
                maxWidth: '800px'
              }}>
                {draggableAnswers.map((answerSet, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ 
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 'bold',
                      color: '#280B60',
                      textAlign: 'center',
                      mb: 1
                    }}>
                      {answerSet.type === 'name' ? 'Food Names' : 
                       answerSet.type === 'healthy' ? 'Healthy?' : 
                       answerSet.type === 'category' ? 'Categories' : 'Meal Pairs'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                      {answerSet.options.map((option, i) => (
                        <Box 
                          key={`${answerSet.type}-${i}`}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', option)}
                          sx={{
                            p: 1,
                            backgroundColor: '#1982C4',
                            color: 'white',
                            borderRadius: '5px',
                            cursor: 'grab',
                            '&:hover': {
                              backgroundColor: '#1568A0'
                            }
                          }}
                        >
                          {option}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
              
              {/* Check Answers Button */}
              <Button
                variant="contained"
                onClick={checkMysteryFood}
                disabled={!mysteryFoodAnswer.name || !mysteryFoodAnswer.healthy || 
                          !mysteryFoodAnswer.category || !mysteryFoodAnswer.mealPair}
                sx={{
                  background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  padding: '16px 32px',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(25, 130, 196, 0.4)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(25, 130, 196, 0.6)',
                    background: 'linear-gradient(135deg, #3A9BD4 0%, #1568A0 100%)'
                  },
                  '&:disabled': {
                    background: '#B5B5B5',
                    transform: 'none',
                    boxShadow: 'none'
                  }
                }}
              >
                <span style={{ fontSize: '1.8rem', marginRight: '12px' }}>🔍</span>
                Check Answers
              </Button>
            </Box>
          )}

          {/* Case Completion Messages */}
          {currentCase === 1 && case1Completed && (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <Typography variant="h4" sx={{ 
                color: '#280B60', 
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                mb: 3
              }}>
                Case 1 Complete! 🎉
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#280B60', 
                fontFamily: 'Inter, sans-serif',
                mb: 4
              }}>
                You successfully identified all the healthy foods!
              </Typography>
              <Button
                variant="contained"
                onClick={handleNextCase}
                sx={{
                  background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  padding: '16px 32px',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(25, 130, 196, 0.4)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(25, 130, 196, 0.6)',
                    background: 'linear-gradient(135deg, #3A9BD4 0%, #1568A0 100%)'
                  }
                }}
              >
                Continue to Case 2
              </Button>
            </Box>
          )}

          {currentCase === 2 && case2Completed && (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <Typography variant="h4" sx={{ 
                color: '#280B60', 
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                mb: 3
              }}>
                Case 2 Complete! 🎉
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#280B60', 
                fontFamily: 'Inter, sans-serif',
                mb: 4
              }}>
                You successfully fixed all the unhealthy meals!
              </Typography>
              <Button
                variant="contained"
                onClick={handleNextCase}
                sx={{
                  background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  padding: '16px 32px',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(25, 130, 196, 0.4)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(25, 130, 196, 0.6)',
                    background: 'linear-gradient(135deg, #3A9BD4 0%, #1568A0 100%)'
                  }
                }}
              >
                Continue to Case 3
              </Button>
            </Box>
          )}

          {currentCase === 3 && case3Completed && (
            <Box sx={{ textAlign: 'center', mt: 10 }}>
              <Typography variant="h4" sx={{ 
                color: '#280B60', 
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 'bold',
                mb: 3
              }}>
                All Cases Complete! 🎉
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#280B60', 
                fontFamily: 'Inter, sans-serif',
                mb: 4
              }}>
                You've solved all the nutrition mysteries!
              </Typography>
              <Button
                variant="contained"
                onClick={handleNextCase}
                sx={{
                  background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  padding: '16px 32px',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(25, 130, 196, 0.4)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(25, 130, 196, 0.6)',
                    background: 'linear-gradient(135deg, #3A9BD4 0%, #1568A0 100%)'
                  }
                }}
              >
                View Results
              </Button>
            </Box>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 4 }}>
            <Button 
              variant="contained"
              onClick={resetGame}
              sx={{ 
                background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                color: 'white',
                px: 5,
                py: 1.5,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(255, 89, 94, 0.4)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  transform: 'scale(1.05) translateY(-3px)',
                  boxShadow: '0 12px 30px rgba(255, 89, 94, 0.6)',
                  background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)'
                }
              }}
            >
              <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🔄</span>
              Start Over
            </Button>
            <Button 
              variant="contained"
              onClick={handleGoHome}
              sx={{ 
                background: 'linear-gradient(135deg, #8AC926 0%, #6AA120 100%)',
                color: 'white',
                px: 5,
                py: 1.5,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(138, 201, 38, 0.4)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  transform: 'scale(1.05) translateY(-3px)',
                  boxShadow: '0 12px 30px rgba(138, 201, 38, 0.6)',
                  background: 'linear-gradient(135deg, #9CDE3F 0%, #6AA120 100%)'
                }
              }}
            >
              <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🏠</span>
              Go Home
            </Button>
          </Stack>
        </Container>
      )}

      {/* Feedback Dialog */}
      <Dialog
        open={showFeedback}
        fullScreen
        PaperProps={{
          sx: { 
            background: feedbackData?.isCorrect 
              ? 'linear-gradient(135deg, rgba(144, 190, 109, 0.8) 0%, rgba(123, 160, 91, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(255, 89, 94, 0.8) 0%, rgba(224, 69, 73, 0.8) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{
          textAlign: 'center',
          color: 'white'
        }}>
          <CheckCircleIcon sx={{ 
            fontSize: 150,
            color: 'white',
            mb: 4
          }} />
          <Typography variant="h1" sx={{ 
            fontWeight: 'bold',
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontSize: { xs: '3rem', md: '5rem' },
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            mb: 4
          }}>
            {feedbackData?.isCorrect ? 'Great job!' : 'Good try!'}
          </Typography>
          <Typography variant="h3" sx={{ 
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            mb: 6,
            maxWidth: '800px',
            lineHeight: 1.4
          }}>
            {feedbackData?.message}
          </Typography>
          <Button 
            onClick={handleNextCase} 
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              px: 8,
              py: 3,
              borderRadius: '25px',
              fontSize: '1.8rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              textTransform: 'none',
              boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              '&:hover': {
                transform: 'scale(1.05) translateY(-5px)',
                boxShadow: '0 15px 35px rgba(255, 89, 94, 0.7)'
              }
            }}
          >
            <span style={{ fontSize: '2rem', marginRight: '12px' }}>
              {currentCase < 3 ? '➡️' : '🏁'}
            </span>
            {currentCase < 3 ? 'Continue' : 'Finish'}
          </Button>
        </Box>
      </Dialog>

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
          textAlign: 'center',
          color: 'white'
        }}>
          <EmojiEventsIcon sx={{ 
            fontSize: 150,
            color: 'white',
            mb: 4
          }} />
          <Typography variant="h1" sx={{ 
            fontWeight: 'bold',
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontSize: { xs: '2rem', md: '3rem' },
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            mb: 2
          }}>
            Module Complete!
          </Typography>
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
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold',
            color: 'white',
            mb: 3,
            fontFamily: 'Poppins, sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Score: {score}/20
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
            mb: 6,
            maxWidth: '800px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Congratulations, Detective! You've mastered all the nutrition challenges.
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
          
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            <Button 
              onClick={() => {
                setShowSuccess(false);
                resetGame();
              }} 
              variant="outlined"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                px: 6,
                py: 3,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.5rem',
                borderWidth: '3px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🔄</span>
              Play Again
            </Button>
            <Button 
              variant="contained"
              onClick={handleContinue}
              disabled={progressSaving}
              sx={{ 
                background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                color: 'white',
                px: 6,
                py: 3,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.5rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)'
                }
              }}
            >
              <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>✅</span>
              {progressSaving ? 'Saving...' : 'Continue'}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
}