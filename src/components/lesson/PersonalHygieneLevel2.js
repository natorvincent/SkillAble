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
  IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Loader from '../Loader';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

import Bg from "../../assets/hygienelevel2/lvl2bg.png"
import bathroomBg from "../../assets/hygienelevel2/bathroom.png"
import teethImg from "../../assets/hygienelevel2/before_teeth.png"
import afterTeethImg from "../../assets/hygienelevel2/after_teeth.png"
import blob1Img from "../../assets/hygienelevel2/blob1.png"
import blob2Img from "../../assets/hygienelevel2/blob2.png"
import toothbrushImg from "../../assets/hygienelevel2/toothbrush.png"
import toothpasteImg from "../../assets/hygienelevel2/toothpaste.png"
import toothbrushWithPasteImg from "../../assets/hygienelevel2/with_paste.png"
import waterCupImg from "../../assets/hygienelevel2/water.png"
import containerImg from "../../assets/hygienelevel2/cup.png"

import characterCatDefault from "../../assets/hygienelevel3/cat.png"
import characterCatExcited from "../../assets/hygienelevel3/cat_excited.png"
import characterCatCurious from "../../assets/hygienelevel3/cat_curious.png"
import characterCatHelpful from "../../assets/hygienelevel3/cat_helpful.png"
import characterCatProud from "../../assets/hygienelevel3/cat_proud.png"
import characterCatWorried from "../../assets/hygienelevel3/cat_worried.png"

import backgroundMusic from '../../assets/background-music.mp3';
import correctSound from "../../assets/hygieneLevel1/correct-sound.mp3"
import incorrectSound from "../../assets/hygieneLevel1/incorrect-sound.mp3"
import successSound from "../../assets/hygieneLevel1/success-sound.mp3"
import purrnandolvl2 from "../../assets/hygienelevel2/purrnandolvl2.mp3"
import toothbrushAudio from "../../assets/hygienelevel2/toothbrush.mp3"
import toothpasteAudio from "../../assets/hygienelevel2/toothpaste.mp3"
import step1Audio from "../../assets/hygienelevel2/step1.mp3"
import step2Audio from "../../assets/hygienelevel2/step2.mp3"
import step3Audio from "../../assets/hygienelevel2/step3.mp3"

const CharacterIntroductionPopup = ({ onComplete, onReplayAudio }) => (
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
      <IconButton
        onClick={onReplayAudio}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          backgroundColor: 'rgba(25, 130, 196, 0.9)',
          color: 'white',
          width: 50,
          height: 50,
          zIndex: 2001,
          '&:hover': {
            backgroundColor: 'rgba(25, 130, 196, 1)',
            transform: 'scale(1.1)'
          }
        }}
        title="Replay Purrnando's Introduction"
      >
        <VolumeUpIcon sx={{ fontSize: 25 }} />
      </IconButton>
      
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
        bottom: 80,
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
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        textAlign: 'center'
      }}
    >
      <Box sx={{ textAlign: 'center', width: '100%' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            color: '#280B60',
            mb: 1,
            fontFamily: 'Poppins, sans-serif'
          }}
        >
          Hi! It's me again, Purrnando!
        </Typography>
        
        <Typography
          variant="h6"
          sx={{
            color: '#333',
            mb: 3,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4
          }}
        >
          I'm here to help you learn how to brush your teeth properly! First, let's find the tools we need. Ready to start?
        </Typography>
      </Box>
      
      <Button
        variant="contained"
        onClick={onComplete}
        sx={{
          background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
          color: 'white',
          px: 6,
          py: 3,
          borderRadius: '20px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '700',
          fontSize: '1.1rem',
          textTransform: 'none',
          boxShadow: '0 4px 20px rgba(25, 130, 196, 0.7)',
          animation: 'breathe 2s infinite ease-in-out',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          minWidth: '250px',
          
          '&:hover': {
            background: 'linear-gradient(135deg, #1E90FF 0%, #1982C4 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(25, 130, 196, 0.9)',
            animation: 'none',
          },
          
          '@keyframes breathe': {
            '0%, 100%': {
              background: 'linear-gradient(135deg, #4AA8E8 0%, #1982C4 100%)',
            },
            '50%': {
              background: 'linear-gradient(135deg, #0A568C 0%, #0A3D62 100%)',
            }
          }
        }}
      >
        YES, LET'S FIND THE TOOLS! 🐾
      </Button>
    </Paper>
  </Box>
);

