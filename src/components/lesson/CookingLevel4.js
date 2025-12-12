import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  Dialog,
  LinearProgress,
  Paper,
  Stack 
} from '@mui/material';
import { Droplet, Sparkles, ChefHat, Clock, Thermometer, ArrowRight, RotateCcw, Target, CheckCircle } from 'lucide-react';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import Confetti from 'react-confetti';
import confetti from 'canvas-confetti';

// Import realistic kitchen background
import kitchenBg from "../../assets/cookingLevel3/bgkitchen.jpg";
import baconardoImg from "../../assets/cookingLevel3/Baconardo.png";

// Import realistic kitchen assets
import countertopImg from "../../assets/cookingLevel4/countertop.png";
import sinkImg from "../../assets/cookingLevel4/sink.png";
import riceCookerImg from "../../assets/cookingLevel4/rice-cooker.png";
import cookingPotImg from "../../assets/cookingLevel4/cooking-pot.png";
import riceBagImg from "../../assets/cookingLevel4/rice-bag.png";
import waterBottleImg from "../../assets/cookingLevel4/water-bottle.png";
import ricePaddleImg from "../../assets/cookingLevel4/rice-paddle.png";

// Progress service imports
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Asset preloader component
const AssetPreloader = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  
  // All game assets to preload
  const assets = [
    kitchenBg,
    baconardoImg,
    countertopImg,
    sinkImg,
    riceCookerImg,
    cookingPotImg,
    riceBagImg,
    waterBottleImg,
    ricePaddleImg
  ];
  
  useEffect(() => {
    let completed = 0;
    
    const loadAsset = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          completed++;
          setLoadedCount(completed);
          setProgress(Math.round((completed / assets.length) * 100));
          resolve();
        };
        img.onerror = () => {
          completed++;
          setLoadedCount(completed);
          setProgress(Math.round((completed / assets.length) * 100));
          resolve(); // Continue even if some images fail
        };
        img.src = src;
        
        // Force preload by loading image
        if (img.complete) {
          completed++;
          setLoadedCount(completed);
          setProgress(Math.round((completed / assets.length) * 100));
          resolve();
        }
      });
    };
    
    const preloadAll = async () => {
      // Preload all assets in parallel
      await Promise.all(assets.map(loadAsset));
      
      // Add a small delay to ensure all images are cached
      setTimeout(() => {
        onLoadComplete();
      }, 300);
    };
    
    preloadAll();
  }, [assets.length, onLoadComplete]);
  
  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.95) 0%, rgba(160, 82, 45, 0.95) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      zIndex: 9999
    }}>
      <Box sx={{ width: '80%', maxWidth: '400px', mb: 4 }}>
        <Typography variant="h4" sx={{ color: 'white', mb: 3, textAlign: 'center', fontFamily: 'Poppins' }}>
          Loading Perfect Rice Cooking...
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 12, 
            borderRadius: 6,
            backgroundColor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #8B4513 0%, #A0522D 50%, #D2691E 100%)',
              borderRadius: 6
            }
          }} 
        />
        <Typography variant="body2" sx={{ color: 'white', mt: 1, textAlign: 'center' }}>
          {loadedCount}/{assets.length} assets loaded
        </Typography>
      </Box>
      
      {/* Preload hidden images */}
      <Box sx={{ display: 'none' }}>
        {assets.map((src, index) => (
          <img 
            key={index}
            src={src}
            alt="preload"
            onLoad={(e) => {
              // Force browser to cache the image
              e.target.style.visibility = 'hidden';
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

// Asset preloading system
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve({ src, status: 'loaded' });
    img.onerror = (err) => reject({ src, status: 'error', err });
    
    // Force browser to cache by loading now
    document.body.appendChild(img);
    img.style.display = 'none';
    setTimeout(() => {
      if (img.parentNode) {
        img.parentNode.removeChild(img);
      }
      resolve({ src, status: 'loaded' });
    }, 100);
  });
};

// List of all images to preload
const ALL_ASSETS = [
  kitchenBg,
  baconardoImg,
  countertopImg,
  sinkImg,
  riceCookerImg,
  cookingPotImg,
  riceBagImg,
  waterBottleImg,
  ricePaddleImg
];

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
  const [cookerTemperature, setCookerTemperature] = useState(25);
  const [cookerTimer, setCookerTimer] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [gameReady, setGameReady] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const panRef = useRef(null);
  const imageCacheRef = useRef(new Map());

  // Preload all images on component mount
  useEffect(() => {
    let isMounted = true;
    
    const preloadAllAssets = async () => {
      if (!isMounted) return;
      
      try {
        const totalAssets = ALL_ASSETS.length;
        let loadedCount = 0;
        
        // Preload images with progress tracking
        const preloadPromises = ALL_ASSETS.map(async (src, index) => {
          try {
            // Check if already cached
            if (imageCacheRef.current.has(src)) {
              loadedCount++;
              return;
            }
            
            // Create and load image
            const img = new Image();
            
            return new Promise((resolve) => {
              img.onload = () => {
                if (isMounted) {
                  // Cache the image
                  imageCacheRef.current.set(src, {
                    element: img,
                    loaded: true,
                    timestamp: Date.now()
                  });
                  
                  loadedCount++;
                  resolve();
                }
              };
              
              img.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                loadedCount++;
                resolve(); // Continue even if one image fails
              };
              
              // Start loading
              img.src = src;
              
              // Force browser to cache by creating image element
              img.style.display = 'none';
              img.crossOrigin = 'anonymous';
              document.body.appendChild(img);
            });
          } catch (err) {
            console.warn(`Error preloading ${src}:`, err);
            loadedCount++;
          }
        });
        
        // Wait for all images to load or timeout
        await Promise.allSettled([
          ...preloadPromises,
          new Promise(resolve => setTimeout(resolve, 2000)) // Max 2 second timeout
        ]);
        
        if (isMounted) {
          setAssetsLoaded(true);
          setGameReady(true);
        }
      } catch (error) {
        console.error('Error preloading assets:', error);
        if (isMounted) {
          setAssetsLoaded(true);
          setGameReady(true);
        }
      }
    };
    
    preloadAllAssets();
    
    // Cleanup
    return () => {
      isMounted = false;
    };
  }, []);

  // Create confetti pieces when success shows
  useEffect(() => {
    if (showSuccess) {
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        width: Math.random() * 12 + 6,
        height: Math.random() * 12 + 6,
        color: ['#8B4513', '#A0522D', '#D2691E', '#DEB887', '#F5DEB3'][Math.floor(Math.random() * 5)],
        rotation: Math.random() * 360,
        drift: (Math.random() - 0.5) * 2
      }));
      setConfettiPieces(pieces);
      
      // Also trigger canvas confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B4513', '#A0522D', '#D2691E', '#DEB887']
      });
    }
  }, [showSuccess]);

  // Animate stars when success shows
  useEffect(() => {
    if (showSuccess) {
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
  }, [showSuccess]);

  // Get star rating based on performance
  const getStarRating = () => {
    if (mistakes.length === 0 && waterAmount === 'perfect') return 3;
    else if (mistakes.length <= 1) return 2;
    else return 1;
  };

  const riceCookingSteps = [
    { id: 0, instruction: "🍲 Place the cooking pot on the counter", focus: 'setup' },
    { id: 1, instruction: "🌾 Add uncooked rice to the pot", focus: 'setup' },
    { id: 2, instruction: "🚰 Rinse the rice at the sink (2-3 times)", focus: 'preparation' },
    { id: 3, instruction: "💧 Add the perfect amount of water", focus: 'preparation' },
    { id: 4, instruction: "⚡ Place the pot in the rice cooker", focus: 'cooking' },
    { id: 5, instruction: "🔥 Start the cooking process", focus: 'cooking' },
    { id: 6, instruction: "⏱️ Wait for cooking to complete", focus: 'cooking' },
    { id: 7, instruction: "🥄 Serve the cooked rice", focus: 'serving' }
  ];

  // Determine current phase for focus management
  const currentPhase = riceCookingSteps[currentStep]?.focus || 'setup';
  const isSetupPhase = currentPhase === 'setup';
  const isPreparationPhase = currentPhase === 'preparation';
  const isCookingPhase = currentPhase === 'cooking';
  const isServingPhase = currentPhase === 'serving';

  // Realistic cooking effects
  useEffect(() => {
    let interval;
    if (isCooking) {
      interval = setInterval(() => {
        setCookingProgress(prev => {
          if (prev >= 100) {
            setIsCooking(false);
            setIsResting(true);
            setShowSteam(true);
            setCookerTemperature(85); // Keep warm temperature
            return 100;
          }
          // Realistic temperature progression
          const newTemp = 25 + (prev * 0.6); // From 25°C to 85°C
          setCookerTemperature(Math.min(newTemp, 85));
          
          // Realistic timer
          setCookerTimer(prevTimer => prevTimer + 1);
          
          return prev + 1;
        });
      }, 200); // Slower, more realistic cooking
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
            setCookerTemperature(65); // Cooling down
            return 100;
          }
          return prev + 2;
        });
      }, 200);
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
      // Try to persist using provided service functions (guarded calls so we don't fail if signatures differ)
      if (typeof saveStudentLessonProgress === 'function') {
        try {
          // best-effort call; many level implementations only need moduleId/lessonId
          await saveStudentLessonProgress(moduleId, lessonId);
        } catch (err) {
          console.warn('saveStudentLessonProgress failed (non-fatal):', err);
        }
      }
      if (typeof updateModuleProgress === 'function') {
        try {
          await updateModuleProgress(moduleId);
        } catch (err) {
          console.warn('updateModuleProgress failed (non-fatal):', err);
        }
      }

      // provide feedback to user
      setProgressSaved(true);
      setProgressSaving(false);
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
    }, 3000);
  };

  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'drop') {
        oscillator.frequency.value = 150;
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      } else if (type === 'water') {
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
      } else if (type === 'success') {
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
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
      showFeedbackMessage("Perfect! Cooking pot is on the counter");
    }
    else if (draggedItem === 'rice' && zone === 'pot-on-table' && potOnTable && !riceInPot) {
      setShowPourAnimation(true);
      playSound('drop');
      setTimeout(() => {
        setRiceInPot(true);
        setShowPourAnimation(false);
        setShowSparkles(true);
        showFeedbackMessage("Rice added! Now rinse it 2-3 times");
        setTimeout(() => setShowSparkles(false), 1000);
      }, 1200);
    }
    else if (draggedItem === 'pot-with-rice' && zone === 'sink' && riceInPot && waterAmount === null) {
      setShowWaterSplash(true);
      playSound('water');
      setTimeout(() => {
        setRinseCount(prev => prev + 1);
        setShowWaterSplash(false);
        if (rinseCount + 1 >= 2) {
          showFeedbackMessage(`Perfect! Rice rinsed ${rinseCount + 1} times. Ready for water!`);
          setShowSparkles(true);
          setTimeout(() => setShowSparkles(false), 1000);
        } else {
          showFeedbackMessage(`Rice rinsed ${rinseCount + 1} time${rinseCount + 1 !== 1 ? 's' : ''}. Rinse 1-2 more times`);
        }
      }, 800);
    }
    else if (draggedItem === 'water-low' && zone === 'pot-on-table' && rinseCount >= 1) {
      setWaterAmount('low');
      playSound('water');
      showFeedbackMessage("Water added, but this might be too little for perfect rice");
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 800);
    }
    else if (draggedItem === 'water-perfect' && zone === 'pot-on-table' && rinseCount >= 1) {
      setWaterAmount('perfect');
      playSound('success');
      showFeedbackMessage("Perfect water amount! This will make fluffy rice!");
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 800);
    }
    else if (draggedItem === 'water-high' && zone === 'pot-on-table' && rinseCount >= 1) {
      setWaterAmount('high');
      playSound('water');
      showFeedbackMessage("Water added, but this might be too much - rice could get mushy");
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 800);
    }
    else if (draggedItem === 'pot-ready' && zone === 'cooker' && waterAmount && !potInCooker) {
      setPotInCooker(true);
      playSound('drop');
      showFeedbackMessage("Great! Pot is securely in the rice cooker");
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
      setCookerTimer(0);
      setCookerTemperature(25);
      playSound('success');
      showFeedbackMessage("Cooking started! Rice cooker is heating up...");
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
      newMistakes.push(`Only rinsed ${rinseCount} time${rinseCount !== 1 ? 's' : ''} (should rinse 2-3 times for best results)`);
    }
    
    if (waterAmount === 'low') {
      newMistakes.push('Too little water - rice will be hard, dry, and undercooked');
    } else if (waterAmount === 'high') {
      newMistakes.push('Too much water - rice will be mushy, sticky, and overcooked');
    }
    
    setMistakes(newMistakes);
    
    if (newMistakes.length === 0 && waterAmount === 'perfect') {
      setRiceQuality('Perfect Fluffy Rice! 🏆');
    } else if (rinseCount < 2) {
      setRiceQuality('Sticky Clumpy Rice 😕');
    } else if (waterAmount === 'high') {
      setRiceQuality('Mushy Overcooked Rice 💦');
    } else if (waterAmount === 'low') {
      setRiceQuality('Hard Undercooked Rice 🪨');
    } else {
      setRiceQuality('Good Rice ⭐');
    }
    
    setShowSuccess(true);
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
    setShowSuccess(false);
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
    setCookerTemperature(25);
    setCookerTimer(0);
    setStarAnimationStage(0);
  };

  const handleStartGame = () => {
    if (assetsLoaded) {
      setShowStartScreen(false);
    }
  };

  const handleContinue = () => {
    navigate('/studentdashboard');
  };

  const DraggableItem = ({ type, isActive, isCompleted, children, style = {} }) => (
    <div
      draggable={isActive}
      onDragStart={(e) => handleDragStart(e, type)}
      style={{
        cursor: isActive ? 'grab' : 'not-allowed',
        opacity: isCompleted ? 0.4 : isActive ? 1 : 0.7,
        border: isActive ? '2px solid #8B4513' : isCompleted ? '2px solid #228B22' : '1px solid #A9A9A9',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: isCompleted ? '#F0FFF0' : isActive ? '#FFF8DC' : '#F5F5F5',
        position: 'relative',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s ease',
        boxShadow: isActive ? '0 4px 12px rgba(139, 69, 19, 0.4)' : '0 2px 6px rgba(0,0,0,0.1)',
        ...style
      }}
    >
      {children}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '20px',
          height: '20px',
          background: '#8B4513',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          animation: 'pulse 1.5s infinite',
          boxShadow: '0 2px 6px rgba(139, 69, 19, 0.5)'
        }}>↑</div>
      )}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '20px',
          height: '20px',
          background: '#228B22',
          borderRadius: '50%',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(34, 139, 34, 0.5)'
        }}>✓</div>
      )}
    </div>
  );

  // Realistic Chef Baconardo Character
  const BaconardoGuide = () => (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '20px',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      animation: 'chefBounce 3s infinite ease-in-out'
    }}>
      <div style={{
        width: '140px',
        height: '140px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid #8B4513',
        background: 'linear-gradient(135deg, #FFE4B5, #FFD700)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        marginBottom: '8px'
      }}>
        <img 
          src={baconardoImg} 
          alt="Chef Baconardo" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{
        background: 'linear-gradient(45deg, #8B4513, #A0522D)',
        color: 'white',
        padding: '10px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        border: '2px solid #D2691E',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <ChefHat size={16} />
        Chef Baconardo
      </div>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '16px',
        fontSize: '14px',
        color: '#8B4513',
        textAlign: 'center',
        border: '2px solid #D2691E',
        fontWeight: '600',
        maxWidth: '200px',
        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        {riceCookingSteps[currentStep]?.instruction || "Excellent! Perfect rice achieved! 🎉"}
      </div>
    </div>
  );

  // Show preloader until assets are loaded
  if (!assetsLoaded) {
    return <AssetPreloader onLoadComplete={() => setAssetsLoaded(true)} />;
  }

  // Start screen only after game is ready
  if (showStartScreen || !gameReady) {
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
          background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.8) 0%, rgba(160, 82, 45, 0.8) 100%)',
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
           Master Perfect Rice Cooking
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
              loading="eager"
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
              Hello! I'm Chef Baconardo! Let's master the art of cooking perfect, fluffy rice! Follow my instructions to create restaurant-quality rice.
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={3}>
            <Button 
              variant="contained"
              onClick={handleStartGame}
              disabled={!gameReady}
              sx={{ 
                background: 'linear-gradient(135deg, #FFCA3A 0%, #FFA500 100%)',
                color: '#8B4513',
                px: 8,
                py: 2,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.5rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(255, 202, 58, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFCA3A 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {gameReady ? 'Start Cooking!' : 'Loading...'}
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
      backgroundSize: "cover",
      backgroundPosition: "center",
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
        
        {/* Realistic Chef Baconardo Character */}
        <BaconardoGuide />

        <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes waterDrop {
            0% { transform: translateY(-20px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(30px); opacity: 0; }
          }
          @keyframes pourRice {
            0% { transform: translateY(-15px) rotate(-10deg); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(25px) rotate(-10deg); opacity: 0; }
          }
          @keyframes steamRise {
            0% { transform: translateY(0) scale(0.8); opacity: 0.7; }
            100% { transform: translateY(-50px) scale(1.1); opacity: 0; }
          }
          @keyframes sparkle {
            0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
            50% { transform: scale(1) rotate(180deg); opacity: 1; }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 15px rgba(139, 69, 19, 0.6); }
            50% { box-shadow: 0 0 25px rgba(139, 69, 19, 0.9); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(15px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes focusPulse {
            0%, 100% { transform: scale(1); border-color: #8B4513; }
            50% { transform: scale(1.01); border-color: #D2691E; }
          }
          @keyframes chefBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes starPop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.5); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes starPop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.5); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .draggable {
            cursor: grab;
            transition: all 0.3s ease;
            user-select: none;
          }
          .draggable:hover {
            transform: scale(1.03) translateY(-2px);
          }
          .draggable:active {
            cursor: grabbing;
            transform: scale(0.98);
          }
          .drop-zone {
            transition: all 0.3s ease;
          }
          .drop-zone.hovered {
            background: rgba(139, 69, 19, 0.1) !important;
            border-color: #8B4513 !important;
            border-width: 3px !important;
            transform: scale(1.01);
          }
          .focused-area {
            animation: focusPulse 2s infinite;
            border-width: 2px !important;
          }
          .dimmed-area {
            opacity: 0.6;
            transition: all 0.3s ease;
          }
        `}
        </style>
        
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px',
          paddingTop: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

          {/* Progress Bar */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            padding: '14px 18px',
            marginBottom: '15px',
            width: '100%',
            maxWidth: '800px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #D2B48C',
            animation: 'slideIn 0.6s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: '#8B4513', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>Cooking Progress:</span>
              <span style={{ color: '#8B4513', fontWeight: '600', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}>
                Step {currentStep + 1} of 8
              </span>
            </div>
            <div style={{
              background: '#E8E8E8',
              borderRadius: '8px',
              height: '10px',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #8B4513, #A0522D)',
                height: '100%',
                width: `${((currentStep + 1) / 8) * 100}%`,
                transition: 'width 0.5s ease',
                borderRadius: '8px',
              }} />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: '12px',
            width: '100%',
            maxWidth: '1100px'
          }}>
            {/* Kitchen Tools & Ingredients - Realistic Style */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              padding: '15px',
              border: isSetupPhase ? '2px solid #8B4513' : '1px solid #D2B48C',
              height: 'fit-content',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              animation: isSetupPhase ? 'focusPulse 2s infinite' : 'slideIn 0.7s ease-out',
              opacity: isSetupPhase ? 1 : 0.8,
              transition: 'all 0.3s ease'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                color: isSetupPhase ? '#8B4513' : '#A0522D',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '600',
                borderBottom: `1px solid ${isSetupPhase ? '#D2B48C' : '#E8E8E8'}`,
                paddingBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontFamily: 'Arial, sans-serif'
              }}>
                <span style={{ fontSize: '18px' }}>🔪</span>
                {isSetupPhase ? 'ACTIVE: Kitchen Tools' : 'Kitchen Tools'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {!potOnTable && (
                  <DraggableItem 
                    type="pot"
                    isActive={currentStep === 0}
                    isCompleted={potOnTable}
                    style={{ width: '100%', height: '60px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '32px' }}>🍲</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', marginTop: '4px', color: '#8B4513' }}>Cooking Pot</div>
                  </DraggableItem>
                )}

                {potOnTable && !riceInPot && (
                  <DraggableItem 
                    type="rice"
                    isActive={currentStep === 1}
                    isCompleted={riceInPot}
                    style={{ width: '100%', height: '60px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '32px' }}>🌾</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', marginTop: '4px', color: '#8B4513' }}>Uncooked Rice</div>
                  </DraggableItem>
                )}

                {riceInPot && waterAmount === null && rinseCount < 3 && (
                  <div style={{
                    background: 'rgba(139, 69, 19, 0.05)',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'center',
                    border: isPreparationPhase ? '2px solid #8B4513' : '1px solid #D2B48C',
                    width: '100%',
                    opacity: isPreparationPhase ? 1 : 0.8
                  }}>
                    <div style={{ fontSize: '36px', marginBottom: '6px' }}>
                      🍲💧
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#8B4513', marginBottom: '4px' }}>
                      Rinse at Sink
                    </div>
                    <div style={{ fontSize: '10px', color: '#A0522D', fontWeight: '500' }}>
                      Rinsed: {rinseCount}/2-3 times
                    </div>
                  </div>
                )}

                {rinseCount >= 2 && waterAmount === null && (
                  <>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#8B4513',
                      marginTop: '8px',
                      marginBottom: '4px',
                      width: '100%',
                      textAlign: 'left',
                      paddingLeft: '4px'
                    }}>
                      💧 Water Measurement:
                    </div>
                    
                    <DraggableItem 
                      type="water-low"
                      isActive={currentStep === 3 && !waterAmount}
                      isCompleted={waterAmount === 'low'}
                      style={{ width: '100%', height: '50px', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '28px' }}>💧</div>
                      <div style={{ fontSize: '10px', fontWeight: '600', marginTop: '2px', color: '#8B4513' }}>Too Little</div>
                    </DraggableItem>
                    
                    <DraggableItem 
                      type="water-perfect"
                      isActive={currentStep === 3 && !waterAmount}
                      isCompleted={waterAmount === 'perfect'}
                      style={{ width: '100%', height: '50px', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '28px' }}>💧💧</div>
                      <div style={{ fontSize: '10px', fontWeight: '600', marginTop: '2px', color: '#228B22' }}>Perfect ✓</div>
                    </DraggableItem>
                    
                    <DraggableItem 
                      type="water-high"
                      isActive={currentStep === 3 && !waterAmount}
                      isCompleted={waterAmount === 'high'}
                      style={{ width: '100%', height: '50px', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '28px' }}>💧💧💧</div>
                      <div style={{ fontSize: '10px', fontWeight: '600', marginTop: '2px', color: '#8B4513' }}>Too Much</div>
                    </DraggableItem>
                  </>
                )}

                {cookingProgress === 100 && !isResting && !isServed && (
                  <DraggableItem 
                    type="paddle"
                    isActive={currentStep === 7}
                    isCompleted={isServed}
                    style={{ width: '100%', height: '60px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '32px' }}>🥄</div>
                    <div style={{ fontSize: '11px', fontWeight: '600', marginTop: '4px', color: '#8B4513' }}>Rice Paddle</div>
                  </DraggableItem>
                )}
              </div>

              {/* Progress Checklist */}
              <div style={{
                marginTop: '15px',
                paddingTop: '12px',
                borderTop: '1px solid #E8E8E8'
              }}>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#8B4513',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📋 Cooking Steps
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <ChecklistItem completed={potOnTable} text="Pot on counter" />
                  <ChecklistItem completed={riceInPot} text="Rice added" />
                  <ChecklistItem completed={rinseCount >= 2} text={`Rinsed ${rinseCount >= 2 ? '✓' : ''}`} />
                  <ChecklistItem completed={waterAmount !== null} text="Water added" />
                  <ChecklistItem completed={potInCooker} text="In cooker" />
                  <ChecklistItem completed={cookingProgress === 100} text="Cooked" />
                  <ChecklistItem completed={isServed} text="Served" />
                </div>
              </div>
            </div>

            {/* Main Kitchen Area - Realistic Layout */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Kitchen Station Header */}
              <div style={{
                background: 'rgba(139, 69, 19, 0.9)',
                padding: '8px 16px',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                alignSelf: 'center',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(139, 69, 19, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'slideIn 0.8s ease-out',
                fontFamily: 'Arial, sans-serif'
              }}>
                <span style={{ fontSize: '20px' }}>🍳</span>
                Professional Kitchen Station
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                {/* Kitchen Counter - Realistic */}
                <div
                  onDragOver={(e) => handleDragOver(e, potOnTable ? 'pot-on-table' : 'table')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, potOnTable ? 'pot-on-table' : 'table')}
                  className={`drop-zone ${(hoveredZone === 'table' || hoveredZone === 'pot-on-table') ? 'hovered' : ''} ${isSetupPhase ? 'focused-area' : ''} ${!isSetupPhase && !isPreparationPhase ? 'dimmed-area' : ''}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '12px',
                    padding: '25px',
                    border: isSetupPhase ? '2px dashed #8B4513' : '1px dashed #D2B48C',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isSetupPhase ? '#8B4513' : '#A0522D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    <span style={{ fontSize: '18px' }}></span>
                    Preparation Counter
                  </div>

                  {/* Pour Rice Animation */}
                  {showPourAnimation && (
                    <div style={{
                      position: 'absolute',
                      top: '60px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                      zIndex: 10
                    }}>
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: '12px',
                            animation: `pourRice 0.8s ease-out ${i * 0.1}s`,
                            marginLeft: `${Math.random() * 20 - 10}px`
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
                      {[...Array(4)].map((_, i) => (
                        <Sparkles
                          key={i}
                          size={18}
                          color="#D2691E"
                          style={{
                            position: 'absolute',
                            animation: `sparkle 0.8s ease-out ${i * 0.1}s`,
                            left: `${Math.cos(i * 90 * Math.PI / 180) * 35}px`,
                            top: `${Math.sin(i * 90 * Math.PI / 180) * 35}px`
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
                        {/* Realistic Pot Visualization */}
                        <div style={{
                          width: '120px',
                          height: '80px',
                          background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
                          borderRadius: '8px 8px 20px 20px',
                          position: 'relative',
                          border: '2px solid #808080',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}>
                          {/* Pot rim */}
                          <div style={{
                            position: 'absolute',
                            top: '-5px',
                            left: '-5px',
                            right: '-5px',
                            height: '10px',
                            background: 'linear-gradient(135deg, #B0B0B0, #D3D3D3)',
                            borderRadius: '12px 12px 8px 8px',
                            border: '1px solid #808080'
                          }} />

                          {/* Rice content */}
                          {riceInPot && (
                            <div style={{
                              position: 'absolute',
                              bottom: '5px',
                              left: '5px',
                              right: '5px',
                              height: '30px',
                              background: 'radial-gradient(circle, #FFF8DC, #F5DEB3)',
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <span style={{ fontSize: '16px', opacity: 0.7 }}>🌾🌾</span>
                            </div>
                          )}

                          {/* Water level */}
                          {waterAmount && (
                            <div style={{
                              position: 'absolute',
                              bottom: '5px',
                              left: '5px',
                              right: '5px',
                              height: waterAmount === 'low' ? '15px' : waterAmount === 'perfect' ? '25px' : '35px',
                              background: `rgba(173, 216, 230, ${waterAmount === 'perfect' ? 0.6 : 0.4})`,
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Droplet size={14} color="#4682B4" />
                            </div>
                          )}
                        </div>

                        <div style={{
                          marginTop: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {rinseCount > 0 && (
                            <div style={{
                              color: rinseCount >= 2 ? '#228B22' : '#D2691E',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              justifyContent: 'center'
                            }}>
                              {rinseCount >= 2 ? '✓' : '↻'} Rinsed {rinseCount} time{rinseCount !== 1 ? 's' : ''}
                            </div>
                          )}
                          {waterAmount && (
                            <div style={{
                              color: waterAmount === 'perfect' ? '#228B22' : '#8B4513',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              justifyContent: 'center'
                            }}>
                              {waterAmount === 'perfect' ? '✓' : '💧'} Water: {waterAmount}
                            </div>
                          )}
                          {riceInPot && waterAmount === null && rinseCount < 2 && (
                            <div style={{
                              color: '#8B4513',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              justifyContent: 'center',
                              animation: 'pulse 2s infinite',
                              fontSize: '10px',
                              backgroundColor: 'rgba(139, 69, 19, 0.1)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              marginTop: '4px'
                            }}>
                              👉 Drag to sink to rinse
                            </div>
                          )}
                          {riceInPot && waterAmount === null && rinseCount >= 2 && (
                            <div style={{
                              color: '#228B22',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              justifyContent: 'center',
                              animation: 'pulse 2s infinite',
                              fontSize: '10px',
                              backgroundColor: 'rgba(34, 139, 34, 0.1)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              marginTop: '4px'
                            }}>
                              💧 Add water now
                            </div>
                          )}
                          {waterAmount && !potInCooker && (
                            <div style={{
                              color: '#8B4513',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              justifyContent: 'center',
                              animation: 'pulse 2s infinite',
                              fontSize: '10px',
                              backgroundColor: 'rgba(139, 69, 19, 0.1)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              marginTop: '4px'
                            }}>
                              👉 Drag to rice cooker
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {!potOnTable && (
                    <div style={{
                      fontSize: '14px',
                      color: '#8B4513',
                      fontWeight: '600',
                      textAlign: 'center',
                      animation: 'pulse 2s infinite',
                      backgroundColor: 'rgba(139, 69, 19, 0.1)',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1px solid #D2B48C',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      👆 Place cooking pot here
                    </div>
                  )}
                </div>

                {/* Kitchen Sink - Realistic */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'sink')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'sink')}
                  className={`drop-zone ${hoveredZone === 'sink' ? 'hovered' : ''} ${isPreparationPhase ? 'focused-area' : ''} ${!isPreparationPhase ? 'dimmed-area' : ''}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '12px',
                    padding: '25px',
                    border: isPreparationPhase ? '2px dashed #8B4513' : '1px dashed #D2B48C',
                    minHeight: '220px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isPreparationPhase ? '#8B4513' : '#A0522D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    <span style={{ fontSize: '18px' }}></span>
                    Kitchen Sink
                  </div>

                  {/* Realistic Sink Visualization */}
                  <div style={{
                    width: '140px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #E8E8E8, #D3D3D3)',
                    borderRadius: '8px',
                    position: 'relative',
                    border: '2px solid #C0C0C0',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {/* Sink basin */}
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      left: '10px',
                      right: '10px',
                      bottom: '5px',
                      background: 'linear-gradient(135deg, #F0F8FF, #E6E6FA)',
                      borderRadius: '6px',
                      border: '1px solid #B0C4DE'
                    }} />

                    {/* Faucet */}
                    <div style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '8px',
                      height: '20px',
                      background: 'linear-gradient(135deg, #C0C0C0, #A9A9A9)',
                      borderRadius: '4px 4px 0 0'
                    }} />

                    {showWaterSplash && (
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '0px',
                          top: '-15px',
                          width: '3px',
                          height: '40px',
                          background: 'linear-gradient(180deg, rgba(173, 216, 230, 0.8) 0%, rgba(173, 216, 230, 0.3) 100%)',
                          borderRadius: '2px',
                          animation: 'waterDrop 0.4s ease-out'
                        }} />
                        
                        {[...Array(8)].map((_, i) => (
                          <Droplet
                            key={i}
                            size={12}
                            color="#87CEEB"
                            style={{
                              position: 'absolute',
                              animation: `waterDrop 0.6s ease-out ${i * 0.05}s`,
                              left: `${Math.random() * 30 - 15}px`,
                              top: '20px'
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#8B4513',
                    textAlign: 'center'
                  }}>
                    {riceInPot && waterAmount === null && rinseCount < 2 ? (
                      <div style={{
                        backgroundColor: 'rgba(139, 69, 19, 0.1)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: isPreparationPhase ? '2px solid #8B4513' : '1px solid #8B4513',
                        animation: isPreparationPhase ? 'pulse 2s infinite' : 'none',
                      }}>
                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>👇</div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#8B4513' }}>
                          Drop pot here to rinse!
                        </div>
                        <div style={{ fontSize: '10px', color: '#A0522D', marginTop: '2px' }}>
                          Rinsed: {rinseCount}/2-3 times
                        </div>
                    </div>
                    ) : rinseCount >= 2 && waterAmount === null ? (
                      <div style={{
                        backgroundColor: 'rgba(34, 139, 34, 0.1)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #228B22',
                        color: '#228B22'
                      }}>
                        ✓ Rice rinsed {rinseCount} times
                      </div>
                    ) : (
                      <div style={{ color: '#A0522D', fontStyle: 'italic', fontSize: '10px' }}>
                        Rinse rice here (2-3 times recommended)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rice Cooker and Serving Area - Realistic */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                {/* Rice Cooker - Realistic */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'cooker')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'cooker')}
                  className={`drop-zone ${hoveredZone === 'cooker' ? 'hovered' : ''} ${isCookingPhase ? 'focused-area' : ''} ${!isCookingPhase ? 'dimmed-area' : ''}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: isCookingPhase ? '2px dashed #8B4513' : '1px dashed #D2B48C',
                    minHeight: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isCookingPhase ? '#8B4513' : '#A0522D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    <span style={{ fontSize: '18px' }}></span>
                    Rice Cooker
                  </div>

                  {showSteam && (
                    <div style={{
                      position: 'absolute',
                      top: '40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 10
                    }}>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            fontSize: '24px',
                            animation: `steamRise 2s ease-out infinite ${i * 0.3}s`,
                            left: `${(i - 1.5) * 15}px`
                          }}
                        >
                          💨
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Realistic Rice Cooker */}
                  <div style={{
                    width: '120px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #DC143C, #B22222)',
                    borderRadius: '8px',
                    position: 'relative',
                    border: '2px solid #8B0000',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}>
                    {/* Cooker lid */}
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '-5px',
                      right: '-5px',
                      height: '15px',
                      background: 'linear-gradient(135deg, #B22222, #8B0000)',
                      borderRadius: '10px 10px 5px 5px',
                      border: '1px solid #8B0000'
                    }} />

                    {/* Control panel */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      left: '10px',
                      right: '10px',
                      height: '25px',
                      background: 'linear-gradient(135deg, #2F4F4F, #1C1C1C)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      padding: '0 8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isCooking ? '#32CD32' : '#808080',
                        boxShadow: isCooking ? '0 0 8px #32CD32' : 'none'
                      }} />
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: potInCooker && !isCooking ? '#FF4500' : '#808080'
                      }} />
                    </div>

                    {/* Display area */}
                    <div style={{
                      position: 'absolute',
                      top: '45px',
                      left: '15px',
                      right: '15px',
                      height: '20px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#32CD32',
                      fontSize: '10px',
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      {isCooking ? 'COOKING' : isResting ? 'WARM' : 'READY'}
                    </div>

                    {/* Temperature and timer display */}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '10px',
                      right: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '9px',
                      color: 'white',
                      fontWeight: '500'
                    }}>
                      <span>🌡️{Math.round(cookerTemperature)}°C</span>
                      <span>⏰{cookerTimer}s</span>
                    </div>
                  </div>

                  {potInCooker && (
                    <div style={{
                      position: 'absolute',
                      top: '85px',
                      fontSize: '32px',
                      animation: 'float 3s ease-in-out infinite'
                    }}>
                      🍲
                    </div>
                  )}

                  {potInCooker && !isCooking && cookingProgress === 0 && (
                    <button
                      onClick={handleCookButton}
                      style={{
                        marginTop: '15px',
                        backgroundColor: '#8B4513',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '10px 20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(139, 69, 19, 0.4)',
                        transition: 'all 0.3s ease',
                        animation: 'pulse 2s infinite',
                        fontFamily: 'Arial, sans-serif'
                      }}
                    >
                      🔥 START COOKING
                    </button>
                  )}

                  {(isCooking || cookingProgress > 0) && (
                    <div style={{
                      position: 'absolute',
                      bottom: '15px',
                      left: '15px',
                      right: '15px'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#8B4513',
                        marginBottom: '6px',
                        textAlign: 'center'
                      }}>
                        {isCooking ? '🔥 Cooking...' : isResting ? '⏱️ Resting...' : '✓ Done!'}
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#F5F5DC',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{
                          width: `${isCooking ? cookingProgress : isResting ? restingProgress : 100}%`,
                          height: '100%',
                          background: isCooking ? 'linear-gradient(90deg, #8B4513, #A0522D)' : 'linear-gradient(90deg, #D2691E, #CD853F)',
                          transition: 'width 0.3s ease',
                          borderRadius: '4px',
                        }} />
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#8B4513',
                        textAlign: 'center',
                        marginTop: '4px',
                        fontWeight: '500'
                      }}>
                        {Math.round(isCooking ? cookingProgress : isResting ? restingProgress : 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Serving Area - Realistic */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'serving-area')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'serving-area')}
                  className={`drop-zone ${hoveredZone === 'serving-area' ? 'hovered' : ''} ${isServingPhase ? 'focused-area' : ''} ${!isServingPhase ? 'dimmed-area' : ''}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: isServingPhase ? '2px dashed #8B4513' : '1px dashed #D2B48C',
                    minHeight: '250px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    position: 'relative',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isServingPhase ? '#8B4513' : '#A0522D',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    <span style={{ fontSize: '18px' }}></span>
                    Serving Area
                  </div>

                  {/* Realistic Serving Bowl */}
                  <div style={{
                    width: '100px',
                    height: '60px',
                    background: 'linear-gradient(135deg, #FFF8DC, #F5DEB3)',
                    borderRadius: '8px 8px 20px 20px',
                    position: 'relative',
                    border: '2px solid #DEB887',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    {/* Bowl rim */}
                    <div style={{
                      position: 'absolute',
                      top: '-3px',
                      left: '-5px',
                      right: '-5px',
                      height: '8px',
                      background: 'linear-gradient(135deg, #FFF8DC, #F5DEB3)',
                      borderRadius: '10px 10px 5px 5px',
                      border: '1px solid #DEB887'
                    }} />
                  </div>

                  {isServed && (
                    <div style={{
                      position: 'absolute',
                      top: '70px',
                      fontSize: '48px',
                      animation: 'bounceIn 0.6s ease-out'
                    }}>
                      🍚
                    </div>
                  )}

                  {cookingProgress === 100 && !isResting && !isServed && (
                    <div style={{
                      marginTop: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#8B4513',
                      textAlign: 'center',
                      animation: 'pulse 2s infinite',
                      backgroundColor: 'rgba(139, 69, 19, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '2px solid #D2691E'
                    }}>
                      🥄 Use rice paddle to serve!
                    </div>
                  )}

                  {isResting && (
                    <div style={{
                      marginTop: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#8B4513',
                      textAlign: 'center',
                      backgroundColor: 'rgba(139, 69, 19, 0.1)',
                      padding: '6px 10px',
                      borderRadius: '6px'
                    }}>
                      ⏱️ Rice is resting for perfect texture...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Control Bar - Realistic Style */}
          <Box sx={{
            position: 'fixed',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            border: '1px solid #D2B48C'
          }}>
            <Button
              onClick={resetGame}
              variant="contained"
              startIcon={<RotateCcw size={16} />}
              sx={{
                backgroundColor: '#8B4513',
                borderRadius: '15px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)',
                '&:hover': { 
                  backgroundColor: '#654321',
                },
                transition: 'all 0.3s ease',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              Reset
            </Button>
            
            <Button
              onClick={() => navigate('/studentdashboard')}
              variant="contained"
              startIcon={<span>🏠</span>}
              sx={{
                backgroundColor: '#8B4513',
                borderRadius: '15px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)',
                '&:hover': { 
                  backgroundColor: '#654321',
                },
                transition: 'all 0.3s ease',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              Home
            </Button>

            {isServed && (
              <Button
                onClick={() => navigate('/lesson/cooking/level-5')}
                variant="contained"
                startIcon={<ArrowRight size={16} />}
                sx={{
                  backgroundColor: '#228B22',
                  borderRadius: '15px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(34, 139, 34, 0.3)',
                  '&:hover': { 
                    backgroundColor: '#1F7A1F',
                  },
                  animation: 'pulse 2s infinite',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                Next Recipe
              </Button>
            )}
          </Box>

          {/* Success Dialog - Matching Level 3 Style */}
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
            {/* Confetti Animation */}
            {showConfetti && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                recycle={false}
                numberOfPieces={200}
                gravity={0.1}
                colors={['#8B4513', '#A0522D', '#D2691E', '#DEB887']}
                style={{ position: 'fixed', zIndex: 2000 }}
              />
            )}
            
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
                {riceQuality || 'Perfect Rice Cooking!'}
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
                        animation: shouldAnimate ? 'starPop 0.6s ease-out' : 'none'
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
                {riceQuality.includes('Perfect') 
                  ? 'You cooked perfect restaurant-quality rice! Followed all steps perfectly! 🎉' 
                  : riceQuality.includes('Good')
                  ? 'Good job! Your rice turned out well! With a little practice, you\'ll make perfect rice!'
                  : 'Practice makes perfect! Try again for better results!'}
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
                  Cook Again
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/lesson/cooking/level-5')}
                  disabled={progressSaving}
                  sx={{
                    background: 'linear-gradient(135deg, #FFCA3A 0%, #FFA500 100%)',
                    color: '#8B4513',
                    px: 6,
                    py: 2,
                    borderRadius: '25px',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: '700',
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 10px 25px rgba(255, 202, 58, 0.5)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFCA3A 100%)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  {progressSaving ? 'Saving...' : 'Next Recipe'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleContinue}
                  sx={{
                    background: 'linear-gradient(135deg, #8B4513 0%, #654321 100%)',
                    color: 'white',
                    px: 4,
                    py: 2,
                    borderRadius: '25px',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: '600',
                    fontSize: '1.2rem',
                    textTransform: 'none',
                    boxShadow: '0 10px 25px rgba(139, 69, 19, 0.5)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #A0522D 0%, #8B4513 100%)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Back to Home
                </Button>
              </Box>
            </Box>
          </Dialog>

          {/* Feedback Message - Realistic */}
          {showFeedback && (
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(135deg, #8B4513, #A0522D)',
              color: 'white',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              zIndex: 2000,
              boxShadow: '0 8px 25px rgba(139, 69, 19, 0.5)',
              animation: 'bounceIn 0.4s ease-out',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontFamily: 'Arial, sans-serif',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              maxWidth: '90%'
            }}>
              <ChefHat size={20} />
              {feedbackMessage}
            </div>
          )}
        </Box>
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
      padding: '6px 8px',
      backgroundColor: completed ? 'rgba(34, 139, 34, 0.1)' : 'rgba(139, 69, 19, 0.05)',
      borderRadius: '6px',
      border: `1px solid ${completed ? '#90EE90' : '#D2B48C'}`,
      transition: 'all 0.3s ease'
    }}>
      <span style={{ 
        fontSize: '14px',
        color: completed ? '#228B22' : '#A0522D'
      }}>
        {completed ? '✓' : '○'}
      </span>
      <span style={{ 
        fontSize: '11px',
        color: completed ? '#228B22' : '#8B4513',
        fontWeight: completed ? '600' : '500'
      }}>
        {text}
      </span>
    </div>
  );
}