import React, { useState, useEffect } from 'react';
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
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Import ingredient preparation images
import springOnionImg from "../../assets/cookingLevel2/spring-onion.png";
import springOnionChoppedImg from "../../assets/cookingLevel2/spring-onion-chopped.png";
import eggImg from "../../assets/cookingLevel2/egg.png";
import eggCrackedImg from "../../assets/cookingLevel2/egg-cracked.png";
import saltImg from "../../assets/cookingLevel2/salt.png";
import saltPouringImg from "../../assets/cookingLevel2/salt-pouring.png";

export default function IngredientPrepLevel2() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();

  // Sequential ingredient flow
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState(0);
  const [springOnionChops, setSpringOnionChops] = useState(0);
  const [eggCracked, setEggCracked] = useState(false);
  const [saltShakes, setSaltShakes] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Simple animation states
  const [onionAnimation, setOnionAnimation] = useState(false);
  const [eggAnimation, setEggAnimation] = useState(false);
  const [saltAnimation, setSaltAnimation] = useState(false);
  
  // Progress tracking
  const [completedTasks, setCompletedTasks] = useState({
    onion: false,
    egg: false,
    salt: false
  });

  const requiredChops = 5;
  const requiredShakes = 3;
  
  // Ingredients data
  const ingredients = [
    {
      id: 'onion',
      name: 'Spring Onion',
      beforeImage: springOnionImg || '🧅',
      afterImage: springOnionChoppedImg || '🥗',
      actionText: 'Tap to Chop',
      progressText: `${springOnionChops}/${requiredChops} chops`,
      encouragement: 'Keep chopping!'
    },
    {
      id: 'egg', 
      name: 'Egg',
      beforeImage: eggImg || '🥚',
      afterImage: eggCrackedImg || '🍳',
      actionText: 'Tap to Crack',
      progressText: eggCracked ? 'Cracked into bowl' : 'Ready to crack',
      encouragement: 'Crack into bowl!'
    },
    {
      id: 'salt',
      name: 'Salt', 
      beforeImage: saltImg || '🧂',
      afterImage: saltPouringImg || '🌨️',
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
    
    // Show confetti when ingredient is completed, then auto-progress
    if (currentIngredientIndex === 0 && newCompletedTasks.onion && !completedTasks.onion) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentIngredientIndex(1);
      }, 2000);
    } else if (currentIngredientIndex === 1 && newCompletedTasks.egg && !completedTasks.egg) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setCurrentIngredientIndex(2);
      }, 2000);
    } else if (currentIngredientIndex === 2 && newCompletedTasks.salt && !completedTasks.salt) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setShowCompletion(true);
      }, 2000);
    }
  }, [springOnionChops, eggCracked, saltShakes, currentIngredientIndex, completedTasks]);

  // Handle ingredient interactions
  const handleIngredientAction = () => {
    if (getCurrentIngredientCompleted()) return;
    
    if (currentIngredientIndex === 0) {
      // Onion chopping
      setOnionAnimation(true);
      setSpringOnionChops(prev => prev + 1);
      setTimeout(() => setOnionAnimation(false), 300);
    } else if (currentIngredientIndex === 1) {
      // Egg cracking
      setEggAnimation(true);
      setTimeout(() => {
        setEggCracked(true);
        setEggAnimation(false);
      }, 500);
    } else if (currentIngredientIndex === 2) {
      // Salt shaking
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
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercentage = ((currentIngredientIndex + (getCurrentIngredientCompleted() ? 1 : 0)) / totalIngredients) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFE0B2, #FFCC02, #FF8F00)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
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
            Ingredient Preparation
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
              backgroundColor: getCurrentIngredientCompleted() ? '#E8F5E8' : 'white',
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
              boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
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
                transform: (onionAnimation && currentIngredientIndex === 0) ? 'rotate(5deg)' :
                          (eggAnimation && currentIngredientIndex === 1) ? 'rotate(2deg)' :
                          (saltAnimation && currentIngredientIndex === 2) ? 'rotate(-10deg)' : 'rotate(0deg)',
                transition: 'all 0.3s ease'
              }}>
                {/* Show appropriate image */}
                {(() => {
                  const imageToShow = getCurrentIngredientCompleted() ? currentIngredient.afterImage : currentIngredient.beforeImage;
                  
                  if (typeof imageToShow === 'string' && imageToShow.includes('.png')) {
                    return (
                      <img 
                        src={imageToShow}
                        alt={currentIngredient.name}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'contain'
                        }}
                      />
                    );
                  } else {
                    return (
                      <span style={{ fontSize: '80px' }}>
                        {imageToShow}
                      </span>
                    );
                  }
                })()}
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
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>
                    {typeof ingredient.afterImage === 'string' && ingredient.afterImage.includes('.png') ? '✅' : ingredient.afterImage}
                  </span>
                  <span style={{ color: '#2E7D32', fontWeight: 'bold' }}>
                    {ingredient.name} ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={resetGame}
            style={{
              backgroundColor: '#FF8F00',
              color: 'white',
              fontWeight: 'bold',
              padding: '15px 30px',
              borderRadius: '15px',
              fontSize: '18px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#F57C00'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#FF8F00'}
          >
            🔄 Start Over
          </button>
        </div>

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
                Great Job!
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
                Now you're ready for the cooking stage!
              </p>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button 
                  onClick={() => setShowCompletion(false)}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '15px 25px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  🎉 Continue
                </button>
                
                <button 
                  onClick={resetGame}
                  style={{
                    backgroundColor: 'white',
                    color: '#FF8F00',
                    fontWeight: 'bold',
                    padding: '15px 25px',
                    borderRadius: '10px',
                    fontSize: '16px',
                    border: '2px solid #FF8F00',
                    cursor: 'pointer',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}