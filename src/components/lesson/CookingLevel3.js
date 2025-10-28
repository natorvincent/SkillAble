import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
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

  const [gameState, setGameState] = useState({
    currentStep: 0,
    stepsCompleted: [false, false, false, false, false, false, false, false, false, false, false],
    stovePluggedIn: false,
    powerOn: false,
    heatLevel: null,
    panOnStove: false,
    burnerOn: false,
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
    baconardoTalking: true
  });

  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const panRef = useRef(null);

  const eggRecipeSteps = [
    { id: 0, instruction: "🔌 Drag the power plug to the electrical outlet" },
    { id: 1, instruction: "⚡ Click the main power switch to turn on the stove" },
    { id: 2, instruction: "🔥 Adjust the heat dial to MEDIUM" },
    { id: 3, instruction: "🍳 Drag the frying pan onto the stove" },
    { id: 4, instruction: "🔴 Click the burner button to start heating" },
    { id: 5, instruction: "🫗 Drag the cooking oil to the frying pan" },
    { id: 6, instruction: "🧈 Drag the butter to the pan" },
    { id: 7, instruction: "🥚 Drag the egg to the pan to crack it" },
    { id: 8, instruction: "🧂 Drag the salt to season the egg" },
    { id: 9, instruction: "🥄 Drag the spatula over the pan to scramble the egg" },
    { id: 10, instruction: "🌿 Drag the spring onion to garnish" }
  ];

  // Baconardo's guidance messages for each step
  const baconardoMessages = [
    "Hi there! I'm Baconardo, your cooking coach! Let's make some amazing scrambled eggs! First, we need power - drag the plug to the outlet!",
    "Great! Now let's turn on the stove power. Click the main power switch!",
    "Perfect! Now set the heat to MEDIUM - it's the best temperature for fluffy eggs!",
    "Excellent! Now place the frying pan on the stove - drag it over!",
    "Awesome! Click the burner button to start heating up the pan!",
    "The pan is heating up! Now add some cooking oil - drag the oil bottle to the pan!",
    "Wonderful! Let's add butter for extra flavor. Drag the butter to the pan!",
    "Now for the main ingredient! Drag the egg to the pan to crack it open!",
    "Perfect! Let's season it with some salt. Drag the salt shaker to the pan!",
    "Time to cook! Drag the spatula to scramble the egg in the pan!",
    "Almost done! Let's garnish with spring onion for freshness and color!",
    "CONGRATULATIONS! You've made perfect scrambled eggs! You're a real chef now! 🎉"
  ];

  // Determine current phase
  const isSetupPhase = gameState.currentStep <= 4; // Steps 0-4 are setup
  const isCookingPhase = gameState.currentStep >= 5; // Steps 5-10 are cooking

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
      setupPhase: stepIndex + 1 <= 4,
      baconardoTalking: true
    }));

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
      showFeedback("Great! The stove is now connected to power!");
    } else if (dragItem === 'pan' && target === 'stove' && gameState.currentStep === 3) {
      completeStep(3, { panOnStove: true });
      showFeedback("Nice! Your pan is properly positioned at the center!");
    } else if (dragItem === 'oil' && target === 'pan' && gameState.currentStep === 5 && gameState.panOnStove) {
      completeStep(5, { showOil: true });
      showFeedback("Perfect! Oil added to the pan!");
    } else if (dragItem === 'butter' && target === 'pan' && gameState.currentStep === 6 && gameState.panOnStove) {
      completeStep(6, { showButter: true });
      showFeedback("Great! Butter is melting in the pan!");
    } else if (dragItem === 'egg' && target === 'pan' && gameState.currentStep === 7 && gameState.panOnStove) {
      completeStep(7, { eggInPan: true });
      showFeedback("Excellent! Egg cracked into the pan!");
    } else if (dragItem === 'salt' && target === 'pan' && gameState.currentStep === 8 && gameState.panOnStove) {
      completeStep(8, { saltAdded: true });
      showFeedback("Nice! Salt added for flavor!");
    } else if (dragItem === 'spatula' && target === 'pan' && gameState.currentStep === 9 && gameState.panOnStove) {
      completeStep(9, { eggCooked: true });
      showFeedback("Amazing! Your scrambled egg is perfectly cooked!");
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showCookedEggPrompt: true }));
      }, 2500);
    } else if (dragItem === 'springOnion' && target === 'pan' && gameState.currentStep === 10 && gameState.panOnStove) {
      completeStep(10, { springOnionAdded: true });
      showFeedback("Beautiful! Spring onion garnish added!");
    }
    
    setDragItem(null);
  };

  const handleStoveClick = () => {
    if (gameState.currentStep === 1 && gameState.stovePluggedIn) {
      completeStep(1, { powerOn: true });
      showFeedback("Excellent! The stove power is ON!");
    }
  };

  const handleHeatDialClick = (level) => {
    if (gameState.currentStep === 2 && gameState.powerOn) {
      if (level === 'MEDIUM') {
        completeStep(2, { heatLevel: 'MEDIUM' });
        showFeedback("Perfect! Medium heat is ideal for scrambled eggs!");
      } else {
        showFeedback("Try MEDIUM heat - it works best for scrambled eggs!");
      }
    }
  };

  const handleBurnerClick = () => {
    if (gameState.currentStep === 4 && gameState.panOnStove && gameState.heatLevel === 'MEDIUM') {
      completeStep(4, { burnerOn: true });
      showFeedback("Great! The stove is heating up! The pan will now glow.");
    }
  };

  const handleBaconardoClick = () => {
    setGameState(prev => ({ ...prev, baconardoTalking: !prev.baconardoTalking }));
  };

  const closeBaconardoIntro = () => {
    setGameState(prev => ({ ...prev, showBaconardoIntro: false, baconardoTalking: true }));
  };

  const resetGame = () => {
    setGameState({
      currentStep: 0,
      stepsCompleted: [false, false, false, false, false, false, false, false, false, false, false],
      stovePluggedIn: false,
      powerOn: false,
      heatLevel: null,
      panOnStove: false,
      burnerOn: false,
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
      baconardoTalking: true
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

  // Calculate pan glow based on burner state and heat level
  const getPanGlowStyle = () => {
    if (!gameState.burnerOn || !gameState.panOnStove) {
      return {};
    }

    const baseGlow = {
      boxShadow: gameState.heatLevel === 'HIGH' 
        ? '0 0 40px rgba(255, 87, 34, 0.8), 0 0 60px rgba(255, 152, 0, 0.6), 0 0 80px rgba(255, 193, 7, 0.4), 0 6px 20px rgba(0,0,0,0.4)'
        : gameState.heatLevel === 'MEDIUM'
        ? '0 0 30px rgba(255, 152, 0, 0.7), 0 0 50px rgba(255, 193, 7, 0.5), 0 0 70px rgba(255, 235, 59, 0.3), 0 6px 20px rgba(0,0,0,0.4)'
        : '0 0 20px rgba(255, 193, 7, 0.6), 0 0 40px rgba(255, 235, 59, 0.4), 0 6px 20px rgba(0,0,0,0.4)',
      animation: 'panGlow 1.5s infinite alternate'
    };

    return baseGlow;
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
          @keyframes oilPour {
            0% { height: 0px; opacity: 0; }
            50% { height: 30px; opacity: 1; }
            100% { height: 0px; opacity: 0; }
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
        `}
        </style>

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
            maxWidth: '900px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontWeight: 'bold', color: '#E65100' }}>Progress:</span>
              <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
                {gameState.stepsCompleted.filter(Boolean).length}/11 steps
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
                width: `${(gameState.stepsCompleted.filter(Boolean).length / 11) * 100}%`,
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
              <div style={{
                background: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '2px solid rgba(255, 152, 0, 0.3)',
                color: '#E65100',
                fontWeight: 'bold'
              }}>
                🍳 Cooking Station
              </div>

              {/* Instruction Speech Bubble */}
              {gameState.currentStep < 11 && (
                <div style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
                  border: '3px solid #FF9800',
                  borderRadius: '20px',
                  padding: '15px 20px',
                  maxWidth: '320px',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '12px solid transparent',
                    borderRight: '12px solid transparent',
                    borderTop: '12px solid #FF9800'
                  }} />
                  <p style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    color: '#E65100', 
                    fontWeight: 'bold',
                    textAlign: 'center',
                    lineHeight: '1.4'
                  }}>
                    {eggRecipeSteps[gameState.currentStep]?.instruction}
                  </p>
                </div>
              )}

              {/* Outlet */}
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
                  boxShadow: gameState.currentStep === 0 ? '0 0 15px rgba(255, 152, 0, 0.6)' : 'none'
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
                marginBottom: '140px'
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

                  {/* Main Power Switch - More Visible */}
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

                  {/* Prominent Burner Button - Very Visible */}
                  <button
                    onClick={handleBurnerClick}
                    disabled={gameState.currentStep !== 4 || !gameState.panOnStove}
                    style={{
                      position: 'absolute',
                      top: '25px',
                      right: '25px',
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      border: gameState.currentStep === 4 ? '4px solid #FF9800' : '3px solid #757575',
                      background: gameState.burnerOn 
                        ? 'linear-gradient(135deg, #FF5722, #F44336, #D32F2F)'
                        : 'linear-gradient(135deg, #9E9E9E, #757575)',
                      cursor: gameState.currentStep === 4 && gameState.panOnStove ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      opacity: gameState.panOnStove ? 1 : 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: gameState.currentStep === 4 
                        ? '0 0 30px rgba(255, 152, 0, 0.8), 0 8px 25px rgba(0,0,0,0.4)'
                        : '0 4px 15px rgba(0,0,0,0.3)',
                      animation: gameState.currentStep === 4 ? 'buttonGlow 1.5s infinite' : 'none'
                    }}
                  >
                    <div style={{ 
                      fontSize: '32px',
                      marginBottom: '5px',
                      filter: gameState.burnerOn ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none'
                    }}>
                      {gameState.burnerOn ? '🔥' : '⚡'}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      textShadow: gameState.burnerOn ? '0 0 10px rgba(255,255,255,0.8)' : 'none'
                    }}>
                      {gameState.burnerOn ? 'HEATING!' : 'START HEAT'}
                    </div>
                  </button>

                  {/* Centered Pan Area */}
                  {gameState.panOnStove ? (
                    <div
                      ref={panRef}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'pan')}
                      style={{
                        width: '180px',
                        height: '180px',
                        background: gameState.burnerOn 
                          ? 'linear-gradient(45deg, #455A64, #607D8B)'
                          : 'linear-gradient(45deg, #37474F, #546E7A)',
                        borderRadius: '50%',
                        border: gameState.burnerOn ? '4px solid #FF9800' : '4px solid #263238',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'visible',
                        ...(gameState.burnerOn ? getPanGlowStyle() : {}),
                        zIndex: 5,
                        transition: 'all 0.5s ease',
                        animation: gameState.burnerOn ? 'panHeatPulse 2s infinite' : 'none',
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
                        🥘 DROP INGREDIENTS HERE
                      </div>

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
                      {gameState.burnerOn && (gameState.showOil || gameState.eggInPan) && (
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

                {/* Heat Control Panel */}
                <div style={{
                  position: 'absolute',
                  bottom: '-120px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(66, 66, 66, 0.95)',
                  padding: '20px 30px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                  alignItems: 'center',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                  border: '3px solid #FF9800',
                  minWidth: '300px'
                }}>
                  <div style={{ 
                    fontSize: '18px', 
                    color: 'white', 
                    fontWeight: 'bold',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '10px'
                  }}>
                    🔥 HEAT LEVEL
                    {gameState.heatLevel && (
                      <span style={{ 
                        fontSize: '20px',
                        color: gameState.heatLevel === 'HIGH' ? '#FF5722' : gameState.heatLevel === 'MEDIUM' ? '#FF9800' : '#FFB74D',
                        textShadow: '0 0 10px rgba(255,255,255,0.5)'
                      }}>
                        {gameState.heatLevel === 'HIGH' ? '🔥🔥🔥' : gameState.heatLevel === 'MEDIUM' ? '🔥🔥' : '🔥'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%' }}>
                    {['LOW', 'MEDIUM', 'HIGH'].map(level => (
                      <button
                        key={level}
                        onClick={() => handleHeatDialClick(level)}
                        disabled={gameState.currentStep !== 2 || !gameState.powerOn}
                        style={{
                          padding: '12px 18px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          borderRadius: '12px',
                          border: gameState.heatLevel === level ? '3px solid #4CAF50' : '2px solid #757575',
                          background: gameState.heatLevel === level 
                            ? level === 'HIGH' ? 'linear-gradient(45deg, #FF5722, #D32F2F)' 
                            : level === 'MEDIUM' ? 'linear-gradient(45deg, #FF9800, #F57C00)' 
                            : 'linear-gradient(45deg, #FFB74D, #FFA726)'
                            : 'linear-gradient(45deg, #9E9E9E, #757575)',
                          color: 'white',
                          cursor: gameState.currentStep === 2 && gameState.powerOn ? 'pointer' : 'not-allowed',
                          opacity: gameState.powerOn ? 1 : 0.5,
                          boxShadow: gameState.currentStep === 2 && level === 'MEDIUM' && gameState.powerOn ? '0 0 20px rgba(255, 152, 0, 0.8)' : 'none',
                          transition: 'all 0.3s ease',
                          minWidth: '80px',
                          flex: 1
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  
                  {/* Heat Level Visual Indicator */}
                  {gameState.powerOn && gameState.heatLevel && (
                    <div style={{
                      width: '100%',
                      height: '10px',
                      background: '#424242',
                      borderRadius: '5px',
                      marginTop: '10px',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{
                        width: gameState.heatLevel === 'HIGH' ? '100%' : gameState.heatLevel === 'MEDIUM' ? '66%' : '33%',
                        height: '100%',
                        background: gameState.heatLevel === 'HIGH' 
                          ? 'linear-gradient(90deg, #FF5722, #D32F2F)'
                          : gameState.heatLevel === 'MEDIUM'
                          ? 'linear-gradient(90deg, #FF9800, #F57C00)'
                          : 'linear-gradient(90deg, #FFB74D, #FFA726)',
                        borderRadius: '5px',
                        transition: 'width 0.3s ease',
                        boxShadow: '0 0 10px rgba(255, 152, 0, 0.5)'
                      }} />
                    </div>
                  )}
                  
                  {gameState.currentStep === 2 && gameState.powerOn && (
                    <div style={{
                      fontSize: '12px',
                      color: '#FFD54F',
                      textAlign: 'center',
                      marginTop: '8px',
                      fontWeight: 'bold',
                      textShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}>
                      💡 Tip: Medium heat is best for eggs!
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
                    isActive={gameState.currentStep === 5}
                    isCompleted={gameState.stepsCompleted[5]}
                    style={{ height: '90px', textAlign: 'center' }}
                  >
                    <img src={oilImg} alt="Cooking Oil" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Cooking Oil</div>
                  </DraggableItem>

                  <DraggableItem 
                    type="butter"
                    isActive={gameState.currentStep === 6}
                    isCompleted={gameState.stepsCompleted[6]}
                    style={{ height: '90px', textAlign: 'center' }}
                  >
                    <img src={butterImg} alt="Butter" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Butter</div>
                  </DraggableItem>

                  <DraggableItem 
                    type="egg"
                    isActive={gameState.currentStep === 7}
                    isCompleted={gameState.stepsCompleted[7]}
                    style={{ height: '90px', textAlign: 'center' }}
                  >
                    <img src={eggImg} alt="Egg" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Egg</div>
                  </DraggableItem>

                  <DraggableItem 
                    type="salt"
                    isActive={gameState.currentStep === 8}
                    isCompleted={gameState.stepsCompleted[8]}
                    style={{ height: '90px', textAlign: 'center' }}
                  >
                    <img src={saltImg} alt="Salt" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    <div style={{ fontSize: '10px', fontWeight: 'bold' }}>Salt</div>
                  </DraggableItem>

                  <DraggableItem 
                    type="springOnion"
                    isActive={gameState.currentStep === 10}
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
                    isActive={gameState.currentStep === 9}
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
                onClick={() => navigate('/lesson/cooking/level-4')}
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

          {/* Feedback Message */}
          {gameState.showFeedback && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
              color: 'white',
              padding: '20px 30px',
              borderRadius: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              zIndex: 1000,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
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
              <div style={{
                background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
                padding: '40px',
                borderRadius: '20px',
                textAlign: 'center',
                border: '4px solid #FF9800',
                maxWidth: '450px'
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
                    onClick={() => navigate('/lesson/cooking/level-4')}
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