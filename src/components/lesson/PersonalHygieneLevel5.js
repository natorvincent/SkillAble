import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Button, 
  Dialog,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardMedia
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import Loader from '../Loader';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

// Background images
import backgroundImg from "../../assets/hygienelevel5/park.png"
import bedroomBackground from "../../assets/hygienelevel5/bedroom.png"
import wardrobeBackground from "../../assets/hygienelevel5/wardrobe.png"
import rainBg from "../../assets/hygienelevel5/rainbg.png"

// Character images
import characterCatDefault from "../../assets/hygienelevel3/cat.png"
import characterCatExcited from "../../assets/hygienelevel3/cat_excited.png"
import characterCatCurious from "../../assets/hygienelevel3/cat_curious.png"
import characterCatHelpful from "../../assets/hygienelevel3/cat_helpful.png"
import characterCatProud from "../../assets/hygienelevel3/cat_proud.png"

// Character base images
import characterBase from "../../assets/hygienelevel5/character_base.png"
import characterUnderwear from "../../assets/hygienelevel5/character_underwear.png"
import characterShirt from "../../assets/hygienelevel5/character_shirt.png"
import characterPants from "../../assets/hygienelevel5/character_pants.png"
import characterSocks from "../../assets/hygienelevel5/character_socks.png"
import characterShoes from "../../assets/hygienelevel5/character_shoes.png"
import characterComplete from "../../assets/hygienelevel5/character_complete.png"
import characterRaincoat from "../../assets/hygienelevel5/character_raincoat.png"

// Clothing items
import underwearClean from "../../assets/hygienelevel5/underwear_clean.png"
import shirtClean from "../../assets/hygienelevel5/shirt_clean.png"
import pantsClean from "../../assets/hygienelevel5/pants_clean.png"
import socksClean from "../../assets/hygienelevel5/socks_clean.png"
import shoesClean from "../../assets/hygienelevel5/shoes_clean.png"
import rainCoat from "../../assets/hygienelevel5/rain_coat.png"

// Audio files
import backgroundMusic from '../../assets/background-music.mp3';
import correctSound from "../../assets/hygieneLevel1/correct-sound.mp3"
import incorrectSound from "../../assets/hygieneLevel1/incorrect-sound.mp3"
import successSound from "../../assets/hygieneLevel1/success-sound.mp3"

// Enhanced Character Introduction Component
const CharacterIntroductionPopup = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const introductionSteps = [
    {
      title: "Meow! 🐱",
      message: "Welcome to our Dress Up Adventure! Let's learn how to dress up properly.",
      character: characterCatExcited,
      buttonText: "NEXT"
    },
    {
      title: "Dress Up in Order! 🎯",
      message: "We'll dress up step by step: underwear → shirt → pants → socks → shoes!",
      character: characterCatHelpful,
      buttonText: "LET'S BEGIN!"
    }
  ];

  const currentStepData = introductionSteps[currentStep];

  const handleNext = () => {
    if (currentStep < introductionSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.5s ease-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }}
    >
      {/* Character Display */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: -9,
        position: 'relative'
      }}>
        <Box
          component="img"
          src={currentStepData.character}
          alt="Purrnando the Cat"
          sx={{
            width: 350,
            height: 350,
            filter: 'drop-shadow(0 15px 30px rgba(255, 255, 255, 0.4))',
            animation: 'characterEntrance 1s ease-out, bounceGentle 3s ease-in-out infinite',
            '@keyframes characterEntrance': {
              '0%': { 
                transform: 'translateY(100px) scale(0.8)',
                opacity: 0 
              },
              '100%': { 
                transform: 'translateY(0) scale(1)',
                opacity: 1 
              }
            },
            '@keyframes bounceGentle': {
              '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
              '25%': { transform: 'translateY(-8px) rotate(2deg)' },
              '75%': { transform: 'translateY(-4px) rotate(-1deg)' }
            }
          }}
        />
        
        {/* Progress Dots */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: -60, 
          display: 'flex', 
          gap: 2 
        }}>
          {introductionSteps.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: index === currentStep ? '#FFD166' : 'rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease',
                transform: index === currentStep ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Dialog Box */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          padding: 4,
          maxWidth: '700px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '4px solid #FFD166',
          animation: 'dialogSlideUp 0.8s ease-out',
          '@keyframes dialogSlideUp': {
            '0%': { 
              transform: 'translateY(100px) scale(0.9)',
              opacity: 0 
            },
            '100%': { 
              transform: 'translateY(0) scale(1)',
              opacity: 1 
            }
          }
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              color: '#280B60',
              mb: 2,
              fontFamily: 'Poppins, sans-serif',
              background: 'linear-gradient(135deg, #280B60 0%, #6D28D9 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {currentStepData.title}
          </Typography>
          
          <Typography
            variant="h5"
            sx={{
              color: '#4B5563',
              mb: 4,
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              fontSize: '1.4rem'
            }}
          >
            {currentStepData.message}
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              background: 'linear-gradient(135deg, #FFD166 0%, #FFB700 100%)',
              color: '#280B60',
              px: 6,
              py: 1.5,
              borderRadius: '25px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.2rem',
              textTransform: 'none',
              boxShadow: '0 8px 20px rgba(255, 209, 102, 0.5)',
              minWidth: '200px',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #FFDC87 0%, #FFD166 100%)',
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 25px rgba(255, 209, 102, 0.6)'
              },
              '&:active': {
                transform: 'translateY(-1px)'
              }
            }}
          >
            {currentStepData.buttonText}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

