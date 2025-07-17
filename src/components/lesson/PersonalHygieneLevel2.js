import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  Fade,
  Slide
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BacgroundImageLevel2 from '../../assets/BacgroundImageLevel2.jpg';

// Simple Navbar component matching Level 1
const Navbar = () => (
  <Box sx={{ 
    p: 2, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)'
  }}>
    <Typography variant="h6" sx={{ 
      color: 'white', 
      fontWeight: 'bold',
      fontFamily: 'Poppins, sans-serif'
    }}>
      Life Skills Learning
    </Typography>
  </Box>
);

// Enhanced Step Card Component with drag and drop
const StepCard = ({ step, isSelected, isDragging, showNumber, number, onDragStart, onDragEnd }) => (
  <Card
    draggable={!isSelected}
    onDragStart={onDragStart}
    onDragEnd={onDragEnd}
    sx={{
      cursor: isSelected ? 'default' : 'grab',
      background: isSelected 
        ? 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)'
        : 'linear-gradient(135deg, #FFFAF4 0%, #F8F9FA 100%)',
      border: isSelected 
        ? '3px solid #7BA05B' 
        : '3px solid #E3F2FD',
      borderRadius: '15px',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      boxShadow: isSelected 
        ? '0 8px 20px rgba(144, 190, 109, 0.4)' 
        : '0 4px 15px rgba(0, 0, 0, 0.1)',
      transform: isDragging ? 'rotate(3deg) scale(1.05)' : 'none',
      opacity: isDragging ? 0.7 : 1,
      '&:hover': !isSelected ? {
        transform: 'translateY(-3px) scale(1.02)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
        border: '3px solid #90BE6D'
      } : {},
      '&:active': !isSelected ? {
        cursor: 'grabbing'
      } : {},
      position: 'relative',
      minHeight: '80px'
    }}
  >
    {showNumber && (
      <Box sx={{ 
        position: 'absolute',
        top: -8,
        left: -8,
        background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
        borderRadius: '50%',
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem',
        fontFamily: 'Poppins, sans-serif',
        boxShadow: '0 3px 10px rgba(255, 89, 94, 0.4)',
        zIndex: 2
      }}>
        {number}
      </Box>
    )}
    
    <CardContent sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h3" sx={{ 
        fontSize: '1.8rem',
        mb: 1,
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
      }}>
        {step.icon}
      </Typography>
      <Typography variant="body2" sx={{ 
        fontWeight: 'bold',
        color: isSelected ? 'white' : '#280B60',
        fontFamily: 'Poppins, sans-serif',
        textShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
        fontSize: '0.9rem'
      }}>
        {step.name}
      </Typography>
    </CardContent>
  </Card>
);

// Drop Zone Component
const DropZone = ({ position, step, onDrop, onDragOver, onDragLeave, isDragOver, onRemove }) => (
  <Paper
    onDrop={onDrop}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
    sx={{
      border: step 
        ? '2px solid #90BE6D' 
        : isDragOver 
          ? '2px solid #FF595E' 
          : '2px dashed #90BE6D',
      borderRadius: '10px',
      minHeight: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: step 
        ? 'rgba(144, 190, 109, 0.1)' 
        : isDragOver 
          ? 'rgba(255, 89, 94, 0.1)' 
          : 'rgba(144, 190, 109, 0.05)',
      transition: 'all 0.3s ease',
      position: 'relative',
      cursor: step ? 'pointer' : 'default',
      mb: 1
    }}
    onClick={step ? () => onRemove(step) : undefined}
  >
    {/* Position number */}
    <Typography variant="caption" sx={{ 
      position: 'absolute',
      left: 8,
      top: 4,
      color: '#90BE6D',
      fontWeight: 'bold',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {position + 1}
    </Typography>
    
    {step ? (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        width: '100%',
        justifyContent: 'center'
      }}>
        <Typography variant="h4" sx={{ 
          fontSize: '1.5rem'
        }}>
          {step.icon}
        </Typography>
        <Typography variant="body2" sx={{ 
          fontWeight: 'bold',
          color: '#280B60',
          fontFamily: 'Poppins, sans-serif'
        }}>
          {step.name}
        </Typography>
      </Box>
    ) : (
      <Typography variant="caption" sx={{ 
        color: '#90BE6D',
        fontStyle: 'italic',
        fontFamily: 'Poppins, sans-serif',
        textAlign: 'center'
      }}>
        {isDragOver ? 'Drop here!' : `Step ${position + 1}`}
      </Typography>
    )}
  </Paper>
);

