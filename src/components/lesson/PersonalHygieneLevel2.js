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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import Background from '../Background';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BathtubIcon from '@mui/icons-material/Bathtub';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

export default function PersonalHygieneLevel2() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [selectedSequence, setSelectedSequence] = useState([]);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');

  const getStudentId = () => {
    const studentId = localStorage.getItem('studentId');
    const userType = localStorage.getItem('userType');
    
    console.log("Getting student ID - Type:", userType, "ID:", studentId);
    
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

  const routineActivities = [
    {
      id: 1,
      title: "Morning Hygiene Routine",
      icon: <WbSunnyIcon sx={{ fontSize: 50, color: '#FFD700' }} />,
      description: "Put these morning activities in the right order!",
      color: '#FFF9C4',
      borderColor: '#FBC02D',
      correctSequence: [
        { id: 1, name: "Wake up and stretch", icon: "🌅", hint: "First thing when you wake up" },
        { id: 2, name: "Use the toilet", icon: "🚽", hint: "Take care of bathroom needs" },
        { id: 3, name: "Wash hands", icon: "🧼", hint: "Clean hands after toilet" },
        { id: 4, name: "Brush teeth", icon: "🦷", hint: "Clean your teeth" },
        { id: 5, name: "Wash face", icon: "💧", hint: "Fresh, clean face" },
        { id: 6, name: "Get dressed", icon: "👕", hint: "Put on clean clothes" }
      ]
    },
    {
      id: 2,
      title: "Bath Time Routine",
      icon: <BathtubIcon sx={{ fontSize: 50, color: '#4FC3F7' }} />,
      description: "What's the best order for taking a bath?",
      color: '#E3F2FD',
      borderColor: '#1976D2',
      correctSequence: [
        { id: 1, name: "Remove clothes", icon: "👔", hint: "Take off dirty clothes first" },
        { id: 2, name: "Turn on water", icon: "🚿", hint: "Get the water ready" },
        { id: 3, name: "Check water temperature", icon: "🌡️", hint: "Make sure it's not too hot" },
        { id: 4, name: "Wet your body", icon: "💦", hint: "Get yourself wet all over" },
        { id: 5, name: "Apply soap/body wash", icon: "🧴", hint: "Put soap on your body" },
        { id: 6, name: "Scrub and clean", icon: "🧽", hint: "Wash yourself thoroughly" },
        { id: 7, name: "Rinse off soap", icon: "🚿", hint: "Wash all the soap away" },
        { id: 8, name: "Dry with towel", icon: "🏖️", hint: "Get dry and warm" }
      ]
    },
    {
      id: 3,
      title: "Before Bed Routine",
      icon: <NightsStayIcon sx={{ fontSize: 50, color: '#9C27B0' }} />,
      description: "Get ready for a good night's sleep!",
      color: '#F3E5F5',
      borderColor: '#7B1FA2',
      correctSequence: [
        { id: 1, name: "Brush teeth", icon: "🦷", hint: "Clean teeth before bed" },
        { id: 2, name: "Wash face", icon: "💧", hint: "Remove dirt from the day" },
        { id: 3, name: "Use the toilet", icon: "🚽", hint: "Last bathroom break" },
        { id: 4, name: "Wash hands", icon: "🧼", hint: "Clean hands again" },
        { id: 5, name: "Put on pajamas", icon: "🌙", hint: "Comfortable clothes for sleep" }
      ]
    },
    {
      id: 4,
      title: "After Eating Routine",
      icon: <RestaurantIcon sx={{ fontSize: 50, color: '#FF6B35' }} />,
      description: "What should you do after eating?",
      color: '#FFF3E0',
      borderColor: '#F57C00',
      correctSequence: [
        { id: 1, name: "Clear your plate", icon: "🍽️", hint: "Put away your dishes" },
        { id: 2, name: "Wipe your mouth", icon: "🧻", hint: "Clean your face" },
        { id: 3, name: "Brush teeth or rinse", icon: "🦷", hint: "Clean your teeth" },
        { id: 4, name: "Wash hands", icon: "🧼", hint: "Always wash after eating" }
      ]
    }
  ];

  const currentActivity = routineActivities[currentActivityIndex];
  const progressPercentage = ((currentActivityIndex + (gameCompleted ? 1 : 0)) / routineActivities.length) * 100;

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const [shuffledItems, setShuffledItems] = useState([]);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          console.log('Missing studentId or lessonId:', { studentId, lessonId });
          return;
        }
        
        console.log('Fetching progress for student:', studentId, 'lesson:', lessonId);
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Great job! You finished this before. Want to try again?");
          }
          console.log('Loaded existing progress:', progressResponse);
        } else {
          console.log('No existing progress found - starting fresh');
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
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
            id: lessonId || 2,
            title: "Personal Hygiene Level 2",
            description: "Learn the right order for daily hygiene routines!",
            level: 2
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

  useEffect(() => {
    if (currentActivity) {
      setShuffledItems(shuffleArray(currentActivity.correctSequence));
      setSelectedSequence([]);
    }
  }, [currentActivityIndex]);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    if (!draggedItem) return;

    const newSequence = [...selectedSequence];
    
    // Remove item from shuffled items
    setShuffledItems(prev => prev.filter(item => item.id !== draggedItem.id));
    
    // Insert at the correct position
    newSequence.splice(dropIndex, 0, draggedItem);
    setSelectedSequence(newSequence);
    setDraggedItem(null);
  };

  const handleRemoveFromSequence = (item, index) => {
    const newSequence = selectedSequence.filter((_, i) => i !== index);
    setSelectedSequence(newSequence);
    setShuffledItems(prev => [...prev, item]);
  };

  const checkSequence = () => {
    if (selectedSequence.length !== currentActivity.correctSequence.length) {
      setFeedbackData({
        isCorrect: false,
        message: "Please arrange all items in the sequence!"
      });
      setShowFeedback(true);
      return;
    }

    let correctCount = 0;
    const isCorrect = selectedSequence.every((item, index) => {
      const isItemCorrect = item.id === currentActivity.correctSequence[index].id;
      if (isItemCorrect) correctCount++;
      return isItemCorrect;
    });

    if (isCorrect) {
      setScore(prev => prev + 1);
      setCompletedActivities(prev => [...prev, currentActivity.id]);
    }

    setFeedbackData({
      isCorrect,
      correctCount,
      totalCount: currentActivity.correctSequence.length,
      message: isCorrect 
        ? "Perfect! You got the sequence exactly right!" 
        : `Good try! You got ${correctCount} out of ${currentActivity.correctSequence.length} in the right position.`
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFeedbackData(null);
    
    if (currentActivityIndex < routineActivities.length - 1) {
      setCurrentActivityIndex(prev => prev + 1);
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
      
      const finalScore = score;
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: routineActivities.length,
        completed: true,
        starsEarned: getStarRating()
      };
      
      console.log('Saving progress for student:', studentId, progressData);
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      
      console.log('Progress saved successfully!');
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  const resetGame = () => {
    setCurrentActivityIndex(0);
    setSelectedSequence([]);
    setCompletedActivities([]);
    setShowFeedback(false);
    setFeedbackData(null);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    setShuffledItems(shuffleArray(routineActivities[0].correctSequence));
  };

  const getStarRating = () => {
    const percentage = (score / routineActivities.length) * 100;
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
                  Personal Hygiene Level 2
                </Typography>
              </div>
              <Typography variant="h6" sx={{ 
                color: '#280B60',
                mb: 3,
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.2rem'
              }}>
                Learn the right order for daily hygiene routines!
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
                  Activity {currentActivityIndex + 1} of {routineActivities.length}
                </Typography>
                <Chip 
                  label={`Score: ${score}/${routineActivities.length}`} 
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

            {!gameCompleted && currentActivity && (
              <>
                <Paper sx={{ 
                  p: 3, 
                  mb: 4,
                  backgroundColor: currentActivity.color,
                  borderRadius: '20px',
                  border: `2px solid ${currentActivity.borderColor}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    {currentActivity.icon}
                    <Typography variant="h5" sx={{ 
                      color: '#280B60', 
                      fontWeight: 'bold',
                      ml: 2,
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      {currentActivity.title}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ 
                    color: '#280B60',
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    {currentActivity.description}
                  </Typography>
                </Paper>

                <Grid container spacing={4} mb={4}>
                  
                  {/* Available Items */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 3, 
                      backgroundColor: '#FFF3E0',
                      borderRadius: '20px',
                      border: '2px solid #FF9800',
                      minHeight: '450px'
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#E65100', 
                        fontWeight: 'bold',
                        mb: 3,
                        textAlign: 'center',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        Available Steps
                      </Typography>
                      
                      <Stack spacing={2}>
                        {shuffledItems.map((item) => (
                          <Card
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item)}
                            sx={{
                              cursor: 'grab',
                              backgroundColor: '#FFFFFF',
                              border: '2px solid #FF9800',
                              borderRadius: '15px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                cursor: 'grab'
                              },
                              '&:active': {
                                cursor: 'grabbing'
                              }
                            }}
                          >
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h4" sx={{ mr: 2 }}>
                                  {item.icon}
                                </Typography>
                                <Box>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 'bold',
                                    color: '#280B60',
                                    fontFamily: 'Poppins, sans-serif'
                                  }}>
                                    {item.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ 
                                    color: '#666',
                                    fontStyle: 'italic',
                                    fontFamily: 'Inter, sans-serif'
                                  }}>
                                    {item.hint}
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Sequence Area */}
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                      p: 3, 
                      backgroundColor: '#E8F5E8',
                      borderRadius: '20px',
                      border: '2px solid #4CAF50',
                      minHeight: '450px'
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#2E7D32', 
                        fontWeight: 'bold',
                        mb: 3,
                        textAlign: 'center',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        Put Steps in Order (1st to Last)
                      </Typography>
                      
                      <Stack spacing={1}>
                        {Array.from({ length: Math.max(6, currentActivity.correctSequence.length) }).map((_, index) => (
                          <Box
                            key={index}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            sx={{
                              minHeight: '60px',
                              p: 2,
                              border: dragOverIndex === index ? '3px dashed #4CAF50' : '2px dashed #ccc',
                              borderRadius: '10px',
                              backgroundColor: dragOverIndex === index ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Chip 
                              label={index + 1} 
                              sx={{ 
                                mr: 2,
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                fontWeight: 'bold',
                                width: '32px',
                                height: '32px'
                              }} 
                            />
                            
                            {selectedSequence[index] ? (
                              <Card sx={{ 
                                flex: 1,
                                backgroundColor: '#FFFFFF',
                                border: '2px solid #4CAF50',
                                borderRadius: '10px',
                                cursor: 'pointer'
                              }}
                              onClick={() => handleRemoveFromSequence(selectedSequence[index], index)}
                              >
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="h6" sx={{ mr: 2 }}>
                                      {selectedSequence[index].icon}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 'bold',
                                      color: '#280B60',
                                      fontFamily: 'Poppins, sans-serif'
                                    }}>
                                      {selectedSequence[index].name}
                                    </Typography>
                                  </Box>
                                </CardContent>
                              </Card>
                            ) : (
                              <Typography variant="body2" sx={{ 
                                color: '#999',
                                fontStyle: 'italic',
                                fontFamily: 'Inter, sans-serif'
                              }}>
                                Drop step {index + 1} here
                              </Typography>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                <Box textAlign="center" mb={4}>
                  <Button 
                    variant="contained"
                    onClick={checkSequence}
                    disabled={selectedSequence.length === 0}
                    sx={{ 
                      backgroundColor: '#FF595E',
                      px: 6,
                      py: 3,
                      borderRadius: '20px',
                      fontSize: '1.3rem',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: '600',
                      '&:hover': { backgroundColor: '#E04549' },
                      '&:disabled': { backgroundColor: '#ccc' }
                    }}
                  >
                    Check My Sequence!
                  </Button>
                </Box>
              </>
            )}

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
          
          {/* Feedback Dialog */}
          <Dialog
            open={showFeedback}
            maxWidth="md"
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
                {feedbackData?.isCorrect ? 'Perfect!' : 'Good Try!'}
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" sx={{ 
                color: '#280B60',
                fontFamily: 'Inter, sans-serif',
                mb: 3
              }}>
                {feedbackData?.message}
              </Typography>
              
              {!feedbackData?.isCorrect && (
                <Paper sx={{ 
                  p: 3, 
                  backgroundColor: '#FFF3E0',
                  borderRadius: '15px',
                  border: '2px solid #FF9800'
                }}>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 'bold',
                    color: '#E65100',
                    mb: 2,
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Correct Order:
                  </Typography>
                  <Stepper orientation="vertical">
                    {currentActivity?.correctSequence.map((step, index) => (
                      <Step key={step.id} active={true} completed={true}>
                        <StepLabel>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ mr: 1 }}>
                              {step.icon}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              fontFamily: 'Poppins, sans-serif',
                              color: '#280B60'
                            }}>
                              {step.name}
                            </Typography>
                          </Box>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>
              )}
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
                {currentActivityIndex < routineActivities.length - 1 ? 'Next Activity' : 'Finish Game'}
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
                  Level 2 Complete!
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
                Score: {score}/{routineActivities.length}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#280B60',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6
              }}>
                Excellent work! You've mastered daily hygiene routines and learned the proper sequence for staying clean and healthy. You're ready for even more advanced hygiene challenges!
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