import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';

// Service imports for progress tracking
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Import food images
import apple from "../../assets/sortingLevel1/apple.png";
import carrots from "../../assets/sortingLevel1/carrots.png";
import fish from "../../assets/sortingLevel1/fish.png";
import oliveOil from "../../assets/sortingLevel1/oliveoil.png";
import water from "../../assets/sortingLevel1/water.png";
import hotdog from "../../assets/sortingLevel1/hotdogs.png";
import cereal from "../../assets/sortingLevel1/cereal.png";
import soda from "../../assets/sortingLevel1/soda.png";
import chocobar from "../../assets/sortingLevel1/chocobar.png";
import chips from "../../assets/sortingLevel1/potatochips.png";
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

/**
 * SortingLevel1 Component - A game that teaches students to categorize foods as healthy or unhealthy
 * Features:
 * - Drag and drop gameplay
 * - Progress tracking
 * - Level completion screens
 * - Score calculation
 */
export default function SortingLevel1() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();

  // State Management
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneActive, setDropZoneActive] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');
  const [shuffledItems, setShuffledItems] = useState([]);
  const [showLevelIntro, setShowLevelIntro] = useState(true); // New state for level intro screen

  /**
   * Retrieves student ID from localStorage
   * @returns {number|null} Student ID or null if not found/invalid
   */
  const getStudentId = () => {
    const studentId = localStorage.getItem('studentId');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole !== 'STUDENT') {
      console.error('User is not a student:', userRole);
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

  // Game configuration data
  const activityData = {
    instructions: "Drag the food to the correct category!",
    categories: [
      { 
        id: 1, 
        name: "Healthy Foods", 
        color: "#90BE6D", 
        description: "Good for your body",
        emoji: "🥗"
      },
      { 
        id: 2, 
        name: "Unhealthy Foods", 
        color: "#FF595E", 
        description: "Not good if eaten too much",
        emoji: "🍔"
      }
    ],
    items: [
      // Healthy foods
      { id: 1, name: "Apple", category: 1, imageUrl: apple, hint: "A fruit that keeps the doctor away" },
      { id: 2, name: "Carrots", category: 1, imageUrl: carrots, hint: "Orange vegetables good for eyes" },
      { id: 3, name: "Fish", category: 1, imageUrl: fish, hint: "Rich in omega-3 fatty acids" },
      { id: 4, name: "Olive Oil", category: 1, imageUrl: oliveOil, hint: "Healthy fat for cooking" },
      { id: 5, name: "Water", category: 1, imageUrl: water, hint: "Essential for life" },
      
      // Unhealthy foods
      { id: 6, name: "Hotdog", category: 2, imageUrl: hotdog, hint: "Processed meat product" },
      { id: 7, name: "Cereal", category: 2, imageUrl: cereal, hint: "Often high in sugar" },
      { id: 8, name: "Soda", category: 2, imageUrl: soda, hint: "Carbonated sugary drink" },
      { id: 9, name: "Chocobar", category: 2, imageUrl: chocobar, hint: "Sweet chocolate treat" },
      { id: 10, name: "Chips", category: 2, imageUrl: chips, hint: "Salty fried snack" }
    ]
  };

  // Shuffle items when component mounts
  useEffect(() => {
    const shuffled = [...activityData.items].sort(() => Math.random() - 0.5);
    setShuffledItems(shuffled);
  }, []);

  // Current item being displayed
  const currentItem = shuffledItems[currentItemIndex];
  // Calculate progress percentage
  const progressPercentage = ((currentItemIndex + (gameCompleted ? 1 : 0)) / activityData.items.length) * 100;

  // Fetch user progress when lessonId changes
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          console.log('Missing studentId or lessonId:', { studentId, lessonId });
          return;
        }
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Great job! You finished this before. Want to try again?");
          }
        }
      } catch (error) {
        console.log('Error fetching progress:', error);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);


  // Fetch lesson data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setLesson({
            id: lessonId || 1,
            title: "Food Sorting",
            description: "Learn about healthy and unhealthy foods!",
            level: 1
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Something went wrong');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);

  // Drag and drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, categoryId) => {
    e.preventDefault();
    setDropZoneActive(categoryId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropZoneActive(null);
    }
  };

  /**
   * Handles dropping an item into a category
   * @param {Event} e - Drop event
   * @param {Object} category - The category the item was dropped into
   */
  const handleDrop = (e, category) => {
    e.preventDefault();
    setDropZoneActive(null);
    
    if (!draggedItem || draggedItem.id !== currentItem.id) return;
    
    const isCorrect = currentItem.category === category.id;
    const newAnswer = {
      itemId: currentItem.id,
      selectedCategory: category.id,
      correctCategory: currentItem.category,
      isCorrect
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    const allAnswers = [...answers, newAnswer];
    const correctCount = allAnswers.filter(answer => answer.isCorrect).length;
    setScore(correctCount);

    setFeedbackData({
      item: currentItem,
      category: category,
      isCorrect: isCorrect
    });
    
    setShowFeedback(true);
    setDraggedItem(null);
  };

  /**
   * Advances to the next item or completes the game
   */
  const handleNext = () => {
    setShowFeedback(false);
    setFeedbackData(null);
    
    if (currentItemIndex < shuffledItems.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      setGameCompleted(true);
      setTimeout(() => {
        setShowSuccess(true);
        saveProgress();
      }, 300);
    }
  };

  /**
   * Saves the user's progress to the backend
   */
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      const finalScore = answers.filter(answer => answer.isCorrect).length;
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: shuffledItems.length,
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

  /**
   * Resets the game to its initial state
   */
  const resetGame = () => {
    const shuffled = [...activityData.items].sort(() => Math.random() - 0.5);
    setShuffledItems(shuffled);
    setCurrentItemIndex(0);
    setAnswers([]);
    setShowFeedback(false);
    setFeedbackData(null);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    setShowLevelIntro(true); // Show intro again when resetting
  };

  /**
   * Calculates star rating based on score
   * @returns {number} Number of stars earned (0-3)
   */
  const getStarRating = () => {
    const percentage = (score / shuffledItems.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  /**
   * Handles navigation after completing a level
   */
  /**
 * Handles navigation after completing a level
 */
  const handleContinue = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }

    // Determine the correct navigation path based on the current route
    if (shuffledItems.length === currentItemIndex + 1) {
      // For food-sorting lessons
      if (window.location.pathname.includes('/food-sorting')) {
        // Check if this is level 1 to navigate to level 2
        if (window.location.pathname.includes('level-1')) {
          navigate(`/lesson/food-sorting/level-2/${lessonId}`);
        } 
        // If level 2 or higher, or no level specified, go back to modules
        else {
          navigate(`/lesson/food-sorting/level-2/${lessonId}`);
        }
      }
      
      // Default case
      else {
        navigate('/module');
      }
    } else {
      // If not completing the level, just go back
      navigate(-1);
    }
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  /**
   * Gets all items that have been dropped into a specific category
   * @param {number} categoryId - The category ID to filter by
   * @returns {Array} Array of items in the category
   */
  const getCategoryItems = (categoryId) => {
    return answers
      .filter(answer => answer.selectedCategory === categoryId)
      .map(answer => shuffledItems.find(item => item.id === answer.itemId))
      .filter(Boolean);
  };

  

  // Error state
  if (error) {
    return (
      <div style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${kitchenBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <Navbar />
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
            Oops! Something went wrong.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/homepage')}
            sx={{ backgroundColor: '#FF595E' }}
          >
            Go Home
          </Button>
        </Container>
      </div>
    );
  }

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
            🍎 Food Sorting Challenge 🥦
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
            Learn to identify healthy vs. unhealthy foods!
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
            Let's Play!
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
                Item {currentItemIndex + 1} of {shuffledItems.length}
              </Typography>
              <Chip 
                label={`Score: ${score}/${shuffledItems.length}`} 
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
          {!gameCompleted && currentItem && (
            <Box sx={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: 'calc(100vh - 200px)',
              width: '100%',
              pt: 1,
              mb: 0,
              pb: 0
            }}>
              {/* Draggable Item */}
              <Box sx={{ 
                mr: 8,
                backgroundColor: 'rgba(255, 250, 244, 0.85)',
                borderRadius: '20px',
                padding: '20px',
                border: '4px solid #FFCA3A',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                width: '300px',
                flexShrink: 0
              }}>
                <Typography variant="h5" sx={{ 
                  color: '#FF595E', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  mb: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Drag this food:
                </Typography>
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, currentItem)}
                  style={{
                    width: '100%',
                    height: '300px',
                    borderRadius: '15px',
                    position: 'relative',
     
                    transition: 'all 0.3s ease',
                    cursor: 'grab',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CardMedia
                    component="img"
                    image={currentItem?.imageUrl}
                    alt={currentItem?.name}
                    sx={{ 
                      width: 150, 
                      height: 150, 
                      objectFit: 'contain', 
                      mb: 2,
                      filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.3))'
                    }}
                  />
                  <Typography variant="h4" sx={{ 
                    color: '#280B60', 
                    fontWeight: 'bold', 
                    mb: 1,
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {currentItem?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: '#280B60', 
                    fontStyle: 'italic',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {currentItem?.hint}
                  </Typography>
                </div>
              </Box>

              {/* Drop Zones */}
              <Box sx={{ 
                display: 'flex', 
                gap: 5,
                backgroundColor: 'rgba(255, 250, 244, 0.7)',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                width: '800px'
              }}>
                {activityData.categories.map((category) => (
                  <Box key={category.id} sx={{ 
                    width: '100%',
                    padding: '0 10px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: category.color, 
                      fontWeight: 'bold', 
                      textAlign: 'center', 
                      mb: 2,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                      width: '100%',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {category.name}
                    </Typography>
                    <div
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, category.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, category)}
                      style={{
                        width: '100%',
                        minHeight: '250px',
                        borderRadius: '15px',
                        background: dropZoneActive === category.id ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 250, 244, 0.9)',
                        position: 'relative',
                        padding: '1rem',
                        border: `4px solid ${dropZoneActive === category.id ? '#FFCA3A' : category.color}`,
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {category.emoji}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: '#280B60', 
                        mb: 2, 
                        fontSize: '0.9rem',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {category.description}
                      </Typography>

                      <Box sx={{ 
                        width: '100%',
                        minHeight: '150px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        justifyContent: 'center',
                        alignContent: 'flex-start',
                      }}>
                        {getCategoryItems(category.id).length === 0 ? (
                          <Box sx={{ 
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '150px',
                            border: '2px dashed #ccc',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          }}>
                            <FavoriteIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                            <Typography variant="body2" sx={{ color: '#999' }}>
                              Drop here
                            </Typography>
                          </Box>
                        ) : (
                          getCategoryItems(category.id).map(item => (
                            <Paper
                              key={item.id}
                              sx={{
                                p: '4px',
                                textAlign: 'center',
                                backgroundColor: '#FFFAF4',
                                border: '2px solid',
                                borderColor: answers.find(a => a.itemId === item.id)?.isCorrect ? '#90BE6D' : '#FF595E',
                                borderRadius: '8px',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '60px',
                                width: 'calc(15% - 6px)',
                                minWidth: '0'
                              }}
                            >
                              <CardMedia
                                component="img"
                                image={item.imageUrl}
                                alt={item.name}
                                sx={{ width: 30, height: 30, objectFit: 'contain', mb: '2px' }}
                              />
                              <Typography variant="caption" sx={{ 
                                fontWeight: 'bold', 
                                color: '#280B60',
                                fontSize: '0.6rem',
                                lineHeight: '1',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%'
                              }}>
                                {item.name}
                              </Typography>
                              <CheckCircleIcon 
                                sx={{ 
                                  position: 'absolute',
                                  top: -6,
                                  right: -6,
                                  color: answers.find(a => a.itemId === item.id)?.isCorrect ? '#90BE6D' : '#FF595E',
                                  backgroundColor: '#FFFAF4',
                                  borderRadius: '50%',
                                  fontSize: 16,
                                  border: '2px solid #FFFAF4'
                                }} 
                              />
                            </Paper>
                          ))
                        )}
                      </Box>
                    </div>
                  </Box>
                ))}
              </Box>
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
              ? 'linear-gradient(135deg, rgba(144, 190, 109, 0.95) 0%, rgba(123, 160, 91, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255, 89, 94, 0.95) 0%, rgba(224, 69, 73, 0.95) 100%)',
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
              ? `${feedbackData.item?.name} is ${feedbackData.category?.name.toLowerCase()}!`
              : `${feedbackData?.item?.name} is actually ${activityData.categories.find(cat => cat.id === feedbackData?.item?.category)?.name.toLowerCase()}.`
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
              {currentItemIndex < shuffledItems.length - 1 ? '➡️' : '🏁'}
            </span>
            {currentItemIndex < shuffledItems.length - 1 ? 'Next Item' : 'Finish'}
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
            Score: {score}/{shuffledItems.length}
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
            mb: 6,
            maxWidth: '800px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            You learned about healthy and unhealthy foods! Great job completing this lesson.
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