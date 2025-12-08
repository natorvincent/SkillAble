import React, { useState, useEffect } from 'react';
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
// Import Baconardo
import baconardoImg from "../../assets/cookingLevel3/Baconardo.png";

// Import ingredient images
import eggImg from "../../assets/cookingLevel1/egg.png";
import oilImg from "../../assets/cookingLevel1/oil.png";
import saltImg from "../../assets/cookingLevel1/salt.png";
import butterImg from "../../assets/cookingLevel1/butter.png";
import milkImg from "../../assets/cookingLevel1/milk.png";
import breadImg from "../../assets/cookingLevel1/bread.png";
import cheeseImg from "../../assets/cookingLevel1/cheese.png";

// Import services for progress tracking
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

export default function FriedEggLevel1() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [collectedIngredients, setCollectedIngredients] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [wrongIngredientAlert, setWrongIngredientAlert] = useState(false);
  const [hoveredIngredient, setHoveredIngredient] = useState(null);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [baconardoMessage, setBaconardoMessage] = useState('Welcome to Fried Egg Basics! I\'m Chef Baconardo! 🥓');
  const [baconardoAnimation, setBaconardoAnimation] = useState('idle');
  const [showIntro, setShowIntro] = useState(true);

  const correctIngredients = [
    { id: 1, name: "EGG", image: eggImg, description: "Fresh egg for frying", isCorrect: true },
    { id: 2, name: "OIL", image: oilImg, description: "Oil to prevent sticking", isCorrect: true },
    { id: 3, name: "SALT", image: saltImg, description: "Salt for seasoning", isCorrect: true },
    { id: 4, name: "BUTTER", image: butterImg, description: "Butter for extra flavor", isCorrect: true }
  ];

  const wrongIngredients = [
    { id: 5, name: "MILK", image: milkImg, isCorrect: false, hint: "Milk is not needed for a fried egg" },
    { id: 6, name: "BREAD", image: breadImg, isCorrect: false, hint: "Bread is not an ingredient for frying eggs" },
    { id: 7, name: "CHEESE", image: cheeseImg, isCorrect: false, hint: "Cheese is not required for a basic fried egg" }
  ];

  const allIngredients = [...correctIngredients, ...wrongIngredients];
  const progressPercentage = (collectedIngredients.length / correctIngredients.length) * 100;
  const allCollected = collectedIngredients.length === correctIngredients.length;

  // Positions for ingredients inside the pan
  const getPanIngredientPosition = (index, total) => {
    const positions = [
      { top: '30%', left: '30%', rotation: -5 },  // Egg - center left
      { top: '25%', right: '30%', rotation: 5 },   // Oil - center right  
      { top: '60%', left: '40%', rotation: -3 },   // Salt - bottom left
      { top: '55%', right: '40%', rotation: 3 }    // Butter - bottom right
    ];
    return positions[index] || { top: '50%', left: '50%', rotation: 0 };
  };

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

  // Save progress to backend
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      const finalScore = 4; // 4 correct ingredients
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: 4,
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

  const playSound = (type) => {
    if (!autoPlayEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'correct') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    } catch (e) {}
  };

  const triggerCorrectAnimation = () => {
    setShowCorrectAnimation(true);
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        animationDelay: Math.random() * 2,
        backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9800', '#4CAF50'][Math.floor(Math.random() * 8)]
      });
    }
    setConfettiPieces(pieces);
    setTimeout(() => {
      setShowCorrectAnimation(false);
      setConfettiPieces([]);
    }, 2000);
  };

  // Baconardo feedback functions
  const showBaconardoFeedback = (message, animation = 'idle', duration = 3000) => {
    setBaconardoMessage(message);
    setBaconardoAnimation(animation);
    setTimeout(() => {
      if (!allCollected && animation !== 'celebrate') {
        setBaconardoMessage(`Find the remaining ingredients! ${correctIngredients.length - collectedIngredients.length} more to go!`);
      }
      setBaconardoAnimation('idle');
    }, duration);
  };

  const handleDragStart = (e, ingredient) => {
    setDraggedItem(ingredient);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem) {
      if (!draggedItem.isCorrect) {
        setWrongIngredientAlert(true);
        playSound('wrong');
        
        // Baconardo feedback for wrong ingredient
        showBaconardoFeedback(`❌ Oops! ${draggedItem.hint}`, 'shake');
        
        setTimeout(() => setWrongIngredientAlert(false), 3000);
        setDraggedItem(null);
        return;
      }
      if (collectedIngredients.some(item => item.id === draggedItem.id)) {
        showBaconardoFeedback('You already added that ingredient! Try a different one!', 'shake');
        setDraggedItem(null);
        return;
      }
      setCollectedIngredients(prev => [...prev, draggedItem]);
      triggerCorrectAnimation();
      playSound('correct');
      
      // Baconardo feedback for correct ingredient
      showBaconardoFeedback(`✅ Excellent! ${draggedItem.name} is a great choice for fried eggs!`, 'nod');
      
      if (collectedIngredients.length + 1 === correctIngredients.length) {
        setTimeout(() => {
          setShowCelebration(true);
          showBaconardoFeedback('🎉 Outstanding! You found all the perfect ingredients for a delicious fried egg!', 'celebrate', 5000);
          saveProgress();
        }, 1500);
      }
    }
    setDraggedItem(null);
  };

  const resetGame = () => {
    setCollectedIngredients([]);
    setShowCelebration(false);
    setShowCorrectAnimation(false);
    setConfettiPieces([]);
    setWrongIngredientAlert(false);
    setProgressSaved(false);
    setProgressSaving(false);
    showBaconardoFeedback('Let\'s try again! Find egg, oil, salt, and butter for the perfect fried egg! 🍳', 'idle');
  };

  // Match Level 3 navigation functions
  const goToHomepage = () => {
    if (navigate) {
      navigate('/studentdashboard');
    } else {
      window.location.href = '/studentdashboard';
    }
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    setTimeout(() => {
      // Navigate to Level 2 (fried-egg-level2)
      navigate('/lesson/cooking/level-2');
    }, 300);
  };

  // IMPROVED: Higher ingredient positions for better visibility
  const getIngredientPosition = (index) => {
    const positions = [
      { bottom: '22%', left: '8%' },    // Higher up
      { bottom: '32%', right: '10%' },   // Higher up
      { bottom: '26%', left: '72%' },    // Higher up
      { bottom: '38%', right: '58%' },   // Higher up
      { bottom: '20%', left: '42%' },    // Higher up
      { bottom: '34%', right: '35%' },   // Higher up
      { bottom: '24%', left: '86%' }     // Higher up
    ];
    return positions[index];
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: kitchenBg ? `url(${kitchenBg})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
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
              <h2 style={{ margin: 0, fontSize: '28px' }}>Welcome to Cooking Level 1!</h2>
              <div style={{ fontSize: '40px' }}>🍳</div>
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
                  Fried Egg Time! 🥓
                </h3>
                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#5D4037' }}>
                  "Hello! I'm Chef Baconardo! Let's cook the perfect fried egg together! 
                  I'll guide you through selecting the right ingredients. Look for egg, oil, salt, and butter!"
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
                👉 I'll guide you through each step from the top-right corner!
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
              🚀 Start Cooking!
            </Button>
          </DialogActions>
        </Dialog>

        {/* Sound Toggle Button */}
        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
          <button
            onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
            style={{
              backgroundColor: autoPlayEnabled ? '#4CAF50' : '#FF5722',
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
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title={autoPlayEnabled ? 'Mute sounds' : 'Unmute sounds'}
          >
            {autoPlayEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '10px 15px',
          paddingTop: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '12px',
            width: '100%',
            maxWidth: '1200px'
          }}>
      
            {/* IMPROVED: Progress bar with better z-index handling */}
            <div style={{ 
              maxWidth: '500px', 
              margin: '0 auto',
              position: 'relative',
              zIndex: 5 // Lower z-index to stay behind interactive elements
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: 'white', 
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)' 
                }}>
                  {collectedIngredients.length} / {correctIngredients.length}
                </h2>
              </div>
              
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '50px', 
                background: 'linear-gradient(to right, #2196F3, #1976D2)', 
                borderRadius: '25px', 
                border: '3px solid rgba(255, 255, 255, 0.3)', 
                overflow: 'hidden', 
                boxShadow: '0 6px 20px rgba(33, 150, 243, 0.4)',
                zIndex: 5
              }}>
                <div style={{ 
                  position: 'absolute', 
                  right: '-35px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '50px', 
                  height: '10px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                  borderRadius: '5px', 
                  zIndex: 2 
                }} />
                
                <div style={{ 
                  width: `${progressPercentage}%`, 
                  height: '100%', 
                  background: allCollected 
                    ? 'linear-gradient(to right, #FFD700, #FFA500, #FF8C00)' 
                    : 'linear-gradient(to right, #4CAF50, #66BB6A, #81C784)', 
                  borderRadius: '21px', 
                  transition: 'width 0.6s, background 0.3s', 
                  position: 'relative', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-around', 
                  padding: '0 10px' 
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: '-100%', 
                    width: '100%', 
                    height: '100%', 
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', 
                    animation: 'shimmer 2s infinite' 
                  }} />
                  
                  {collectedIngredients.map((_, index) => (
                    <span key={index} style={{ fontSize: '24px', zIndex: 2 }}>⭐</span>
                  ))}
                </div>
                
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  fontSize: '28px', 
                  zIndex: 3, 
                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <div>
                    {allCollected ? '🎉' : progressPercentage > 75 ? '' : progressPercentage > 50 ? '🥚' : progressPercentage > 25 ? '🫒' : '👨‍🍳'}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    letterSpacing: '0.5px'
                  }}>
                    {allCollected ? 'DONE!' : 'PROGRESS'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '1400px', 
            height: '700px', 
            margin: '0 auto 100px'
          }}>
            {/* Chef Baconardo Character with Speech Bubble - Upper Right, Larger */}
            <div style={{
              position: 'absolute',
              right: '25px',
              top: '10px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '15px',
              animation: baconardoAnimation === 'idle' ? 'baconardoIdle 3s ease-in-out infinite' : 
                         baconardoAnimation === 'nod' ? 'baconardoNod 0.5s ease-out' :
                         baconardoAnimation === 'shake' ? 'baconardoShake 0.5s ease-out' :
                         'baconardoCelebrate 1s ease-out'
            }}>
              {/* Speech Bubble - Softer, more transparent */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.8))',
                backdropFilter: 'blur(12px)',
                borderRadius: '20px',
                padding: '14px 20px',
                maxWidth: '240px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                animation: 'speechBubblePop 0.3s ease-out'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: '#2d3748',
                  lineHeight: '1.5',
                  textAlign: 'left',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                }}>
                  {baconardoMessage}
                </p>
                {/* Speech Bubble Triangle - Softer style */}
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  right: '-9px',
                  width: 0,
                  height: 0,
                  borderTop: '9px solid transparent',
                  borderBottom: '9px solid transparent',
                  borderLeft: '10px solid rgba(255, 255, 255, 0.85)',
                  filter: 'drop-shadow(2px 0 2px rgba(0, 0, 0, 0.1))'
                }} />
              </div>
              
              {/* Chef Baconardo Character Image */}
              <img 
                src={baconardoImg}
                alt="Chef Baconardo"
                style={{
                  width: '110px',
                  height: '110px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Chef Baconardo - Your cooking instructor!"
              />
            </div>

            {/* Subtle inventory area indicator */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.6), rgba(33, 150, 243, 0.6), rgba(156, 39, 176, 0.6))',
              borderRadius: '2px',
              boxShadow: '0 0 20px rgba(76, 175, 80, 0.4), 0 0 40px rgba(33, 150, 243, 0.3)',
              animation: 'glow 3s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              fontWeight: '600',
              letterSpacing: '1px'
            }}>
              INGREDIENT INVENTORY
            </div>

            {/* IMPROVED: Frying pan with actual ingredient icons */}
            <div
              data-pan="true"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                position: 'absolute',
                left: '50%',
                top: '45%',
                transform: 'translate(-50%, -50%)',
                width: '280px',
                height: '280px',
                background: allCollected 
                  ? 'radial-gradient(circle, #FFD700, #FFA500)' 
                  : 'radial-gradient(circle, #3F3F3F, #1A1A1A)',
                borderRadius: '50%',
                border: '14px solid #444',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: allCollected 
                  ? 'inset 0 12px 24px rgba(0,0,0,0.4), 0 0 60px rgba(255, 215, 0, 0.8)' 
                  : 'inset 0 12px 24px rgba(0,0,0,0.4), 0 0 40px rgba(76, 175, 80, 0.6), 0 0 80px rgba(76, 175, 80, 0.4)',
                zIndex: 20, // Higher z-index to stay above progress bar
                transition: 'all 0.3s',
                animation: allCollected ? 'none' : 'panPulse 2s ease-in-out infinite',
                overflow: 'hidden'
              }}
            >
              {/* Display collected ingredients inside the pan */}
              {collectedIngredients.map((ingredient, index) => {
                const position = getPanIngredientPosition(index, collectedIngredients.length);
                return (
                  <div
                    key={ingredient.id}
                    style={{
                      position: 'absolute',
                      ...position,
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'ingredientPopIn 0.5s ease-out forwards',
                      transform: `rotate(${position.rotation}deg)`,
                      zIndex: 21
                    }}
                  >
                    <img 
                      src={ingredient.image}
                      alt={ingredient.name}
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))',
                      }}
                    />
                  </div>
                );
              })}

              {/* Default pan content when no ingredients */}
              {collectedIngredients.length === 0 && (
                <>
                  <div style={{ 
                    fontSize: '130px', 
                    marginBottom: '12px', 
                    filter: 'drop-shadow(3px 3px 8px rgba(0,0,0,0.6))',
                    zIndex: 21
                  }}>
                  
                  </div>
                  <div style={{ 
                    color: 'white', 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                    zIndex: 21
                  }}>
                  Drop here
                  </div>
                </>
              )}

              {/* Success message when all collected */}
              {allCollected && (
                <div style={{ 
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white', 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
                  zIndex: 21,
                  animation: 'pulse 2s infinite'
                }}>
                  ✨ Perfect! ✨
                </div>
              )}
            </div>

            {/* IMPROVED: Ingredients with higher z-index and better positioning */}
            {allIngredients.filter(ing => !collectedIngredients.some(c => c.id === ing.id)).map((ingredient, index) => {
              const position = getIngredientPosition(index);
              const isHovered = hoveredIngredient === ingredient.id;
              
              return (
                <div
                  key={ingredient.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, ingredient)}
                  onMouseEnter={() => setHoveredIngredient(ingredient.id)}
                  onMouseLeave={() => setHoveredIngredient(null)}
                  onClick={() => {
                    if (!ingredient.isCorrect) {
                      setWrongIngredientAlert(true);
                      playSound('wrong');
                      showBaconardoFeedback(`❌ ${ingredient.hint}`, 'shake');
                      setTimeout(() => setWrongIngredientAlert(false), 3000);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    ...position,
                    cursor: 'grab',
                    userSelect: 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: isHovered ? 30 : 25, // Higher z-index than pan
                    padding: '12px',
                    background: isHovered 
                      ? 'rgba(255, 255, 255, 0.25)' 
                      : 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: isHovered 
                      ? '0 20px 50px rgba(0, 0, 0, 0.35), 0 8px 20px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.5)' 
                      : '0 8px 25px rgba(0, 0, 0, 0.2), 0 3px 10px rgba(0, 0, 0, 0.15)',
                    transform: isHovered ? 'scale(1.15) translateY(-20px)' : 'scale(1)',
                    border: isHovered 
                      ? (ingredient.isCorrect 
                          ? '2px solid rgba(76, 175, 80, 0.8)' 
                          : '2px solid rgba(244, 67, 54, 0.8)') 
                      : '1px solid rgba(255, 255, 255, 0.3)',
                    width: '70px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: isHovered ? 'floatBounce 0.6s ease-out' : 'none'
                  }}
                >
                  {isHovered && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)', 
                      width: '140px', 
                      height: '140px', 
                      borderRadius: '50%', 
                      border: ingredient.isCorrect 
                        ? '4px solid rgba(76, 175, 80, 0.8)' 
                        : '4px solid rgba(244, 67, 54, 0.8)' 
                    }} />
                  )}
                  
                  <img 
                    src={ingredient.image}
                    alt={ingredient.name}
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.5))',
                      position: 'relative',
                      zIndex: 2
                    }}
                  />
                  
                  {/* IMPROVED: Clearer visual feedback - only show checkmark when collected */}
                  {collectedIngredients.some(c => c.id === ingredient.id) ? (
                    <div style={{ 
                      position: 'absolute', 
                      top: '-5px', 
                      right: '-5px', 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: 'rgba(76, 175, 80, 0.95)', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)', 
                      border: '2px solid rgba(255, 255, 255, 0.9)', 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      zIndex: 3
                    }}>
                      ✓
                    </div>
                  ) : (
                    <div style={{ 
                      position: 'absolute', 
                      top: '-5px', 
                      right: '-5px', 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundColor: ingredient.isCorrect 
                        ? 'rgba(76, 175, 80, 0.3)'  // Dimmer for uncollected correct items
                        : 'rgba(244, 67, 54, 0.3)', // Dimmer for wrong items
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)', 
                      border: '2px solid rgba(255, 255, 255, 0.5)', 
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'rgba(255, 255, 255, 0.7)',
                      zIndex: 3
                    }}>
                      {ingredient.isCorrect ? '?' : '✗'}
                    </div>
                  )}
                  
                  {isHovered && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '-50px', 
                      left: '50%', 
                      transform: 'translateX(-50%)', 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '12px', 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      animation: 'fadeInDown 0.3s ease-out',
                      zIndex: 35 // Highest z-index for tooltips
                    }}>
                      {ingredient.name}
                      <div style={{
                        fontSize: '11px',
                        fontWeight: 'normal',
                        marginTop: '2px',
                        opacity: 0.9
                      }}>
                        {collectedIngredients.some(c => c.id === ingredient.id) 
                          ? '✓ Collected' 
                          : ingredient.isCorrect ? '✓ Needed' : '✗ Not needed'
                        }
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Floating Bottom Control Bar */}
          <Box sx={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100, // Highest z-index for controls
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
              onClick={() => showBaconardoFeedback('Look for egg, oil, salt, and butter! Avoid milk, bread, and cheese! Remember: simple is delicious! 🥓', 'nod')}
              variant="contained"
              size="medium"
              startIcon={<span style={{ fontSize: '18px' }}>💡</span>}
              sx={{
                backgroundColor: '#2196F3',
                borderRadius: '20px',
                minWidth: '100px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 0 #1565C0, 0 6px 20px rgba(33, 150, 243, 0.4)',
                '&:hover': { 
                  backgroundColor: '#1976D2', 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 0 #1565C0, 0 8px 25px rgba(33, 150, 243, 0.5)'
                },
                '&:active': {
                  transform: 'translateY(2px)',
                  boxShadow: '0 2px 0 #1565C0, 0 3px 10px rgba(33, 150, 243, 0.3)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Help
            </Button>
            
            <Button
              onClick={resetGame}
              variant="contained"
              size="medium"
              startIcon={<span style={{ fontSize: '18px' }}>🔄</span>}
              sx={{
                backgroundColor: '#FF9800',
                borderRadius: '20px',
                minWidth: '100px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 0 #E65100, 0 6px 20px rgba(255, 152, 0, 0.4)',
                '&:hover': { 
                  backgroundColor: '#F57C00', 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 0 #E65100, 0 8px 25px rgba(255, 152, 0, 0.5)'
                },
                '&:active': {
                  transform: 'translateY(2px)',
                  boxShadow: '0 2px 0 #E65100, 0 3px 10px rgba(255, 152, 0, 0.3)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Reset
            </Button>
            
            <Button
              onClick={goToHomepage}
              variant="contained"
              size="medium"
              startIcon={<span style={{ fontSize: '18px' }}>🏠</span>}
              sx={{
                backgroundColor: '#9C27B0',
                borderRadius: '20px',
                minWidth: '100px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 0 #6A1B9A, 0 6px 20px rgba(156, 39, 176, 0.4)',
                '&:hover': { 
                  backgroundColor: '#7B1FA2', 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 0 #6A1B9A, 0 8px 25px rgba(156, 39, 176, 0.5)'
                },
                '&:active': {
                  transform: 'translateY(2px)',
                  boxShadow: '0 2px 0 #6A1B9A, 0 3px 10px rgba(156, 39, 176, 0.3)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Home
            </Button>

            {allCollected && (
              <Button
                onClick={continueToNextLevel}
                disabled={progressSaving}
                variant="contained"
                size="medium"
                startIcon={<span style={{ fontSize: '18px' }}>🚀</span>}
                sx={{
                  backgroundColor: '#4CAF50',
                  borderRadius: '20px',
                  minWidth: '120px',
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 0 #2E7D32, 0 6px 20px rgba(76, 175, 80, 0.4)',
                  '&:hover': { 
                    backgroundColor: '#45a049', 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 0 #2E7D32, 0 8px 25px rgba(76, 175, 80, 0.5)'
                  },
                  '&:active': {
                    transform: 'translateY(2px)',
                    boxShadow: '0 2px 0 #2E7D32, 0 3px 10px rgba(76, 175, 80, 0.3)'
                  },
                  animation: 'pulse 2s infinite',
                  transition: 'all 0.2s ease'
                }}
              >
                {progressSaving ? 'Saving...' : 'Next Level'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Wrong Alert */}
      {wrongIngredientAlert && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 9999, 
          backgroundColor: '#f44336', 
          color: 'white', 
          padding: '16px 24px', 
          borderRadius: '12px', 
          boxShadow: '0 8px 24px rgba(244, 67, 54, 0.5)', 
          border: '3px solid rgba(255, 255, 255, 0.3)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <span style={{ fontSize: '32px' }}>❌</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Wrong! Try again.</span>
        </div>
      )}

      {/* Correct Animation */}
      {showCorrectAnimation && (
        <>
          {confettiPieces.map((piece) => (
            <div 
              key={piece.id} 
              style={{ 
                position: 'fixed', 
                top: '-10px', 
                left: `${piece.left}%`, 
                width: `${Math.random() * 8 + 4}px`, 
                height: `${Math.random() * 8 + 4}px`, 
                backgroundColor: piece.backgroundColor, 
                zIndex: 9999, 
                borderRadius: Math.random() > 0.5 ? '50%' : '0%', 
                animation: `confettiFall ${Math.random() * 2 + 2}s linear forwards`, 
                animationDelay: `${piece.animationDelay}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: Math.random() * 0.8 + 0.2
              }} 
            />
          ))}
        </>
      )}

      {/* Success Modal */}
      {showCelebration && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          zIndex: 9998, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '20px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '20px', 
            padding: '40px', 
            maxWidth: '500px', 
            width: '100%', 
            textAlign: 'center', 
            border: '4px solid #FF9800', 
            boxShadow: '0 20px 40px rgba(255, 152, 0, 0.4)',
            background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '20px', animation: 'bounce 2s infinite' }}>🍳</div>
            
            <h2 style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              background: 'linear-gradient(45deg, #FF9800, #F57C00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '20px' 
            }}>
              Perfect Fried Egg!
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {[...Array(3)].map((_, i) => (<span key={i} style={{ fontSize: '48px', animation: 'pulse 2s infinite', animationDelay: `${i * 0.2}s` }}>⭐</span>))}
            </div>
            
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#8B4513', 
              marginBottom: '20px' 
            }}>
              Chef Baconardo Approves! 🥓
            </h3>
            
            <p style={{ 
              fontSize: '18px', 
              color: '#5D4037', 
              lineHeight: 1.8, 
              marginBottom: '20px',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              padding: '15px',
              borderRadius: '12px',
              border: '2px solid #FF9800'
            }}>
              You selected all the perfect ingredients for a delicious fried egg! You understood which items are essential for cooking and avoided the unnecessary ones. That's excellent kitchen knowledge!
            </p>

            <div style={{
              backgroundColor: '#E8F5E8',
              padding: '15px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '2px solid #4CAF50'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#2E7D32',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>✓ Ingredients Collected:</span>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#1B5E20',
                lineHeight: '1.8'
              }}>
                🥚 Egg • 🫒 Oil • 🧂 Salt • 🧈 Butter
              </div>
            </div>

            {progressSaving && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: 'rgba(255, 152, 0, 0.9)', 
                borderRadius: '12px', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                fontWeight: '600'
              }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                <Typography variant="body2">Saving your cooking progress...</Typography>
              </Box>
            )}
            
            {progressSaved && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                backgroundColor: 'rgba(76, 175, 80, 0.9)', 
                borderRadius: '12px', 
                color: 'white',
                fontWeight: '600'
              }}>
                ✅ Achievement unlocked! Progress saved!
              </Box>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '20px' }}>
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
                  fontWeight: '700',
                  textTransform: 'none',
                  '&:hover': {
                    borderWidth: '2px',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)'
                  }
                }}
              >
                🔄 Play Again
              </Button>
              
              <Button 
                onClick={continueToNextLevel}
                disabled={progressSaving}
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#FF9800',
                  borderRadius: '15px',
                  minWidth: '140px',
                  fontWeight: '700',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                  '&:hover': { 
                    backgroundColor: '#F57C00',
                    boxShadow: '0 6px 16px rgba(255, 152, 0, 0.5)'
                  }
                }}
              >
                {progressSaving ? 'Saving...' : '🚀 Level 2'}
              </Button>

              <Button 
                onClick={goToHomepage}
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: '#8B4513',
                  borderRadius: '15px',
                  minWidth: '120px',
                  fontWeight: '700',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#654321' }
                }}
              >
                🏠 Go Home
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-10px) rotateZ(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotateZ(720deg); opacity: 0; }
        }
        @keyframes correctPop {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes fadeInDown {
          0% { 
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          100% { 
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        @keyframes glow {
          0%, 100% { 
            opacity: 0.6;
            boxShadow: 0 0 20px rgba(76, 175, 80, 0.4), 0 0 40px rgba(33, 150, 243, 0.3);
          }
          50% { 
            opacity: 1;
            boxShadow: 0 0 30px rgba(76, 175, 80, 0.6), 0 0 60px rgba(33, 150, 243, 0.5);
          }
        }
        @keyframes panPulse {
          0%, 100% {
            boxShadow: inset 0 12px 24px rgba(0,0,0,0.4), 0 0 40px rgba(76, 175, 80, 0.6), 0 0 80px rgba(76, 175, 80, 0.4);
          }
          50% {
            boxShadow: inset 0 12px 24px rgba(0,0,0,0.4), 0 0 60px rgba(76, 175, 80, 0.8), 0 0 100px rgba(76, 175, 80, 0.6);
          }
        }
        @keyframes floatBounce {
          0% { transform: translateY(0) scale(1); }
          30% { transform: translateY(-25px) scale(1.15); }
          50% { transform: translateY(-20px) scale(1.15); }
          70% { transform: translateY(-25px) scale(1.15); }
          100% { transform: translateY(-20px) scale(1.15); }
        }
        @keyframes baconardoIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes baconardoNod {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(3px) rotate(3deg); }
        }
        @keyframes baconardoShake {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(0) rotate(-3deg); }
          75% { transform: translateY(0) rotate(3deg); }
        }
        @keyframes baconardoCelebrate {
          0%, 100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-8px) scale(1.1) rotate(-8deg); }
          75% { transform: translateY(-8px) scale(1.1) rotate(8deg); }
        }
        @keyframes speechBubblePop {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ingredientPopIn {
          0% { 
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          70% { 
            transform: scale(1.1) rotate(var(--rotation, 0deg));
            opacity: 0.8;
          }
          100% { 
            transform: scale(1) rotate(var(--rotation, 0deg));
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}