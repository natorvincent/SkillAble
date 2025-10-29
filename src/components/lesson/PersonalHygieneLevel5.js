import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Button, 
  Dialog,
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
import Loader from '../Loader';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

// Images - Replace these with your nail care images
// import successGif from "../../assets/hygieneLevel1/roblox.gif"
import backgroundImg from "../../assets/hygienelevel3/room.png"

// Audio files
import backgroundMusic from "../../assets/hygienelevel1/background-music.mp3"
import correctSound from "../../assets/hygienelevel1/correct-sound.mp3"
import incorrectSound from "../../assets/hygienelevel1/incorrect-sound.mp3"
import successSound from "../../assets/hygienelevel1/success-sound.mp3"

export default function DressUpGame() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const [correctSoundRef, setCorrectSoundRef] = useState(null);
  const [incorrectSoundRef, setIncorrectSoundRef] = useState(null);
  const [successSoundRef, setSuccessSoundRef] = useState(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Game states - customize these for nail care
  const [gameStep, setGameStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  const handleStartGame = () => {
    setShowStartScreen(false);
    // Initialize your nail care game here
  };

  const getStudentId = () => {
  try {
    const studentId = localStorage.getItem('studentId');
    const userType = localStorage.getItem('userType');
    
    console.log('Retrieving student ID:', { studentId, userType });
    
    // Check if we have a valid student ID regardless of userType
    if (!studentId || studentId === 'null' || studentId === 'undefined') {
      console.warn('No student ID found in localStorage');
      return null;
    }
    
    const parsedId = parseInt(studentId, 10);
    if (isNaN(parsedId)) {
      console.warn('Invalid student ID format:', studentId);
      return null;
    }
    
    console.log('Successfully retrieved student ID:', parsedId);
    return parsedId;
  } catch (error) {
    console.error('Error retrieving student ID:', error);
    return null;
  }
};

  const playSoundEffect = (soundType) => {
    try {
      if (soundType === 'correct' && correctSoundRef) {
        correctSoundRef.currentTime = 0;
        correctSoundRef.play();
      } else if (soundType === 'incorrect' && incorrectSoundRef) {
        incorrectSoundRef.currentTime = 0;
        incorrectSoundRef.play();
      } else if (soundType === 'success' && successSoundRef) {
        successSoundRef.currentTime = 0;
        successSoundRef.play();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  // Add your nail care game logic here
  const handleDragStart = (e, itemType) => {
    if (gameStep !== 1) return;
    e.dataTransfer.setData('text/plain', itemType);
    setDraggedItem(itemType);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    // Add your nail care drop logic here
  };

  const handleMouseDown = (e) => {
    // Add your nail care mouse down logic here
  };

  const handleMouseMove = (e) => {
    // Add your nail care mouse move logic here
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

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
        
        // Set lesson data for nail care
        setLesson({
          id: lessonId || 1,
          title: "Nail Care",
          description: "Learn proper nail care technique!",
          level: 1
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Something went wrong');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);

  const saveProgress = async () => {
  if (progressSaving || progressSaved) {
    console.log('Progress already saving or saved, skipping');
    return;
  }

  try {
    setProgressSaving(true);
    
    // Get student ID with relaxed checking
    const studentId = getStudentId();
    
    console.log('Authentication check:', { 
      studentId, 
      userType: localStorage.getItem('userType'),
      studentIdFromStorage: localStorage.getItem('studentId')
    });
    
    if (!studentId) {
      console.error('Cannot save progress: No valid student ID found');
      
      let errorMessage = 'Please log in to save your progress.\n\n';
      errorMessage += `Debug Info:\n`;
      errorMessage += `- User type: ${localStorage.getItem('userType') || 'Not set'}\n`;
      errorMessage += `- Student ID: ${localStorage.getItem('studentId') || 'Not found'}`;
      
      alert(errorMessage);
      setProgressSaving(false);
      return;
    }
    
    if (!lessonId) {
      console.error('Cannot save progress: No lesson ID available');
      alert('Lesson ID is missing. Cannot save progress.');
      setProgressSaving(false);
      return;
    }

    const progressData = {
      score: 100,
      maxScore: 100,  
      completed: true,
      starsEarned: 3
    };
    
    console.log('Saving progress data:', progressData);
    
    const result = await saveStudentLessonProgress(
      studentId, 
      parseInt(lessonId, 10), 
      progressData
    );
    
    console.log('Progress save result:', result);
    setProgressSaved(true);
    
  } catch (error) {
    console.error('Error saving progress:', error);
    
    // Show user-friendly error message
    if (error.message.includes('No student ID available')) {
      alert('Please log in to save your progress.');
    } else {
      alert('Failed to save progress. Please try again.');
    }
  } finally {
    setProgressSaving(false);
  }
};

  const resetGame = () => {
    setShowFeedback(false);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    
    // Reset game states for nail care
    setGameStep(1);
    setIsDragging(false);
    setDraggedItem(null);
    
    if (audioRef && !audioPlaying) {
      audioRef.play().then(() => {
        setAudioPlaying(true);
      }).catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  const getStarRating = () => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  const handleContinue = async () => {
  console.log('Continue clicked, progress state:', { progressSaved, progressSaving });
  
  if (!progressSaved && !progressSaving) {
    console.log('Saving progress before continue...');
    await saveProgress();
  } else if (progressSaving) {
    console.log('Progress is currently saving, please wait...');
    return;
  }
  
  if (audioRef.current) {
    audioRef.current.pause();
    setAudioPlaying(false);
  }
  
  console.log('Navigating back...');
  setTimeout(() => {
    navigate(-1);
  }, 300);
};

  const handleGoHome = () => {
    if (audioRef) {
      audioRef.pause();
      setAudioPlaying(false);
    }
    navigate('/homepage');
  };

  useEffect(() => {
    if (showSuccess) {
      const animateStars = async () => {
        setStarAnimationStage(0);
        const totalStars = getStarRating();
        
        for (let i = 0; i < totalStars; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setStarAnimationStage(i + 1);
        }
      };
      
      const timer = setTimeout(animateStars, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, score]);

  useEffect(() => {
    const audio = new Audio(backgroundMusic);
    audio.loop = true;
    audio.volume = 0.3;
    setAudioRef(audio);

    const correctAudio = new Audio(correctSound);
    const incorrectAudio = new Audio(incorrectSound);
    const successAudio = new Audio(successSound);
    
    correctAudio.volume = 0.7;
    incorrectAudio.volume = 0.7;
    successAudio.volume = 0.7;
    
    setCorrectSoundRef(correctAudio);
    setIncorrectSoundRef(incorrectAudio);
    setSuccessSoundRef(successAudio);

    const playAudio = () => {
      audio.play().then(() => {
        setAudioPlaying(true);
      }).catch(error => {
        console.log('Audio autoplay prevented:', error);
      });
    };

    const timer = setTimeout(playAudio, 1000);

    return () => {
      clearTimeout(timer);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const createConfetti = () => {
        const pieces = [];
        for (let i = 0; i < 150; i++) {
          pieces.push({
            id: i,
            x: Math.random() * 100,
            y: -10,
            rotation: Math.random() * 360,
            color: [
              '#FF0080', '#00FFFF', '#FF4500', '#9400D3', '#32CD32', '#FFD700', 
              '#FF1493', '#00FF7F', '#1E90FF', '#FF6347', '#ADFF2F', '#FF69B4', 
              '#00CED1', '#FFA500', '#DA70D6'
            ][Math.floor(Math.random() * 15)],
            size: Math.random() * 12 + 6,
            speed: Math.random() * 4 + 2,
            drift: (Math.random() - 0.5) * 3,
            width: Math.random() * 8 + 4,
            height: Math.random() * 12 + 6
          });
        }
        setConfettiPieces(pieces);
      };
      
      const timer = setTimeout(createConfetti, 500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Start screen
  if (showStartScreen) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column"
      }}>
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
            Dress Me for the Day!
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
            Learn how to take care of your nails properly!
          </Typography>
          
          <Stack direction="row" spacing={3}>
            <Button 
              variant="contained"
              onClick={handleStartGame}
              sx={{ 
                background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                color: 'white',
                px: 8,
                py: 2,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.5rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Start Game!
            </Button>
          </Stack>
        </Box>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />
        <div style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(2px)'
        }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
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
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${backgroundImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    >
      
      <Container maxWidth="xl" sx={{ py: 1 }}>
        {/* Progress bar and instructions */}
        <Box 
          sx={{
            position: 'relative',
            zIndex: 1010,
            mb: 2
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              Step {gameStep}/3: {/* Add your nail care steps here */}
            </Typography>
            
            <Chip 
              label={`Score: ${score}/100`} 
              sx={{
                backgroundColor: '#FF595E',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(255, 89, 94, 0.4)'
              }}
            />
          </Stack>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={score} 
              sx={{ 
                height: 8, 
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '10px',
                  backgroundColor: '#90BE6D'
                }
              }} 
            />
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Button 
            variant="contained"
            onClick={resetGame}
            sx={{ 
              background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              width: 64,
              height: 64,
              minWidth: 64,
              borderRadius: '12px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.25rem',
              textTransform: 'none',
              boxShadow: '0 8px 18px rgba(255, 89, 94, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label="Reset"
          >
            🔄
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleGoHome}
            sx={{ 
              background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
              color: 'white',
              width: 64,
              height: 64,
              minWidth: 64,
              borderRadius: '12px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.25rem',
              textTransform: 'none',
              boxShadow: '0 8px 18px rgba(25, 130, 196, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label="Home"
          >
            🏠
          </Button>
        </Box>

        <Box sx={{ 
          position: 'fixed',
          top: 100,
          right: 20,
          zIndex: 1000
        }}>
          <Button
            onClick={() => {
              if (audioRef) {
                if (audioPlaying) {
                  audioRef.pause();
                  setAudioPlaying(false);
                } else {
                  audioRef.play().then(() => {
                    setAudioPlaying(true);
                  }).catch(error => {
                    console.log('Audio play failed:', error);
                  });
                }
              }
            }}
            sx={{
              minWidth: '60px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: audioPlaying 
                ? 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)'
                : 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              fontSize: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
              }
            }}
          >
            {audioPlaying ? '🔊' : '🔇'}
          </Button>
        </Box>

        <Box sx={{ 
          mb: 1,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1010
        }}>
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            backgroundColor: 'rgba(25, 130, 196, 0.9)',
            display: 'inline-block',
            px: 3,
            py: 1,
            borderRadius: '15px',
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(25, 130, 196, 0.4)'
          }}>
            {/* Add your nail care instructions here */}
            {gameStep === 1 && 'Start your nail care routine!'}
            {gameStep === 2 && 'Continue with the next step!'}
            {gameStep === 3 && 'Finish your nail care!'}
          </Typography>
        </Box>

        {/* Game Area - Add your nail care components here */}
        {!gameCompleted && (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 'calc(100vh - 200px)',
              width: '100%',
              pt: 1,
              mb: 0,
              pb: 0
            }}
          >
            {/* Add your nail care game elements here */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                mt: 2,
                position: 'relative',
                width: '100%'
              }}
            >
              {/* Add nail care tools and hands/nails here */}
              <Typography variant="h4" sx={{ color: 'white', textAlign: 'center' }}>
                Your Nail Care Game Goes Here!
              </Typography>
            </Box>
          </Box>
        )}
        
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
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {confettiPieces.map(piece => (
              <Box
                key={piece.id}
                sx={{
                  position: 'absolute',
                  left: `${piece.x}%`,
                  top: `${piece.y}%`,
                  width: `${piece.width}px`,
                  height: `${piece.height}px`,
                  backgroundColor: piece.color,
                  transform: `rotate(${piece.rotation}deg)`,
                  boxShadow: `0 0 10px ${piece.color}`,
                  animation: `confettiFall 4s linear infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  '@keyframes confettiFall': {
                    '0%': {
                      transform: `translateY(-100vh) rotate(${piece.rotation}deg) scale(0.8)`,
                      opacity: 1
                    },
                    '10%': {
                      opacity: 1,
                      transform: `translateY(-90vh) rotate(${piece.rotation + 36}deg) scale(1)`
                    },
                    '90%': {
                      opacity: 0.8,
                      transform: `translateY(90vh) translateX(${piece.drift * 60}px) rotate(${piece.rotation + 324}deg) scale(0.6)`
                    },
                    '100%': {
                      transform: `translateY(100vh) translateX(${piece.drift * 70}px) rotate(${piece.rotation + 360}deg) scale(0)`,
                      opacity: 0
                    }
                  }
                }}
              />
            ))}
          </Box>
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
              Perfect Nail Care!
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              {[...Array(3)].map((_, i) => {
                const isActive = i < getStarRating();
                const shouldAnimate = i < starAnimationStage;
                
                return (
                  <StarIcon 
                    key={i} 
                    sx={{ 
                      color: isActive ? 'white' : 'rgba(255,255,255,0.3)',
                      fontSize: 80,
                      mx: 1,
                      textShadow: isActive ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                      transform: shouldAnimate ? 'scale(1.3)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      animation: shouldAnimate ? 'starPop 0.6s ease-out' : 'none',
                      '@keyframes starPop': {
                        '0%': {
                          transform: 'scale(0)',
                          opacity: 0
                        },
                        '50%': {
                          transform: 'scale(1.5)',
                          opacity: 1
                        },
                        '100%': {
                          transform: 'scale(1)',
                          opacity: 1
                        }
                      }
                    }} 
                  />
                );
              })}
            </Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              color: 'white',
              mb: 3,
              fontFamily: 'Poppins, sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Score: {score}/100
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Great job! Your nails look healthy and well-maintained!
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
            
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                onClick={() => {
                  setShowSuccess(false);
                  resetGame();
                }} 
                variant="outlined"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.2rem',
                  borderWidth: '2px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                  background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {progressSaving ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
}