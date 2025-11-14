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
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import Loader from '../Loader';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

import backgroundImg from "../../assets/hygienelevel3/pinkbg.png"

import beforeLeftHand from "../../assets/hygienelevel3/before_lefthand.png"
import beforeRightHand from "../../assets/hygienelevel3/before_righthand.png"
import afterLeftHand from "../../assets/hygienelevel3/after_lefthand.png"
import afterRightHand from "../../assets/hygienelevel3/after_righthand.png"

import beforeLeftFoot from "../../assets/hygienelevel3/before_leftfoot.png"
import beforeRightFoot from "../../assets/hygienelevel3/before_rightfoot.png"
import afterLeftFoot from "../../assets/hygienelevel3/after_leftfoot.png"
import afterRightFoot from "../../assets/hygienelevel3/after_rightfoot.png"

import nailClipperImg from "../../assets/hygienelevel3/nail_clipper.png"

import nailClippingsImg from "../../assets/hygienelevel3/nailclippings.png"
import trashCanImg from "../../assets/hygienelevel3/trashcan.png"

import characterCatDefault from "../../assets/hygienelevel3/cat.png"
import characterCatExcited from "../../assets/hygienelevel3/cat_excited.png"
import characterCatCurious from "../../assets/hygienelevel3/cat_curious.png"
import characterCatHelpful from "../../assets/hygienelevel3/cat_helpful.png"
import characterCatProud from "../../assets/hygienelevel3/cat_proud.png"
import characterCatWorried from "../../assets/hygienelevel3/cat_worried.png"

import nailClippingVideo from "../../assets/hygienelevel3/trim.mp4"

import backgroundMusic from "../../assets/hygienelevel1/background-music.mp3"
import correctSound from "../../assets/hygienelevel1/correct-sound.mp3"
import incorrectSound from "../../assets/hygienelevel1/incorrect-sound.mp3"
import successSound from "../../assets/hygienelevel1/success-sound.mp3"

const SparkleAnimation = ({ position }) => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = [];
      for (let i = 0; i < 15; i++) {
        newSparkles.push({
          id: i,
          x: Math.random() * 100 - 10,
          y: Math.random() * 100 - 10,
          size: Math.random() * 20 + 10,
          delay: Math.random() * 2,
          duration: Math.random() * 1 + 1
        });
      }
      setSparkles(newSparkles);
    };

    generateSparkles();
  }, []);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: '120%',
        height: '120%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 100
      }}
    >
      {sparkles.map(sparkle => (
        <Box
          key={sparkle.id}
          sx={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            background: 'radial-gradient(circle, #FFD700 0%, #FFA500 70%, transparent 100%)',
            borderRadius: '50%',
            animation: `sparkleTwinkle ${sparkle.duration}s ease-in-out infinite`,
            animationDelay: `${sparkle.delay}s`,
            filter: 'blur(1px)',
            opacity: 0,
            '@keyframes sparkleTwinkle': {
              '0%': { opacity: 0, transform: 'scale(0.5)' },
              '50%': { opacity: 1, transform: 'scale(1.2)' },
              '100%': { opacity: 0, transform: 'scale(0.5)' }
            }
          }}
        />
      ))}
    </Box>
  );
};

