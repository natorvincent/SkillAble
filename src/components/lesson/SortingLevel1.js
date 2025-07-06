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

export default function SortingLevel1() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
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

  // Define healthy and unhealthy foods
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

  const currentItem = shuffledItems[currentItemIndex];
  const progressPercentage = ((currentItemIndex + (gameCompleted ? 1 : 0)) / activityData.items.length) * 100;

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
  };

  const getStarRating = () => {
    const percentage = (score / shuffledItems.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const handleContinue = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  const getCategoryItems = (categoryId) => {
    return answers
      .filter(answer => answer.selectedCategory === categoryId)
      .map(answer => shuffledItems.find(item => item.id === answer.itemId))
      .filter(Boolean);
  };

  if (loading) {
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
          <CircularProgress size={50} sx={{ color: '#FF595E' }} />
          <Typography variant="h5" sx={{ mt: 3, color: 'white', fontWeight: 'bold' }}>
            Loading food sorting game...
          </Typography>
        </Container>
      </div>
    );
  }

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
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: "hidden",
      backgroundImage: `url(${kitchenBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <Navbar />
      
      {/* Main content container */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 'calc(100vh - 80px)',
        padding: '20px',
        justifyContent: 'flex-start',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Progress bar */}
        <Box mb={4} sx={{ width: '100%', maxWidth: '800px' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
              Item {currentItemIndex + 1} of {shuffledItems.length}
            </Typography>
            <Chip 
              label={`Score: ${score}/${shuffledItems.length}`} 
              sx={{ 
                backgroundColor: '#FF595E', 
                color: 'white', 
                fontWeight: 'bold',
                fontSize: '1rem',
                padding: '5px 10px'
              }}
            />
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ 
              height: 12, 
              borderRadius: '20px',
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FFCA3A'
              }
            }} 
          />
        </Box>

        {/* Instructions */}
        <Box sx={{ 
          p: 2, 
          mb: 4, 
          backgroundColor: 'rgba(25, 130, 196, 0.9)',
          borderRadius: '20px',
          maxWidth: '800px',
          width: '100%'
        }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
            {activityData.instructions}
          </Typography>
        </Box>

        {/* Game area - items and drop zones */}
        {!gameCompleted && currentItem && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start', 
            gap: 4,
            mb: 4,
            width: '100%',
            maxWidth: '1200px',
            padding: '0 20px'
          }}>
            {/* Draggable Item */}
            <Box sx={{ 
              backgroundColor: 'rgba(255, 250, 244, 0.85)',
              borderRadius: '20px',
              padding: '20px',
              border: '4px solid #FFCA3A',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              width: '220px',
              flexShrink: 0
            }}>
              <Typography variant="h5" sx={{ color: '#FF595E', fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
                Drag this item:
              </Typography>
              <div 
                draggable
                onDragStart={(e) => handleDragStart(e, currentItem)}
                style={{
                  width: '180px',
                  height: '220px',
                  borderRadius: '15px',
                  position: 'relative',
                  padding: '1rem',
                  transition: 'all 0.3s ease',
                  overflow: 'visible',
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
                  sx={{ width: 80, height: 80, objectFit: 'contain', mb: 1 }}
                />
                <Typography variant="h6" sx={{ color: '#280B60', fontWeight: 'bold', mb: 1, fontSize: '1rem' }}>
                  {currentItem?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#280B60', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  {currentItem?.hint}
                </Typography>
              </div>
            </Box>

            {/* Drop Zones */}
            <Box sx={{ 
              display: 'flex', 
              gap: 4,
              backgroundColor: 'rgba(255, 250, 244, 0.7)',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              width: 'calc(100% - 260px)',
              minWidth: '800px',
              justifyContent: 'space-around'
            }}>
              {activityData.categories.map((category) => (
                <Box key={category.id} sx={{ 
                  width: '45%',
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
                    width: '100%'
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
                      minHeight: '220px',
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
                    <Typography variant="body2" sx={{ color: '#280B60', mb: 2, fontSize: '0.9rem' }}>
                      {category.description}
                    </Typography>

                    <Box sx={{ 
                      width: '100%',
                      minHeight: '120px',
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
                          justifyContent: 'space-around',
                          height: '120px',
                          border: '2px dashed #ccc',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          padding: '0 20px' // Add this line for equal horizontal padding
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
                              height: '50px',
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

        {/* Buttons */}
        <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 'auto', mb: 4 }}>
          <Button 
            variant="contained"
            onClick={resetGame}
            sx={{ 
              backgroundColor: '#FF595E',
              '&:hover': { backgroundColor: '#E5383B' },
              borderRadius: '10px',
              padding: '8px 20px'
            }}
          >
            Start Over
          </Button>
          <Button 
            variant="contained"
            onClick={handleGoHome}
            sx={{ 
              backgroundColor: '#1982C4',
              '&:hover': { backgroundColor: '#1565C0' },
              borderRadius: '10px',
              padding: '8px 20px'
            }}
          >
            Go Home
          </Button>
        </Stack>
      </Box>
      
      
      
      
      
      {/* Feedback Dialog */}
      <Dialog
        open={showFeedback}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '20px',
            backgroundColor: '#FFFAF4',
            border: `4px solid ${feedbackData?.isCorrect ? '#90BE6D' : '#FFCA3A'}`
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: feedbackData?.isCorrect ? '#90BE6D' : '#FFCA3A', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#280B60' }}>
            {feedbackData?.isCorrect ? 'Great job!' : 'Good try!'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ color: '#280B60' }}>
            {feedbackData?.isCorrect 
              ? `${feedbackData.item?.name} is ${feedbackData.category?.name.toLowerCase()}!`
              : `${feedbackData?.item?.name} is actually ${activityData.categories.find(cat => cat.id === feedbackData?.item?.category)?.name.toLowerCase()}.`
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={handleNext} 
            variant="contained"
            sx={{ 
              backgroundColor: '#FF595E',
              '&:hover': { backgroundColor: '#E5383B' },
              borderRadius: '10px',
              padding: '8px 25px'
            }}
          >
            {currentItemIndex < shuffledItems.length - 1 ? 'Next Item' : 'Finish'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog
        open={showSuccess}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '20px',
            backgroundColor: '#FFFAF4',
            border: '4px solid #FFCA3A'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', py: 4 }}>
          <EmojiEventsIcon sx={{ fontSize: 100, color: '#FFCA3A', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#280B60' }}>
            You did it!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {[...Array(getStarRating())].map((_, i) => (
              <StarIcon key={i} sx={{ color: '#FFCA3A', fontSize: 50, mx: 0.5 }} />
            ))}
            {[...Array(3 - getStarRating())].map((_, i) => (
              <StarIcon key={i} sx={{ color: '#E0E0E0', fontSize: 50, mx: 0.5 }} />
            ))}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF595E', mb: 2 }}>
            Score: {score}/{shuffledItems.length}
          </Typography>
          <Typography variant="h6" sx={{ color: '#280B60', lineHeight: 1.6 }}>
            You learned about healthy and unhealthy foods! Great job completing this lesson.
          </Typography>
          
          {progressSaving && (
            <Box sx={{ mt: 3, p: 3, backgroundColor: '#1982C4', borderRadius: '15px', color: 'white' }}>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              <Typography variant="body2">
                Saving your progress...
              </Typography>
            </Box>
          )}
          
          {progressSaved && (
            <Box sx={{ mt: 3, p: 3, backgroundColor: '#90BE6D', borderRadius: '15px', color: 'white' }}>
              <CheckCircleIcon sx={{ mr: 1, fontSize: 24 }} />
              <Typography variant="body2">
                Progress saved successfully!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, gap: 3 }}>
          <Button 
            onClick={() => {
              setShowSuccess(false);
              resetGame();
            }} 
            variant="outlined"
            sx={{ 
              borderColor: '#FFCA3A', 
              color: '#280B60',
              borderRadius: '10px',
              padding: '8px 25px'
            }}
          >
            Play Again
          </Button>
          <Button 
            variant="contained"
            onClick={handleContinue}
            disabled={progressSaving}
            sx={{ 
              backgroundColor: '#FF595E',
              '&:hover': { backgroundColor: '#E5383B' },
              borderRadius: '10px',
              padding: '8px 25px'
            }}
          >
            {progressSaving ? 'Saving...' : 'Continue'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}