import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import RotateCcwIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Import ingredient images
import cookedRiceImg from "../../assets/cookingLevel4/cooked_rice.png";
import cookedEggImg from "../../assets/cookingLevel4/egg_cooked.png";
import eggImg from "../../assets/cookingLevel4/egg.png";
import riceImg from "../../assets/cookingLevel4/rice.png";

export default function CookingLevel4() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [step, setStep] = useState(0);
  const [riceWashed, setRiceWashed] = useState(false);
  const [riceCooked, setRiceCooked] = useState(false);
  const [eggCooked, setEggCooked] = useState(false);
  const [riceOnPlate, setRiceOnPlate] = useState(false);
  const [eggOnPlate, setEggOnPlate] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showWaterAnimation, setShowWaterAnimation] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSteam, setShowSteam] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const totalSteps = 7;

  const getStudentId = () => {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    
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

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          setLoading(false);
          return;
        }
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse && progressResponse.completed) {
          console.log("You've completed this level before!");
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        setProgressSaving(false);
        return;
      }
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: totalSteps,
        maxScore: totalSteps,
        completed: true,
        starsEarned: 3
      };
      
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      console.log('Progress saved successfully:', progressData);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  const instructions = [
    'Drag the Rice to the Faucet to wash it',
    'Tap the Faucet to wash the rice',
    'Drag the Rice to the Stove to cook it',
    'Drag the Egg to the Stove to fry it',
    'Tap the Stove to cook the egg',
    'Drag the Rice to the Plate',
    'Drag the Egg to the Plate'
  ];

  const playSuccessSound = () => {
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 523.25;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const speak = (text) => {
    if (soundEnabled && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const showMessage = (message, isSuccess = true) => {
    setFeedback(message);
    setShowFeedback(true);
    speak(message);
    if (isSuccess) {
      playSuccessSound();
    }
    setTimeout(() => setShowFeedback(false), 2500);
  };

  const markStepComplete = () => {
    setCompletedSteps(prev => [...prev, step]);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    
    if (step === 0 && draggedItem === 'rice' && target === 'faucet') {
      setStep(1);
      markStepComplete();
      showMessage('Great job! Now tap the faucet to wash the rice.');
    }
    else if (step === 2 && draggedItem === 'rice-washed' && target === 'stove') {
      setRiceCooked(true);
      setShowSteam(true);
      markStepComplete();
      showMessage('Rice is cooking! Well done.');
      setTimeout(() => {
        setStep(3);
        setShowSteam(false);
      }, 3000);
    }
    else if (step === 3 && draggedItem === 'egg' && target === 'stove') {
      setStep(4);
      markStepComplete();
      showMessage('Good! Now tap the stove to cook the egg.');
    }
    else if (step === 5 && draggedItem === 'rice-cooked' && target === 'plate') {
      setRiceOnPlate(true);
      setStep(6);
      markStepComplete();
      showMessage('Perfect! Now add the egg to the plate.');
    }
    else if (step === 6 && draggedItem === 'egg-cooked' && target === 'plate') {
      setEggOnPlate(true);
      markStepComplete();
      setTimeout(() => {
        showMessage('Delicious! You made Fried Egg with Rice!');
        saveProgress();
      }, 500);
    }
    else if (draggedItem) {
      showMessage('Try again! Follow the instructions above.', false);
    }
    
    setDraggedItem(null);
  };

  const handleFaucetClick = () => {
    if (step === 1) {
      setShowWaterAnimation(true);
      showMessage('Great job washing the rice!');
      setTimeout(() => {
        setShowSparkles(true);
      }, 1000);
      setTimeout(() => {
        setRiceWashed(true);
        setShowWaterAnimation(false);
        setShowSparkles(false);
        setStep(2);
        markStepComplete();
      }, 2500);
    }
  };

  const handleStoveClick = () => {
    if (step === 4) {
      setEggCooked(true);
      setShowSteam(true);
      markStepComplete();
      showMessage('Yummy! You fried the egg.');
      setTimeout(() => {
        setStep(5);
        setShowSteam(false);
      }, 3000);
    }
  };

  const resetGame = () => {
    setStep(0);
    setRiceWashed(false);
    setRiceCooked(false);
    setEggCooked(false);
    setRiceOnPlate(false);
    setEggOnPlate(false);
    setFeedback('');
    setShowFeedback(false);
    setShowWaterAnimation(false);
    setShowSparkles(false);
    setShowSteam(false);
    setCompletedSteps([]);
    setProgressSaved(false);
    setProgressSaving(false);
    speak("Let's cook again!");
  };

  const goToHomepage = () => {
    navigate('/homepage');
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    setTimeout(() => {
      navigate('/lesson/cooking/level-5');
    }, 300);
  };

  const isComplete = riceOnPlate && eggOnPlate;

  if (loading) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${kitchenBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}>
        <Box sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1
        }} />
        <Container sx={{ 
          py: 8, 
          textAlign: 'center', 
          position: 'relative', 
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <CircularProgress size={60} sx={{ color: '#4CAF50', mb: 3 }} />
          <Typography variant="h5" sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)' 
          }}>
            Loading Cooking Game...
          </Typography>
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
      backgroundImage: `url(${kitchenBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        zIndex: 1
      }} />
      
      <Box sx={{ 
        position: 'relative', 
        zIndex: 2,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <style>
            {`
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
              @keyframes celebrate {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-10deg); }
                75% { transform: rotate(10deg); }
              }
              @keyframes waterFlow {
                0% { transform: translateY(0); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(40px); opacity: 0; }
              }
              @keyframes sparkle {
                0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
                50% { transform: scale(1) rotate(180deg); opacity: 1; }
              }
              @keyframes steam {
                0% { transform: translateY(0) scale(1); opacity: 0.8; }
                100% { transform: translateY(-30px) scale(1.5); opacity: 0; }
              }
              @keyframes checkmark {
                0% { transform: scale(0) rotate(-45deg); }
                50% { transform: scale(1.2) rotate(-45deg); }
                100% { transform: scale(1) rotate(-45deg); }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 50,
                padding: '12px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: soundEnabled ? '#4CAF50' : '#757575',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {soundEnabled ? <VolumeUpIcon sx={{ color: 'white' }} /> : <VolumeOffIcon sx={{ color: 'white' }} />}
            </button>

            <Typography variant="h3" sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: 'white',
              mb: 3,
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)'
            }}>
              Level 4: Guided Recipe
            </Typography>

            <Box sx={{
              backgroundColor: 'rgba(255, 152, 0, 0.9)',
              color: 'white',
              padding: '20px',
              borderRadius: '15px',
              textAlign: 'center',
              mb: 3,
              fontSize: '24px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              {isComplete ? 'Recipe Complete!' : instructions[step]}
            </Box>

            <Box sx={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '15px',
              mb: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>
                  Step {Math.min(step + 1, totalSteps)} of {totalSteps}
                </Typography>
                <Box sx={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {completedSteps.length}/{totalSteps} completed
                </Box>
              </Box>
              <Box sx={{
                width: '100%',
                backgroundColor: '#E0E0E0',
                borderRadius: '10px',
                height: '16px',
                overflow: 'hidden',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Box sx={{
                  background: 'linear-gradient(90deg, #4CAF50, #66BB6A)',
                  height: '100%',
                  borderRadius: '10px',
                  width: `${(completedSteps.length / totalSteps) * 100}%`,
                  transition: 'width 0.5s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, gap: 1 }}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      flex: 1,
                      height: '40px',
                      backgroundColor: completedSteps.includes(index) ? '#4CAF50' : '#E0E0E0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '20px',
                      transition: 'all 0.3s ease',
                      boxShadow: completedSteps.includes(index) ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none'
                    }}
                  >
                    {completedSteps.includes(index) && (
                      <Box sx={{ animation: 'checkmark 0.5s ease' }}>✓</Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
              {/* Ingredients Panel */}
              <Box sx={{
                background: 'linear-gradient(135deg, white, #FFE0B2)',
                borderRadius: '20px',
                padding: '20px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                border: '2px solid #FF9800'
              }}>
                <Typography variant="h5" sx={{
                  fontWeight: 'bold',
                  color: '#E65100',
                  mb: 2,
                  textAlign: 'center',
                  borderBottom: '3px solid #FFB74D',
                  pb: 1
                }}>
                  Ingredients
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {step === 0 && !riceWashed && (
                    <Box
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'rice')}
                      sx={{
                        background: 'linear-gradient(135deg, #FFF9C4, #FFE082)',
                        border: '4px solid #FF9800',
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'grab',
                        textAlign: 'center',
                        boxShadow: '0 6px 16px rgba(255, 152, 0, 0.3)',
                        animation: 'pulse 2s infinite',
                        position: 'relative',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    >
                      <Box
                        component="img"
                        src={riceImg}
                        alt="Rice"
                        sx={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'contain',
                          mb: 1
                        }}
                      />
                      <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: '#1A237E' }}>
                        Pot with Rice
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#E65100', fontWeight: 'bold', mt: 0.5 }}>
                        Drag me!
                      </Typography>
                    </Box>
                  )}

                  {riceWashed && step === 2 && !riceCooked && (
                    <Box
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'rice-washed')}
                      sx={{
                        background: 'linear-gradient(135deg, #B3E5FC, #81D4FA)',
                        border: '4px solid #0277BD',
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'grab',
                        textAlign: 'center',
                        boxShadow: '0 6px 16px rgba(2, 119, 189, 0.3)',
                        animation: 'pulse 2s infinite',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    >
                      <Box
                        component="img"
                        src={riceImg}
                        alt="Clean Rice"
                        sx={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'contain',
                          mb: 1,
                          filter: 'brightness(1.1)'
                        }}
                      />
                      <Box sx={{ fontSize: '24px', mb: 1 }}>💧✨</Box>
                      <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: '#01579B' }}>
                        Clean Rice
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#0277BD', fontWeight: 'bold', mt: 0.5 }}>
                        Drag me!
                      </Typography>
                    </Box>
                  )}

                  {step === 3 && !eggCooked && (
                    <Box
                      draggable
                      onDragStart={(e) => handleDragStart(e, 'egg')}
                      sx={{
                        background: 'linear-gradient(135deg, #FFF9C4, #FFF176)',
                        border: '4px solid #F57C00',
                        borderRadius: '16px',
                        padding: '16px',
                        cursor: 'grab',
                        textAlign: 'center',
                        boxShadow: '0 6px 16px rgba(245, 124, 0, 0.3)',
                        animation: 'pulse 2s infinite',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    >
                      <Box
                        component="img"
                        src={eggImg}
                        alt="Raw Egg"
                        sx={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'contain',
                          mb: 1
                        }}
                      />
                      <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: '#E65100' }}>
                        Raw Egg
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#E65100', fontWeight: 'bold', mt: 0.5 }}>
                        Drag me!
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Cooking Area */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* Faucet */}
                <Box sx={{
                  background: 'linear-gradient(135deg, white, #E3F2FD)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  border: '2px solid #2196F3',
                  minWidth: '200px'
                }}>
                  <Typography variant="h6" sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#01579B',
                    mb: 2,
                    borderBottom: '3px solid #0277BD',
                    pb: 1
                  }}>
                    🚰 Wash
                  </Typography>
                  <Box
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'faucet')}
                    onClick={handleFaucetClick}
                    sx={{
                      minHeight: '160px',
                      borderRadius: '16px',
                      border: step <= 1 ? '4px dashed #0277BD' : '4px solid #BDBDBD',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#E3F2FD',
                      cursor: step === 1 ? 'pointer' : 'default',
                      animation: step === 1 ? 'pulse 2s infinite' : 'none',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ fontSize: '72px', mb: 2 }}>🚰</Box>
                    {showWaterAnimation && (
                      <Box sx={{ position: 'absolute', bottom: '40px' }}>
                        {[...Array(4)].map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              position: 'absolute',
                              width: '8px',
                              height: '20px',
                              background: 'linear-gradient(to bottom, rgba(100, 181, 246, 0.8), rgba(33, 150, 243, 0.9))',
                              borderRadius: '4px',
                              animation: `waterFlow 0.8s infinite ${i * 0.2}s`
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    {showSparkles && (
                      <Box sx={{ fontSize: '20px' }}>
                        {[...Array(3)].map((_, i) => (
                          <span key={i} style={{ animation: `sparkle 1s infinite ${i * 0.3}s` }}>✨</span>
                        ))}
                      </Box>
                    )}
                    {step === 1 && (
                      <Typography sx={{ 
                        color: '#0277BD', 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(2, 119, 189, 0.1)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        animation: 'pulse 1s infinite'
                      }}>
                        Tap me!
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Stove */}
                <Box sx={{
                  background: 'linear-gradient(135deg, white, #FFEBEE)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  border: '2px solid #F44336',
                  minWidth: '300px'
                }}>
                  <Typography variant="h6" sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#BF360C',
                    mb: 2,
                    borderBottom: '3px solid #D84315',
                    pb: 1
                  }}>
                    🔥 Cook
                  </Typography>
                  <Box
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'stove')}
                    onClick={handleStoveClick}
                    sx={{
                      minHeight: '180px',
                      background: 'linear-gradient(135deg, #424242, #212121)',
                      borderRadius: '12px',
                      border: (step === 2 || step === 4) ? '4px dashed #FF9800' : '4px solid #616161',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: step === 4 ? 'pointer' : 'default',
                      animation: (step === 2 || step === 4) ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {(step >= 2 && step <= 5) && (
                      <Box sx={{
                        position: 'absolute',
                        bottom: '20px',
                        width: '70px',
                        height: '70px',
                        background: 'radial-gradient(circle, #FF5722 0%, #FF6F00 40%, #E65100 70%)',
                        borderRadius: '50%',
                        boxShadow: '0 0 30px rgba(255, 87, 34, 0.8)',
                        animation: 'pulse 0.5s infinite alternate'
                      }} />
                    )}
                    {riceCooked && !riceOnPlate && (
                      <Box 
                        draggable={step === 5}
                        onDragStart={(e) => step === 5 && handleDragStart(e, 'rice-cooked')}
                        sx={{ 
                          position: 'absolute', 
                          top: '20px',
                          cursor: step === 5 ? 'grab' : 'default',
                          animation: step === 5 ? 'pulse 2s infinite' : 'none'
                        }}
                      >
                        <Box
                          component="img"
                          src={cookedRiceImg}
                          alt="Cooked Rice"
                          sx={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'contain'
                          }}
                        />
                        {showSteam && [...Array(3)].map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              position: 'absolute',
                              top: '-20px',
                              left: `${i * 15}px`,
                              fontSize: '20px',
                              animation: `steam 2s infinite ${i * 0.4}s`
                            }}
                          >
                            💨
                          </Box>
                        ))}
                      </Box>
                    )}
                    {eggCooked && !eggOnPlate && (
                      <Box 
                        draggable={step === 6}
                        onDragStart={(e) => step === 6 && handleDragStart(e, 'egg-cooked')}
                        sx={{ 
                          position: 'absolute', 
                          top: '20px', 
                          right: '20px',
                          cursor: step === 6 ? 'grab' : 'default',
                          animation: step === 6 ? 'pulse 2s infinite' : 'none'
                        }}
                      >
                        <Box
                          component="img"
                          src={cookedEggImg}
                          alt="Fried Egg"
                          sx={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'contain'
                          }}
                        />
                        {showSteam && [...Array(2)].map((_, i) => (
                          <Box
                            key={i}
                            sx={{
                              position: 'absolute',
                              top: '-20px',
                              left: `${i * 20}px`,
                              fontSize: '20px',
                              animation: `steam 2s infinite ${i * 0.5}s`
                            }}
                          >
                            💨
                          </Box>
                        ))}
                      </Box>
                    )}
                    {step === 4 && (
                      <Typography sx={{ 
                        position: 'absolute',
                        bottom: '10px',
                        color: '#FF9800', 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(255, 152, 0, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        animation: 'pulse 1s infinite'
                      }}>
                        Tap me!
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Plate */}
                <Box sx={{
                  background: 'linear-gradient(135deg, white, #F3E5F5)',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  border: '2px solid #7B1FA2',
                  minWidth: '250px'
                }}>
                  <Typography variant="h6" sx={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#4A148C',
                    mb: 2,
                    borderBottom: '3px solid #7B1FA2',
                    pb: 1
                  }}>
                    🍽️ Serve
                  </Typography>
                  <Box
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'plate')}
                    sx={{
                      width: '180px',
                      height: '180px',
                      margin: '0 auto',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #FFFFFF 50%, #F5F5F5 80%, #E0E0E0 100%)',
                      border: (step === 5 || step === 6) ? '5px dashed #7B1FA2' : '5px solid #BDBDBD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: (step === 5 || step === 6) 
                        ? '0 0 40px rgba(156, 39, 176, 0.5), inset 0 2px 8px rgba(0,0,0,0.05)' 
                        : 'inset 0 2px 8px rgba(0,0,0,0.05), 0 4px 15px rgba(0,0,0,0.1)',
                      animation: (step === 5 || step === 6) ? 'pulse 2s infinite' : 'none',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ position: 'absolute', width: '160px', height: '160px', borderRadius: '50%', border: '2px solid rgba(189, 189, 189, 0.3)' }} />
                    <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      {riceOnPlate && (
                        <Box
                          component="img"
                          src={cookedRiceImg}
                          alt="Cooked Rice"
                          sx={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'contain'
                          }}
                        />
                      )}
                      {eggOnPlate && (
                        <Box
                          component="img"
                          src={cookedEggImg}
                          alt="Fried Egg"
                          sx={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'contain'
                          }}
                        />
                      )}
                      {!riceOnPlate && !eggOnPlate && (
                        <Typography sx={{ color: '#757575', fontWeight: 'bold', fontSize: '16px' }}>
                          {(step === 5 || step === 6) ? 'Drop here!' : 'Empty'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Bottom Controls */}
            <Box sx={{
              position: 'fixed',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 40,
              display: 'flex',
              gap: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '12px 24px',
              borderRadius: '50px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Button
                onClick={resetGame}
                variant="contained"
                sx={{
                  backgroundColor: '#FF9800',
                  borderRadius: '25px',
                  '&:hover': { backgroundColor: '#F57C00' }
                }}
                startIcon={<RotateCcwIcon />}
              >
                Reset
              </Button>
              <Button
                onClick={goToHomepage}
                variant="contained"
                sx={{
                  backgroundColor: '#2196F3',
                  borderRadius: '25px',
                  '&:hover': { backgroundColor: '#1976D2' }
                }}
              >
                Home
              </Button>
            </Box>
          </div>
        </Box>
      </Box>

      {/* Feedback Message */}
      {showFeedback && (
        <Box sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          background: 'linear-gradient(90deg, #4CAF50, #66BB6A)',
          color: 'white',
          padding: '20px 32px',
          borderRadius: '20px',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          {feedback}
        </Box>
      )}

      {/* Success Dialog */}
      <Dialog
        open={isComplete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 248, 220, 0.98)',
            border: '4px solid #4CAF50'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
          <EmojiEventsIcon sx={{ fontSize: 100, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            Good Job!
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            {[...Array(3)].map((_, i) => (
              <StarIcon key={i} sx={{ color: '#FFCA3A', fontSize: 50, mx: 0.5 }} />
            ))}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 'bold', 
            color: '#FF9800', 
            mb: 2,
            fontSize: '1.8rem'
          }}>
            Perfect! 🍳
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#2E7D32', 
            lineHeight: 1.6, 
            mb: 2,
            fontSize: '1.1rem'
          }}>
            You collected all the ingredients needed to make a delicious fried egg! 
            You gathered the egg, oil, salt, and butter - everything a chef needs!
          </Typography>
          <Typography variant="body2" sx={{ 
            color: '#666', 
            fontStyle: 'italic',
            fontSize: '1rem'
          }}>
            Now you're ready to cook! Remember to always ask an adult to help when using the stove.
          </Typography>
          
          {progressSaving && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.9)', borderRadius: '12px', color: 'white' }}>
              <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
              <Typography variant="body2">Saving your progress...</Typography>
            </Box>
          )}
          
          {progressSaved && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.9)', borderRadius: '12px', color: 'white' }}>
              <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">Progress saved successfully!</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button 
            onClick={continueToNextLevel}
            disabled={progressSaving}
            variant="contained"
            size="large"
            sx={{ 
              backgroundColor: '#4CAF50',
              borderRadius: '15px',
              minWidth: '120px'
            }}
          >
            {progressSaving ? 'Saving...' : 'Next Level'}
          </Button>
          <Button 
            onClick={resetGame}
            variant="outlined"
            size="large"
            sx={{ 
              borderColor: '#FF9800', 
              color: '#FF9800',
              borderRadius: '15px',
              minWidth: '120px',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
                backgroundColor: 'rgba(255, 152, 0, 0.1)'
              }
            }}
          >
            Play Again
          </Button>
          <Button 
            onClick={goToHomepage}
            variant="contained"
            size="large"
            sx={{ 
              backgroundColor: '#2196F3',
              borderRadius: '15px',
              minWidth: '120px'
            }}
          >
            Home
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}