const CharacterIntroductionPopup = ({ onComplete }) => (
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
      zIndex: 2000
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      mb: 15,
      position: 'relative'
    }}>
      <Box
        component="img"
        src={characterCatExcited}
        alt="Purrnando the Cat"
        sx={{
          width: 400,
          height: 400,
          filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
          animation: 'bounceAndTilt 3s ease-in-out infinite',
          '@keyframes bounceAndTilt': {
            '0%': { transform: 'translateY(0px) rotate(0deg)' },
            '25%': { transform: 'translateY(-20px) rotate(5deg)' },
            '50%': { transform: 'translateY(0px) rotate(0deg)' },
            '75%': { transform: 'translateY(-10px) rotate(-5deg)' },
            '100%': { transform: 'translateY(0px) rotate(0deg)' }
          }
        }}
      />
    </Box>
    
    <Paper
      sx={{
        position: 'fixed',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: 3,
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '3px solid #FFD166',
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }}
    >
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#280B60',
            mb: 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          Hey! It's me again, Purrnando! 🐱
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: '#333',
            mb: 2,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4
          }}
        >
          I'm back to help you learn about nail care! We'll trim both hand nails AND foot nails 
          to keep everything neat and healthy. Ready to learn with me?
        </Typography>
        
        <Button
          variant="contained"
          onClick={onComplete}
          sx={{
            background: 'linear-gradient(135deg, #FFD166 0%, #FFB700 100%)',
            color: '#280B60',
            px: 4,
            py: 1,
            borderRadius: '20px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            fontSize: '1.1rem',
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(255, 209, 102, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FFDC87 0%, #FFD166 100%)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          YES, LET'S GO! 🐾
        </Button>
      </Box>
    </Paper>
  </Box>
);

const HandIntroductionPopup = ({ onComplete }) => (
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
      zIndex: 2000
    }}
  >
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: 4, 
      justifyContent: 'center', 
      alignItems: 'center',
      mb: 15,
      position: 'relative'
    }}>
      <Box sx={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        <Box
          component="img"
          src={beforeLeftHand}
          alt="Left Hand"
          sx={{
            width: 300,
            height: 300,
            filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        />
        <Box
          component="img"
          src={beforeRightHand}
          alt="Right Hand"
          sx={{
            width: 300,
            height: 300,
            filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
            animation: 'pulse 2s infinite',
            animationDelay: '0.5s',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        <Box
          component="img"
          src={beforeLeftFoot}
          alt="Left Foot"
          sx={{
            width: 300,
            height: 300,
            filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
            animation: 'pulse 2s infinite',
            animationDelay: '0.3s',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        />
        <Box
          component="img"
          src={beforeRightFoot}
          alt="Right Foot"
          sx={{
            width: 300,
            height: 300,
            filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
            animation: 'pulse 2s infinite',
            animationDelay: '0.7s',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        />
      </Box>
    </Box>
    
    <Paper
      sx={{
        position: 'fixed',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: 3,
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '3px solid #FF595E',
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }}
    >
      <Box
        component="img"
        src={characterCatWorried}
        alt="Cute Cat Helper"
        sx={{
          width: 100,
          height: 'auto',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          animation: 'tilt 3s ease-in-out infinite',
          '@keyframes tilt': {
            '0%': { transform: 'rotate(0deg)' },
            '25%': { transform: 'rotate(5deg)' },
            '50%': { transform: 'rotate(0deg)' },
            '75%': { transform: 'rotate(-5deg)' },
            '100%': { transform: 'rotate(0deg)' }
          }
        }}
      />
      
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#280B60',
            mb: 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          Time for Complete Nail Care!
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: '#333',
            mb: 2,
            fontSize: '1rem',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4
          }}
        >
          Look at these nails! We need to trim both hand nails AND foot nails to keep everything 
          healthy and neat. Let's learn how to properly trim and maintain all our nails!
        </Typography>
        
        <Button
          variant="contained"
          onClick={onComplete}
          sx={{
            background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
            color: 'white',
            px: 4,
            py: 1,
            borderRadius: '20px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(255, 89, 94, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          LET'S TRIM THEM ALL!
        </Button>
      </Box>
    </Paper>
  </Box>
);

const CharacterCat = ({ gameState, message, showVideoCat = false }) => {
  const getCatImage = () => {
    if (showVideoCat) return characterCatHelpful;
    
    switch (gameState) {
      case 'hand-selection':
      case 'foot-selection':
        return characterCatCurious;
      case 'tool-introduction':
        return characterCatHelpful;
      case 'first-hand':
      case 'second-hand':
      case 'first-foot':
      case 'second-foot':
        return characterCatHelpful;
      case 'complete':
        return characterCatProud;
      default:
        return characterCatDefault;
    }
  };

  const getCatAnimation = () => {
    if (showVideoCat) return 'float 3s ease-in-out infinite';
    
    switch (gameState) {
      case 'hand-selection':
      case 'foot-selection':
        return 'bounce 2s ease-in-out infinite';
      case 'tool-introduction':
        return 'tilt 3s ease-in-out infinite';
      case 'first-hand':
      case 'second-hand':
      case 'first-foot':
      case 'second-foot':
        return 'float 3s ease-in-out infinite';
      case 'complete':
        return 'celebrate 2s ease-in-out infinite';
      default:
        return 'float 3s ease-in-out infinite';
    }
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
        alignItems: 'center'
      }}
    >
      <Box
        component="img"
        src={getCatImage()}
        alt="Cute Cat Helper"
        sx={{
          width: 120,
          height: 'auto',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          animation: getCatAnimation(),
          '@keyframes float': {
            '0%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-10px)' },
            '100%': { transform: 'translateY(0px)' }
          },
          '@keyframes bounce': {
            '0%': { transform: 'translateY(0px) scale(1)' },
            '25%': { transform: 'translateY(-8px) scale(1.05)' },
            '50%': { transform: 'translateY(0px) scale(1)' },
            '75%': { transform: 'translateY(-4px) scale(1.02)' },
            '100%': { transform: 'translateY(0px) scale(1)' }
          },
          '@keyframes tilt': {
            '0%': { transform: 'rotate(0deg)' },
            '25%': { transform: 'rotate(5deg)' },
            '50%': { transform: 'rotate(0deg)' },
            '75%': { transform: 'rotate(-5deg)' },
            '100%': { transform: 'rotate(0deg)' }
          },
          '@keyframes celebrate': {
            '0%': { transform: 'translateY(0px) rotate(0deg)' },
            '25%': { transform: 'translateY(-15px) rotate(10deg)' },
            '50%': { transform: 'translateY(-20px) rotate(0deg)' },
            '75%': { transform: 'translateY(-15px) rotate(-10deg)' },
            '100%': { transform: 'translateY(0px) rotate(0deg)' }
          }
        }}
      />
      <Paper
        sx={{
          position: 'absolute',
          top: 5,
          left: 140,
          backgroundColor: 'white',
          color: '#280B60',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '1.3rem',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '500',
          maxWidth: '700px',
          minWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          wordWrap: 'break-word',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '-10px',
            marginTop: '-5px',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: 'transparent white transparent transparent'
          }
        }}
      >
        {message}
      </Paper>
    </Box>
  );
};

const DropZone = ({ position, size, isActive = true, isHovered = false, nailNumber = null, showNumber = false }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size.width}%`,
        height: `${size.height}%`,
        border: isHovered 
          ? '2px dashed #90BE6D'
          : isActive 
            ? '2px dashed #FF5252'
            : '2px dashed rgba(255, 82, 82, 0.3)',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 50,
        backgroundColor: isHovered ? 'rgba(144, 190, 109, 0.15)' : isActive ? 'rgba(255, 82, 82, 0.1)' : 'transparent',
        boxShadow: isHovered ? '0 0 15px rgba(144, 190, 109, 0.4)' : isActive ? '0 0 10px rgba(255, 82, 82, 0.2)' : 'none',
        animation: isHovered ? 'pulseGreenBorder 2s infinite' : isActive ? 'pulseRedBorder 2s infinite' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '@keyframes pulseGreenBorder': {
          '0%': { borderColor: '#90BE6D', boxShadow: '0 0 15px rgba(144, 190, 109, 0.4)' },
          '50%': { borderColor: '#A3D075', boxShadow: '0 0 25px rgba(163, 208, 117, 0.6)' },
          '100%': { borderColor: '#90BE6D', boxShadow: '0 0 15px rgba(144, 190, 109, 0.4)' }
        },
        '@keyframes pulseRedBorder': {
          '0%': { borderColor: '#FF5252', boxShadow: '0 0 10px rgba(255, 82, 82, 0.2)' },
          '50%': { borderColor: '#FF6B6B', boxShadow: '0 0 15px rgba(255, 107, 107, 0.4)' },
          '100%': { borderColor: '#FF5252', boxShadow: '0 0 10px rgba(255, 82, 82, 0.2)' }
        }
      }}
    >
    </Box>
  );
};

const ToolIntroductionPopup = ({ onComplete }) => (
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
      zIndex: 2000
    }}
  >
    <Box
      component="img"
      src={nailClipperImg}
      alt="Nail Clipper Tool"
      sx={{
        width: 300,
        height: 300,
        mb: 4,
        filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        }
      }}
    />
    
    <Paper
      sx={{
        position: 'fixed',
        bottom: 50,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: 3,
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: '3px solid #90BE6D',
        display: 'flex',
        alignItems: 'center',
        gap: 3
      }}
    >
      <Box
        component="img"
        src={characterCatHelpful}
        alt="Cute Cat Helper"
        sx={{
          width: 100,
          height: 'auto',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
          animation: 'tilt 3s ease-in-out infinite',
          '@keyframes tilt': {
            '0%': { transform: 'rotate(0deg)' },
            '25%': { transform: 'rotate(5deg)' },
            '50%': { transform: 'rotate(0deg)' },
            '75%': { transform: 'rotate(-5deg)' },
            '100%': { transform: 'rotate(0deg)' }
          }
        }}
      />
      
      <Box sx={{ flex: 1, textAlign: 'left' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#280B60',
            mb: 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          This is a Nail Clipper
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: '#333',
            mb: 2,
            fontSize: '1rem',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4
          }}
        >
          Used to trim your nails and keep them neat and healthy! We'll use it to trim both 
          hand nails AND foot nails. Drag it to each dashed white box on the nails.
        </Typography>
        
        <Button
          variant="contained"
          onClick={onComplete}
          sx={{
            background: 'linear-gradient(135deg, #90BE6D 0%, #7DA85A 100%)',
            color: 'white',
            px: 4,
            py: 1,
            borderRadius: '20px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(144, 190, 109, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #A3D075 0%, #90BE6D 100%)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          OKAY
        </Button>
      </Box>
    </Paper>
  </Box>
);

const VideoPopup = ({ onContinue, currentStep, firstHandDragCompleted, firstFootDragCompleted }) => {
  const getVideoMessage = () => {
    if (currentStep === 'first-hand' && !firstHandDragCompleted) {
      return "This is how you trim nails! Cut straight across, not too short!";
    } else if (currentStep === 'first-foot' && !firstFootDragCompleted) {
      return "For foot nails, cut straight across to prevent ingrown toenails!";
    } else if (currentStep.includes('hand')) {
      const tips = [
        "Put your nail in the clipper and press down to trim the nail.",
        "Cut straight across, then round the tips gently!",
        "Don't cut too short to avoid hurting the skin!"
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    } else if (currentStep.includes('foot')) {
      const tips = [
        "Foot nails should be cut straight across!",
        "Keep foot nails slightly longer than hand nails!",
        "Dry feet completely before trimming nails!",
        "Cut toenails regularly to prevent problems!",
        "Use proper nail clippers for best results!"
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    return "Watch how to properly trim nails!";
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      
      <Box sx={{
        width: '60%',
        height: '390px',
        maxWidth: 220,
        minWidth: 200,
        backgroundColor: 'black',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        border: '3px solid white',
        mb: 2
      }}>
        <Box
          component="video"
          src={nailClippingVideo}
          autoPlay
          loop
          muted
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain'
          }}
        />
      </Box>
      
      <Paper
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: 3,
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          border: '3px solid #90BE6D',
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}
      >
        <Box
          component="img"
          src={characterCatHelpful}
          alt="Cute Cat Helper"
          sx={{
            width: 100,
            height: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            animation: 'tilt 3s ease-in-out infinite',
            '@keyframes tilt': {
              '0%': { transform: 'rotate(0deg)' },
              '25%': { transform: 'rotate(5deg)' },
              '50%': { transform: 'rotate(0deg)' },
              '75%': { transform: 'rotate(-5deg)' },
              '100%': { transform: 'rotate(0deg)' }
            }
          }}
        />
        
        <Box sx={{ flex: 1, textAlign: 'left' }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#280B60',
              mb: 2,
              fontFamily: 'Poppins, sans-serif',
              lineHeight: 1.4
            }}
          >
            {getVideoMessage()}
          </Typography>
          
          <Button
            variant="contained"
            onClick={onContinue}
            sx={{
              background: 'linear-gradient(135deg, #90BE6D 0%, #7DA85A 100%)',
              color: 'white',
              px: 6,
              py: 1.5,
              borderRadius: '25px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.2rem',
              textTransform: 'none',
              boxShadow: '0 6px 20px rgba(144, 190, 109, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A3D075 0%, #90BE6D 100%)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            CONTINUE
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default function NailCareGame() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const [correctSoundRef, setCorrectSoundRef] = useState(null);
  const [incorrectSoundRef, setIncorrectSoundRef] = useState(null);
  const [successSoundRef, setSuccessSoundRef] = useState(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const [showCharacterIntroduction, setShowCharacterIntroduction] = useState(false);
  const [showHandIntroduction, setShowHandIntroduction] = useState(false);
  const [showToolIntroduction, setShowToolIntroduction] = useState(false);

  const [currentStep, setCurrentStep] = useState('hand-selection');
  const [selectedHand, setSelectedHand] = useState(null);
  const [selectedFoot, setSelectedFoot] = useState(null);
  const [isDraggingClipper, setIsDraggingClipper] = useState(false);
  const [isDraggingClippings, setIsDraggingClippings] = useState(false);
  const [showNailClipper, setShowNailClipper] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [clippingCount, setClippingCount] = useState(0);
  const [completedFirstHand, setCompletedFirstHand] = useState(false);
  const [completedFirstFoot, setCompletedFirstFoot] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [showAfterFirstHand, setShowAfterFirstHand] = useState(false);
  const [showAfterFirstFoot, setShowAfterFirstFoot] = useState(false);
  const [completedNails, setCompletedNails] = useState([]);
  const [hoveredNailIndex, setHoveredNailIndex] = useState(-1);

  const [trashCanPosition] = useState({ x: 80, y: 70 });
  const [clippingsCleaned, setClippingsCleaned] = useState(false);

  const [firstHandDragCompleted, setFirstHandDragCompleted] = useState(false);
  const [firstFootDragCompleted, setFirstFootDragCompleted] = useState(false);

  const [nailClippingsPositions, setNailClippingsPositions] = useState({});
  const [draggedClippingId, setDraggedClippingId] = useState(null);
  const [originalClippingPositions, setOriginalClippingPositions] = useState({});

  const [nailClipperPosition, setNailClipperPosition] = useState({ x: 0, y: 0 });
  const [originalClipperPosition, setOriginalClipperPosition] = useState({ x: 0, y: 0 });

  const gameAreaRef = useRef(null);
  const videoRef = useRef(null);

  const nailDropZones = {
    leftHand: [
      { x: 37, y: 18, width: 4, height: 8 },
      { x: 41, y: 10, width: 4, height: 10 },
      { x: 46, y: 6, width: 5, height: 9 },
      { x: 52, y: 10, width: 5, height: 10 },
      { x: 60, y: 52, width: 5, height: 10 }
    ],
    rightHand: [
      { x: 60, y: 15, width: 4, height: 14 },
      { x: 55, y: 6, width: 5, height: 13 },
      { x: 50, y: 3, width: 4, height: 15 },
      { x: 44, y: 8, width: 5, height: 10 },
      { x: 34, y: 50, width: 8, height: 15 }
    ],
    leftFoot: [
      { x: 40, y: 20, width: 3, height: 9 },
      { x: 43, y: 12, width: 3, height: 10 },
      { x: 46, y: 9, width: 3, height: 10 },
      { x: 49, y: 6, width: 4, height: 11 },
      { x: 53, y: 5, width: 5, height: 14 }
    ],
    rightFoot: [
      { x: 56, y: 21, width: 3, height: 9 },
      { x: 54, y: 12, width: 3, height: 10 },
      { x: 51, y: 9, width: 3, height: 12 },
      { x: 47, y: 4, width: 4, height: 13 },
      { x: 42, y: 3, width: 5, height: 16 }
    ]
  };

  const getCharacterMessage = () => {
  switch (currentStep) {
    case 'hand-selection':
      return 'Choose a hand to start! 🐾';
    case 'first-hand':
      return `Drag to each nail! ${clippingCount}/5 done!`;
    case 'second-hand':
      return `Almost there! ${clippingCount}/5 done!`;
    case 'foot-selection':
      return 'Now choose a foot! 🦶';
    case 'first-foot':
      return `Foot nails! ${clippingCount}/5 done!`;
    case 'second-foot':
      return `Last foot! ${clippingCount}/5 done!`;
    case 'complete':
      return 'Perfect hygiene! You trimmed all nails! 🎉';
    default:
      return 'Let\'s trim those nails!';
  }
};

  const handleStartGame = () => {
    setShowStartScreen(false);
    setShowCharacterIntroduction(true);
  };

  const handleCharacterIntroductionComplete = () => {
    setShowCharacterIntroduction(false);
    setShowHandIntroduction(true);
  };

  const handleHandIntroductionComplete = () => {
    setShowHandIntroduction(false);
    setShowToolIntroduction(true);
  };

  const handleToolIntroductionComplete = () => {
    setShowToolIntroduction(false);
    setCurrentStep('hand-selection');
  };

  const handleHandSelection = (hand) => {
    setSelectedHand(hand);
    setCurrentStep('first-hand');
    setShowNailClipper(true);
    
    const clipperPosition = { x: 25, y: 50 };
    setNailClipperPosition(clipperPosition);
    setOriginalClipperPosition(clipperPosition);
  };

  const handleFootSelection = (foot) => {
    setSelectedFoot(foot);
    setCurrentStep('first-foot');
    setShowNailClipper(true);
    
    const clipperPosition = { x: 25, y: 50 };
    setNailClipperPosition(clipperPosition);
    setOriginalClipperPosition(clipperPosition);
  };

  const getRotationForFinger = (stepType, index) => {
    if (stepType.includes('hand')) {
      const handRotations = [15, -10, 25, -15, 30];
      return handRotations[index] || (Math.random() * 60 - 30);
    } else {
      const footRotations = [10, -5, 20, -10, 25];
      return footRotations[index] || (Math.random() * 50 - 25);
    }
  };

  const handleNailClippingsMouseDown = (e, clippingId) => {
    if (currentStep !== 'cleanup' || clippingsCleaned) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDraggingClippings(true);
    setDraggedClippingId(clippingId);
    setDragPos({ x: e.clientX, y: e.clientY });
    
    setOriginalClippingPositions(prev => ({
      ...prev,
      [clippingId]: nailClippingsPositions[clippingId]
    }));
  };

  const handleMouseMove = (e) => {
    if (isDraggingClipper && !showVideo) {
      setDragPos({ x: e.clientX, y: e.clientY });
      
      const gameArea = gameAreaRef.current;
      if (!gameArea) return;
      
      const rect = gameArea.getBoundingClientRect();
      const hoverX = ((e.clientX - rect.left) / rect.width) * 100;
      const hoverY = ((e.clientY - rect.top) / rect.height) * 100;
      
      let currentNailZones;
      if (currentStep === 'first-hand') {
        currentNailZones = selectedHand === 'left' ? nailDropZones.leftHand : nailDropZones.rightHand;
      } else if (currentStep === 'second-hand') {
        currentNailZones = selectedHand === 'left' ? nailDropZones.rightHand : nailDropZones.leftHand;
      } else if (currentStep === 'first-foot') {
        currentNailZones = selectedFoot === 'left' ? nailDropZones.leftFoot : nailDropZones.rightFoot;
      } else if (currentStep === 'second-foot') {
        currentNailZones = selectedFoot === 'left' ? nailDropZones.rightFoot : nailDropZones.leftFoot;
      }
      
      let hoveredIndex = -1;
      for (let i = 0; i < currentNailZones.length; i++) {
        const nailZone = currentNailZones[i];
        const nailKey = `${currentStep}-${i}`;
        const isCompleted = completedNails.includes(nailKey);
        
        if (!isCompleted && 
            hoverX >= nailZone.x && 
            hoverX <= nailZone.x + nailZone.width &&
            hoverY >= nailZone.y && 
            hoverY <= nailZone.y + nailZone.height) {
          hoveredIndex = i;
          break;
        }
      }
      
      setHoveredNailIndex(hoveredIndex);
    } else if (isDraggingClippings && draggedClippingId) {
      setDragPos({ x: e.clientX, y: e.clientY });
      
      const gameArea = gameAreaRef.current;
      if (!gameArea) return;
      
      const rect = gameArea.getBoundingClientRect();
      const newX = ((e.clientX - rect.left) / rect.width) * 100;
      const newY = ((e.clientY - rect.top) / rect.height) * 100;
      
      setNailClippingsPositions(prev => ({
        ...prev,
        [draggedClippingId]: { x: newX, y: newY }
      }));
    }
  };

  const handleMouseUp = (e) => {
    if (isDraggingClipper && !showVideo) {
      setIsDraggingClipper(false);
      setHoveredNailIndex(-1);
      
      const gameArea = gameAreaRef.current;
      if (!gameArea) return;
      
      const rect = gameArea.getBoundingClientRect();
      const dropX = ((e.clientX - rect.left) / rect.width) * 100;
      const dropY = ((e.clientY - rect.top) / rect.height) * 100;
      
      let currentNailZones;
      if (currentStep === 'first-hand') {
        currentNailZones = selectedHand === 'left' ? nailDropZones.leftHand : nailDropZones.rightHand;
      } else if (currentStep === 'second-hand') {
        currentNailZones = selectedHand === 'left' ? nailDropZones.rightHand : nailDropZones.leftHand;
      } else if (currentStep === 'first-foot') {
        currentNailZones = selectedFoot === 'left' ? nailDropZones.leftFoot : nailDropZones.rightFoot;
      } else if (currentStep === 'second-foot') {
        currentNailZones = selectedFoot === 'left' ? nailDropZones.rightFoot : nailDropZones.leftFoot;
      }
      
      let isOnNail = false;
      let nailIndex = -1;
      
      for (let i = 0; i < currentNailZones.length; i++) {
        const nailZone = currentNailZones[i];
        const isDroppedOnThisNail = 
          dropX >= nailZone.x && 
          dropX <= nailZone.x + nailZone.width &&
          dropY >= nailZone.y && 
          dropY <= nailZone.y + nailZone.height;
        
        if (isDroppedOnThisNail) {
          isOnNail = true;
          nailIndex = i;
          break;
        }
      }
      
      if (isOnNail && nailIndex !== -1) {
        const nailKey = `${currentStep}-${nailIndex}`;
        if (!completedNails.includes(nailKey)) {
          setShowVideo(true);
          playSoundEffect('correct');
          
          if (currentStep === 'first-hand' && !firstHandDragCompleted) {
            setFirstHandDragCompleted(true);
          } else if (currentStep === 'first-foot' && !firstFootDragCompleted) {
            setFirstFootDragCompleted(true);
          }
          
          setCompletedNails(prev => [...prev, nailKey]);
          
          const currentNailZones = getCurrentNailZones();
          if (currentNailZones && currentNailZones[nailIndex]) {
            const nailZone = currentNailZones[nailIndex];
            const clippingsPosition = {
              x: nailZone.x + nailZone.width / 2,
              y: nailZone.y - 5
            };
            setNailClippingsPositions(prev => ({
              ...prev,
              [nailKey]: clippingsPosition
            }));
          }
        } else {
          playSoundEffect('incorrect');
        }
      } else {
        playSoundEffect('incorrect');
      }
      
      setNailClipperPosition(originalClipperPosition);
    } else if (isDraggingClippings) {
      setIsDraggingClippings(false);
      
      const gameArea = gameAreaRef.current;
      if (!gameArea) return;
      
      const rect = gameArea.getBoundingClientRect();
      const dropX = ((e.clientX - rect.left) / rect.width) * 100;
      const dropY = ((e.clientY - rect.top) / rect.height) * 100;
      
      const trashCanArea = {
        x: trashCanPosition.x - 5,
        y: trashCanPosition.y - 5,
        width: 10,
        height: 10
      };
      
      const isOnTrashCan = 
        dropX >= trashCanArea.x && 
        dropX <= trashCanArea.x + trashCanArea.width &&
        dropY >= trashCanArea.y && 
        dropY <= trashCanArea.y + trashCanArea.height;
      
      if (isOnTrashCan && draggedClippingId) {
        playSoundEffect('correct');
        
        const updatedPositions = {...nailClippingsPositions};
        delete updatedPositions[draggedClippingId];
        setNailClippingsPositions(updatedPositions);
        
        if (Object.keys(updatedPositions).length === 0) {
          setClippingsCleaned(true);
          setTimeout(() => {
            completeGame();
          }, 2000);
        }
      } else {
        playSoundEffect('incorrect');
        if (draggedClippingId && originalClippingPositions[draggedClippingId]) {
          setNailClippingsPositions(prev => ({
            ...prev,
            [draggedClippingId]: originalClippingPositions[draggedClippingId]
          }));
        }
      }
      
      setDraggedClippingId(null);
    }
  };

  const getCurrentNailZones = () => {
    switch (currentStep) {
      case 'first-hand':
        return selectedHand === 'left' ? nailDropZones.leftHand : nailDropZones.rightHand;
      case 'second-hand':
        return selectedHand === 'left' ? nailDropZones.rightHand : nailDropZones.leftHand;
      case 'first-foot':
        return selectedFoot === 'left' ? nailDropZones.leftFoot : nailDropZones.rightFoot;
      case 'second-foot':
        return selectedFoot === 'left' ? nailDropZones.rightFoot : nailDropZones.leftFoot;
      default:
        return null;
    }
  };

  const handleNailClipperMouseDown = (e) => {
    if (!showNailClipper || showVideo) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsDraggingClipper(true);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handleVideoNext = () => {
  setShowVideo(false);
  setClippingCount(prev => prev + 1);
  setScore(prev => Math.min(100, prev + 5));
  
  if (clippingCount + 1 >= 5) {
    if (currentStep === 'first-hand') {
      setShowAfterFirstHand(true);
      
      setTimeout(() => {
        setShowAfterFirstHand(false);
        setCompletedFirstHand(true);
        setCurrentStep('second-hand');
        setClippingCount(0);
        
        removeCompletedClippings('first-hand');
        
        const clipperPosition = { x: 25, y: 50 };
        setNailClipperPosition(clipperPosition);
        setOriginalClipperPosition(clipperPosition);
      }, 3000);
    } else if (currentStep === 'second-hand') {
      setShowAfterFirstHand(true);
      
      setTimeout(() => {
        setShowAfterFirstHand(false);
        setCurrentStep('foot-selection');
        setClippingCount(0);
        
        removeCompletedClippings('second-hand');
      }, 3000);
    } else if (currentStep === 'first-foot') {
      setShowAfterFirstFoot(true);
      
      setTimeout(() => {
        setShowAfterFirstFoot(false);
        setCompletedFirstFoot(true);
        setCurrentStep('second-foot');
        setClippingCount(0);
        
        removeCompletedClippings('first-foot');
        
        const clipperPosition = { x: 25, y: 50 };
        setNailClipperPosition(clipperPosition);
        setOriginalClipperPosition(clipperPosition);
      }, 3000);
    } else if (currentStep === 'second-foot') {
      setShowAfterFirstFoot(true);
      
      setTimeout(() => {
        setShowAfterFirstFoot(false);
        completeGame();
        
        removeCompletedClippings('second-foot');
      }, 3000);
    }
  }
};

  const completeGame = () => {
    setScore(100);
    setGameCompleted(true);
    playSoundEffect('success');
    setTimeout(() => {
      setShowSuccess(true);
    }, 1000);
  };

  const getCurrentInstruction = () => {
    if (showCharacterIntroduction) return 'Meet Purrnando!';
    if (showHandIntroduction) return 'Learn about complete nail care';
    if (showToolIntroduction) return 'Meet the nail clipper tool';
    
    switch (currentStep) {
      case 'hand-selection':
        return 'Select a hand to start trimming nails';
      case 'first-hand':
        return `Drag the nail clipper to each dashed box to trim hand nails (${clippingCount}/5)`;
      case 'second-hand':
        return `Drag the nail clipper to each dashed box to trim hand nails (${clippingCount}/5)`;
      case 'foot-selection':
        return 'Select a foot to start trimming nails';
      case 'first-foot':
        return `Drag the nail clipper to each dashed box to trim foot nails (${clippingCount}/5)`;
      case 'second-foot':
        return `Drag the nail clipper to each dashed box to trim foot nails (${clippingCount}/5)`;
      case 'complete':
        return 'Great job! All nails are trimmed.';
      default:
        return 'Complete the nail care activity';
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = 20;
    let completedSteps = completedNails.length;
    
    return (completedSteps / totalSteps) * 100;
  };

  const saveProgress = async () => {
    if (progressSaving || progressSaved) {
      console.log('Progress already saving or saved, skipping');
      return;
    }

    try {
      setProgressSaving(true);
      
      const studentId = getStudentId();
      
      console.log('Authentication check:', { 
        studentId, 
        userType: localStorage.getItem('userType'),
        studentIdFromStorage: localStorage.getItem('studentId')
      });
      
      if (!studentId) {
        console.error('Cannot save progress: No valid student ID found');
        
        let errorMessage = 'Please log in to save your progress.\n\n';
        errorMessage += `Debug Info:\n`;
        errorMessage += `- User type: ${localStorage.getItem('userType') || 'Not set'}\n`;
        errorMessage += `- Student ID: ${localStorage.getItem('studentId') || 'Not found'}`;
        
        alert(errorMessage);
        setProgressSaving(false);
        return;
      }
      
      if (!lessonId) {
        console.error('Cannot save progress: No lesson ID available');
        alert('Lesson ID is missing. Cannot save progress.');
        setProgressSaving(false);
        return;
      }

      const progressData = {
        score: 100,
        maxScore: 100,  
        completed: true,
        starsEarned: 3
      };
      
      console.log('Saving progress data:', progressData);
      
      const result = await saveStudentLessonProgress(
        studentId, 
        parseInt(lessonId, 10), 
        progressData
      );
      
      console.log('Progress save result:', result);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
      
      if (error.message.includes('No student ID available')) {
        alert('Please log in to save your progress.');
      } else {
        alert('Failed to save progress. Please try again.');
      }
    } finally {
      setProgressSaving(false);
    }
  };

  const getStarRating = () => {
    if (score >= 90) return 3;
    if (score >= 70) return 2;
    if (score >= 50) return 1;
    return 0;
  };

  const handleContinue = async () => {
    console.log('Continue clicked, progress state:', { progressSaved, progressSaving });
    
    if (!progressSaved && !progressSaving) {
      console.log('Saving progress before continue...');
      await saveProgress();
    } else if (progressSaving) {
      console.log('Progress is currently saving, please wait...');
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
    
    console.log('Navigating back...');
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          console.log('Missing studentId or lessonId:', { studentId, lessonId });
          return;
        }
        
        console.log('Fetching progress for student:', studentId, 'lesson:', lessonId);
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse && progressResponse.data) {
          const progressData = progressResponse.data;
          setScore(progressData.score || 0);
          console.log('Loaded existing progress:', progressData);
          
          if (progressData.completed) {
            setGameCompleted(true);
            setShowSuccess(true);
          }
        } else {
          console.log('No existing progress found - starting fresh');
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        setLesson({
          id: lessonId || 1,
          title: "Complete Nail Care",
          description: "Learn proper nail care for hands and feet!",
          level: 3
        });
        
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);

  useEffect(() => {
    if (showSuccess) {
      const animateStars = async () => {
        setStarAnimationStage(0);
        const totalStars = getStarRating();
        
        for (let i = 0; i < totalStars; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setStarAnimationStage(i + 1);
        }
      };
      
      const timer = setTimeout(animateStars, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, score]);

  useEffect(() => {
    const audio = new Audio(backgroundMusic);
    audio.loop = true;
    audio.volume = 0.3;
    setAudioRef(audio);

    const correctAudio = new Audio(correctSound);
    const incorrectAudio = new Audio(incorrectSound);
    const successAudio = new Audio(successSound);
    
    correctAudio.volume = 0.7;
    incorrectAudio.volume = 0.7;
    successAudio.volume = 0.7;
    
    setCorrectSoundRef(correctAudio);
    setIncorrectSoundRef(incorrectAudio);
    setSuccessSoundRef(successAudio);

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
    if (showSuccess) {
      const createConfetti = () => {
        const pieces = [];
        for (let i = 0; i < 150; i++) {
          pieces.push({
            id: i,
            x: Math.random() * 100,
            y: -10,
            rotation: Math.random() * 360,
            color: [
              '#FF0080', '#00FFFF', '#FF4500', '#9400D3', '#32CD32', '#FFD700', 
              '#FF1493', '#00FF7F', '#1E90FF', '#FF6347', '#ADFF2F', '#FF69B4', 
              '#00CED1', '#FFA500', '#DA70D6'
            ][Math.floor(Math.random() * 15)],
            size: Math.random() * 12 + 6,
            speed: Math.random() * 4 + 2,
            drift: (Math.random() - 0.5) * 3,
            width: Math.random() * 8 + 4,
            height: Math.random() * 12 + 6
          });
        }
        setConfettiPieces(pieces);
      };
      
      const timer = setTimeout(createConfetti, 500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const renderNailDropZones = () => {
    if ((currentStep !== 'first-hand' && currentStep !== 'second-hand' && 
         currentStep !== 'first-foot' && currentStep !== 'second-foot') || !isDraggingClipper) {
      return null;
    }

    let currentNailZones;
    if (currentStep === 'first-hand') {
      currentNailZones = selectedHand === 'left' ? nailDropZones.leftHand : nailDropZones.rightHand;
    } else if (currentStep === 'second-hand') {
      currentNailZones = selectedHand === 'left' ? nailDropZones.rightHand : nailDropZones.leftHand;
    } else if (currentStep === 'first-foot') {
      currentNailZones = selectedFoot === 'left' ? nailDropZones.leftFoot : nailDropZones.rightFoot;
    } else if (currentStep === 'second-foot') {
      currentNailZones = selectedFoot === 'left' ? nailDropZones.rightFoot : nailDropZones.leftFoot;
    }

    return currentNailZones.map((nailZone, index) => {
      const nailKey = `${currentStep}-${index}`;
      const isCompleted = completedNails.includes(nailKey);
      const isHovered = hoveredNailIndex === index;
      
      return (
        <DropZone 
          key={index}
          position={nailZone}
          size={{ width: nailZone.width, height: nailZone.height }}
          isActive={!isCompleted}
          isHovered={isHovered}
          showNumber={false}
        />
      );
    });
  };

  const renderNailClippings = () => {
  if (currentStep !== 'first-hand' && currentStep !== 'second-hand' && 
      currentStep !== 'first-foot' && currentStep !== 'second-foot') {
    return null;
  }

  return completedNails.map(nailKey => {
    const position = nailClippingsPositions[nailKey];
    if (!position) return null;

    // Generate a random but consistent rotation for each nail based on its key
    const rotation = (nailKey.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 360);

    return (
      <Box
        key={nailKey}
        component="img"
        src={nailClippingsImg}
        alt="Nail Clippings"
        sx={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          width: 60,
          height: 60,
          zIndex: 60,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          animation: 'floatClippings 2s ease-in-out infinite',
          '@keyframes floatClippings': {
            '0%': { transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(1)` },
            '50%': { transform: `translate(-50%, -55%) rotate(${rotation}deg) scale(1.05)` },
            '100%': { transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(1)` }
          }
        }}
      />
    );
  });
};

  const removeCompletedClippings = (completedStep) => {
    console.log(`Removing clippings for: ${completedStep}`);
    
    const updatedPositions = {...nailClippingsPositions};
    Object.keys(updatedPositions).forEach(key => {
      if (key.startsWith(completedStep)) {
        delete updatedPositions[key];
      }
    });
    
    setNailClippingsPositions(updatedPositions);
    console.log(`Remaining clippings:`, Object.keys(updatedPositions).length);
  };

  const renderCleanupClippings = () => {
    if (currentStep !== 'cleanup' || clippingsCleaned) return null;

    const totalClippings = Object.keys(nailClippingsPositions).length;
    
    if (totalClippings === 0) {
      return null;
    }

    const clippingGroups = {
      topLeft: Object.keys(nailClippingsPositions).slice(0, Math.ceil(totalClippings / 3)),
      topRight: Object.keys(nailClippingsPositions).slice(Math.ceil(totalClippings / 3), Math.ceil(totalClippings * 2 / 3)),
      bottom: Object.keys(nailClippingsPositions).slice(Math.ceil(totalClippings * 2 / 3))
    };

    const groupPositions = {
      topLeft: { x: 30, y: 30 },
      topRight: { x: 70, y: 30 },
      bottom: { x: 50, y: 60 }
    };

    return (
      <>
        {Object.entries(clippingGroups).map(([groupName, clippingIds]) => {
          if (clippingIds.length === 0) return null;
          
          return clippingIds.map((clippingId, index) => {
            const position = nailClippingsPositions[clippingId] || {
              x: groupPositions[groupName].x + (index % 3) * 8 - 8,
              y: groupPositions[groupName].y + Math.floor(index / 3) * 8
            };
            
            const [step, fingerIndex] = clippingId.split('-');
            const baseRotation = getRotationForFinger(step, parseInt(fingerIndex));
            const randomVariation = (Math.random() * 10 - 5);
            const finalRotation = baseRotation + randomVariation;

            return (
              <Box
                key={clippingId}
                component="img"
                src={nailClippingsImg}
                alt="Nail Clippings"
                onMouseDown={(e) => handleNailClippingsMouseDown(e, clippingId)}
                sx={{
                  position: 'absolute',
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${finalRotation}deg)`,
                  width: 50,
                  height: 50,
                  cursor: 'grab',
                  transition: 'all 0.2s ease',
                  zIndex: 1000,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                  '&:hover': {
                    transform: `translate(-50%, -50%) rotate(${finalRotation}deg) scale(1.1)`
                  },
                  userSelect: 'none',
                  animation: 'floatIndividual 3s ease-in-out infinite',
                  animationDelay: `${index * 0.2}s`,
                  '@keyframes floatIndividual': {
                    '0%': { transform: `translate(-50%, -50%) rotate(${finalRotation}deg) scale(1)` },
                    '50%': { transform: `translate(-50%, -53%) rotate(${finalRotation}deg) scale(1.05)` },
                    '100%': { transform: `translate(-50%, -50%) rotate(${finalRotation}deg) scale(1)` }
                  }
                }}
              />
            );
          });
        })}
      </>
    );
  };

  const renderGameContent = () => {
    if (showCharacterIntroduction) {
      return <CharacterIntroductionPopup onComplete={handleCharacterIntroductionComplete} />;
    }

    if (showHandIntroduction) {
      return <HandIntroductionPopup onComplete={handleHandIntroductionComplete} />;
    }

    if (showToolIntroduction) {
      return <ToolIntroductionPopup onComplete={handleToolIntroductionComplete} />;
    }

    if (showVideo) {
      return (
        <VideoPopup 
          onContinue={handleVideoNext}
          currentStep={currentStep}
          firstHandDragCompleted={firstHandDragCompleted}
          firstFootDragCompleted={firstFootDragCompleted}
        />
      );
    }

    if (showAfterFirstHand) {
      return (
        <Box sx={{ position: 'relative', width: '100%', height: 600, mt: 7 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 4, 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%' 
          }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={afterLeftHand}
                alt="Completed Left Hand"
                sx={{
                  width: currentStep === 'second-hand' ? 600 : 550,
                  height: currentStep === 'second-hand' ? 600 : 550,
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3)) brightness(1.1)',
                  opacity: currentStep === 'first-hand' && selectedHand === 'right' ? 0.3 : 1
                }}
              />
              {currentStep === 'second-hand' && <SparkleAnimation position={{ x: 50, y: 50 }} />}
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={afterRightHand}
                alt="Completed Right Hand"
                sx={{
                  width: currentStep === 'second-hand' ? 600 : 550,
                  height: currentStep === 'second-hand' ? 600 : 550,
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3)) brightness(1.1)',
                  opacity: currentStep === 'first-hand' && selectedHand === 'left' ? 0.3 : 1
                }}
              />
              {currentStep === 'second-hand' && <SparkleAnimation position={{ x: 50, y: 50 }} />}
            </Box>
          </Box>
          
          {currentStep === 'first-hand' && <SparkleAnimation position={{ x: 50, y: 50 }} />}
          
          <Typography
            variant="h4"
            sx={{
              position: 'absolute',
              top: '2%',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '2rem',
              px: 4,
              py: 2,
              borderRadius: '20px',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {currentStep === 'first-hand'
              ? 'First Hand Completed!'
              : 'Both Hands Completed!'}
          </Typography>
        </Box>
      );
    }

    if (showAfterFirstFoot) {
      return (
        <Box sx={{ position: 'relative', width: '100%', height: 600, mt: 7 }}>
          <Box
            component="img"
            src={selectedFoot === 'left' ? afterLeftFoot : afterRightFoot}
            alt="Completed Foot"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 550,
              height: 550,
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3)) brightness(1.1)'
            }}
          />
          <SparkleAnimation position={{ x: 50, y: 50 }} />
          
          <Typography
            variant="h4"
            sx={{
              position: 'absolute',
              top: '1%',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              px: 4,
              py: 2,
              borderRadius: '20px',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {currentStep === 'first-foot' ? 'First Foot Completed!' : 'Both Feet Completed!'}
          </Typography>
        </Box>
      );
    }

    switch (currentStep) {
      case 'hand-selection':
        return (
          <Box sx={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', mt: 13 }}>
            <Box
              component="img"
              src={beforeLeftHand}
              alt="Left Hand"
              sx={{
                width: 550,
                height: 550,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
              onClick={() => handleHandSelection('left')}
            />
            <Box
              component="img"
              src={beforeRightHand}
              alt="Right Hand"
              sx={{
                width: 550,
                height: 550,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
              onClick={() => handleHandSelection('right')}
            />
          </Box>
        );

      case 'first-hand':
      case 'second-hand':
        return (
          <Box sx={{ position: 'relative', width: '100%', height: 600, mt: 7 }}>
            <Box
              component="img"
              src={currentStep === 'first-hand' 
                ? (selectedHand === 'left' ? beforeLeftHand : beforeRightHand)
                : (selectedHand === 'left' ? beforeRightHand : beforeLeftHand)
              }
              alt="Hand to Trim"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 550,
                height: 550,
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
              }}
            />

            {renderNailDropZones()}

            {renderNailClippings()}

            {showNailClipper && !isDraggingClipper && (
              <Box
                component="img"
                src={nailClipperImg}
                alt="Nail Clipper"
                onMouseDown={handleNailClipperMouseDown}
                sx={{
                  position: 'absolute',
                  left: `${nailClipperPosition.x}%`,
                  top: `${nailClipperPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 200,
                  height: 200,
                  cursor: 'grab',
                  transition: 'all 0.3s ease',
                  zIndex: 1000,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                  '&:hover': {
                    transform: 'translate(-50%, -50%) scale(1.1)'
                  },
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              />
            )}
          </Box>
        );

      case 'foot-selection':
        return (
          <Box sx={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', mt: 13 }}>
            <Box
              component="img"
              src={beforeLeftFoot}
              alt="Left Foot"
              sx={{
                width: 550,
                height: 550,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
              onClick={() => handleFootSelection('left')}
            />
            <Box
              component="img"
              src={beforeRightFoot}
              alt="Right Foot"
              sx={{
                width: 550,
                height: 550,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                }
              }}
              onClick={() => handleFootSelection('right')}
            />
          </Box>
        );

      case 'first-foot':
      case 'second-foot':
        return (
          <Box sx={{ position: 'relative', width: '100%', height: 600, mt: 7 }}>
            <Box
              component="img"
              src={currentStep === 'first-foot' 
                ? (selectedFoot === 'left' ? beforeLeftFoot : beforeRightFoot)
                : (selectedFoot === 'left' ? beforeRightFoot : beforeLeftFoot)
              }
              alt="Foot to Trim"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 550,
                height: 550,
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
              }}
            />

            {renderNailDropZones()}

            {renderNailClippings()}

            {showNailClipper && !isDraggingClipper && (
              <Box
                component="img"
                src={nailClipperImg}
                alt="Nail Clipper"
                onMouseDown={handleNailClipperMouseDown}
                sx={{
                  position: 'absolute',
                  left: `${nailClipperPosition.x}%`,
                  top: `${nailClipperPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 200,
                  height: 200,
                  cursor: 'grab',
                  transition: 'all 0.3s ease',
                  zIndex: 1000,
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                  '&:hover': {
                    transform: 'translate(-50%, -50%) scale(1.1)'
                  },
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              />
            )}
          </Box>
        );

      case 'complete':
        return (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h4" sx={{ color: 'white', mb: 4, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              Congratulations! You've completed complete nail care!
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                <Box
                  component="img"
                  src={afterLeftHand}
                  alt="Trimmed Left Hand"
                  sx={{ width: 300, height: 300, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
                />
                <Box
                  component="img"
                  src={afterRightHand}
                  alt="Trimmed Right Hand"
                  sx={{ width: 300, height: 300, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                <Box
                  component="img"
                  src={afterLeftFoot}
                  alt="Trimmed Left Foot"
                  sx={{ width: 300, height: 300, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
                />
                <Box
                  component="img"
                  src={afterRightFoot}
                  alt="Trimmed Right Foot"
                  sx={{ width: 300, height: 300, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
                />
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  const resetGame = () => {
    setShowFeedback(false);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    
    setCurrentStep('hand-selection');
    setSelectedHand(null);
    setSelectedFoot(null);
    setClippingCount(0);
    setCompletedFirstHand(false);
    setCompletedFirstFoot(false);
    setShowNailClipper(false);
    setIsDraggingClipper(false);
    setIsDraggingClippings(false);
    setShowVideo(false);
    setShowAfterFirstHand(false);
    setShowAfterFirstFoot(false);
    setCompletedNails([]);
    setHoveredNailIndex(-1);
    setClippingsCleaned(false);
    setNailClippingsPositions({});
    setDraggedClippingId(null);
    setOriginalClippingPositions({});
    
    setFirstHandDragCompleted(false);
    setFirstFootDragCompleted(false);
    
    setShowCharacterIntroduction(true);
    setShowHandIntroduction(false);
    setShowToolIntroduction(false);
    
    if (audioRef && !audioPlaying) {
      audioRef.play().then(() => {
        setAudioPlaying(true);
      }).catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  const handleGoHome = () => {
    if (audioRef) {
      audioRef.pause();
      setAudioPlaying(false);
    }
    navigate(-1);
  };

  const getStudentId = () => {
    try {
      const studentId = localStorage.getItem('studentId');
      const userType = localStorage.getItem('userType');
      
      console.log('Retrieving student ID:', { studentId, userType });
      
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

  const playSoundEffect = (soundType) => {
    try {
      if (soundType === 'correct' && correctSoundRef) {
        correctSoundRef.currentTime = 0;
        correctSoundRef.play();
      } else if (soundType === 'incorrect' && incorrectSoundRef) {
        incorrectSoundRef.currentTime = 0;
        incorrectSoundRef.play();
      } else if (soundType === 'success' && successSoundRef) {
        successSoundRef.currentTime = 0;
        successSoundRef.play();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  if (showStartScreen) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImg})`,
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
          background: 'linear-gradient(135deg, rgba(144, 190, 109, 0.8) 0%, rgba(25, 130, 196, 0.8) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 1
        }}>
          <Typography variant="h1" sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            mb: 2,
            fontFamily: 'Poppins, sans-serif',
            fontSize: { xs: '3rem', md: '5rem' },
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            Complete Nail Care
          </Typography>
          
          <Typography variant="h4" sx={{ 
            color: 'rgba(255, 255, 255, 0.95)', 
            mb: 6,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            maxWidth: '600px',
            px: 2
          }}>
            Learn how to take care of your hand nails AND foot nails properly!
          </Typography>
          
          <Stack direction="row" spacing={3}>
            <Button 
              variant="contained"
              onClick={handleStartGame}
              sx={{ 
                background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                color: 'white',
                px: 8,
                py: 2,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.5rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Start Game!
            </Button>
          </Stack>
        </Box>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />
        <div style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(2px)'
        }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        <Navbar />
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <Paper sx={{ 
            p: 6, 
            borderRadius: '20px', 
            backgroundColor: '#FFFAF4',
            border: '2px solid #FF595E'
          }}>
            <Typography variant="h5" sx={{ 
              color: '#280B60', 
              fontWeight: 'bold', 
              mb: 3,
            }}>
              Oops! Something went wrong.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/homepage')}
              sx={{ 
                backgroundColor: '#FF595E',
                fontSize: '1.2rem',
                px: 4,
                py: 2,
                borderRadius: '20px',
                fontWeight: '600',
                '&:hover': { backgroundColor: '#E04549' }
              }}
            >
              Go Home
            </Button>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      
      <Container maxWidth="xl" sx={{ py: 1 }}>
        <Box 
          sx={{
            position: 'relative',
            zIndex: 1010,
            mb: 2
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              {getCurrentInstruction()}
            </Typography>
          </Stack>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={getProgressPercentage()} 
              sx={{ 
                height: 8, 
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
        </Box>

        {!showStartScreen && !showCharacterIntroduction && !showHandIntroduction && !showToolIntroduction && !showVideo && !showAfterFirstHand && !showAfterFirstFoot && (
          <CharacterCat 
            gameState={currentStep}
            message={getCharacterMessage()}
          />
        )}

        <Box sx={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* Reset Button - Image with Larger Hover */}
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
          
          {/* Home Button - Image with Larger Hover */}
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

        <Box sx={{ 
          position: 'fixed',
          top: 100,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Button
            onClick={() => {
              if (audioRef) {
                if (audioPlaying) {
                  audioRef.pause();
                  setAudioPlaying(false);
                } else {
                  audioRef.play().then(() => {
                    setAudioPlaying(true);
                  }).catch(error => {
                    console.log('Audio play failed:', error);
                  });
                }
              }
            }}
            sx={{
              minWidth: '60px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: audioPlaying 
                ? 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)'
                : 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              fontSize: '1.5rem',
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

        <Box 
          ref={gameAreaRef}
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)',
            width: '100%',
            pt: 1,
            mb: 0,
            pb: 0,
            position: 'relative'
          }}
        >
          {renderGameContent()}
        </Box>

        {isDraggingClipper && (
          <Box
            component="img"
            src={nailClipperImg}
            alt="Nail Clipper"
            sx={{
              position: 'fixed',
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              width: 120,
              height: 120,
              pointerEvents: 'none',
              zIndex: 1500,
              transform: 'translate(-50%, -50%)',
              opacity: 0.9,
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5)) brightness(1.2)',
              cursor: 'grabbing',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          />
        )}

        {isDraggingClippings && draggedClippingId && (
          <Box
            component="img"
            src={nailClippingsImg}
            alt="Nail Clippings"
            sx={{
              position: 'fixed',
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              width: 50,
              height: 50,
              pointerEvents: 'none',
              zIndex: 1500,
              transform: 'translate(-50%, -50%)',
              opacity: 0.9,
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5)) brightness(1.2)',
              cursor: 'grabbing',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          />
        )}
        
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
            color: 'white'
          }}>
            <EmojiEventsIcon sx={{ 
              fontSize: 150,
              color: 'white',
              mb: 4
            }} />
            <Typography variant="h1" sx={{ 
              fontWeight: 'bold',
              color: 'white',
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
              mb: 2
            }}>
              Complete Nail Care Mastered!
            </Typography>
            
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
            <Typography variant="h6" sx={{ 
              color: 'white',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Amazing job! Your hand nails AND foot nails look perfectly groomed and healthy!
            </Typography>
            
            {progressSaving && (
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                backgroundColor: 'rgba(25, 130, 196, 0.8)', 
                borderRadius: '15px',
                color: 'white'
              }}>
                <CircularProgress size={30} sx={{ mr: 2, color: 'white' }} />
                <Typography variant="h5" sx={{ display: 'inline' }}>
                  Saving your progress...
                </Typography>
              </Box>
            )}
            
            {progressSaved && (
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                backgroundColor: 'rgba(144, 190, 109, 0.8)', 
                borderRadius: '15px',
                color: 'white'
              }}>
                <CheckCircleIcon sx={{ mr: 2, fontSize: 30, verticalAlign: 'middle' }} />
                <Typography variant="h6" sx={{ display: 'inline' }}>
                  Progress saved successfully!
                </Typography>
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
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {progressSaving ? 'Saving...' : 'Continue'}
              </Button>
              <Button 
                onClick={async () => {
                navigate(`/lesson/hygiene/level-4/${moduleId || 1}/${parseInt(lessonId) + 1 || 2}`);
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
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '2px'
                  }
                }}
              >
                Next Level
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
}