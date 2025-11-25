import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Button, Stack, LinearProgress, Chip, Typography, Dialog } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

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
import whiteShortsImg from '../../assets/householdLevel1/WhiteShort.png';
import washingMachine1Img from '../../assets/householdLevel1/WashingMachine1.png';
import washingMachine2Img from '../../assets/householdLevel1/WashingMachine2.png';
import wonderingImg from '../../assets/householdLevel1/Wondering.png';
import happyImg from '../../assets/householdLevel1/Happy.png';
import basketImg from '../../assets/householdLevel1/Basket.png';
import laundryBgImg from '../../assets/householdLevel1/BackgroundLaundry.png';
import bubbleImg from '../../assets/householdLevel1/bubble2.png';
import wrongImg from '../../assets/householdLevel1/Wrong1.png';

import Navbar from '../Navbar';

// Import sound effects
import yaySoundEffect from '../../assets/householdLevel1/correct-sound.mp3';
import laundryBackgroundMusic from '../../assets/householdLevel1/LaundryBackgroungMusic.mp3';
import wrongSoundEffect from '../../assets/householdLevel1/WrongSoundEffect .mp3';

// Import services for progress tracking
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// BUBBLES INSTANTLY VISIBLE THROUGHOUT SCREEN
const BubblesBackground = () => {
  const bubbles = Array.from({ length: 30 }, (_, i) => {
    const size = 50 + Math.random() * 100; // 50px to 150px
    const left = Math.random() * 100;
    
    // Start at random positions throughout the screen height
    const startY = Math.random() * 120; // -20% to 100% (some above, some below)
    const endY = -20 - Math.random() * 30; // End above screen
    
    const duration = 15 + Math.random() * 20; // 15-35 seconds
    
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
          delay: 0, // No delay
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
  

  // Detect tablet size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);


  const handleNextLevel = () => {
    try {
      // Try to save progress (with error handling)
      try {
        saveStudentLessonProgress('household', 'level2', 100);
      } catch (error) {
        console.log('Progress saving not available in demo');
      }
      
      try {
        updateModuleProgress('household', 'level2');
      } catch (error) {
        console.log('Module progress update not available in demo');
      }
      
      // Navigate to next level
      if (lessonId) {
        navigate(`/lesson/household-chores/level-2/${lessonId}`);
      } else {
        navigate('/lesson/household-chores/level-2');
      }
      
    } catch (error) {
      console.log('Next level functionality:', error);
      // Fallback navigation
      navigate('/lesson/household-chores/level-2');
    }
  };
  
  // Audio states
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [backgroundAudioRef, setBackgroundAudioRef] = useState(null);

  // Create audio ref for sound effects
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

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
    { id: 13, name: 'White Shorts', type: 'whites', image: whiteShortsImg },
  ];

  const currentItem = clothingItems[currentItemIndex];

  // Background music setup
  useEffect(() => {
    const audio = new Audio(laundryBackgroundMusic);
    audio.loop = true;
    audio.volume = 0.3;
    setBackgroundAudioRef(audio);

    const playAudio = () => {
      audio.play().then(() => {
        setAudioPlaying(true);
      }).catch(error => {
        console.log('Audio autoplay prevented:', error);
      });
    };

    const timer = setTimeout(playAudio, 1000);

    return () => {
      clearTimeout(timer);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (currentItemIndex >= clothingItems.length) {
      setGameWon(true);
      setAvatar('happy');
    }
  }, [currentItemIndex, clothingItems.length]);

  // Hide pre-game confetti after animation
  useEffect(() => {
    if (showPreGameConfetti) {
      const timer = setTimeout(() => {
        setShowPreGameConfetti(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPreGameConfetti]);

  // Function to play sound effect
  const playSuccessSound = () => {
    if (correctAudioRef.current) {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  // Function to play wrong sound
  const playWrongSound = () => {
    if (wrongAudioRef.current) {
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play().catch(error => {
        console.log('Wrong audio play failed:', error);
      });
    }
  };

  // Function to create bubble burst
  const createBubbleBurst = (position) => {
    const id = Date.now() + Math.random();
    setBubbleBursts(prev => [...prev, { id, position }]);
    
    // Remove bubble burst after animation
    setTimeout(() => {
      setBubbleBursts(prev => prev.filter(bubble => bubble.id !== id));
    }, 600);
  };

  const handleStartGame = () => {
    setShowStartScreen(false);
    setShowPreGameConfetti(true);
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
    
    // Create bubble burst at drag start position
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
      
      // Play success sound effect
      playSuccessSound();
      
      // Get the position of the clothing item for confetti
      const clothingItemRect = e.currentTarget.getBoundingClientRect();
      setConfettiPosition({
        x: clothingItemRect.left + clothingItemRect.width / 2,
        y: clothingItemRect.top + clothingItemRect.height / 2
      });
      
      setShowConfetti(true);
      
      // Create bubble burst at drop position
      createBubbleBurst({
        x: clothingItemRect.left + clothingItemRect.width / 2,
        y: clothingItemRect.top + clothingItemRect.height / 2
      });
      
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Move to next item after animation
      setTimeout(() => {
        setCurrentItemIndex(prev => prev + 1);
        setAvatar('wonder');
      }, 1000);
      
    } else {
      // Wrong drop - shake animation and show wrong image
      setWrongDrop(true);
      
      // Play wrong sound effect
      playWrongSound();
      
      // Show wrong image effect
      const machineRect = e.currentTarget.getBoundingClientRect();
      createBubbleBurst({
        x: machineRect.left + machineRect.width / 2,
        y: machineRect.top + machineRect.height / 2
      });
      
      setTimeout(() => setWrongDrop(false), 600);
    }
    
    setDraggedItem(null);
  };

  const resetGame = () => {
    setCurrentItemIndex(0);
    setCorrectItems(0);
    setGameWon(false);
    setAvatar('wonder');
  };

  const handleGoHome = () => {
    navigate('/homepage');
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
        {/* Navbar - Only in Start Screen */}
        <Navbar />
        
        {/* Hidden audio elements */}
        <audio ref={correctAudioRef} preload="auto">
          <source src={yaySoundEffect} type="audio/mpeg" />
        </audio>
        <audio ref={wrongAudioRef} preload="auto">
          <source src={wrongSoundEffect} type="audio/mpeg" />
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
      backgroundColor: "#f0f0f0" // Added fallback background color
    }}>
      {/* Progress Indicator - Only show when game is not won */}
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
          {/* Progress Bar Section */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ 
            maxWidth: isTablet ? '600px' : '800px', 
            mx: 'auto',
            flexWrap: 'wrap'
          }}>
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: isTablet ? 1 : 2,
              py: isTablet ? 0.5 : 1,
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              fontSize: isTablet ? '0.9rem' : '1rem'
            }}>
              Step {currentItemIndex + 1}/{clothingItems.length}: Sort Laundry
            </Typography>
          </Stack>
          
          <Box sx={{ maxWidth: isTablet ? '600px' : '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={(correctItems / clothingItems.length) * 100} 
              sx={{ 
                height: isTablet ? 6 : 8, 
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '10px',
                  backgroundColor: '#90BE6D'
                }
              }} 
            />
          </Box>

          {/* Instructions Section */}
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
              backgroundColor: 'rgba(25, 130, 196, 0.9)',
              display: 'inline-block',
              px: isTablet ? 2 : 3,
              py: isTablet ? 0.75 : 1,
              borderRadius: '15px',
              fontSize: isTablet ? '0.9rem' : '1rem',
              boxShadow: '0 4px 15px rgba(25, 130, 196, 0.4)'
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
          onClick={() => {
            if (backgroundAudioRef) {
              if (audioPlaying) {
                backgroundAudioRef.pause();
                setAudioPlaying(false);
              } else {
                backgroundAudioRef.play().then(() => {
                  setAudioPlaying(true);
                }).catch(error => {
                  console.log('Audio play failed:', error);
                });
              }
            }
          }}
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
      >
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
          {[...Array(50)].map((_, i) => {
            const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9', '#FF7979', '#6C5CE7', '#A29BFE'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            return (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${8 + Math.random() * 12}px`,
                  height: `${8 + Math.random() * 12}px`,
                  backgroundColor: randomColor,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  boxShadow: `0 0 10px ${randomColor}`,
                  animation: `confettiFall 4s linear infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  '@keyframes confettiFall': {
                    '0%': {
                      transform: `translateY(-100vh) rotate(${Math.random() * 360}deg) scale(0.8)`,
                      opacity: 1
                    },
                    '10%': {
                      opacity: 1,
                      transform: `translateY(-90vh) rotate(${Math.random() * 360}deg) scale(1)`
                    },
                    '90%': {
                      opacity: 0.8,
                      transform: `translateY(90vh) translateX(${(Math.random() - 0.5) * 60}px) rotate(${Math.random() * 360}deg) scale(0.6)`
                    },
                    '100%': {
                      transform: `translateY(100vh) translateX(${(Math.random() - 0.5) * 70}px) rotate(${Math.random() * 360}deg) scale(0)`,
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
          zIndex: 1001
        }}>
          <Box sx={{ 
            fontSize: isTablet ? 100 : 150,
            color: 'white',
            mb: 4
          }}>
            🏆
          </Box>
          
          <Typography variant="h1" sx={{ 
            fontWeight: 'bold',
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            fontSize: isTablet ? '2rem' : '3rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            mb: 2
          }}>
            Perfectly Cleaned Bathroom!
          </Typography>
          
          <Chip 
            label="Bathroom Cleaning Level Completed!"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: isTablet ? '1rem' : '1.1rem',
              fontFamily: 'Poppins, sans-serif',
              mb: 4,
              px: isTablet ? 2 : 3,
              py: 1
            }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            {[...Array(3)].map((_, i) => (
              <Box 
                key={i}
                sx={{ 
                  color: 'white',
                  fontSize: isTablet ? 60 : 80,
                  mx: 1,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  animation: `starPop 0.6s ease-out ${i * 0.2}s both`,
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
              >
                ⭐
              </Box>
            ))}
          </Box>
          
          <Typography variant="h6" sx={{ 
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
            mb: 6,
            maxWidth: isTablet ? '90%' : '800px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontSize: isTablet ? '1rem' : '1.25rem'
          }}>
            Excellent work! You've successfully completed all 4 cleaning steps - laundry, trash disposal, floor sweeping, and wall wiping!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              onClick={() => {
                resetGame();
              }} 
              variant="outlined"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                px: isTablet ? 3 : 4,
                py: isTablet ? 1.5 : 2,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '600',
                fontSize: isTablet ? '1rem' : '1.2rem',
                borderWidth: '2px',
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderWidth: '2px'
                }
              }}
            >
              Play Again
            </Button>
            
            <Button 
              variant="contained"
              onClick={handleGoHome}
              sx={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                px: isTablet ? 4 : 6,
                py: isTablet ? 1.5 : 2,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: isTablet ? '1rem' : '1.2rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(76, 175, 80, 0.5)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Continue
            </Button>
            
            <Button 
              variant="contained"
              onClick={handleNextLevel}
              sx={{ 
                background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                color: 'white',
                px: isTablet ? 4 : 6,
                py: isTablet ? 1.5 : 2,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: isTablet ? '1rem' : '1.2rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(33, 150, 243, 0.5)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Next Level
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

      {/* Hidden audio elements */}
      <audio ref={correctAudioRef} preload="auto">
        <source src={yaySoundEffect} type="audio/mpeg" />
      </audio>
      <audio ref={wrongAudioRef} preload="auto">
        <source src={wrongSoundEffect} type="audio/mpeg" />
      </audio>

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
                        // Stop floating and zoom in on hover
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
                    zIndex: 200
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
                  width: isTablet ? "500px" : "900px",
                  height: isTablet ? "500px" : "900px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
                  position: "absolute",
                  left: isTablet ? "-80px" : "-160px",
                  transform: isTablet
                  ? "scale(0.85) translateY(-15px)"   // was -40px
                  : "scale(1) translateY(-25px)",     // was -60px
                  zIndex: 150,
                  pointerEvents: "none"
                }}
              />
            </div>
          )}

          {/* RIGHT SIDE - Two Washing Machines */}
          {!gameWon && (
            <div style={{
              display: "flex",
              gap: isTablet ? "0rem" : "0rem",
              alignItems: "center",
              margin: isTablet ? "0 -5px" : "0 -10px",
              marginTop: isTablet ? "-80px" : "-150px",
              width: isTablet ? "55%" : "auto"
            }}>
              {/* WHITE Machine */}
              <div
                onDragOver={(e) => handleDragOver(e, 'whites')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'whites')}
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.3s ease",
                 transform: dragOverMachine === 'whites'
                  ? 'scale(1.08) translateY(70px) translateX(-30px)'
                  : 'scale(1) translateY(70px) translateX(-30px)',
                  filter: dragOverMachine === 'whites' 
                    ? 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.9))' 
                    : 'drop-shadow(0 6px 15px rgba(0,0,0,0.25))',
                  margin: isTablet ? "0 -3px" : "0 -5px",
                  zIndex: 200
                }}
              >
                <img 
                  src={washingMachine2Img} 
                  alt="White Washing Machine"
                  style={{
                    width: isTablet ? "300px" : "500px",
                    height: isTablet ? "300px" : "500px",
                    objectFit: "contain",
                    marginBottom: isTablet ? "-5px" : "-10px",
                  }}
                />
                <h2 style={{
                  fontSize: isTablet ? "1.8rem" : "2.8rem",
                  fontWeight: "bold",
                  margin: "0",
                  color: "#fbfbfbff",
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
                  letterSpacing: "2px",
                  marginTop: isTablet ? "-40px" : "-70px"
                }}>
                  WHITES
                </h2>
              </div>

              {/* COLOUR Machine */}
              <div
                onDragOver={(e) => handleDragOver(e, 'colors')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'colors')}
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.3s ease",
                  transform: dragOverMachine === 'colors'
                  ? `scale(1.08) translateX(${isTablet ? '-60px' : '-120px'}) translateY(70px) translateX(-30px)`
                  : `translateX(${isTablet ? '-60px' : '-120px'}) translateY(70px) translateX(-30px)`,

                  filter: dragOverMachine === 'colors'
                    ? 'drop-shadow(0 0 30px rgba(156, 39, 176, 0.9))'
                    : 'drop-shadow(0 6px 15px rgba(0,0,0,0.25))',
                  margin: isTablet ? "0 -25px" : "0 -50px",
                  zIndex: 200,
                }}
              >
                <img
                  src={washingMachine1Img}
                  alt="Colour Washing Machine"
                  style={{
                    width: isTablet ? "300px" : "500px",
                    height: isTablet ? "300px" : "500px",
                    objectFit: "contain",
                    marginBottom: isTablet ? "-5px" : "-10px",
                  }}
                />
                <h2
                  style={{
                    fontSize: isTablet ? "1.8rem" : "2.8rem",
                    fontWeight: "bold",
                    margin: "0",
                    fontFamily: "Poppins, sans-serif",
                    textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
                    letterSpacing: "2px",
                    background: "linear-gradient(90deg, #E74C3C, #F39C12, #27AE60, #3498DB, #9B59B6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginTop: isTablet ? "-40px" : "-70px",
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