import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import Navbar from '../Navbar';

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

  // Sequential ingredient flow
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(0);
  const [springOnionChops, setSpringOnionChops] = useState(0);
  const [eggCracked, setEggCracked] = useState(false);
  const [saltShakes, setSaltShakes] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  
  // Progress tracking states
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  
  // Simple animation states
  const [onionAnimation, setOnionAnimation] = useState(false);
  const [eggAnimation, setEggAnimation] = useState(false);
  const [saltAnimation, setSaltAnimation] = useState(false);
  const [knifeChop, setKnifeChop] = useState(false);
  const [onionPieces, setOnionPieces] = useState([]);
  
  // Baconardo states - ALWAYS VISIBLE
  const [showBaconardo, setShowBaconardo] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
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

  // Get star rating based on performance
  const getStarRating = () => {
    // Always return 3 stars for perfect completion
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

  // Get student ID from localStorage
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
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      const finalScore = 3;
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: 3,
        completed: true,
        starsEarned: 3
      };
      
      // NOTE: Call your actual service here:
      // await saveStudentLessonProgress(progressData); 
      
      console.log('Progress simulatedly saved:', progressData);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  const goToHomepage = () => {
    navigate('/homepage');
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    navigate('/lesson/cooking/level-3');
  };

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

  // REMOVED SCROLL EFFECT - Baconardo will always be visible

  // Baconardo introduction for each ingredient
  useEffect(() => {
    if (!showIntro) {
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
  }, [currentIngredientIndex, showIntro]);

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

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercentage = ((currentIngredientIndex + (getCurrentIngredientCompleted() ? 1 : 0)) / totalIngredients) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: kitchenBg ? `url(${kitchenBg})` : 'linear-gradient(135deg, #FFE0B2, #FFCC02, #FF8F00)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      height: '100vh'
    }}>
      {/* Background Dim Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none'
      }} />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Introduction Dialog with Chef Baconardo */}
      <Dialog 
        open={showIntro} 
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
            border: '4px solid #FF9800'
          }
        }}
      >
        <DialogTitle style={{ 
          textAlign: 'center', 
          background: 'linear-gradient(45deg, #FF9800, #F57C00)',
          color: 'white',
          borderRadius: '15px 15px 0 0',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
            <div style={{ fontSize: '40px' }}>👨‍🍳</div>
            <h2 style={{ margin: 0, fontSize: '28px' }}>Welcome to Cooking Level 2!</h2>
            <div style={{ fontSize: '40px' }}>🔪</div>
          </div>
        </DialogTitle>
        
        <DialogContent style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <img 
              src={baconardoImg} 
              alt="Chef Baconardo" 
              style={{ 
                width: '120px', 
                height: '120px', 
                objectFit: 'contain',
                borderRadius: '50%',
                border: '3px solid #FF9800'
              }} 
            />
            <div>
              <h3 style={{ color: '#E65100', marginBottom: '10px', fontSize: '24px' }}>
                Time to Prep! 🥓
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#5D4037' }}>
                "Hello again! I'm Chef Baconardo! Now that we have our ingredients, let's prepare them for cooking! 
                We'll chop the spring onion, crack the egg, and season with salt. I'll guide you through each step!"
              </p>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(76, 175, 80, 0.1)', 
            padding: '15px', 
            borderRadius: '12px',
            border: '2px solid rgba(76, 175, 80, 0.3)',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <p style={{ margin: 0, color: '#2E7D32', fontWeight: 'bold', fontSize: '16px' }}>
              👉 I'll guide you through each preparation step from the top-right corner!
            </p>
          </div>
        </DialogContent>
        
        <DialogActions style={{ justifyContent: 'center', padding: '20px' }}>
          <Button
            onClick={() => setShowIntro(false)}
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#4CAF50',
              borderRadius: '25px',
              padding: '12px 40px',
              fontSize: '16px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#45a049',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            🚀 Start Preparing!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chef Baconardo Character - Fixed beside container - ALWAYS VISIBLE */}
      <div style={{
        position: 'fixed',
        top: '140px',
        left: 'calc(50% + 620px)',
        zIndex: 50,
        opacity: 1,
        transform: 'translateX(0)',
        transition: 'all 0.3s ease',
        pointerEvents: 'auto',
        '@media (max-width: 1400px)': {
          left: 'calc(50% + 500px)'
        },
        '@media (max-width: 1200px)': {
          display: 'none'
        }
      }}>
        {/* Baconardo's Message Bubble */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '130px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '15px 20px',
          borderRadius: '20px',
          border: '3px solid #FF8F00',
          width: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: baconardoAnimation === 'idle' ? 'baconardoIdle 3s ease-in-out infinite' : 
                    baconardoAnimation === 'nod' ? 'baconardoNod 0.5s ease-out' :
                    baconardoAnimation === 'celebrate' ? 'baconardoCelebrate 1s ease-out' : 'none',
          '@media (max-width: 1400px)': {
            width: '250px',
            padding: '12px 16px'
          }
        }}>
          <p style={{
            margin: 0,
            color: '#8B4513',
            fontSize: '13px',
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            {baconardoMessage}
          </p>
          {/* Speech bubble pointer */}
          <div style={{
            position: 'absolute',
            right: '-12px',
            top: '20px',
            width: 0,
            height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderLeft: '12px solid #FF8F00'
          }} />
          <div style={{
            position: 'absolute',
            right: '-8px',
            top: '22px',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '10px solid rgba(255, 255, 255, 0.95)'
          }} />
        </div>

        <img 
          src={baconardoImg}
          alt="Chef Baconardo"
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
            cursor: 'pointer',
            animation: baconardoAnimation === 'idle' ? 'baconardoIdle 3s ease-in-out infinite' : 
                      baconardoAnimation === 'nod' ? 'baconardoNod 0.5s ease-out' :
                      baconardoAnimation === 'celebrate' ? 'baconardoCelebrate 1s ease-out' : 'none',
            '@media (max-width: 1400px)': {
              width: '100px',
              height: '100px'
            }
          }}
          onClick={() => showBaconardoFeedback("I'm Chef Baconardo! Let me help you prepare these ingredients. Follow my guidance for perfect preparation! 🥓", 'nod')}
          title="Click me for cooking tips! - Chef Baconardo"
        />
      </div>

      {/* Sound Toggle Button - Fixed position */}
      <div style={{ 
        position: 'fixed', 
        top: '80px',
        right: '20px', 
        zIndex: 100 
      }}>
        <button
          onClick={toggleMute}
          style={{
            backgroundColor: isMuted ? '#FF5722' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            fontSize: '20px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          <span>{isMuted ? '🔇' : '🔊'}</span>
        </button>
      </div>

      {/* Main Game Container - Fully Responsive */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        right: '20px',
        bottom: '90px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        overflow: 'hidden'
      }}>
        
        {/* Header Section - Compact and Responsive */}
        <div style={{
          width: '100%',
          maxWidth: '800px',
          marginBottom: '10px'
        }}>
          {/* Level Title and Progress - Compact Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '8px 16px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            marginBottom: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                backgroundColor: '#FF8F00',
                color: 'white',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                2
              </div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#8B4513',
                margin: 0
              }}>
                Level 2: Prepare Ingredients
              </h1>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#FF8F00'
              }}>
                {completedCount}/{totalIngredients}
              </span>
              <div style={{
                width: '40px',
                height: '40px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CircularProgress 
                  variant="determinate" 
                  value={progressPercentage}
                  size={40}
                  thickness={4}
                  sx={{ 
                    color: '#4CAF50',
                    position: 'absolute'
                  }}
                />
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#8B4513'
                }}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* Current Step Indicator - Very Compact */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '8px',
            borderLeft: '3px solid #2196F3',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              color: '#8B4513',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {currentIngredient.intro}
            </p>
          </div>

          {/* Task Instruction */}
          <p style={{ 
            color: '#8B4513', 
            fontSize: '14px', 
            fontWeight: 'bold',
            margin: 0,
            textAlign: 'center'
          }}>
            Prepare the {currentIngredient.name.toLowerCase()}!
          </p>
        </div>

        {/* Main Ingredient Display - Centered and Responsive */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '500px',
          margin: '10px 0'
        }}>
          <div 
            onClick={handleIngredientAction}
            style={{
              position: 'relative',
              backgroundColor: getCurrentIngredientCompleted() ? 'rgba(232, 245, 232, 0.9)' : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(5px)',
              border: `3px solid ${getCurrentIngredientCompleted() ? '#4CAF50' : '#FF8F00'}`,
              borderRadius: '16px',
              padding: '20px',
              cursor: getCurrentIngredientCompleted() ? 'default' : 'pointer',
              width: '100%',
              maxWidth: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
              transform: (onionAnimation && currentIngredientIndex === 0) || 
                         (eggAnimation && currentIngredientIndex === 1) || 
                         (saltAnimation && currentIngredientIndex === 2) ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
          >
            {/* Completion Check */}
            {getCurrentIngredientCompleted() && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                ✓
              </div>
            )}

            {/* Ingredient Name */}
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#8B4513', 
              marginBottom: '20px',
              marginTop: '0'
            }}>
              {currentIngredient.name}
            </h2>
            
            {/* Dynamic Image Container */}
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto 20px',
              backgroundColor: getCurrentIngredientCompleted() ? '#F0F8F0' : '#FFF8DC',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `3px solid ${getCurrentIngredientCompleted() ? '#4CAF50' : '#FF8F00'}`,
              position: 'relative',
              overflow: 'hidden',
              transform: (onionAnimation && currentIngredientIndex === 0) ? 'rotate(5deg)' :
                        (eggAnimation && currentIngredientIndex === 1) ? 'rotate(2deg)' :
                        (saltAnimation && currentIngredientIndex === 2) ? 'rotate(-10deg)' : 'rotate(0deg)',
              transition: 'all 0.3s ease'
            }}>
              {/* Knife Animation for Onion */}
              {currentIngredientIndex === 0 && !getCurrentIngredientCompleted() && (
                <div style={{
                  position: 'absolute',
                  top: knifeChop ? '50px' : '-15px',
                  right: '8px',
                  width: '50px',
                  height: '65px',
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
                </div>
              )}

              {/* Onion chopping pieces animation */}
              {currentIngredientIndex === 0 && !getCurrentIngredientCompleted() && (
                <>
                  {/* Main onion that gets smaller with each chop */}
                  <img 
                    src={springOnionImg}
                    alt="Spring Onion"
                    style={{
                      width: `${80 - (springOnionChops * 12)}px`,
                      height: `${80 - (springOnionChops * 12)}px`,
                      objectFit: 'contain',
                      opacity: springOnionChops >= requiredChops ? 0 : 1,
                      transition: 'all 0.3s ease',
                      filter: onionAnimation ? 'blur(2px)' : 'none'
                    }}
                  />
                  
                  {/* Chopped pieces that appear with each tap */}
                  {onionPieces.map((piece) => (
                    <div
                      key={piece.id}
                      style={{
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
                    width: '80px',
                    height: '80px',
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
                    width: '80px',
                    height: '80px',
                    objectFit: 'contain'
                  }}
                />
              )}
            </div>

            {/* Action Button/Text */}
            <div style={{
              marginBottom: '10px',
              width: '100%'
            }}>
              <p style={{ 
                color: '#8B4513', 
                fontWeight: 'bold', 
                fontSize: '18px',
                marginBottom: '6px'
              }}>
                {getCurrentIngredientCompleted() ? 'Completed!' : currentIngredient.actionText}
              </p>
              
              <p style={{ 
                color: '#666', 
                fontSize: '14px', 
                marginBottom: '6px'
              }}>
                {currentIngredient.progressText}
              </p>
            </div>

            {/* Encouragement Text */}
            {!getCurrentIngredientCompleted() && (
              <p style={{ 
                color: '#FF8F00', 
                fontStyle: 'italic', 
                fontSize: '14px',
                marginTop: '6px'
              }}>
                {currentIngredient.encouragement}
              </p>
            )}
          </div>
        </div>

        {/* Completed Steps Preview - Only show when relevant */}
        {currentIngredientIndex > 0 && (
          <div style={{
            width: '100%',
            maxWidth: '500px',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              {ingredients.slice(0, currentIngredientIndex).map((ingredient) => (
                <div key={ingredient.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#E8F5E8',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: '2px solid #4CAF50'
                }}>
                  <img 
                    src={ingredient.afterImage}
                    alt={ingredient.name}
                    style={{
                      width: '20px',
                      height: '20px',
                      objectFit: 'contain',
                      marginRight: '6px'
                    }}
                  />
                  <span style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: '12px' }}>
                    {ingredient.name} ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Control Bar - Responsive */}
      <Box sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        gap: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '10px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
        borderTop: '2px solid rgba(255, 255, 255, 0.5)'
      }}>
        <Button
          onClick={() => showBaconardoFeedback(currentIngredient.intro, 'nod')}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#2196F3',
            borderRadius: '16px',
            minWidth: '80px',
            fontSize: '12px',
            padding: '6px 12px',
            '&:hover': { backgroundColor: '#1976D2' }
          }}
        >
          💡 Help
        </Button>
        <Button
          onClick={resetGame}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#FF9800',
            borderRadius: '16px',
            minWidth: '80px',
            fontSize: '12px',
            padding: '6px 12px',
            '&:hover': { backgroundColor: '#F57C00' }
          }}
        >
          🔄 Reset
        </Button>
        <Button
          onClick={goToHomepage}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#9C27B0',
            borderRadius: '16px',
            minWidth: '80px',
            fontSize: '12px',
            padding: '6px 12px',
            '&:hover': { backgroundColor: '#7B1FA2' }
          }}
        >
          🏠 Home
        </Button>
        
        {(completedTasks.onion && completedTasks.egg && completedTasks.salt) && (
          <Button
            onClick={continueToNextLevel}
            disabled={progressSaving}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#4CAF50',
              borderRadius: '16px',
              minWidth: '100px',
              fontSize: '12px',
              padding: '6px 12px',
              '&:hover': { backgroundColor: '#45a049' },
              animation: 'pulse 2s infinite'
            }}
          >
            {progressSaving ? 'Saving...' : '🚀 Next'}
          </Button>
        )}
      </Box>

      {/* Confetti Animation */}
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1500 }}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '-10px',
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9800', '#4CAF50'][Math.floor(Math.random() * 8)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                animation: `confettiFall ${Math.random() * 2 + 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: Math.random() * 0.8 + 0.2
              }}
            />
          ))}
        </div>
      )}

      {/* Success Modal - Updated to match Level 1 and Level 3 style */}
      {showCompletion && (
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
            {Array.from({ length: 50 }).map((_, i) => {
              const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9800', '#4CAF50'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              const randomWidth = Math.random() * 12 + 6;
              const randomHeight = Math.random() * 12 + 6;
              const randomRotation = Math.random() * 360;
              const randomDrift = (Math.random() - 0.5) * 2;
              
              return (
                <Box
                  key={i}
                  sx={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    top: `${-10}%`,
                    width: `${randomWidth}px`,
                    height: `${randomHeight}px`,
                    backgroundColor: randomColor,
                    transform: `rotate(${randomRotation}deg)`,
                    boxShadow: `0 0 10px ${randomColor}`,
                    animation: `confettiFall 4s linear infinite`,
                    animationDelay: `${Math.random() * 3}s`,
                    '@keyframes confettiFall': {
                      '0%': {
                        transform: `translateY(-100vh) rotate(${randomRotation}deg) scale(0.8)`,
                        opacity: 1
                      },
                      '10%': {
                        opacity: 1,
                        transform: `translateY(-90vh) rotate(${randomRotation + 36}deg) scale(1)`
                      },
                      '90%': {
                        opacity: 0.8,
                        transform: `translateY(90vh) translateX(${randomDrift * 60}px) rotate(${randomRotation + 324}deg) scale(0.6)`
                      },
                      '100%': {
                        transform: `translateY(100vh) translateX(${randomDrift * 70}px) rotate(${randomRotation + 360}deg) scale(0)`,
                        opacity: 0
                      }
                    }
                  }}
                />
              );
            })}
          </Box>
          
          <Box sx={{
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            zIndex: 1001,
            padding: '20px'
          }}>
            {/* Trophy Icon */}
            <EmojiEventsIcon sx={{
              fontSize: 150,
              color: 'white',
              mb: 4,
              filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.5))'
            }} />
            
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
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
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
           
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                onClick={continueToNextLevel}
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
                {progressSaving ? 'Saving...' : 'Next Level'}
              </Button>
              <Button
                variant="contained"
                onClick={goToHomepage}
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
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        </Dialog>
      )}

      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
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
        @keyframes baconardoIdle {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-4px) scale(1.02); }
          50% { transform: translateY(-2px) scale(1.01); }
          75% { transform: translateY(-3px) scale(1.015); }
        }
        @keyframes baconardoNod {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(5px) rotate(2deg) scale(1.05); }
          50% { transform: translateY(8px) rotate(4deg) scale(1.08); }
          75% { transform: translateY(5px) rotate(2deg) scale(1.05); }
        }
        @keyframes baconardoCelebrate {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          25% { transform: translateY(-15px) scale(1.2) rotate(-10deg); }
          50% { transform: translateY(-20px) scale(1.25) rotate(0deg); }
          75% { transform: translateY(-15px) scale(1.2) rotate(10deg); }
        }
        @keyframes starPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        /* Media Queries for responsiveness */
        @media (max-width: 768px) {
          .responsive-text {
            font-size: 14px !important;
          }
          .responsive-heading {
            font-size: 20px !important;
          }
          .responsive-button {
            min-width: 70px !important;
            font-size: 11px !important;
            padding: 4px 8px !important;
          }
        }
        
        @media (max-width: 480px) {
          .responsive-text {
            font-size: 12px !important;
          }
          .responsive-heading {
            font-size: 18px !important;
          }
          .responsive-button {
            min-width: 60px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}