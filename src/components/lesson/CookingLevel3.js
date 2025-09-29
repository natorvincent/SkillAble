import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Card,
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
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Import images for Level 3 cooking game from assets folder
import oilImg from "../../assets/cookingLevel3/oil.png";
import butterImg from "../../assets/cookingLevel3/butter.png";
import eggImg from "../../assets/cookingLevel3/egg-bowl.png";
import saltImg from "../../assets/cookingLevel3/salt.png";
import springOnionImg from "../../assets/cookingLevel3/spring-onion-chopped.png";
import spatulaImg from "../../assets/cookingLevel3/wooden-spatula.png";
import cookedEggImg from "../../assets/cookingLevel3/cooked-egg.png";

// Progress service imports
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

const CookingLevel3 = () => {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();

  const [gameState, setGameState] = useState({
    currentStep: 0,
    stepsCompleted: [false, false, false, false, false, false, false],
    showOil: false,
    flameOn: false,
    showButter: false,
    eggInPan: false,
    saltAdded: false,
    eggCooked: false,
    springOnionAdded: false,
    showSuccess: false,
    feedbackMessage: '',
    showFeedback: false,
    showCookedEggPrompt: false
  });

  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const panRef = useRef(null);

  const ingredientImages = {
    oil: oilImg,
    butter: butterImg,
    egg: eggImg,
    salt: saltImg,
    springOnion: springOnionImg,
    spatula: spatulaImg,
    cookedEgg: cookedEggImg
  };

  const eggRecipeSteps = [
    { id: 0, instruction: "Drag the oil bottle to the frying pan", target: "pan" },
    { id: 1, instruction: "Tap the stove button to turn on the heat", target: "stove" },
    { id: 2, instruction: "Drag the butter to the pan", target: "pan" },
    { id: 3, instruction: "Drag the egg to the pan to crack it", target: "pan" },
    { id: 4, instruction: "Drag the salt to season the egg", target: "pan" },
    { id: 5, instruction: "Drag the spatula over the pan to scramble the egg", target: "pan" },
    { id: 6, instruction: "Drag the spring onion to garnish", target: "pan" }
  ];

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

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      const finalScore = 7;
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: 7,
        completed: true,
        starsEarned: 3
      };
      
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  // Match Level 1 navigation functions exactly
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
      // Since this is Level 3, go to Level 4 or back to homepage if no Level 4
      navigate('/lesson/cooking/level-4');
    }, 300);
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
      currentStep: stepIndex + 1
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

    if (dragItem === 'oil' && target === 'pan' && gameState.currentStep === 0) {
      completeStep(0, { showOil: true });
      showFeedback("Perfect! Oil added to the pan!");
    } else if (dragItem === 'butter' && target === 'pan' && gameState.currentStep === 2) {
      completeStep(2, { showButter: true });
      showFeedback("Great! Butter is melting in the pan!");
    } else if (dragItem === 'egg' && target === 'pan' && gameState.currentStep === 3) {
      completeStep(3, { eggInPan: true });
      showFeedback("Excellent! Egg cracked into the pan!");
    } else if (dragItem === 'salt' && target === 'pan' && gameState.currentStep === 4) {
      completeStep(4, { saltAdded: true });
      showFeedback("Nice! Salt added for flavor!");
    } else if (dragItem === 'spatula' && target === 'pan' && gameState.currentStep === 5) {
      completeStep(5, { eggCooked: true });
      showFeedback("Amazing! Your scrambled egg is perfectly cooked!");
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showCookedEggPrompt: true }));
      }, 2500);
    } else if (dragItem === 'springOnion' && target === 'pan' && gameState.currentStep === 6) {
      completeStep(6, { springOnionAdded: true });
      showFeedback("Beautiful! Spring onion garnish added!");
    }
    
    setDragItem(null);
  };

  const handleStoveClick = () => {
    if (gameState.currentStep === 1) {
      completeStep(1, { flameOn: true });
      showFeedback("Excellent! The stove is heating up!");
    }
  };

  const resetGame = () => {
    setGameState({
      currentStep: 0,
      stepsCompleted: [false, false, false, false, false, false, false],
      showOil: false,
      flameOn: false,
      showButter: false,
      eggInPan: false,
      saltAdded: false,
      eggCooked: false,
      springOnionAdded: false,
      showSuccess: false,
      feedbackMessage: '',
      showFeedback: false,
      showCookedEggPrompt: false
    });
    setProgressSaved(false);
    setProgressSaving(false);
  };

  const closeCookedEggPrompt = () => {
    setGameState(prev => ({ ...prev, showCookedEggPrompt: false }));
  };

  const DraggableIngredient = ({ type, isActive, isCompleted, style = {} }) => {
    return (
      <div
        draggable={isActive}
        onDragStart={(e) => handleDragStart(e, type)}
        style={{
          cursor: isActive ? 'grab' : 'default',
          opacity: isCompleted ? 0.3 : isActive ? 1 : 0.6,
          border: isActive ? '3px solid #FF9800' : isCompleted ? '3px solid #4CAF50' : '2px solid #ccc',
          borderRadius: '8px',
          padding: '4px',
          backgroundColor: isCompleted ? '#E8F5E8' : isActive ? '#FFF8E1' : 'white',
          position: 'relative',
          transform: isActive ? 'scale(1.05)' : 'scale(1)',
          transition: 'all 0.3s ease',
          boxShadow: isActive ? '0 0 15px rgba(255, 152, 0, 0.5)' : isCompleted ? '0 0 10px rgba(76, 175, 80, 0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
          ...style
        }}
      >
        <img 
          src={ingredientImages[type]} 
          alt={type}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '4px',
            userSelect: 'none',
            pointerEvents: 'none',
            filter: isCompleted ? 'grayscale(50%)' : 'none'
          }}
        />
        
        {isActive && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            background: 'linear-gradient(45deg, #FF9800, #F57C00)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            animation: 'pulse 1.5s infinite',
            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.4)'
          }}>
            !
          </div>
        )}
        
        {isCompleted && (
          <div style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            width: '20px',
            height: '20px',
            background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
        )}
      </div>
    );
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
        
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          zIndex: 100 
        }}>
          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{
              backgroundColor: isMuted ? '#FF5722' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '15px',
          paddingTop: '25px', // Added extra padding to separate from navbar
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(45deg, #FF9800, #F57C00)',
            color: 'white',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            borderRadius: '15px',
            marginBottom: '25px', // Increased margin for better separation
            width: '100%',
            maxWidth: '800px'
          }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: 'bold' }}>
              Level 3: Scrambled Eggs
            </h1>
          </div>
          
          <div style={{
            background: 'rgba(255, 152, 0, 0.1)',
            padding: '12px 20px',
            textAlign: 'center',
            borderBottom: '2px solid rgba(255, 152, 0, 0.3)',
            borderRadius: '10px',
            marginBottom: '20px',
            width: '100%',
            maxWidth: '800px'
          }}>
            <p style={{ margin: '0', fontSize: '16px', color: '#E65100', fontWeight: '500' }}>
              {eggRecipeSteps[gameState.currentStep]?.instruction || "Your deluxe scrambled egg is ready!"} 
              {gameState.currentStep < 7 && (
                <span style={{ 
                  background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  marginLeft: '8px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}>
                  Step {gameState.currentStep + 1}/7
                </span>
              )}
            </p>
          </div>

          <div style={{
            background: 'white',
            margin: '0 0 20px 0',
            borderRadius: '10px',
            padding: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '800px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontWeight: 'bold', color: '#E65100' }}>Recipe Progress:</span>
              <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
                {gameState.stepsCompleted.filter(Boolean).length}/7 steps
              </span>
            </div>
            <div style={{
              background: '#E0E0E0',
              borderRadius: '8px',
              height: '12px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                height: '100%',
                width: `${(gameState.stepsCompleted.filter(Boolean).length / 7) * 100}%`,
                transition: 'width 0.5s ease',
                borderRadius: '8px'
              }} />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            width: '100%',
            maxWidth: '1000px',
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '2px solid rgba(255, 152, 0, 0.2)',
              width: '220px'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#E65100',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                borderBottom: '2px solid rgba(255, 152, 0, 0.3)',
                paddingBottom: '8px'
              }}>
                🥄 Ingredients & Tools
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                alignItems: 'start'
              }}>
                <DraggableIngredient 
                  type="oil"
                  isActive={gameState.currentStep === 0}
                  isCompleted={gameState.stepsCompleted[0]}
                  style={{ width: '60px', height: '80px' }}
                />

                <DraggableIngredient 
                  type="butter"
                  isActive={gameState.currentStep === 2}
                  isCompleted={gameState.stepsCompleted[2]}
                  style={{ width: '60px', height: '40px' }}
                />

                <DraggableIngredient 
                  type="egg"
                  isActive={gameState.currentStep === 3}
                  isCompleted={gameState.stepsCompleted[3]}
                  style={{ width: '55px', height: '70px' }}
                />

                <DraggableIngredient 
                  type="salt"
                  isActive={gameState.currentStep === 4}
                  isCompleted={gameState.stepsCompleted[4]}
                  style={{ width: '45px', height: '45px' }}
                />

                <DraggableIngredient 
                  type="springOnion"
                  isActive={gameState.currentStep === 6}
                  isCompleted={gameState.stepsCompleted[6]}
                  style={{ 
                    gridColumn: '1 / -1',
                    width: '80px', 
                    height: '25px',
                    margin: '0 auto'
                  }}
                />

                <DraggableIngredient 
                  type="spatula"
                  isActive={gameState.currentStep === 5}
                  isCompleted={gameState.stepsCompleted[5]}
                  style={{ 
                    gridColumn: '1 / -1',
                    width: '80px', 
                    height: '25px',
                    margin: '5px auto 0'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}>
              <div style={{
                background: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '2px solid rgba(255, 152, 0, 0.3)',
                color: '#E65100',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                🍳 Cooking Station
              </div>
              
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '200px',
                  height: '120px',
                  background: 'linear-gradient(45deg, #424242, #616161)',
                  borderRadius: '10px',
                  position: 'relative',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  border: '3px solid #333'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(66, 66, 66, 0.9)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    STOVE
                  </div>
                  
                  <button
                    onClick={handleStoveClick}
                    style={{
                      position: 'absolute',
                      bottom: '15px',
                      right: '20px',
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      border: gameState.currentStep === 1 ? '3px solid #FF9800' : '3px solid #757575',
                      background: gameState.flameOn 
                        ? 'linear-gradient(45deg, #FF5722, #F44336)' 
                        : 'linear-gradient(45deg, #9E9E9E, #757575)',
                      cursor: gameState.currentStep === 1 ? 'pointer' : 'default',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: gameState.currentStep === 1 ? '0 0 10px rgba(255, 152, 0, 0.5)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {gameState.flameOn ? 'ON' : 'OFF'}
                  </button>

                  {gameState.flameOn && (
                    <div style={{
                      position: 'absolute',
                      bottom: '65px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '80px',
                      height: '30px',
                      background: 'radial-gradient(circle, #FF9800 30%, #FF5722 70%)',
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                      animation: 'flicker 0.5s infinite alternate'
                    }}
                    />
                  )}
                </div>

                <div
                  ref={panRef}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'pan')}
                  style={{
                    position: 'absolute',
                    top: '-35px',
                    left: '30px',
                    width: '140px',
                    height: '140px',
                    background: 'linear-gradient(45deg, #37474F, #546E7A)',
                    borderRadius: '50%',
                    border: '4px solid #263238',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: isDragging ? '0 0 20px rgba(255, 152, 0, 0.6)' : '0 4px 15px rgba(0,0,0,0.3)',
                    transition: 'box-shadow 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(55, 71, 79, 0.9)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    DROP INGREDIENTS HERE
                  </div>
                  
                  {gameState.showOil && (
                    <div style={{
                      width: '90%',
                      height: '90%',
                      background: 'radial-gradient(circle, #FFE082 50%, #FFC107 80%)',
                      borderRadius: '50%',
                      position: 'absolute',
                      opacity: 0.7,
                      animation: 'oilShimmer 2s infinite alternate'
                    }} />
                  )}

                  {gameState.showButter && (
                    <div style={{
                      width: '30%',
                      height: '30%',
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
                    <div style={{
                      width: '80%',
                      height: '80%',
                      background: 'radial-gradient(circle, #FFF9C4 30%, #FFF176 60%, #FFE082 90%)',
                      borderRadius: '40% 60% 50% 50%',
                      position: 'absolute',
                      animation: 'eggScramble 1.2s ease-out'
                    }} />
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

                  {gameState.flameOn && (gameState.showOil || gameState.eggInPan) && (
                    <>
                      <div style={{
                        position: 'absolute',
                        width: '4px',
                        height: '4px',
                        background: 'white',
                        borderRadius: '50%',
                        top: '20%',
                        left: '30%',
                        animation: 'sizzle1 0.8s infinite'
                      }} />
                      <div style={{
                        position: 'absolute',
                        width: '3px',
                        height: '3px',
                        background: 'white',
                        borderRadius: '50%',
                        top: '40%',
                        right: '25%',
                        animation: 'sizzle2 1.2s infinite 0.3s'
                      }} />
                      <div style={{
                        position: 'absolute',
                        width: '5px',
                        height: '5px',
                        background: 'white',
                        borderRadius: '50%',
                        bottom: '30%',
                        left: '40%',
                        animation: 'sizzle3 1s infinite 0.6s'
                      }} />
                    </>
                  )}

                  <div style={{
                    position: 'absolute',
                    right: '-55px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '55px',
                    height: '10px',
                    background: 'linear-gradient(45deg, #5D4037, #795548)',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </Box>

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

          {gameState.stepsCompleted.every(step => step) && (
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
            zIndex: 1000
          }}>
            {gameState.feedbackMessage}
          </div>
        )}

        {gameState.showCookedEggPrompt && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1500
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
              padding: '30px',
              borderRadius: '20px',
              textAlign: 'center',
              border: '3px solid #FF9800',
              maxWidth: '350px'
            }}>
              <h3 style={{ 
                color: '#E65100', 
                marginBottom: '20px',
                fontSize: '22px',
                fontWeight: 'bold'
              }}>
                Look at your delicious egg!
              </h3>
              
              <div style={{
                marginBottom: '20px',
                padding: '15px',
                background: 'white',
                borderRadius: '15px',
                border: '2px solid #FFE082'
              }}>
                <img 
                  src={ingredientImages.cookedEgg} 
                  alt="Perfectly cooked scrambled egg"
                  style={{
                    width: '200px',
                    height: '150px',
                    objectFit: 'contain',
                    borderRadius: '10px'
                  }}
                />
              </div>
              
              <p style={{ 
                color: '#5D4037', 
                marginBottom: '25px',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                Your scrambled egg is perfectly fluffy and golden! 
                The spatula helped mix everything together beautifully.
              </p>
              
              <button
                onClick={closeCookedEggPrompt}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Continue Cooking!
              </button>
            </div>
          </div>
        )}

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
              <h2 style={{ 
                color: '#E65100', 
                marginBottom: '15px',
                fontSize: '32px',
                fontWeight: 'bold'
              }}>
                Level 3 Complete!
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
                color: '#E65100', 
                marginBottom: '20px' 
              }}>
                Delicious gourmet scrambled egg!
              </h3>
              
              <p style={{ 
                color: '#5D4037', 
                marginBottom: '30px',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                You've mastered the complete recipe with oil, butter, egg, salt, and spring onion garnish! 
                This is restaurant-quality cooking!
              </p>

              {progressSaving && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.9)', borderRadius: '12px', color: 'white' }}>
                  <CircularProgress size={16} sx={{ mr: 1, color: 'white' }} />
                  <Typography variant="body2">Saving your progress...</Typography>
                </Box>
              )}
              
              {progressSaved && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.9)', borderRadius: '12px', color: 'white' }}>
                  ✅ Progress saved successfully!
                </Box>
              )}
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
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
      </Box>
    </div>
  );
};

export default CookingLevel3;