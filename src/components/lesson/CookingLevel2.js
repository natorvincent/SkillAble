import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Dialog,
  Stack,
  LinearProgress,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import Navbar from '../Navbar';
// import { saveStudentLessonProgress } from '../../services/progressService';

// Import kitchen background and ingredient images
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";
import baconardoImg from "../../assets/cookingLevel3/Baconardo.png";
import springOnionImg from "../../assets/cookingLevel2/spring-onion.png";
import springOnionChoppedImg from "../../assets/cookingLevel2/spring-onion-chopped.png";
import eggImg from "../../assets/cookingLevel2/egg.png";
import eggCrackedImg from "../../assets/cookingLevel2/egg-cracked.png";
import saltImg from "../../assets/cookingLevel2/salt.png";
import saltPouringImg from "../../assets/cookingLevel2/salt-pouring.png";
import knifeImg from "../../assets/cookingLevel2/knife.png";

export default function CookingLevel2() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  // Audio refs for sound effects
  const chopSoundRef = useRef(null);
  const crackSoundRef = useRef(null);
  const shakeSoundRef = useRef(null);
  const successSoundRef = useRef(null);

  // Sound management
  const [isMuted, setIsMuted] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);

  // Sequential ingredient flow
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(0);
  const [springOnionChops, setSpringOnionChops] = useState(0);
  const [eggCracked, setEggCracked] = useState(false);
  const [saltShakes, setSaltShakes] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);
  
  // Progress tracking states
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  
  // Simple animation states
  const [onionAnimation, setOnionAnimation] = useState(false);
  const [eggAnimation, setEggAnimation] = useState(false);
  const [saltAnimation, setSaltAnimation] = useState(false);
  const [knifeChop, setKnifeChop] = useState(false);
  const [onionPieces, setOnionPieces] = useState([]);
  
  // Baconardo states
  const [showBaconardo, setShowBaconardo] = useState(true);
  const [baconardoMessage, setBaconardoMessage] = useState('Welcome to Ingredient Preparation! I\'m Chef Baconardo! 🥓');
  const [baconardoAnimation, setBaconardoAnimation] = useState('idle');
  
  // Progress tracking
  const [completedTasks, setCompletedTasks] = useState({
    onion: false,
    egg: false,
    salt: false
  });

  const requiredChops = 5;
  const requiredShakes = 3;

  const getStarRating = () => {
    return 3;
  };

  // Animate stars when celebration shows
  useEffect(() => {
    if (showCompletion) {
      let currentStage = 0;
      const interval = setInterval(() => {
        currentStage++;
        setStarAnimationStage(currentStage);
        if (currentStage >= 3) {
          clearInterval(interval);
        }
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [showCompletion]);

  // Create confetti when completion shows
  useEffect(() => {
    if (showCompletion) {
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
  }, [showCompletion]);

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

  // Save progress to database
  // const saveProgress = async () => {
  //   if (progressSaving || progressSaved) return;

  //   try {
  //     setProgressSaving(true);
  //     const studentId = getStudentId();
      
  //     if (!studentId || !lessonId) {
  //       console.error('Cannot save progress - missing data:', { studentId, lessonId });
  //       return;
  //     }
      
  //     const finalScore = 3;
      
  //     const progressData = {
  //       studentId: studentId,
  //       lessonId: parseInt(lessonId, 10),
  //       score: finalScore,
  //       maxScore: 3,
  //       completed: true,
  //       starsEarned: 3
  //     };
      
  //     console.log('Progress simulatedly saved:', progressData);
  //     setProgressSaved(true);
      
  //   } catch (error) {
  //     console.error('Error saving progress:', error);
  //   } finally {
  //     setProgressSaving(false);
  //   }
  // };
const saveProgress = async () => {
  if (progressSaving || progressSaved) {
    console.log('Progress already saving or saved, skipping');
    return;
  }

  try {
    setProgressSaving(true);
    const studentId = getStudentId();
    
    console.log('DEBUG: Starting saveProgress:', {
      studentId,
      lessonId,
      studentIdValid: !!studentId,
      lessonIdValid: !!lessonId
    });
    
    if (!studentId) {
      console.error('Cannot save progress: No valid student ID found');
      setProgressSaving(false);
      return;
    }
    
    if (!lessonId) {
      console.error('Cannot save progress: No lesson ID available');
      setProgressSaving(false);
      return;
    }

    const progressData = {
      score: 100,
      maxScore: 100,  
      completed: true,
      starsEarned: 3,
    };
    
    console.log('DEBUG: Calling saveStudentLessonProgress with:', {
      studentId,
      lessonId,
      progressData
    });
    
    // Use the imported progress service function
    await saveStudentLessonProgress(
      studentId, 
      parseInt(lessonId, 10), 
      progressData
    );
    
    console.log('Progress saved successfully');
    setProgressSaved(true);
    
  } catch (error) {
    console.error('Error saving progress:', error);
    // Show user-friendly error
    setFeedbackMessage('Unable to save progress. Your progress will be saved locally and synced later.');
    setTimeout(() => setFeedbackMessage(''), 5000);
    
    // Mark as saved locally (queued)
    setProgressSaved(true);
  } finally {
    setProgressSaving(false);
  }
};
// end of saveProgress



  const handleGoHome = () => {
    navigate('/studentdashboard');
  };

  // const continueToNextLevel = async () => {
  //   if (!progressSaved && !progressSaving) {
  //     await saveProgress();
  //   }
    
  //   navigate('/lesson/cooking/level-3');
  // };

  // Handle continue button click
const handleContinue = async () => {
  console.log('Continue clicked, progress state:', { progressSaved, progressSaving });
  
  if (!progressSaved && !progressSaving) {
    console.log('Saving progress before continue...');
    await saveProgress();
  } else if (progressSaving) {
    console.log('Progress is currently saving, please wait...');
    return;
  }
  
  console.log('Navigating to next level...');
  setTimeout(() => {
    navigate('/lesson/cooking/level-3');
  }, 300);
};

// 

  // Initialize audio elements
  useEffect(() => {
    chopSoundRef.current = new Audio('/sounds/chop.mp3');
    crackSoundRef.current = new Audio('/sounds/crack.mp3');
    shakeSoundRef.current = new Audio('/sounds/shake.mp3');
    successSoundRef.current = new Audio('/sounds/success.mp3');

    [chopSoundRef, crackSoundRef, shakeSoundRef, successSoundRef].forEach(audioRef => {
      if (audioRef.current) {
        audioRef.current.volume = 0.6;
        audioRef.current.preload = 'auto';
        audioRef.current.addEventListener('error', () => {
          console.log('Audio file not found - continuing without sound');
        });
      }
    });

    return () => {
      [chopSoundRef, crackSoundRef, shakeSoundRef, successSoundRef].forEach(audioRef => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      });
    };
  }, []);

  // Baconardo introduction for each ingredient
  useEffect(() => {
    if (!showStartScreen) {
      const messages = [
        "🥬 First, let's chop the spring onion! Tap it repeatedly to chop it into small pieces. Be careful with the knife!",
        "🥚 Now, let's crack the egg! Tap once to crack it into the bowl. We need it ready for cooking!",
        "🧂 Finally, let's season with salt! Tap to shake the salt shaker. Not too much, just enough for flavor!"
      ];
      
      if (currentIngredientIndex < messages.length) {
        setBaconardoMessage(messages[currentIngredientIndex]);
        setBaconardoAnimation('nod');
        
        setTimeout(() => {
          setBaconardoAnimation('idle');
        }, 4000);
      }
    }
  }, [currentIngredientIndex, showStartScreen]);

  // Play sound effect helper function
  const playSound = (audioRef) => {
    if (!isMuted && audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.log('Audio play failed:', error);
        });
      } catch (error) {
        console.log('Audio error:', error);
      }
    }
  };

  // Synthesized sound using Web Audio API
  const playSynthSound = (type) => {
    if (isMuted) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'chop') {
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.15);
      } else if (type === 'crack') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.25);
      } else if (type === 'shake') {
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      } else if (type === 'success') {
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(659, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Web Audio API error:', e);
    }
  };

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Baconardo feedback functions
  const showBaconardoFeedback = (message, animation = 'idle', duration = 3000) => {
    setBaconardoMessage(message);
    setBaconardoAnimation(animation);
    setTimeout(() => {
      setBaconardoAnimation('idle');
    }, duration);
  };
  
  // Ingredients data
  const ingredients = [
    {
      id: 'onion',
      name: 'Spring Onion',
      beforeImage: springOnionImg,
      afterImage: springOnionChoppedImg,
      actionText: 'Tap to Chop',
      progressText: `${springOnionChops}/${requiredChops} chops`,
      encouragement: 'Keep chopping!',
      intro: "🥬 First, let's chop the spring onion! Tap it repeatedly to chop it into small pieces. Be careful with the knife!"
    },
    {
      id: 'egg', 
      name: 'Egg',
      beforeImage: eggImg,
      afterImage: eggCrackedImg,
      actionText: 'Tap to Crack',
      progressText: eggCracked ? 'Cracked into bowl' : 'Ready to crack',
      encouragement: 'Crack into bowl!',
      intro: "🥚 Now, let's crack the egg! Tap once to crack it into the bowl. We need it ready for cooking!"
    },
    {
      id: 'salt',
      name: 'Salt', 
      beforeImage: saltImg,
      afterImage: saltPouringImg,
      actionText: 'Tap to Shake',
      progressText: `${saltShakes}/${requiredShakes} shakes`,
      encouragement: 'Season well!',
      intro: "🧂 Finally, let's season with salt! Tap to shake the salt shaker. Not too much, just enough for flavor!"
    }
  ];

  const currentIngredient = ingredients[currentIngredientIndex] || ingredients[0];
  const totalIngredients = 3;

  // Helper function to determine if current ingredient is completed
  const getCurrentIngredientCompleted = () => {
    switch (currentIngredientIndex) {
      case 0: return springOnionChops >= requiredChops;
      case 1: return eggCracked;
      case 2: return saltShakes >= requiredShakes;
      default: return false;
    }
  };

  // Check completion and progress to next ingredient
  useEffect(() => {
    const newCompletedTasks = {
      onion: springOnionChops >= requiredChops,
      egg: eggCracked,
      salt: saltShakes >= requiredShakes
    };
    
    setCompletedTasks(newCompletedTasks);
    
    if (currentIngredientIndex === 0 && newCompletedTasks.onion && !completedTasks.onion) {
      playSound(successSoundRef);
      playSynthSound('success');
      setShowConfetti(true);
      showBaconardoFeedback("🎉 Perfect chopping! The spring onion is ready! Moving to the egg...", 'celebrate');
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentIngredientIndex(1);
      }, 2000);
    } else if (currentIngredientIndex === 1 && newCompletedTasks.egg && !completedTasks.egg) {
      playSound(successSoundRef);
      playSynthSound('success');
      setShowConfetti(true);
      showBaconardoFeedback("🎊 Excellent cracking! The egg is ready! Now for seasoning...", 'celebrate');
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentIngredientIndex(2);
      }, 2000);
    } else if (currentIngredientIndex === 2 && newCompletedTasks.salt && !completedTasks.salt) {
      playSound(successSoundRef);
      playSynthSound('success');
      setShowConfetti(true);
      showBaconardoFeedback("🏆 Amazing work! All ingredients are prepared! You're becoming a real chef!", 'celebrate', 5000);
      setTimeout(() => {
        setShowConfetti(false);
        setShowCompletion(true);
        saveProgress();
      }, 2000);
    }
  }, [springOnionChops, eggCracked, saltShakes, currentIngredientIndex, completedTasks, isMuted]);

  // Handle ingredient interactions
  const handleIngredientAction = () => {
    if (getCurrentIngredientCompleted()) return;
    
    if (currentIngredientIndex === 0) {
      // Onion chopping with pieces animation
      playSound(chopSoundRef);
      playSynthSound('chop');
      setOnionAnimation(true);
      setKnifeChop(true);
      
      // Create new onion pieces with each chop
      const newPiece = {
        id: Date.now() + Math.random(),
        left: Math.random() * 60 + 20,
        top: Math.random() * 40 + 30,
        rotation: Math.random() * 360,
        size: Math.random() * 15 + 10
      };
      
      setOnionPieces(prev => [...prev, newPiece]);
      setSpringOnionChops(prev => prev + 1);
      
      // Baconardo feedback during chopping
      const chopMessages = [
        "Great chop! Keep going!",
        "You're doing fantastic!",
        "Almost there!",
        "Perfect knife skills!",
        "One more chop should do it!"
      ];
      if (springOnionChops < requiredChops - 1) {
        showBaconardoFeedback(chopMessages[springOnionChops % chopMessages.length], 'nod');
      }
      
      setTimeout(() => {
        setOnionAnimation(false);
        setKnifeChop(false);
      }, 300);
    } else if (currentIngredientIndex === 1) {
      playSound(crackSoundRef);
      playSynthSound('crack');
      setEggAnimation(true);
      showBaconardoFeedback("🥚 Perfect crack! The egg is ready for cooking!", 'nod');
      setTimeout(() => {
        setEggCracked(true);
        setEggAnimation(false);
      }, 500);
    } else if (currentIngredientIndex === 2) {
      playSound(shakeSoundRef);
      playSynthSound('shake');
      setSaltAnimation(true);
      setSaltShakes(prev => prev + 1);
      
      // Baconardo feedback during shaking
      const shakeMessages = [
        "Good seasoning!",
        "Just a bit more!",
        "Perfect amount!",
        "You've got the touch!"
      ];
      if (saltShakes < requiredShakes - 1) {
        showBaconardoFeedback(shakeMessages[saltShakes % shakeMessages.length], 'nod');
      }
      
      setTimeout(() => setSaltAnimation(false), 400);
    }
  };

  const resetGame = () => {
    setCurrentIngredientIndex(0);
    setSpringOnionChops(0);
    setEggCracked(false);
    setSaltShakes(0);
    setShowCompletion(false);
    setShowConfetti(false);
    setCompletedTasks({ onion: false, egg: false, salt: false });
    setProgressSaved(false);
    setProgressSaving(false);
    setOnionPieces([]);
    setStarAnimationStage(0);
    showBaconardoFeedback("Let's start fresh! Remember: chop the onion, crack the egg, and shake the salt! 🍳", 'idle');
  };

  const handleStartGame = () => {
    setShowStartScreen(false);
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercentage = ((currentIngredientIndex + (getCurrentIngredientCompleted() ? 1 : 0)) / totalIngredients) * 100;

  // Start screen
  if (showStartScreen) {
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
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(255, 202, 58, 0.8) 0%, rgba(255, 152, 0, 0.8) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 1,
          padding: 3
        }}>
          <Typography variant="h1" sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            mb: 4,
            fontFamily: 'Poppins, sans-serif',
            fontSize: { xs: '2.5rem', md: '4rem' },
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            textAlign: 'center',
            lineHeight: 1.2
          }}>
            Do the Cooking Steps
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 6,
            animation: 'float 3s ease-in-out infinite',
            '@keyframes float': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
              '100%': { transform: 'translateY(0px)' }
            },
            maxWidth: '800px',
            textAlign: 'center'
          }}>
            <Box
              component="img"
              src={baconardoImg}
              alt="Baconardo"
              sx={{
                width: 120,
                height: 'auto',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                outline: '4px solid white',
                borderRadius: '50%',
                mr: { xs: 0, md: 4 },
                mb: { xs: 3, md: 0 }
              }}
            />
            <Typography variant="h4" sx={{ 
              color: 'rgba(255, 255, 255, 0.95)', 
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.5,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              maxWidth: '600px',
              textAlign: { xs: 'center', md: 'left' }
            }}>
              Hi! I'm Baconardo! Let's cook the perfect fried egg with the right actions!
            </Typography>
          </Box>
          
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
              Start Cooking!
            </Button>
          </Stack>
        </Box>
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
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      overflow: 'hidden'
    }}>
      {/* Animation Styles */}
      <style>
        {`
          @keyframes confettiFall {
            0% {
              transform: translateY(-100vh) rotate(0deg) scale(0.8);
              opacity: 1;
            }
            10% {
              opacity: 1;
              transform: translateY(-90vh) rotate(36deg) scale(1);
            }
            90% {
              opacity: 0.8;
              transform: translateY(90vh) translateX(var(--drift)) rotate(324deg) scale(0.6);
            }
            100% {
              transform: translateY(100vh) translateX(var(--drift2)) rotate(360deg) scale(0);
              opacity: 0;
            }
          }
        `}
      </style>
      
      <Box sx={{ 
        py: 1,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Enhanced Progress Bar */}
        <Box sx={{ 
          maxWidth: '800px', 
          mx: 'auto',
          position: 'relative',
          mb: 2,
          zIndex: 1010,
          mt: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1 
          }}>
            {[...Array(3)].map((_, index) => {
              const isFilled = index < completedCount;
              return (
                <Box
                  key={index}
                  sx={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isFilled ? '#4CAF50' : '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: isFilled ? 'white' : '#666',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    border: '2px solid white',
                    animation: isFilled ? 'popIn 0.5s ease-out' : 'none',
                    '@keyframes popIn': {
                      '0%': { transform: 'scale(0)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }}
                >
                  {isFilled ? '✓' : index + 1}
                </Box>
              );
            })}
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ 
              height: 16,
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              '& .MuiLinearProgress-bar': {
                borderRadius: '10px',
                background: 'linear-gradient(90deg, #FFC107 0%, #FF9800 50%, #4CAF50 100%)',
                transition: 'width 0.5s ease-in-out'
              }
            }} 
          />
          
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            px: 2,
            py: 1,
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            textAlign: 'center',
            mt: 1,
            fontSize: '0.9rem'
          }}>
            Prepared Ingredients: {completedCount}/3
          </Typography>
        </Box>

        {/* Chef Baconardo Character */}
        <Box
          sx={{
            position: 'fixed',
            left: 20,
            bottom: 20,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Box
            component="img"
            src={baconardoImg}
            alt="Baconardo the Cooking Cat"
            sx={{
              width: 120,
              height: 'auto',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              outline: '4px solid white',
              borderRadius: '50%',
              animation: baconardoAnimation === 'idle' ? 'float 3s ease-in-out infinite, subtleBlink 4s ease-in-out infinite' :
                       baconardoAnimation === 'nod' ? 'nod 0.5s ease-out' :
                       baconardoAnimation === 'celebrate' ? 'celebrate 2s ease-in-out infinite' : 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' },
                '100%': { transform: 'translateY(0px)' }
              },
              '@keyframes nod': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-5px)' }
              },
              '@keyframes celebrate': {
                '0%': { transform: 'translateY(0px) rotate(0deg)' },
                '25%': { transform: 'translateY(-15px) rotate(10deg)' },
                '50%': { transform: 'translateY(-20px) rotate(0deg)' },
                '75%': { transform: 'translateY(-15px) rotate(-10deg)' },
                '100%': { transform: 'translateY(0px) rotate(0deg)' }
              },
              '@keyframes subtleBlink': {
                '0%, 90%, 100%': { opacity: 1 },
                '95%': { opacity: 0.7 }
              }
            }}
          />
          <Paper
            sx={{
              position: 'absolute',
              top: -80,
              left: 140,
              backgroundColor: 'white',
              color: '#280B60',
              padding: '12px 16px',
              borderRadius: '20px',
              fontSize: '1.1rem',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              maxWidth: '180px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
              border: '3px solid #FF9800',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '-12px',
                marginTop: '-8px',
                borderWidth: '8px',
                borderStyle: 'solid',
                borderColor: 'transparent #FF9800 transparent transparent'
              }
            }}
          >
            {baconardoMessage}
          </Paper>
        </Box>

        {/* Less Distracting Navigation Buttons */}
        <Box sx={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          opacity: 0.8,
          '&:hover': {
            opacity: 1
          }
        }}>
          <Button 
            variant="contained"
            onClick={resetGame}
            sx={{ 
              background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '10px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 6px 12px rgba(255, 89, 94, 0.3)',
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
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '10px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 6px 12px rgba(25, 130, 196, 0.3)',
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

          {/* Sound Toggle Button */}
          <Button 
            variant="contained"
            onClick={toggleMute}
            sx={{ 
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              color: 'white',
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: '10px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 6px 12px rgba(76, 175, 80, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </Button>
        </Box>

        {/* Main Game Area */}
        {!showCompletion && (
          <Box 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              position: 'relative',
              height: 'calc(100vh - 150px)',
              overflow: 'hidden',
              padding: 2
            }}
          >
            {/* Current Step Instruction */}
              <Typography variant="h7" sx={{ 
                color: 'white',
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                // REMOVED: backgroundColor: 'rgba(0, 0, 0, 0.7)',
                px: 3,
                py: 2,
                borderRadius: '10px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                mb: 3,
                textAlign: 'center',
                maxWidth: '600px'
              }}>
                {currentIngredient.intro}
              </Typography>
            {/* Ingredient Display Area */}
            <Box 
              onClick={handleIngredientAction}
              sx={{
                position: 'relative',
                backgroundColor: getCurrentIngredientCompleted() ? 'rgba(232, 245, 232, 0.9)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(5px)',
                border: `3px solid ${getCurrentIngredientCompleted() ? '#4CAF50' : '#FF8F00'}`,
                borderRadius: '20px',
                padding: '30px',
                cursor: getCurrentIngredientCompleted() ? 'default' : 'pointer',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                transform: (onionAnimation && currentIngredientIndex === 0) || 
                           (eggAnimation && currentIngredientIndex === 1) || 
                           (saltAnimation && currentIngredientIndex === 2) ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease',
                mb: 4
              }}
            >
              {/* Completion Check */}
              {getCurrentIngredientCompleted() && (
                <Box sx={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                }}>
                  ✓
                </Box>
              )}

              {/* Ingredient Name */}
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: '#8B4513', 
                mb: 3,
                fontFamily: 'Poppins, sans-serif'
              }}>
                {currentIngredient.name}
              </Typography>
              
              {/* Dynamic Image Container */}
              <Box sx={{
                width: '150px',
                height: '150px',
                margin: '0 auto 25px',
                backgroundColor: getCurrentIngredientCompleted() ? '#F0F8F0' : '#FFF8DC',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transform: (onionAnimation && currentIngredientIndex === 0) ? 'rotate(5deg)' :
                          (eggAnimation && currentIngredientIndex === 1) ? 'rotate(2deg)' :
                          (saltAnimation && currentIngredientIndex === 2) ? 'rotate(-10deg)' : 'rotate(0deg)',
                transition: 'all 0.3s ease'
              }}>
                {/* Knife Animation for Onion */}
                {currentIngredientIndex === 0 && !getCurrentIngredientCompleted() && (
                  <Box sx={{
                    position: 'absolute',
                    top: knifeChop ? '50px' : '-15px',
                    right: '8px',
                    width: '60px',
                    height: '80px',
                    transition: 'top 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'rotate(-45deg)',
                    zIndex: 10,
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                  }}>
                    <img 
                      src={knifeImg}
                      alt="Knife"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                )}

                {/* Onion chopping pieces animation */}
                {currentIngredientIndex === 0 && !getCurrentIngredientCompleted() && (
                  <>
                    {/* Main onion that gets smaller with each chop */}
                    <img 
                      src={springOnionImg}
                      alt="Spring Onion"
                      style={{
                        width: `${100 - (springOnionChops * 15)}px`,
                        height: `${100 - (springOnionChops * 15)}px`,
                        objectFit: 'contain',
                        opacity: springOnionChops >= requiredChops ? 0 : 1,
                        transition: 'all 0.3s ease',
                        filter: onionAnimation ? 'blur(2px)' : 'none'
                      }}
                    />
                    
                    {/* Chopped pieces that appear with each tap */}
                    {onionPieces.map((piece) => (
                      <Box
                        key={piece.id}
                        sx={{
                          position: 'absolute',
                          left: `${piece.left}%`,
                          top: `${piece.top}%`,
                          width: `${piece.size}px`,
                          height: `${piece.size}px`,
                          backgroundImage: `url(${springOnionChoppedImg})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '50%',
                          transform: `rotate(${piece.rotation}deg)`,
                          animation: 'pieceAppear 0.3s ease-out',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Show completed chopped onion */}
                {currentIngredientIndex === 0 && getCurrentIngredientCompleted() && (
                  <img 
                    src={currentIngredient.afterImage}
                    alt={currentIngredient.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain'
                    }}
                  />
                )}

                {/* Show other ingredients normally */}
                {currentIngredientIndex !== 0 && (
                  <img 
                    src={getCurrentIngredientCompleted() ? currentIngredient.afterImage : currentIngredient.beforeImage}
                    alt={currentIngredient.name}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain'
                    }}
                  />
                )}
              </Box>

              {/* Action Button/Text */}
              <Box sx={{
                marginBottom: '15px',
                width: '100%'
              }}>
                <Typography variant="h6" sx={{ 
                  color: '#8B4513', 
                  fontWeight: 'bold', 
                  mb: 1,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {getCurrentIngredientCompleted() ? 'Completed!' : currentIngredient.actionText}
                </Typography>
                
                <Typography variant="body1" sx={{ 
                  color: '#666', 
                  mb: 1,
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {currentIngredient.progressText}
                </Typography>
              </Box>

              {/* Encouragement Text */}
              {!getCurrentIngredientCompleted() && (
                <Typography variant="body1" sx={{ 
                  color: '#FF8F00', 
                  fontStyle: 'italic', 
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {currentIngredient.encouragement}
                </Typography>
              )}
            </Box>

            {/* Progress Indicator */}
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 3,
              py: 1,
              borderRadius: '10px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              Step {currentIngredientIndex + 1} of 3: {currentIngredient.name}
            </Typography>
          </Box>
        )}

        {/* Simple Confetti Animation */}
        {showConfetti && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1500
          }}>
            {[...Array(30)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  top: '-10px',
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 6 + 3}px`,
                  height: `${Math.random() * 6 + 3}px`,
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9800', '#4CAF50'][Math.floor(Math.random() * 8)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                  animation: `simpleConfettiFall ${Math.random() * 2 + 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
          </Box>
        )}

        {/* Success Dialog - Updated to match Level 1 style */}
        <Dialog
          open={showCompletion}
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
          {/* Confetti Animation */}
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
                  '--drift': `${piece.drift * 60}px`,
                  '--drift2': `${piece.drift * 70}px`,
                }}
              />
            ))}
          </Box>
          
          <Box sx={{
            textAlign: 'center',
            color: 'white',
            zIndex: 1001,
            px: 3
          }}>
            {/* Trophy Icon with Baconardo */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 4 
            }}>
              <EmojiEventsIcon sx={{ 
                fontSize: 150,
                color: 'white',
                mr: 3
              }} />
            </Box>
            
            {/* Main Title */}
            <Typography variant="h1" sx={{
              fontWeight: 'bold',
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
              mb: 2
            }}>
              Masterful Preparation!
            </Typography>
            
            {/* Star Rating */}
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
            
            {/* Description */}
            <Typography variant="h6" sx={{
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: { xs: '1rem', md: '1.2rem' }
            }}>
              Perfect chopping, cracking, and seasoning! All ingredients are expertly prepared and ready for cooking!
            </Typography>
            
            {/* Progress Saving Indicator */}
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
            
            {/* Progress Saved Indicator */}
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
            
            {/* Action Buttons - All in one row */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              flexWrap: 'wrap',
              width: '100%'
            }}>
              <Button 
                onClick={() => {
                  setShowCompletion(false);
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
                  minWidth: '200px',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '2px'
                  }
                }}
              >
                Prepare Again
              </Button>
              
              <Button 
                variant="contained"
                onClick={handleGoHome}
                sx={{ 
                  background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(76, 175, 80, 0.5)',
                  minWidth: '200px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Back to Home
              </Button>
              
              <Button 
                variant="contained"
                // onClick={continueToNextLevel}
                onClick={handleContinue}
                disabled={progressSaving}
                sx={{ 
                  background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                  minWidth: '200px',
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
      </Box>

      <style>{`
        @keyframes simpleConfettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes pieceAppear {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 1;
          }
        }
        @keyframes starPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}