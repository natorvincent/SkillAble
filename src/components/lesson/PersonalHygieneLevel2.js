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
  Chip
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

import bathroomBg from "../../assets/hygienelevel2/lvl2bg.png"
import teethImg from "../../assets/hygienelevel2/before_teeth.png"
import afterTeethImg from "../../assets/hygienelevel2/after_teeth.png"
import blob1Img from "../../assets/hygienelevel2/blob1.png"
import blob2Img from "../../assets/hygienelevel2/blob2.png"
import toothbrushImg from "../../assets/hygienelevel2/toothbrush.png"
import toothpasteImg from "../../assets/hygienelevel2/toothpaste.png"
import toothbrushWithPasteImg from "../../assets/hygienelevel2/with_paste.png"
import waterCupImg from "../../assets/hygienelevel2/water.png"

// Character images
import characterCatDefault from "../../assets/hygienelevel3/cat.png"
import characterCatExcited from "../../assets/hygienelevel3/cat_excited.png"
import characterCatCurious from "../../assets/hygienelevel3/cat_curious.png"
import characterCatHelpful from "../../assets/hygienelevel3/cat_helpful.png"
import characterCatProud from "../../assets/hygienelevel3/cat_proud.png"
import characterCatWorried from "../../assets/hygienelevel3/cat_worried.png"

// Audio files
import backgroundMusic from '../../assets/background-music.mp3';
import correctSound from "../../assets/hygienelevel1/correct-sound.mp3"
import incorrectSound from "../../assets/hygienelevel1/incorrect-sound.mp3"
import successSound from "../../assets/hygienelevel1/success-sound.mp3"

// Character Introduction Component
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
        border: '3px solid #1982C4',
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
          Hello! I'm Purrnando! 🐱
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
          I'm here to help you learn how to brush your teeth properly! We'll use special tools 
          to make your teeth sparkly clean. Ready to learn with me?
        </Typography>
        
        <Button
          variant="contained"
          onClick={onComplete}
          sx={{
            background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
            color: 'white',
            px: 4,
            py: 1,
            borderRadius: '20px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            fontSize: '1.1rem',
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(25, 130, 196, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1E90FF 0%, #1982C4 100%)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          YES, LET'S BRUSH! 🐾
        </Button>
      </Box>
    </Paper>
  </Box>
);

// Individual Tool Introduction Components
const ToothpasteIntroduction = ({ onNext }) => (
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
      mb: 8,
      position: 'relative'
    }}>
      <Box
        component="img"
        src={toothpasteImg}
        alt="Toothpaste"
        sx={{
          width: 300,
          height: 300,
          filter: 'drop-shadow(0 15px 30px rgba(255, 255, 255, 0.4))',
          animation: 'glowPulse 2s ease-in-out infinite',
          '@keyframes glowPulse': {
            '0%': { 
              transform: 'scale(1)',
              filter: 'drop-shadow(0 15px 30px rgba(255, 255, 255, 0.4))'
            },
            '50%': { 
              transform: 'scale(1.1)',
              filter: 'drop-shadow(0 20px 40px rgba(255, 255, 255, 0.6)) brightness(1.2)'
            },
            '100%': { 
              transform: 'scale(1)',
              filter: 'drop-shadow(0 15px 30px rgba(255, 255, 255, 0.4))'
            }
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
        border: '3px solid #1982C4',
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
          Toothpaste 🦷
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: '#333',
            mb: 2,
            fontSize: '1.1rem',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4
          }}
        >
          This is <strong>toothpaste</strong>! It helps clean your teeth and makes them shiny. 
          Toothpaste has special ingredients that fight germs and keep your mouth healthy.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onNext}
            sx={{
              borderColor: '#1982C4',
              color: '#1982C4',
              px: 3,
              py: 1,
              borderRadius: '15px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#1568A0',
                backgroundColor: 'rgba(25, 130, 196, 0.1)'
              }
            }}
          >
            Next Tool
          </Button>
        </Box>
      </Box>
    </Paper>
  </Box>
);

