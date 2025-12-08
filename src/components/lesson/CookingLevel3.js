import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import Confetti from 'react-confetti';
import confetti from 'canvas-confetti';
import Navbar from '../Navbar';

// Import kitchen background
import kitchenBg from "../../assets/cookingLevel3/bgkitchen.jpg";

// Import images for Level 3 cooking game
import oilImg from "../../assets/cookingLevel3/oil.png";
import butterImg from "../../assets/cookingLevel3/butter.png";
import eggImg from "../../assets/cookingLevel3/egg-bowl.png";
import saltImg from "../../assets/cookingLevel3/salt.png";
import springOnionImg from "../../assets/cookingLevel3/spring-onion-chopped.png";
import spatulaImg from "../../assets/cookingLevel3/wooden-spatula.png";
import cookedEggImg from "../../assets/cookingLevel3/cooked-egg.png";
import fryingPanImg from "../../assets/cookingLevel3/frying-pan.png";
import plugImg from "../../assets/cookingLevel3/plug.png";
import outletImg from "../../assets/cookingLevel3/outlet.png";

// Import Baconardo asset
import baconardoImg from "../../assets/cookingLevel3/Baconardo.png";

// Progress service imports
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

const CookingLevel3 = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const location = useLocation();

  const [gameState, setGameState] = useState({
    currentStep: 0,
    stepsCompleted: [false, false, false, false, false, false, false, false, false, false],
    stovePluggedIn: false,
    powerOn: false,
    heatLevel: null,
    panOnStove: false,
    burnerOn: false,
    panHeated: false,
    showOil: false,
    showButter: false,
    eggInPan: false,
    saltAdded: false,
    eggCooked: false,
    springOnionAdded: false,
    showSuccess: false,
    feedbackMessage: '',
    showFeedback: false,
    showCookedEggPrompt: false,
    setupPhase: true,
    showBaconardoIntro: true,
    baconardoTalking: true,
    showHeatLevelButtons: false,
    showConfetti: false,
    confettiStep: null,
    completedStepAnimation: null
  });

  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const panRef = useRef(null);
  const panHeatTimerRef = useRef(null);

  // Reset component state when route changes
  useEffect(() => {
    setGameState({
      currentStep: 0,
      stepsCompleted: [false, false, false, false, false, false, false, false, false, false],
      stovePluggedIn: false,
      powerOn: false,
      heatLevel: null,
      panOnStove: false,
      burnerOn: false,
      panHeated: false,
      showOil: false,
      showButter: false,
      eggInPan: false,
      saltAdded: false,
      eggCooked: false,
      springOnionAdded: false,
      showSuccess: false,
      feedbackMessage: '',
      showFeedback: false,
      showCookedEggPrompt: false,
      setupPhase: true,
      showBaconardoIntro: true,
      baconardoTalking: true,
      showHeatLevelButtons: false,
      showConfetti: false,
      confettiStep: null,
      completedStepAnimation: null
    });
    setProgressSaved(false);
    setProgressSaving(false);
    
    if (panHeatTimerRef.current) {
      clearTimeout(panHeatTimerRef.current);
    }
  }, [location.pathname]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (panHeatTimerRef.current) {
        clearTimeout(panHeatTimerRef.current);
      }
    };
  }, []);

  // Baconardo's guidance messages for each step
  const baconardoMessages = [
    "Hi there! I'm Baconardo, your cooking coach! Let's make some amazing scrambled eggs! First, we need power - drag the plug to the outlet!",
    "Great! Now let's turn on the stove power. Click the main power switch!",
    "Perfect! Now set the heat to MEDIUM - it's the best temperature for fluffy eggs!",
    "Excellent! Now place the frying pan on the stove - drag it over!",
    "The pan needs to heat up first! Wait for it to glow before adding ingredients.",
    "The pan is heated! Now add some cooking oil - drag the oil bottle to the pan!",
    "Wonderful! Let's add butter for extra flavor. Drag the butter to the pan!",
    "Now for the main ingredient! Drag the egg to the pan to crack it open!",
    "Perfect! Let's season it with some salt. Drag the salt shaker to the pan!",
    "Time to cook! Drag the spatula to scramble the egg in the pan!",
    "Almost done! Let's garnish with spring onion for freshness and color!",
    "CONGRATULATIONS! You've made perfect scrambled eggs! You're a real chef now! 🎉"
  ];

  // Determine current phase
  const isSetupPhase = gameState.currentStep <= 3;
  const isCookingPhase = gameState.currentStep >= 4;

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;
    setProgressSaving(true);
    setTimeout(() => {
      setProgressSaved(true);
      setProgressSaving(false);
    }, 1000);
  };

  const showFeedback = (message) => {
    setGameState(prev => ({ ...prev, feedbackMessage: message, showFeedback: true }));
    setTimeout(() => {
      setGameState(prev => ({ ...prev, showFeedback: false }));
    }, 1500);
  };

  const triggerConfetti = (stepIndex) => {
    setGameState(prev => ({ 
      ...prev, 
      showConfetti: true,
      confettiStep: stepIndex,
      completedStepAnimation: stepIndex 
    }));
    
    // Small burst for each step
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#FF9800', '#2196F3', '#E91E63']
    });
    
    // Hide animation after 1 second
    setTimeout(() => {
      setGameState(prev => ({ ...prev, completedStepAnimation: null }));
    }, 1000);
    
    // Hide confetti after 2 seconds
    setTimeout(() => {
      setGameState(prev => ({ ...prev, showConfetti: false }));
    }, 2000);
  };

  const completeStep = (stepIndex, updates) => {
    const newStepsCompleted = [...gameState.stepsCompleted];
    newStepsCompleted[stepIndex] = true;
    
    setGameState(prev => ({
      ...prev,
      ...updates,
      stepsCompleted: newStepsCompleted,
      currentStep: stepIndex + 1,
      setupPhase: stepIndex + 1 <= 3,
      baconardoTalking: true
    }));

    // Trigger confetti for completed step
    triggerConfetti(stepIndex);

    if (newStepsCompleted.every(step => step)) {
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showSuccess: true }));
        saveProgress();
      }, 1000);
    }
  };

  const handleDragStart = (e, item) => {
    setIsDragging(true);
    setDragItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    setIsDragging(false);

    if (dragItem === 'plug' && target === 'outlet' && gameState.currentStep === 0) {
      completeStep(0, { stovePluggedIn: true });
    } else if (dragItem === 'pan' && target === 'stove' && gameState.currentStep === 3) {
      completeStep(3, { panOnStove: true });
      
      // Start pan heating delay
      panHeatTimerRef.current = setTimeout(() => {
        setGameState(prev => ({ 
          ...prev, 
          panHeated: true,
          currentStep: 5, // Advance to step 5 (add oil)
          stepsCompleted: [...prev.stepsCompleted.slice(0, 4), true, ...prev.stepsCompleted.slice(5)]
        }));
      }, 5000);
    } else if (dragItem === 'oil' && target === 'pan' && gameState.currentStep === 5 && gameState.panOnStove && gameState.panHeated) {
      completeStep(5, { showOil: true });
    } else if (dragItem === 'butter' && target === 'pan' && gameState.currentStep === 6 && gameState.panOnStove && gameState.panHeated) {
      completeStep(6, { showButter: true });
    } else if (dragItem === 'egg' && target === 'pan' && gameState.currentStep === 7 && gameState.panOnStove && gameState.panHeated) {
      completeStep(7, { eggInPan: true });
    } else if (dragItem === 'salt' && target === 'pan' && gameState.currentStep === 8 && gameState.panOnStove && gameState.panHeated) {
      completeStep(8, { saltAdded: true });
    } else if (dragItem === 'spatula' && target === 'pan' && gameState.currentStep === 9 && gameState.panOnStove && gameState.panHeated) {
      completeStep(9, { eggCooked: true });
    } else if (dragItem === 'springOnion' && target === 'pan' && gameState.currentStep === 10 && gameState.panOnStove && gameState.panHeated) {
      completeStep(10, { springOnionAdded: true });
    } else if ((dragItem === 'oil' || dragItem === 'butter' || dragItem === 'egg' || dragItem === 'salt' || dragItem === 'spatula' || dragItem === 'springOnion') && target === 'pan' && !gameState.panHeated) {
      showFeedback("Wait for the pan to heat up first! It will glow when ready.");
    } else if (dragItem === 'oil' && target === 'pan' && gameState.currentStep !== 5) {
      showFeedback("Not the right time to add oil yet! Follow Baconardo's instructions.");
    }
    
    setDragItem(null);
  };

  const handleStoveClick = () => {
    if (gameState.currentStep === 1 && gameState.stovePluggedIn) {
      completeStep(1, { 
        powerOn: true,
        showHeatLevelButtons: true
      });
    }
  };

  const handleHeatLevelClick = (level) => {
    if (gameState.currentStep === 2 && gameState.powerOn) {
      if (level === 'MEDIUM') {
        completeStep(2, { 
          heatLevel: 'MEDIUM',
          showHeatLevelButtons: false
        });
      } else {
        showFeedback("Try MEDIUM heat - it works best for scrambled eggs!");
      }
    }
  };

  const handleBaconardoClick = () => {
    setGameState(prev => ({ ...prev, baconardoTalking: !prev.baconardoTalking }));
  };

  const closeBaconardoIntro = () => {
    setGameState(prev => ({ ...prev, showBaconardoIntro: false, baconardoTalking: true }));
  };

  const resetGame = () => {
    if (panHeatTimerRef.current) {
      clearTimeout(panHeatTimerRef.current);
    }

    setGameState({
      currentStep: 0,
      stepsCompleted: [false, false, false, false, false, false, false, false, false, false],
      stovePluggedIn: false,
      powerOn: false,
      heatLevel: null,
      panOnStove: false,
      burnerOn: false,
      panHeated: false,
      showOil: false,
      showButter: false,
      eggInPan: false,
      saltAdded: false,
      eggCooked: false,
      springOnionAdded: false,
      showSuccess: false,
      feedbackMessage: '',
      showFeedback: false,
      showCookedEggPrompt: false,
      setupPhase: true,
      showBaconardoIntro: false,
      baconardoTalking: true,
      showHeatLevelButtons: false,
      showConfetti: false,
      confettiStep: null,
      completedStepAnimation: null
    });
    setProgressSaved(false);
  };

  const DraggableItem = ({ type, isActive, isCompleted, children, style = {} }) => (
    <div
      draggable={isActive}
      onDragStart={(e) => handleDragStart(e, type)}
      style={{
        cursor: isActive ? 'grab' : 'default',
        opacity: isCompleted ? 0.3 : isActive ? 1 : 0.6,
        border: isActive ? '3px solid #FF9800' : isCompleted ? '3px solid #4CAF50' : '2px solid #ccc',
        borderRadius: '8px',
        padding: '8px',
        backgroundColor: isCompleted ? '#E8F5E8' : isActive ? '#FFF8E1' : 'white',
        position: 'relative',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? '0 0 15px rgba(255, 152, 0, 0.5)' : '0 2px 5px rgba(0,0,0,0.1)',
        ...style
      }}
    >
      {children}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          width: '20px',
          height: '20px',
          background: '#FF9800',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: 'pulse 1.5s infinite'
        }}>!</div>
      )}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          width: '20px',
          height: '20px',
          background: '#4CAF50',
          borderRadius: '50%',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>✓</div>
      )}
    </div>
  );

  // Calculate pan glow based on pan heated state
  const getPanGlowStyle = () => {
    if (!gameState.panHeated) {
      return {};
    }

    return {
      boxShadow: '0 0 30px rgba(255, 152, 0, 0.7), 0 0 50px rgba(255, 193, 7, 0.5), 0 0 70px rgba(255, 235, 59, 0.3), 0 6px 20px rgba(0,0,0,0.4)',
      animation: 'panGlow 1.5s infinite alternate'
    };
  };

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
      backgroundAttachment: "fixed",
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
        <Navbar />
        
        <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes flicker {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          @keyframes sizzle {
            0%, 100% { opacity: 0; transform: translateY(0); }
            50% { opacity: 1; transform: translateY(-10px); }
          }
          @keyframes oilShimmer {
            0% { opacity: 0; transform: scale(0.5); }
            100% { opacity: 0.7; transform: scale(1); }
          }
          @keyframes butterMelt {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.3); opacity: 0.6; }
          }
          @keyframes eggCrack {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes saltSprinkle {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes eggScramble {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes springOnionSprinkle {
            0% { opacity: 0; transform: scale(0); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes panelFocus {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          @keyframes panGlow {
            0% { 
              box-shadow: 
                0 0 30px rgba(255, 152, 0, 0.7), 
                0 0 50px rgba(255, 193, 7, 0.5), 
                0 0 70px rgba(255, 235, 59, 0.3),
                0 6px 20px rgba(0,0,0,0.4);
            }
            100% { 
              box-shadow: 
                0 0 40px rgba(255, 152, 0, 0.9), 
                0 0 60px rgba(255, 193, 7, 0.7), 
                0 0 80px rgba(255, 235, 59, 0.5),
                0 6px 20px rgba(0,0,0,0.4);
            }
          }
          @keyframes panHeatPulse {
            0%, 100% { 
              background: linear-gradient(45deg, #37474F, #546E7A);
              border-color: #263238;
            }
            50% { 
              background: linear-gradient(45deg, #455A64, #607D8B);
              border-color: #FF9800;
            }
          }
          @keyframes buttonGlow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(255, 152, 0, 0.6);
            }
            50% { 
              box-shadow: 0 0 30px rgba(255, 152, 0, 0.9), 0 0 40px rgba(255, 193, 7, 0.6);
            }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes speechBubble {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes scaleInOut {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
          }
          @keyframes fadeOut {
            0% { opacity: 1; }
            70% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes stepCompleteGlow {
            0%, 100% { box-shadow: 0 0 10px rgba(76, 175, 80, 0.5); }
            50% { box-shadow: 0 0 20px rgba(76, 175, 80, 0.8), 0 0 30px rgba(76, 175, 80, 0.4); }
          }
        `}
        </style>

        {/* Confetti Component */}
        {gameState.showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.1}
            colors={['#4CAF50', '#FF9800', '#2196F3', '#E91E63']}
            style={{ position: 'fixed', zIndex: 2000 }}
          />
        )}

        {/* Step Complete Animation - Checkmark */}
        {gameState.completedStepAnimation !== null && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '80px',
            color: '#4CAF50',
            zIndex: 2001,
            animation: 'scaleInOut 1s ease-in-out',
            pointerEvents: 'none',
            textShadow: '0 0 20px rgba(76, 175, 80, 0.8)'
          }}>
            ✓
          </div>
        )}

        {/* Baconardo Introduction Modal */}
        {gameState.showBaconardoIntro && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
              padding: '40px',
              borderRadius: '20px',
              textAlign: 'center',
              border: '4px solid #FF9800',
              maxWidth: '500px',
              position: 'relative'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                margin: '0 auto 20px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid #FF9800',
                animation: 'pulse 2s infinite'
              }}>
                <img 
                  src={baconardoImg} 
                  alt="Baconardo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              
              <h2 style={{ color: '#E65100', marginBottom: '15px', fontSize: '32px' }}>
                Meet Baconardo! 🥓
              </h2>
              
              <p style={{ color: '#5D4037', marginBottom: '25px', fontSize: '18px', lineHeight: '1.6' }}>
                "Hi there! I'm <strong>Baconardo</strong>, your personal cooking coach! I'll guide you through making the most delicious scrambled eggs you've ever tasted! Ready to become a master chef?"
              </p>
              
              <p style={{ color: '#795548', marginBottom: '30px', fontSize: '16px', fontStyle: 'italic' }}>
                I'll be here in the top right corner to help you every step of the way. Click on me anytime for tips!
              </p>

              <Button
                onClick={closeBaconardoIntro}
                variant="contained"
                sx={{
                  backgroundColor: '#4CAF50',
                  borderRadius: '20px',
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#45a049' }
                }}
              >
                Let's Start Cooking! 🍳
              </Button>
            </div>
          </div>
        )}

        {/* Baconardo Character - Top Right */}
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 100,
          cursor: 'pointer'
        }}>
          <div
            onClick={handleBaconardoClick}
            style={{
              position: 'relative',
              animation: 'float 3s ease-in-out infinite'
            }}
          >
            {/* Baconardo Character */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #FF9800',
              background: 'linear-gradient(135deg, #FFECB3, #FFE0B2)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
              marginBottom: '10px'
            }}>
              <img 
                src={baconardoImg} 
                alt="Baconardo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Speech Bubble */}
            {gameState.baconardoTalking && (
              <div style={{
                position: 'absolute',
                top: '-60',
                left: '-250px',
                width: '280px',
                background: 'white',
                borderRadius: '20px',
                padding: '15px',
                boxShadow: '0 8px 25px rgba(29, 14, 14, 0.3)',
                border: '3px solid #FF9800',
                animation: 'speechBubble 2s ease-in-out infinite'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-12px',
                  transform: 'translateY(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '12px solid #FF9800',
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent'
                }} />
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#5D4037',
                  fontWeight: '500',
                  lineHeight: '1.4'
                }}>
                  {baconardoMessages[gameState.currentStep]}
                </p>
                <div style={{
                  fontSize: '10px',
                  color: '#FF9800',
                  textAlign: 'right',
                  marginTop: '5px',
                  fontWeight: 'bold'
                }}>
                  - Baconardo
                </div>
              </div>
            )}

            {/* Click Me Indicator */}
            {!gameState.baconardoTalking && (
              <div style={{
                position: 'absolute',
                top: '-50',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#FF9800',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '10px',
                fontSize: '10px',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                animation: 'pulse 1.5s infinite'
              }}>
                Click me! 👆
              </div>
            )}
          </div>
        </div>
        
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '15px',
          paddingTop: '25px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

          {/* Progress Bar */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '25px',
            width: '100%',
            maxWidth: '900px',
            animation: gameState.completedStepAnimation !== null ? 'stepCompleteGlow 1s ease-in-out' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 'bold', color: '#E65100' }}>Progress:</span>
              <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
                {gameState.stepsCompleted.filter(Boolean).length}/10 steps
              </span>
            </div>
            <div style={{
              background: '#E0E0E0',
              borderRadius: '8px',
              height: '14px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                height: '100%',
                width: `${(gameState.stepsCompleted.filter(Boolean).length / 10) * 100}%`,
                transition: 'width 0.5s ease',
                borderRadius: '8px'
              }} />
            </div>
          </div>

          {/* Main Game Area */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            gap: '20px',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '1200px'
          }}>
            
            {/* Setup Panel */}
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              border: isSetupPhase ? '3px solid rgba(33, 150, 243, 0.8)' : '2px solid rgba(33, 150, 243, 0.3)',
              minWidth: '200px',
              opacity: isSetupPhase ? 1 : 0.7,
              transform: isSetupPhase ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease',
              animation: isSetupPhase ? 'panelFocus 2s infinite' : 'none',
              boxShadow: isSetupPhase ? '0 8px 25px rgba(33, 150, 243, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: isSetupPhase ? '#1976D2' : '#90CAF9',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                borderBottom: `2px solid ${isSetupPhase ? 'rgba(33, 150, 243, 0.5)' : 'rgba(144, 202, 249, 0.3)'}`,
                paddingBottom: '8px'
              }}>
                {isSetupPhase ? '⚡ ACTIVE: Setup' : '⚡ Setup'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                <DraggableItem 
                  type="plug"
                  isActive={gameState.currentStep === 0}
                  isCompleted={gameState.stepsCompleted[0]}
                  style={{ width: '80px', height: '60px', textAlign: 'center' }}
                >
                  <img src={plugImg} alt="Power Plug" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                  <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Power Plug</div>
                </DraggableItem>

                {!gameState.panOnStove && (
                  <DraggableItem 
                    type="pan"
                    isActive={gameState.currentStep === 3}
                    isCompleted={gameState.stepsCompleted[3]}
                    style={{ width: '100px', height: '70px', textAlign: 'center' }}
                  >
                    <img src={fryingPanImg} alt="Frying Pan" style={{ width: '70px', height: '50px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Frying Pan</div>
                  </DraggableItem>
                )}
              </div>
            </div>

            {/* Cooking Station - Centered */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              flex: 1,
              maxWidth: '500px'
            }}>

              {/* Outlet - POSITIONED ABOVE THE STOVE */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'outlet')}
                style={{
                  width: '100px',
                  height: '80px',
                  background: gameState.stovePluggedIn ? 'linear-gradient(45deg, #4CAF50, #66BB6A)' : '#E0E0E0',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: gameState.currentStep === 0 ? '3px solid #FF9800' : '2px solid #999',
                  boxShadow: gameState.currentStep === 0 ? '0 0 15px rgba(255, 152, 0, 0.6)' : 'none',
                  marginBottom: '10px'
                }}
              >
                {gameState.stovePluggedIn ? (
                  <>
                    <div style={{ fontSize: '40px' }}>⚡</div>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'white' }}>
                      CONNECTED
                    </div>
                  </>
                ) : (
                  <>
                    <img src={outletImg} alt="Electrical Outlet" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666' }}>
                      OUTLET
                    </div>
                  </>
                )}
              </div>

              {/* Stove with Centered Pan */}
              <div style={{ 
                position: 'relative', 
                width: '400px', 
                height: '300px',
                marginBottom: '20px'
              }}>
                {/* Stove Base */}
                <div style={{
                  width: '100%',
                  height: '220px',
                  background: 'linear-gradient(45deg, #424242, #616161)',
                  borderRadius: '15px',
                  position: 'relative',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                  border: '3px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(66, 66, 66, 0.95)',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '15px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    border: '3px solid #FF9800',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)'
                  }}>
                    🍳 ELECTRIC STOVE
                  </div>

                  {/* Main Power Switch */}
                  <button
                    onClick={handleStoveClick}
                    disabled={gameState.currentStep !== 1 || !gameState.stovePluggedIn}
                    style={{
                      position: 'absolute',
                      top: '25px',
                      left: '25px',
                      width: '80px',
                      height: '40px',
                      borderRadius: '20px',
                      border: gameState.currentStep === 1 ? '3px solid #FF9800' : '2px solid #757575',
                      background: gameState.powerOn ? 'linear-gradient(45deg, #4CAF50, #66BB6A)' : '#9E9E9E',
                      cursor: gameState.currentStep === 1 && gameState.stovePluggedIn ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      opacity: gameState.stovePluggedIn ? 1 : 0.5,
                      transition: 'all 0.3s ease',
                      boxShadow: gameState.currentStep === 1 ? '0 0 20px rgba(255, 152, 0, 0.6)' : 'none',
                      animation: gameState.currentStep === 1 ? 'buttonGlow 2s infinite' : 'none'
                    }}
                  >
                    {gameState.powerOn ? 'ON ⚡' : 'POWER'}
                  </button>

                  {/* Heat Level Buttons - Small, rounded, bottom-right */}
                  {gameState.showHeatLevelButtons && (
                    <div style={{
                      position: 'absolute',
                      bottom: '15px',
                      right: '15px',
                      display: 'flex',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      padding: '8px',
                      borderRadius: '20px',
                      border: '2px solid #FF9800',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                      zIndex: 10
                    }}>
                      {['LOW', 'MEDIUM', 'HIGH'].map(level => (
                        <button
                          key={level}
                          onClick={() => handleHeatLevelClick(level)}
                          style={{
                            padding: '6px 10px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            borderRadius: '15px',
                            border: '2px solid #757575',
                            background: level === 'MEDIUM' 
                              ? 'linear-gradient(45deg, #FF9800, #F57C00)'
                              : 'linear-gradient(45deg, #9E9E9E, #757575)',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minWidth: '50px'
                          }}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Current Heat Level Display */}
                  {gameState.heatLevel && (
                    <div style={{
                      position: 'absolute',
                      bottom: '15px',
                      left: '15px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '6px 12px',
                      borderRadius: '15px',
                      border: '2px solid #FF9800',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#E65100',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>🔥</span>
                      <span>{gameState.heatLevel}</span>
                    </div>
                  )}

                  {/* Centered Pan Area */}
                  {gameState.panOnStove ? (
                    <div
                      ref={panRef}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'pan')}
                      style={{
                        width: '180px',
                        height: '180px',
                        background: gameState.panHeated 
                          ? 'linear-gradient(45deg, #455A64, #607D8B)'
                          : 'linear-gradient(45deg, #37474F, #546E7A)',
                        borderRadius: '50%',
                        border: gameState.panHeated ? '4px solid #FF9800' : '4px solid #263238',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'visible',
                        ...(gameState.panHeated ? getPanGlowStyle() : {}),
                        zIndex: 5,
                        transition: 'all 0.5s ease',
                        animation: gameState.panHeated ? 'panHeatPulse 2s infinite' : 'none',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-45px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(55, 71, 79, 0.95)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        border: '2px solid #FF9800',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                      }}>
                        {gameState.panHeated ? '🥘 READY FOR INGREDIENTS!' : '⏳ HEATING UP...'}
                      </div>

                      {/* Pan Heating Countdown */}
                      {gameState.panOnStove && !gameState.panHeated && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '32px',
                          fontWeight: 'bold',
                          color: '#FF9800',
                          textShadow: '0 0 10px rgba(255, 152, 0, 0.8)',
                          animation: 'pulse 1s infinite'
                        }}>
                          ⏳
                        </div>
                      )}

                      {/* Cooking Visual Effects */}
                      {gameState.showOil && (
                        <div style={{
                          width: '90%',
                          height: '90%',
                          background: 'radial-gradient(circle, #FFE082 50%, #FFC107 80%)',
                          borderRadius: '50%',
                          position: 'absolute',
                          opacity: 0.7,
                          animation: 'oilShimmer 2s ease-in'
                        }} />
                      )}

                      {gameState.showButter && (
                        <div style={{
                          width: '35%',
                          height: '35%',
                          background: 'radial-gradient(circle, #FFF176 30%, #FFD54F 80%)',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '30%',
                          left: '35%',
                          opacity: 0.8,
                          animation: 'butterMelt 1.5s ease-out'
                        }} />
                      )}

                      {gameState.eggInPan && !gameState.eggCooked && (
                        <div style={{
                          width: '70%',
                          height: '70%',
                          background: 'radial-gradient(circle, #FFFFFF 20%, #FFF176 40%, #FFE082 80%)',
                          borderRadius: '60% 40% 40% 60%',
                          position: 'absolute',
                          animation: 'eggCrack 0.8s ease-out'
                        }} />
                      )}

                      {gameState.saltAdded && (
                        <div style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background: 'radial-gradient(circle, transparent 60%, rgba(255,255,255,0.3) 65%, transparent 70%)',
                          borderRadius: '50%',
                          animation: 'saltSprinkle 1s ease-out'
                        }} />
                      )}

                      {gameState.eggCooked && (
                        <img 
                          src={cookedEggImg} 
                          alt="Cooked Egg" 
                          style={{
                            width: '80%',
                            height: '80%',
                            position: 'absolute',
                            objectFit: 'contain',
                            animation: 'eggScramble 1.2s ease-out'
                          }} 
                        />
                      )}

                      {gameState.springOnionAdded && (
                        <div style={{
                          position: 'absolute',
                          width: '60%',
                          height: '60%',
                          background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(76, 175, 80, 0.6) 3px, rgba(76, 175, 80, 0.6) 6px)',
                          borderRadius: '50%',
                          animation: 'springOnionSprinkle 1s ease-out'
                        }} />
                      )}

                      {/* Sizzle Effect */}
                      {gameState.panHeated && (gameState.showOil || gameState.eggInPan) && (
                        <>
                          <div style={{
                            position: 'absolute',
                            width: '6px',
                            height: '6px',
                            background: 'white',
                            borderRadius: '50%',
                            top: '20%',
                            left: '30%',
                            animation: 'sizzle 0.8s infinite',
                            boxShadow: '0 0 6px rgba(255,255,255,0.9)'
                          }} />
                          <div style={{
                            position: 'absolute',
                            width: '5px',
                            height: '5px',
                            background: 'white',
                            borderRadius: '50%',
                            top: '40%',
                            right: '25%',
                            animation: 'sizzle 1.2s infinite 0.3s',
                            boxShadow: '0 0 5px rgba(255,255,255,0.9)'
                          }} />
                          <div style={{
                            position: 'absolute',
                            width: '5px',
                            height: '5px',
                            background: 'white',
                            borderRadius: '50%',
                            bottom: '30%',
                            left: '40%',
                            animation: 'sizzle 1s infinite 0.6s',
                            boxShadow: '0 0 5px rgba(255,255,255,0.9)'
                          }} />
                        </>
                      )}

                      {/* Pan Handle */}
                      <div style={{
                        position: 'absolute',
                        right: '-70px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '70px',
                        height: '15px',
                        background: 'linear-gradient(45deg, #5D4037, #795548)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
                      }} />
                    </div>
                  ) : (
                    /* Drop Zone for Pan */
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'stove')}
                      style={{
                        width: '200px',
                        height: '200px',
                        border: '4px dashed #FF9800',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 152, 0, 0.1)',
                        animation: 'pulse 2s infinite',
                        fontSize: '50px',
                        color: '#FF9800'
                      }}
                    >
                      ⬇️
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ingredients and Tools Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* Ingredients Panel */}
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '20px',
                border: isCookingPhase ? '3px solid rgba(255, 152, 0, 0.8)' : '2px solid rgba(255, 152, 0, 0.3)',
                minWidth: '240px',
                opacity: isCookingPhase ? 1 : 0.7,
                transform: isCookingPhase ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease',
                animation: isCookingPhase ? 'panelFocus 2s infinite' : 'none',
                boxShadow: isCookingPhase ? '0 8px 25px rgba(255, 152, 0, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ 
                  margin: '0 0 15px 0', 
                  color: isCookingPhase ? '#E65100' : '#FFB74D',
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderBottom: `2px solid ${isCookingPhase ? 'rgba(255, 152, 0, 0.5)' : 'rgba(255, 183, 77, 0.3)'}`,
                  paddingBottom: '8px'
                }}>
                  {isCookingPhase ? '🥘 ACTIVE: Ingredients' : '🥘 Ingredients'}
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  <DraggableItem 
                    type="oil"
                    isActive={gameState.currentStep === 5 && gameState.panHeated}
                    isCompleted={gameState.stepsCompleted[5]}
                    style={{ height: '90px', textAlign: 'center' }}
                  >
                    <img src={oilImg} alt="Cooking Oil" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Cooking Oil</div>
                  </DraggableItem>

                  <DraggableItem 
                    type="butter"
                    isActive={gameState.currentStep === 6 && gameState.panHeated}
                    isCompleted={gameState.stepsCompleted[6]}
                    style={{ height: '90px', textAlign: 'center' }}
                  >
                    <img src={butterImg} alt="Butter" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Butter</div>
                  </DraggableItem>

                  <DraggableItem 
                    type="egg"
                    isActive={gameState.currentStep === 7 && gameState.panHeated}
                    isCompleted={gameState.stepsCompleted[7]}
                    style={{ height: '90px', textAlign: 'center' }}
                  >
                    <img src={eggImg} alt="Egg" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Egg</div>
                  </DraggableItem>

                  <DraggableItem 
                    type="salt"
                    isActive={gameState.currentStep === 8 && gameState.panHeated}
                    isCompleted={gameState.stepsCompleted[8]}
                    style={{ height: '90px', textAlign: 'center' }}
                  >
                    <img src={saltImg} alt="Salt" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Salt</div>
                  </DraggableItem>

                  <DraggableItem 
                    type="springOnion"
                    isActive={gameState.currentStep === 10 && gameState.panHeated}
                    isCompleted={gameState.stepsCompleted[10]}
                    style={{ 
                      gridColumn: '1 / -1', 
                      height: '60px', 
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <img src={springOnionImg} alt="Spring Onion" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Spring Onion</div>
                  </DraggableItem>
                </div>
              </div>

              {/* Tools Panel */}
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '20px',
                border: isCookingPhase ? '3px solid rgba(121, 85, 72, 0.8)' : '2px solid rgba(121, 85, 72, 0.3)',
                minWidth: '240px',
                opacity: isCookingPhase ? 1 : 0.7,
                transform: isCookingPhase ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease',
                animation: isCookingPhase ? 'panelFocus 2s infinite' : 'none',
                boxShadow: isCookingPhase ? '0 8px 25px rgba(121, 85, 72, 0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ 
                  margin: '0 0 15px 0', 
                  color: isCookingPhase ? '#795548' : '#A1887F',
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderBottom: `2px solid ${isCookingPhase ? 'rgba(121, 85, 72, 0.5)' : 'rgba(161, 136, 127, 0.3)'}`,
                  paddingBottom: '8px'
                }}>
                  {isCookingPhase ? '🔪 ACTIVE: Tools' : '🔪 Tools'}
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <DraggableItem 
                    type="spatula"
                    isActive={gameState.currentStep === 9 && gameState.panHeated}
                    isCompleted={gameState.stepsCompleted[9]}
                    style={{ width: '140px', height: '80px', textAlign: 'center' }}
                  >
                    <img src={spatulaImg} alt="Wooden Spatula" style={{ width: '70px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Wooden Spatula</div>
                  </DraggableItem>
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <Box sx={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '12px 24px',
            borderRadius: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <Button
              onClick={resetGame}
              variant="contained"
              sx={{
                backgroundColor: '#FF9800',
                borderRadius: '20px',
                '&:hover': { backgroundColor: '#F57C00' }
              }}
            >
              🔄 Reset
            </Button>

            {gameState.stepsCompleted.every(step => step) && (
              <Button
                onClick={() => navigate('/studentdashboard')}
                variant="contained"
                sx={{
                  backgroundColor: '#4CAF50',
                  borderRadius: '20px',
                  '&:hover': { backgroundColor: '#45a049' },
                  animation: 'pulse 2s infinite'
                }}
              >
                🚀 Next Level
              </Button>
            )}
          </Box>

          {/* Feedback Message (only for incorrect actions) */}
          {gameState.showFeedback && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '15px 25px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              zIndex: 1000,
              animation: 'fadeOut 1.5s forwards',
              textAlign: 'center',
              maxWidth: '300px',
              border: '2px solid #FF9800'
            }}>
              {gameState.feedbackMessage}
            </div>
          )}

          {/* Success Modal */}
          {gameState.showSuccess && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }}>
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={500}
                gravity={0.05}
                colors={['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#FFEB3B']}
                style={{ position: 'fixed', zIndex: 2001 }}
              />
              <div style={{
                background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '4px solid #FF9800',
                maxWidth: '450px',
                zIndex: 2002,
                position: 'relative'
              }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>🏆</div>
                <h2 style={{ color: '#E65100', marginBottom: '15px', fontSize: '32px' }}>
                  Level 3 Complete!
                </h2>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', fontSize: '32px' }}>
                  <span>⭐</span>
                  <span>⭐</span>
                  <span>⭐</span>
                </div>
                
                <h3 style={{ fontSize: '24px', color: '#E65100', marginBottom: '20px' }}>
                  Perfectly cooked scrambled egg!
                </h3>
                
                <p style={{ color: '#5D4037', marginBottom: '30px', fontSize: '16px', lineHeight: '1.5' }}>
                  Amazing work! You've mastered the complete cooking process from setup to finish. This is restaurant-quality cooking!
                </p>

                {progressSaving && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.9)', borderRadius: '12px', color: 'white' }}>
                    <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="body2">Saving progress...</Typography>
                  </Box>
                )}
                
                {progressSaved && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.9)', borderRadius: '12px', color: 'white' }}>
                    ✅ Progress saved!
                  </Box>
                )}
                
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                  <Button 
                    onClick={() => navigate('/studentdashboard')}
                    variant="contained"
                    sx={{ 
                      backgroundColor: '#4CAF50',
                      borderRadius: '15px',
                      '&:hover': { backgroundColor: '#45a049' }
                    }}
                  >
                    🚀 Next Level
                  </Button>
                  
                  <Button
                    onClick={resetGame}
                    variant="outlined"
                    sx={{ 
                      borderColor: '#FF9800', 
                      color: '#FF9800',
                      borderRadius: '15px',
                      borderWidth: '2px',
                      '&:hover': {
                        borderWidth: '2px',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)'
                      }
                    }}
                  >
                    🔄 Play Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default CookingLevel3;