import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Droplet, Sparkles } from 'lucide-react';
import Navbar from '../Navbar';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Progress service imports
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

export default function RiceCookerSimulator() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();

  const [potOnTable, setPotOnTable] = useState(false);
  const [riceInPot, setRiceInPot] = useState(false);
  const [rinseCount, setRinseCount] = useState(0);
  const [waterAmount, setWaterAmount] = useState(null);
  const [potInCooker, setPotInCooker] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const [cookingProgress, setCookingProgress] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restingProgress, setRestingProgress] = useState(0);
  const [isServed, setIsServed] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [riceQuality, setRiceQuality] = useState('');
  const [mistakes, setMistakes] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [showPourAnimation, setShowPourAnimation] = useState(false);
  const [showWaterSplash, setShowWaterSplash] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSteam, setShowSteam] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const panRef = useRef(null);

  const riceCookingSteps = [
    { id: 0, instruction: "🍲 Drag pot to counter", focus: 'setup' },
    { id: 1, instruction: "🌾 Add rice to pot", focus: 'setup' },
    { id: 2, instruction: "🚰 Rinse rice at sink", focus: 'preparation' },
    { id: 3, instruction: "💧 Add perfect water", focus: 'preparation' },
    { id: 4, instruction: "⚡ Place in cooker", focus: 'cooking' },
    { id: 5, instruction: "🔥 Start cooking", focus: 'cooking' },
    { id: 6, instruction: "⏱️ Wait patiently", focus: 'cooking' },
    { id: 7, instruction: "🥄 Serve the rice", focus: 'serving' }
  ];

  // Determine current phase for focus management
  const currentPhase = riceCookingSteps[currentStep]?.focus || 'setup';
  const isSetupPhase = currentPhase === 'setup';
  const isPreparationPhase = currentPhase === 'preparation';
  const isCookingPhase = currentPhase === 'cooking';
  const isServingPhase = currentPhase === 'serving';

  useEffect(() => {
    let interval;
    if (isCooking) {
      interval = setInterval(() => {
        setCookingProgress(prev => {
          if (prev >= 100) {
            setIsCooking(false);
            setIsResting(true);
            setShowSteam(true);
            return 100;
          }
          return prev + 1.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isCooking]);

  useEffect(() => {
    let interval;
    if (isResting) {
      interval = setInterval(() => {
        setRestingProgress(prev => {
          if (prev >= 100) {
            setIsResting(false);
            setShowSteam(false);
            return 100;
          }
          return prev + 3;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isResting]);

  // Update current step based on game state
  useEffect(() => {
    let step = 0;
    if (!potOnTable) step = 0;
    else if (!riceInPot) step = 1;
    else if (rinseCount < 2) step = 2;
    else if (!waterAmount) step = 3;
    else if (!potInCooker) step = 4;
    else if (!isCooking && cookingProgress === 0) step = 5;
    else if (isCooking || isResting) step = 6;
    else if (cookingProgress === 100 && !isServed) step = 7;
    else step = 7;
    
    setCurrentStep(step);
  }, [potOnTable, riceInPot, rinseCount, waterAmount, potInCooker, isCooking, cookingProgress, isResting, isServed]);

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;
    setProgressSaving(true);
    
    try {
      // Add your progress saving logic here
      // await saveStudentLessonProgress(moduleId, lessonId, { completed: true });
      
      setTimeout(() => {
        setProgressSaved(true);
        setProgressSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setProgressSaving(false);
    }
  };

  const showFeedbackMessage = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'drop') {
        oscillator.frequency.value = 200;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } else if (type === 'water') {
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } else if (type === 'success') {
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      }
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    // Hide instruction when dragging starts
    setShowFeedback(false);
  };

  const handleDragOver = (e, zone) => {
    e.preventDefault();
    setHoveredZone(zone);
  };

  const handleDragLeave = () => {
    setHoveredZone(null);
  };

  const handleDrop = (e, zone) => {
    e.preventDefault();
    setHoveredZone(null);

    if (draggedItem === 'pot' && zone === 'table' && !potOnTable) {
      setPotOnTable(true);
      playSound('drop');
      showFeedbackMessage("Great! Pot is on the counter!");
    }
    else if (draggedItem === 'rice' && zone === 'pot-on-table' && potOnTable && !riceInPot) {
      setShowPourAnimation(true);
      playSound('drop');
      setTimeout(() => {
        setRiceInPot(true);
        setShowPourAnimation(false);
        setShowSparkles(true);
        showFeedbackMessage("Perfect! Rice added to the pot!");
        setTimeout(() => setShowSparkles(false), 1000);
      }, 800);
    }
    else if (draggedItem === 'pot-with-rice' && zone === 'sink' && riceInPot && waterAmount === null) {
      setShowWaterSplash(true);
      playSound('water');
      setTimeout(() => {
        setRinseCount(prev => prev + 1);
        setShowWaterSplash(false);
        showFeedbackMessage(`Rice rinsed ${rinseCount + 1} time${rinseCount + 1 !== 1 ? 's' : ''}!`);
        if (rinseCount + 1 >= 2) {
          setShowSparkles(true);
          setTimeout(() => setShowSparkles(false), 1000);
        }
      }, 600);
    }
    else if (draggedItem === 'water-low' && zone === 'pot-on-table' && rinseCount >= 1) {
      setWaterAmount('low');
      playSound('water');
      showFeedbackMessage("Water added, but it might be too little...");
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 800);
    }
    else if (draggedItem === 'water-perfect' && zone === 'pot-on-table' && rinseCount >= 1) {
      setWaterAmount('perfect');
      playSound('success');
      showFeedbackMessage("Perfect water amount! Great job!");
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 800);
    }
    else if (draggedItem === 'water-high' && zone === 'pot-on-table' && rinseCount >= 1) {
      setWaterAmount('high');
      playSound('water');
      showFeedbackMessage("Water added, but it might be too much...");
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 800);
    }
    else if (draggedItem === 'pot-ready' && zone === 'cooker' && waterAmount && !potInCooker) {
      setPotInCooker(true);
      playSound('drop');
      showFeedbackMessage("Excellent! Pot is in the rice cooker!");
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
    }
    else if (draggedItem === 'paddle' && zone === 'serving-area' && cookingProgress === 100 && !isResting) {
      handleServe();
    }

    setDraggedItem(null);
  };

  const handleCookButton = () => {
    if (potInCooker && !isCooking && cookingProgress === 0) {
      setIsCooking(true);
      playSound('success');
      showFeedbackMessage("Cooking started! 🔥");
    }
  };

  const handleServe = () => {
    setIsServed(true);
    playSound('success');
    showFeedbackMessage("Rice served! Let's see how you did!");
    calculateResults();
  };

  const calculateResults = () => {
    const newMistakes = [];
    
    if (rinseCount < 2) {
      newMistakes.push(`Only rinsed ${rinseCount} time${rinseCount !== 1 ? 's' : ''} (should rinse 2-3 times)`);
    }
    
    if (waterAmount === 'low') {
      newMistakes.push('Too little water - rice will be hard and undercooked');
    } else if (waterAmount === 'high') {
      newMistakes.push('Too much water - rice will be mushy and overcooked');
    }
    
    setMistakes(newMistakes);
    
    if (newMistakes.length === 0 && waterAmount === 'perfect') {
      setRiceQuality('Perfect Rice! 🏆');
    } else if (rinseCount < 2) {
      setRiceQuality('Sticky Rice 😕');
    } else if (waterAmount === 'high') {
      setRiceQuality('Mushy Rice 💦');
    } else if (waterAmount === 'low') {
      setRiceQuality('Hard Rice 🪨');
    } else {
      setRiceQuality('Good Rice ⭐');
    }
    
    setGameComplete(true);
    saveProgress();
  };

  const resetGame = () => {
    setPotOnTable(false);
    setRiceInPot(false);
    setRinseCount(0);
    setWaterAmount(null);
    setPotInCooker(false);
    setIsCooking(false);
    setCookingProgress(0);
    setIsResting(false);
    setRestingProgress(0);
    setIsServed(false);
    setGameComplete(false);
    setRiceQuality('');
    setMistakes([]);
    setDraggedItem(null);
    setHoveredZone(null);
    setShowPourAnimation(false);
    setShowWaterSplash(false);
    setShowSparkles(false);
    setShowSteam(false);
    setProgressSaved(false);
    setCurrentStep(0);
  };

  const DraggableItem = ({ type, isActive, isCompleted, children, style = {} }) => (
    <div
      draggable={isActive}
      onDragStart={(e) => handleDragStart(e, type)}
      style={{
        cursor: isActive ? 'grab' : 'default',
        opacity: isCompleted ? 0.3 : isActive ? 1 : 0.6,
        border: isActive ? '3px solid #FF9800' : isCompleted ? '3px solid #4CAF50' : '2px solid #ccc',
        borderRadius: '12px',
        padding: '10px',
        backgroundColor: isCompleted ? '#E8F5E8' : isActive ? '#FFF8E1' : 'white',
        position: 'relative',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isActive ? '0 4px 20px rgba(255, 152, 0, 0.6)' : '0 2px 8px rgba(0,0,0,0.1)',
        ...style
      }}
    >
      {children}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '24px',
          height: '24px',
          background: 'linear-gradient(135deg, #FF9800, #F57C00)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          animation: 'pulse 1.5s infinite',
          boxShadow: '0 2px 8px rgba(255, 152, 0, 0.5)'
        }}>!</div>
      )}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '24px',
          height: '24px',
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          borderRadius: '50%',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.5)'
        }}>✓</div>
      )}
    </div>
  );

  if (gameComplete) {
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
          backgroundColor: "rgba(0, 0, 0, 0.4)",
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

          <Box sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '24px',
              padding: '48px',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              animation: 'bounceIn 0.6s ease-out'
            }}>
              <div style={{ fontSize: '100px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>
                {riceQuality.includes('Perfect') ? '🏆' : 
                 riceQuality.includes('Sticky') ? '😕' :
                 riceQuality.includes('Mushy') ? '💦' :
                 riceQuality.includes('Hard') ? '🪨' : '⭐'}
              </div>
              
              <h2 style={{
                fontSize: '36px',
                color: '#1a202c',
                marginBottom: '16px',
                fontWeight: '700'
              }}>
                {riceQuality}
              </h2>

              {mistakes.length > 0 ? (
                <div style={{
                  backgroundColor: '#fef2f2',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  border: '2px solid #fca5a5'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#991b1b',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ⚠️ What went wrong:
                  </div>
                  {mistakes.map((mistake, idx) => (
                    <div key={idx} style={{
                      fontSize: '14px',
                      color: '#dc2626',
                      marginBottom: '8px',
                      lineHeight: '1.6'
                    }}>
                      • {mistake}
                    </div>
                  ))}
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#fff7ed',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#9a3412',
                    fontWeight: '600'
                  }}>
                    💡 Tip: Rinse rice 2-3 times and use the "Perfect Water" option for best results!
                  </div>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '2px solid #86efac'
                }}>
                  <div style={{
                    fontSize: '16px',
                    color: '#166534',
                    fontWeight: '600',
                    lineHeight: '1.6'
                  }}>
                    🎉 Excellent work! You rinsed the rice properly and used the perfect water amount. Your rice is fluffy, separate, and delicious!
                  </div>
                </div>
              )}

              {progressSaving && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.9)', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                  <Typography variant="body2">Saving progress...</Typography>
                </Box>
              )}
              
              {progressSaved && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.9)', borderRadius: '12px', color: 'white' }}>
                  ✅ Progress saved!
                </Box>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
                <Button
                  onClick={resetGame}
                  variant="outlined"
                  startIcon={<span>🔄</span>}
                  sx={{ 
                    borderColor: '#667eea', 
                    color: '#667eea',
                    borderRadius: '12px',
                    borderWidth: '2px',
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '700',
                    textTransform: 'none',
                    '&:hover': {
                      borderWidth: '2px',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cook Again
                </Button>

                <Button 
                  onClick={() => navigate('/homepage')}
                  variant="contained"
                  startIcon={<span>🏠</span>}
                  sx={{ 
                    backgroundColor: '#2196F3',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '700',
                    textTransform: 'none',
                    '&:hover': { 
                      backgroundColor: '#1976D2',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Home
                </Button>

                <Button
                  onClick={() => navigate('/lesson/cooking/level-5')}
                  variant="contained"
                  startIcon={<span>🚀</span>}
                  sx={{ 
                    backgroundColor: '#4CAF50',
                    borderRadius: '12px',
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '700',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                    '&:hover': { 
                      backgroundColor: '#45a049',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                    },
                    animation: 'pulse 2s infinite',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Next Level
                </Button>
              </div>
            </div>
          </Box>
        </Box>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
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
      backgroundAttachment: "fixed",
    }}>
      <Box sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
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
            50% { transform: scale(1.05); }
          }
          @keyframes waterDrop {
            0% { transform: translateY(-30px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(40px); opacity: 0; }
          }
          @keyframes pourRice {
            0% { transform: translateY(-20px) rotate(-15deg); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(30px) rotate(-15deg); opacity: 0; }
          }
          @keyframes steamRise {
            0% { transform: translateY(0) scale(0.8); opacity: 0.7; }
            100% { transform: translateY(-60px) scale(1.2); opacity: 0; }
          }
          @keyframes sparkle {
            0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { transform: scale(1) rotate(180deg); opacity: 1; }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.6); }
            50% { box-shadow: 0 0 35px rgba(16, 185, 129, 0.9); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes focusPulse {
            0%, 100% { transform: scale(1); border-color: #FF9800; }
            50% { transform: scale(1.02); border-color: #FFC107; }
          }
          .draggable {
            cursor: grab;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
          }
          .draggable:hover {
            transform: scale(1.08) translateY(-4px);
            filter: brightness(1.1);
          }
          .draggable:active {
            cursor: grabbing;
            transform: scale(0.98);
          }
          .drop-zone {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .drop-zone.hovered {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%) !important;
            border-color: #10b981 !important;
            border-width: 4px !important;
            transform: scale(1.02);
            animation: glow 1s infinite;
          }
          .focused-area {
            animation: focusPulse 2s infinite;
            border-width: 3px !important;
          }
          .dimmed-area {
            opacity: 0.5;
            filter: grayscale(0.3);
            transition: all 0.3s ease;
          }
        `}
      </style>
        
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '15px',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '24px',
            textAlign: 'center',
            borderRadius: '20px',
            marginBottom: '16px',
            width: '100%',
            maxWidth: '800px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            animation: 'slideIn 0.5s ease-out'
          }}>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '30px', fontWeight: '800' }}>
              🍚 Level 4: Perfect Rice Cooking
            </h1>
            <p style={{ margin: '0', fontSize: '15px', opacity: 0.95 }}>
              Master the art of cooking perfect rice!
            </p>
          </div>

          {/* Current Instruction - Enhanced with better visibility */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '16px 24px',
            textAlign: 'center',
            borderRadius: '16px',
            marginBottom: '16px',
            width: '100%',
            maxWidth: '900px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.6s ease-out',
            border: '3px solid #FF9800',
            position: 'relative',
            zIndex: 10
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                fontSize: '18px', 
                color: '#764ba2', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '24px', animation: 'pulse 2s infinite' }}>👉</span>
                {riceCookingSteps[currentStep]?.instruction || "Your rice is ready!"}
              </span>
              {currentStep < 8 && (
                <span style={{ 
                  background: 'linear-gradient(135deg, #FF9800, #F57C00)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '800',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)'
                }}>
                  Step {currentStep + 1}/8
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '20px',
            width: '100%',
            maxWidth: '900px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.7s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
              <span style={{ fontWeight: '700', color: '#764ba2', fontSize: '15px' }}>Cooking Progress:</span>
              <span style={{ color: '#667eea', fontWeight: '700', fontSize: '15px' }}>
                {currentStep}/8 steps completed
              </span>
            </div>
            <div style={{
              background: '#E8E8E8',
              borderRadius: '10px',
              height: '12px',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                height: '100%',
                width: `${(currentStep / 8) * 100}%`,
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
              }} />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            gap: '16px',
            width: '100%',
            maxWidth: '1200px'
          }}>
            {/* Tools & Ingredients Panel - Phase-based styling */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '18px',
              border: isSetupPhase ? '3px solid #FF9800' : '2px solid rgba(102, 126, 234, 0.25)',
              height: 'fit-content',
              boxShadow: isSetupPhase ? '0 8px 25px rgba(255, 152, 0, 0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
              animation: isSetupPhase ? 'focusPulse 2s infinite' : 'slideIn 0.8s ease-out',
              opacity: isSetupPhase ? 1 : 0.7,
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ 
                margin: '0 0 14px 0', 
                color: isSetupPhase ? '#FF9800' : '#667eea',
                textAlign: 'center',
                fontSize: '15px',
                fontWeight: '800',
                borderBottom: `2px solid ${isSetupPhase ? 'rgba(255, 152, 0, 0.3)' : 'rgba(102, 126, 234, 0.25)'}`,
                paddingBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <span style={{ fontSize: '20px' }}>🧰</span>
                {isSetupPhase ? 'ACTIVE: Tools & Items' : 'Tools & Items'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                {!potOnTable && (
                  <DraggableItem 
                    type="pot"
                    isActive={currentStep === 0}
                    isCompleted={potOnTable}
                    style={{ width: '100%', height: '65px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '36px' }}>🍲</div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>Cooking Pot</div>
                  </DraggableItem>
                )}

                {potOnTable && !riceInPot && (
                  <DraggableItem 
                    type="rice"
                    isActive={currentStep === 1}
                    isCompleted={riceInPot}
                    style={{ width: '100%', height: '65px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '36px' }}>🌾</div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>Uncooked Rice</div>
                  </DraggableItem>
                )}

                {riceInPot && waterAmount === null && rinseCount < 3 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '14px',
                    padding: '14px',
                    textAlign: 'center',
                    border: isPreparationPhase ? '3px solid #3b82f6' : '2px solid rgba(59, 130, 246, 0.4)',
                    boxShadow: isPreparationPhase ? '0 6px 20px rgba(59, 130, 246, 0.3)' : '0 4px 12px rgba(59, 130, 246, 0.2)',
                    animation: isPreparationPhase ? 'focusPulse 2s infinite' : 'none',
                    width: '100%',
                    opacity: isPreparationPhase ? 1 : 0.8
                  }}>
                    <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                      🍲💧
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
                      Rinse at Sink
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: '600' }}>
                      Rinsed: {rinseCount}/2-3 times
                    </div>
                  </div>
                )}

                {rinseCount >= 2 && waterAmount === null && (
                  <>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#6b7280',
                      marginTop: '8px',
                      marginBottom: '4px',
                      width: '100%',
                      textAlign: 'left',
                      paddingLeft: '4px'
                    }}>
                      💦 Water Level:
                    </div>
                    
                    <DraggableItem 
                      type="water-low"
                      isActive={currentStep === 3 && !waterAmount}
                      isCompleted={waterAmount === 'low'}
                      style={{ width: '100%', height: '58px', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '30px' }}>💧</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>Too Little</div>
                    </DraggableItem>
                    
                    <DraggableItem 
                      type="water-perfect"
                      isActive={currentStep === 3 && !waterAmount}
                      isCompleted={waterAmount === 'perfect'}
                      style={{ width: '100%', height: '58px', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '30px' }}>💧💧</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>Perfect ✓</div>
                    </DraggableItem>
                    
                    <DraggableItem 
                      type="water-high"
                      isActive={currentStep === 3 && !waterAmount}
                      isCompleted={waterAmount === 'high'}
                      style={{ width: '100%', height: '58px', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '30px' }}>💧💧💧</div>
                      <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '2px' }}>Too Much</div>
                    </DraggableItem>
                  </>
                )}

                {cookingProgress === 100 && !isResting && !isServed && (
                  <DraggableItem 
                    type="paddle"
                    isActive={currentStep === 7}
                    isCompleted={isServed}
                    style={{ width: '100%', height: '65px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '36px' }}>🥄</div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px' }}>Rice Paddle</div>
                  </DraggableItem>
                )}
              </div>

              {/* Progress Checklist - Simplified */}
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '2px solid #e5e7eb'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#374151',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  ✅ Progress
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <ChecklistItem completed={potOnTable} text="Pot on counter" />
                  <ChecklistItem completed={riceInPot} text="Rice added" />
                  <ChecklistItem completed={rinseCount >= 2} text={`Rice rinsed ${rinseCount >= 2 ? '✓' : ''}`} />
                  <ChecklistItem completed={waterAmount !== null} text="Water added" />
                  <ChecklistItem completed={potInCooker} text="In cooker" />
                  <ChecklistItem completed={cookingProgress === 100} text="Cooked" />
                  <ChecklistItem completed={isServed} text="Served" />
                </div>
              </div>
            </div>

            {/* Main Cooking Area */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {/* Cooking Station Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '10px 20px',
                borderRadius: '16px',
                color: 'white',
                fontWeight: '800',
                alignSelf: 'center',
                fontSize: '16px',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'slideIn 0.9s ease-out'
              }}>
                <span style={{ fontSize: '24px' }}>🍳</span>
                Cooking Station
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px'
              }}>
                {/* Kitchen Counter - Phase-based styling */}
                <div
                  onDragOver={(e) => handleDragOver(e, potOnTable ? 'pot-on-table' : 'table')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, potOnTable ? 'pot-on-table' : 'table')}
                  className={`drop-zone ${(hoveredZone === 'table' || hoveredZone === 'pot-on-table') ? 'hovered' : ''} ${isSetupPhase ? 'focused-area' : ''} ${!isSetupPhase && !isPreparationPhase ? 'dimmed-area' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                    borderRadius: '18px',
                    padding: '32px',
                    border: isSetupPhase ? '3px dashed #FF9800' : '3px dashed #d1d5db',
                    minHeight: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: isSetupPhase ? '#FF9800' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ fontSize: '22px' }}>🪵</span>
                    Counter
                  </div>

                  {/* Pour Rice Animation */}
                  {showPourAnimation && (
                    <div style={{
                      position: 'absolute',
                      top: '70px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      zIndex: 10
                    }}>
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: '14px',
                            animation: `pourRice 0.8s ease-out ${i * 0.1}s`,
                            marginLeft: `${Math.random() * 30 - 15}px`
                          }}
                        >
                          🌾
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sparkles Animation */}
                  {showSparkles && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 10
                    }}>
                      {[...Array(6)].map((_, i) => (
                        <Sparkles
                          key={i}
                          size={22}
                          color="#fbbf24"
                          style={{
                            position: 'absolute',
                            animation: `sparkle 0.8s ease-out ${i * 0.1}s`,
                            left: `${Math.cos(i * 60 * Math.PI / 180) * 45}px`,
                            top: `${Math.sin(i * 60 * Math.PI / 180) * 45}px`
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {potOnTable && !potInCooker && (
                    <div
                      style={{
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      <div
                        draggable={riceInPot}
                        onDragStart={(e) => {
                          if (riceInPot && waterAmount === null) {
                            handleDragStart(e, 'pot-with-rice');
                          } else if (waterAmount !== null) {
                            handleDragStart(e, 'pot-ready');
                          }
                        }}
                        className={riceInPot ? 'draggable' : ''}
                        style={{
                          cursor: riceInPot ? 'grab' : 'default',
                          display: 'inline-block'
                        }}
                      >
                        <svg width="180" height="140" viewBox="0 0 200 150">
                          <ellipse cx="100" cy="130" rx="70" ry="15" fill="#4b5563" opacity="0.25" />
                          <rect x="40" y="60" width="120" height="70" rx="8" fill="#6b7280" />
                          <rect x="40" y="60" width="120" height="15" rx="8" fill="#9ca3af" />
                          <path d="M 30 80 Q 20 80, 20 90 Q 20 100, 30 100" fill="none" stroke="#4b5563" strokeWidth="8" strokeLinecap="round" />
                          <path d="M 170 80 Q 180 80, 180 90 Q 180 100, 170 100" fill="none" stroke="#4b5563" strokeWidth="8" strokeLinecap="round" />
                          <rect x="50" y="65" width="40" height="60" rx="4" fill="white" opacity="0.25" />
                        </svg>

                        {riceInPot && (
                          <div style={{
                            position: 'absolute',
                            top: '35px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90px',
                            height: '35px',
                            background: 'radial-gradient(circle, #fef3c7 0%, #fde68a 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ fontSize: '20px' }}>🌾🌾🌾</span>
                          </div>
                        )}

                        {waterAmount && (
                          <div style={{
                            position: 'absolute',
                            top: '30px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '90px',
                            height: waterAmount === 'low' ? '18px' : waterAmount === 'perfect' ? '32px' : '45px',
                            background: 'rgba(59, 130, 246, 0.45)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Droplet size={18} color="#3b82f6" />
                          </div>
                        )}

                        <div style={{
                          marginTop: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {rinseCount > 0 && (
                            <div style={{
                              color: rinseCount >= 2 ? '#059669' : '#f59e0b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              justifyContent: 'center'
                            }}>
                              {rinseCount >= 2 ? '✓' : '⚠️'} Rinsed {rinseCount} time{rinseCount !== 1 ? 's' : ''}
                            </div>
                          )}
                          {waterAmount && (
                            <div style={{
                              color: waterAmount === 'perfect' ? '#059669' : '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              justifyContent: 'center'
                            }}>
                              {waterAmount === 'perfect' ? '✓' : '⚠️'} Water: {waterAmount === 'low' ? 'Low' : waterAmount === 'perfect' ? 'Perfect' : 'High'}
                            </div>
                          )}
                          {riceInPot && waterAmount === null && rinseCount < 2 && (
                            <div style={{
                              color: '#3b82f6',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              justifyContent: 'center',
                              animation: 'pulse 2s infinite',
                              fontSize: '11px',
                              backgroundColor: '#dbeafe',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              marginTop: '4px'
                            }}>
                              👆 Drag to sink to rinse
                            </div>
                          )}
                          {riceInPot && waterAmount === null && rinseCount >= 2 && (
                            <div style={{
                              color: '#059669',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              justifyContent: 'center',
                              animation: 'pulse 2s infinite',
                              fontSize: '11px',
                              backgroundColor: '#d1fae5',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              marginTop: '4px'
                            }}>
                              💧 Add water now
                            </div>
                          )}
                          {waterAmount && !potInCooker && (
                            <div style={{
                              color: '#ef4444',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              justifyContent: 'center',
                              animation: 'pulse 2s infinite',
                              fontSize: '11px',
                              backgroundColor: '#fee2e2',
                              padding: '5px 10px',
                              borderRadius: '8px',
                              marginTop: '4px'
                            }}>
                              👆 Drag to rice cooker
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!potOnTable && (
                    <div style={{
                      fontSize: '16px',
                      color: '#FF9800',
                      fontWeight: '700',
                      textAlign: 'center',
                      animation: 'pulse 2s infinite',
                      backgroundColor: '#FFF8E1',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: '2px solid #FFE082'
                    }}>
                      👆 Drop cooking pot here
                    </div>
                  )}
                </div>

                {/* Kitchen Sink - Phase-based styling */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'sink')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'sink')}
                  className={`drop-zone ${hoveredZone === 'sink' ? 'hovered' : ''} ${isPreparationPhase ? 'focused-area' : ''} ${!isPreparationPhase ? 'dimmed-area' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)',
                    borderRadius: '18px',
                    padding: '32px',
                    border: isPreparationPhase ? '3px dashed #3b82f6' : '3px dashed #d1d5db',
                    minHeight: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: isPreparationPhase ? '#1e40af' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ fontSize: '22px' }}>🚰</span>
                    Sink
                  </div>

                  <svg width="180" height="180" viewBox="0 0 200 200">
                    <ellipse cx="100" cy="150" rx="75" ry="25" fill="#cbd5e1" />
                    <rect x="25" y="125" width="150" height="25" fill="#94a3b8" />
                    <ellipse cx="100" cy="125" rx="75" ry="25" fill="#e2e8f0" />
                    <ellipse cx="100" cy="125" rx="60" ry="20" fill="#f1f5f9" />
                    <circle cx="100" cy="125" r="8" fill="#64748b" />
                    <circle cx="100" cy="125" r="6" fill="#475569" />
                    <rect x="90" y="100" width="20" height="30" rx="4" fill="#71717a" />
                    <ellipse cx="100" cy="100" rx="15" ry="6" fill="#52525b" />
                    <path d="M 100 100 Q 100 60, 120 40" stroke="#71717a" strokeWidth="12" fill="none" strokeLinecap="round" />
                    <path d="M 120 40 L 120 60" stroke="#71717a" strokeWidth="12" strokeLinecap="round" />
                    <ellipse cx="120" cy="62" rx="10" ry="8" fill="#52525b" />
                    <rect x="115" y="62" width="10" height="15" rx="3" fill="#71717a" />
                    <ellipse cx="120" cy="77" rx="8" ry="5" fill="#52525b" />
                    <circle cx="80" cy="90" r="8" fill="#ef4444" opacity="0.8" />
                    <circle cx="80" cy="90" r="6" fill="#dc2626" />
                    <circle cx="120" cy="90" r="8" fill="#3b82f6" opacity="0.8" />
                    <circle cx="120" cy="90" r="6" fill="#2563eb" />
                    <path d="M 105 70 Q 105 55, 115 45" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
                  </svg>

                  {showWaterSplash && (
                    <div style={{
                      position: 'absolute',
                      top: '90px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 10
                    }}>
                      <div style={{
                        position: 'absolute',
                        left: '20px',
                        top: '-20px',
                        width: '4px',
                        height: '55px',
                        background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.3) 100%)',
                        borderRadius: '2px',
                        animation: 'waterDrop 0.4s ease-out'
                      }} />
                      
                      {[...Array(12)].map((_, i) => (
                        <Droplet
                          key={i}
                          size={14}
                          color="#3b82f6"
                          style={{
                            position: 'absolute',
                            animation: `waterDrop 0.6s ease-out ${i * 0.05}s`,
                            left: `${Math.random() * 50 - 25}px`,
                            top: '35px'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e40af',
                    textAlign: 'center'
                  }}>
                    {riceInPot && waterAmount === null && rinseCount < 2 ? (
                      <div style={{
                        backgroundColor: '#dbeafe',
                        padding: '12px 18px',
                        borderRadius: '14px',
                        border: isPreparationPhase ? '3px solid #3b82f6' : '2px solid #3b82f6',
                        animation: isPreparationPhase ? 'pulse 2s infinite' : 'none',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                      }}>
                        <div style={{ fontSize: '28px', marginBottom: '6px' }}>👇</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af' }}>
                          Drop pot here to rinse!
                        </div>
                        <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px' }}>
                          Rinsed: {rinseCount}/2-3 times
                        </div>
                      </div>
                    ) : rinseCount >= 2 && waterAmount === null ? (
                      <div style={{
                        backgroundColor: '#d1fae5',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        border: '2px solid #10b981',
                        color: '#059669'
                      }}>
                        ✓ Rice rinsed {rinseCount} times
                      </div>
                    ) : (
                      <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '12px' }}>
                        Rinse rice here (2-3 times)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rice Cooker and Serving Area */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px'
              }}>
                {/* Rice Cooker - Phase-based styling */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'cooker')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'cooker')}
                  className={`drop-zone ${hoveredZone === 'cooker' ? 'hovered' : ''} ${isCookingPhase ? 'focused-area' : ''} ${!isCookingPhase ? 'dimmed-area' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
                    borderRadius: '18px',
                    padding: '28px',
                    border: isCookingPhase ? '3px dashed #ef4444' : '3px dashed #d1d5db',
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: isCookingPhase ? '#991b1b' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ fontSize: '22px' }}>⚡</span>
                    Rice Cooker
                  </div>

                  {showSteam && (
                    <div style={{
                      position: 'absolute',
                      top: '50px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 10
                    }}>
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            fontSize: '28px',
                            animation: `steamRise 2s ease-out infinite ${i * 0.3}s`,
                            left: `${(i - 2) * 18}px`
                          }}
                        >
                          💨
                        </div>
                      ))}
                    </div>
                  )}

                  <svg width="160" height="160" viewBox="0 0180 180">
                    <ellipse cx="90" cy="165" rx="70" ry="12" fill="#4b5563" opacity="0.25" />
                    <rect x="30" y="80" width="120" height="80" rx="12" fill="#dc2626" />
                    <rect x="35" y="85" width="110" height="70" rx="8" fill="#ef4444" />
                    <ellipse cx="90" cy="80" rx="60" ry="20" fill="#b91c1c" />
                    <ellipse cx="90" cy="77" rx="55" ry="18" fill="#dc2626" />
                    <circle cx="90" cy="70" r="12" fill="#4b5563" />
                    <circle cx="90" cy="70" r="8" fill="#6b7280" />
                    <rect x="50" y="110" width="80" height="30" rx="6" fill="#1f2937" />
                    <circle cx="70" cy="125" r="6" fill={isCooking ? '#10b981' : '#6b7280'} />
                    <circle cx="110" cy="125" r="6" fill={potInCooker && !isCooking ? '#ef4444' : '#6b7280'} />
                    <rect x="45" y="90" width="30" height="60" rx="8" fill="white" opacity="0.25" />
                  </svg>

                  {potInCooker && (
                    <div style={{
                      position: 'absolute',
                      top: '110px',
                      fontSize: '36px',
                      animation: 'float 3s ease-in-out infinite'
                    }}>
                      🍲
                    </div>
                  )}

                  {potInCooker && !isCooking && cookingProgress === 0 && (
                    <button
                      onClick={handleCookButton}
                      style={{
                        marginTop: '20px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '14px 32px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 6px 20px rgba(239, 68, 68, 0.5)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: 'pulse 2s infinite'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05) translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.6)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1) translateY(0)';
                        e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
                      }}
                    >
                      🔥 START COOKING
                    </button>
                  )}

                  {(isCooking || cookingProgress > 0) && (
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      right: '20px'
                    }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#991b1b',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                        {isCooking ? '🔥 Cooking...' : isResting ? '⏱️ Resting...' : '✓ Done!'}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '14px',
                        backgroundColor: '#fee2e2',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          width: `${isCooking ? cookingProgress : isResting ? restingProgress : 100}%`,
                          height: '100%',
                          background: isCooking ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                          transition: 'width 0.4s ease',
                          borderRadius: '8px',
                          boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
                        }} />
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#991b1b',
                        textAlign: 'center',
                        marginTop: '5px',
                        fontWeight: '600'
                      }}>
                        {Math.round(isCooking ? cookingProgress : isResting ? restingProgress : 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Serving Area - Phase-based styling */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'serving-area')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'serving-area')}
                  className={`drop-zone ${hoveredZone === 'serving-area' ? 'hovered' : ''} ${isServingPhase ? 'focused-area' : ''} ${!isServingPhase ? 'dimmed-area' : ''}`}
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '18px',
                    padding: '28px',
                    border: isServingPhase ? '3px dashed #f59e0b' : '3px dashed #d1d5db',
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: isServingPhase ? '#92400e' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ fontSize: '22px' }}>🍽️</span>
                    Serving Area
                  </div>

                  <svg width="140" height="140" viewBox="0 0 160 160">
                    <ellipse cx="80" cy="135" rx="65" ry="10" fill="#4b5563" opacity="0.2" />
                    <ellipse cx="80" cy="80" rx="70" ry="18" fill="#d1d5db" />
                    <ellipse cx="80" cy="78" rx="68" ry="17" fill="#e5e7eb" />
                    <ellipse cx="80" cy="75" rx="65" ry="16" fill="#f3f4f6" />
                    <ellipse cx="80" cy="73" rx="60" ry="15" fill="white" />
                    <ellipse cx="80" cy="73" rx="50" ry="12" fill="#f9fafb" />
                    <ellipse cx="65" cy="68" rx="15" ry="4" fill="white" opacity="0.6" />
                  </svg>

                  {isServed && (
                    <div style={{
                      position: 'absolute',
                      top: '90px',
                      fontSize: '64px',
                      animation: 'bounceIn 0.6s ease-out'
                    }}>
                      🍚
                    </div>
                  )}

                  {cookingProgress === 100 && !isResting && !isServed && (
                    <div style={{
                      marginTop: '16px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#92400e',
                      textAlign: 'center',
                      animation: 'pulse 2s infinite',
                      backgroundColor: '#fef3c7',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: '3px solid #fbbf24'
                    }}>
                      🥄 Drag rice paddle here to serve!
                    </div>
                  )}

                  {isResting && (
                    <div style={{
                      marginTop: '16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#92400e',
                      textAlign: 'center',
                      backgroundColor: '#fef3c7',
                      padding: '10px 16px',
                      borderRadius: '12px'
                    }}>
                      ⏱️ Rice is resting...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Box>

        {/* Single Control Bar - Enhanced with Next Level button */}
        <Box sx={{
          position: 'fixed',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          padding: '10px 20px',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          zIndex: 1000,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <Button
            onClick={resetGame}
            variant="contained"
            startIcon={<span>🔄</span>}
            sx={{
              backgroundColor: '#667eea',
              borderRadius: '16px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              '&:hover': { 
                backgroundColor: '#5568d3',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Reset
          </Button>
          
          <Button
            onClick={() => navigate('/homepage')}
            variant="contained"
            startIcon={<span>🏠</span>}
            sx={{
              backgroundColor: '#2196F3',
              borderRadius: '16px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '700',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
              '&:hover': { 
                backgroundColor: '#1976D2',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Home
          </Button>

          {gameComplete && (
            <Button
              onClick={() => navigate('/lesson/cooking/level-5')}
              variant="contained"
              startIcon={<span>🚀</span>}
              sx={{
                backgroundColor: '#4CAF50',
                borderRadius: '16px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '700',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                '&:hover': { 
                  backgroundColor: '#45a049',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                },
                animation: 'pulse 2s infinite',
                transition: 'all 0.3s ease'
              }}
            >
              Next Level
            </Button>
          )}
        </Box>

        {/* Feedback Message - Enhanced */}
        {showFeedback && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
            color: 'white',
            padding: '20px 32px',
            borderRadius: '16px',
            fontSize: '17px',
            fontWeight: '700',
            zIndex: 2000,
            boxShadow: '0 12px 40px rgba(76, 175, 80, 0.5)',
            animation: 'bounceIn 0.4s ease-out',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}>
            {feedbackMessage}
          </div>
        )}
      </Box>
    </div>
  );
}

function ChecklistItem({ completed, text }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 10px',
      backgroundColor: completed ? '#f0fdf4' : '#f9fafb',
      borderRadius: '10px',
      border: `2px solid ${completed ? '#86efac' : '#e5e7eb'}`,
      transition: 'all 0.3s ease'
    }}>
      <span style={{ 
        fontSize: '16px',
        color: completed ? '#059669' : '#9ca3af'
      }}>
        {completed ? '✓' : '○'}
      </span>
      <span style={{ 
        fontSize: '12px',
        color: completed ? '#166534' : '#6b7280',
        fontWeight: completed ? '600' : '500'
      }}>
        {text}
      </span>
    </div>
  );
}