const ToothbrushIntroduction = ({ onNext, onPrevious }) => (
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
      mb: 8,
      position: 'relative'
    }}>
      <Box
        component="img"
        src={toothbrushImg}
        alt="Toothbrush"
        sx={{
          width: 300,
          height: 300,
          filter: 'drop-shadow(0 15px 30px rgba(144, 190, 109, 0.4))',
          animation: 'glowPulseGreen 2s ease-in-out infinite',
          '@keyframes glowPulseGreen': {
            '0%': { 
              transform: 'scale(1)',
              filter: 'drop-shadow(0 15px 30px rgba(144, 190, 109, 0.4))'
            },
            '50%': { 
              transform: 'scale(1.1)',
              filter: 'drop-shadow(0 20px 40px rgba(144, 190, 109, 0.6)) brightness(1.2)'
            },
            '100%': { 
              transform: 'scale(1)',
              filter: 'drop-shadow(0 15px 30px rgba(144, 190, 109, 0.4))'
            }
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
          Toothbrush 🪥
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: '#333',
            mb: 2,
            fontSize: '1.1rem',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4
          }}
        >
          This is your <strong>toothbrush</strong>! It has soft bristles that gently scrub away 
          food and germs from your teeth. We use it to reach all the tricky spots in your mouth.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onPrevious}
            sx={{
              borderColor: '#6B7280',
              color: '#6B7280',
              px: 3,
              py: 1,
              borderRadius: '15px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#4B5563',
                backgroundColor: 'rgba(107, 114, 128, 0.1)'
              }
            }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={onNext}
            sx={{
              background: 'linear-gradient(135deg, #90BE6D 0%, #7DA85A 100%)',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: '15px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(144, 190, 109, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A3D075 0%, #90BE6D 100%)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Next Tool
          </Button>
        </Box>
      </Box>
    </Paper>
  </Box>
);

const WaterCupIntroduction = ({ onComplete, onPrevious }) => (
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
      mb: 8,
      position: 'relative'
    }}>
      <Box
        component="img"
        src={waterCupImg}
        alt="Water Cup"
        sx={{
          width: 300,
          height: 300,
          filter: 'drop-shadow(0 15px 30px rgba(59, 130, 246, 0.4))',
          animation: 'glowPulseBlue 2s ease-in-out infinite',
          '@keyframes glowPulseBlue': {
            '0%': { 
              transform: 'scale(1)',
              filter: 'drop-shadow(0 15px 30px rgba(59, 130, 246, 0.4))'
            },
            '50%': { 
              transform: 'scale(1.1)',
              filter: 'drop-shadow(0 20px 40px rgba(59, 130, 246, 0.6)) brightness(1.2)'
            },
            '100%': { 
              transform: 'scale(1)',
              filter: 'drop-shadow(0 15px 30px rgba(59, 130, 246, 0.4))'
            }
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
        border: '3px solid #3B82F6',
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
          Water Cup 💧
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: '#333',
            mb: 2,
            fontSize: '1.1rem',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4
          }}
        >
          This is a <strong>water cup</strong>! After brushing, we use water to rinse away 
          all the toothpaste and leftover dirt. This leaves your mouth feeling fresh and clean!
        </Typography>
        
        <Typography
          variant="body1"
          sx={{
            color: '#280B60',
            mb: 3,
            fontSize: '1rem',
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4,
            fontWeight: '600',
            fontStyle: 'italic'
          }}
        >
          Remember the steps: 1. Apply toothpaste → 2. Brush teeth → 3. Rinse with water!
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onPrevious}
            sx={{
              borderColor: '#6B7280',
              color: '#6B7280',
              px: 3,
              py: 1,
              borderRadius: '15px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              fontSize: '1rem',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#4B5563',
                backgroundColor: 'rgba(107, 114, 128, 0.1)'
              }
            }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={onComplete}
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: 'white',
              px: 4,
              py: 1,
              borderRadius: '15px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1rem',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            START BRUSHING!
          </Button>
        </Box>
      </Box>
    </Paper>
  </Box>
);

