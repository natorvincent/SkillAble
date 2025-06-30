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
import fish from "../../assets/sortingLevel1/fish.jpeg";
import oliveOil from "../../assets/sortingLevel1/oliveoil.jpg";
import water from "../../assets/sortingLevel1/water.png";
import hotdog from "../../assets/sortingLevel1/hotdogs.png";
import cereal from "../../assets/sortingLevel1/cereal.jpg";
import soda from "../../assets/sortingLevel1/soda.png";
import chocobar from "../../assets/sortingLevel1/chocobar.png";
import chips from "../../assets/sortingLevel1/potatochips.jpg";
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
      position: "relative",
      overflow: "hidden",
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${kitchenBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ 
          p: 4, 
          borderRadius: '20px', 
          backgroundColor: 'rgba(255, 250, 244, 0.9)',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
          border: '2px solid #FFCA3A'
        }}>
          
          <Box textAlign="center" mb={4}>
            <div style={{
              display: "inline-block",
              backgroundColor: "#540D6E",
              borderRadius: "40px",
              padding: "10px 30px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              marginBottom: "20px",
            }}>
              <Typography variant="h3" sx={{ 
                color: 'white', 
                fontWeight: '700',
                fontSize: '2.5rem',
                margin: 0
              }}>
                Food Sorting
              </Typography>
            </div>
            <Typography variant="h6" sx={{ color: '#280B60', mb: 3 }}>
              Learn about healthy and unhealthy foods!
            </Typography>
            
            {showTip && (
              <Paper sx={{ p: 3, mb: 3, backgroundColor: '#FFCA3A', borderRadius: '20px' }}>
                <Typography variant="body1" sx={{ color: '#280B60', fontWeight: 'bold' }}>
                  {showTip}
                </Typography>
              </Paper>
            )}
          </Box>

          <Box mb={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ color: '#280B60', fontWeight: 'bold' }}>
                Item {currentItemIndex + 1} of {shuffledItems.length}
              </Typography>
              <Chip 
                label={`Score: ${score}/${shuffledItems.length}`} 
                sx={{ backgroundColor: '#FF595E', color: 'white', fontWeight: 'bold' }}
              />
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ height: 12, borderRadius: '20px' }} 
            />
          </Box>

          <Paper sx={{ p: 3, mb: 4, backgroundColor: '#1982C4', borderRadius: '20px' }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
              {activityData.instructions}
            </Typography>
          </Paper>

          {!gameCompleted && currentItem && (
            <Box mb={4}>
              <Typography variant="h5" sx={{ color: '#FF595E', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
                Drag this item:
              </Typography>
              
              <Box display="flex" justifyContent="center" mb={4}>
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, currentItem)}
                  style={{
                    width: '220px',
                    height: '280px',
                    borderRadius: '20px',
                    background: '#FFFAF4',
                    position: 'relative',
                    padding: '1.8rem',
                    border: '4px solid #FFCA3A',
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
                    sx={{ width: 120, height: 120, objectFit: 'contain', mb: 2 }}
                  />
                  <Typography variant="h6" sx={{ color: '#280B60', fontWeight: 'bold', mb: 1 }}>
                    {currentItem?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#280B60', fontStyle: 'italic' }}>
                    {currentItem?.hint}
                  </Typography>
                </div>
              </Box>
            </Box>
          )}

          <Typography variant="h5" sx={{ color: '#FF595E', fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
            Drop it here:
          </Typography>

          <Grid container spacing={10} mb={4} justifyContent="center">
            {activityData.categories.map(category => (
              <Grid item xs={12} sm={6} key={category.id}>
                <div
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, category.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, category)}
                  style={{
                    width: '80%',
                    minHeight: '320px',
                    minWidth: '200px',
                    borderRadius: '20px',
                    background: dropZoneActive === category.id ? 'rgba(255, 255, 255, 0.95)' : '#FFFAF4',
                    position: 'relative',
                    padding: '1.8rem',
                    border: `4px solid ${dropZoneActive === category.id ? '#FFCA3A' : category.color}`,
                    transition: 'all 0.3s ease',
                    overflow: 'visible',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {category.emoji}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#280B60', mb: 1 }}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#280B60', mb: 3 }}>
                    {category.description}
                  </Typography>

                  <Box sx={{ minHeight: 140, width: '100%' }}>
                    {getCategoryItems(category.id).length === 0 ? (
                      <Box sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 140,
                        border: '2px dashed #ccc',
                        borderRadius: '15px',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)'
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
                            p: 2,
                            mb: 1,
                            textAlign: 'center',
                            backgroundColor: '#FFFAF4',
                            border: '2px solid',
                            borderColor: answers.find(a => a.itemId === item.id)?.isCorrect ? '#90BE6D' : '#FF595E',
                            borderRadius: '15px',
                            position: 'relative'
                          }}
                        >
                          <CardMedia
                            component="img"
                            image={item.imageUrl}
                            alt={item.name}
                            sx={{ width: 50, height: 50, objectFit: 'contain', mx: 'auto', mb: 1 }}
                          />
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#280B60' }}>
                            {item.name}
                          </Typography>
                          <CheckCircleIcon 
                            sx={{ 
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              color: answers.find(a => a.itemId === item.id)?.isCorrect ? '#90BE6D' : '#FF595E',
                              backgroundColor: '#FFFAF4',
                              borderRadius: '50%',
                              fontSize: 24,
                              border: '2px solid #FFFAF4'
                            }} 
                          />
                        </Paper>
                      ))
                    )}
                  </Box>
                </div>
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={3} justifyContent="center">
            <Button 
              variant="outlined"
              onClick={resetGame}
              sx={{ borderColor: '#FF595E', color: '#FF595E' }}
            >
              Start Over
            </Button>
            <Button 
              variant="outlined"
              onClick={handleGoHome}
              sx={{ borderColor: '#1982C4', color: '#1982C4' }}
            >
              Go Home
            </Button>
          </Stack>
        </Paper>
        
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
              sx={{ backgroundColor: '#FF595E' }}
            >
              {currentItemIndex < shuffledItems.length - 1 ? 'Next Item' : 'Finish'}
            </Button>
          </DialogActions>
        </Dialog>
        
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
              sx={{ borderColor: '#FFCA3A', color: '#280B60' }}
            >
              Play Again
            </Button>
            <Button 
              variant="contained"
              onClick={handleContinue}
              disabled={progressSaving}
              sx={{ backgroundColor: '#FF595E' }}
            >
              {progressSaving ? 'Saving...' : 'Continue'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
}