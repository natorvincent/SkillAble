import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Button, 
  Stack, 
  LinearProgress, 
  Chip, 
  Typography, 
  Dialog, 
  IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Import all images
import whiteShirtImg from '../../assets/householdLevel1/BlueWhiteShirt.png';
import bluePajamasImg from '../../assets/householdLevel1/BluePajamas.png';
import redPantsImg from '../../assets/householdLevel1/RedPants.png';
import darkBlueShirtImg from '../../assets/householdLevel1/DarkBlueShirtDirt.png';
import whiteShirtDirtImg from '../../assets/householdLevel1/WhiteShirtDirt.png';
import whiteSocksImg from '../../assets/householdLevel1/WhiteSocks.png';
import greenJacketImg from '../../assets/householdLevel1/GreenJacket.png';
import lightBlueShirtImg from '../../assets/householdLevel1/LightBlueShirt.png';
import pantsDirtImg from '../../assets/householdLevel1/PantsDirt.png';
import greenClothesImg from '../../assets/householdLevel1/GreenClothes.png';
import whitRedTshirtImg from '../../assets/householdLevel1/WhiteRedShirt.png';
import blackPantsImg from '../../assets/householdLevel1/BlackPants.png';
import whitePoloImg from '../../assets/householdLevel1/whitepolo.png';
import washingMachine1Img from '../../assets/householdLevel1/WashingMachine1.png';
import washingMachine2Img from '../../assets/householdLevel1/WashingMachine2.png';
import wonderingImg from '../../assets/householdLevel1/Wondering.png';
import happyImg from '../../assets/householdLevel1/Happy.png';
import basketImg from '../../assets/householdLevel1/Basket.png';
import laundryBgImg from '../../assets/householdLevel1/BackgroundLaundry.png';
import bubbleImg from '../../assets/householdLevel1/bubble2.png';
import wrongImg from '../../assets/householdLevel1/Wrong1.png';
import pointFingerImg from '../../assets/householdLevel1/pointingfinger.png';
import Navbar from '../Navbar';

// Import sound effects
import yaySoundEffect from '../../assets/householdLevel1/correct-sound.mp3';
import laundryBackgroundMusic from '../../assets/householdLevel1/LaundryBackgroungMusic.mp3';
import wrongSoundEffect from '../../assets/householdLevel1/WrongSoundEffect .mp3';
import tryagainSoundEffect from '../../assets/householdLevel1/try_again.mp3';
import instructionSoundEffect from '../../assets/householdLevel1/instruction.mp3';
import correctSoundEffect from '../../assets/householdLevel1/correct.mp3';

// Import services for progress tracking
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Audio Manager Class
class AudioManager {
  constructor() {
    this.audioElements = {};
    this.currentlyPlaying = new Set();
    this.audioContext = null;
  }

  async initAudioContext() {
    if (this.audioContext) return this.audioContext;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const resumeAudio = async () => {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      };

      document.addEventListener('click', resumeAudio, { once: true });
      document.addEventListener('touchstart', resumeAudio, { once: true });
      document.addEventListener('keydown', resumeAudio, { once: true });

      return this.audioContext;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return null;
    }
  }

  registerAudio(id, audioElement) {
    this.audioElements[id] = audioElement;
  }

  async playAudio(id, volume = 1.0, interrupt = false) {
    await this.initAudioContext();
    
    if (this.currentlyPlaying.has(id) && !interrupt) {
      return;
    }
    
    const audio = this.audioElements[id];
    if (!audio) {
      console.warn(`Audio not found: ${id}`);
      return;
    }

    try {
      if (interrupt && this.currentlyPlaying.has(id)) {
        audio.pause();
        audio.currentTime = 0;
        this.currentlyPlaying.delete(id);
      }

      audio.currentTime = 0;
      audio.volume = volume;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          this.currentlyPlaying.add(id);
          
          audio.onended = () => {
            this.currentlyPlaying.delete(id);
          };
        }).catch(error => {
          console.log(`Audio play failed for ${id}:`, error);
        });
      }
    } catch (error) {
      console.error(`Error playing audio ${id}:`, error);
    }
  }

  stopAudio(id) {
    const audio = this.audioElements[id];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      this.currentlyPlaying.delete(id);
    }
  }

  stopAllAudio() {
    Object.values(this.audioElements).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.currentlyPlaying.clear();
  }

  isPlaying(id) {
    return this.currentlyPlaying.has(id);
  }
}

const audioManager = new AudioManager();

// BUBBLES INSTANTLY VISIBLE THROUGHOUT SCREEN
const BubblesBackground = () => {
  const bubbles = Array.from({ length: 30 }, (_, i) => {
    const size = 50 + Math.random() * 100;
    const left = Math.random() * 100;
    const startY = Math.random() * 120;
    const endY = -20 - Math.random() * 30;
    const duration = 15 + Math.random() * 20;
    
    return (
      <motion.div
        key={i}
        initial={{ 
          y: `${startY}vh`,
          x: Math.random() * 30 - 15,
          opacity: 0.7 + Math.random() * 0.3,
          scale: 0.7 + Math.random() * 0.5
        }}
        animate={{ 
          y: `${endY}vh`,
          x: [
            Math.random() * 20 - 10, 
            Math.random() * 40 - 20, 
            Math.random() * 30 - 15, 
            Math.random() * 20 - 10
          ],
          opacity: [0.7 + Math.random() * 0.3, 1, 1, 0.8, 0.6, 0.4, 0],
          scale: [0.7 + Math.random() * 0.5, 1.1, 1, 0.9, 0.8, 0.7, 0.6]
        }}
        transition={{ 
          duration: duration,
          delay: 0,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: "absolute",
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          zIndex: 100,
          pointerEvents: "none",
          filter: "drop-shadow(0 0 25px white) brightness(1.8)"
        }}
      >
        <img 
          src={bubbleImg} 
          alt="Bubble"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "brightness(2) contrast(1.8)"
          }}
        />
      </motion.div>
    );
  });

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      overflow: "hidden",
      zIndex: 100,
      pointerEvents: "none"
    }}>
      {bubbles}
    </div>
  );
};

