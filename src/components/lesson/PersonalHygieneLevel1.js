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
import Background from '../Background';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';
import toothpaste from "../../assets/hygieneLevel1/toothpaste.png"
import toothbrush from "../../assets/hygieneLevel1/toothbrush.png"
import soap from "../../assets/hygieneLevel1/soap.png"
import lotion from "../../assets/hygieneLevel1/lotion.png"
import shampoo from "../../assets/hygieneLevel1/shampoo.png"
import pad from "../../assets/hygieneLevel1/pad.png"
import loofah from "../../assets/hygieneLevel1/loofah.png"
import deodorant from "../../assets/hygieneLevel1/deodorant.png"
import comb from "../../assets/hygieneLevel1/comb.png"

export default function PersonalHygieneLevel1() {
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
  
  const activityData = {
    instructions: "Drag the item to where it belongs!",
    categories: [
      { 
        id: 1, 
        name: "Body Care", 
        color: "#90BE6D", 
        description: "Things for your body",
        emoji: "🧴"
      },
      { 
        id: 2, 
        name: "Teeth Care", 
        color: "#1982C4", 
        description: "Things for your teeth",
        emoji: "🦷"
      },
      { 
        id: 3, 
        name: "Hair Care", 
        color: "#FFCA3A", 
        description: "Things for your hair",
        emoji: "💇"
      }
    ],
    items: [
      { id: 1, name: "Toothbrush", category: 2, imageUrl: toothbrush, hint: "I clean your teeth!" },
      { id: 2, name: "Toothpaste", category: 2, imageUrl: toothpaste, hint: "I go on the toothbrush!" },
      { id: 3, name: "Soap", category: 1, imageUrl: soap, hint: "I help you wash!" },
      { id: 4, name: "Body Lotion", category: 1, imageUrl: lotion, hint: "I make skin soft!" },
      { id: 5, name: "Shampoo", category: 3, imageUrl: shampoo, hint: "I wash your hair!" },
      { id: 6, name: "Sanitary Pad", category: 1, imageUrl: pad, hint: "I help keep you clean!" },
      { id: 7, name: "Loofah", category: 1, imageUrl: loofah, hint: "I help scrub in the bath!" },
      { id: 8, name: "Deodorant", category: 1, imageUrl: deodorant, hint: "I keep you smelling nice!" },
      { id: 9, name: "Comb", category: 3, imageUrl: comb, hint: "I fix your hair!" }
    ]
  };

  const currentItem = activityData.items[currentItemIndex];
  const progressPercentage = ((currentItemIndex + (gameCompleted ? 1 : 0)) / activityData.items.length) * 100;

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
        if (!studentId || !lessonId) return;
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Great job! You finished this before. Want to try again?");
          }
        }
      } catch (error) {
        console.log('Starting fresh');
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
            title: "Personal Hygiene",
            description: "Learn about keeping clean and healthy!",
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

  // Update the score state to reflect current game score
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
  
  // Calculate score based on all correct answers so far
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
    
    if (currentItemIndex < activityData.items.length - 1) {
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
    const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
    
    if (!studentId || !lessonId) return;
    
    // Calculate final score based on correct answers
    const finalScore = answers.filter(answer => answer.isCorrect).length;
    
    const progressData = {
      score: finalScore, // Use calculated final score
      maxScore: activityData.items.length,
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
    const percentage = (score / activityData.items.length) * 100;
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
      .map(answer => activityData.items.find(item => item.id === answer.itemId))
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
      }}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}>
          <Background />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar />
          <Container sx={{ py: 8, textAlign: 'center' }}>
            <Paper sx={{ 
              p: 6, 
              borderRadius: '20px', 
              backgroundColor: '#FFFAF4',
              border: '2px solid #FFCA3A',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)'
            }}>
              <CircularProgress size={50} sx={{ color: '#FF595E' }} />
              <Typography variant="h5" sx={{ 
                mt: 3, 
                color: '#280B60', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Getting ready...
              </Typography>
            </Paper>
          </Container>
        </div>
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
      }}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}>
          <Background />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar />
          <Container sx={{ py: 8, textAlign: 'center' }}>
            <Paper sx={{ 
              p: 6, 
              borderRadius: '20px', 
              backgroundColor: '#FFFAF4',
              border: '2px solid #FF595E'
            }}>
              <Typography variant="h5" sx={{ 
                color: '#280B60', 
                fontWeight: 'bold', 
                mb: 3,
                fontFamily: 'Poppins, sans-serif'
              }}>
                Oops! Something went wrong.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/homepage')}
                sx={{ 
                  backgroundColor: '#FF595E',
                  fontSize: '1.2rem',
                  px: 4,
                  py: 2,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  '&:hover': { backgroundColor: '#E04549' }
                }}
              >
                Go Home
              </Button>
            </Paper>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      minHeight: "100vh",
      width: "100%",
    }}>
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}>
        <Background />
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '20px', 
            backgroundColor: '#FFFAF4',
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
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '2.5rem',
                  margin: 0
                }}>
                  Personal Hygiene
                </Typography>
              </div>
              <Typography variant="h6" sx={{ 
                color: '#280B60',
                mb: 3,
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.2rem'
              }}>
                Learn about keeping clean and healthy!
              </Typography>
              
              {showTip && (
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  backgroundColor: '#FFCA3A',
                  borderRadius: '20px',
                  border: '2px solid #280B60'
                }}>
                  <Typography variant="body1" sx={{ 
                    color: '#280B60', 
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {showTip}
                  </Typography>
                </Paper>
              )}
            </Box>

            <Box mb={4}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ 
                  color: '#280B60', 
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  Item {currentItemIndex + 1} of {activityData.items.length}
                </Typography>
                <Chip 
                  label={`Score: ${score}/${activityData.items.length}`} 
                  sx={{
                    backgroundColor: '#FF595E',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    fontFamily: 'Poppins, sans-serif',
                    borderRadius: '20px',
                    px: 2
                  }}
                />
              </Stack>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ 
                  height: 12, 
                  borderRadius: '20px',
                  backgroundColor: '#E8E8E8',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: '20px',
                    backgroundColor: '#90BE6D'
                  }
                }} 
              />
            </Box>

            <Paper sx={{ 
              p: 3, 
              mb: 4,
              backgroundColor: '#1982C4',
              borderRadius: '20px',
              border: '2px solid #280B60'
            }}>
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                textAlign: 'center',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {activityData.instructions}
              </Typography>
            </Paper>

            {!gameCompleted && (
              <Box mb={4}>
                <Typography variant="h5" sx={{ 
                  color: '#FF595E', 
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  mb: 3,
                  fontFamily: 'Poppins, sans-serif'
                }}>
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'scale(1.03)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = '#FFFAF4';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.cursor = 'grabbing';
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={currentItem?.imageUrl}
                      alt={currentItem?.name}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        objectFit: 'contain',
                        mb: 2
                      }}
                    />
                    <Typography variant="h6" sx={{ 
                      color: '#280B60', 
                      fontWeight: 'bold',
                      mb: 1,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '1.5em'
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
              </Box>
            )}

            <Typography variant="h5" sx={{ 
              color: '#FF595E', 
              fontWeight: 'bold', 
              textAlign: 'center',
              mb: 3,
              fontFamily: 'Poppins, sans-serif'
            }}>
              Drop it here:
            </Typography>

            <Grid container spacing={3} mb={4} justifyContent="center">
              {activityData.categories.map(category => (
                <Grid item xs={12} md={4} key={category.id}>
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, category.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, category)}
                    style={{
                      width: '100%',
                      minHeight: '320px',
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
                    onMouseEnter={(e) => {
                      if (dropZoneActive !== category.id) {
                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (dropZoneActive !== category.id) {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 2 }}>
                      {category.emoji}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold',
                      color: '#280B60',
                      mb: 1,
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '1.5em'
                    }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#280B60',
                      mb: 3,
                      fontFamily: 'Inter, sans-serif'
                    }}>
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
                          <Typography variant="body2" sx={{ 
                            color: '#999',
                            fontFamily: 'Inter, sans-serif'
                          }}>
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
                              sx={{ 
                                width: 50, 
                                height: 50, 
                                objectFit: 'contain',
                                mx: 'auto',
                                mb: 1
                              }}
                            />
                            <Typography variant="caption" sx={{ 
                              fontWeight: 'bold',
                              fontFamily: 'Poppins, sans-serif',
                              color: '#280B60'
                            }}>
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
                sx={{ 
                  borderColor: '#FF595E',
                  color: '#FF595E',
                  px: 4,
                  py: 2,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#E04549',
                    backgroundColor: 'rgba(255, 89, 94, 0.1)',
                    borderWidth: '2px'
                  }
                }}
              >
                Start Over
              </Button>
              <Button 
                variant="outlined"
                onClick={handleGoHome}
                sx={{ 
                  borderColor: '#1982C4',
                  color: '#1982C4',
                  px: 4,
                  py: 2,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#1568A0',
                    backgroundColor: 'rgba(25, 130, 196, 0.1)',
                    borderWidth: '2px'
                  }
                }}
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
              <CheckCircleIcon sx={{ 
                fontSize: 80,
                color: feedbackData?.isCorrect ? '#90BE6D' : '#FFCA3A',
                mb: 2
              }} />
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold',
                color: '#280B60',
                fontFamily: 'Poppins, sans-serif'
              }}>
                {feedbackData?.isCorrect ? 'Great job!' : 'Good try!'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ 
                color: '#280B60',
                fontFamily: 'Inter, sans-serif'
              }}>
                {feedbackData?.isCorrect 
                  ? `${feedbackData.item?.name} goes in ${feedbackData.category?.name}!`
                  : `${feedbackData?.item?.name} goes in ${activityData.categories.find(cat => cat.id === feedbackData?.item?.category)?.name}.`
                }
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button 
                onClick={handleNext} 
                variant="contained"
                sx={{ 
                  backgroundColor: '#FF595E',
                  px: 5,
                  py: 2,
                  borderRadius: '20px',
                  fontSize: '1.2rem',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  '&:hover': { backgroundColor: '#E04549' }
                }}
              >
                {currentItemIndex < activityData.items.length - 1 ? 'Next Item' : 'Finish'}
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
              <EmojiEventsIcon sx={{ 
                fontSize: 100,
                color: '#FFCA3A',
                mb: 2
              }} />
              <div style={{
                display: "inline-block",
                backgroundColor: "#540D6E",
                borderRadius: "40px",
                padding: "10px 25px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                marginBottom: "20px",
              }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '2rem',
                  margin: 0
                }}>
                  You did it!
                </Typography>
              </div>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {[...Array(getStarRating())].map((_, i) => (
                  <StarIcon key={i} sx={{ 
                    color: '#FFCA3A', 
                    fontSize: 50,
                    mx: 0.5
                  }} />
                ))}
                {[...Array(3 - getStarRating())].map((_, i) => (
                  <StarIcon key={i} sx={{ 
                    color: '#E0E0E0', 
                    fontSize: 50,
                    mx: 0.5
                  }} />
                ))}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 'bold',
                color: '#FF595E',
                mb: 2,
                fontFamily: 'Poppins, sans-serif'
              }}>
                Score: {score}/{activityData.items.length}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#280B60',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6
              }}>
                You learned about staying clean and healthy! Great job completing this lesson.
              </Typography>
              
              {progressSaving && (
                <Box sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: '#1982C4', 
                  borderRadius: '15px',
                  color: 'white'
                }}>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                    Saving your progress...
                  </Typography>
                </Box>
              )}
              
              {progressSaved && (
                <Box sx={{ 
                  mt: 3, 
                  p: 3, 
                  backgroundColor: '#90BE6D', 
                  borderRadius: '15px',
                  color: 'white'
                }}>
                  <CheckCircleIcon sx={{ mr: 1, fontSize: 24 }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
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
                  px: 4,
                  py: 2,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#E6B800',
                    backgroundColor: 'rgba(255, 202, 58, 0.1)',
                    borderWidth: '2px'
                  }
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
                  px: 5,
                  py: 2,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  '&:hover': { backgroundColor: '#E04549' }
                }}
              >
                {progressSaving ? 'Saving...' : 'Continue'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </div>
    </div>
  );
}