// Dressing Guide Popup Component
const DressingGuidePopup = ({ currentStep, onClose }) => {
  const dressingSteps = [
    {
      title: "First Step: Underwear 👙",
      message: "You need to wear underwear first before anything else! Underwear is the foundation of getting dressed.",
      buttonText: "GOT IT!"
    },
    {
      title: "Next: Put on Your Shirt 👕",
      message: "After underwear, you put on your shirt. This covers your upper body and keeps you warm!",
      buttonText: "CONTINUE"
    },
    {
      title: "Time for Pants 👖",
      message: "Now put on your pants. They cover your legs and complete your main outfit!",
      buttonText: "ALRIGHT!"
    },
    {
      title: "Don't Forget Socks 🧦",
      message: "Next, put on your socks. They keep your feet warm and comfortable in shoes!",
      buttonText: "OKAY!"
    },
    {
      title: "Final Step: Shoes 👟",
      message: "Last step! Put on your shoes to protect your feet and complete your outfit!",
      buttonText: "LET'S FINISH!"
    }
  ];

  const currentStepData = dressingSteps[currentStep];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1500,
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <Paper
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: 4,
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
          border: '3px solid #4F46E5',
          textAlign: 'center',
          animation: 'popIn 0.4s ease-out',
          '@keyframes popIn': {
            '0%': { 
              transform: 'scale(0.8) translateY(20px)',
              opacity: 0 
            },
            '100%': { 
              transform: 'scale(1) translateY(0)',
              opacity: 1 
            }
          }
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#4F46E5',
            mb: 2,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          {currentStepData.title}
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: '#4B5563',
            mb: 4,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
          }}
        >
          {currentStepData.message}
        </Typography>
        
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: 'white',
            px: 4,
            py: 1,
            borderRadius: '20px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '600',
            fontSize: '1.1rem',
            textTransform: 'none',
            boxShadow: '0 6px 15px rgba(79, 70, 229, 0.4)',
            minWidth: '150px',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.5)'
            }
          }}
        >
          {currentStepData.buttonText}
        </Button>
        
        {/* Progress indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
          {dressingSteps.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: index === currentStep ? '#4F46E5' : 'rgba(79, 70, 229, 0.3)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

// Success Popup Component
const SuccessPopup = ({ onContinue }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.5s ease-out',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 2,
        position: 'relative'
      }}>
        <Box
          component="img"
          src={characterCatProud}
          alt="Purrnando the Cat"
          sx={{
            width: 250,
            height: 250,
            filter: 'drop-shadow(0 15px 30px rgba(255, 255, 255, 0.4))',
            animation: 'bounceGentle 3s ease-in-out infinite',
          }}
        />
      </Box>
      
      <Paper
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          padding: 4,
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '4px solid #90BE6D',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: '#280B60',
            mb: 2,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Amazing! You're All Dressed! 🎉
        </Typography>
        
        <Typography
          variant="h5"
          sx={{
            color: '#4B5563',
            mb: 4,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
          }}
        >
          You dressed up perfectly in the right order! Now let's go outside and see what happens next!
        </Typography>
        
        <Button
          variant="contained"
          onClick={onContinue}
          sx={{
            background: 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)',
            color: 'white',
            px: 6,
            py: 1.5,
            borderRadius: '25px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            fontSize: '1.2rem',
            textTransform: 'none',
            boxShadow: '0 8px 20px rgba(144, 190, 109, 0.5)',
            minWidth: '200px',
            '&:hover': {
              background: 'linear-gradient(135deg, #A3C585 0%, #90BE6D 100%)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          Let's Go Outside!
        </Button>
      </Paper>
    </Box>
  );
};

// Rain Scenario Popup Component
const RainScenarioPopup = ({ onUnderstand }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.5s ease-out',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 2,
        position: 'relative'
      }}>
        <Box
          component="img"
          src={characterCatCurious}
          alt="Purrnando the Cat"
          sx={{
            width: 250,
            height: 250,
            filter: 'drop-shadow(0 15px 30px rgba(255, 255, 255, 0.4))',
            animation: 'bounceGentle 3s ease-in-out infinite',
          }}
        />
      </Box>
      
      <Paper
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '25px',
          padding: 4,
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '4px solid #4F46E5',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: '#280B60',
            mb: 2,
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Oh No! It's Raining! 🌧️
        </Typography>
        
        <Typography
          variant="h5"
          sx={{
            color: '#4B5563',
            mb: 4,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.6,
          }}
        >
          When it rains, we need to wear special clothes to stay dry and protect ourselves from the rain. What should you wear to stay dry?
        </Typography>
        
        <Button
          variant="contained"
          onClick={onUnderstand}
          sx={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: 'white',
            px: 6,
            py: 1.5,
            borderRadius: '25px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            fontSize: '1.2rem',
            textTransform: 'none',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.5)',
            minWidth: '200px',
            '&:hover': {
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
              transform: 'translateY(-2px)',
            }
          }}
        >
          I Understand!
        </Button>
      </Paper>
    </Box>
  );
};

// Enhanced Character Cat Component
const CharacterCat = ({ gameState, message, onInteraction }) => {
  const getCatImage = () => {
    const characterStates = {
      'introduction': characterCatExcited,
      'dressing': characterCatHelpful,
      'complete': characterCatProud,
      'rain': characterCatCurious,
      'default': characterCatExcited
    };
    
    return characterStates[gameState] || characterStates.default;
  };

  const getCatAnimation = () => {
    const animations = {
      'introduction': 'bounce 2s ease-in-out infinite',
      'dressing': 'nod 2s ease-in-out infinite',
      'complete': 'celebrate 2s ease-in-out infinite',
      'rain': 'float 3s ease-in-out infinite',
      'default': 'float 3s ease-in-out infinite'
    };
    
    return animations[gameState] || animations.default;
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 20,
        bottom: 20,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: onInteraction ? 'pointer' : 'default'
      }}
      onClick={onInteraction}
    >
      <Box
        component="img"
        src={getCatImage()}
        alt="Purrnando the Cat"
        sx={{
          width: 140,
          height: 'auto',
          filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
          animation: `${getCatAnimation()}, glowPulse 4s ease-in-out infinite`,
          transition: 'all 0.3s ease',
          '&:hover': onInteraction ? {
            transform: 'scale(1.05)',
            filter: 'drop-shadow(0 8px 16px rgba(255, 209, 102, 0.6))'
          } : {},
        }}
      />
      
      {/* Speech Bubble */}
      <Paper
        sx={{
          position: 'absolute',
          top: 10,
          left: 160,
          backgroundColor: 'white',
          color: '#280B60',
          padding: '12px 20px',
          borderRadius: '25px',
          fontSize: '1.1rem',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '500',
          maxWidth: '300px',
          minWidth: '200px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          wordWrap: 'break-word',
          animation: 'speechPop 0.5s ease-out',
          border: '2px solid #FFD166',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '30px',
            left: '-12px',
            width: 0,
            height: 0,
            border: '12px solid transparent',
            borderRightColor: 'white',
            borderLeft: 0
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '29px',
            left: '-15px',
            width: 0,
            height: 0,
            border: '14px solid transparent',
            borderRightColor: '#FFD166',
            borderLeft: 0
          },
        }}
      >
        {message}
      </Paper>
    </Box>
  );
};