const SimpleToolIntroduction = ({ toolName, onContinue, onReplayToolAudio }) => {
  const toolInfo = {
    toothbrush: {
      title: "Toothbrush",
      description: "This is your toothbrush! It has soft bristles that gently scrub away food and germs from your teeth. We use it to reach all the tricky spots in your mouth.",
      color: '#90BE6D',
      image: toothbrushImg,
      audioName: 'toothbrush'
    },
    toothpaste: {
      title: "Toothpaste",
      description: "This is toothpaste! It helps clean your teeth and makes them shiny. Toothpaste has special ingredients that fight germs and keep your mouth healthy.",
      color: '#1982C4',
      image: toothpasteImg,
      audioName: 'toothpaste'
    }
  };

  const tool = toolInfo[toolName];

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 2000,
        }}
      />
      
      <Paper
        sx={{
          position: 'fixed',
          top: '80%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: 3,
          maxWidth: '700px',
          width: '90%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          border: `3px solid ${tool.color}`,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          animation: 'popIn 0.5s ease-out',
          zIndex: 2001,
          '@keyframes popIn': {
            '0%': { 
              transform: 'translate(-50%, -50%) scale(0.8)', 
              opacity: 0 
            },
            '100%': { 
              transform: 'translate(-50%, -50%) scale(1)', 
              opacity: 1 
            }
          }
        }}
      >
        <Box
          component="img"
          src={characterCatHelpful}
          alt="Cute Cat Helper"
          sx={{
            width: 150,
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
        
        <Box sx={{ 
          textAlign: 'left', 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mb: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: '#280B60',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.8rem'
              }}
            >
              {tool.title}
            </Typography>
            
            <IconButton
              onClick={() => onReplayToolAudio(tool.audioName)}
              sx={{
                backgroundColor: 'rgba(25, 130, 196, 0.9)',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: 'rgba(25, 130, 196, 1)',
                  transform: 'scale(1.1)'
                }
              }}
              title={`Replay ${tool.title} audio`}
            >
              <VolumeUpIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
          
          <Typography
            variant="body1"
            sx={{
              color: '#333',
              mb: 4,
              fontSize: '1.1rem',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              textAlign: 'left'
            }}
          >
            {tool.description}
          </Typography>
          
          <Button
            variant="contained"
            onClick={onContinue}
            sx={{
              background: `linear-gradient(135deg, ${tool.color} 0%, ${tool.color}80 100%)`,
              color: 'white',
              px: 5,
              py: 1.5,
              borderRadius: '15px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: `0 4px 15px ${tool.color}40`,
              alignSelf: 'flex-end',
              minWidth: '180px',
              '&:hover': {
                background: `linear-gradient(135deg, ${tool.color}80 0%, ${tool.color} 100%)`,
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${tool.color}60`
              }
            }}
          >
            Continue
          </Button>
        </Box>
      </Paper>
    </>
  );
};

const CharacterCat = ({ gameState, message }) => {
  const getCatImage = () => {
    switch (gameState) {
      case 'findTools':
        return characterCatCurious;
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
      case 'findTools':
        return 'bounce 2s ease-in-out infinite';
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
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [purrnandoAudioRef, setPurrnandoAudioRef] = useState(null);
  const [toothbrushAudioRef, setToothbrushAudioRef] = useState(null);
  const [toothpasteAudioRef, setToothpasteAudioRef] = useState(null);
  const [step1AudioRef, setStep1AudioRef] = useState(null);
  const [step2AudioRef, setStep2AudioRef] = useState(null);
  const [step3AudioRef, setStep3AudioRef] = useState(null);

  const [showCharacterIntroduction, setShowCharacterIntroduction] = useState(true);
  const [showToolIntroduction, setShowToolIntroduction] = useState(false);
  const [currentToolName, setCurrentToolName] = useState(null);

  const [gamePhase, setGamePhase] = useState('findTools');
  const [toolsFound, setToolsFound] = useState({
    toothbrush: false,
    toothpaste: false
  });
  const [highlightedTool, setHighlightedTool] = useState(null);
  const [centerTool, setCenterTool] = useState(null);
  
  const [gameStep, setGameStep] = useState(1);
  const [toothpasteApplied, setToothpasteApplied] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [toothbrushPosition, setToothbrushPosition] = useState({ x: 0, y: 0 });
  const [waterCupVisible, setWaterCupVisible] = useState(false);
  
  const [scratchMarks, setScratchMarks] = useState([]);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const teethContainerRef = useRef(null);
  const [teethCoverage, setTeethCoverage] = useState(new Set());
  
  const [pasteSliding, setPasteSliding] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  const [showSparkleEffect, setShowSparkleEffect] = useState(false);
  const [dropFeedback, setDropFeedback] = useState(null);
  
  const [blobs, setBlobs] = useState([]);
  const [blobsRemoved, setBlobsRemoved] = useState(0);

  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isOverToothbrush, setIsOverToothbrush] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);

  // Audio play functions
  const playPurrnandoAudio = () => {
    if (purrnandoAudioRef) {
      purrnandoAudioRef.currentTime = 0;
      purrnandoAudioRef.play().catch(error => {
        console.log('Purrnando audio play prevented:', error);
      });
    }
  };

  const playToolAudio = (toolName) => {
    if (toolName === 'toothbrush' && toothbrushAudioRef) {
      toothbrushAudioRef.currentTime = 0;
      toothbrushAudioRef.play().catch(error => {
        console.log('Toothbrush audio play prevented:', error);
      });
    } else if (toolName === 'toothpaste' && toothpasteAudioRef) {
      toothpasteAudioRef.currentTime = 0;
      toothpasteAudioRef.play().catch(error => {
        console.log('Toothpaste audio play prevented:', error);
      });
    }
  };

  const playStepAudio = (stepNumber) => {
  if (stepNumber === 1 && step1AudioRef) {
    step1AudioRef.currentTime = 0;
    step1AudioRef.play().catch(error => {
      console.log('Step 1 audio play prevented:', error);
    });
  } else if (stepNumber === 2 && step2AudioRef) {
    step2AudioRef.currentTime = 0;
    step2AudioRef.play().catch(error => {
      console.log('Step 2 audio play prevented:', error);
    });
  } else if (stepNumber === 3 && step3AudioRef) {
    step3AudioRef.currentTime = 0;
    step3AudioRef.play().catch(error => {
      console.log('Step 3 audio play prevented:', error);
    });
  }
};

  // Audio stop functions
  const stopPurrnandoAudio = () => {
    if (purrnandoAudioRef) {
      purrnandoAudioRef.pause();
      purrnandoAudioRef.currentTime = 0;
    }
  };

  const stopToolAudio = (toolName) => {
    if (toolName === 'toothbrush' && toothbrushAudioRef) {
      toothbrushAudioRef.pause();
      toothbrushAudioRef.currentTime = 0;
    } else if (toolName === 'toothpaste' && toothpasteAudioRef) {
      toothpasteAudioRef.pause();
      toothpasteAudioRef.currentTime = 0;
    }
  };

  const stopStepAudio = (stepNumber) => {
  if (stepNumber === 1 && step1AudioRef) {
    step1AudioRef.pause();
    step1AudioRef.currentTime = 0;
  } else if (stepNumber === 2 && step2AudioRef) {
    step2AudioRef.pause();
    step2AudioRef.currentTime = 0;
  } else if (stepNumber === 3 && step3AudioRef) {
    step3AudioRef.pause();
    step3AudioRef.currentTime = 0;
  }
};

  const stopAllStepAudio = () => {
  if (step1AudioRef) {
    step1AudioRef.pause();
    step1AudioRef.currentTime = 0;
  }
  if (step2AudioRef) {
    step2AudioRef.pause();
    step2AudioRef.currentTime = 0;
  }
  if (step3AudioRef) {
    step3AudioRef.pause();
    step3AudioRef.currentTime = 0;
  }
};

  const getCurrentBackground = () => {
    if (gamePhase === 'findTools' || (gamePhase === 'brushSequence' && gameStep === 1)) {
      return bathroomBg;
    } else {
      return Bg;
    }
  };

  useEffect(() => {
    // Create and play purrnando audio immediately
    const purrnandoAudio = new Audio(purrnandolvl2);
    purrnandoAudio.volume = 0.7;
    setPurrnandoAudioRef(purrnandoAudio);
    
    // Create tool audio objects
    const toothbrushAudioObj = new Audio(toothbrushAudio);
    toothbrushAudioObj.volume = 0.7;
    setToothbrushAudioRef(toothbrushAudioObj);
    
    const toothpasteAudioObj = new Audio(toothpasteAudio);
    toothpasteAudioObj.volume = 0.7;
    setToothpasteAudioRef(toothpasteAudioObj);
    
    // Create step audio objects
    const step1AudioObj = new Audio(step1Audio);
    step1AudioObj.volume = 0.7;
    setStep1AudioRef(step1AudioObj);
    
    const step2AudioObj = new Audio(step2Audio);
    step2AudioObj.volume = 0.7;
    setStep2AudioRef(step2AudioObj);

    // Add this with your other audio object creation
    const step3AudioObj = new Audio(step3Audio);
    step3AudioObj.volume = 0.7;
    setStep3AudioRef(step3AudioObj);
    
    // Play purrnando audio immediately when component mounts
    const playPurrnandoAudioOnMount = () => {
      purrnandoAudio.play().catch(error => {
        console.log('Purrnando audio autoplay prevented:', error);
        const playOnInteraction = () => {
          purrnandoAudio.play();
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
      });
    };

    const timer = setTimeout(playPurrnandoAudioOnMount, 1000);

    return () => {
      clearTimeout(timer);
      if (purrnandoAudio) {
        purrnandoAudio.pause();
        purrnandoAudio.currentTime = 0;
      }
      if (toothbrushAudioObj) {
        toothbrushAudioObj.pause();
        toothbrushAudioObj.currentTime = 0;
      }
      if (toothpasteAudioObj) {
        toothpasteAudioObj.pause();
        toothpasteAudioObj.currentTime = 0;
      }
      if (step1AudioObj) {
        step1AudioObj.pause();
        step1AudioObj.currentTime = 0;
      }
      if (step2AudioObj) {
        step2AudioObj.pause();
        step2AudioObj.currentTime = 0;
      }
    };
  }, []);

  // Play step audio when game step changes
  useEffect(() => {
  if (gamePhase === 'brushSequence' && gameStep === 3) {
    // Stop step 2 audio
    stopStepAudio(2);
    
    // Play step 3 audio after a short delay
    const timer = setTimeout(() => {
      playStepAudio(3);
    }, 500);
    
    return () => clearTimeout(timer);
  }
}, [gameStep, gamePhase]);

  useEffect(() => {
    if (showToolIntroduction && currentToolName) {
      const timer = setTimeout(() => {
        playToolAudio(currentToolName);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [showToolIntroduction, currentToolName]);

  useEffect(() => {
    return () => {
      if (purrnandoAudioRef) {
        purrnandoAudioRef.pause();
        purrnandoAudioRef.currentTime = 0;
      }
      if (toothbrushAudioRef) {
        toothbrushAudioRef.pause();
        toothbrushAudioRef.currentTime = 0;
      }
      if (toothpasteAudioRef) {
        toothpasteAudioRef.pause();
        toothpasteAudioRef.currentTime = 0;
      }
      if (step1AudioRef) {
        step1AudioRef.pause();
        step1AudioRef.currentTime = 0;
      }
      if (step2AudioRef) {
        step2AudioRef.pause();
        step2AudioRef.currentTime = 0;
      }
    };
  }, [purrnandoAudioRef, toothbrushAudioRef, toothpasteAudioRef, step1AudioRef, step2AudioRef]);

  const handleCharacterIntroductionComplete = () => {
    // Stop purrnando audio when introduction is complete
    stopPurrnandoAudio();
    setShowCharacterIntroduction(false);
    setGamePhase('findTools');
    setHighlightedTool('toothbrush');
  };

  const handleToolIntroductionContinue = () => {
    // Stop the current tool audio
    if (currentToolName) {
      stopToolAudio(currentToolName);
    }
    
    setShowToolIntroduction(false);
    setCurrentToolName(null);
    setCenterTool(null);
    
    setToolsFound(prev => ({ ...prev, [currentToolName]: true }));
    
    if (currentToolName === 'toothbrush') {
      setHighlightedTool('toothpaste');
    } else if (currentToolName === 'toothpaste') {
      setTimeout(() => {
        setGamePhase('brushSequence');
        setGameStep(1);
        initializeBlobs();
        setShowDropZone(true);
        // Play step 1 audio when transitioning to brush sequence
        setTimeout(() => {
          playStepAudio(1);
        }, 500);
      }, 500);
    }
  };

  const handleToolClick = (toolName) => {
    if (gamePhase !== 'findTools') return;
    if (toolName === highlightedTool) {
      playSoundEffect('correct');
      
      setToolsFound(prev => ({ ...prev, [toolName]: true }));
      
      setCenterTool({
        name: toolName,
        originalPosition: toolName === 'toothbrush' ? { left: '35%', top: '55%' } : 
                          toolName === 'toothpaste' ? { left: '67%', top: '55%' } : null,
        isAnimating: true
      });
      
      setCurrentToolName(toolName);
      
      setTimeout(() => {
        setCenterTool(prev => prev ? { ...prev, isAnimating: false } : null);
        setShowToolIntroduction(true);
      }, 1000);
    } else {
      playSoundEffect('incorrect');
    }
  };

  const initializeBlobs = () => {
    const blobArray = [
      {
        id: 'blob1_1',
        x: 30,
        y: 30,
        image: blob1Img,
        size: 80,
        removed: false
      },
      {
        id: 'blob2_1',
        x: 60,
        y: 40,
        image: blob2Img,
        size: 60,
        removed: false
      },
      {
        id: 'blob1_2',
        x: 60,
        y: 78,
        image: blob1Img,
        size: 60,
        removed: false
      },
      {
        id: 'blob2_2',
        x: 20,
        y: 75,
        image: blob2Img,
        size: 90,
        removed: false
      },
      {
        id: 'blob1_3',
        x: 80,
        y: 30,
        image: blob1Img,
        size: 50,
        removed: false
      },
    ];
    setBlobs(blobArray);
    setBlobsRemoved(0);
  };

  const getCharacterMessage = () => {
    if (gamePhase === 'findTools') {
      if (!toolsFound.toothbrush) {
        return 'Find the toothbrush first! Click on it! 🪥';
      } else if (!toolsFound.toothpaste) {
        return 'Great! Now find the toothpaste! 🦷';
      }
    } else {
      switch (gameStep) {
        case 1:
          return 'Drag the toothpaste to the toothbrush! 🦷 → 🪥';
        case 2:
          return `Brush all the teeth! ${Math.floor(score)}% clean!`;
        case 3:
          return 'Now rinse with water! 💧';
        default:
          return 'Let\'s brush those teeth!';
      }
    }
  };

  const getCharacterGameState = () => {
    if (gamePhase === 'findTools') {
      return 'findTools';
    } else {
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
    }
  };

  const handleToothpasteMouseDown = (e) => {
    if (gamePhase !== 'brushSequence' || gameStep !== 1 || toothpasteApplied) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDraggedItem('toothpaste');
    setDragPosition({ x: e.clientX, y: e.clientY });
    setShowDropZone(true);
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedItem === 'toothpaste') {
      setDragPosition({ x: e.clientX, y: e.clientY });
      
      const toothbrushElement = document.querySelector('[data-toothbrush-target]');
      if (toothbrushElement) {
        const rect = toothbrushElement.getBoundingClientRect();
        const isOver = e.clientX >= rect.left && 
                       e.clientX <= rect.right && 
                       e.clientY >= rect.top && 
                       e.clientY <= rect.bottom;
        setIsOverToothbrush(isOver);
      }
    } else if (isDragging && draggedItem === 'toothbrush') {
      setToothbrushPosition({ x: e.clientX, y: e.clientY });
      
      const teethContainer = teethContainerRef.current;
      if (teethContainer) {
        const containerRect = teethContainer.getBoundingClientRect();
        const relativeX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const relativeY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

        if (relativeX >= 10 && relativeX <= 90 && relativeY >= 15 && relativeY <= 85) {
          addScratchMark(relativeX, relativeY);
          checkBlobCollision(relativeX, relativeY);
        }
      }
      
      // Check if score reaches 60% and automatically complete to 100%
      if (score >= 60 && gameStep === 2 && !step2Completed) {
        setScore(100);
        setStep2Completed(true);
        setGameStep(3);
        setWaterCupVisible(true);
        setIsDragging(false);
        setDraggedItem(null);
        playSoundEffect('success');
      }
    }
  };

  const handleToothpasteDropComplete = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setIsOverToothbrush(false);
    setPasteSliding(true);
    setShowDropZone(false);
    
    playSoundEffect('correct');
    
    setTimeout(() => {
      setDropFeedback(null);
    }, 2000);
    
    setTimeout(() => {
      setToothpasteApplied(true);
      setPasteSliding(false);
      setGameStep(2);
      setScore(20);
      
      createSparkles();
      
      // Stop step 1 audio and play step 2 audio when transitioning to step 2
      stopStepAudio(1);
      setTimeout(() => {
        playStepAudio(2);
      }, 300);
      
    }, 800);
  };

  const handleMouseUp = () => {
    if (isDragging && draggedItem === 'toothpaste' && isOverToothbrush) {
      handleToothpasteDropComplete();
    } else if (isDragging && draggedItem === 'toothpaste') {
      setIsDragging(false);
      setDraggedItem(null);
      setIsOverToothbrush(false);
      setDropFeedback('Drop the toothpaste on the toothbrush! 🦷 → 🪥');
      setTimeout(() => {
        setDropFeedback(null);
      }, 1500);
      playSoundEffect('incorrect');
    } else {
      setIsDragging(false);
      setDraggedItem(null);
    }
  };

  const handleToothbrushMouseDown = (e) => {
    if (gamePhase !== 'brushSequence' || gameStep !== 2 || !toothpasteApplied) return;
    setIsDragging(true);
    setDraggedItem('toothbrush');
    setToothbrushPosition({ x: e.clientX, y: e.clientY });
  };

  const handleWaterCupDrag = (e) => {
    if (gamePhase !== 'brushSequence' || gameStep !== 3) return;
    e.dataTransfer.setData('text/plain', 'water');
    setDraggedItem('water');
  };

  const handleMouthDrop = (e) => {
    e.preventDefault();
    if (gamePhase === 'brushSequence' && gameStep === 3 && draggedItem === 'water') {
      // Stop step audio when completing the game
      stopAllStepAudio();
      setScore(100);
      setGameCompleted(true);
      setShowSuccess(true);
      playSoundEffect('success');
    }
  };

  const createSparkles = () => {
    const sparkleArray = [];
    for (let i = 0; i < 20; i++) {
      sparkleArray.push({
        id: i,
        x: Math.random() * 300 + 50,
        y: Math.random() * 300 + 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5,
        color: ['#FFD700', '#FFF700', '#87CEEB', '#FFB6C1', '#90EE90'][Math.floor(Math.random() * 5)]
      });
    }
    setSparkles(sparkleArray);
    setShowSparkleEffect(true);
    
    setTimeout(() => {
      setShowSparkleEffect(false);
      setSparkles([]);
    }, 2000);
  };

  const checkBlobCollision = (brushX, brushY) => {
    setBlobs(prevBlobs => {
      let blobsRemovedCount = 0;
      const updatedBlobs = prevBlobs.map(blob => {
        if (blob.removed) {
          blobsRemovedCount++;
          return blob;
        }
        
        const distance = Math.sqrt(
          Math.pow(brushX - blob.x, 2) + Math.pow(brushY - blob.y, 2)
        );
        
        const collisionThreshold = Math.max(20, blob.size / 4);
        
        if (distance < collisionThreshold) {
          playSoundEffect('correct');
          return { ...blob, removed: true };
        }
        return blob;
      });
      
      const totalRemoved = updatedBlobs.filter(blob => blob.removed).length;
      if (totalRemoved > blobsRemoved) {
        setBlobsRemoved(totalRemoved);
      }
      
      return updatedBlobs;
    });
  };

  const addScratchMark = (x, y) => {
    const newMark = {
      id: Date.now() + Math.random(),
      x: x,
      y: y,
      size: Math.random() * 40 + 30,
      timestamp: Date.now()
    };
    
    setScratchMarks(prev => [...prev, newMark]);
    
    const teethBounds = {
      minX: 15, maxX: 85,
      minY: 20, maxY: 80  
    };
    
    if (x >= teethBounds.minX && x <= teethBounds.maxX && 
        y >= teethBounds.minY && y <= teethBounds.maxY) {
      
      const gridSize = 8;
      const gridX = Math.floor((x - teethBounds.minX) / gridSize);
      const gridY = Math.floor((y - teethBounds.minY) / gridSize);
      const cellKey = `${gridX}-${gridY}`;
      
      setTeethCoverage(prev => {
        const newCoverage = new Set(prev);
        newCoverage.add(cellKey);
        
        const totalCellsX = Math.ceil((teethBounds.maxX - teethBounds.minX) / gridSize);
        const totalCellsY = Math.ceil((teethBounds.maxY - teethBounds.minY) / gridSize);
        const totalCells = totalCellsX * totalCellsY;
        
        const coveragePercent = (newCoverage.size / totalCells) * 60;
        const blobBonus = (blobsRemoved / 5) * 15;
        let totalScore = 20 + coveragePercent + blobBonus;
        
        // Cap the score at 60% if not already completed
        if (!step2Completed && totalScore >= 60) {
          totalScore = 60;
        }
        
        setScratchedPercentage(coveragePercent + blobBonus);
        setScore(Math.min(100, totalScore));
        
        return newCoverage;
      });
    }
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

  useEffect(() => {
    const cleanup = setInterval(() => {
      if (gamePhase === 'brushSequence' && gameStep !== 2) {
        const now = Date.now();
        setScratchMarks(prev => prev.filter(mark => now - mark.timestamp < 60000));
      }
    }, 10000);

    return () => clearInterval(cleanup);
  }, [gamePhase, gameStep]);

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

  const resetGame = () => {
    // Stop all audio when resetting game
    stopPurrnandoAudio();
    stopAllStepAudio();
    
    setShowFeedback(false);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    
    setGamePhase('findTools');
    setToolsFound({
      toothbrush: false,
      toothpaste: false
    });
    setHighlightedTool('toothbrush');
    setCenterTool(null);
    
    setGameStep(1);
    setToothpasteApplied(false);
    setStep2Completed(false);
    setIsDragging(false);
    setDraggedItem(null);
    setToothbrushPosition({ x: 0, y: 0 });
    setWaterCupVisible(false);
    setPasteSliding(false);
    setSparkles([]);
    setShowSparkleEffect(false);
    setDropFeedback(null);
    setShowDropZone(false);
    
    setScratchMarks([]);
    setScratchedPercentage(0);
    setTeethCoverage(new Set());
    
    setBlobs([]);
    setBlobsRemoved(0);
    
    setShowCharacterIntroduction(false);
    setShowToolIntroduction(false);
    setCurrentToolName(null);
    
    setDragPosition({ x: 0, y: 0 });
    setIsOverToothbrush(false);
    
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
    
    // Stop all step audio when continuing
    stopAllStepAudio();
    
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
    // Stop all audio when going home
    stopAllStepAudio();
    stopPurrnandoAudio();
    
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

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedItem, isOverToothbrush]);

  if (showCharacterIntroduction) {
    return <CharacterIntroductionPopup 
      onComplete={handleCharacterIntroductionComplete} 
      onReplayAudio={playPurrnandoAudio}
    />;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${getCurrentBackground()})`,
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
        backgroundImage: `url(${getCurrentBackground()})`,
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
    <div 
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${getCurrentBackground()})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        cursor: isDragging && draggedItem === 'toothpaste' ? 'grabbing' : 'default'
      }}
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
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              {gamePhase === 'findTools' ? 
                `Find Tools: ${Object.values(toolsFound).filter(Boolean).length}/2` : 
                `Step ${gameStep}/3: ${gameStep === 1 ? 'Apply Toothpaste' : gameStep === 2 ? 'Brush Teeth' : 'Rinse'}`
              }
            </Typography>
          </Stack>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={gamePhase === 'findTools' ? (Object.values(toolsFound).filter(Boolean).length / 2) * 100 : score} 
              sx={{ 
                height: 8, 
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '10px',
                  backgroundColor: gamePhase === 'findTools' ? '#FF595E' : '#90BE6D'
                }
              }} 
            />
          </Box>
        </Box>

        {!showCharacterIntroduction && !showToolIntroduction && (
          <CharacterCat 
            gameState={getCharacterGameState()}
            message={getCharacterMessage()}
          />
        )}

        {dropFeedback && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: isOverToothbrush 
                ? 'rgba(144, 190, 109, 0.9)' 
                : 'rgba(255, 89, 94, 0.9)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '20px',
              zIndex: 1004,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              animation: 'fadeInOut 2s ease-in-out',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '600',
              fontSize: '1.2rem',
              textAlign: 'center',
              '@keyframes fadeInOut': {
                '0%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
                '15%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.05)' },
                '85%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1.05)' },
                '100%': { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' }
              }
            }}
          >
            {dropFeedback}
          </Box>
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

        {isDragging && draggedItem === 'toothpaste' && (
          <Box
            sx={{
              position: 'fixed',
              left: dragPosition.x,
              top: dragPosition.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              pointerEvents: 'none',
              transition: 'none'
            }}
          >
            <img 
              src={toothpasteImg} 
              alt="Toothpaste being dragged" 
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain',
                filter: isOverToothbrush 
                  ? 'brightness(1.3) drop-shadow(0 0 20px rgba(25, 130, 196, 0.9))' 
                  : 'brightness(1.2) drop-shadow(0 0 10px rgba(25, 130, 196, 0.8))',
                transform: 'rotate(15deg)',
                cursor: 'grabbing'
              }}
            />
          </Box>
        )}

        {pasteSliding && (
          <Box
            sx={{
              position: 'fixed',
              right: '-5%',
              top: '30%',
              transform: 'translate(50%, -50%)',
              zIndex: 1003,
              animation: 'slideToothpasteToBrush 0.8s ease-in-out forwards',
              '@keyframes slideToothpasteToBrush': {
                '0%': {
                  right: '40%',
                  opacity: 1,
                  transform: 'translate(50%, -50%) scale(1) rotate(15deg)'
                },
                '50%': {
                  right: '50%',
                  opacity: 0.8,
                  transform: 'translate(50%, -50%) scale(0.9) rotate(0deg)'
                },
                '70%': {
                  right: '45%',
                  opacity: 0.5,
                  transform: 'translate(50%, -50%) scale(0.7) rotate(-10deg)'
                },
                '100%': {
                  right: '40%',
                  opacity: 0,
                  transform: 'translate(-130%, -50%) scale(0.5) rotate(-15deg)'
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
                filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(25, 130, 196, 0.9))'
              }}
            />
          </Box>
        )}

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
                width: '250px',
                height: '250px',
                objectFit: 'contain',
                filter: 'brightness(1.2) drop-shadow(0 0 10px rgba(144, 190, 109, 0.8))',
                transform: 'rotate(15deg)'
              }}
            />
          </Box>
        )}

        {showDropZone && gameStep === 1 && !toothpasteApplied && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-130%, -50%)',
              zIndex: 999,
              animation: 'dropZonePulse 1.5s ease-in-out infinite',
              '@keyframes dropZonePulse': {
                '0%': {
                  transform: 'translate(-130%, -50%) scale(1)',
                  opacity: 0.7
                },
                '50%': {
                  transform: 'translate(-130%, -50%) scale(1.1)',
                  opacity: 1,
                  filter: 'drop-shadow(0 0 25px rgba(144, 190, 109, 0.8))'
                },
                '100%': {
                  transform: 'translate(-130%, -50%) scale(1)',
                  opacity: 0.7
                }
              }
            }}
          >
          </Box>
        )}

        {centerTool && centerTool.isAnimating && (
          <Box
            sx={{
              position: 'fixed',
              top: centerTool.originalPosition.top,
              left: centerTool.originalPosition.left,
              transform: 'translate(-50%, -50%)',
              zIndex: 1003,
              animation: 'flyToCenter 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              '@keyframes flyToCenter': {
                '0%': {
                  top: centerTool.originalPosition.top,
                  left: centerTool.originalPosition.left,
                  transform: 'translate(-50%, -50%) scale(1)',
                  opacity: 1
                },
                '50%': {
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) scale(1.5)',
                  opacity: 0.8,
                  filter: 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.9))'
                },
                '100%': {
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) scale(2)',
                  opacity: 0,
                  filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 1.2)) brightness(1.5)'
                }
              }
            }}
          >
            <img 
              src={centerTool.name === 'toothbrush' ? toothbrushImg : toothpasteImg} 
              alt={centerTool.name}
              style={{
                width: '180px',
                height: '180px',
                objectFit: 'contain',
                transform: 'rotate(35deg)'
              }}
            />
          </Box>
        )}

        {centerTool && !centerTool.isAnimating && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: showToolIntroduction ? 1003 : 1004,
              animation: 'centerPulse 1s ease-in-out infinite',
              '@keyframes centerPulse': {
                '0%': {
                  transform: 'translate(-50%, -50%) scale(1.8)',
                  opacity: 0.9,
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))'
                },
                '50%': {
                  transform: 'translate(-50%, -50%) scale(2)',
                  opacity: 1,
                  filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 1)) brightness(1.3)'
                },
                '100%': {
                  transform: 'translate(-50%, -50%) scale(1.8)',
                  opacity: 0.9,
                  filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.8))'
                }
              }
            }}
          >
            <img 
              src={centerTool.name === 'toothbrush' ? toothbrushImg : toothpasteImg} 
              alt={centerTool.name}
              style={{
                width: '300px',
                height: '300px',
                objectFit: 'contain',
              }}
            />
          </Box>
        )}

        {showToolIntroduction && currentToolName && (
          <SimpleToolIntroduction 
            toolName={currentToolName} 
            onContinue={handleToolIntroductionContinue}
            onReplayToolAudio={playToolAudio}
          />
        )}

        {!gameCompleted && gamePhase === 'findTools' && !showToolIntroduction && (
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 200px)',
              width: '100%',
              pt: 1,
              position: 'relative'
            }}
          >
            {!toolsFound.toothbrush && (
              <Box
                onClick={() => handleToolClick('toothbrush')}
                sx={{
                  position: 'absolute',
                  left: '35%',
                  top: '55%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  cursor: 'pointer',
                  animation: highlightedTool === 'toothbrush' ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
                  '@keyframes pulseGlow': {
                    '0%': { 
                      transform: 'translateY(-50%) scale(1)',
                      filter: 'brightness(1) drop-shadow(0 0 10px rgba(144, 190, 109, 0.5))'
                    },
                    '50%': { 
                      transform: 'translateY(-50%) scale(1.1)',
                      filter: 'brightness(1.3) drop-shadow(0 0 20px rgba(144, 190, 109, 0.8))'
                    },
                    '100%': { 
                      transform: 'translateY(-50%) scale(1)',
                      filter: 'brightness(1) drop-shadow(0 0 10px rgba(144, 190, 109, 0.5))'
                    }
                  }
                }}
              >
                <img 
                  src={toothbrushImg} 
                  alt="Toothbrush" 
                  style={{
                    width: '180px',
                    height: '180px',
                    objectFit: 'contain',
                    transform: 'rotate(35deg)'
                  }}
                />
              </Box>
            )}

            {!toolsFound.toothpaste && (
              <Box
                onClick={() => handleToolClick('toothpaste')}
                sx={{
                  position: 'absolute',
                  left: '67%',
                  top: '55%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 3,
                  cursor: 'pointer',
                  animation: highlightedTool === 'toothpaste' ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
                  '@keyframes pulseGlow': {
                    '0%': { 
                      transform: 'translate(-50%, -50%) scale(1)',
                      filter: 'brightness(1) drop-shadow(0 0 10px rgba(25, 130, 196, 0.5))'
                    },
                    '50%': { 
                      transform: 'translate(-50%, -50%) scale(1.1)',
                      filter: 'brightness(1.3) drop-shadow(0 0 20px rgba(25, 130, 196, 0.8))'
                    },
                    '100%': { 
                      transform: 'translate(-50%, -50%) scale(1)',
                      filter: 'brightness(1) drop-shadow(0 0 10px rgba(25, 130, 196, 0.5))'
                    }
                  }
                }}
              >
                <img 
                  src={toothpasteImg} 
                  alt="Toothpaste" 
                  style={{
                    width: '180px',
                    height: '180px',
                    objectFit: 'contain',
                    transform: 'rotate(35deg)',
                  }}
                />
              </Box>
            )}
          </Box>
        )}

        {!gameCompleted && gamePhase === 'brushSequence' && (
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
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                mt: 2,
                position: 'relative',
                width: '100%',
                height: '600px'
              }}
            >

              {gameStep === 1 && (
                <>
                  {!pasteSliding && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-130%, -50%)',
                        zIndex: 3,
                        transition: 'all 0.3s ease',
                        animation: !toothpasteApplied ? 'pulseToothbrush 1.5s infinite' : 'none',
                        '@keyframes pulseToothbrush': {
                          '0%': { transform: 'translate(-130%, -50%) scale(1)' },
                          '50%': { transform: 'translate(-130%, -50%) scale(1.05)' },
                          '100%': { transform: 'translate(-130%, -50%) scale(1)' }
                        }
                      }}
                      data-toothbrush-target
                    >
                      <img 
                        src={toothpasteApplied ? toothbrushWithPasteImg : toothbrushImg} 
                        alt="Toothbrush" 
                        style={{
                          width: '250px',
                          height: '250px',
                          objectFit: 'contain',
                          filter: toothpasteApplied 
                            ? 'brightness(1.2) drop-shadow(0 0 15px rgba(144, 190, 109, 0.6))' 
                            : isOverToothbrush
                            ? 'brightness(1.3) drop-shadow(0 0 25px rgba(144, 190, 109, 0.9))'
                            : 'brightness(1.1) drop-shadow(0 0 8px rgba(144, 190, 109, 0.5))',
                          transition: 'filter 0.3s ease'
                        }}
                      />
                    </Box>
                  )}

                  {!pasteSliding && !toothpasteApplied && !isDragging && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: '30%',
                        top: '50%',
                        transform: 'translate(50%, -50%)',
                        zIndex: 3,
                        animation: 'pulseToothpaste 1.5s infinite',
                        '@keyframes pulseToothpaste': {
                          '0%': { transform: 'translate(50%, -50%) scale(1)' },
                          '50%': { transform: 'translate(50%, -50%) scale(1.05)' },
                          '100%': { transform: 'translate(50%, -50%) scale(1)' }
                        }
                      }}
                    >
                      <img 
                        src={toothpasteImg} 
                        alt="Toothpaste" 
                        style={{
                          width: '250px',
                          height: '250px',
                          objectFit: 'contain',
                          filter: 'brightness(1.1) drop-shadow(0 0 8px rgba(25, 130, 196, 0.5))',
                          cursor: 'grab',
                          transition: 'filter 0.3s ease'
                        }}
                        onMouseDown={handleToothpasteMouseDown}
                      />
                    </Box>
                  )}
                </>
              )}

              {gameStep >= 2 && (
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
                    overflow: 'hidden'
                  }}
                  onDrop={gameStep === 3 ? handleMouthDrop : undefined}
                  onDragOver={(e) => e.preventDefault()}
                >
                  
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
                          opacity: Math.max(0.1, 1 - (scratchMarks.length / 50))
                        }}
                      />
                    </Box>
                  )}

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

                  {gameStep === 2 && !step2Completed && (
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

                  {gameStep >= 2 && !step2Completed && blobs.map(blob => !blob.removed && (
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
              )}
              
              {/* Toothbrush with pulsing glowing hint in Step 2 */}
              {!isDragging && gameStep === 2 && toothpasteApplied && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: '10%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 3,
                    transition: 'all 0.3s ease',
                    animation: 'pulseGlowToothbrush 2s ease-in-out infinite',
                    '@keyframes pulseGlowToothbrush': {
                      '0%': {
                        filter: 'drop-shadow(0 0 15px rgba(144, 190, 109, 0.5)) brightness(1.2)',
                        transform: 'translateY(-50%) scale(1)'
                      },
                      '50%': {
                        filter: 'drop-shadow(0 0 25px rgba(144, 190, 109, 0.9)) brightness(1.3)',
                        transform: 'translateY(-50%) scale(1.05)'
                      },
                      '100%': {
                        filter: 'drop-shadow(0 0 15px rgba(144, 190, 109, 0.5)) brightness(1.2)',
                        transform: 'translateY(-50%) scale(1)'
                      }
                    }
                  }}
                  onMouseDown={handleToothbrushMouseDown}
                >
                  <img 
                    src={toothbrushWithPasteImg} 
                    alt="Toothbrush with paste" 
                    style={{
                      width: '250px',
                      height: '250px',
                      objectFit: 'contain',
                      cursor: 'grab',
                      transition: 'filter 0.3s ease'
                    }}
                  />
                </Box>
              )}

              {/* Water cup with pulsing glowing hint in Step 3 */}
              {waterCupVisible && gameStep === 3 && !isDragging && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: '10%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 3,
                    animation: 'pulseGlowWaterCup 2s ease-in-out infinite',
                    '@keyframes pulseGlowWaterCup': {
                      '0%': {
                        filter: 'drop-shadow(0 0 15px rgba(0, 150, 255, 0.5)) brightness(1.1)',
                        transform: 'translateY(-50%) scale(1)'
                      },
                      '50%': {
                        filter: 'drop-shadow(0 0 25px rgba(0, 150, 255, 0.8)) brightness(1.2)',
                        transform: 'translateY(-50%) scale(1.05)'
                      },
                      '100%': {
                        filter: 'drop-shadow(0 0 15px rgba(0, 150, 255, 0.5)) brightness(1.1)',
                        transform: 'translateY(-50%) scale(1)'
                      }
                    }
                  }}
                >
                  <img 
                    src={waterCupImg} 
                    alt="Water Cup" 
                    style={{
                      width: '250px',
                      height: '250px',
                      objectFit: 'contain',
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
                {progressSaving ? 'Saving...' : 'Back to Home'}
              </Button>
              
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
}