// Bubble Burst Effect Component
const BubbleBurstEffect = ({ position }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1, rotate: 0 }}
      animate={{ scale: 2, opacity: 0, rotate: 180 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: "80px",
        height: "80px",
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        pointerEvents: "none",
        filter: "drop-shadow(0 0 20px white) brightness(1.8)"
      }}
    >
      <img 
        src={bubbleImg} 
        alt="Bubble Burst"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "brightness(1.8) contrast(1.6)"
        }}
      />
    </motion.div>
  );
};

// Helper function to get student ID
const getStudentId = () => {
  try {
    const studentId = localStorage.getItem('studentId');
    
    console.log('Retrieving student ID:', { studentId });
    
    if (!studentId || studentId === 'null' || studentId === 'undefined') {
      console.warn('No student ID found in localStorage');
      return null;
    }
    
    const parsedId = parseInt(studentId, 10);
    if (isNaN(parsedId)) {
      console.warn('Invalid student ID format:', studentId);
      return null;
    }
    
    console.log('Successfully retrieved student ID:', parsedId);
    return parsedId;
  } catch (error) {
    console.error('Error retrieving student ID:', error);
    return null;
  }
};

const HouseholdLevel1 = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [avatar, setAvatar] = useState('wonder');
  const [gameWon, setGameWon] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverMachine, setDragOverMachine] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [wrongDrop, setWrongDrop] = useState(false);
  const [wrongDropPosition, setWrongDropPosition] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });
  const [showPreGameConfetti, setShowPreGameConfetti] = useState(true);
  const [bubbleBursts, setBubbleBursts] = useState([]);
  const [correctItems, setCorrectItems] = useState(0);
  const [isTablet, setIsTablet] = useState(false);

  // NEW STATES FOR HINT SYSTEM
  const [showHint, setShowHint] = useState(true);
  const [hintActive, setHintActive] = useState(true);
  const [hintPosition, setHintPosition] = useState({ x: 0, y: 0 });
  const [hintTargetPosition, setHintTargetPosition] = useState({ x: 0, y: 0 });
  const [hintType, setHintType] = useState('');
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Progress states
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Audio refs
  const instructionAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);
  const tryAgainAudioRef = useRef(null);
  const yayAudioRef = useRef(null);
  const backgroundAudioRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [instructionPlayed, setInstructionPlayed] = useState(false);


  // Clothing items
  const clothingItems = [
    { id: 1, name: 'White T-Shirt', type: 'whites', image: whiteShirtImg },
    { id: 2, name: 'Blue Pajamas', type: 'colors', image: bluePajamasImg },
    { id: 3, name: 'Red Pants', type: 'colors', image: redPantsImg },
    { id: 4, name: 'Dark Blue Shirt', type: 'colors', image: darkBlueShirtImg },
    { id: 5, name: 'White Dirt', type: 'whites', image: whiteShirtDirtImg },
    { id: 6, name: 'White Socks', type: 'whites', image: whiteSocksImg },
    { id: 7, name: 'Green Jacket', type: 'colors', image: greenJacketImg },
    { id: 8, name: 'Pants Dirt', type: 'colors', image: pantsDirtImg },
    { id: 9, name: 'Green Clothes', type: 'colors', image: greenClothesImg },
    { id: 10, name: 'Red White Clothes', type: 'whites', image: whitRedTshirtImg},
    { id: 11, name: 'Light Blue Shirt', type: 'colors', image: lightBlueShirtImg},
    { id: 12, name: 'Black Pants', type: 'colors', image: blackPantsImg },
    { id: 13, name: 'White Polo', type: 'whites', image: whitePoloImg },
  ];

  const currentItem = clothingItems[currentItemIndex];

  // Detect tablet size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Initialize audio manager
  useEffect(() => {
    // Register all audio elements
    const registerAudio = () => {
      if (instructionAudioRef.current) {
        audioManager.registerAudio('instruction', instructionAudioRef.current);
      }
      if (correctAudioRef.current) {
        audioManager.registerAudio('correct', correctAudioRef.current);
      }
      if (wrongAudioRef.current) {
        audioManager.registerAudio('wrong', wrongAudioRef.current);
      }
      if (tryAgainAudioRef.current) {
        audioManager.registerAudio('tryAgain', tryAgainAudioRef.current);
      }
      if (yayAudioRef.current) {
        audioManager.registerAudio('yay', yayAudioRef.current);
      }
    };

    // Small delay to ensure refs are set
    const timer = setTimeout(registerAudio, 100);
    
    return () => {
      clearTimeout(timer);
      audioManager.stopAllAudio();
    };
  }, []);

  // NEW EFFECT: Reset hint state for each new item and play instruction sound
  useEffect(() => {
    if (currentItem && showHint && !gameWon) {
      setUserHasInteracted(false);
      setHintActive(true);
      
      
      const updateHintPositions = () => {
        const clothingElement = document.querySelector(`[data-item-id="${currentItem.id}"]`);
        let clothingItemX, clothingItemY;
        
        if (clothingElement) {
          const rect = clothingElement.getBoundingClientRect();
          clothingItemX = rect.left + rect.width / 2;
          clothingItemY = rect.top + rect.height / 2;
        } else {
          clothingItemX = window.innerWidth * (isTablet ? 0.25 : 0.2);
          clothingItemY = window.innerHeight * 0.6;
        }
        
        let targetX, targetY;
        
        if (currentItem.type === 'whites') {
          targetX = window.innerWidth * (isTablet ? 0.65 : 0.7);
          targetY = window.innerHeight * 0.5;
        } else {
          targetX = window.innerWidth * (isTablet ? 0.85 : 0.85);
          targetY = window.innerHeight * 0.5;
        }
        
        setHintPosition({ x: clothingItemX, y: clothingItemY });
        setHintTargetPosition({ x: targetX, y: targetY });
        setHintType(currentItem.type);
      };

      const timer = setTimeout(() => {
        requestAnimationFrame(updateHintPositions);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentItemIndex, gameWon, showHint, isTablet]);

  // Add this useEffect for auto-saving progress when game is won
  useEffect(() => {
    const saveProgressOnComplete = async () => {
      if (gameWon && !progressSaved && !progressSaving) {
        console.log('Game completed, auto-saving progress...');
        await handleSaveProgress();
      }
    };
    
    saveProgressOnComplete();
  }, [gameWon, progressSaved, progressSaving]);

  // Background music setup
  useEffect(() => {
    if (!backgroundAudioRef.current) {
      backgroundAudioRef.current = new Audio(laundryBackgroundMusic);
      backgroundAudioRef.current.loop = true;
      backgroundAudioRef.current.volume = 0.3;
    }

    const playBackgroundMusic = () => {
      if (backgroundAudioRef.current && !audioPlaying) {
        backgroundAudioRef.current.play().then(() => {
          setAudioPlaying(true);
        }).catch(error => {
          console.log('Background audio autoplay prevented:', error);
        });
      }
    };

    const timer = setTimeout(playBackgroundMusic, 1500);

    return () => {
      clearTimeout(timer);
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current.currentTime = 0;
      }
    };
  }, [audioPlaying]);

  useEffect(() => {
    if (currentItemIndex >= clothingItems.length) {
      setGameWon(true);
      setAvatar('happy');
    }
  }, [currentItemIndex, clothingItems.length]);

  // Hide pre-game confetti
  useEffect(() => {
    if (showPreGameConfetti) {
      const timer = setTimeout(() => {
        setShowPreGameConfetti(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPreGameConfetti]);

  // Sound functions
  const playCorrectSound = () => {
    audioManager.playAudio('correct', 0.8, true);
  };

  const playWrongSound = () => {
    audioManager.playAudio('wrong', 0.8, true);
    
    
  };

  const playYaySound = () => {
    audioManager.playAudio('yay', 0.8, true);
  };

  const playInstructionSound = () => {
    audioManager.playAudio('instruction', 0.7, true);
  };

  const toggleBackgroundMusic = () => {
    if (backgroundAudioRef.current) {
      if (audioPlaying) {
        backgroundAudioRef.current.pause();
        setAudioPlaying(false);
      } else {
        backgroundAudioRef.current.play().then(() => {
          setAudioPlaying(true);
        }).catch(error => {
          console.log('Background audio play failed:', error);
        });
      }
    }
  };

  const createBubbleBurst = (position) => {
    const id = Date.now() + Math.random();
    setBubbleBursts(prev => [...prev, { id, position }]);
    
    setTimeout(() => {
      setBubbleBursts(prev => prev.filter(bubble => bubble.id !== id));
    }, 600);
  };

  // Progress saving
  // Replace the existing handleSaveProgress function with:
  const handleSaveProgress = async () => {
    if (!lessonId) return;
    
    setProgressSaving(true);
    
    try {
      const studentId = getStudentId();
      const lessonIdNum = parseInt(lessonId, 10);
      const score = calculateScore();
      
      console.log('Saving progress with:', { studentId, lessonId: lessonIdNum, score });
      
      if (!studentId || !lessonIdNum) {
        throw new Error(`Missing IDs: studentId=${studentId}, lessonId=${lessonIdNum}`);
      }
      
      // Use the progress service function
      const result = await saveStudentLessonProgress(
        studentId,
        lessonIdNum,
        {
          score: score,
          maxScore: 100,
          completed: true,
          starsEarned: getStarRating(score)
        }
      );
      
      console.log('Progress save result:', result);
      
      if (result.success || result.queued) {
        setProgressSaved(true);
        console.log('Progress saved or queued successfully');
      } else {
        throw new Error('Progress save failed');
      }
      
    } catch (error) {
      console.error('Save error:', error);
      setProgressSaved(false);
    } finally {
      setProgressSaving(false);
    }
  };

  const calculateScore = () => {
    const percentage = (correctItems / clothingItems.length) * 100;
    return Math.round(percentage);
  };

  const generateConfetti = () => {
    const pieces = [];
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9', '#FF7979', '#6C5CE7', '#A29BFE'];
    
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        width: 8 + Math.random() * 12,
        height: 8 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        drift: Math.random() - 0.5
      });
    }
    
    setConfettiPieces(pieces);
  };

  const animateStars = () => {
    let stage = 0;
    const interval = setInterval(() => {
      setStarAnimationStage(stage + 1);
      stage++;
      
      if (stage >= 3) {
        clearInterval(interval);
      }
    }, 300);
  };

  const getStarRating = (score) => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  // Update handleNextLevel to ensure progress is saved
  const handleNextLevel = async () => {
    try {
      // Ensure progress is saved before navigating
      if (!progressSaved && !progressSaving) {
        await handleSaveProgress();
      }
      
      if (lessonId) {
        navigate(`/lesson/household-chores/level-2/${lessonId}`);
      } else {
        navigate('/lesson/household-chores/level-2');
      }
      
    } catch (error) {
      console.log('Next level functionality:', error);
      navigate('/lesson/household-chores/level-2');
    }
  };

  // In your handleStartGame function:
const handleStartGame = () => {
  audioManager.initAudioContext();
  setShowStartScreen(false);
  setShowPreGameConfetti(true);
  
  // Play instruction sound ONCE when game starts (not in start screen)
  setTimeout(() => {
    if (!instructionPlayed) {
      audioManager.playAudio('instruction', 0.7, true);
      setInstructionPlayed(true);
    }
  }, 1000);
};
  const handleDragStart = (item) => {
    setDraggedItem(item);
    setUserHasInteracted(true);
    setHintActive(false);
    
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2 - 100;
    createBubbleBurst({ x: startX, y: startY });
  };

  const handleDragOver = (e, machineType) => {
    e.preventDefault();
    setDragOverMachine(machineType);
  };

  const handleDragLeave = () => {
    setDragOverMachine(null);
  };

  const handleDrop = (e, machineType) => {
    e.preventDefault();
    setDragOverMachine(null);
    
    if (!draggedItem) return;

    const isCorrect = draggedItem.type === machineType;

    if (isCorrect) {
      setAvatar('happy');
      setCorrectItems(prev => prev + 1);
      
      playCorrectSound();
      
      const clothingItemRect = e.currentTarget.getBoundingClientRect();
      setConfettiPosition({
        x: clothingItemRect.left + clothingItemRect.width / 2,
        y: clothingItemRect.top + clothingItemRect.height / 2
      });
      
      setShowConfetti(true);
      
      createBubbleBurst({
        x: clothingItemRect.left + clothingItemRect.width / 2,
        y: clothingItemRect.top + clothingItemRect.height / 2
      });
      
      setTimeout(() => setShowConfetti(false), 2000);
      
      setTimeout(() => {
        setCurrentItemIndex(prev => prev + 1);
        setAvatar('wonder');
      }, 1000);
      
    } else {
      setWrongDrop(true);
      playWrongSound();
      
      
      const machineRect = e.currentTarget.getBoundingClientRect();
      createBubbleBurst({
        x: machineRect.left + machineRect.width / 2,
        y: machineRect.top + machineRect.height / 2
      });
      
      setTimeout(() => setWrongDrop(false), 600);
    }
    
    setDraggedItem(null);
  };

  // Update resetGame function to reset progress states
  const resetGame = () => {
    setCurrentItemIndex(0);
    setCorrectItems(0);
    setGameWon(false);
    setAvatar('wonder');
    setProgressSaved(false);
    setProgressSaving(false);
    setStarAnimationStage(0);
    setConfettiPieces([]);
  };

  const handleGoHome = () => {
    navigate('/studentdashboard');
  };

  // Update handleContinue to ensure progress is saved
  const handleContinue = async () => {
    if (!progressSaved && !progressSaving) {
      await handleSaveProgress();
    }
    navigate('/studentdashboard');
  };

  const avatarImages = {
    wonder: wonderingImg,
    happy: happyImg
  };

  // Start screen
  if (showStartScreen) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${laundryBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
      }}>
        <Navbar />
        
        {/* Hidden audio elements */}
        <audio ref={instructionAudioRef} preload="auto">
          <source src={instructionSoundEffect} type="audio/mpeg" />
        </audio>
        <audio ref={correctAudioRef} preload="auto">
          <source src={correctSoundEffect} type="audio/mpeg" />
        </audio>
        <audio ref={wrongAudioRef} preload="auto">
          <source src={wrongSoundEffect} type="audio/mpeg" />
        </audio>
        <audio ref={tryAgainAudioRef} preload="auto">
          <source src={tryagainSoundEffect} type="audio/mpeg" />
        </audio>
        <audio ref={yayAudioRef} preload="auto">
          <source src={yaySoundEffect} type="audio/mpeg" />
        </audio>
        
        {/* Pre-game Clothing Confetti */}
        <AnimatePresence>
          {showPreGameConfetti && (
            <>
              {clothingItems.map((item, index) => {
                const startX = Math.random() * window.innerWidth;
                const startY = -100;
                const endY = window.innerHeight + 100;
                const rotation = Math.random() * 360;
                const duration = 2 + Math.random() * 2;
                const delay = Math.random() * 1.5;
                
                return (
                  <motion.div
                    key={`pre-confetti-${item.id}`}
                    initial={{ 
                      x: startX,
                      y: startY,
                      opacity: 1,
                      scale: 0.8,
                      rotate: 0
                    }}
                    animate={{ 
                      x: startX + (Math.random() - 0.5) * 200,
                      y: endY,
                      opacity: 0,
                      scale: 0.4,
                      rotate: rotation
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      duration: duration,
                      delay: delay,
                      ease: "easeInOut"
                    }}
                    style={{
                      position: "fixed",
                      width: "200px",
                      height: "200px",
                      zIndex: 25,
                      pointerEvents: "none"
                    }}
                  >
                    <img 
                      src={item.image} 
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                      }}
                    />
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(144, 190, 109, 0.8) 0%, rgba(25, 130, 196, 0.8) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 1
        }}>
          <h1 style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            fontFamily: 'Poppins, sans-serif',
            fontSize: isTablet ? '3rem' : '5rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            Laundry Sorting
          </h1>
          
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.95)', 
            marginBottom: '3rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: isTablet ? '1.2rem' : '1.5rem',
            lineHeight: 1.5,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            maxWidth: isTablet ? '500px' : '600px',
            padding: '0 1rem'
          }}>
            Learn how to sort laundry by color! Separate whites from colors to keep your clothes looking their best.
          </p>
          
          <button 
            onClick={handleStartGame}
            style={{ 
              background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              padding: isTablet ? '0.875rem 3rem' : '1rem 4rem',
              borderRadius: '25px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: isTablet ? '1.25rem' : '1.5rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Start Sorting!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh",
      width: "100%",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      backgroundColor: "#f0f0f0"
    }}>
      {/* Hidden audio elements */}
      <audio ref={instructionAudioRef} preload="auto">
        <source src={instructionSoundEffect} type="audio/mpeg" />
      </audio>
      <audio ref={correctAudioRef} preload="auto">
        <source src={correctSoundEffect} type="audio/mpeg" />
      </audio>
      <audio ref={wrongAudioRef} preload="auto">
        <source src={wrongSoundEffect} type="audio/mpeg" />
      </audio>
      <audio ref={tryAgainAudioRef} preload="auto">
        <source src={tryagainSoundEffect} type="audio/mpeg" />
      </audio>
      <audio ref={yayAudioRef} preload="auto">
        <source src={yaySoundEffect} type="audio/mpeg" />
      </audio>

      {/* Simplified Pointing Finger Hint */}
        {/*<AnimatePresence>
          {showHint && hintActive && currentItem && !gameWon && !userHasInteracted && (
            <motion.div
              key={`hint-${currentItem.id}`}
              initial={{ 
                opacity: 0,
                x: hintPosition.x,
                y: hintPosition.y,
                scale: 0.8
              }}
              animate={{ 
                opacity: [0, 1, 1],
                x: hintTargetPosition.x,
                y: hintTargetPosition.y,
                scale: 1
              }}
              exit={{ 
                opacity: 0,
                scale: 0.8
              }}
              transition={{ 
                duration: 0.8,
                repeat: 4,
                repeatDelay: 1.5,
                ease: "easeOut"
              }}
              style={{
                position: "fixed",
                width: isTablet ? "150px" : "200px",
                height: isTablet ? "150px" : "200px",
                zIndex: 999,
                pointerEvents: "none",
                transform: "translate(-50%, -50%)",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
              }}
            >
              <img 
                src={pointFingerImg} 
                alt="Pointing Hint"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>*/}

      {/* Progress Indicator */}
      {!gameWon && (
        <Box sx={{ 
          position: 'fixed',
          top: isTablet ? '10px' : '0px',
          left: 0,
          right: 0,
          zIndex: 1000,
          px: isTablet ? 1 : 2,
          pt: isTablet ? 0.5 : 1
        }}>
          <Box sx={{ 
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <Typography variant="h6" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              mb: 1,
              display: 'inline-block'
            }}>
              Step {currentItemIndex + 1}/{clothingItems.length}: Sort Laundry
            </Typography>

            <LinearProgress 
              variant="determinate" 
              value={(correctItems / clothingItems.length) * 100} 
              sx={{ 
                height: 12, 
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '10px',
                  backgroundColor: '#4CAF50'
                }
              }} 
            />
          </Box>

          {/* Instructions Section with STRONG Blinking Background */}
            <Box sx={{ 
              textAlign: 'center',
              position: 'relative',
              zIndex: 1010,
              mt: 1,
            }}>
              <Typography variant="body1" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: 'rgba(25, 130, 196, 0.95)',
                animation: 'strongBlink 1.5s infinite',
                display: 'inline-block',
                px: isTablet ? 2 : 3,
                py: isTablet ? 0.75 : 1,
                borderRadius: '15px',
                fontSize: isTablet ? '0.9rem' : '1rem',
                boxShadow: '0 4px 15px rgba(25, 130, 196, 0.4)',
                transform: 'scale(1)',
                '@keyframes strongBlink': {
                  '0%, 100%': {
                    backgroundColor: 'rgba(25, 130, 196, 0.95)',
                    boxShadow: '0 4px 15px rgba(25, 130, 196, 0.4)',
                    transform: 'scale(1)'
                  },
                  '25%': {
                    backgroundColor: 'rgba(0, 80, 150, 1)',
                    boxShadow: '0 0 25px rgba(0, 100, 255, 0.8)',
                    transform: 'scale(1.02)'
                  },
                  '50%': {
                    backgroundColor: 'rgba(40, 170, 255, 1)',
                    boxShadow: '0 0 30px rgba(100, 180, 255, 0.9)',
                    transform: 'scale(1.05)'
                  },
                  '75%': {
                    backgroundColor: 'rgba(0, 100, 180, 1)',
                    boxShadow: '0 0 20px rgba(50, 150, 255, 0.7)',
                    transform: 'scale(1.03)'
                  }
                }
              }}>
                {currentItem && `Drag the ${currentItem.name.toLowerCase()} to the correct washing machine!`}
                {!currentItem && 'Sort all the clothes into the correct washing machines!'}
              </Typography>
            </Box>
        </Box>
      )}

      {/* Audio Control Button */}
      <Box sx={{ 
        position: 'fixed',
        top: isTablet ? '80px' : '100px',
        right: isTablet ? '15px' : '20px',
        zIndex: 1000
      }}>
        <Button
          onClick={toggleBackgroundMusic}
          sx={{
            minWidth: isTablet ? '50px' : '60px',
            width: isTablet ? '50px' : '60px',
            height: isTablet ? '50px' : '60px',
            borderRadius: '50%',
            background: audioPlaying 
              ? 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)'
              : 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
            color: 'white',
            fontSize: isTablet ? '1.25rem' : '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
            }
          }}
        >
          {audioPlaying ? '🔊' : '🔇'}
        </Button>
      </Box>

      {/* Wrong Image Display */}
      <AnimatePresence>
        {wrongDrop && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: "20%",
              left: "25%",
              transform: "translate(-50%, -50%)",
              zIndex: 1001,
              pointerEvents: "none"
            }}
          >
            <img 
              src={wrongImg} 
              alt="Wrong"
              style={{
                width: isTablet ? "180px" : "250px",
                height: isTablet ? "180px" : "250px",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 8px rgba(255,0,0,0.5))"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Dialog */}
      // Success Dialog
<Dialog
  open={gameWon}
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
  onEnter={() => {
    generateConfetti();
    animateStars();
    handleSaveProgress();
  }}
>
  {/* Confetti Effect */}
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
    zIndex: 1001,
    px: isTablet ? 2 : 4,
    py: isTablet ? 4 : 6
  }}>
    {/* Trophy Icon - Updated to match reference */}
    <Box sx={{ 
      mb: 4,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Box
        sx={{
          width: isTablet ? '120px' : '150px',
          height: isTablet ? '120px' : '150px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(255, 215, 0, 0.5)',
          border: '5px solid white',
          animation: 'trophyGlow 2s ease-in-out infinite',
          '@keyframes trophyGlow': {
            '0%, 100%': { 
              transform: 'scale(1)',
              boxShadow: '0 10px 30px rgba(255, 215, 0, 0.5)'
            },
            '50%': { 
              transform: 'scale(1.05)',
              boxShadow: '0 15px 40px rgba(255, 215, 0, 0.8)'
            }
          }
        }}
      >
        <Typography 
          sx={{ 
            fontSize: isTablet ? '60px' : '80px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          🏆
        </Typography>
      </Box>
    </Box>
    
    <Typography variant="h1" sx={{ 
      fontWeight: 'bold',
      color: 'white',
      fontFamily: 'Poppins, sans-serif',
      fontSize: isTablet ? '2rem' : '3rem',
      textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
      mb: 2
    }}>
      Perfectly Sorted Laundry!
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
    
    {/* Progress Saving Status */}
    <Box sx={{ mb: 4 }}>
      {progressSaving && (
        <Box sx={{ 
          mb: 2, 
          p: 2, 
          backgroundColor: 'rgba(25, 130, 196, 0.8)', 
          borderRadius: '15px',
          color: 'white',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            width: 20, 
            height: 20, 
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            }
          }} />
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Saving your progress...
          </Typography>
        </Box>
      )}

      {progressSaved && (
        <Box sx={{ 
          mb: 2,
          p: 2, 
          backgroundColor: 'rgba(144, 190, 109, 0.8)', 
          borderRadius: '15px',
          color: 'white',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ fontSize: 24, display: 'flex', alignItems: 'center' }}>
            ✓
          </Box>
          <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif' }}>
            Progress saved successfully!
          </Typography>
        </Box>
      )}
    </Box>
    
    
    {/* THREE BUTTONS - Updated to match reference */}
    <Box sx={{ 
      display: 'flex', 
      gap: 3, 
      justifyContent: 'center', 
      flexWrap: 'wrap',
      maxWidth: '800px',
      mx: 'auto'
    }}>
      {/* Sort Again Button */}
      <Button 
        onClick={() => {
          resetGame();
          setGameWon(false);
        }} 
        variant="contained"
        sx={{ 
          background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
          color: 'white',
          px: isTablet ? 4 : 6,
          py: isTablet ? 1.5 : 2,
          borderRadius: '25px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '700',
          fontSize: isTablet ? '1rem' : '1.2rem',
          textTransform: 'none',
          boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          minWidth: isTablet ? '180px' : '200px',
          '&:hover': { 
            background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 30px rgba(255, 89, 94, 0.7)'
          },
          '&:disabled': {
            opacity: 0.7
          }
        }}
      >
        Sort Again
      </Button>
      
      {/* Go Home Button */}
      <Button 
        variant="contained"
        onClick={handleGoHome}
        sx={{ 
          background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
          color: 'white',
          px: isTablet ? 4 : 6,
          py: isTablet ? 1.5 : 2,
          borderRadius: '25px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '700',
          fontSize: isTablet ? '1rem' : '1.2rem',
          textTransform: 'none',
          boxShadow: '0 10px 25px rgba(25, 130, 196, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          minWidth: isTablet ? '180px' : '200px',
          '&:hover': { 
            background: 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 30px rgba(25, 130, 196, 0.7)'
          },
          '&:disabled': {
            opacity: 0.7
          }
        }}
      >
        Go Home
      </Button>
      
      {/* Next Level Button */}
      <Button 
        variant="contained"
        onClick={handleNextLevel}
        disabled={progressSaving}
        sx={{ 
          background: 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)',
          color: 'white',
          px: isTablet ? 4 : 6,
          py: isTablet ? 1.5 : 2,
          borderRadius: '25px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '700',
          fontSize: isTablet ? '1rem' : '1.2rem',
          textTransform: 'none',
          boxShadow: '0 10px 25px rgba(144, 190, 109, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          minWidth: isTablet ? '180px' : '200px',
          '&:hover': { 
            background: 'linear-gradient(135deg, #A8D08D 0%, #90BE6D 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 30px rgba(144, 190, 109, 0.7)'
          }
        }}
      >
        {progressSaving ? 'Saving...' : 'Next Level'}
      </Button>
    </Box>
  </Box>
</Dialog>

      {/* PROPER LAYERING ORDER */}

      {/* 1. Blurred Background - Lowest layer */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${laundryBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: "blur(3px)",
        zIndex: 0,
        opacity: 0.7
      }} />

      {/* 2. INSTANT VISIBLE Bubbles - High z-index */}
      <BubblesBackground />

      {/* 3. Bubble Burst Effects - Very high z-index */}
      <AnimatePresence>
        {bubbleBursts.map(bubble => (
          <BubbleBurstEffect
            key={bubble.id}
            position={bubble.position}
          />
        ))}
      </AnimatePresence>

      {/* 4. Confetti Effect - Very high z-index */}
      <AnimatePresence>
        {showConfetti && (
          <div style={{
            position: "absolute",
            left: confettiPosition.x,
            top: confettiPosition.y,
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            pointerEvents: "none"
          }}>
            {[...Array(25)].map((_, i) => {
              const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9', '#FF7979', '#6C5CE7', '#A29BFE'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              const randomAngle = Math.random() * Math.PI * 2;
              const randomDistance = 50 + Math.random() * 100;
              const randomDelay = Math.random() * 0.3;
              const randomDuration = 1 + Math.random() * 0.5;
              const randomSize = 8 + Math.random() * 12;
              
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotate: 0
                  }}
                  animate={{ 
                    x: Math.cos(randomAngle) * randomDistance,
                    y: Math.sin(randomAngle) * randomDistance - 50,
                    opacity: 0,
                    scale: 0.3,
                    rotate: Math.random() * 360
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: randomDuration,
                    delay: randomDelay,
                    ease: "easeOut"
                  }}
                  style={{
                    position: "absolute",
                    width: `${randomSize}px`,
                    height: `${randomSize}px`,
                    backgroundColor: randomColor,
                    borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* 5. Main Game Content - Highest layer for interactive elements */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 200,
        padding: isTablet ? "0.5rem" : "1rem",
        overflow: "hidden"
      }}>
        <div style={{
          width: "100%",
          height: "100%",
          maxWidth: isTablet ? "1200px" : "1600px",
          position: "relative",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: isTablet ? "1rem" : "2rem",
          flexWrap: isTablet ? "wrap" : "nowrap"
        }}>
          {/* LEFT SIDE - Character and Basket */}
          {!gameWon && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: isTablet ? "0.5rem" : "1rem",
              position: "relative",
              width: isTablet ? "45%" : "100%",
              height: "100%",
              minWidth: isTablet ? "300px" : "auto"
            }}>
              {/* Laundry Basket Container - Positioned normally */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                zIndex: 200,
                marginLeft: isTablet ? "200px" : "400px",
                marginBottom: isTablet ? "100px" : "200px",
                transform: isTablet ? "translateY(30px)" : "translateY(50px)"
              }}>
                {/* Single Clothing Item Above Basket - Responsive size */}
                <div style={{
                  minHeight: isTablet ? "100px" : "150px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  marginBottom: "0.2rem",
                  zIndex: 200,
                }}>
                  <AnimatePresence mode="popLayout">
                    {currentItem && (
                      <motion.div
                        key={currentItem.id}
                        data-item-id={currentItem.id}
                        initial={{ 
                          opacity: 0, 
                          scale: 0.3, 
                          y: 100,
                          rotate: -10
                        }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1, 
                          rotate: 0,
                          x: wrongDrop ? [-20, 20, -20, 20, 0] : 0,
                          y: wrongDrop ? 0 : [20, 10, 20, 15, 20],
                        }}
                        exit={{ 
                          opacity: 0, 
                          scale: 0.5, 
                          y: -80,
                          rotate: 10
                        }}
                        transition={{ 
                          duration: 0.7,
                          type: "spring",
                          stiffness: 120,
                          damping: 12,
                          x: { 
                            duration: 0.6,
                            ease: "easeInOut"
                          },
                          y: {
                            duration: 3,
                            repeat: wrongDrop ? 0 : Infinity,
                            ease: "easeInOut",
                            repeatType: "loop"
                          }
                        }}
                        whileHover={{
                          y: 20,
                          scale: 1.2,
                          filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
                          transition: {
                            duration: 0.3,
                            ease: "easeOut"
                          }
                        }}
                        draggable
                        onDragStart={() => handleDragStart(currentItem)}
                        onDragEnd={(e) => {
                          e.target.style.opacity = '1';
                        }}
                        style={{
                          width: isTablet ? "250px" : "400px",
                          height: isTablet ? "250px" : "400px",
                          cursor: "grab",
                          filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.3))",
                          position: "relative",
                          zIndex: 200
                        }}
                      >
                        <img 
                          src={currentItem.image} 
                          alt={currentItem.name}
                          draggable={false}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            pointerEvents: "none",
                            marginBottom: "-10px"
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Laundry Basket */}
                <img 
                  src={basketImg}
                  alt="Laundry Basket"
                  style={{
                    width: isTablet ? "200px" : "300px",
                    height: "auto",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.3))",
                    zIndex: 200,
                    top: isTablet ? "-20px" : "-30px"
                  }}
                />
              </div>

              {/* Responsive Character - Positioned in Bottom Left Corner */}
              <motion.img 
                src={avatarImages[avatar]} 
                alt={avatar === 'wonder' ? 'Wondering' : 'Happy'}
                animate={{ scale: avatar === 'happy' ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 3 }}
                style={{
                  width: isTablet ? "750px" : "950px",
                  height: isTablet ? "750px" : "950px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
                  position: "absolute",
                  left: isTablet ? "-80px" : "-100px",
                  transform: isTablet
                    ? "scale(1.0) translateY(-15px)"
                    : "scale(1.2) translateY(-25px)",
                  zIndex: 150,
                  pointerEvents: "none"
                }}
              />
            </div>
          )}

        {/* RIGHT SIDE - Two Washing Machines */}
            {!gameWon && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: isTablet ? "1rem" : "2rem",
                  marginTop: isTablet ? "-30px" : "-60px",
                  width: "100%",
                }}
              >
                {/* WHITE MACHINE */}
                <div
                  onDragOver={(e) => handleDragOver(e, "whites")}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "whites")}
                  style={{
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    transform:
                      dragOverMachine === "whites"
                        ? "scale(1.08) translateY(10px)"
                        : "translateY(20px)",
                    filter:
                      dragOverMachine === "whites"
                        ? "drop-shadow(0 0 30px rgba(255,255,255,1))"
                        : "drop-shadow(0 6px 15px rgba(0,0,0,0.25))",
                    marginRight: isTablet ? "-0.5rem" : "-5rem",
                    marginLeft: isTablet ? "-20px" : "-40px"
                  }}
                >
                  <img
                    src={washingMachine2Img}
                    alt="White Washing Machine"
                    style={{
                      width: isTablet ? "320px" : "500px",
                      height: isTablet ? "320px" : "500px",
                      objectFit: "contain",
                      marginBottom: "-10px",
                      maxWidth: "none !important",
                      minWidth: isTablet ? "300px" : "500px",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: isTablet ? "2.2rem" : "3.2rem",
                      fontWeight: "bold",
                      margin: "0",
                      color: "#fff",
                      fontFamily: "Poppins, sans-serif",
                      textShadow: "3px 3px 8px rgba(0,0,0,0.4)",
                      letterSpacing: "3px",
                      marginTop: "-80px",
                    }}
                  >
                    WHITES
                  </h2>
                </div>

                {/* COLOR MACHINE */}
                <div
                  onDragOver={(e) => handleDragOver(e, "colors")}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, "colors")}
                  style={{
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    transform:
                      dragOverMachine === "colors"
                        ? "scale(1.08) translateY(10px)"
                        : "translateY(20px)",
                    filter:
                      dragOverMachine === "colors"
                        ? "drop-shadow(0 0 30px rgba(156, 39, 176, 1))"
                        : "drop-shadow(0 6px 15px rgba(0,0,0,0.25))",
                     marginLeft: isTablet ? "-0.5rem" : "-5rem",
                  }}
                >
                  <img
                    src={washingMachine1Img}
                    alt="Colour Washing Machine"
                    style={{
                      width: isTablet ? "320px" : "500px",
                      height: isTablet ? "320px" : "500px",
                      objectFit: "contain",
                      marginBottom: "-10px",
                      maxWidth: "none !important",
                      minWidth: isTablet ? "300px" : "500px",
                    }}
                  />
                  <h2
                    style={{
                      fontSize: isTablet ? "2.2rem" : "3.2rem",
                      fontWeight: "bold",
                      margin: "0",
                      fontFamily: "Poppins, sans-serif",
                      textShadow: "3px 3px 8px rgba(0,0,0,0.4)",
                      letterSpacing: "3px",
                      background:
                        "linear-gradient(90deg, #E74C3C, #F39C12, #27AE60, #3498DB, #9B59B6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      marginTop: "-80px",
                    }}
                  >
                    COLOURS
                  </h2>
                </div>
              </div>
            )}

          {/* Bottom Buttons */}
          {!gameWon && (
            <div style={{
              position: "fixed",
              bottom: isTablet ? "0.5rem" : "1rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: isTablet ? "1rem" : "1.5rem",
              justifyContent: "center",
              zIndex: 1000,
              flexWrap: "wrap"
            }}>
              <button
                onClick={resetGame}
                style={{
                  background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  padding: isTablet ? '0.75rem 2rem' : '0.875rem 2.5rem',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: isTablet ? '1rem' : '1.125rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(255, 89, 94, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px rgba(255, 89, 94, 0.5)';
                }}
              >
                Start Over
              </button>
              
              <button
                onClick={handleGoHome}
                style={{
                  background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                  color: 'white',
                  padding: isTablet ? '0.75rem 2rem' : '0.875rem 2.5rem',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: isTablet ? '1rem' : '1.125rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(25, 130, 196, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(25, 130, 196, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px rgba(25, 130, 196, 0.5)';
                }}
              >
                Go Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseholdLevel1;