// Centered Character Component
const CenteredCharacter = ({ dressedClothes, characterImage }) => {
  const getCharacterImage = () => {
    if (characterImage) return characterImage;
    
    const dressedCount = Object.keys(dressedClothes).length;
    if (dressedCount === 0) return characterBase;
    if (dressedCount === 1) return characterUnderwear;
    if (dressedCount === 2) return characterShirt;
    if (dressedCount === 3) return characterPants;
    if (dressedCount === 4) return characterSocks;
    if (dressedCount === 5) return characterShoes;
    return characterComplete;
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '55%',
        left: '40%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Box
        component="img"
        src={getCharacterImage()}
        alt="Character"
        sx={{
          width: 550,
          height: 550,
          objectFit: 'contain',
          filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
        }}
      />
    </Box>
  );
};

// Draggable Clothing Item Component
const DraggableClothingItem = ({ item, onDragStart, onDragEnd, isDragging }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    onDragStart && onDragStart(item);
  };

  const handleDragEnd = () => {
    onDragEnd && onDragEnd();
  };

  return (
    <Box
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      sx={{
        cursor: 'grab',
        transition: 'all 0.3s ease',
        transform: isDragging ? 'scale(0.9)' : 'scale(1)',
        opacity: isDragging ? 0.7 : 1,
        filter: isDragging ? 'brightness(0.8)' : 'brightness(1)',
        '&:active': {
          cursor: 'grabbing',
        }
      }}
    >
      <Box
        component="img"
        src={item.image}
        alt=""
        sx={{
          width: 250,
          height: 250,
          objectFit: 'contain',
          filter: `
            brightness(1.08) 
            contrast(1.12) 
            saturate(1.05)
            drop-shadow(0 2px 3px rgba(0,0,0,0.2))
          `,
          mixBlendMode: 'multiply',
        }}
      />
    </Box>
  );
};

