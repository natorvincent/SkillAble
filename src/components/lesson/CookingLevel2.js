import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
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
  Switch,
  FormControlLabel
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import kitchen background and ingredient images
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";
import chefImg from "../../assets/cookingLevel1/chef.png";
import springOnionImg from "../../assets/cookingLevel2/spring-onion.png";
import springOnionChoppedImg from "../../assets/cookingLevel2/spring-onion-chopped.png";
import eggImg from "../../assets/cookingLevel2/egg.png";
import eggCrackedImg from "../../assets/cookingLevel2/egg-cracked.png";
import saltImg from "../../assets/cookingLevel2/salt.png";
import saltPouringImg from "../../assets/cookingLevel2/salt-pouring.png";
import knifeImg from "../../assets/cookingLevel2/knife.png";

export default function IngredientPrepLevel2() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();

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
  
  // Progress tracking states
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  
  // Simple animation states
  const [onionAnimation, setOnionAnimation] = useState(false);
  const [eggAnimation, setEggAnimation] = useState(false);
  const [saltAnimation, setSaltAnimation] = useState(false);
  const [knifeChop, setKnifeChop] = useState(false);
  const [onionPieces, setOnionPieces] = useState([]);
  const [showChef, setShowChef] = useState(true);
  
  // Progress tracking
  const [completedTasks, setCompletedTasks] = useState({
    onion: false,
    egg: false,
    salt: false
  });

  const requiredChops = 5;
  const requiredShakes = 3;

  // Get student ID from localStorage
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
      
      console.log('Progress saved:', progressData);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  const goToHomepage = () => {
    if (navigate) {
      navigate('/homepage');
    } else {
      window.location.href = '/homepage';
    }
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    setTimeout(() => {
      navigate('/lesson/cooking/level-3');
    }, 300);
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

  // Handle scroll to hide/show chef
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowChef(false);
      } else {
        setShowChef(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Synthesized sound using Web Audio API (fallback when audio files aren't available)
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
        // Success sound - cheerful ascending notes
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(659, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.2); // G5
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
  
  // Ingredients data
  const ingredients = [
    {
      id: 'onion',
      name: 'Spring Onion',
      beforeImage: springOnionImg,
      afterImage: springOnionChoppedImg,
      actionText: 'Tap to Chop',
      progressText: `${springOnionChops}/${requiredChops} chops`,
      encouragement: 'Keep chopping!'
    },
    {
      id: 'egg', 
      name: 'Egg',
      beforeImage: eggImg,
      afterImage: eggCrackedImg,
      actionText: 'Tap to Crack',
      progressText: eggCracked ? 'Cracked into bowl' : 'Ready to crack',
      encouragement: 'Crack into bowl!'
    },
    {
      id: 'salt',
      name: 'Salt', 
      beforeImage: saltImg,
      afterImage: saltPouringImg,
      actionText: 'Tap to Shake',
      progressText: `${saltShakes}/${requiredShakes} shakes`,
      encouragement: 'Season well!'
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
      playSynthSound('success'); // Fallback synthesized sound
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentIngredientIndex(1);
      }, 2000);
    } else if (currentIngredientIndex === 1 && newCompletedTasks.egg && !completedTasks.egg) {
      playSound(successSoundRef);
      playSynthSound('success'); // Fallback synthesized sound
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentIngredientIndex(2);
      }, 2000);
    } else if (currentIngredientIndex === 2 && newCompletedTasks.salt && !completedTasks.salt) {
      playSound(successSoundRef);
      playSynthSound('success'); // Fallback synthesized sound
      setShowConfetti(true);
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
      playSynthSound('chop'); // Fallback synthesized sound
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
      
      setTimeout(() => {
        setOnionAnimation(false);
        setKnifeChop(false);
      }, 300);
    } else if (currentIngredientIndex === 1) {
      playSound(crackSoundRef);
      playSynthSound('crack'); // Fallback synthesized sound
      setEggAnimation(true);
      setTimeout(() => {
        setEggCracked(true);
        setEggAnimation(false);
      }, 500);
    } else if (currentIngredientIndex === 2) {
      playSound(shakeSoundRef);
      playSynthSound('shake'); // Fallback synthesized sound
      setSaltAnimation(true);
      setSaltShakes(prev => prev + 1);
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
      backgroundAttachment: 'fixed',
      position: 'relative',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none'
      }} />
      
      {/* Chef Character - Fixed beside container */}
      <div style={{
        position: 'fixed',
        top: '100px',
        left: 'calc(50% + 620px)',
        zIndex: 50,
        opacity: showChef ? 1 : 0,
        transform: showChef ? 'translateX(0)' : 'translateX(20px)',
        transition: 'all 0.3s ease',
        pointerEvents: showChef ? 'auto' : 'none'
      }}>
        <img 
          src={chefImg}
          alt="Chef"
          style={{
            width: '120px',
            height: '120px',
            objectFit: 'contain',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
          }}
        />
        
        {/* Chef's Message Bubble */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '130px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '15px 20px',
          borderRadius: '20px',
          border: '3px solid #FF8F00',
          width: '280px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <p style={{
            margin: 0,
            color: '#8B4513',
            fontSize: '13px',
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            <span style={{ fontSize: '16px' }}>👨‍🍳</span> <strong>Chef's Tip:</strong> Tap each ingredient to prepare it! Chop the spring onion, crack the egg, and shake the salt. Watch as your ingredients get ready for cooking!
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
      </div>

      {/* Sound Toggle Button - Fixed position */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '20px' }}>

          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#8B4513', 
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            Level 2: Prepare Ingredients
          </h1>
          
          <div style={{
            display: 'inline-block',
            backgroundColor: '#FF8F00',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '18px',
            marginBottom: '30px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}>
            Ingredient Preparation {!isMuted && <span>🔊</span>}
          </div>

          {/* Progress Bar */}
          <div style={{ maxWidth: '400px', margin: '0 auto 30px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '8px' 
            }}>
              <span style={{ color: '#8B4513', fontWeight: 'bold' }}>
                Step {currentIngredientIndex + 1} of {totalIngredients}
              </span>
              <span style={{ color: '#8B4513' }}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '12px',
              backgroundColor: 'rgba(139, 69, 19, 0.3)',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: '#4CAF50',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          <p style={{ 
            color: '#8B4513', 
            fontSize: '18px', 
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            {getCurrentIngredientCompleted() ? 
              'Moving to next ingredient...' : 
              `Prepare the ${currentIngredient.name.toLowerCase()}!`}
          </p>
        </div>

        {/* Current Ingredient Display */}
        <div style={{
          maxWidth: '500px',
          margin: '0 auto 40px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div 
            onClick={handleIngredientAction}
            style={{
              position: 'relative',
              backgroundColor: getCurrentIngredientCompleted() ? 'rgba(232, 245, 232, 0.8)' : 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: `4px solid ${getCurrentIngredientCompleted() ? '#4CAF50' : '#FF8F00'}`,
              borderRadius: '20px',
              padding: '40px',
              cursor: getCurrentIngredientCompleted() ? 'default' : 'pointer',
              minHeight: '400px',
              width: '100%',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'center',
              boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
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
                top: '20px',
                right: '20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                ✓
              </div>
            )}

            <div>
              <h2 style={{ 
                fontSize: '32px', 
                fontWeight: 'bold', 
                color: '#8B4513', 
                marginBottom: '30px' 
              }}>
                {currentIngredient.name}
              </h2>
              
              {/* Dynamic Image */}
              <div style={{
                width: '150px',
                height: '150px',
                margin: '0 auto 30px',
                backgroundColor: getCurrentIngredientCompleted() ? '#F0F8F0' : '#FFF8DC',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `4px solid ${getCurrentIngredientCompleted() ? '#4CAF50' : '#FF8F00'}`,
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
                    top: knifeChop ? '60px' : '-20px',
                    right: '10px',
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

                {/* Sound effect indicator */}
                {!getCurrentIngredientCompleted() && !isMuted && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    right: '-10px',
                    backgroundColor: '#FF8F00',
                    color: 'white',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    animation: currentIngredientIndex === 0 && onionAnimation ? 'pulse 0.3s ease' :
                              currentIngredientIndex === 1 && eggAnimation ? 'pulse 0.5s ease' :
                              currentIngredientIndex === 2 && saltAnimation ? 'pulse 0.4s ease' : 'none'
                  }}>
                    🔊
                  </div>
                )}
              </div>

              <p style={{ 
                color: '#8B4513', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                fontSize: '20px'
              }}>
                {getCurrentIngredientCompleted() ? 'Completed!' : currentIngredient.actionText}
              </p>
              
              <p style={{ color: '#666', fontSize: '16px', marginBottom: '15px' }}>
                {currentIngredient.progressText}
              </p>
            </div>

            {!getCurrentIngredientCompleted() && (
              <p style={{ 
                color: '#FF8F00', 
                fontStyle: 'italic', 
                fontSize: '16px',
                marginTop: '20px'
              }}>
                {currentIngredient.encouragement}
              </p>
            )}
          </div>
        </div>

        {/* Completed Ingredients Preview */}
        {currentIngredientIndex > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ 
              textAlign: 'center', 
              color: '#8B4513', 
              marginBottom: '20px',
              fontSize: '20px'
            }}>
              Completed Steps:
            </h3>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              flexWrap: 'wrap'
            }}>
              {ingredients.slice(0, currentIngredientIndex).map((ingredient) => (
                <div key={ingredient.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#E8F5E8',
                  padding: '8px 15px',
                  borderRadius: '20px',
                  border: '2px solid #4CAF50'
                }}>
                  <img 
                    src={ingredient.afterImage}
                    alt={ingredient.name}
                    style={{
                      width: '30px',
                      height: '30px',
                      objectFit: 'contain',
                      marginRight: '8px'
                    }}
                  />
                  <span style={{ color: '#2E7D32', fontWeight: 'bold' }}>
                    {ingredient.name} ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Bottom Control Bar */}
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          display: 'flex',
          gap: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 24px',
          borderRadius: '30px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: '2px solid rgba(255, 255, 255, 0.5)'
        }}>
          <Button
            onClick={resetGame}
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: '#FF9800',
              borderRadius: '20px',
              minWidth: '100px',
              '&:hover': { backgroundColor: '#F57C00' }
            }}
          >
            🔄 Reset
          </Button>
          <Button
            onClick={goToHomepage}
            variant="contained"
            size="medium"
            sx={{
              backgroundColor: '#2196F3',
              borderRadius: '20px',
              minWidth: '100px',
              '&:hover': { backgroundColor: '#1976D2' }
            }}
          >
            🏠 Home
          </Button>
          
          {(completedTasks.onion && completedTasks.egg && completedTasks.salt) && (
            <Button
              onClick={continueToNextLevel}
              disabled={progressSaving}
              variant="contained"
              size="medium"
              sx={{
                backgroundColor: '#4CAF50',
                borderRadius: '20px',
                minWidth: '120px',
                '&:hover': { backgroundColor: '#45a049' },
                animation: 'pulse 2s infinite'
              }}
            >
              {progressSaving ? 'Saving...' : '🚀 Next Level'}
            </Button>
          )}
        </Box>

        {/* Confetti Animation */}
        {showConfetti && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1500 }}>
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9800', '#4CAF50'][Math.floor(Math.random() * 8)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                  animation: `confettiFall ${Math.random() * 2 + 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            ))}
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
                50% { transform: scale(1.2); }
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
            `}</style>
          </div>
        )}

        {/* Success Modal */}
        {showCompletion && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '40px',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'center',
              border: '4px solid #4CAF50',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>🏆</div>
              
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: '#2E7D32', 
                marginBottom: '20px' 
              }}>
                Level 2 Complete!
              </h2>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '20px', 
                fontSize: '32px' 
              }}>
                <span style={{ margin: '0 5px' }}>⭐</span>
                <span style={{ margin: '0 5px' }}>⭐</span>
                <span style={{ margin: '0 5px' }}>⭐</span>
              </div>
              
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#2E7D32', 
                marginBottom: '20px' 
              }}>
                Ingredients are ready to cook!
              </h3>
              
              <p style={{ 
                color: '#5D4037', 
                fontSize: '16px', 
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                You have successfully prepared all the ingredients: chopped spring onion, cracked egg, and shaken salt.
              </p>
              
              <p style={{ color: '#5D4037', fontSize: '16px', marginBottom: '30px' }}>
                Ready for Level 3 - Let's start cooking!
              </p>

              {progressSaving && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.9)', borderRadius: '12px', color: 'white' }}>
                  <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                  <Typography variant="body2">Saving your progress...</Typography>
                </Box>
              )}
              
              {progressSaved && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.9)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">Progress saved successfully!</Typography>
                </Box>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
                <Button 
                  onClick={continueToNextLevel}
                  disabled={progressSaving}
                  variant="contained"
                  size="large"
                  sx={{ 
                    backgroundColor: '#4CAF50',
                    borderRadius: '15px',
                    minWidth: '120px',
                    '&:hover': { backgroundColor: '#45a049' }
                  }}
                >
                  {progressSaving ? 'Saving...' : '🚀 Next Level'}
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
                  🔄 Play Again
                </Button>
                <Button 
                  onClick={goToHomepage}
                  variant="contained"
                  size="large"
                  sx={{ 
                    backgroundColor: '#2196F3',
                    borderRadius: '15px',
                    minWidth: '120px',
                    '&:hover': { backgroundColor: '#1976D2' }
                  }}
                >
                  🏠 Home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}