// Character Cat Component
const CharacterCat = ({ gameState, message }) => {
  const getCatImage = () => {
    switch (gameState) {
      case 'step1':
        return characterCatCurious;
      case 'step2':
        return characterCatHelpful;
      case 'step3':
        return characterCatHelpful;
      case 'complete':
        return characterCatProud;
      default:
        return characterCatDefault;
    }
  };

  const getCatAnimation = () => {
    switch (gameState) {
      case 'step1':
        return 'bounce 2s ease-in-out infinite';
      case 'step2':
        return 'float 3s ease-in-out infinite';
      case 'step3':
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

export default function PersonalHygieneLevel2() {
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

  // New states for character and tool introductions
  const [showCharacterIntroduction, setShowCharacterIntroduction] = useState(false);
  const [currentToolIntroduction, setCurrentToolIntroduction] = useState(null);

  // Game states for brushing sequence
  const [gameStep, setGameStep] = useState(1); // Start directly at step 1: apply paste, 2: brush, 3: rinse
  const [toothpasteApplied, setToothpasteApplied] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [toothbrushPosition, setToothbrushPosition] = useState({ x: 0, y: 0 });
  const [waterCupVisible, setWaterCupVisible] = useState(false);
  
  // Scratch card effect states
  const [scratchMarks, setScratchMarks] = useState([]);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const teethContainerRef = useRef(null);
  const [teethCoverage, setTeethCoverage] = useState(new Set()); // Track grid cells that have been brushed
  
  // New animation states
  const [pasteSliding, setPasteSliding] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [showSparkleEffect, setShowSparkleEffect] = useState(false);
  
  // Blob states for dirt spots on teeth
  const [blobs, setBlobs] = useState([]);
  const [blobsRemoved, setBlobsRemoved] = useState(0); // Track how many blobs have been removed

  const handleStartGame = () => {
    setShowStartScreen(false);
    setShowCharacterIntroduction(true);
  };

  const handleCharacterIntroductionComplete = () => {
    setShowCharacterIntroduction(false);
    setCurrentToolIntroduction('toothpaste');
  };

  const handleToothpasteIntroductionNext = () => {
    setCurrentToolIntroduction('toothbrush');
  };

  const handleToothbrushIntroductionNext = () => {
    setCurrentToolIntroduction('water');
  };

  const handleToothbrushIntroductionPrevious = () => {
    setCurrentToolIntroduction('toothpaste');
  };

  const handleWaterIntroductionPrevious = () => {
    setCurrentToolIntroduction('toothbrush');
  };

  const handleToolIntroductionComplete = () => {
    setCurrentToolIntroduction(null);
    // Start directly at step 1 and initialize blobs
    setGameStep(1);
    initializeBlobs();
  };

  // Initialize blobs on teeth - FIXED with unique IDs
  const initializeBlobs = () => {
    const blobArray = [
      {
        id: 'blob1_1', // Unique ID
        x: 30,
        y: 30,
        image: blob1Img,
        size: 80,
        removed: false
      },
      {
        id: 'blob2_1', // Unique ID
        x: 60,
        y: 40,
        image: blob2Img,
        size: 60,
        removed: false
      },
      {
        id: 'blob1_2', // Unique ID
        x: 60,
        y: 78,
        image: blob1Img,
        size: 60,
        removed: false
      },
      {
        id: 'blob2_2', // Unique ID
        x: 20,
        y: 75,
        image: blob2Img,
        size: 90,
        removed: false
      },
      {
        id: 'blob1_3', // Unique ID
        x: 80,
        y: 30,
        image: blob1Img,
        size: 50,
        removed: false
      },
    ];
    setBlobs(blobArray);
    setBlobsRemoved(0); // Reset counter
  };

  // Get character message based on game state
  const getCharacterMessage = () => {
    switch (gameStep) {
      case 1:
        return 'Drag the toothpaste to the toothbrush! 🦷';
      case 2:
        return `Brush all the teeth! ${Math.floor(score)}% clean!`;
      case 3:
        return 'Now rinse with water! 💧';
      default:
        return 'Let\'s brush those teeth!';
    }
  };

  // Get character game state
  const getCharacterGameState = () => {
    switch (gameStep) {
      case 1:
        return 'step1';
      case 2:
        return 'step2';
      case 3:
        return 'step3';
      default:
        return 'step1';
    }
  };

  // Game mechanics
  const handleToothpasteDrag = (e) => {
    if (gameStep !== 1) return;
    e.dataTransfer.setData('text/plain', 'toothpaste');
    setDraggedItem('toothpaste');
  };

  const handleToothbrushDrop = (e) => {
    e.preventDefault();
    if (gameStep === 1 && draggedItem === 'toothpaste') {
      // Start paste sliding animation
      setPasteSliding(true);
      
      // After sliding animation completes
      setTimeout(() => {
        setToothpasteApplied(true);
        setPasteSliding(false);
        setGameStep(2);
        setScore(20); // 20% for applying toothpaste
        
        // Create sparkle effect after paste is applied
        createSparkles();
      }, 800); // Match the sliding animation duration
    }
  };

  const handleToothbrushMouseDown = (e) => {
    if (gameStep !== 2 || !toothpasteApplied) return;
    setIsDragging(true);
    setDraggedItem('toothbrush');
    const rect = e.currentTarget.getBoundingClientRect();
    setToothbrushPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || draggedItem !== 'toothbrush') return;
    
    setToothbrushPosition({ x: e.clientX, y: e.clientY });
    
    // Check collision with teeth for scratch effect
    const teethContainer = teethContainerRef.current;
    if (teethContainer) {
      const containerRect = teethContainer.getBoundingClientRect();
      const relativeX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const relativeY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

      // Check if brushing over the teeth area (rough bounds)
      if (relativeX >= 10 && relativeX <= 90 && relativeY >= 15 && relativeY <= 85) {
        // Add scratch mark
        addScratchMark(relativeX, relativeY);
        
        // Check collision with blobs
        checkBlobCollision(relativeX, relativeY);
      }
    }
    
    // Check if enough teeth area has been cleaned to move to next step
    if (score >= 70 && gameStep === 2) { // Complete step 2 when score reaches 70
      setStep2Completed(true);
      setGameStep(3);
      setWaterCupVisible(true);
      // Automatically release the toothbrush
      setIsDragging(false);
      setDraggedItem(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleWaterCupDrag = (e) => {
    if (gameStep !== 3) return;
    e.dataTransfer.setData('text/plain', 'water');
    setDraggedItem('water');
  };

  const handleMouthDrop = (e) => {
    e.preventDefault();
    if (gameStep === 3 && draggedItem === 'water') {
      setScore(100);
      setGameCompleted(true);
      setShowSuccess(true);
      playSoundEffect('success');
    }
  };

  // Create sparkle effects
  const createSparkles = () => {
    const sparkleArray = [];
    for (let i = 0; i < 20; i++) {
      sparkleArray.push({
        id: i,
        x: Math.random() * 300 + 50, // Around toothbrush area
        y: Math.random() * 300 + 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5,
        color: ['#FFD700', '#FFF700', '#87CEEB', '#FFB6C1', '#90EE90'][Math.floor(Math.random() * 5)]
      });
    }
    setSparkles(sparkleArray);
    setShowSparkleEffect(true);
    
    // Hide sparkles after animation
    setTimeout(() => {
      setShowSparkleEffect(false);
      setSparkles([]);
    }, 2000);
  };

  // Check collision between toothbrush and blobs - IMPROVED
  const checkBlobCollision = (brushX, brushY) => {
    setBlobs(prevBlobs => {
      let blobsRemovedCount = 0;
      const updatedBlobs = prevBlobs.map(blob => {
        if (blob.removed) {
          blobsRemovedCount++;
          return blob;
        }
        
        // Calculate distance between brush and blob center
        const distance = Math.sqrt(
          Math.pow(brushX - blob.x, 2) + Math.pow(brushY - blob.y, 2)
        );
        
        // Increased collision threshold based on blob size for better detection
        const collisionThreshold = Math.max(20, blob.size / 4);
        
        // If brush is close enough to blob, remove it
        if (distance < collisionThreshold) {
          console.log(`Blob ${blob.id} removed! Distance: ${distance}, Threshold: ${collisionThreshold}`);
          // Sound effect removed from here
          return { ...blob, removed: true };
        }
        return blob;
      });
      
      // Count removed blobs
      const totalRemoved = updatedBlobs.filter(blob => blob.removed).length;
      if (totalRemoved > blobsRemoved) {
        setBlobsRemoved(totalRemoved);
      }
      
      return updatedBlobs;
    });
  };

  // Add scratch mark to the teeth and track coverage
  const addScratchMark = (x, y) => {
    const newMark = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      size: Math.random() * 40 + 30, // Random brush size
      timestamp: Date.now()
    };
    
    setScratchMarks(prev => [...prev, newMark]);
    
    // Track coverage using a grid system for more accurate teeth area detection
    // Define the approximate teeth area bounds (adjust based on your teeth image)
    const teethBounds = {
      minX: 15, maxX: 85,  // Horizontal bounds of teeth area
      minY: 20, maxY: 80   // Vertical bounds of teeth area  
    };
    
    // Only count scratches within the teeth area
    if (x >= teethBounds.minX && x <= teethBounds.maxX && 
        y >= teethBounds.minY && y <= teethBounds.maxY) {
      
      // Create grid cells to track coverage (divide teeth area into grid)
      const gridSize = 8; // Increased from 5% to 8% for easier completion
      const gridX = Math.floor((x - teethBounds.minX) / gridSize);
      const gridY = Math.floor((y - teethBounds.minY) / gridSize);
      const cellKey = `${gridX}-${gridY}`;
      
      setTeethCoverage(prev => {
        const newCoverage = new Set(prev);
        newCoverage.add(cellKey);
        
        // Calculate total possible grid cells in teeth area
        const totalCellsX = Math.ceil((teethBounds.maxX - teethBounds.minX) / gridSize);
        const totalCellsY = Math.ceil((teethBounds.maxY - teethBounds.minY) / gridSize);
        const totalCells = totalCellsX * totalCellsY;
        
        // Calculate coverage percentage including blob removal bonus
        const coveragePercent = (newCoverage.size / totalCells) * 60; // Base coverage: 60%
        const blobBonus = (blobsRemoved / 5) * 15; // Each blob gives 3% bonus (5 blobs = 15%)
        const totalScore = 20 + coveragePercent + blobBonus; // 20% from toothpaste + coverage + blob bonus
        
        setScratchedPercentage(coveragePercent + blobBonus);
        setScore(Math.min(100, totalScore)); // Cap at 100
        
        return newCoverage;
      });
    }
  };

  const getStudentId = () => {
    try {
      const studentId = localStorage.getItem('studentId');
      const userType = localStorage.getItem('userType');
      
      console.log('Retrieving student ID:', { studentId, userType });
      
      // Check if we have a valid student ID regardless of userType
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

  // Clean up old scratch marks to prevent memory issues - but only when not actively playing
  useEffect(() => {
    const cleanup = setInterval(() => {
      // Only clean up if we're not in the brushing step to prevent marks from disappearing during gameplay
      if (gameStep !== 2) {
        const now = Date.now();
        setScratchMarks(prev => prev.filter(mark => now - mark.timestamp < 60000)); // Keep marks for 60 seconds
      }
    }, 10000); // Check every 10 seconds instead of 5

    return () => clearInterval(cleanup);
  }, [gameStep]);

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
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          console.log('Loaded existing progress:', progressResponse);
        } else {
          console.log('No existing progress found - starting fresh');
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set lesson data directly
        setLesson({
          id: lessonId || 1,
          title: "Brushing Teeth",
          description: "Learn proper tooth brushing technique!",
          level: 1
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Something went wrong');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);

  const saveProgress = async () => {
    if (progressSaving || progressSaved) {
      console.log('Progress already saving or saved, skipping');
      return;
    }
  
    try {
      setProgressSaving(true);
      
      // Get student ID with relaxed checking
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
      
      // Show user-friendly error message
      if (error.message.includes('No student ID available')) {
        alert('Please log in to save your progress.');
      } else {
        alert('Failed to save progress. Please try again.');
      }
    } finally {
      setProgressSaving(false);
    }
  };

  const resetGame = () => {
    setShowFeedback(false);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    
    // Reset game states
    setGameStep(1); // Start directly at step 1
    setToothpasteApplied(false);
    setStep2Completed(false);
    setIsDragging(false);
    setDraggedItem(null);
    setToothbrushPosition({ x: 0, y: 0 });
    setWaterCupVisible(false);
    setPasteSliding(false);
    setSparkles([]);
    setShowSparkleEffect(false);
    
    // Reset scratch card effect
    setScratchMarks([]);
    setScratchedPercentage(0);
    setTeethCoverage(new Set());
    
    // Reset and reinitialize blobs for step 1
    setBlobs([]);
    setBlobsRemoved(0);
    initializeBlobs(); // Reinitialize blobs
    
    // Reset introductions
    setShowCharacterIntroduction(false);
    setCurrentToolIntroduction(null);
    
    if (audioRef && !audioPlaying) {
      audioRef.play().then(() => {
        setAudioPlaying(true);
      }).catch(error => {
        console.log('Audio play failed:', error);
      });
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

  const handleGoHome = () => {
    if (audioRef) {
      audioRef.pause();
      setAudioPlaying(false);
    }
    navigate(-1);
  };

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

  // Start screen
  if (showStartScreen) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bathroomBg})`,
        backgroundSize: "120% auto",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden"
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
            Brush Your Teeth
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
            Learn how to brush your teeth properly to keep them clean and healthy!
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
              Start Brushing!
            </Button>
          </Stack>
        </Box>
      </div>
    );
  }

  // Character Introduction
  if (showCharacterIntroduction) {
    return <CharacterIntroductionPopup onComplete={handleCharacterIntroductionComplete} />;
  }

  // Tool Introductions - One by One
  if (currentToolIntroduction === 'toothpaste') {
    return <ToothpasteIntroduction onNext={handleToothpasteIntroductionNext} />;
  }

  if (currentToolIntroduction === 'toothbrush') {
    return (
      <ToothbrushIntroduction 
        onNext={handleToothbrushIntroductionNext} 
        onPrevious={handleToothbrushIntroductionPrevious} 
      />
    );
  }

  if (currentToolIntroduction === 'water') {
    return (
      <WaterCupIntroduction 
        onComplete={handleToolIntroductionComplete} 
        onPrevious={handleWaterIntroductionPrevious} 
      />
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bathroomBg})`,
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
        backgroundImage: `url(${bathroomBg})`,
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
              fontFamily: 'Poppins, sans-serif'
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
                fontFamily: 'Poppins, sans-serif',
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
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${bathroomBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    >
      
      <Container maxWidth="xl" sx={{ py: 1 }}>
        {/* Progress bar and instructions - positioned with higher z-index */}
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
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              Step {gameStep}/3: {gameStep === 1 ? 'Apply Toothpaste' : gameStep === 2 ? 'Brush Teeth' : 'Rinse'}
            </Typography>
         
          </Stack>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={score} 
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

        {/* Character Cat */}
        {!showCharacterIntroduction && !currentToolIntroduction && (
          <CharacterCat 
            gameState={getCharacterGameState()}
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
          zIndex: 1000
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
                ? 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)'
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


        {/* Sparkle effects */}
        {showSparkleEffect && sparkles.map(sparkle => (
          <Box
            key={sparkle.id}
            sx={{
              position: 'fixed',
              left: `${sparkle.x}px`,
              top: `${sparkle.y}px`,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              backgroundColor: sparkle.color,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 1002,
              animation: `sparkle 2s ease-out ${sparkle.delay}s`,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}`,
              '@keyframes sparkle': {
                '0%': {
                  opacity: 0,
                  transform: 'translate(-50%, -50%) scale(0) rotate(0deg)',
                },
                '50%': {
                  opacity: 1,
                  transform: 'translate(-50%, -50%) scale(1.5) rotate(180deg)',
                },
                '100%': {
                  opacity: 0,
                  transform: 'translate(-50%, -50%) scale(0) rotate(360deg)',
                }
              }
            }}
          />
        ))}

        {/* Sliding toothpaste animation */}
        {pasteSliding && (
          <Box
            sx={{
              position: 'fixed',
              left: '85%',
              top: '30%',
              transform: 'translateY(-50%)',
              zIndex: 1003,
              animation: 'slideToothpaste 0.8s ease-in-out',
              '@keyframes slideToothpaste': {
                '0%': {
                  left: '85%',
                  opacity: 1,
                  transform: 'translateY(-50%) scale(1)'
                },
                '50%': {
                  left: '50%',
                  opacity: 0.8,
                  transform: 'translateY(-50%) scale(0.8)'
                },
                '100%': {
                  left: '15%',
                  opacity: 0,
                  transform: 'translateY(-50%) scale(0.5)'
                }
              }
            }}
          >
            <img 
              src={toothpasteImg} 
              alt="Sliding toothpaste" 
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'contain',
                filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(255,255,255,0.5))'
              }}
            />
          </Box>
        )}

        {/* Dragging toothbrush */}
        {isDragging && draggedItem === 'toothbrush' && (
          <Box
            sx={{
              position: 'fixed',
              left: toothbrushPosition.x,
              top: toothbrushPosition.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              pointerEvents: 'none'
            }}
          >
            <img 
              src={toothbrushWithPasteImg} 
              alt="Toothbrush with paste" 
              style={{
                width: '300px',
                height: '300px',
                objectFit: 'contain',
                filter: 'brightness(1.1)'
              }}
            />
          </Box>
        )}

        {!gameCompleted && (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 'calc(100vh - 200px)',
              width: '100%',
              pt: 1,
              mb: 0,
              pb: 0
            }}
          >
            {/* Game Area with Teeth, Toothbrush, and Toothpaste */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                mt: 2,
                position: 'relative',
                width: '100%'
              }}
            >
              {/* Toothbrush on the left */}
              {!isDragging && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '5%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 3,
                    transition: 'all 0.3s ease'
                  }}
                  onDrop={handleToothbrushDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onMouseDown={handleToothbrushMouseDown}
                >
                  <img 
                    src={toothpasteApplied ? toothbrushWithPasteImg : toothbrushImg} 
                    alt="Toothbrush" 
                    style={{
                      width: '300px',
                      height: '300px',
                      objectFit: 'contain',
                      filter: toothpasteApplied ? 'brightness(1.2) drop-shadow(0 0 15px rgba(144, 190, 109, 0.6))' : 'brightness(1.1)',
                      cursor: gameStep === 2 ? 'grab' : 'default',
                      transition: 'filter 0.3s ease'
                    }}
                  />
                </Box>
              )}

              {/* Central teeth container with scratch card effect - FIXED */}
              <Box
                ref={teethContainerRef}
                data-teeth-container
                sx={{
                  width: '650px',
                  height: '600px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  position: 'relative',
                  overflow: 'hidden' // Changed to hidden to prevent blue artifacts
                }}
                onDrop={gameStep === 3 ? handleMouthDrop : undefined}
                onDragOver={(e) => e.preventDefault()}
              >
                
                {/* Clean teeth image - background layer */}
                <img 
                  src={afterTeethImg} 
                  alt="Clean Teeth" 
                  style={{
                    width: '650px',
                    height: '600px',
                    objectFit: 'contain',
                    position: 'absolute',
                    zIndex: 1
                  }}
                />

                {/* Dirty teeth image with scratch effect - only show in step 2 before completion */}
                {gameStep >= 2 && !step2Completed && (
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '650px',
                      height: '600px',
                      zIndex: 2,
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src={teethImg} 
                      alt="Dirty Teeth" 
                      style={{
                        width: '650px',
                        height: '600px',
                        objectFit: 'contain',
                        position: 'absolute',
                        // Simple approach - use opacity based on scratch coverage
                        opacity: Math.max(0.1, 1 - (scratchMarks.length / 50))
                      }}
                    />
                  </Box>
                )}

                {/* Show clean teeth when step 2 is completed or game is completed */}
                {(step2Completed || gameCompleted) && (
                  <img 
                    src={afterTeethImg} 
                    alt="Clean Teeth" 
                    style={{
                      width: '650px',
                      height: '600px',
                      objectFit: 'contain',
                      filter: 'brightness(1.1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
                      transition: 'filter 0.5s ease',
                      position: 'relative',
                      zIndex: 3
                    }}
                  />
                )}

                {/* Show dirty teeth for step 1 */}
                {gameStep === 1 && (
                  <img 
                    src={teethImg} 
                    alt="Dirty Teeth" 
                    style={{
                      width: '650px',
                      height: '600px',
                      objectFit: 'contain',
                      position: 'relative',
                      zIndex: 3
                    }}
                  />
                )}

                {/* Blobs overlay - dirt spots to clean - show in step 1 and 2 until step 2 is completed */}
                {gameStep >= 1 && !step2Completed && blobs.map(blob => !blob.removed && (
                  <img
                    key={blob.id}
                    src={blob.image}
                    alt={`Dirt blob ${blob.id}`}
                    style={{
                      position: 'absolute',
                      left: `${blob.x}%`,
                      top: `${blob.y}%`,
                      width: `${blob.size}px`,
                      height: `${blob.size}px`,
                      objectFit: 'contain',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 4,
                      pointerEvents: 'none',
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                ))}
              </Box>
              
              {/* Toothpaste on the right - only show in step 1 and when not sliding */}
              {gameStep === 1 && !pasteSliding && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: '5%',
                    top: '30%',
                    transform: 'translateY(-50%)',
                    zIndex: 3
                  }}
                >
                  <img 
                    src={toothpasteImg} 
                    alt="Toothpaste" 
                    style={{
                      width: '300px',
                      height: '300px',
                      objectFit: 'contain',
                      filter: 'brightness(1.1)',
                      cursor: 'grab'
                    }}
                    draggable
                    onDragStart={handleToothpasteDrag}
                  />
                </Box>
              )}

              {/* Water cup - only show in step 3 */}
              {waterCupVisible && gameStep === 3 && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: '5%',
                    top: '30%',
                    transform: 'translateY(-50%)',
                    zIndex: 3
                  }}
                >
                  <img 
                    src={waterCupImg} 
                    alt="Water Cup" 
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'contain',
                      filter: 'brightness(1.1)',
                      cursor: 'grab'
                    }}
                    draggable
                    onDragStart={handleWaterCupDrag}
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
        
        {/* Success Dialog */}
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
              fontFamily: 'Poppins, sans-serif',
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
              mb: 2
            }}>
              Sparkling Clean Teeth!
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
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Perfect brushing technique! Your teeth are now sparkling clean and healthy!
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
                <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', display: 'inline' }}>
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
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', display: 'inline' }}>
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
                Brush Again
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
                  fontFamily: 'Poppins, sans-serif',
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
                navigate(`/lesson/hygiene/level-3/${moduleId || 1}/${parseInt(lessonId) + 1 || 2}`);
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
                Next Level
                </Button>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
}