// Dressing Game Component
const DressingGame = ({ cleanClothes, onComplete, onScoreUpdate, currentStep, onDressItem, showDressingGuide, onCloseGuide }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [isOverCharacter, setIsOverCharacter] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, message: '', correct: false });
  const [usedItems, setUsedItems] = useState([]);

  // Filter clean clothes for current step - ONLY show the current required item
  const dressingSteps = ['underwear', 'shirt', 'pants', 'socks', 'shoes'];
  const currentClothingType = dressingSteps[currentStep];
  
  // Only show ONE item of the current required type
  const availableClothes = cleanClothes
    .filter(item => item.type === currentClothingType && !usedItems.includes(item.id))
    .slice(0, 1); // Show only 1 option

  const showFeedback = (message, correct) => {
    setFeedback({ show: true, message, correct });
    setTimeout(() => {
      setFeedback({ show: false, message: '', correct: false });
    }, 1500);
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsOverCharacter(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    // Check if the dragged item matches the current step
    if (draggedItem.type === currentClothingType) {
      showFeedback(`Great! You put on the ${currentClothingType}! 🎉`, true);
      onScoreUpdate(15);
      setUsedItems(prev => [...prev, draggedItem.id]);
      onDressItem(currentClothingType, draggedItem);
      
      setTimeout(() => {
        setIsOverCharacter(false);
      }, 1000);
    } else {
      showFeedback(`Oops! You need to put on ${currentClothingType} first!`, false);
      onScoreUpdate(-5);
    }

    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOverCharacter(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsOverCharacter(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 4,
      minHeight: '400px',
      width: '100%'
    }}>

      {/* Dressing Guide Popup */}
      {showDressingGuide && (
        <DressingGuidePopup 
          currentStep={currentStep} 
          onClose={onCloseGuide}
        />
      )}

      {/* Clothing Options - Positioned on the right side - ONLY show current step item */}
      {availableClothes.length > 0 && (
        <Box sx={{ 
          position: 'fixed',
          right: 500,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          alignItems: 'center',
          zIndex: 100
        }}>
          {availableClothes.map((item) => (
            <DraggableClothingItem
              key={item.id}
              item={item}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              isDragging={draggedItem?.id === item.id}
            />
          ))}
        </Box>
      )}

      {/* Character Drop Zone */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 50
        }}
      >
      </Box>

      {/* Feedback Message */}
      {feedback.show && (
        <Paper 
          sx={{ 
            p: 2,
            backgroundColor: feedback.correct ? '#90BE6D' : '#FF595E',
            color: 'white',
            textAlign: 'center',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            animation: 'fadeInOut 1.5s ease-in-out',
            position: 'fixed',
            top: 100,
            zIndex: 1000,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {feedback.message}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// Rain Game Component
const RainGame = ({ onComplete, onScoreUpdate }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [isOverCharacter, setIsOverCharacter] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, message: '', correct: false });
  const [raincoatUsed, setRaincoatUsed] = useState(false);

  const raincoatItem = { id: 'raincoat-1', image: rainCoat, type: 'raincoat' };

  const showFeedback = (message, correct) => {
    setFeedback({ show: true, message, correct });
    setTimeout(() => {
      setFeedback({ show: false, message: '', correct: false });
    }, 1500);
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setIsOverCharacter(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem) return;

    if (draggedItem.type === 'raincoat') {
      showFeedback("Perfect! The raincoat will keep you dry in the rain! 🌧️", true);
      onScoreUpdate(20);
      setRaincoatUsed(true);
      
      setTimeout(() => {
        setIsOverCharacter(false);
        onComplete();
      }, 1500);
    } else {
      showFeedback("That won't protect you from the rain! Try the raincoat!", false);
      onScoreUpdate(-5);
    }

    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOverCharacter(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsOverCharacter(false);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 4,
      minHeight: '400px',
      width: '100%'
    }}>
      {/* Raincoat Option */}
      {!raincoatUsed && (
        <Box sx={{ 
          position: 'fixed',
          right: 500,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          alignItems: 'center',
          zIndex: 100
        }}>
          <DraggableClothingItem
            item={raincoatItem}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isDragging={draggedItem?.id === raincoatItem.id}
          />
        </Box>
      )}

      {/* Character Drop Zone */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 50
        }}
      >
      </Box>

      {/* Feedback Message */}
      {feedback.show && (
        <Paper 
          sx={{ 
            p: 2,
            backgroundColor: feedback.correct ? '#90BE6D' : '#FF595E',
            color: 'white',
            textAlign: 'center',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            animation: 'fadeInOut 1.5s ease-in-out',
            position: 'fixed',
            top: 100,
            zIndex: 1000,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {feedback.message}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// Main Game Component
export default function DressUpGame() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);

  // Game states
  const [showCharacterIntroduction, setShowCharacterIntroduction] = useState(true);
  const [currentStage, setCurrentStage] = useState('dressing');
  const [dressedClothes, setDressedClothes] = useState({});
  const [currentDressingStep, setCurrentDressingStep] = useState(0);
  const [showCenteredCharacter, setShowCenteredCharacter] = useState(false);
  const [cleanClothes, setCleanClothes] = useState([]);
  const [showDressingGuide, setShowDressingGuide] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showRainScenario, setShowRainScenario] = useState(false);
  const [currentCharacterImage, setCurrentCharacterImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // All clean clothing items for dressing - only one option per type
  const allClothingItems = [
    { id: 'underwear-clean-1', image: underwearClean, clean: true, type: 'underwear' },
    { id: 'shirt-clean-1', image: shirtClean, clean: true, type: 'shirt' },
    { id: 'pants-clean-1', image: pantsClean, clean: true, type: 'pants' },
    { id: 'socks-clean-1', image: socksClean, clean: true, type: 'socks' },
    { id: 'shoes-clean-1', image: shoesClean, clean: true, type: 'shoes' },
  ];

  // Dressing steps
  const dressingSteps = ['underwear', 'shirt', 'pants', 'socks', 'shoes'];

  const getCurrentBackground = () => {
    switch (currentStage) {
      case 'dressing':
        return wardrobeBackground;
      case 'complete':
        return backgroundImg;
      case 'rain':
        return rainBg;
      default:
        return wardrobeBackground;
    }
  };

  // Get star rating based on score
  const getStarRating = () => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    return 1;
  };

  // Reset game function
  const resetGame = () => {
    setScore(0);
    setGameCompleted(false);
    setCurrentStage('dressing');
    setDressedClothes({});
    setCurrentDressingStep(0);
    setShowCenteredCharacter(true);
    setCleanClothes(allClothingItems);
    setShowDressingGuide(true);
    setShowSuccessPopup(false);
    setShowRainScenario(false);
    setCurrentCharacterImage(null);
    setShowSuccess(false);
    setProgressSaving(false);
    setProgressSaved(false);
  };

  // Handle go home
  const handleGoHome = () => {
    navigate(-1);
  };

  const handleCharacterIntroductionComplete = () => {
    setShowCharacterIntroduction(false);
    setCurrentStage('dressing');
    setCleanClothes(allClothingItems);
    setShowCenteredCharacter(true);
    setShowDressingGuide(true);
  };

  const handleDressItem = (clothingType, item) => {
    setDressedClothes(prev => ({
      ...prev,
      [clothingType]: item
    }));

    // Move to next dressing step
    setTimeout(() => {
      if (currentDressingStep < dressingSteps.length - 1) {
        setCurrentDressingStep(prev => prev + 1);
        // Show next dressing guide after a short delay
        setTimeout(() => {
          setShowDressingGuide(true);
        }, 500);
      } else {
        // All dressing steps completed - show success popup after 4 seconds
        setCurrentStage('complete');
        setScore(prev => prev + 50);
        setShowDressingGuide(false);
        
        // Wait 4 seconds before showing the success popup
        setTimeout(() => {
          setShowSuccessPopup(true);
          console.log('Dressing completed - showing success popup after 4 seconds');
        }, 3000);
      }
    }, 1500);
  };

  const handleCloseDressingGuide = () => {
    setShowDressingGuide(false);
  };

  const handleScoreUpdate = (points) => {
    setScore(prev => Math.min(100, prev + points));
  };

  const handleSuccessContinue = () => {
    console.log('Success continue clicked');
    setShowSuccessPopup(false);
    // Change to rain background and show rain scenario
    setCurrentStage('rain');
    setShowRainScenario(true);
  };

  const handleRainScenarioUnderstand = () => {
    setShowRainScenario(false);
    // Set character to complete outfit (without raincoat)
    setCurrentCharacterImage(characterComplete);
  };

  const handleRainGameComplete = () => {
    // Change character to wear raincoat
    setCurrentCharacterImage(characterRaincoat);
    setScore(prev => prev + 30);
    // Show final success after delay
    setTimeout(() => {
      setGameCompleted(true);
      setShowSuccess(true);
    }, 2000);
  };

  // Save progress function
  const saveProgress = async () => {
    setProgressSaving(true);
    try {
      await saveStudentLessonProgress(moduleId, lessonId, {
        score: score,
        completed: true,
        stars: getStarRating()
      });
      setProgressSaved(true);
      setTimeout(() => {
        setProgressSaving(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving progress:', error);
      setProgressSaving(false);
    }
  };

  const handleContinue = () => {
    saveProgress();
    navigate('/');
  };

  const getCharacterMessage = () => {
    switch (currentStage) {
      case 'dressing':
        const currentItem = dressingSteps[currentDressingStep];
        return `Put on the ${currentItem}! ${currentDressingStep + 1}/5`;
      case 'complete':
        return "Perfect! You're ready to go outside! 🎉";
      case 'rain':
        return "Quick! Drag the raincoat to stay dry! 🌧️";
      default:
        return "Let's get dressed!";
    }
  };

  // Audio effects
  useEffect(() => {
    const audio = new Audio(backgroundMusic);
    audio.loop = true;
    setAudioRef(audio);

    return () => {
      audio.pause();
    };
  }, []);

  // Auto-play background music when component mounts
  useEffect(() => {
    if (audioRef) {
      audioRef.play().then(() => {
        setAudioPlaying(true);
      }).catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  }, [audioRef]);

  // Debug current stage
  useEffect(() => {
    console.log('Current stage:', currentStage);
    console.log('Show success popup:', showSuccessPopup);
  }, [currentStage, showSuccessPopup]);

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${getCurrentBackground()})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      overflow: 'hidden'
    }}>
      <Navbar />
      
      <Container maxWidth="xl" sx={{ py: 1 }}>
        {/* Character Introduction Popup */}
        {showCharacterIntroduction && (
          <CharacterIntroductionPopup onComplete={handleCharacterIntroductionComplete} />
        )}

        {/* Success Popup - Show after dressing is complete (with 4-second delay) */}
        {showSuccessPopup && (
          <SuccessPopup onContinue={handleSuccessContinue} />
        )}

        {/* Rain Scenario Popup */}
        {showRainScenario && (
          <RainScenarioPopup onUnderstand={handleRainScenarioUnderstand} />
        )}

        {/* Character Cat */}
        {!showCharacterIntroduction && !showSuccessPopup && !showRainScenario && (
          <CharacterCat 
            gameState={currentStage}
            message={getCharacterMessage()}
          />
        )}

        {/* Centered Character - Show during dressing and rain stages */}
        {(currentStage === 'dressing' && showCenteredCharacter) && (
          <CenteredCharacter dressedClothes={dressedClothes} characterImage={currentCharacterImage} />
        )}

        {/* Centered Character for complete and rain stages */}
        {(currentStage === 'complete' || currentStage === 'rain') && (
          <CenteredCharacter dressedClothes={dressedClothes} characterImage={currentCharacterImage} />
        )}

        {/* Progress and Score */}
        <Box sx={{ position: 'relative', zIndex: 1010, mb: 2 }}>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={score} 
              sx={{ 
                height: 8, 
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '10px',
                  backgroundColor: '#90BE6D'
                }
              }} 
            />
          </Box>
        </Box>

        {/* Control Buttons */}
        <Box sx={{
          position: 'fixed',
          top: 100,
          left: 18,
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Box
            component="img"
            src={require("../../assets/hygienelevel3/resetbtn.png")}
            alt="Reset Game"
            onClick={resetGame}
            sx={{
              width: 70,
              height: 70,
              cursor: 'pointer',
              borderRadius: '50%',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              '&:hover': {
                transform: 'translateY(-6px) scale(1.25)',
                width: 85,
                height: 85,
                zIndex: 1021
              },
              '&:active': {
                transform: 'translateY(-3px) scale(1.1)',
                width: 78,
                height: 78
              }
            }}
          />
          
          <Box
            component="img"
            src={require("../../assets/hygienelevel3/homebtn.png")}
            alt="Go Home"
            onClick={handleGoHome}
            sx={{
              width: 70,
              height: 70,
              cursor: 'pointer',
              borderRadius: '50%',
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              '&:hover': {
                transform: 'translateY(-6px) scale(1.25)',
                width: 85,
                height: 85,
                zIndex: 1021
              },
              '&:active': {
                transform: 'translateY(-3px) scale(1.1)',
                width: 78,
                height: 78
              }
            }}
          />
        </Box>

        {/* Audio Control */}
        <Box sx={{ position: 'fixed', top: 100, right: 20, zIndex: 1000 }}>
          <Button
            onClick={() => {
              if (audioRef) {
                if (audioPlaying) {
                  audioRef.pause();
                  setAudioPlaying(false);
                } else {
                  audioRef.play().then(() => {
                    setAudioPlaying(true);
                  });
                }
              }
            }}
            sx={{
              minWidth: '60px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: audioPlaying ? 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)' : 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              fontSize: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            {audioPlaying ? '🔊' : '🔇'}
          </Button>
        </Box>

        {/* Game Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 200px)',
          width: '100%',
          pt: 1
        }}>
          {/* Dressing Game */}
          {currentStage === 'dressing' && !showSuccessPopup && (
            <Box sx={{ 
              backgroundColor: 'transparent', 
              p: 4, 
              mt: 0,
              maxWidth: '1000px',
              width: '95%',
            }}>
              <DressingGame
                cleanClothes={cleanClothes}
                onComplete={() => setCurrentStage('complete')}
                onScoreUpdate={handleScoreUpdate}
                currentStep={currentDressingStep}
                onDressItem={handleDressItem}
                showDressingGuide={showDressingGuide}
                onCloseGuide={handleCloseDressingGuide}
              />
            </Box>
          )}

          {/* Rain Game */}
          {currentStage === 'rain' && !showRainScenario && (
            <Box sx={{ 
              backgroundColor: 'transparent', 
              p: 4, 
              mt: 0,
              maxWidth: '1000px',
              width: '95%',
            }}>
              <RainGame
                onComplete={handleRainGameComplete}
                onScoreUpdate={handleScoreUpdate}
              />
            </Box>
          )}
        </Box>

        {/* Final Success Dialog */}
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
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <EmojiEventsIcon sx={{ fontSize: 150, color: 'white', mb: 4 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              {[...Array(3)].map((_, i) => {
                const isActive = i < getStarRating();
                
                return (
                  <StarIcon 
                    key={i} 
                    sx={{ 
                      color: isActive ? 'white' : 'rgba(255,255,255,0.3)',
                      fontSize: 80,
                      mx: 1,
                      textShadow: isActive ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                    }} 
                  />
                );
              })}
            </Box>
            
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              Excellent! You're Prepared for Anything! 🌟
            </Typography>
            
            <Typography variant="h5" sx={{ mb: 4, textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              You learned to dress properly and stay dry in the rain! Perfect!
            </Typography>
            
            {progressSaving && (
              <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(25, 130, 196, 0.8)', borderRadius: '15px', color: 'white' }}>
                <CircularProgress size={30} sx={{ mr: 2, color: 'white' }} />
                <Typography variant="h6">Saving your progress...</Typography>
              </Box>
            )}
            
            {progressSaved && (
              <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(144, 190, 109, 0.8)', borderRadius: '15px', color: 'white' }}>
                <CheckCircleIcon sx={{ mr: 2, fontSize: 30, verticalAlign: 'middle' }} />
                <Typography variant="h6" component="span">Progress Saved!</Typography>
              </Box>
            )}
            
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
                  fontWeight: '600',
                  fontSize: '1.2rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                🔄 Play Again
              </Button>
              <Button 
                variant="contained"
                onClick={handleContinue}
                disabled={progressSaving}
                sx={{ 
                  background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '25px',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {progressSaving ? '...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
}