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
  saveStudentLessonProgress
} from '../../services/progressService';

// Import food images
import apple from "../../assets/sortingLevel2/apple.png";
import banana from "../../assets/sortingLevel2/banana.png";
import bread from "../../assets/sortingLevel2/bread.png";
import broccoli from "../../assets/sortingLevel2/broccoli.png";
import carrots from "../../assets/sortingLevel2/carrots.png";
import chicken from "../../assets/sortingLevel3/chicken.png";
import cheese from "../../assets/sortingLevel3/cheese.png";
import eggs from "../../assets/sortingLevel3/eggs.png";
import fish from "../../assets/sortingLevel2/fish.png";
import milk from "../../assets/sortingLevel3/milk.png";
import oliveoil from "../../assets/sortingLevel1/oliveoil.png";
import pasta from "../../assets/sortingLevel3/pasta.png";
import rice from "../../assets/sortingLevel2/rice.png";
import steak from "../../assets/sortingLevel3/steak.png";
import yogurt from "../../assets/sortingLevel3/yogurt.png";
import kitchenBg from "../../assets/sortingLevel2/kitchen.jpg";

export default function SortingLevel3() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLevelIntro, setShowLevelIntro] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    item: null,
    category: null,
    isCorrect: false
  });
  const [shuffledItems, setShuffledItems] = useState([]);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Activity data structure for Level 3 - Food Pyramid Builder
  const activityData = {
    title: "Food Pyramid Builder",
    instructions: "Drag each food to its correct food group:",
    categories: [
      { 
        id: 1, 
        name: "Fruits", 
        color: "#FF9AA2", 
        emoji: "🍎", 
        description: "Sweet and nutritious",
        pyramidLevel: 1,
        position: 'left'
      },
      { 
        id: 2, 
        name: "Vegetables", 
        color: "#B5EAD7", 
        emoji: "🥕", 
        description: "Packed with vitamins",
        pyramidLevel: 1,
        position: 'right'
      },
      { 
        id: 3, 
        name: "Grains", 
        color: "#FFDAC1", 
        emoji: "🍞", 
        description: "Energy for your body",
        pyramidLevel: 2,
        position: 'center'
      },
      { 
        id: 4, 
        name: "Protein", 
        color: "#C7CEEA", 
        emoji: "🍗", 
        description: "Builds muscles",
        pyramidLevel: 3,
        position: 'left'
      },
      { 
        id: 5, 
        name: "Dairy", 
        color: "#E2F0CB", 
        emoji: "🥛", 
        description: "Strong bones",
        pyramidLevel: 3,
        position: 'right'
      },
      { 
        id: 6, 
        name: "Fats/Oils", 
        color: "#F8B195", 
        emoji: "🫒", 
        description: "Use sparingly",
        pyramidLevel: 4,
        position: 'center'
      }
    ],
    items: [
      { id: 1, name: "Apple", category: 1, imageUrl: apple },
      { id: 2, name: "Banana", category: 1, imageUrl: banana },
      { id: 3, name: "Bread", category: 3, imageUrl: bread },
      { id: 4, name: "Broccoli", category: 2, imageUrl: broccoli },
      { id: 5, name: "Carrots", category: 2, imageUrl: carrots },
      { id: 6, name: "Chicken", category: 4, imageUrl: chicken },
      { id: 7, name: "Cheese", category: 5, imageUrl: cheese },
      { id: 8, name: "Eggs", category: 4, imageUrl: eggs },
      { id: 9, name: "Fish", category: 4, imageUrl: fish },
      { id: 10, name: "Milk", category: 5, imageUrl: milk },
      { id: 11, name: "Olive Oil", category: 6, imageUrl: oliveoil },
      { id: 12, name: "Pasta", category: 3, imageUrl: pasta },
      { id: 13, name: "Rice", category: 3, imageUrl: rice },
      { id: 14, name: "Steak", category: 4, imageUrl: steak },
      { id: 15, name: "Yogurt", category: 5, imageUrl: yogurt }
    ]
  };

  // Shuffle items ensuring at least one from each category
  useEffect(() => {
    const categories = activityData.categories.map(c => c.id);
    const itemsByCategory = {};
    
    // Group items by category
    categories.forEach(categoryId => {
      itemsByCategory[categoryId] = activityData.items.filter(item => item.category === categoryId);
    });
    
    // Select at least one from each category
    const selectedItems = categories.map(categoryId => {
      const items = itemsByCategory[categoryId];
      return items[Math.floor(Math.random() * items.length)];
    });
    
    // Fill remaining slots with random items
    const remainingItems = activityData.items.filter(item => 
      !selectedItems.some(selected => selected.id === item.id)
    );
    
    const shuffledRemaining = [...remainingItems].sort(() => Math.random() - 0.5);
    const totalItems = [...selectedItems, ...shuffledRemaining].slice(0, 15);
    
    // Final shuffle
    setShuffledItems([...totalItems].sort(() => Math.random() - 0.5));
  }, []);

  const currentItem = shuffledItems[currentItemIndex];
  const progressPercentage = ((currentItemIndex + (gameCompleted ? 1 : 0)) / 10 * 100);

  const getStudentId = () => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId || studentId === 'null') {
      console.error('No student ID found');
      return null;
    }
    return parseInt(studentId, 10);
  };

  const getCategoryItems = (categoryId) => {
    return answers
      .filter(answer => answer.categoryId === categoryId)
      .map(answer => shuffledItems.find(item => item.id === answer.itemId))
      .filter(item => item !== undefined);
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setHoveredCategory(null);
  };

  const handleDragOver = (e, categoryId) => {
    e.preventDefault();
    setHoveredCategory(categoryId);
  };

  const handleDragLeave = () => {
    setHoveredCategory(null);
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
    const isCorrect = item.category === category.id;
    
    setAnswers(prev => [...prev, {
      itemId: item.id,
      categoryId: category.id,
      isCorrect
    }]);
    
    const newScore = isCorrect ? Math.min(score + 1, 10) : score;
    setScore(newScore);
    
    setFeedbackData({
      item: item,
      category: category,
      isCorrect: isCorrect
    });
    
    setShowFeedback(true);
    setHoveredCategory(null);
  };

  const handleNext = () => {
    setShowFeedback(false);
    
    if (currentItemIndex < 9) { // Only go through 10 items for scoring
      setCurrentItemIndex(prev => prev + 1);
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
        maxScore: 10,
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
    const categories = activityData.categories.map(c => c.id);
    const itemsByCategory = {};
    
    categories.forEach(categoryId => {
      itemsByCategory[categoryId] = activityData.items.filter(item => item.category === categoryId);
    });
    
    const selectedItems = categories.map(categoryId => {
      const items = itemsByCategory[categoryId];
      return items[Math.floor(Math.random() * items.length)];
    });
    
    const remainingItems = activityData.items.filter(item => 
      !selectedItems.some(selected => selected.id === item.id)
    );
    
    const shuffledRemaining = [...remainingItems].sort(() => Math.random() - 0.5);
    const totalItems = [...selectedItems, ...shuffledRemaining].slice(0, 15);
    
    setShuffledItems([...totalItems].sort(() => Math.random() - 0.5));
    setCurrentItemIndex(0);
    setScore(0);
    setGameCompleted(false);
    setShowFeedback(false);
    setShowSuccess(false);
    setProgressSaved(false);
    setAnswers([]);
    setShowLevelIntro(true);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  const handleContinue = () => {
    navigate('/homepage');
  };

  const getStarRating = () => {
    const percentage = (score / 10) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Render food pyramid with proper structure
    const renderPyramid = () => {
    const pyramidLevels = [1, 2, 3, 4]; // From bottom to top
    const pyramidHeight = 400;
    const pyramidWidth = 400;
    
    return (
        <Box sx={{
        position: 'relative',
        width: `${pyramidWidth}px`,
        height: `${pyramidHeight}px`,
        ml: 4,
        display: 'flex',
        flexDirection: 'column-reverse' // Render from bottom up
        }}>
        {pyramidLevels.map((level, index) => {
            const categoriesInLevel = activityData.categories.filter(c => c.pyramidLevel === level);
            const levelHeight = pyramidHeight / pyramidLevels.length;
            const levelWidth = pyramidWidth;
            
            return (
            <Box 
                key={`level-${level}`}
                sx={{
                height: `${levelHeight}px`,
                width: `${levelWidth}px`,
                position: 'relative',
                backgroundColor: `rgba(255, 255, 255, 0.7)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '2px solid #555',
                borderRadius: '15px'
                }}
            >
                {/* Categories in this level */}
                {categoriesInLevel.map(category => {
                const itemsInCategory = getCategoryItems(category.id);
                const position = category.position || 'right';
                
                // Calculate drop zone position - now takes full width of its section
                let dropZoneLeft, dropZoneRight, dropZoneWidth;
                if (categoriesInLevel.length === 1) {
                    dropZoneLeft = '0%';
                    dropZoneRight = '0%';
                    dropZoneWidth = '100%';
                } else if (position === 'left') {
                    dropZoneLeft = '0%';
                    dropZoneRight = '50%';
                    dropZoneWidth = '50%';
                } else if (position === 'right') {
                    dropZoneLeft = '50%';
                    dropZoneRight = '0%';
                    dropZoneWidth = '50%';
                } else { // center
                    dropZoneLeft = '25%';
                    dropZoneRight = '25%';
                    dropZoneWidth = '50%';
                }
                
                return (
                    <React.Fragment key={category.id}>
                    {/* Drop zone - takes up full width of its section */}
                    <Box
                        onDragOver={(e) => handleDragOver(e, category.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, category)}
                        sx={{
                        position: 'absolute',
                        left: dropZoneLeft,
                        right: dropZoneRight,
                        width: dropZoneWidth,
                        top: 0,
                        bottom: 0,
                        backgroundColor: hoveredCategory === category.id ? 
                            `${category.color}CC` : 'transparent',
                        border: hoveredCategory === category.id ? 
                            `2px dashed ${category.color}` : 'none',
                        borderRadius: '15px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        transition: 'all 0.3s ease'
                        }}
                    >
                        {/* Preview of dragged item */}
                        {draggedItem && hoveredCategory === category.id && (
                        <Box
                            sx={{
                            width: '40px',
                            height: '40px',
                            backgroundImage: `url(${draggedItem.imageUrl})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                            }}
                        />
                        )}
                    </Box>
                    
                    {/* Category label inside the level - now properly centered in its section */}
                    <Box
                        sx={{
                        position: 'absolute',
                        left: position === 'center' ? '50%' : 
                            position === 'left' ? '25%' : '75%',
                        top: '10px',
                        transform: 'translateX(-50%)', // Always center based on left position
                        zIndex: 3,
                        backgroundColor: hoveredCategory === category.id ? 
                            `${category.color}99` : 'transparent',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        width: categoriesInLevel.length === 2 ? '40%' : 'auto'
                        }}
                    >
                        <Typography variant="body2" sx={{ 
                        fontWeight: 'bold',
                        color: hoveredCategory === category.id ? 'white' : '#333',
                        textShadow: hoveredCategory === category.id ? 
                            '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
                        whiteSpace: 'nowrap'
                        }}>
                        {category.name}
                        </Typography>
                    </Box>
                    
                    {/* Placed items */}
                    {itemsInCategory.map((item, itemIndex) => (
                        <Box
                        key={`item-${item.id}-${itemIndex}`}
                        sx={{
                            position: 'absolute',
                            left: position === 'center' ? 
                            `calc(50% + ${(itemIndex - Math.floor(itemsInCategory.length/2)) * 40}px)` :
                            position === 'left' ? 
                            `calc(25% + ${itemIndex * 40}px)` :
                            `calc(75% + ${itemIndex * 40}px)`,
                            bottom: '10px',
                            width: '40px',
                            height: '40px',
                            backgroundImage: `url(${item.imageUrl})`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            zIndex: 1,
                            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
                            transform: position === 'center' ? 'translateX(-50%)' : 'none'
                        }}
                        />
                    ))}
                    </React.Fragment>
                );
              })}
              
            </Box>
          );
        })}
      </Box>
    );
  };

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
            🏗️ Food Pyramid Builder 🍽️
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
            Learn how different foods fit into a balanced diet by building your own food pyramid!
          </Typography>
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
            Let's Build!
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
                color: 'white', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                px: 2,
                py: 1,
                borderRadius: '10px'
              }}>
                Item {Math.min(currentItemIndex + 1, 10)} of 10
              </Typography>
              <Chip 
                label={`Score: ${score}/10`} 
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
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
            mb: 1,
            textAlign: 'center'
          }}>
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(25, 130, 196, 0.8)',
              display: 'inline-block',
              px: 3,
              py: 1,
              borderRadius: '15px',
              fontSize: '1rem'
            }}>
              {activityData.instructions}
            </Typography>
          </Box>

          {/* Game Area */}
          {!gameCompleted && currentItem && currentItemIndex < 10 && (
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 200px)',
              width: '100%',
              pt: 1,
              mb: 0,
              pb: 0
            }}>
              {/* Current Food Item */}
              <Box sx={{ 
                backgroundColor: 'rgba(255, 250, 244, 0.85)',
                borderRadius: '20px',
                padding: '30px',
                border: '4px solid #FFCA3A',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                width: '400px',
                textAlign: 'center',
                mr: 4
              }}>
                <Typography variant="h5" sx={{ 
                  color: '#FF595E', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  mb: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Drag this food to its group in the pyramid:
                </Typography>
                <Box
                  draggable
                  onDragStart={(e) => handleDragStart(e, currentItem)}
                  onDragEnd={handleDragEnd}
                  sx={{
                    width: 200,
                    height: 200,
                    backgroundImage: `url(${currentItem?.imageUrl})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    margin: '0 auto',
                    cursor: 'grab',
                    filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.3))',
                    '&:active': {
                      cursor: 'grabbing'
                    }
                  }}
                />
                <Typography variant="h4" sx={{ 
                  color: '#280B60', 
                  fontWeight: 'bold', 
                  mb: 1,
                  fontFamily: 'Poppins, sans-serif',
                  mt: 2
                }}>
                  {currentItem?.name}
                </Typography>
              </Box>

              {/* Food Pyramid */}
              {renderPyramid()}
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
                background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                color: 'white',
                px: 5,
                py: 1.5,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(25, 130, 196, 0.4)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  transform: 'scale(1.05) translateY(-3px)',
                  boxShadow: '0 12px 30px rgba(25, 130, 196, 0.6)',
                  background: 'linear-gradient(135deg, #3A9BD4 0%, #1568A0 100%)'
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
            {feedbackData?.isCorrect 
              ? `${feedbackData.item?.name} belongs in ${feedbackData.category?.name}! ${feedbackData.category?.description}`
              : `${feedbackData?.item?.name} actually belongs in ${activityData.categories.find(cat => cat.id === feedbackData?.item?.category)?.name}.`
            }
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
              {currentItemIndex < 9 ? '➡️' : '🏁'}
            </span>
            {currentItemIndex < 9 ? 'Next Item' : 'Finish'}
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
            Score: {score}/10
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
            mb: 6,
            maxWidth: '800px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            You've built a complete food pyramid! Now you know how different foods contribute to a balanced diet.
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