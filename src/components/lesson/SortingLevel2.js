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
  Paper,
  CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

// Import food images
import apple from "../../assets/sortingLevel2/apple.png";
import banana from "../../assets/sortingLevel2/banana.png";
import bread from "../../assets/sortingLevel2/bread.png";
import broccoli from "../../assets/sortingLevel2/broccoli.png";
import cabbage from "../../assets/sortingLevel2/cabbage.png";
import carrots from "../../assets/sortingLevel2/carrots.png";
import eggplant from "../../assets/sortingLevel2/eggplant.png";
import fish from "../../assets/sortingLevel2/fish.png";
import grapes from "../../assets/sortingLevel2/grapes.png";
import orange from "../../assets/sortingLevel2/orange.png";
import rice from "../../assets/sortingLevel2/rice.png";
import stringbeans from "../../assets/sortingLevel2/stringbeans.png";
import watermelon from "../../assets/sortingLevel2/watermelon.png";
import kitchenBg from "../../assets/sortingLevel2/kitchen.jpg";

export default function SortingLevel2() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
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
  const [dropZoneActive, setDropZoneActive] = useState(null);

  // Activity data structure to match Level 1
  const activityData = {
    title: "Food Categories Challenge",
    instructions: "Is this a fruit, vegetable, or neither?",
    categories: [
      { id: 1, name: "Fruit", color: "#FF9AA2", emoji: "🍎", description: "Sweet and delicious" },
      { id: 2, name: "Vegetable", color: "#B5EAD7", emoji: "🥕", description: "Good for your health" },
      { id: 3, name: "None of these", color: "#C7CEEA", emoji: "🚫", description: "Not a fruit or vegetable" }
    ],
    items: [
      { id: 1, name: "Apple", category: 1, imageUrl: apple },
      { id: 2, name: "Banana", category: 1, imageUrl: banana },
      { id: 3, name: "Bread", category: 3, imageUrl: bread },
      { id: 4, name: "Broccoli", category: 2, imageUrl: broccoli },
      { id: 5, name: "Cabbage", category: 2, imageUrl: cabbage },
      { id: 6, name: "Carrot", category: 2, imageUrl: carrots },
      { id: 7, name: "Eggplant", category: 2, imageUrl: eggplant },
      { id: 8, name: "Fish", category: 3, imageUrl: fish },
      { id: 9, name: "Grape", category: 1, imageUrl: grapes },
      { id: 10, name: "Orange", category: 1, imageUrl: orange },
      { id: 11, name: "Rice", category: 3, imageUrl: rice },
      { id: 12, name: "String Bean", category: 2, imageUrl: stringbeans },
      { id: 13, name: "Watermelon", category: 1, imageUrl: watermelon }
  
    ]
  };

  // Shuffle items and take first 10 when component mounts
  useEffect(() => {
    const shuffled = [...activityData.items]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    setShuffledItems(shuffled);
  }, []);

  const currentItem = shuffledItems[currentItemIndex];
  const progressPercentage = ((currentItemIndex + (gameCompleted ? 1 : 0)) / shuffledItems.length * 100);

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
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, categoryId) => {
    e.preventDefault();
    setDropZoneActive(categoryId);
  };

  const handleDragLeave = () => {
    setDropZoneActive(null);
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    setDropZoneActive(null);
    
    const item = JSON.parse(e.dataTransfer.getData('text/plain'));
    const isCorrect = item.category === category.id;
    
    setAnswers(prev => [...prev, {
      itemId: item.id,
      categoryId: category.id,
      isCorrect
    }]);
    
    const newScore = isCorrect ? Math.min(score + 1, shuffledItems.length) : score;
    setScore(newScore);
    
    setFeedbackData({
      item: item,
      category: category,
      isCorrect: isCorrect
    });
    
    setShowFeedback(true);
  };

  const handleChoice = (selectedCategory) => {
    if (!currentItem) return;
    
    const isCorrect = currentItem.category === selectedCategory;
    const newScore = isCorrect ? Math.min(score + 1, shuffledItems.length) : score;
    
    setScore(newScore);
    setFeedbackData({
      item: currentItem,
      category: activityData.categories.find(c => c.id === selectedCategory),
      isCorrect
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    
    if (currentItemIndex < shuffledItems.length - 1) {
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

  const resetGame = () => {
    const shuffled = [...activityData.items]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
    setShuffledItems(shuffled);
    setCurrentItemIndex(0);
    setScore(0);
    setGameCompleted(false);
    setShowFeedback(false);
    setShowSuccess(false);
    setProgressSaved(false);
    setAnswers([]);
    setShowLevelIntro(true); // Show intro again when resetting
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  const handleContinue = () => {
    navigate('/homepage');
  };

  const getStarRating = () => {
    const percentage = (score / shuffledItems.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
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
            🍎 Food Categories Challenge 🥦
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
            Learn to identify fruits, vegetables, and other foods!
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
              flexDirection: 'column',
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
                mb: 4,
                textAlign: 'center'
              }}>
                <Typography variant="h5" sx={{ 
                  color: '#FF595E', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  mb: 2,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  What category is this food?
                </Typography>
                <CardMedia
                  component="img"
                  image={currentItem?.imageUrl}
                  alt={currentItem?.name}
                  sx={{ 
                    width: 200, 
                    height: 200, 
                    objectFit: 'contain', 
                    mb: 2,
                    mx: 'auto',
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
              </Box>

              {/* Choice Buttons */}
              <Box sx={{ 
                display: 'flex',
                gap: 3,
                justifyContent: 'center',
                width: '100%',
                maxWidth: '800px',
                flexWrap: 'wrap'
              }}>
                {activityData.categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="contained"
                    onClick={() => handleChoice(category.id)}
                    sx={{
                      background: `linear-gradient(135deg, ${category.color} 0%)`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      padding: '16px 24px',
                      borderRadius: '15px',
                      minWidth: '220px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                      }
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>
                      {category.emoji}
                    </span>
                    {category.name}
                  </Button>
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
              ? `${feedbackData.item?.name} is ${feedbackData.category?.id === 3 ? 'neither a fruit nor a vegetable' : `a ${feedbackData.category?.name.toLowerCase()}`}!`
              : `${feedbackData?.item?.name} is actually ${feedbackData?.item?.category === 3 ? 'neither a fruit nor a vegetable' : `a ${activityData.categories.find(cat => cat.id === feedbackData?.item?.category)?.name.toLowerCase()}`}.`
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
            You learned about different food categories! Great job completing this lesson.
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