export default function PersonalHygieneLevel2() {
  const navigate = useNavigate();
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedSequence, setSelectedSequence] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [availableSteps, setAvailableSteps] = useState([]);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [draggedStep, setDraggedStep] = useState(null);
  const [dragOverPosition, setDragOverPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef(null);

  // Your imported background image
  // const BacgroundImageLevel2 = "https://images.unsplash.com/photo-1584622781564-1d987ba6fe68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80";

  // 5 Game rounds with 6-7 steps each
  const gameRounds = [
    {
      id: 1,
      title: "🌅 Complete Morning Routine",
      description: "Drag these morning steps in the correct order!",
      correctSequence: [
        { id: 1, name: "Wake up", icon: "🌅" },
        { id: 2, name: "Stretch body", icon: "🤸" },
        { id: 3, name: "Use toilet", icon: "🚽" },
        { id: 4, name: "Brush teeth", icon: "🦷" },
        { id: 5, name: "Wash face", icon: "💧" },
        { id: 6, name: "Get dressed", icon: "👕" },
        { id: 7, name: "Eat breakfast", icon: "🥞" }
      ]
    },
    {
      id: 2,
      title: "🛁 Complete Bath Time",
      description: "Drag the bathing steps in the correct order!",
      correctSequence: [
        { id: 1, name: "Prepare towel", icon: "🏖️" },
        { id: 2, name: "Turn on water", icon: "🚿" },
        { id: 3, name: "Test water temperature", icon: "🌡️" },
        { id: 4, name: "Get in bath", icon: "🛁" },
        { id: 5, name: "Wet body", icon: "💦" },
        { id: 6, name: "Apply soap", icon: "🧼" },
        { id: 7, name: "Rinse and dry", icon: "🏖️" }
      ]
    },
    {
      id: 3,
      title: "🦷 Teeth Brushing Routine",
      description: "Drag these teeth cleaning steps in order!",
      correctSequence: [
        { id: 1, name: "Get toothbrush", icon: "🪥" },
        { id: 2, name: "Wet toothbrush", icon: "💧" },
        { id: 3, name: "Apply toothpaste", icon: "🧴" },
        { id: 4, name: "Brush teeth", icon: "🦷" },
        { id: 5, name: "Rinse mouth", icon: "🚰" },
        { id: 6, name: "Clean toothbrush", icon: "🪥" }
      ]
    },
    {
      id: 4,
      title: "🧼 Hand Washing Steps",
      description: "Drag these hand washing steps in the right order!",
      correctSequence: [
        { id: 1, name: "Turn on water", icon: "🚰" },
        { id: 2, name: "Wet hands", icon: "💧" },
        { id: 3, name: "Apply soap", icon: "🧼" },
        { id: 4, name: "Scrub hands", icon: "👐" },
        { id: 5, name: "Rinse hands", icon: "🚰" },
        { id: 6, name: "Dry hands", icon: "🏖️" },
        { id: 7, name: "Turn off water", icon: "🚿" }
      ]
    },
    {
      id: 5,
      title: "🌙 Complete Bedtime Routine",
      description: "Drag these bedtime steps in the correct order!",
      correctSequence: [
        { id: 1, name: "Put on pajamas", icon: "👔" },
        { id: 2, name: "Brush teeth", icon: "🦷" },
        { id: 3, name: "Wash face", icon: "💧" },
        { id: 4, name: "Use toilet", icon: "🚽" },
        { id: 5, name: "Get in bed", icon: "🛏️" },
        { id: 6, name: "Turn off lights", icon: "💡" }
      ]
    }
  ];

  const currentRound = gameRounds[currentRoundIndex];
  const progressPercentage = ((currentRoundIndex + (gameCompleted ? 1 : 0)) / gameRounds.length) * 100;

  useEffect(() => {
    if (currentRound) {
      // Shuffle available steps
      const shuffled = [...currentRound.correctSequence].sort(() => Math.random() - 0.5);
      setAvailableSteps(shuffled);
      setSelectedSequence(Array(currentRound.correctSequence.length).fill(null));
    }
  }, [currentRoundIndex]);

  useEffect(() => {
    // Initialize background music
    audioRef.current = new Audio('/path-to-your-background-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
  }, []);

  const handleStartGame = () => {
    setLoading(true);
    setTimeout(() => {
      setShowStartScreen(false);
      setLoading(false);
    }, 1500);
  };

  const handleStartOver = () => {
    setCurrentRoundIndex(0);
    setSelectedSequence([]);
    setShowFeedback(false);
    setFeedbackData(null);
    setScore(0);
    setGameCompleted(false);
    setShowStartScreen(true);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  // Drag and Drop handlers
  const handleDragStart = (e, step) => {
    setDraggedStep(step);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', step.id);
  };

  const handleDragEnd = () => {
    setDraggedStep(null);
    setIsDragging(false);
    setDragOverPosition(null);
  };

  const handleDragOver = (e, position) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverPosition(position);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverPosition(null);
  };

  const handleDrop = (e, position) => {
    e.preventDefault();
    setDragOverPosition(null);
    
    if (draggedStep && selectedSequence[position] === null) {
      const newSequence = [...selectedSequence];
      newSequence[position] = draggedStep;
      setSelectedSequence(newSequence);
      
      // Remove from available steps
      setAvailableSteps(prev => prev.filter(step => step.id !== draggedStep.id));
    }
    
    setDraggedStep(null);
    setIsDragging(false);
  };

  const handleRemoveStep = (stepToRemove) => {
    const newSequence = selectedSequence.map(step => 
      step && step.id === stepToRemove.id ? null : step
    );
    setSelectedSequence(newSequence);
    setAvailableSteps(prev => [...prev, stepToRemove].sort((a, b) => a.id - b.id));
  };

  const checkSequence = () => {
    const filledSteps = selectedSequence.filter(step => step !== null);
    
    if (filledSteps.length !== currentRound.correctSequence.length) {
      setFeedbackData({
        isCorrect: false,
        message: "Please drag all steps to the sequence first!"
      });
      setShowFeedback(true);
      return;
    }

    const isCorrect = selectedSequence.every((step, index) => 
      step && step.id === currentRound.correctSequence[index].id
    );

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setFeedbackData({
      isCorrect,
      message: isCorrect 
        ? "🎉 Perfect! You got the routine right!" 
        : "Good try! Let's learn the correct order!"
    });
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFeedbackData(null);
    
    if (currentRoundIndex < gameRounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      setGameCompleted(true);
    }
  };

  // Better background style to prevent stretching and pixelation
  const backgroundStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${BacgroundImageLevel2})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    zIndex: -1
  };

  // Start screen matching Level 1 exactly
  if (showStartScreen) {
    return (
      <div style={{ minHeight: "100vh", position: 'relative' }}>
        <div style={backgroundStyle}></div>
        <Navbar />
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
            🚿 Routine Builder 🚿
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
            Drag and drop the daily hygiene steps in the right order to build your perfect routine!
          </Typography>
          <Button 
            variant="contained"
            onClick={handleStartGame}
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
            <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>🎮</span>
            Let's Build!
          </Button>
        </Box>
      </div>
    );
  }

  // Loading screen matching Level 1
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", position: 'relative' }}>
        <div style={backgroundStyle}></div>
        <Navbar />
        <Container sx={{ 
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <Paper sx={{ 
            p: 6, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: 'none',
            borderRadius: '20px'
          }}>
            <Typography variant="h5" sx={{ color: '#280B60', textAlign: 'center', fontWeight: 'bold' }}>
              Getting ready...
            </Typography>
          </Paper>
        </Container>
      </div>
    );
  }

  // Game completed screen
  if (gameCompleted) {
    return (
      <div style={{ minHeight: "100vh", position: 'relative' }}>
        <div style={backgroundStyle}></div>
        <Navbar />
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
            🎉 Congratulations! 🎉
          </Typography>
          <Typography variant="h4" sx={{ 
            color: 'rgba(255, 255, 255, 0.95)', 
            mb: 4,
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            You completed all 5 hygiene routines!
          </Typography>
          <Typography variant="h3" sx={{ 
            color: 'white', 
            mb: 6,
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Final Score: {score}/{gameRounds.length}
          </Typography>
          <Stack direction="row" spacing={3}>
            <Button 
              variant="contained"
              onClick={handleStartOver}
              sx={{ 
                background: 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)',
                color: 'white',
                px: 8,
                py: 3,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                fontSize: '1.3rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(144, 190, 109, 0.5)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 35px rgba(144, 190, 109, 0.7)'
                }
              }}
            >
              🔄 Start Over
            </Button>
            <Button 
              variant="contained"
              onClick={handleGoHome}
              sx={{ 
                background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                color: 'white',
                px: 8,
                py: 3,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                fontSize: '1.3rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 35px rgba(255, 89, 94, 0.7)'
                }
              }}
            >
              🏠 Go Home
            </Button>
          </Stack>
        </Box>
      </div>
    );
  }

  // Main game screen with drag and drop
  return (
    <div style={{ minHeight: "100vh", position: 'relative' }}>
      <div style={backgroundStyle}></div>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 2, position: 'relative', zIndex: 1 }}>
        
        {/* Progress header and controls */}
        <Box mb={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ maxWidth: '1000px', mx: 'auto' }}>
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              px: 2,
              py: 1,
              borderRadius: '10px'
            }}>
              Round {currentRoundIndex + 1} of {gameRounds.length}
            </Typography>
            
            {/* Control buttons */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                onClick={handleStartOver}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  px: 3,
                  py: 1,
                  borderRadius: '15px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'white'
                  }
                }}
              >
                🔄 Start Over
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleGoHome}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.7)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  px: 3,
                  py: 1,
                  borderRadius: '15px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'white'
                  }
                }}
              >
                🏠 Home
              </Button>
              
              <Chip 
                label={`Score: ${score}/${gameRounds.length}`} 
                sx={{
                  backgroundColor: '#FF595E',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  fontFamily: 'Poppins, sans-serif',
                  borderRadius: '15px'
                }}
              />
              
              {/* Audio button */}
              <Button
                onClick={() => {
                  if (audioRef.current) {
                    if (audioPlaying) {
                      audioRef.current.pause();
                      setAudioPlaying(false);
                    } else {
                      audioRef.current.play().then(() => {
                        setAudioPlaying(true);
                      }).catch(error => {
                        console.log('Audio play failed:', error);
                      });
                    }
                  }
                }}
                sx={{
                  minWidth: '45px',
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  background: audioPlaying 
                    ? 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)'
                    : 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  fontSize: '1.2rem',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                  }
                }}
              >
                {audioPlaying ? '🔊' : '🔇'}
              </Button>
            </Stack>
          </Stack>
          
          <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
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

        {/* Main game content */}
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Paper sx={{ 
            p: 4, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            
            {/* Current round title */}
            <Box textAlign="center" mb={3}>
              <Typography variant="h3" sx={{ 
                color: '#280B60', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                mb: 1,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}>
                {currentRound.title}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: '#666',
                fontFamily: 'Inter, sans-serif',
                mb: 2
              }}>
                {currentRound.description}
              </Typography>
            </Box>

            {/* Static side-by-side layout */}
            <Grid container spacing={3}>
              
              {/* Available steps for dragging */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  backgroundColor: '#FFFAF4',
                  borderRadius: '15px',
                  border: '2px solid #FF595E',
                  height: '550px',
                  overflow: 'auto'
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#280B60', 
                    fontWeight: 'bold', 
                    mb: 3,
                    fontFamily: 'Poppins, sans-serif',
                    textAlign: 'center'
                  }}>
                    📋 Drag These Steps
                  </Typography>
                  <Grid container spacing={2}>
                    {availableSteps.map((step) => (
                      <Grid item xs={12} sm={6} key={step.id}>
                        <StepCard
                          step={step}
                          isSelected={false}
                          isDragging={isDragging && draggedStep?.id === step.id}
                          onDragStart={(e) => handleDragStart(e, step)}
                          onDragEnd={handleDragEnd}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>

              {/* Drop zones for sequence */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: 3, 
                  backgroundColor: '#FFFAF4',
                  borderRadius: '15px',
                  border: '2px solid #90BE6D',
                  height: '550px',
                  overflow: 'auto'
                }}>
                  <Typography variant="h6" sx={{ 
                    color: '#280B60', 
                    fontWeight: 'bold', 
                    mb: 3,
                    fontFamily: 'Poppins, sans-serif',
                    textAlign: 'center'
                  }}>
                    🔄 Drop in Order
                  </Typography>
                  <Stack spacing={1}>
                    {selectedSequence.map((step, index) => (
                      <DropZone
                        key={index}
                        position={index}
                        step={step}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        isDragOver={dragOverPosition === index}
                        onRemove={handleRemoveStep}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Check button */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={checkSequence}
                disabled={selectedSequence.filter(step => step !== null).length === 0}
                sx={{
                  background: 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)',
                  color: 'white',
                  px: 8,
                  py: 3,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.3rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(144, 190, 109, 0.4)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(144, 190, 109, 0.6)'
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#666'
                  }
                }}
              >
                Check My Routine! ✓
              </Button>
            </Box>
          </Paper>
        </Container>

        {/* Feedback Dialog */}
        <Dialog 
          open={showFeedback} 
          onClose={() => setShowFeedback(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              backgroundColor: '#FFFAF4',
              border: '3px solid #90BE6D'
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            py: 3,
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#280B60',
            fontFamily: 'Poppins, sans-serif'
          }}>
            {feedbackData?.isCorrect ? '🎉 Excellent!' : '🤔 Good Try!'}
          </DialogTitle>
          
          <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
            <Typography variant="h5" sx={{ 
              mb: 3,
              color: '#280B60',
              fontFamily: 'Poppins, sans-serif'
            }}>
              {feedbackData?.message}
            </Typography>
            
            {feedbackData && !feedbackData.isCorrect && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ 
                  mb: 2,
                  color: '#280B60',
                  fontWeight: 'bold',
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  The correct order is:
                </Typography>
                <Stack spacing={1}>
                  {currentRound.correctSequence.map((step, index) => (
                    <Box key={step.id} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 2,
                      py: 1
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#FF595E',
                        fontWeight: 'bold',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {index + 1}.
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: '#280B60',
                        fontFamily: 'Poppins, sans-serif'
                      }}>
                        {step.icon} {step.name}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={feedbackData?.isCorrect ? handleNext : () => setShowFeedback(false)}
              variant="contained"
              sx={{ 
                background: 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)',
                color: 'white',
                px: 6,
                py: 2,
                borderRadius: '20px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 8px 20px rgba(144, 190, 109, 0.4)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 25px rgba(144, 190, 109, 0.6)'
                }
              }}
            >
              {feedbackData?.isCorrect ? 'Next Round! 🚀' : 'Try Again! 💪'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </div>
  );
}