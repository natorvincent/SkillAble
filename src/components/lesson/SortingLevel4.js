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
  CircularProgress
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
import plateBg from "../../assets/sortingLevel4/platebg2.png";

export default function SortingLevel4() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
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
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Food categories
  const categories = {
    protein: { name: "Protein", portion: "1/4", color: "#FF9AA2" },
    grains: { name: "Grains", portion: "1/4", color: "#B5EAD7" },
    veggies: { name: "Vegetables/Fruits", portion: "1/2", color: "#C7CEEA" },
    dairy: { name: "Dairy", portion: "Side", color: "#FFDAC1" },
    drink: { name: "Drink", portion: "Side", color: "#E2F0CB" },
    avoid: { name: "Avoid", portion: "", color: "#B5B5B5" }
  };

  // All food items
  const allFoodItems = [
    // Proteins
    { id: 0, name: "Grilled Chicken", category: "protein", imageUrl: chicken },
    { id: 1, name: "Baked Fish", category: "protein", imageUrl: fish },
    { id: 2, name: "Lean Beef", category: "protein", imageUrl: beef },
    
    // Grains
    { id: 3, name: "Brown Rice", category: "grains", imageUrl: rice },
    { id: 4, name: "Whole Wheat Bread", category: "grains", imageUrl: bread },
    { id: 5, name: "Whole Grain Pasta", category: "grains", imageUrl: pasta },
    
    // Vegetables/Fruits
    { id: 6, name: "Broccoli", category: "veggies", imageUrl: broccoli },
    { id: 7, name: "Carrots", category: "veggies", imageUrl: carrots },
    { id: 8, name: "Green Salad", category: "veggies", imageUrl: salad },
    { id: 9, name: "Apple", category: "veggies", imageUrl: apple },
    { id: 10, name: "Banana", category: "veggies", imageUrl: banana },
    
    // Dairy
    { id: 11, name: "Yogurt", category: "dairy", imageUrl: yogurt },
    { id: 12, name: "Milk", category: "drink", imageUrl: milk },
    
    // Drinks
    { id: 13, name: "Water", category: "drink", imageUrl: water },
    
    // Items to avoid
    { id: 14, name: "Soda", category: "avoid", imageUrl: soda },
    { id: 15, name: "Chips", category: "avoid", imageUrl: chips }
  ];

  // Preset item combinations for each recipe (4 correct, 2 incorrect)
  const recipeItems = [
    // Recipe 1: Protein, grains, veggies, dairy
    [
      allFoodItems[0],  // Chicken (protein)
      allFoodItems[4],  // Bread (grains)
      allFoodItems[7],  // Carrots (veggies)
      allFoodItems[10], // Banana (veggies)
      allFoodItems[12], // Milk (dairy)
      allFoodItems[15]  // Soda (avoid)
    ],
    // Recipe 2: Protein, grains, veggies, water
    [
      allFoodItems[1],  // Fish (protein)
      allFoodItems[13], // Water (drink)
      allFoodItems[5],  // Pasta (grains)
      allFoodItems[6],  // Broccoli (veggies)
      allFoodItems[9],  // Apple (veggies)
      allFoodItems[15]  // Chips (avoid)
    ],
    // Recipe 3: Protein, grains, veggies
    [
      allFoodItems[14], // Soda (avoid)  
      allFoodItems[2],  // Beef (protein)
      allFoodItems[3],  // Rice (grains)
      allFoodItems[8],  // Salad (veggies)
      allFoodItems[15],  // Chips (avoid)
      allFoodItems[10] // Banana (veggies)
     
      
    ],
    // Recipe 4: Protein, grains, veggies (avoid unhealthy)
    [
      allFoodItems[0],  // Chicken (protein)
      allFoodItems[4],  // Bread (grains)
      allFoodItems[15],  // Chips (avoid)
      allFoodItems[14], // Soda (avoid)
      allFoodItems[7],  // Carrots (veggies)
      allFoodItems[10] // Banana (veggies)
      
    ],
    // Recipe 5: Protein, grains, veggies, dairy
    [
      allFoodItems[15],  // Chips (avoid)
      allFoodItems[9],  // Apple (veggies)
      allFoodItems[1],  // Fish (protein)
      allFoodItems[5],  // Pasta (grains)
      allFoodItems[6],  // Broccoli (veggies)
      allFoodItems[11] // Yogurt (dairy)
      
    ]
  ];

  // Recipe templates (5 different balanced meal combinations)
  const recipes = [
    {
      id: 1,
      description: "Build a balanced plate with: 1/4 protein, 1/4 grains, 1/2 vegetables/fruits, and a side of dairy",
      correctItems: [
        { category: "protein", count: 1 },
        { category: "grains", count: 1 },
        { category: "veggies", count: 2 }
      ],
      requiresDrink: true
    },
    {
      id: 2,
      description: "Build a balanced plate with: 1/4 protein, 1/4 grains, 1/2 vegetables/fruits, and water",
      correctItems: [
        { category: "protein", count: 1 },
        { category: "grains", count: 1 },
        { category: "veggies", count: 2 }
      ],
      requiresDrink: true,
      drinkMustBeWater: true
    },
    {
      id: 3,
      description: "Build a balanced plate with: 1/4 protein, 1/4 grains, 1/2 vegetables/fruits",
      correctItems: [
        { category: "protein", count: 1 },
        { category: "grains", count: 1 },
        { category: "veggies", count: 2 }
      ],
      requiresDrink: false
    },
    {
      id: 4,
      description: "Build a balanced plate with: 1/4 protein, 1/4 grains, 1/2 vegetables/fruits, and avoid unhealthy options",
      correctItems: [
        { category: "protein", count: 1 },
        { category: "grains", count: 1 },
        { category: "veggies", count: 2 }
      ],
      requiresDrink: false,
      avoidItems: true
    },
    {
      id: 5,
      description: "Build a balanced plate with: 1/4 protein, 1/4 grains, 1/2 vegetables/fruits, and dairy",
      correctItems: [
        { category: "protein", count: 1 },
        { category: "grains", count: 1 },
        { category: "dairy", count: 1 },
        { category: "veggies", count: 2 }

      ],
      requiresDrink: false,
      requiresDairy: true
    }
  ];

  const [currentItems, setCurrentItems] = useState([]);
  const currentRecipe = recipes[currentRecipeIndex];
  const progressPercentage = ((currentRecipeIndex + (gameCompleted ? 1 : 0)) / recipes.length * 100);

  useEffect(() => {
    if (!showLevelIntro && !gameCompleted) {
      setCurrentItems(recipeItems[currentRecipeIndex]);
      setSelectedItems([]);
      setSelectedDrink(null);
      setSubmitted(false);
    }
  }, [currentRecipeIndex, showLevelIntro, gameCompleted]);

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

  const handlePlateDrop = (e) => {
    e.preventDefault();
    if (submitted) return;
    
    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    // Don't allow drinks on plate
    if (item.category === "drink") return;
    
    // Check if item is already selected
    if (selectedItems.some(selected => selected.id === item.id)) {
      return;
    }
    
    setSelectedItems(prev => [...prev, item]);
  };

  const handleDrinkDrop = (e) => {
    e.preventDefault();
    if (submitted) return;
    
    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    // Only allow drinks in drink area
    if (item.category !== "drink") return;

    // Remove this condition to allow any drink, not just water
    //if (currentRecipe.drinkMustBeWater && item.name !== "Water") return;
    
    setSelectedDrink(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeItem = (index) => {
    if (submitted) return;
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const removeDrink = () => {
    if (submitted) return;
    setSelectedDrink(null);
  };

  const checkRecipe = () => {
    if (selectedItems.length === 0) return;
    
    setSubmitted(true);
    
    // Count selected items by category
    const selectedCounts = {};
    selectedItems.forEach(item => {
      selectedCounts[item.category] = (selectedCounts[item.category] || 0) + 1;
    });
    
    // Check against recipe requirements
    let correct = true;
    let feedbackMessage = "";
    
    // Check for any avoid items on plate
    if (selectedItems.some(item => item.category === "avoid")) {
      correct = false;
      feedbackMessage = "You included unhealthy items to avoid! Try again.";
    } 
    // Check drink requirements
    else if (currentRecipe.requiresDrink && !selectedDrink) {
      correct = false;
      feedbackMessage = "Don't forget to include a drink!";
    }
    else if (currentRecipe.drinkMustBeWater && selectedDrink?.name !== "Water") {
      correct = false;
      feedbackMessage = "This meal should be paired with water!";
    }
    // Check dairy requirements
    else if (currentRecipe.requiresDairy && !selectedItems.some(item => item.category === "dairy")) {
      correct = false;
      feedbackMessage = "This meal requires a dairy item!";
    }
    // Check each required category
    else {
      for (const req of currentRecipe.correctItems) {
        const selected = selectedCounts[req.category] || 0;
        
        if (selected !== req.count) {
          correct = false;
          
          if (req.category === "veggies") {
            feedbackMessage = `Almost! Remember vegetables/fruits should be half your plate (2 items).`;
          } else {
            feedbackMessage = `Good try! Remember to include more food on your plate.`;
          }
          break;
        }
      }
      
      // Check for extra unnecessary items
      const totalSelected = Object.values(selectedCounts).reduce((a, b) => a + b, 0);
      const totalRequired = currentRecipe.correctItems.reduce((a, b) => a + b.count, 0);
      
      if (correct && totalSelected !== totalRequired) {
        correct = false;
        feedbackMessage = "You have the right items but too many portions!";
      }
    }
    
    if (correct) {
      feedbackMessage = "Perfect! You created a balanced plate.";
      setScore(prev => prev + 1);
    }
    
    setFeedbackData({
      isCorrect: correct,
      message: feedbackMessage
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    
    if (currentRecipeIndex < recipes.length - 1) {
      setCurrentRecipeIndex(prev => prev + 1);
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
        maxScore: recipes.length,
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
    setCurrentRecipeIndex(0);
    setScore(0);
    setGameCompleted(false);
    setShowFeedback(false);
    setShowSuccess(false);
    setProgressSaved(false);
    setSelectedItems([]);
    setSelectedDrink(null);
    setShowLevelIntro(true);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  const handleContinue = () => {
    navigate('/homepage');
  };

  const getStarRating = () => {
    const percentage = (score / recipes.length) * 100;
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
            🍽️ Balanced Plate Challenge 🥗
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
            Learn to create balanced meals using the MyPlate model!
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
              The MyPlate Model:
            </Typography>
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 2
            }}>
              {Object.entries(categories).map(([key, category]) => {
                if (key === 'avoid') return null;
                return (
                  <Chip 
                    key={key}
                    label={`${category.portion} ${category.name}`}
                    sx={{ 
                      backgroundColor: category.color,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      p: 2,
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  />
                );
              })}
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
            <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>🍽️</span>
            Let's Build Plates!
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
                Recipe {currentRecipeIndex + 1} of {recipes.length}
              </Typography>
              <Chip 
                label={`Score: ${score}/${recipes.length}`} 
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

          {/* Instructions */}
          <Box sx={{ 
            mb: 3,
            textAlign: 'center'
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
              {currentRecipe.description}
            </Typography>
          </Box>

          {/* Game Area */}
          {!gameCompleted && (
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
                {currentItems.map((item, index) => (
                  <Box 
                    key={`${item.id}-${index}`}
                    draggable={!submitted}
                    onDragStart={(e) => handleDragStart(e, item)}
                    sx={{
                      cursor: !submitted ? 'grab' : 'default',
                      opacity: selectedItems.some(selected => selected.id === item.id) || 
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
                  {selectedItems.map((item, index) => {
                    // Calculate position based on plate sections
                    let position;
                    if (item.category === "protein") {
                      position = getPlatePosition(0, 4); // Left quarter
                    } else if (item.category === "grains") {
                      position = getPlatePosition(1, 4); // Right quarter
                    } else {
                      // Veggies go in bottom half (spread out)
                      const veggieIndex = selectedItems.filter(i => i.category === "veggies").findIndex(i => i.id === item.id);
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
                        onClick={() => removeItem(index)}
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
                onClick={checkRecipe}
                disabled={selectedItems.length === 0 || submitted}
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
                Check My Plate
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
            onClick={handleNext} 
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
              {currentRecipeIndex < recipes.length - 1 ? '➡️' : '🏁'}
            </span>
            {currentRecipeIndex < recipes.length - 1 ? 'Next Recipe' : 'Finish'}
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
            Level Complete!
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
            Score: {score}/{recipes.length}
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
            mb: 6,
            maxWidth: '800px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            You've mastered creating balanced plates! Keep up the great work with your meal planning.
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