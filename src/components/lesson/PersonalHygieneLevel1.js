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
  DialogContentText,
  DialogActions,
  Stack,
  LinearProgress,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import Background from '../Background';
import axios from 'axios';
import FaceIcon from '@mui/icons-material/Face';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import ToothbrushIcon from '@mui/icons-material/Brush';
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
  
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [placedItems, setPlacedItems] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [instructions, setInstructions] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showTip, setShowTip] = useState('');
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  
  const userId = localStorage.getItem('userId') || 0;
  
  const activityData = {
    instructions: "Drag each hygiene item to the correct category below.",
    categories: [
      { id: 1, name: "Body Care", icon: "body" },
      { id: 2, name: "Dental Care", icon: "dentistry" },
      { id: 3, name: "Hair Care", icon: "hairbrush" }
    ],
    items: [
      { id: 1, name: "Toothbrush", category: 2, imageUrl: toothbrush },
      { id: 2, name: "Toothpaste", category: 2, imageUrl: toothpaste },
      { id: 3, name: "Soap", category: 1, imageUrl: soap },
      { id: 4, name: "Body Lotion", category: 1, imageUrl: lotion },
      { id: 5, name: "Shampoo", category: 3, imageUrl: shampoo },
      { id: 6, name: "Sanitary pad", category: 1, imageUrl: pad },
      { id: 7, name: "Loofah", category: 1, imageUrl: loofah },
      { id: 8, name: "Deodorant", category: 1, imageUrl: deodorant },
      { id: 9, name: "Comb", category: 3, imageUrl: comb }
    ]
  };

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
        
        if (!studentId || !lessonId) return;
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          
          if (progressResponse.completed) {
            setShowTip("Welcome back! You've already completed this lesson, but you can practice again.");
          }
        }
      } catch (error) {
        console.log('No previous progress found, starting fresh');
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
            title: "Head Hygiene Fundamentals",
            description: "Learn about facial washing, dental care, and hair grooming",
            level: 1
          });
          
          setInstructions(activityData.instructions);
          setCategories(activityData.categories);
          setItems(activityData.items);
          
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching lesson data:', err);
        setError(err.message || 'Failed to load activity');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);
  
  const handleItemClick = (item) => {
    setFeedback({
      promptForCategory: true,
      item: item
    });
  };
  
  const handleCategorySelect = (category) => {
    const item = feedback.item;
    
    const isCorrect = item.category === category.id;
    
    setPlacedItems(prev => ({
      ...prev,
      [item.id]: {
        categoryId: category.id,
        isCorrect
      }
    }));
    
    setFeedback({
      promptForCategory: false,
      item: item.name,
      category: category.name,
      isCorrect
    });
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setAttempts(prev => prev + 1);
  };
  
  const saveProgress = async () => {
    if (progressSaving || progressSaved) {
      console.log('Progress already saving or saved, skipping...');
      return;
    }

    try {
      setProgressSaving(true);
      const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
      
      if (!studentId || !lessonId) {
        console.error('Missing studentId or lessonId');
        return;
      }
      
      const starsEarned = getStarRating();
      
      const progressData = {
        score: score,
        maxScore: items.length,
        completed: true,
        starsEarned: starsEarned,
        timestamp: new Date().toISOString()
      };
      
      console.log('Starting progress save process...', {
        studentId,
        lessonId,
        moduleId,
        progressData
      });
      
      console.log('Step 1: Saving lesson progress...');
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      console.log('✓ Lesson progress saved successfully');
      
      const targetModuleId = moduleId || lesson?.module?.id || 1;
      console.log('Step 2: Updating module progress...', { targetModuleId });
      
      const moduleProgressResult = await updateModuleProgress(studentId, targetModuleId);
      console.log('✓ Module progress updated successfully:', moduleProgressResult);
      
      setProgressSaved(true);
      console.log('✓ All progress saved successfully!');
      
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };
  
  useEffect(() => {
    if (items.length > 0 && Object.keys(placedItems).length === items.length) {
      console.log('Game completed! All items placed.');
      setGameCompleted(true);
      
      const correctPlacements = Object.values(placedItems).filter(item => item.isCorrect).length;
      setScore(correctPlacements);
      
      console.log('Final score:', correctPlacements, '/', items.length);
      
      setTimeout(() => {
        setShowSuccess(true);
        
        try {
          const successSound = new Audio('/sounds/success.mp3');
          successSound.volume = 0.5;
          successSound.play().catch(e => console.log('Sound play failed: ', e));
        } catch (e) {
        }
        
        saveProgress();
      }, 800);
    }
  }, [placedItems, items.length, score]);
  
  useEffect(() => {
    if (gameCompleted && !showSuccess) {
      setShowSuccess(true);
    }
  }, [gameCompleted, showSuccess]);

  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        const studentId = localStorage.getItem('studentId') || localStorage.getItem('userId');
        
        if (!studentId || !lessonId) return;
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        
        if (progressResponse && progressResponse.completed) {
          setGameCompleted(true);
          if (progressResponse.score !== undefined) {
            setScore(progressResponse.score);
          }
        }
      } catch (error) {
      }
    };
    
    checkCompletionStatus();
  }, [lessonId]);
  
  const resetGame = () => {
    setPlacedItems({});
    setFeedback(null);
    setShowSuccess(false);
    setScore(0);
    setAttempts(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
  };
  
  const getCategoryItems = (categoryId) => {
    return Object.entries(placedItems)
      .filter(([_, data]) => data.categoryId === categoryId)
      .map(([itemId]) => items.find(i => i.id === parseInt(itemId)));
  };
  
  const progressPercentage = items.length > 0 ? (Object.keys(placedItems).length / items.length) * 100 : 0;
  
  const unplacedItems = items.filter(item => !Object.keys(placedItems).includes(item.id.toString()));

  const getStarRating = () => {
    if (!items.length) return 0;
    const percentage = (score / items.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const handleContinue = async () => {
    console.log('Continue button clicked');
    
    if (!progressSaved && !progressSaving) {
      console.log('Progress not yet saved, saving now...');
      await saveProgress();
    }
    
    setTimeout(() => {
      const targetModuleId = moduleId || lesson?.module?.id || 1;
      console.log('Navigating to module:', targetModuleId);
      navigate(`/module/${targetModuleId}`);
    }, 500);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  const getCategoryIcon = (iconName) => {
    switch(iconName) {
      case 'face':
        return <FaceIcon />;
      case 'dentistry':
        return <ToothbrushIcon />;
      case 'hairbrush':
        return <ContentCutIcon />;
      default:
        return null;
    }
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
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
              Loading activity...
            </Typography>
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
            <Typography variant="h5" color="error" gutterBottom sx={{ color: 'white' }}>
              {error}
            </Typography>
            <Button variant="contained" onClick={() => navigate('/homepage')}>
              Return to Homepage
            </Button>
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
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              mb: 4,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)"
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              {lesson?.title || "Head Hygiene Fundamentals"}
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Level {lesson?.level || 1}: {lesson?.description || "Learn about different hygiene items for body care, hair care, and dental care."}
            </Typography>
            
            {showTip && (
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body1">{showTip}</Typography>
              </Paper>
            )}
            
            <Box sx={{ mb: 3 }}>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage} 
                sx={{ height: 10, borderRadius: 5 }} 
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress: {Math.round(progressPercentage)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: {score}/{items.length}
                </Typography>
              </Box>
            </Box>
            
            <Card sx={{ mb: 4, backgroundColor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Instructions
                </Typography>
                <Typography variant="body1">
                  {instructions}
                </Typography>
              </CardContent>
            </Card>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Hygiene Items
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2,
                    mb: 4, 
                    justifyContent: { xs: 'center', sm: 'flex-start' } 
                  }}
                >
                  {unplacedItems.map(item => (
                    <Paper
                      key={item.id}
                      sx={{
                        p: 1,
                        minWidth: 120,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          boxShadow: '0 5px 10px rgba(0, 0, 0, 0.2)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                      onClick={() => handleItemClick(item)}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CardMedia
                          component="img"
                          image={item.imageUrl || "/api/placeholder/100/100"}
                          alt={item.name}
                          sx={{ width: 80, height: 80, objectFit: 'contain', mb: 1 }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {item.name}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                  {unplacedItems.length === 0 && (
                    <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                      All items have been placed!
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ mb: 4 }} />
              </Grid>
              
              {categories.map(category => (
                <Grid item xs={12} md={4} key={category.id}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    {getCategoryIcon(category.icon)}
                    <Typography variant="h6" fontWeight="bold">
                      {category.name}
                    </Typography>
                  </Stack>
                  <Paper
                    sx={{
                      p: 2,
                      minHeight: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: 'grey.100',
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    {getCategoryItems(category.id).map(item => (
                      <Box key={item.id} sx={{ m: 1, position: 'relative' }}>
                        <Paper
                          sx={{
                            p: 1,
                            minWidth: 120,
                            textAlign: 'center',
                            opacity: 0.8
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <CardMedia
                              component="img"
                              image={item.imageUrl || "/api/placeholder/100/100"}
                              alt={item.name}
                              sx={{ width: 80, height: 80, objectFit: 'contain', mb: 1 }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {item.name}
                            </Typography>
                          </Box>
                          <CheckCircleIcon 
                            color={placedItems[item.id]?.isCorrect ? "success" : "error"}
                            sx={{ 
                              position: 'absolute', 
                              top: -8, 
                              right: -8,
                              backgroundColor: 'white',
                              borderRadius: '50%',
                            }} 
                          />
                        </Paper>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={resetGame}
              >
                Reset Game
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleGoHome}
              >
                Back to Home
              </Button>
            </Box>
          </Paper>
          
          <Dialog
            open={feedback?.promptForCategory === true}
            aria-labelledby="category-dialog-title"
          >
            <DialogTitle id="category-dialog-title">
              Select a category for {feedback?.item?.name}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant="outlined"
                    startIcon={getCategoryIcon(category.icon)}
                    onClick={() => handleCategorySelect(category)}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', py: 1 }}
                  >
                    {category.name}
                  </Button>
                ))}
              </Stack>
            </DialogContent>
          </Dialog>
          
          <Dialog
            open={feedback !== null && feedback.promptForCategory !== true}
            onClose={() => setFeedback(null)}
            aria-labelledby="feedback-dialog-title"
          >
            <DialogTitle id="feedback-dialog-title" sx={{ backgroundColor: feedback?.isCorrect ? 'success.light' : 'error.light' }}>
              {feedback?.isCorrect ? 'Correct!' : 'Not quite right'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mt: 2 }}>
                {feedback?.isCorrect 
                  ? `Good job! ${feedback?.item} belongs in ${feedback?.category}.` 
                  : `${feedback?.item} doesn't belong in ${feedback?.category}. Try again!`}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setFeedback(null)} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
          
          <Dialog
            open={showSuccess}
            onClose={() => setShowSuccess(false)}
            aria-labelledby="success-dialog-title"
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle id="success-dialog-title" sx={{ backgroundColor: 'success.light', textAlign: 'center' }}>
              <EmojiEventsIcon fontSize="large" sx={{ mb: 1 }} />
              <Typography variant="h5" component="div">
                Congratulations!
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h6" gutterBottom>
                You completed {lesson?.title || "Head Hygiene Fundamentals"}!
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                {[...Array(getStarRating())].map((_, i) => (
                  <StarIcon key={i} color="warning" fontSize="large" sx={{ mx: 0.5 }} />
                ))}
                {[...Array(3 - getStarRating())].map((_, i) => (
                  <StarIcon key={i} color="disabled" fontSize="large" sx={{ mx: 0.5 }} />
                ))}
              </Box>
              <Typography variant="body1" gutterBottom>
                You scored {score} out of {items.length} points.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Remember to practice these hygiene habits every day!
              </Typography>
              
              {progressSaving && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="info.contrastText">
                    Saving your progress...
                  </Typography>
                </Box>
              )}
              
              {progressSaved && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                  <CheckCircleIcon sx={{ mr: 1, color: 'success.contrastText' }} />
                  <Typography variant="body2" color="success.contrastText">
                    Progress saved successfully!
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button 
                onClick={() => {
                  setShowSuccess(false);
                  resetGame();
                }} 
                variant="outlined" 
                color="primary"
                sx={{ mr: 1 }}
              >
                Play Again
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleContinue}
                disabled={progressSaving}
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