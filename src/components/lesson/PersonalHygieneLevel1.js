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
  Slider,
  Drawer,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import SettingsIcon from '@mui/icons-material/Settings';
import Loader from '../Loader';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

// Images
import pinkBg from "../../assets/hygienelevel3/pinkbg.png"
import bathroomBg from "../../assets/hygieneLevel1/bathroom.png"
import sinkImg from "../../assets/hygieneLevel1/sink.png"
import faucetImg from "../../assets/hygieneLevel1/onfaucet.png"
import leftHandImg from "../../assets/hygieneLevel1/lefthand.png"
import rightHandImg from "../../assets/hygieneLevel1/righthand.png"
import germsImg from "../../assets/hygieneLevel1/germ.png"
import mudImg from "../../assets/hygieneLevel1/mud.png"
import soapImg from "../../assets/hygieneLevel1/soap.png"
import bubbleImg from "../../assets/hygieneLevel1/bubble.png"
import wetHandsImg from "../../assets/hygieneLevel1/wash.gif"

import characterCatWorried from "../../assets/hygienelevel3/cat_worried.png"
import characterCatHelpful from "../../assets/hygienelevel3/cat_helpful.png"
import characterCatExcited from "../../assets/hygienelevel3/cat_excited.png"

// Video files
import scrubVideo from "../../assets/hygieneLevel1/scrub1.mp4"
import scrubVideo2 from "../../assets/hygieneLevel1/scrub2.mp4"
import scrubVideo3 from "../../assets/hygieneLevel1/scrub3.mp4"
import scrubVideo4 from "../../assets/hygieneLevel1/scrub4.mp4"
import scrubVideo5 from "../../assets/hygieneLevel1/scrub5.mp4"
import scrubVideo6 from "../../assets/hygieneLevel1/scrub6.mp4"
import scrubVideo7 from "../../assets/hygieneLevel1/scrub7.mp4"

// Audio files
import purrnandolvl1 from "../../assets/hygieneLevel1/purrnandolvl1.mp3"
import dirtyhandsSound from "../../assets/hygieneLevel1/dirtyhands.mp3";
import sinkSound from "../../assets/hygieneLevel1/sink.mp3";
import wethandsSound from "../../assets/hygieneLevel1/wethands.mp3"; // Added
import soapSound from "../../assets/hygieneLevel1/soap.mp3"; // Added
import rubscrubSound from "../../assets/hygieneLevel1/rubscrub.mp3"; // Added
import rinseSound from "../../assets/hygieneLevel1/rinse.mp3";
import scrub1Sound from "../../assets/hygieneLevel1/scrub1.mp3";
import scrub2Sound from "../../assets/hygieneLevel1/scrub2.mp3";
import scrub3Sound from "../../assets/hygieneLevel1/scrub3.mp3";
import scrub4Sound from "../../assets/hygieneLevel1/scrub4.mp3";
import scrub5Sound from "../../assets/hygieneLevel1/scrub5.mp3";
import scrub6Sound from "../../assets/hygieneLevel1/scrub6.mp3";
import scrub7Sound from "../../assets/hygieneLevel1/scrub7.mp3";
import completeSound from "../../assets/hygieneLevel1/complete.mp3"; // Add this import

// NEW AUDIO FILES - Added
import backgroundMusic from "../../assets/hygieneLevel1/background-music.mp3";
import correctSound from "../../assets/hygieneLevel1/correct-sound.mp3";
import incorrectSound from "../../assets/hygieneLevel1/incorrect-sound.mp3";
import successSound from "../../assets/hygieneLevel1/success-sound.mp3";

// Define keyframes outside of component to avoid recreation
const keyframes = {
  bounceAndTilt: {
    '0%': { transform: 'translateY(0px) rotate(0deg)' },
    '25%': { transform: 'translateY(-20px) rotate(5deg)' },
    '50%': { transform: 'translateY(0px) rotate(0deg)' },
    '75%': { transform: 'translateY(-10px) rotate(-5deg)' },
    '100%': { transform: 'translateY(0px) rotate(0deg)' }
  },
  pulse: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' }
  },
  wiggle: {
    '0%': { transform: 'translate(-50%, 0) rotate(0deg)' },
    '25%': { transform: 'translate(-50%, -5px) rotate(2deg)' },
    '50%': { transform: 'translate(-50%, 0) rotate(0deg)' },
    '75%': { transform: 'translate(-50%, 5px) rotate(-2deg)' },
    '100%': { transform: 'translate(-50%, 0) rotate(0deg)' }
  },
  float: {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-8px)' },
    '100%': { transform: 'translateY(0px)' }
  },
  tilt: {
    '0%': { transform: 'rotate(0deg)' },
    '25%': { transform: 'rotate(5deg)' },
    '50%': { transform: 'rotate(0deg)' },
    '75%': { transform: 'rotate(-5deg)' },
    '100%': { transform: 'rotate(0deg)' }
  },
  bounce: {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
    '100%': { transform: 'translateY(0px)' }
  },
  arrowPulse: {
    '0%': { transform: 'scaleX(0.8)', opacity: 0.7 },
    '50%': { transform: 'scaleX(1)', opacity: 1 },
    '100%': { transform: 'scaleX(0.8)', opacity: 0.7 }
  },
  pulseHighlight: {
    '0%': { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.2)' },
    '50%': { borderColor: '#FFA500', backgroundColor: 'rgba(255, 215, 0, 0.4)' },
    '100%': { borderColor: '#FFD700', backgroundColor: 'rgba(255, 215, 0, 0.2)' }
  },
  bounceSoap: {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
    '100%': { transform: 'translateY(0px)' }
  },
  pulseHands: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)' }
  },
  rotateSoap: {
    '0%': { transform: 'rotate(0deg)' },
    '25%': { transform: 'rotate(10deg)' },
    '50%': { transform: 'rotate(0deg)' },
    '75%': { transform: 'rotate(-10deg)' },
    '100%': { transform: 'rotate(0deg)' }
  },
  rubMotion: {
    '0%': { transform: 'translateX(-20px)', opacity: 0.7 },
    '50%': { transform: 'translateX(20px)', opacity: 1 },
    '100%': { transform: 'translateX(-20px)', opacity: 0.7 }
  },
  sparkle: {
    '0%': { filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3)) brightness(1.1)' },
    '50%': { filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.6)) brightness(1.2)' },
    '100%': { filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3)) brightness(1.1)' }
  },
  happyDance: {
    '0%': { transform: 'translateY(0px) rotate(0deg)' },
    '25%': { transform: 'translateY(-10px) rotate(5deg)' },
    '50%': { transform: 'translateY(0px) rotate(0deg)' },
    '75%': { transform: 'translateY(-5px) rotate(-5deg)' },
    '100%': { transform: 'translateY(0px) rotate(0deg)' }
  },
  fadeInOut: {
    '0%': { opacity: 0.7 },
    '50%': { opacity: 1 },
    '100%': { opacity: 0.7 }
  },
  soapAppear: {
    '0%': { transform: 'translate(-50%, 0) scale(0)', opacity: 0 },
    '70%': { transform: 'translate(-50%, 0) scale(1.1)', opacity: 1 },
    '100%': { transform: 'translate(-50%, 0) scale(1)', opacity: 1 }
  },
  starPop: {
    '0%': { transform: 'scale(0)', opacity: 0 },
    '50%': { transform: 'scale(1.5)', opacity: 1 },
    '100%': { transform: 'scale(1)', opacity: 1 }
  },
  bounceIn: {
    '0%': { transform: 'scale(0.8)', opacity: 0.8 },
    '50%': { transform: 'scale(1.1)' },
    '70%': { transform: 'scale(0.95)' },
    '100%': { transform: 'scale(1)', opacity: 1 }
  }
};

// Asset Loading Manager - Moved outside the main component
const AssetLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadedAssets, setLoadedAssets] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  
  useEffect(() => {
    // List of all assets to preload
    const imageAssets = [
      pinkBg, bathroomBg, sinkImg, faucetImg, leftHandImg, rightHandImg,
      germsImg, mudImg, soapImg, bubbleImg, wetHandsImg,
      characterCatWorried, characterCatHelpful, characterCatExcited,
      require("../../assets/hygienelevel3/resetbtn.png"),
      require("../../assets/hygienelevel3/homebtn.png")
    ];
    
    const videoAssets = [
      scrubVideo, scrubVideo2, scrubVideo3, scrubVideo4, scrubVideo5, scrubVideo6, scrubVideo7
    ];
    
    const audioAssets = [
      purrnandolvl1, dirtyhandsSound, sinkSound, wethandsSound, soapSound, rubscrubSound,
      rinseSound, scrub1Sound, scrub2Sound, scrub3Sound, scrub4Sound, scrub5Sound,
      scrub6Sound, scrub7Sound, completeSound,
      // NEW: Add the new audio files
      backgroundMusic, correctSound, incorrectSound, successSound
    ];
    
    const allAssets = [...imageAssets, ...videoAssets, ...audioAssets];
    setTotalAssets(allAssets.length);
    
    let completed = 0;
    
    const updateProgress = () => {
      completed++;
      setLoadedAssets(completed);
      const newProgress = Math.round((completed / allAssets.length) * 100);
      setProgress(newProgress);
      
      if (completed === allAssets.length) {
        // All assets loaded
        setTimeout(() => {
          onComplete();
        }, 500); // Small delay to show 100%
      }
    };
    
    // Preload images
    imageAssets.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = updateProgress;
      img.onerror = updateProgress; // Continue even if some assets fail
    });
    
    // Preload videos
    videoAssets.forEach(src => {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
      video.onloadeddata = updateProgress;
      video.onerror = updateProgress;
      // Force load
      video.load();
    });
    
    // Preload audio
    audioAssets.forEach(src => {
      const audio = new Audio();
      audio.src = src;
      audio.preload = 'auto';
      audio.oncanplaythrough = updateProgress;
      audio.onerror = updateProgress;
      // Force load
      audio.load();
    });
  }, [onComplete]);
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#FFD166',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      {/* Main loading container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          width: '100%',
          maxWidth: 500,
          px: 3
        }}
      >
        {/* Loader Component */}
        <Loader />
        
        {/* Loading text */}
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            textAlign: 'center',
            mb: 2,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          Loading game assets...
        </Typography>
        
        {/* Loading animation dots */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            mt: 2
          }}
        >
          {[1, 2, 3].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: progress >= (dot * 33) ? '#4AA8E8' : 'rgba(255, 255, 255, 0.2)',
                animation: progress >= (dot * 33) ? 'pulseDot 1.5s infinite' : 'none',
                animationDelay: `${dot * 0.2}s`,
                '@keyframes pulseDot': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                  '50%': { transform: 'scale(1.2)', opacity: 0.7 }
                }
              }}
            />
          ))}
        </Box>
      </Box>
      
      {/* Bottom tip text */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 40,
          width: '100%',
          textAlign: 'center',
          px: 2
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem'
          }}
        >
          Loading all assets for smooth gameplay...
        </Typography>
      </Box>
      
      {/* Decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: -1,
          overflow: 'hidden'
        }}
      >
        {/* Animated background circles */}
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 89, 94, 0.1) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-20px)' }
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '30%',
            right: '15%',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 209, 102, 0.1) 0%, transparent 70%)',
            animation: 'float 10s ease-in-out infinite',
            animationDelay: '1s',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-15px)' }
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            left: '20%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74, 168, 232, 0.1) 0%, transparent 70%)',
            animation: 'float 12s ease-in-out infinite',
            animationDelay: '2s',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-25px)' }
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default function PersonalHygieneLevel1() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [score, setScore] = useState(0);
  
  // Start screen is removed - set to false
  const [showStartScreen, setShowStartScreen] = useState(false);
  
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Add state to track when to hide all images
  const [hideAllImages, setHideAllImages] = useState(false);

  // Start directly with character introduction
  const [showCharacterIntroduction, setShowCharacterIntroduction] = useState(true);
  
  // Add state for hand introduction
  const [showHandIntroduction, setShowHandIntroduction] = useState(false);
  // Add state for sink introduction
  const [showSinkIntroduction, setShowSinkIntroduction] = useState(false);
  const [showStep2Introduction, setShowStep2Introduction] = useState(false);
  // Add state for step 3 introduction
  const [showStep3Introduction, setShowStep3Introduction] = useState(false);
  // Add state for step 4 introduction
  const [showStep4Introduction, setShowStep4Introduction] = useState(false);
  // Add state for step 5 introduction
  const [showStep5Introduction, setShowStep5Introduction] = useState(false);

  // Audio state
  const [purrnandoAudioRef, setPurrnandoAudioRef] = useState(null);
  const [dirtyhandsAudioRef, setDirtyhandsAudioRef] = useState(null);
  const [sinkAudioRef, setSinkAudioRef] = useState(null);
  const [wethandsAudioRef, setWethandsAudioRef] = useState(null); // Added
  const [soapAudioRef, setSoapAudioRef] = useState(null); // Added
  const [rubscrubAudioRef, setRubscrubAudioRef] = useState(null); // Added
  const [rinseAudioRef, setRinseAudioRef] = useState(null);

  const [scrub1AudioRef, setScrub1AudioRef] = useState(null);
  const [scrub2AudioRef, setScrub2AudioRef] = useState(null);
  const [scrub3AudioRef, setScrub3AudioRef] = useState(null);
  const [scrub4AudioRef, setScrub4AudioRef] = useState(null);
  const [scrub5AudioRef, setScrub5AudioRef] = useState(null);
  const [scrub6AudioRef, setScrub6AudioRef] = useState(null);
  const [scrub7AudioRef, setScrub7AudioRef] = useState(null);

  const [completeAudioRef, setCompleteAudioRef] = useState(null);
  const [showCleanHands, setShowCleanHands] = useState(false);

  // NEW: Audio refs for the new sounds
  const [backgroundMusicRef, setBackgroundMusicRef] = useState(null);
  const [correctSoundRef, setCorrectSoundRef] = useState(null);
  const [incorrectSoundRef, setIncorrectSoundRef] = useState(null);
  const [successSoundRef, setSuccessSoundRef] = useState(null);

  // ADDED: Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(30); // 0-100
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(50); // 0-100

  // Scratch card effect states
  const [scratchMarks, setScratchMarks] = useState([]);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const teethContainerRef = useRef(null);
  const [teethCoverage, setTeethCoverage] = useState(new Set());

  // Game states for brushing sequence (start at character introduction step)
  const [gameStep, setGameStep] = useState(0);
  const [faucetOn, setFaucetOn] = useState(false);
  const [step2Completed, setStep2Completed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [showBubbles, setShowBubbles] = useState(false);
  
  const [sinkTimer, setSinkTimer] = useState(10);
  const [showSinkPulse, setShowSinkPulse] = useState(false);
  const [sinkPulseScale, setSinkPulseScale] = useState(1);
  
  // New states for step 4
  const [showScrubVideo, setShowScrubVideo] = useState(false);
  const [isHandHovered, setIsHandHovered] = useState(false);
  const [handsRubbed, setHandsRubbed] = useState(false);
  const [currentScrubVideoIndex, setCurrentScrubVideoIndex] = useState(0);

  // New states for step 5
  const [step5Completed, setStep5Completed] = useState(false);
  
  // Create array of all scrub videos
  const scrubVideos = [scrubVideo, scrubVideo2, scrubVideo3, scrubVideo4, scrubVideo5, scrubVideo6, scrubVideo7];
  
  const initializeGerms = () => ([
    { id: 'germ1', x: 30, y: 50, image: germsImg, size: 50, removed: false },
    { id: 'germ2', x: 65, y: 58, image: germsImg, size: 60, removed: false },
    { id: 'germ3', x: 70, y: 78, image: germsImg, size: 50, removed: false },
    { id: 'germ4', x: 20, y: 75, image: germsImg, size: 80, removed: false },
    { id: 'germ5', x: 80, y: 65, image: germsImg, size: 50, removed: false }
  ]);
  
  const [germBlobs, setGermBlobs] = useState(initializeGerms());
  const [soapPlaced, setSoapPlaced] = useState(false);
  const [leftHandWet, setLeftHandWet] = useState(false);
  const [rightHandWet, setRightHandWet] = useState(false);
  const [showWetHands, setShowWetHands] = useState(false);

  // Helper functions
  const isOverFaucetArea = (relX, relY) => {
    return relX >= 45 && relX <= 100 && relY >= 0 && relY <= 45;
  };

  const isInSoapArea = (relX, relY) => {
    return relX >= 65 && relX <= 98 && relY >= 3 && relY <= 30;
  };

  const getStudentId = () => {
    try {
      const studentId = localStorage.getItem('studentId');
      
      console.log('Retrieving student ID:', { studentId });
      
      // Check if we have a valid student ID
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

  // Audio functions
  const playPurrnandoAudio = () => {
    if (purrnandoAudioRef && soundEffectsEnabled) {
      purrnandoAudioRef.volume = soundEffectsVolume / 100;
      purrnandoAudioRef.currentTime = 0;
      purrnandoAudioRef.play().catch(error => {
        console.log('Purrnando audio play prevented:', error);
      });
    }
  };

  const stopPurrnandoAudio = () => {
    if (purrnandoAudioRef) {
      purrnandoAudioRef.pause();
      purrnandoAudioRef.currentTime = 0;
    }
  };

  const playDirtyhandsAudio = () => {
    if (dirtyhandsAudioRef && soundEffectsEnabled) {
      dirtyhandsAudioRef.volume = soundEffectsVolume / 100;
      dirtyhandsAudioRef.currentTime = 0;
      dirtyhandsAudioRef.play().catch(error => {
        console.log('Dirtyhands audio play prevented:', error);
      });
    }
  };

  const playSinkAudio = () => {
    if (sinkAudioRef && soundEffectsEnabled) {
      sinkAudioRef.volume = soundEffectsVolume / 100;
      sinkAudioRef.currentTime = 0;
      sinkAudioRef.play().catch(error => {
        console.log('Sink audio play prevented:', error);
      });
    }
  };

  const playWethandsAudio = () => { // Added
    if (wethandsAudioRef && soundEffectsEnabled) {
      wethandsAudioRef.volume = soundEffectsVolume / 100;
      wethandsAudioRef.currentTime = 0;
      wethandsAudioRef.play().catch(error => {
        console.log('Wethands audio play prevented:', error);
      });
    }
  };

  const playSoapAudio = () => { // Added
    if (soapAudioRef && soundEffectsEnabled) {
      soapAudioRef.volume = soundEffectsVolume / 100;
      soapAudioRef.currentTime = 0;
      soapAudioRef.play().catch(error => {
        console.log('Soap audio play prevented:', error);
      });
    }
  };

  const playRubscrubAudio = () => { // Added
    if (rubscrubAudioRef && soundEffectsEnabled) {
      rubscrubAudioRef.volume = soundEffectsVolume / 100;
      rubscrubAudioRef.currentTime = 0;
      rubscrubAudioRef.play().catch(error => {
        console.log('Rubscrub audio play prevented:', error);
      });
    }
  };
  
  const playRinseAudio = () => {
    if (rinseAudioRef && soundEffectsEnabled) {
      rinseAudioRef.volume = soundEffectsVolume / 100;
      rinseAudioRef.currentTime = 0;
      rinseAudioRef.play().catch(error => {
        console.log('Rinse audio play prevented:', error);
      });
    }
  };
  
  const playScrub1Audio = () => {
    if (scrub1AudioRef && soundEffectsEnabled) {
      scrub1AudioRef.volume = soundEffectsVolume / 100;
      scrub1AudioRef.currentTime = 0;
      scrub1AudioRef.play().catch(error => {
        console.log('Scrub1 audio play prevented:', error);
      });
    }
  };

  const playScrub2Audio = () => {
    if (scrub2AudioRef && soundEffectsEnabled) {
      scrub2AudioRef.volume = soundEffectsVolume / 100;
      scrub2AudioRef.currentTime = 0;
      scrub2AudioRef.play().catch(error => {
        console.log('Scrub2 audio play prevented:', error);
      });
    }
  };
  
  const playScrub3Audio = () => {
    if (scrub3AudioRef && soundEffectsEnabled) {
      scrub3AudioRef.volume = soundEffectsVolume / 100;
      scrub3AudioRef.currentTime = 0;
      scrub3AudioRef.play().catch(error => {
        console.log('Scrub3 audio play prevented:', error);
      });
    }
  };

  const playScrub4Audio = () => {
    if (scrub4AudioRef && soundEffectsEnabled) {
      scrub4AudioRef.volume = soundEffectsVolume / 100;
      scrub4AudioRef.currentTime = 0;
      scrub4AudioRef.play().catch(error => {
        console.log('Scrub4 audio play prevented:', error);
      });
    }
  };
  
  const playScrub5Audio = () => {
    if (scrub5AudioRef && soundEffectsEnabled) {
      scrub5AudioRef.volume = soundEffectsVolume / 100;
      scrub5AudioRef.currentTime = 0;
      scrub5AudioRef.play().catch(error => {
        console.log('Scrub5 audio play prevented:', error);
      });
    }
  };

  const playScrub6Audio = () => {
    if (scrub6AudioRef && soundEffectsEnabled) {
      scrub6AudioRef.volume = soundEffectsVolume / 100;
      scrub6AudioRef.currentTime = 0;
      scrub6AudioRef.play().catch(error => {
        console.log('Scrub6 audio play prevented:', error);
      });
    }
  };
  
  const playScrub7Audio = () => {
    if (scrub7AudioRef && soundEffectsEnabled) {
      scrub7AudioRef.volume = soundEffectsVolume / 100;
      scrub7AudioRef.currentTime = 0;
      scrub7AudioRef.play().catch(error => {
        console.log('Scrub7 audio play prevented:', error);
      });
    }
  };
  
  const playCompleteAudio = () => {
    if (completeAudioRef && soundEffectsEnabled) {
      completeAudioRef.volume = soundEffectsVolume / 100;
      completeAudioRef.currentTime = 0;
      completeAudioRef.play().catch(error => {
        console.log('Complete audio play prevented:', error);
        // If audio fails to play, continue anyway after a delay
        setTimeout(() => {
          setShowCleanHands(false);
          setShowSuccess(true);
          setGameCompleted(true);
        }, 3000);
      });
    } else {
      // If audio ref not available, continue after delay
      setTimeout(() => {
        setShowCleanHands(false);
        setShowSuccess(true);
        setGameCompleted(true);
      }, 3000);
    }
  };

  const stopCompleteAudio = () => {
    if (completeAudioRef) {
      completeAudioRef.onended = null;
      completeAudioRef.pause();
      completeAudioRef.currentTime = 0;
    }
  };

  const stopScrub1Audio = () => {
    if (scrub1AudioRef) {
      scrub1AudioRef.pause();
      scrub1AudioRef.currentTime = 0;
    }
  };

  const stopScrub2Audio = () => {
    if (scrub2AudioRef) {
      scrub2AudioRef.pause();
      scrub2AudioRef.currentTime = 0;
    }
  };

  const stopScrub3Audio = () => {
    if (scrub3AudioRef) {
      scrub3AudioRef.pause();
      scrub3AudioRef.currentTime = 0;
    }
  };

  const stopScrub4Audio = () => {
    if (scrub4AudioRef) {
      scrub4AudioRef.pause();
      scrub4AudioRef.currentTime = 0;
    }
  };

  const stopScrub5Audio = () => {
    if (scrub5AudioRef) {
      scrub5AudioRef.pause();
      scrub5AudioRef.currentTime = 0;
    }
  };

  const stopScrub6Audio = () => {
    if (scrub6AudioRef) {
      scrub6AudioRef.pause();
      scrub6AudioRef.currentTime = 0;
    }
  };

  const stopScrub7Audio = () => {
    if (scrub7AudioRef) {
      scrub7AudioRef.pause();
      scrub7AudioRef.currentTime = 0;
    }
  };
  
  const stopRinseAudio = () => {
    if (rinseAudioRef) {
      rinseAudioRef.pause();
      rinseAudioRef.currentTime = 0;
    }
  };

  const stopDirtyhandsAudio = () => {
    if (dirtyhandsAudioRef) {
      dirtyhandsAudioRef.pause();
      dirtyhandsAudioRef.currentTime = 0;
    }
  };

  const stopSinkAudio = () => {
    if (sinkAudioRef) {
      sinkAudioRef.pause();
      sinkAudioRef.currentTime = 0;
    }
  };

  const stopWethandsAudio = () => { // Added
    if (wethandsAudioRef) {
      wethandsAudioRef.pause();
      wethandsAudioRef.currentTime = 0;
    }
  };

  const stopSoapAudio = () => { // Added
    if (soapAudioRef) {
      soapAudioRef.pause();
      soapAudioRef.currentTime = 0;
    }
  };

  const stopRubscrubAudio = () => { // Added
    if (rubscrubAudioRef) {
      rubscrubAudioRef.pause();
      rubscrubAudioRef.currentTime = 0;
    }
  };

  // NEW: Audio functions for the new sounds
  const playBackgroundMusic = () => {
    if (backgroundMusicRef && musicEnabled) {
      backgroundMusicRef.loop = true;
      backgroundMusicRef.volume = musicVolume / 100;
      backgroundMusicRef.play().catch(error => {
        console.log('Background music play prevented:', error);
      });
    }
  };

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef) {
      backgroundMusicRef.pause();
      backgroundMusicRef.currentTime = 0;
    }
  };

  const updateBackgroundMusicVolume = () => {
    if (backgroundMusicRef) {
      if (musicEnabled) {
        backgroundMusicRef.volume = musicVolume / 100;
        if (backgroundMusicRef.paused) {
          playBackgroundMusic();
        }
      } else {
        backgroundMusicRef.pause();
      }
    }
  };

  const updateSoundEffectsVolume = () => {
    // Update volume for all sound effect audio elements
    const audioRefs = [
      purrnandoAudioRef, dirtyhandsAudioRef, sinkAudioRef, wethandsAudioRef,
      soapAudioRef, rubscrubAudioRef, rinseAudioRef, scrub1AudioRef, scrub2AudioRef,
      scrub3AudioRef, scrub4AudioRef, scrub5AudioRef, scrub6AudioRef, scrub7AudioRef,
      completeAudioRef, correctSoundRef, incorrectSoundRef, successSoundRef
    ];
    
    audioRefs.forEach(ref => {
      if (ref) {
        ref.volume = soundEffectsVolume / 100;
      }
    });
  };

  const playCorrectSound = () => {
    if (correctSoundRef && soundEffectsEnabled) {
      correctSoundRef.volume = soundEffectsVolume / 100;
      correctSoundRef.currentTime = 0;
      correctSoundRef.play().catch(error => {
        console.log('Correct sound play prevented:', error);
      });
    }
  };

  const playIncorrectSound = () => {
    if (incorrectSoundRef && soundEffectsEnabled) {
      incorrectSoundRef.volume = soundEffectsVolume / 100;
      incorrectSoundRef.currentTime = 0;
      incorrectSoundRef.play().catch(error => {
        console.log('Incorrect sound play prevented:', error);
      });
    }
  };

  const playSuccessSound = () => {
    if (successSoundRef && soundEffectsEnabled) {
      successSoundRef.volume = soundEffectsVolume / 100;
      successSoundRef.currentTime = 0;
      successSoundRef.play().catch(error => {
        console.log('Success sound play prevented:', error);
      });
    }
  };

  // ADDED: Settings functions
  const handleMusicToggle = (event) => {
    const enabled = event.target.checked;
    setMusicEnabled(enabled);
    
    if (backgroundMusicRef) {
      if (enabled) {
        backgroundMusicRef.volume = musicVolume / 100;
        playBackgroundMusic();
      } else {
        backgroundMusicRef.pause();
      }
    }
  };

  const handleSoundEffectsToggle = (event) => {
    setSoundEffectsEnabled(event.target.checked);
  };

  const handleMusicVolumeChange = (event, newValue) => {
    setMusicVolume(newValue);
    if (backgroundMusicRef) {
      backgroundMusicRef.volume = newValue / 100;
    }
  };

  const handleSoundEffectsVolumeChange = (event, newValue) => {
    setSoundEffectsVolume(newValue);
    updateSoundEffectsVolume();
  };

  // Event handler functions
  const handleCharacterIntroductionComplete = () => {
    // Stop purrnando audio when introduction is complete
    stopPurrnandoAudio();
    setShowCharacterIntroduction(false);
    setShowHandIntroduction(true);
  };

  const handleHandIntroductionComplete = () => {
    // Stop dirtyhands audio when hand introduction is complete
    stopDirtyhandsAudio();
    setShowHandIntroduction(false);
    setShowSinkIntroduction(true);
  };

  const handleSinkIntroductionComplete = () => {
    // Stop sink audio when sink introduction is complete
    stopSinkAudio();
    setShowSinkIntroduction(false);
    setGameStep(1);
  };

  const handleTurnOnFaucet = () => {
    setFaucetOn(true);
    setShowSinkPulse(false);
    setSinkPulseScale(1);
    setTimeout(() => {
      setGameStep(2);
      playWethandsAudio();
    }, 500);
  };

  const handleStep3IntroductionComplete = () => {
    // Stop soap audio when step3 introduction is complete
    stopSoapAudio();
    setShowStep3Introduction(false);
  };

  const handleStep4IntroductionComplete = () => {
    setTimeout(() => {
      stopRubscrubAudio();
    }, 1000);

    setShowStep4Introduction(false);
    setGameStep(5);
    playRinseAudio();
  };

  const handleStep5IntroductionComplete = () => {
    setShowStep5Introduction(false);
  };

  const handleApplySoap = (e) => {
    if (gameStep !== 3) return;
    
    const teethContainer = teethContainerRef.current;
    if (teethContainer) {
      const containerRect = teethContainer.getBoundingClientRect();
      const relativeX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const relativeY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

      if (isInSoapArea(relativeX, relativeY)) {
        setSoapPlaced(true);
        // Play correct sound when soap is successfully applied
        playCorrectSound();
        
        setTimeout(() => {
          setGameStep(4);
          playRubscrubAudio();
        }, 1000);
      } else {
        // Play incorrect sound when clicking wrong area
        playIncorrectSound();
      }
    }
  };

  const handleHandRub = () => {
    if (gameStep !== 4 || handsRubbed) return;
    
    // Stop rubscrub audio immediately when hand is clicked
    stopRubscrubAudio();
    
    // Stop all scrub audio before starting new video
    stopScrub1Audio();
    stopScrub2Audio();
    stopScrub3Audio();
    stopScrub4Audio();
    stopScrub5Audio();
    stopScrub6Audio();
    stopScrub7Audio();
    
    setShowScrubVideo(true);
    setCurrentScrubVideoIndex(0);
    // Play correct sound when starting to rub hands
    playCorrectSound();
  };

  // Initialize audio when component mounts
  useEffect(() => {
    // Create all audio objects (now they should be preloaded)
    const purrnandoAudio = new Audio(purrnandolvl1);
    purrnandoAudio.volume = soundEffectsVolume / 100;
    setPurrnandoAudioRef(purrnandoAudio);
    
    const dirtyhandsAudioObj = new Audio(dirtyhandsSound);
    dirtyhandsAudioObj.volume = soundEffectsVolume / 100;
    setDirtyhandsAudioRef(dirtyhandsAudioObj);
    
    const sinkAudioObj = new Audio(sinkSound);
    sinkAudioObj.volume = soundEffectsVolume / 100;
    setSinkAudioRef(sinkAudioObj);
    
    const wethandsAudioObj = new Audio(wethandsSound); // Added
    wethandsAudioObj.volume = soundEffectsVolume / 100;
    setWethandsAudioRef(wethandsAudioObj);
    
    const soapAudioObj = new Audio(soapSound); // Added
    soapAudioObj.volume = soundEffectsVolume / 100;
    setSoapAudioRef(soapAudioObj);
    
    const rubscrubAudioObj = new Audio(rubscrubSound); // Added
    rubscrubAudioObj.volume = soundEffectsVolume / 100;
    setRubscrubAudioRef(rubscrubAudioObj);

    const rinseAudioObj = new Audio(rinseSound); // Add this
    rinseAudioObj.volume = soundEffectsVolume / 100;
    setRinseAudioRef(rinseAudioObj);

    const scrub1AudioObj = new Audio(scrub1Sound);
    scrub1AudioObj.volume = soundEffectsVolume / 100;
    setScrub1AudioRef(scrub1AudioObj);
    
    const scrub2AudioObj = new Audio(scrub2Sound);
    scrub2AudioObj.volume = soundEffectsVolume / 100;
    setScrub2AudioRef(scrub2AudioObj);

    const scrub3AudioObj = new Audio(scrub3Sound);
    scrub3AudioObj.volume = soundEffectsVolume / 100;
    setScrub3AudioRef(scrub3AudioObj);
    
    const scrub4AudioObj = new Audio(scrub4Sound);
    scrub4AudioObj.volume = soundEffectsVolume / 100;
    setScrub4AudioRef(scrub4AudioObj);

    const scrub5AudioObj = new Audio(scrub5Sound);
    scrub5AudioObj.volume = soundEffectsVolume / 100;
    setScrub5AudioRef(scrub5AudioObj);
    
    const scrub6AudioObj = new Audio(scrub6Sound);
    scrub6AudioObj.volume = soundEffectsVolume / 100;
    setScrub6AudioRef(scrub6AudioObj);

    const scrub7AudioObj = new Audio(scrub7Sound);
    scrub7AudioObj.volume = soundEffectsVolume / 100;
    setScrub7AudioRef(scrub7AudioObj);

    const completeAudioObj = new Audio(completeSound);
    completeAudioObj.volume = soundEffectsVolume / 100;
    setCompleteAudioRef(completeAudioObj);

    // NEW: Create audio objects for the new sounds
    const backgroundMusicObj = new Audio(backgroundMusic);
    backgroundMusicObj.volume = musicVolume / 100;
    setBackgroundMusicRef(backgroundMusicObj);
    
    const correctSoundObj = new Audio(correctSound);
    correctSoundObj.volume = soundEffectsVolume / 100;
    setCorrectSoundRef(correctSoundObj);
    
    const incorrectSoundObj = new Audio(incorrectSound);
    incorrectSoundObj.volume = soundEffectsVolume / 100;
    setIncorrectSoundRef(incorrectSoundObj);
    
    const successSoundObj = new Audio(successSound);
    successSoundObj.volume = soundEffectsVolume / 100;
    setSuccessSoundRef(successSoundObj);
        
    // Play purrnando audio immediately when character introduction appears
    const playPurrnandoAudioOnMount = () => {
      if (showCharacterIntroduction && soundEffectsEnabled) {
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
      }
    };

    // Start background music when game starts
    const startBackgroundMusic = () => {
      if (backgroundMusicObj && musicEnabled) {
        backgroundMusicObj.loop = true;
        backgroundMusicObj.play().catch(error => {
          console.log('Background music autoplay prevented:', error);
          const playOnInteraction = () => {
            backgroundMusicObj.play();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        });
      }
    };

    const timer = setTimeout(() => {
      playPurrnandoAudioOnMount();
      startBackgroundMusic();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (purrnandoAudio) {
        purrnandoAudio.pause();
        purrnandoAudio.currentTime = 0;
      }
      if (dirtyhandsAudioObj) {
        dirtyhandsAudioObj.pause();
        dirtyhandsAudioObj.currentTime = 0;
      }
      if (sinkAudioObj) {
        sinkAudioObj.pause();
        sinkAudioObj.currentTime = 0;
      }
      if (wethandsAudioObj) { // Added
        wethandsAudioObj.pause();
        wethandsAudioObj.currentTime = 0;
      }
      if (soapAudioObj) { // Added
        soapAudioObj.pause();
        soapAudioObj.currentTime = 0;
      }
      if (rubscrubAudioObj) { // Added
        rubscrubAudioObj.pause();
        rubscrubAudioObj.currentTime = 0;
      }
      if (rinseAudioObj) {
        rinseAudioObj.pause();
        rinseAudioObj.currentTime = 0;
      }
      if (scrub1AudioObj) { // Add this
        scrub1AudioObj.pause();
        scrub1AudioObj.currentTime = 0;
      }
      if (scrub2AudioObj) { // Add this
        scrub2AudioObj.pause();
        scrub2AudioObj.currentTime = 0;
      }
      if (scrub3AudioObj) { // Add this
        scrub3AudioObj.pause();
        scrub3AudioObj.currentTime = 0;
      }
      if (scrub4AudioObj) { // Add this
        scrub4AudioObj.pause();
        scrub4AudioObj.currentTime = 0;
      }
      if (scrub5AudioObj) { // Add this
        scrub5AudioObj.pause();
        scrub5AudioObj.currentTime = 0;
      }
      if (scrub6AudioObj) { // Add this
        scrub6AudioObj.pause();
        scrub6AudioObj.currentTime = 0;
      }
      if (scrub7AudioObj) { // Add this
        scrub7AudioObj.pause();
        scrub7AudioObj.currentTime = 0;
      }
      if (completeAudioObj) {
        completeAudioObj.pause();
        completeAudioObj.currentTime = 0;
      }
      // NEW: Clean up new audio objects
      if (backgroundMusicObj) {
        backgroundMusicObj.pause();
        backgroundMusicObj.currentTime = 0;
      }
      if (correctSoundObj) {
        correctSoundObj.pause();
        correctSoundObj.currentTime = 0;
      }
      if (incorrectSoundObj) {
        incorrectSoundObj.pause();
        incorrectSoundObj.currentTime = 0;
      }
      if (successSoundObj) {
        successSoundObj.pause();
        successSoundObj.currentTime = 0;
      }
    };
  }, [showCharacterIntroduction]);

  // Update music volume when settings change
  useEffect(() => {
    updateBackgroundMusicVolume();
  }, [musicEnabled, musicVolume]);

  // Update sound effects volume when settings change
  useEffect(() => {
    updateSoundEffectsVolume();
  }, [soundEffectsVolume]);

  // Play hand introduction audio when popup appears
  useEffect(() => {
    if (showHandIntroduction && dirtyhandsAudioRef) {
      const playAudio = () => {
        dirtyhandsAudioRef.currentTime = 0;
        dirtyhandsAudioRef.play().catch(error => {
          console.log('Dirtyhands audio play prevented:', error);
          const playOnInteraction = () => {
            dirtyhandsAudioRef.play();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        });
      };

      const timer = setTimeout(playAudio, 500);
      return () => {
        clearTimeout(timer);
        if (dirtyhandsAudioRef) {
          dirtyhandsAudioRef.pause();
          dirtyhandsAudioRef.currentTime = 0;
        }
      };
    }
  }, [showHandIntroduction]);

  // Play sink introduction audio when popup appears
  useEffect(() => {
    if (showSinkIntroduction && sinkAudioRef) {
      const playAudio = () => {
        sinkAudioRef.currentTime = 0;
        sinkAudioRef.play().catch(error => {
          console.log('Sink audio play prevented:', error);
          const playOnInteraction = () => {
            sinkAudioRef.play();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        });
      };

      const timer = setTimeout(playAudio, 500);
      return () => {
        clearTimeout(timer);
        if (sinkAudioRef) {
          sinkAudioRef.pause();
          sinkAudioRef.currentTime = 0;
        }
      };
    }
  }, [showSinkIntroduction]);

  // Play step3 introduction audio when popup appears
  useEffect(() => {
    if (showStep3Introduction && soapAudioRef) {
      const playAudio = () => {
        soapAudioRef.currentTime = 0;
        soapAudioRef.play().catch(error => {
          console.log('Soap audio play prevented:', error);
          const playOnInteraction = () => {
            soapAudioRef.play();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        });
      };

      const timer = setTimeout(playAudio, 500);
      return () => {
        clearTimeout(timer);
        if (soapAudioRef) {
          soapAudioRef.pause();
          soapAudioRef.currentTime = 0;
        }
      };
    }
  }, [showStep3Introduction]);

  // Play step4 introduction audio when popup appears
  useEffect(() => {
    if (showStep4Introduction && rubscrubAudioRef) {
      const playAudio = () => {
        rubscrubAudioRef.currentTime = 0;
        rubscrubAudioRef.play().catch(error => {
          console.log('Rubscrub audio play prevented:', error);
          const playOnInteraction = () => {
            rubscrubAudioRef.play();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
          };
          document.addEventListener('click', playOnInteraction);
          document.addEventListener('touchstart', playOnInteraction);
        });
      };

      const timer = setTimeout(playAudio, 500);
      return () => {
        clearTimeout(timer);
        if (rubscrubAudioRef) {
          rubscrubAudioRef.pause();
          rubscrubAudioRef.currentTime = 0;
        }
      };
    }
  }, [showStep4Introduction]);

  const saveProgress = async () => {
    try {
      setProgressSaving(true);
      
      const studentId = getStudentId();
      const lessonIdNum = parseInt(lessonId, 10);
      
      console.log('Saving progress with:', { studentId, lessonId: lessonIdNum });
      
      if (!studentId || !lessonIdNum) {
        throw new Error(`Missing IDs: studentId=${studentId}, lessonId=${lessonIdNum}`);
      }
      
      // Use the progress service function instead of direct fetch
      const result = await saveStudentLessonProgress(
        studentId,
        lessonIdNum,
        {
          score: 100,
          maxScore: 100,
          completed: true,
          starsEarned: 3,
          moduleId: moduleId ? parseInt(moduleId, 10) : null
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

  // Game mechanics
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    if (isDragging && draggedItem === 'hands-group') {
      const teethContainer = teethContainerRef.current;
      if (teethContainer) {
        const containerRect = teethContainer.getBoundingClientRect();
        const relativeX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const relativeY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

        if (isOverFaucetArea(relativeX, relativeY)) {
          if (gameStep === 2) {
            setLeftHandWet(true);
            setRightHandWet(true);
            setHideAllImages(true);
            setShowWetHands(true);
            // Play correct sound when hands are properly wetted
            playCorrectSound();

            setTimeout(() => {
              stopWethandsAudio();
            }, 1500);

            setTimeout(() => {
              setShowWetHands(false);
              setHideAllImages(false);
              setGameStep(3);
              setShowStep3Introduction(true);
            }, 2000);
          } else if (gameStep === 5) {
            setHideAllImages(true);
            setShowWetHands(true);
            setShowBubbles(true); // Bubbles are shown initially
            // Play correct sound when hands are properly rinsed
            playCorrectSound();
            
            // Stop rinse audio and play complete audio
            stopRinseAudio();
            
            setTimeout(() => {
              setShowWetHands(false);
              setHideAllImages(false);
              setStep5Completed(true);
              setShowBubbles(false);
              setSoapPlaced(false);
              
              // Show clean hands and play complete audio
              setShowCleanHands(true);
              
              // Play complete audio and wait for it to finish
              playCompleteAudio();
              
              // Listen for when the audio finishes playing
              if (completeAudioRef) {
                completeAudioRef.onended = () => {
                  // Audio has finished playing, now show success
                  setShowCleanHands(false);
                  setShowSuccess(true);
                  setGameCompleted(true);
                  // Play success sound when game is completed
                  playSuccessSound();
                };
              } else {
                // Fallback: if audio ref not available, wait 3 seconds
                setTimeout(() => {
                  setShowCleanHands(false);
                  setShowSuccess(true);
                  setGameCompleted(true);
                  // Play success sound when game is completed
                  playSuccessSound();
                }, 3000);
              }
            }, 2000);
          }
        } else {
          // Play incorrect sound if dropped in wrong area
          playIncorrectSound();
        }
      }
    }

    setIsDragging(false);
    setDraggedItem(null);
    if (draggedItem === 'hands-group' && gameStep === 2) {
      setGermBlobs(initializeGerms());
    }
  };

  const startDragHandsGroup = (e) => {
    if (gameStep !== 2 && gameStep !== 5) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
    if (clientX == null || clientY == null) return;
    e.preventDefault && e.preventDefault();
    setIsDragging(true);
    setDraggedItem('hands-group');
    setDragPos({ x: clientX, y: clientY });
  };

  // Effects
  useEffect(() => {
    if (gameCompleted) {
      setScore(100); // Set perfect score when completed
    }
  }, [gameCompleted]);

  useEffect(() => {
    const saveProgressOnComplete = async () => {
      if (gameCompleted && !progressSaved && !progressSaving) {
        console.log('Game completed, auto-saving progress...');
        await saveProgress();
      }
    };
    
    saveProgressOnComplete();
  }, [gameCompleted, progressSaved, progressSaving]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      if (gameStep !== 2) {
        const now = Date.now();
        setScratchMarks(prev => prev.filter(mark => now - mark.timestamp < 60000));
      }
    }, 10000);

    return () => clearInterval(cleanup);
  }, [gameStep]);

  useEffect(() => {
    console.log('Progress state:', {
      studentId: getStudentId(),
      lessonId,
      moduleId,
      gameCompleted,
      progressSaving,
      progressSaved,
      showSuccess
    });
  }, [gameCompleted, progressSaving, progressSaved, showSuccess, lessonId, moduleId]);

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) return;
        
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          console.log('Loaded existing progress:', progressResponse);
        }
      } catch (error) {
        console.log('Error fetching progress:', error);
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
          title: "Handwashing",
          description: "Learn proper handwashing technique!",
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

  useEffect(() => {
    let timerInterval;
    let animationInterval;

    if (gameStep === 1 && !faucetOn) {
      setSinkTimer(10);
      timerInterval = setInterval(() => {
        setSinkTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setShowSinkPulse(true);
            let scale = 1;
            animationInterval = setInterval(() => {
              scale = scale === 1 ? 1.1 : 1;
              setSinkPulseScale(scale);
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setShowSinkPulse(false);
      setSinkPulseScale(1);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [gameStep, faucetOn]);

  useEffect(() => {
    if (showScrubVideo) {
      if (currentScrubVideoIndex === 0) {
        // Play scrub1 audio for step 1
        playScrub1Audio();
      } else if (currentScrubVideoIndex === 1) {
        // Play scrub2 audio for step 2
        playScrub2Audio();
      } else if (currentScrubVideoIndex === 2) {
        // Play scrub3 audio for step 3
        playScrub3Audio();
      } else if (currentScrubVideoIndex === 3) {
        // Play scrub4 audio for step 4
        playScrub4Audio();
      } else if (currentScrubVideoIndex === 4) {
        // Play scrub5 audio for step 5
        playScrub5Audio();
      } else if (currentScrubVideoIndex === 5) {
        // Play scrub6 audio for step 6
        playScrub6Audio();
      } else if (currentScrubVideoIndex === 6) {
        // Play scrub7 audio for step 7
        playScrub7Audio();
      }
    }
  }, [currentScrubVideoIndex, showScrubVideo]);

  const resetGame = () => {
    // Stop all audio when resetting game
    stopPurrnandoAudio();
    stopDirtyhandsAudio();
    stopSinkAudio();
    stopWethandsAudio(); // Added
    stopSoapAudio(); // Added
    stopRubscrubAudio(); // Added
    stopRinseAudio();
    stopScrub1Audio(); // Add this
    stopScrub2Audio();
    stopScrub3Audio();
    stopScrub4Audio();
    stopScrub5Audio();
    stopScrub6Audio();
    stopScrub7Audio();
    
    setShowFeedback(false);
    setShowSuccess(false);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    setHideAllImages(false);
    setShowBubbles(false);
    setShowCleanHands(false);
    
    setShowCharacterIntroduction(true);
    setShowHandIntroduction(false);
    setShowSinkIntroduction(false);
    setShowStep3Introduction(false);
    setShowStep4Introduction(false);
    setShowStep5Introduction(false);
    
    setGameStep(0);
    setFaucetOn(false);
    setStep2Completed(false);
    setIsDragging(false);
    setDraggedItem(null);
    setSoapPlaced(false);
    setLeftHandWet(false);
    setRightHandWet(false);
    setShowScrubVideo(false);
    setIsHandHovered(false);
    setHandsRubbed(false);
    setCurrentScrubVideoIndex(0);
    setStep5Completed(false);

    setSinkTimer(10);
    setShowSinkPulse(false);
    setSinkPulseScale(1);

    setGermBlobs(initializeGerms());
  };

  const getStarRating = () => {
    return gameCompleted ? 3 : 0;
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
    
    console.log('Navigating back...');
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleGoHome = () => {
    // Stop all audio when going home
    stopPurrnandoAudio();
    stopDirtyhandsAudio();
    stopSinkAudio();
    stopWethandsAudio(); // Added
    stopSoapAudio(); // Added
    stopRubscrubAudio(); // Added
    stopCompleteAudio();
    stopBackgroundMusic();
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
  }, [showSuccess, gameCompleted]);

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

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (purrnandoAudioRef) {
        purrnandoAudioRef.pause();
        purrnandoAudioRef.currentTime = 0;
      }
      if (dirtyhandsAudioRef) {
        dirtyhandsAudioRef.pause();
        dirtyhandsAudioRef.currentTime = 0;
      }
      if (sinkAudioRef) {
        sinkAudioRef.pause();
        sinkAudioRef.currentTime = 0;
      }
      if (wethandsAudioRef) { // Added
        wethandsAudioRef.pause();
        wethandsAudioRef.currentTime = 0;
      }
      if (soapAudioRef) { // Added
        soapAudioRef.pause();
        soapAudioRef.currentTime = 0;
      }
      if (rubscrubAudioRef) { // Added
        rubscrubAudioRef.pause();
        rubscrubAudioRef.currentTime = 0;
      }
      if (rinseAudioRef) { // Add this
        rinseAudioRef.pause();
        rinseAudioRef.currentTime = 0;
      }
      if (scrub1AudioRef) { // Add this
        scrub1AudioRef.pause();
        scrub1AudioRef.currentTime = 0;
      }
      if (scrub2AudioRef) { // Add this
        scrub2AudioRef.pause();
        scrub2AudioRef.currentTime = 0;
      }
      if (scrub3AudioRef) { // Add this
        scrub3AudioRef.pause();
        scrub3AudioRef.currentTime = 0;
      }
      if (scrub4AudioRef) { // Add this
        scrub4AudioRef.pause();
        scrub4AudioRef.currentTime = 0;
      }
      if (scrub5AudioRef) { // Add this
        scrub5AudioRef.pause();
        scrub5AudioRef.currentTime = 0;
      }
      if (scrub6AudioRef) { // Add this
        scrub6AudioRef.pause();
        scrub6AudioRef.currentTime = 0;
      }
      if (scrub7AudioRef) { // Add this
        scrub7AudioRef.pause();
        scrub7AudioRef.currentTime = 0;
      }
      if (completeAudioRef) {
        completeAudioRef.pause();
        completeAudioRef.currentTime = 0;
      }
      // NEW: Clean up new audio objects
      if (backgroundMusicRef) {
        backgroundMusicRef.pause();
        backgroundMusicRef.currentTime = 0;
      }
      if (correctSoundRef) {
        correctSoundRef.pause();
        correctSoundRef.currentTime = 0;
      }
      if (incorrectSoundRef) {
        incorrectSoundRef.pause();
        incorrectSoundRef.currentTime = 0;
      }
      if (successSoundRef) {
        successSoundRef.pause();
        successSoundRef.currentTime = 0;
      }
    };
  }, [purrnandoAudioRef, dirtyhandsAudioRef, sinkAudioRef, wethandsAudioRef, soapAudioRef, rubscrubAudioRef, rinseAudioRef, scrub1AudioRef, scrub2AudioRef, scrub3AudioRef, scrub4AudioRef, scrub5AudioRef, scrub6AudioRef, scrub7AudioRef, backgroundMusicRef, correctSoundRef, incorrectSoundRef, successSoundRef]);

  // Show loading screen until assets are loaded
  if (!assetsLoaded) {
    return <AssetLoader onComplete={() => setAssetsLoaded(true)} />;
  }

  // ADDED: Settings Panel Component
// ADDED: Settings Panel Component
const SettingsPanel = () => (
  <Drawer
    anchor="right"
    open={showSettings}
    onClose={() => setShowSettings(false)}
    PaperProps={{
      sx: {
        width: 320,
        backgroundColor: '#ffffff', // Solid white background
        padding: 3,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
        boxShadow: '0 0 40px rgba(0,0,0,0.4)',
        border: '2px solid #1982C4',
        // Remove backdropFilter entirely for solid background
      }
    }}
  >
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32, color: '#1982C4', mr: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#280B60', fontFamily: 'Poppins, sans-serif' }}>
          Audio Settings
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3, borderColor: '#1982C4' }} />
      
      {/* Music Settings */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#1982C4', fontFamily: 'Poppins, sans-serif' }}>
            Background Music
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={musicEnabled}
                onChange={handleMusicToggle}
                color="primary"
              />
            }
            label={musicEnabled ? "ON" : "OFF"}
            sx={{ color: '#333' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VolumeOffIcon sx={{ color: musicEnabled ? '#1982C4' : '#999' }} />
          <Slider
            value={musicVolume}
            onChange={handleMusicVolumeChange}
            aria-labelledby="music-volume-slider"
            sx={{
              flex: 1,
              color: '#1982C4',
              '& .MuiSlider-track': {
                backgroundColor: musicEnabled ? '#1982C4' : '#999',
              },
              '& .MuiSlider-thumb': {
                backgroundColor: musicEnabled ? '#1982C4' : '#999',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: musicEnabled ? '0 0 0 8px rgba(25, 130, 196, 0.16)' : 'none',
                },
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#ddd',
              }
            }}
            disabled={!musicEnabled}
          />
          <VolumeUpIcon sx={{ color: musicEnabled ? '#1982C4' : '#999' }} />
        </Box>
        
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: '#666' }}>
          {musicVolume}%
        </Typography>
      </Box>
      
      {/* Sound Effects Settings */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#FF595E', fontFamily: 'Poppins, sans-serif' }}>
            Sound Effects
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={soundEffectsEnabled}
                onChange={handleSoundEffectsToggle}
                color="primary"
              />
            }
            label={soundEffectsEnabled ? "ON" : "OFF"}
            sx={{ color: '#333' }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VolumeMuteIcon sx={{ color: soundEffectsEnabled ? '#FF595E' : '#999' }} />
          <Slider
            value={soundEffectsVolume}
            onChange={handleSoundEffectsVolumeChange}
            aria-labelledby="sound-effects-volume-slider"
            sx={{
              flex: 1,
              color: '#FF595E',
              '& .MuiSlider-track': {
                backgroundColor: soundEffectsEnabled ? '#FF595E' : '#999',
              },
              '& .MuiSlider-thumb': {
                backgroundColor: soundEffectsEnabled ? '#FF595E' : '#999',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: soundEffectsEnabled ? '0 0 0 8px rgba(255, 89, 94, 0.16)' : 'none',
                },
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#ddd',
              }
            }}
            disabled={!soundEffectsEnabled}
          />
          <VolumeUpIcon sx={{ color: soundEffectsEnabled ? '#FF595E' : '#999' }} />
        </Box>
        
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, color: '#666' }}>
          {soundEffectsVolume}%
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3, borderColor: '#1982C4' }} />
      
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Close Button */}
      <Button
        variant="contained"
        onClick={() => setShowSettings(false)}
        sx={{
          background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
          color: 'white',
          py: 1.5,
          borderRadius: '10px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '600',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 4px 15px rgba(25, 130, 196, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E90FF 0%, #1982C4 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(25, 130, 196, 0.6)',
          }
        }}
      >
        Close Settings
      </Button>
    </Box>
  </Drawer>
);

  // Character Introduction Popup Component
  const CharacterIntroductionPopup = () => {
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
            onClick={playPurrnandoAudio}
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
              '@keyframes bounceAndTilt': keyframes.bounceAndTilt,
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
          />
        </Box>
        
        <Paper
          sx={{
            position: 'fixed',
            bottom: 150,
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
                fontFamily: 'Poppins, sans-serif',
                textAlign: 'center'
              }}
            >
              Hi! I'm Purrnando! 🐱
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center',gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={handleCharacterIntroductionComplete}
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
                      YES, LET'S GO! 🐾
                    </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };

  // Hand Introduction Popup Component
  const HandIntroductionPopup = () => (
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
          onClick={playDirtyhandsAudio}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255, 89, 94, 0.9)',
            color: 'white',
            width: 50,
            height: 50,
            zIndex: 2001,
            '&:hover': {
              backgroundColor: 'rgba(255, 89, 94, 1)',
              transform: 'scale(1.1)'
            }
          }}
          title="Replay Dirty Hands Audio"
        >
          <VolumeUpIcon sx={{ fontSize: 25 }} />
        </IconButton>
      </Box>
      
      {/* Centered Hands with Germs and Mud */}
      <Box sx={{ 
        display: 'flex', 
        gap: 8, 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 20,
        position: 'relative'
      }}>
        {/* Left Hand with Mud and Germs */}
        <Box sx={{ position: 'relative', width: 400, height: 400 }}>
          <Box
            component="img"
            src={leftHandImg}
            alt="Left Hand"
            sx={{
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          />
          {/* Mud on left hand */}
          <Box
            component="img"
            src={mudImg}
            alt="Mud on left hand"
            sx={{
              position: 'absolute',
              left: '60%',
              bottom: '18%',
              transform: 'translate(-50%, 0)',
              width: 120,
              height: 'auto',
              zIndex: 7,
              pointerEvents: 'none',
              animation: 'wiggle 3s ease-in-out infinite',
              '@keyframes wiggle': {
                '0%': { transform: 'translate(-50%, 0) rotate(0deg)' },
                '25%': { transform: 'translate(-50%, -5px) rotate(2deg)' },
                '50%': { transform: 'translate(-50%, 0) rotate(0deg)' },
                '75%': { transform: 'translate(-50%, 5px) rotate(-2deg)' },
                '100%': { transform: 'translate(-50%, 0) rotate(0deg)' }
              }
            }}
          />
          {/* Germs on left hand */}
          <Box
            component="img"
            src={germsImg}
            alt="Germ on left hand"
            sx={{
              position: 'absolute',
              left: '30%',
              top: '40%',
              width: 45,
              height: 'auto',
              zIndex: 8,
              pointerEvents: 'none',
              animation: 'float 4s ease-in-out infinite',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-8px)' },
                '100%': { transform: 'translateY(0px)' }
              }
            }}
          />
          <Box
            component="img"
            src={germsImg}
            alt="Germ on left hand"
            sx={{
              position: 'absolute',
              left: '45%',
              top: '60%',
              width: 35,
              height: 'auto',
              zIndex: 8,
              pointerEvents: 'none',
              animation: 'float 3.5s ease-in-out infinite',
              animationDelay: '0.5s',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-6px)' },
                '100%': { transform: 'translateY(0px)' }
              }
            }}
          />
        </Box>

        {/* Right Hand with Mud and Germs */}
        <Box sx={{ position: 'relative', width: 400, height: 400 }}>
          <Box
            component="img"
            src={rightHandImg}
            alt="Right Hand"
            sx={{
              width: '100%',
              height: '100%',
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
          {/* Mud on right hand */}
          <Box
            component="img"
            src={mudImg}
            alt="Mud on right hand"
            sx={{
              position: 'absolute',
              left: '45%',
              bottom: '35%',
              transform: 'translate(-50%, 0)',
              width: 90,
              height: 'auto',
              zIndex: 7,
              pointerEvents: 'none',
              animation: 'wiggle 3.2s ease-in-out infinite',
              animationDelay: '0.3s',
              '@keyframes wiggle': {
                '0%': { transform: 'translate(-50%, 0) rotate(0deg)' },
                '25%': { transform: 'translate(-50%, -4px) rotate(-2deg)' },
                '50%': { transform: 'translate(-50%, 0) rotate(0deg)' },
                '75%': { transform: 'translate(-50%, 4px) rotate(2deg)' },
                '100%': { transform: 'translate(-50%, 0) rotate(0deg)' }
              }
            }}
          />
          {/* Germs on right hand */}
          <Box
            component="img"
            src={germsImg}
            alt="Germ on right hand"
            sx={{
              position: 'absolute',
              left: '65%',
              top: '30%',
              width: 50,
              height: 'auto',
              zIndex: 8,
              pointerEvents: 'none',
              animation: 'float 4.2s ease-in-out infinite',
              animationDelay: '0.7s',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-7px)' },
                '100%': { transform: 'translateY(0px)' }
              }
            }}
          />
          <Box
            component="img"
            src={germsImg}
            alt="Germ on right hand"
            sx={{
              position: 'absolute',
              left: '55%',
              top: '55%',
              width: 40,
              height: 'auto',
              zIndex: 8,
              pointerEvents: 'none',
              animation: 'float 3.8s ease-in-out infinite',
              animationDelay: '1.2s',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-9px)' },
                '100%': { transform: 'translateY(0px)' }
              }
            }}
          />
          <Box
            component="img"
            src={germsImg}
            alt="Germ on right hand"
            sx={{
              position: 'absolute',
              left: '35%',
              top: '45%',
              width: 30,
              height: 'auto',
              zIndex: 8,
              pointerEvents: 'none',
              animation: 'float 3.2s ease-in-out infinite',
              animationDelay: '0.9s',
              '@keyframes float': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-5px)' },
                '100%': { transform: 'translateY(0px)' }
              }
            }}
          />
        </Box>
      </Box>
      
      {/* Popup at the bottom with Cat on left side */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 120,
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
        {/* Cat on left side */}
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
        
        {/* Text content */}
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
            Oh no! You need to clean your hands!
          </Typography>
          
          <Button
                  variant="contained"
                  onClick={handleHandIntroductionComplete}
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
                  LET'S CLEAN THEM! 🐾
                </Button>
        </Box>
      </Paper>
    </Box>
  );

  // Sink Introduction Popup Component
  const SinkIntroductionPopup = () => (
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
          onClick={playSinkAudio}
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
          title="Replay Sink Audio"
        >
          <VolumeUpIcon sx={{ fontSize: 25 }} />
        </IconButton>
      </Box>
      
      {/* Centered Sink */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 15,
        position: 'relative'
      }}>
        <Box
          component="img"
          src={sinkImg}
          alt="Sink"
          sx={{
            width: 500,
            height: 500,
            filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)' }
            }
          }}
        />
      </Box>
      
      {/* Popup at the bottom with Cat on left side */}
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
        {/* Cat on left side */}
        <Box
          component="img"
          src={characterCatHelpful}
          alt="Cute Cat Helper"
          sx={{
            width: 100,
            height: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            animation: 'bounce 2s ease-in-out infinite',
            '@keyframes bounce': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' },
              '100%': { transform: 'translateY(0px)' }
            }
          }}
        />
        
        {/* Text content */}
        <Box sx={{ flex: 1, textAlign: 'left' }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#280B60',
              mb: 1,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            This is the Sink!
          </Typography>
          <Button
                variant="contained"
                onClick={handleSinkIntroductionComplete}
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
                      GOT IT! 🐾
                    </Button>
        </Box>
      </Paper>
    </Box>
  );

  // Step 3 Introduction Popup Component
  const Step3IntroductionPopup = () => (
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
          onClick={playSoapAudio}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
            color: 'white',
            width: 50,
            height: 50,
            zIndex: 2001,
            '&:hover': {
              backgroundColor: 'rgba(255, 152, 0, 1)',
              transform: 'scale(1.1)'
            }
          }}
          title="Replay Soap Audio"
        >
          <VolumeUpIcon sx={{ fontSize: 25 }} />
        </IconButton>
      </Box>
      
      {/* Centered Sink with Soap Area Highlighted */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 15,
        position: 'relative'
      }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            component="img"
            src={faucetImg}
            alt="Sink with Soap Dispenser"
            sx={{
              width: 500,
              height: 500,
              filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))'
            }}
          />
          
          {/* Highlighted soap area */}
          <Box
            sx={{
              position: 'absolute',
              top: '8%',
              right: '15%',
              width: '25%',
              height: '20%',
              border: '4px dashed #FFD700',
              borderRadius: '15px',
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              animation: 'pulseHighlight 2s ease-in-out infinite',
              '@keyframes pulseHighlight': {
                '0%': { 
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.2)'
                },
                '50%': { 
                  borderColor: '#FFA500',
                  backgroundColor: 'rgba(255, 215, 0, 0.4)'
                },
                '100%': { 
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.2)'
                }
              }
            }}
          />
          
          {/* Soap icon inside highlighted area */}
          <Box
            component="img"
            src={soapImg}
            alt="Soap"
            sx={{
              position: 'absolute',
              top: '12%',
              right: '20%',
              width: '15%',
              height: 'auto',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
              animation: 'bounceSoap 2s ease-in-out infinite',
              '@keyframes bounceSoap': {
                '0%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' },
                '100%': { transform: 'translateY(0px)' }
              }
            }}
          />
        </Box>
      </Box>
      
      {/* Popup at the bottom with Cat on left side */}
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
          border: '3px solid #FF9800',
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}
      >
        {/* Cat on left side */}
        <Box
          component="img"
          src={characterCatHelpful}
          alt="Cute Cat Helper"
          sx={{
            width: 100,
            height: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            animation: 'bounce 3s ease-in-out infinite',
            '@keyframes bounce': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-8px)' },
              '100%': { transform: 'translateY(0px)' }
            }
          }}
        />
        
        {/* Text content */}
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
            Time for Soap!
          </Typography>

          <Button
            variant="contained"
            onClick={handleStep3IntroductionComplete}
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
            GET SOAP! 🐾
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  // Step 4 Introduction Popup Component - NEW POPUP
  const Step4IntroductionPopup = () => (
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
          onClick={playRubscrubAudio}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(76, 175, 80, 0.9)',
            color: 'white',
            width: 50,
            height: 50,
            zIndex: 2001,
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 1)',
              transform: 'scale(1.1)'
            }
          }}
          title="Replay Rub and Scrub Audio"
        >
          <VolumeUpIcon sx={{ fontSize: 25 }} />
        </IconButton>
      </Box>
      
      {/* Centered Hands with Soap */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 15,
        position: 'relative'
      }}>
        <Box sx={{ display: 'flex', gap: 6, position: 'relative' }}>
          {/* Left Hand with Soap */}
          <Box sx={{ position: 'relative', width: 350, height: 'auto' }}>
            <Box
              component="img"
              src={leftHandImg}
              alt="Left Hand with Soap"
              sx={{
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
                animation: 'pulseHands 2s ease-in-out infinite',
                '@keyframes pulseHands': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            />
            <Box
              component="img"
              src={soapImg}
              alt="Soap"
              sx={{
                position: 'absolute',
                left: '40%',
                bottom: '25%',
                width: '30%',
                height: 'auto',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                animation: 'rotateSoap 3s ease-in-out infinite',
                '@keyframes rotateSoap': {
                  '0%': { transform: 'rotate(0deg)' },
                  '25%': { transform: 'rotate(10deg)' },
                  '50%': { transform: 'rotate(0deg)' },
                  '75%': { transform: 'rotate(-10deg)' },
                  '100%': { transform: 'rotate(0deg)' }
                }
              }}
            />
          </Box>

          {/* Right Hand with Soap */}
          <Box sx={{ position: 'relative', width: 350, height: 'auto' }}>
            <Box
              component="img"
              src={rightHandImg}
              alt="Right Hand with Soap"
              sx={{
                width: '100%',
                height: 'auto',
                filter: 'drop-shadow(0 10px 25px rgba(255, 255, 255, 0.3))',
                animation: 'pulseHands 2s ease-in-out infinite',
                animationDelay: '0.5s',
                '@keyframes pulseHands': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' }
                }
              }}
            />
            <Box
              component="img"
              src={soapImg}
              alt="Soap"
              sx={{
                position: 'absolute',
                left: '40%',
                bottom: '25%',
                width: '30%',
                height: 'auto',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                animation: 'rotateSoap 3s ease-in-out infinite',
                animationDelay: '1s',
                '@keyframes rotateSoap': {
                  '0%': { transform: 'rotate(0deg)' },
                  '25%': { transform: 'rotate(10deg)' },
                  '50%': { transform: 'rotate(0deg)' },
                  '75%': { transform: 'rotate(-10deg)' },
                  '100%': { transform: 'rotate(0deg)' }
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Rubbing motion animation */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 100,
        height: 50,
        zIndex: 3
      }}>
        <Box
          sx={{
            width: '100%',
            height: '8px',
            backgroundColor: '#4CAF50',
            borderRadius: '4px',
            position: 'relative',
            animation: 'rubMotion 1.5s ease-in-out infinite',
            '@keyframes rubMotion': {
              '0%': { 
                transform: 'translateX(-20px)',
                opacity: 0.7
              },
              '50%': { 
                transform: 'translateX(20px)',
                opacity: 1
              },
              '100%': { 
                transform: 'translateX(-20px)',
                opacity: 0.7
              }
            }
          }}
        />
      </Box>
      
      {/* Popup at the bottom with Cat on left side */}
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
          border: '3px solid #4CAF50',
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}
      >
        {/* Cat on left side */}
        <Box
          component="img"
          src={characterCatHelpful}
          alt="Cute Cat Helper"
          sx={{
            width: 100,
            height: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            animation: 'bounce 3s ease-in-out infinite',
            '@keyframes bounce': {
              '0%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-8px)' },
              '100%': { transform: 'translateY(0px)' }
            }
          }}
        />
        
        {/* Text content */}
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
            Time to Rub and Scrub!
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
            Perfect! You've got soap on your hands. Now we need to rub them together to create a good lather. 
            Click on your hands to start scrubbing and learn the proper technique!
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleStep4IntroductionComplete}
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
            START SCRUBBING! 🐾
          </Button>
        </Box>
      </Paper>
    </Box>
  );
  
  // Clean Hands Display Component
  const CleanHandsDisplay = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${pinkBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      {/* Added text above the main title */}
      <Typography
        variant="h2"
        sx={{
          fontWeight: 'bold',
          color: '#FF4081',
          fontFamily: 'Poppins, sans-serif',
          textAlign: 'center',
          mb: 4,
          textShadow: '3px 3px 6px rgba(255, 255, 255, 0.8)',
          animation: 'floatText 3s ease-in-out infinite',
          '@keyframes floatText': {
            '0%': { transform: 'translateY(0px)', opacity: 0.9 },
            '50%': { transform: 'translateY(-10px)', opacity: 1 },
            '100%': { transform: 'translateY(0px)', opacity: 0.9 }
          }
        }}
      >
        🌟 CONGRATULATIONS! 🌟
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 10,
        gap: 8,
        position: 'relative'
      }}>
        {/* Sparkles around left hand */}
        <Box sx={{ 
          position: 'absolute', 
          left: 'calc(50% - 450px)',
          top: '50%',
          transform: 'translateY(-50%)'
        }}>
          {/* Top-left sparkle */}
          <Box sx={{
            position: 'absolute',
            top: -60,
            left: 60,
            fontSize: '40px',
            animation: 'sparkleTwinkle 2s ease-in-out infinite',
            '@keyframes sparkleTwinkle': {
              '0%, 100%': { opacity: 0.3, transform: 'scale(0.8) rotate(0deg)' },
              '50%': { opacity: 1, transform: 'scale(1.2) rotate(180deg)' }
            }
          }}>
            ✨
          </Box>
          
          {/* Bottom-left sparkle */}
          <Box sx={{
            position: 'absolute',
            bottom: -60,
            left: 100,
            fontSize: '35px',
            animation: 'sparkleTwinkle 2.5s ease-in-out infinite',
            animationDelay: '0.3s',
            '@keyframes sparkleTwinkle': {
              '0%, 100%': { opacity: 0.3, transform: 'scale(0.8) rotate(0deg)' },
              '50%': { opacity: 1, transform: 'scale(1.2) rotate(180deg)' }
            }
          }}>
            ✨
          </Box>
          
          {/* Middle-left sparkle */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: -40,
            fontSize: '45px',
            animation: 'sparkleTwinkle 3s ease-in-out infinite',
            animationDelay: '0.6s',
            '@keyframes sparkleTwinkle': {
              '0%, 100%': { opacity: 0.3, transform: 'scale(0.8) rotate(0deg)' },
              '50%': { opacity: 1, transform: 'scale(1.2) rotate(180deg)' }
            }
          }}>
            ✨
          </Box>
        </Box>
        
        {/* Sparkles around right hand */}
        <Box sx={{ 
          position: 'absolute', 
          right: 'calc(50% - 450px)',
          top: '50%',
          transform: 'translateY(-50%)'
        }}>
          {/* Top-right sparkle */}
          <Box sx={{
            position: 'absolute',
            top: -60,
            right: 60,
            fontSize: '40px',
            animation: 'sparkleTwinkle 2.2s ease-in-out infinite',
            animationDelay: '0.4s',
            '@keyframes sparkleTwinkle': {
              '0%, 100%': { opacity: 0.3, transform: 'scale(0.8) rotate(0deg)' },
              '50%': { opacity: 1, transform: 'scale(1.2) rotate(180deg)' }
            }
          }}>
            ✨
          </Box>
          
          {/* Bottom-right sparkle */}
          <Box sx={{
            position: 'absolute',
            bottom: -60,
            right: 100,
            fontSize: '35px',
            animation: 'sparkleTwinkle 2.7s ease-in-out infinite',
            animationDelay: '0.7s',
            '@keyframes sparkleTwinkle': {
              '0%, 100%': { opacity: 0.3, transform: 'scale(0.8) rotate(0deg)' },
              '50%': { opacity: 1, transform: 'scale(1.2) rotate(180deg)' }
            }
          }}>
            ✨
          </Box>
          
          {/* Middle-right sparkle */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            right: -40,
            fontSize: '45px',
            animation: 'sparkleTwinkle 3.2s ease-in-out infinite',
            animationDelay: '1s',
            '@keyframes sparkleTwinkle': {
              '0%, 100%': { opacity: 0.3, transform: 'scale(0.8) rotate(0deg)' },
              '50%': { opacity: 1, transform: 'scale(1.2) rotate(180deg)' }
            }
          }}>
            ✨
          </Box>
        </Box>

        {/* Left Hand - Clean */}
        <Box sx={{ position: 'relative', width: 400, height: 'auto' }}>
          <Box
            component="img"
            src={leftHandImg}
            alt="Clean Left Hand"
            sx={{
              height: '500px',
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.5)) brightness(1.1)',
              animation: 'sparkle 2s ease-in-out infinite',
              '@keyframes sparkle': {
                '0%': { 
                  filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) brightness(1.1)' 
                },
                '50%': { 
                  filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.8)) brightness(1.2)' 
                },
                '100%': { 
                  filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) brightness(1.1)' 
                }
              }
            }}
          />
        </Box>

        {/* Right Hand - Clean */}
        <Box sx={{ position: 'relative', width: 400, height: 'auto' }}>
          <Box
            component="img"
            src={rightHandImg}
            alt="Clean Right Hand"
            sx={{
              height: '500px',
              filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.5)) brightness(1.1)',
              animation: 'sparkle 2s ease-in-out infinite',
              animationDelay: '0.5s',
              '@keyframes sparkle': {
                '0%': { 
                  filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) brightness(1.1)' 
                },
                '50%': { 
                  filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.8)) brightness(1.2)' 
                },
                '100%': { 
                  filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) brightness(1.1)' 
                }
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );

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
        {/* ADDED: Settings Panel */}
        <SettingsPanel />
        
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
              Step {gameStep === 0 ? 'Introduction' : `${gameStep}/5`}: {gameStep === 0 ? 'Meet Purrnando!' : gameStep === 1 ? 'Turn on the faucet!' : gameStep === 2 ? 'Wet Hands' : gameStep === 3 ? 'Apply Soap' : gameStep === 4 ? 'Rub Hands' : gameStep === 5 ? 'Rinse Hands' : 'Rinse Hands'}
            </Typography>
            
            <Chip  
              label="Completed!" 
              sx={{
                backgroundColor: '#90BE6D',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(144, 190, 109, 0.4)',
                display: gameCompleted ? 'flex' : 'none'
              }}
            />
          </Stack>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={((gameStep === 0 ? 0 : gameStep) / 5) * 100} 
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

        <Box sx={{ 
          mb: 1,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1010
        }}>
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            backgroundColor: gameStep === 3 ? '#FF9800' : gameStep === 4 ? '#4CAF50' : gameStep === 5 ? '#2196F3' : 'rgba(25, 130, 196, 0.9)',
            display: 'inline-block',
            px: 3,
            py: 1,
            borderRadius: '15px',
            fontSize: '1rem',
            boxShadow: gameStep === 3 ? '0 4px 15px rgba(255, 152, 0, 0.4)' : gameStep === 4 ? '0 4px 15px rgba(76, 175, 80, 0.4)' : gameStep === 5 ? '0 4px 15px rgba(33, 150, 243, 0.4)' : '0 4px 15px rgba(25, 130, 196, 0.4)'
          }}>
            {gameStep === 0 ? 'Let\'s learn about handwashing!' : 
            gameStep === 1 ? 'Click the sink to turn on water!' : 
            gameStep === 2 ? 'Drag hands to sink to wet hands!' :
            gameStep === 3 ? 'Click the soap dispenser (upper right) to get soap!' :
            gameStep === 4 ? 'Click on hands to rub them together!' :
            'Drag clean hands to sink to rinse!'}
          </Typography>
        </Box>

        {/* Character Introduction Popup */}
        {showCharacterIntroduction && <CharacterIntroductionPopup />}

        {/* Hand Introduction Popup */}
        {showHandIntroduction && <HandIntroductionPopup />}

        {/* Sink Introduction Popup */}
        {showSinkIntroduction && <SinkIntroductionPopup />}

        {/* Step 3 Introduction Popup */}
        {showStep3Introduction && <Step3IntroductionPopup />}

        {/* Step 4 Introduction Popup - NEW POPUP */}
        {showStep4Introduction && <Step4IntroductionPopup />}

        {/* Scrub Video Overlay */}
        {showScrubVideo && (
          <Box sx={{
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
          }}>
            <Box sx={{ 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              maxWidth: '90%',
              maxHeight: '90%'
            }}>
              <video
                key={scrubVideos[currentScrubVideoIndex]}
                autoPlay
                muted
                loop
                style={{
                  maxWidth: '100%',
                  maxHeight: '80%',
                  borderRadius: '15px',
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)'
                }}
              >
                <source src={scrubVideos[currentScrubVideoIndex]} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* ADDED CREDIT TEXT HERE */}
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  color: 'rgba(255, 255, 255, 0.9)',
                  backgroundColor: 'rgba(128, 128, 128, 0.7)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  zIndex: 10
                }}
              >
                video from Smile and Learn - English
              </Typography>
              
              {/* NEXT/FINISH Button */}
              <Button
                variant="contained"
                onClick={() => {
                  // Stop current scrub audio before moving to next video
                  if (currentScrubVideoIndex === 0) {
                    stopScrub1Audio();
                  } else if (currentScrubVideoIndex === 1) {
                    stopScrub2Audio();
                  } else if (currentScrubVideoIndex === 2) {
                    stopScrub3Audio();
                  } else if (currentScrubVideoIndex === 3) {
                    stopScrub4Audio();
                  } else if (currentScrubVideoIndex === 4) {
                    stopScrub5Audio();
                  } else if (currentScrubVideoIndex === 5) {
                    stopScrub6Audio();
                  } else if (currentScrubVideoIndex === 6) {
                    stopScrub7Audio();
                  }
                  
                  if (currentScrubVideoIndex < scrubVideos.length - 1) {
                    // If not the last video, go to next video
                    setCurrentScrubVideoIndex(prev => prev + 1);
                  } else {
                    // If on the last video (scrub7.mp4), proceed to step 5
                    setShowScrubVideo(false);
                    setHandsRubbed(true);
                    setGameStep(5);
                    playRinseAudio();
                  }
                }}
                sx={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                  color: 'white',
                  px: 8,
                  py: 3,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.3rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.7)',
                  animation: 'breathe 2s infinite ease-in-out',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  minWidth: '280px',
                  marginTop: 3,
                  
                  '&:hover': {
                    background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(76, 175, 80, 0.9)',
                    animation: 'none',
                  },
                  
                  '@keyframes breathe': {
                    '0%, 100%': {
                      background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                    },
                    '50%': {
                      background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                    }
                  }
                }}
              >
                {currentScrubVideoIndex < scrubVideos.length - 1 ? 'Next →' : 'Finish 🐾'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Conditionally render game content based on hideAllImages state */}
        {!hideAllImages && !gameCompleted && !showCharacterIntroduction && !showHandIntroduction && !showSinkIntroduction && !showStep2Introduction && !showStep3Introduction && !showStep4Introduction && !showStep5Introduction && (
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
              
            
              {/* Central teeth container with scratch card effect */}
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
                  overflow: 'visible'
                }}
                onDragOver={(e) => e.preventDefault()}
                // removed container-level mousedown that caused accidental drags
                >

                {/* Show sink before turn-on; once faucetOn or game moves past step 1, show faucet image in same position so it replaces the sink */}
                { (faucetOn || gameStep > 1 || step2Completed || gameCompleted) ? (
                  <img
                    src={faucetImg}
                    alt="Faucet"
                    // Add click handler for step 3 to apply soap
                    onClick={gameStep === 3 ? handleApplySoap : undefined}
                    style={{
                      width: '650px',
                      height: '600px',
                      objectFit: 'contain',
                      cursor: gameStep === 3 ? 'pointer' : 'default',
                      boxShadow: 'none',
                      filter: (step2Completed || gameCompleted) ? 'brightness(1.1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))' : 'brightness(1)',
                      transition: 'all 0.5s ease',
                      position: 'relative',
                      zIndex: 3
                    }}
                  />
                ) : null}
                {(faucetOn || gameStep > 1 || step2Completed || gameCompleted) ? null : (
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={sinkImg}
                      alt="Sink"
                      onClick={gameStep === 1 && !faucetOn ? handleTurnOnFaucet : undefined}
                      sx={{
                        width: '650px',
                        height: '600px',
                        objectFit: 'contain',
                        cursor: gameStep === 1 && !faucetOn ? 'pointer' : 'default',
                        transition: showSinkPulse 
                          ? 'all 0.5s ease, transform 200ms ease, box-shadow 0.5s ease'
                          : 'transform 200ms ease',
                        position: 'relative',
                        zIndex: 3,
                        transform: showSinkPulse 
                          ? `scale(${sinkPulseScale})`
                          : (gameStep === 1 && !faucetOn ? 'scale(1.06)' : 'scale(1)'),
                        // Add the pulseGlow animation when gameStep is 1 and sink is interactive
                        animation: (gameStep === 1 && !faucetOn) ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
                        '@keyframes pulseGlow': {
                          '0%': { 
                            transform: showSinkPulse ? `scale(${sinkPulseScale})` : 'scale(1.06)',
                            filter: 'brightness(1) drop-shadow(0 0 10px rgba(25, 130, 196, 0.5))'
                          },
                          '50%': { 
                            transform: showSinkPulse ? `scale(${sinkPulseScale * 1.1})` : 'scale(1.12)',
                            filter: 'brightness(1.3) drop-shadow(0 0 20px rgba(25, 130, 196, 0.8))'
                          },
                          '100%': { 
                            transform: showSinkPulse ? `scale(${sinkPulseScale})` : 'scale(1.06)',
                            filter: 'brightness(1) drop-shadow(0 0 10px rgba(25, 130, 196, 0.5))'
                          }
                        },
                        ...(gameStep === 1 && !faucetOn ? {
                          '&:hover': {
                            transform: showSinkPulse ? `scale(${sinkPulseScale * 1.02})` : 'scale(1.06)'
                          }
                        } : {})
                      }}
                    />
                    
                    {/* Warning message when timer reaches 0 */}
                    {showSinkPulse && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '5%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '15px',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          fontFamily: 'Poppins, sans-serif',
                          zIndex: 4,
                          textAlign: 'center',
                          animation: 'fadeInOut 4s infinite',
                          '@keyframes fadeInOut': {
                            '0%': { opacity: 0.7 },
                            '50%': { opacity: 1 },
                            '100%': { opacity: 0.7 }
                          }
                        }}
                      >
                      </Box>
                    )}
                  </Box>
                )}
                
                {/* Render germ blobs over the container (use x/y percent and size px) */}
                {!(isDragging && draggedItem === 'hands-group') && !showWetHands && gameStep < 5 &&
                  germBlobs.filter(b => !b.removed).map(b => (
                    <Box
                      key={b.id}
                      component="img"
                      src={b.image}
                      alt={`germ-${b.id}`}
                      draggable={false}
                      sx={{
                        position: 'absolute',
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.size}px`,
                        height: 'auto',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 6,
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
                      }}
                    />
                  ))
                }

                {/* Left and right hands shown side-by-side during step 1 and step 2 */}
                {/* Left and right hands shown side-by-side during step 1 and step 2 */}
                {(gameStep === 1 || gameStep === 2 || gameStep === 3 || gameStep === 4 || gameStep === 5) && !(isDragging && draggedItem === 'hands-group') && !showWetHands && (
                  <Box
                    // interactive hands wrapper: enable pointer events and start dragging when in step 2 or 5
                    onMouseDown={(gameStep === 2 || gameStep === 5) ? startDragHandsGroup : undefined}
                    onClick={gameStep === 4 ? handleHandRub : undefined}
                    onMouseEnter={gameStep === 4 ? () => setIsHandHovered(true) : undefined}
                    onMouseLeave={gameStep === 4 ? () => setIsHandHovered(false) : undefined}
                    sx={{
                      position: 'absolute',
                      bottom: '0%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 4,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      pointerEvents: (gameStep === 2 || gameStep === 4 || gameStep === 5) ? 'auto' : 'none',
                      cursor: (gameStep === 2 || gameStep === 5) ? 'grab' : (gameStep === 4) ? 'pointer' : 'default',
                      userSelect: 'none',
                      transition: 'all 0.3s ease',
                      transform: gameStep === 4 && isHandHovered ? 'translateX(-50%) scale(1.1)' : 'translateX(-50%) scale(1)',
                      // Add pulse glow effect for step 2, 4, and 5
                      animation: gameStep === 2 ? 'handsPulseGlow 1.5s ease-in-out infinite' : 
                                gameStep === 4 ? 'handsPulseGlowStep4 1.5s ease-in-out infinite' :
                                gameStep === 5 ? 'handsPulseGlowStep5 1.5s ease-in-out infinite' : 'none',
                      '@keyframes handsPulseGlow': {
                        '0%': { 
                          transform: 'translateX(-50%) scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 8px rgba(25, 130, 196, 0.4))'
                        },
                        '50%': { 
                          transform: 'translateX(-50%) scale(1.03)',
                          filter: 'brightness(1.15) drop-shadow(0 0 15px rgba(25, 130, 196, 0.6))'
                        },
                        '100%': { 
                          transform: 'translateX(-50%) scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 8px rgba(25, 130, 196, 0.4))'
                        }
                      },
                      '@keyframes handsPulseGlowStep4': {
                        '0%': { 
                          transform: 'translateX(-50%) scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 8px rgba(76, 175, 80, 0.4))'
                        },
                        '50%': { 
                          transform: 'translateX(-50%) scale(1.05)',
                          filter: 'brightness(1.2) drop-shadow(0 0 15px rgba(76, 175, 80, 0.6))'
                        },
                        '100%': { 
                          transform: 'translateX(-50%) scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 8px rgba(76, 175, 80, 0.4))'
                        }
                      },
                      '@keyframes handsPulseGlowStep5': {
                        '0%': { 
                          transform: 'translateX(-50%) scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 8px rgba(33, 150, 243, 0.4))'
                        },
                        '50%': { 
                          transform: 'translateX(-50%) scale(1.03)',
                          filter: 'brightness(1.15) drop-shadow(0 0 15px rgba(33, 150, 243, 0.6))'
                        },
                        '100%': { 
                          transform: 'translateX(-50%) scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 8px rgba(33, 150, 243, 0.4))'
                        }
                      }
                    }}>
                    {/* Left hand wrapper */}
                    <Box sx={{ 
                      position: 'relative', 
                      width: 400, 
                      height: 'auto', 
                      display: 'inline-block',
                      // Add individual hand glow for step 2, 4, and 5
                      animation: gameStep === 2 ? 'handPulseGlowLeft 1.5s ease-in-out infinite' :
                                gameStep === 4 ? 'handPulseGlowStep4Left 1.5s ease-in-out infinite' :
                                gameStep === 5 ? 'handPulseGlowStep5Left 1.5s ease-in-out infinite' : 'none',
                      '@keyframes handPulseGlowLeft': {
                        '0%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(25, 130, 196, 0.3))'
                        },
                        '50%': { 
                          transform: 'scale(1.02)',
                          filter: 'brightness(1.1) drop-shadow(0 0 12px rgba(25, 130, 196, 0.5))'
                        },
                        '100%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(25, 130, 196, 0.3))'
                        }
                      },
                      '@keyframes handPulseGlowStep4Left': {
                        '0%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(76, 175, 80, 0.3))'
                        },
                        '50%': { 
                          transform: 'scale(1.03)',
                          filter: 'brightness(1.15) drop-shadow(0 0 12px rgba(76, 175, 80, 0.5))'
                        },
                        '100%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(76, 175, 80, 0.3))'
                        }
                      },
                      '@keyframes handPulseGlowStep5Left': {
                        '0%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(33, 150, 243, 0.3))'
                        },
                        '50%': { 
                          transform: 'scale(1.02)',
                          filter: 'brightness(1.1) drop-shadow(0 0 12px rgba(33, 150, 243, 0.5))'
                        },
                        '100%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(33, 150, 243, 0.3))'
                        }
                      }
                    }}>
                      <Box component="img" src={leftHandImg} alt="Left Hand" draggable={false}
                        sx={{ width: '100%', height: 'auto', display: 'block' }} />
                        
                      {/* Only show mud in steps 1-4, not in step 5 */}
                      {gameStep < 5 && (
                        <Box component="img" src={mudImg} alt="Mud on left hand" draggable={false}
                          sx={{
                            position: 'absolute',
                            left: '60%',
                            bottom: '18%',
                            transform: 'translate(-50%, 0)',
                            width: 165,
                            height: 'auto',
                            zIndex: 7,
                            pointerEvents: 'none'
                          }}
                        />
                      )}

                      {/* Bubbles on left hand in step 5 */}
                      {gameStep === 5 && (
                        <>
                          <Box component="img" src={bubbleImg} alt="Bubble"
                            sx={{
                              position: 'absolute',
                              left: '40%',
                              top: '30%',
                              width: 40,
                              height: 'auto',
                              zIndex: 9,
                              pointerEvents: 'none',
                              animation: 'floatBubble 3s ease-in-out infinite',
                              '@keyframes floatBubble': {
                                '0%': { transform: 'translateY(0px) scale(1)' },
                                '50%': { transform: 'translateY(-15px) scale(1.1)' },
                                '100%': { transform: 'translateY(0px) scale(1)' }
                              }
                            }}
                          />
                          <Box component="img" src={bubbleImg} alt="Bubble"
                            sx={{
                              position: 'absolute',
                              left: '60%',
                              top: '50%',
                              width: 35,
                              height: 'auto',
                              zIndex: 9,
                              pointerEvents: 'none',
                              animation: 'floatBubble 2.5s ease-in-out infinite',
                              animationDelay: '0.5s',
                              '@keyframes floatBubble': {
                                '0%': { transform: 'translateY(0px) scale(1)' },
                                '50%': { transform: 'translateY(-12px) scale(1.05)' },
                                '100%': { transform: 'translateY(0px) scale(1)' }
                              }
                            }}
                          />
                        </>
                      )}
                    </Box>

                    {/* Right hand wrapper */}
                    <Box sx={{ 
                      position: 'relative', 
                      width: 400, 
                      height: 'auto', 
                      display: 'inline-block',
                      // Add individual hand glow for step 2, 4, and 5
                      animation: gameStep === 2 ? 'handPulseGlowRight 1.5s ease-in-out infinite' :
                                gameStep === 4 ? 'handPulseGlowStep4Right 1.5s ease-in-out infinite' :
                                gameStep === 5 ? 'handPulseGlowStep5Right 1.5s ease-in-out infinite' : 'none',
                      animationDelay: (gameStep === 2 || gameStep === 4 || gameStep === 5) ? '0.3s' : '0s',
                      '@keyframes handPulseGlowRight': {
                        '0%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(25, 130, 196, 0.3))'
                        },
                        '50%': { 
                          transform: 'scale(1.02)',
                          filter: 'brightness(1.1) drop-shadow(0 0 12px rgba(25, 130, 196, 0.5))'
                        },
                        '100%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(25, 130, 196, 0.3))'
                        }
                      },
                      '@keyframes handPulseGlowStep4Right': {
                        '0%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(76, 175, 80, 0.3))'
                        },
                        '50%': { 
                          transform: 'scale(1.03)',
                          filter: 'brightness(1.15) drop-shadow(0 0 12px rgba(76, 175, 80, 0.5))'
                        },
                        '100%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(76, 175, 80, 0.3))'
                        }
                      },
                      '@keyframes handPulseGlowStep5Right': {
                        '0%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(33, 150, 243, 0.3))'
                        },
                        '50%': { 
                          transform: 'scale(1.02)',
                          filter: 'brightness(1.1) drop-shadow(0 0 12px rgba(33, 150, 243, 0.5))'
                        },
                        '100%': { 
                          transform: 'scale(1)',
                          filter: 'brightness(1) drop-shadow(0 0 6px rgba(33, 150, 243, 0.3))'
                        }
                      }
                    }}>
                      <Box component="img" src={rightHandImg} alt="Right Hand" draggable={false}
                        sx={{ width: '100%', height: 'auto', display: 'block' }} />
                      {/* Only show mud in steps 1-4, not in step 5 */}
                      {gameStep < 5 && (
                        <Box component="img" src={mudImg} alt="Mud on right hand" draggable={false}
                          sx={{
                            position: 'absolute',
                            left: '45%',
                            bottom: '35%',
                            transform: 'translate(-50%, 0)',
                            width: 120,
                            height: 'auto',
                            zIndex: 7,
                            pointerEvents: 'none'
                          }}
                        />
                      )}
                      {/* Show soap only in steps 3-4, not in step 5 */}
                      {soapPlaced && gameStep < 5 && (
                        <Box component="img" src={soapImg} alt="Soap on right hand" draggable={false}
                          sx={{ 
                            position: 'absolute', 
                            left: '40%', 
                            bottom: '28%', 
                            transform: 'translate(-50%, 0)', 
                            width: 130, 
                            height: 'auto', 
                            zIndex: 8, 
                            pointerEvents: 'none',
                            animation: 'soapAppear 0.5s ease-out',
                            '@keyframes soapAppear': {
                              '0%': {
                                transform: 'translate(-50%, 0) scale(0)',
                                opacity: 0
                              },
                              '70%': {
                                transform: 'translate(-50%, 0) scale(1.1)',
                                opacity: 1
                              },
                              '100%': {
                                transform: 'translate(-50%, 0) scale(1)',
                                opacity: 1
                              }
                            }
                          }} 
                        />
                      )}
                      {/* Bubbles on right hand in step 5 */}
                      {gameStep === 5 && (
                        <>
                          <Box component="img" src={bubbleImg} alt="Bubble"
                            sx={{
                              position: 'absolute',
                              left: '35%',
                              top: '35%',
                              width: 45,
                              height: 'auto',
                              zIndex: 9,
                              pointerEvents: 'none',
                              animation: 'floatBubble 3.2s ease-in-out infinite',
                              animationDelay: '0.3s',
                              '@keyframes floatBubble': {
                                '0%': { transform: 'translateY(0px) scale(1)' },
                                '50%': { transform: 'translateY(-18px) scale(1.15)' },
                                '100%': { transform: 'translateY(0px) scale(1)' }
                              }
                            }}
                          />
                          <Box component="img" src={bubbleImg} alt="Bubble"
                            sx={{
                              position: 'absolute',
                              left: '55%',
                              top: '45%',
                              width: 30,
                              height: 'auto',
                              zIndex: 9,
                              pointerEvents: 'none',
                              animation: 'floatBubble 2.8s ease-in-out infinite',
                              animationDelay: '0.8s',
                              '@keyframes floatBubble': {
                                '0%': { transform: 'translateY(0px) scale(1)' },
                                '50%': { transform: 'translateY(-10px) scale(1.08)' },
                                '100%': { transform: 'translateY(0px) scale(1)' }
                              }
                            }}
                          />
                          <Box component="img" src={bubbleImg} alt="Bubble"
                            sx={{
                              position: 'absolute',
                              left: '70%',
                              top: '25%',
                              width: 38,
                              height: 'auto',
                              zIndex: 9,
                              pointerEvents: 'none',
                              animation: 'floatBubble 3.5s ease-in-out infinite',
                              animationDelay: '1.2s',
                              '@keyframes floatBubble': {
                                '0%': { transform: 'translateY(0px) scale(1)' },
                                '50%': { transform: 'translateY(-20px) scale(1.2)' },
                                '100%': { transform: 'translateY(0px) scale(1)' }
                              }
                            }}
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                )}  
              </Box>
            </Box>
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
                  {/* ADDED: Settings Button */}
                  <Box
                    component="img"
                    src={require("../../assets/hygieneLevel1/settingsbtn.png")} // You'll need to add this image or use a different icon
                    alt="Settings"
                    onClick={() => setShowSettings(true)}
                    sx={{
                      width: 70,
                      height: 70,
                      cursor: 'pointer',
                      borderRadius: '50%',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': {
                        transform: 'translateY(-6px) scale(1.25)',
                        width: 85,
                        height: 85,
                        zIndex: 1021,
                        backgroundColor: musicEnabled ? '#1E90FF' : '#777'
                      },
                      '&:active': {
                        transform: 'translateY(-3px) scale(1.1)',
                        width: 78,
                        height: 78
                      }
                    }}
                  >
                  </Box>
                  
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
              Sparkling Clean Hands!
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
                Wash Again
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
                {progressSaving ? 'Saving...' : 'Go to Home'}
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Wet hands popup (temporary image) - shown on top when everything else is hidden */}
        {showWetHands && (
          <Box sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
            pointerEvents: 'none'
          }}>
            <Box
              component="img"
              src={wetHandsImg}
              alt="Wet Hands"
              sx={{
                width: '600px',
                height: 'auto',
                pointerEvents: 'none',
                animation: 'bounceIn 1.2s ease-out',
                '@keyframes bounceIn': {
                  '0%': {
                    transform: 'scale(0.8)',
                    opacity: 0.8
                  },
                  '50%': {
                    transform: 'scale(1.1)'
                  },
                  '70%': {
                    transform: 'scale(0.95)'
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        )}
        {showCleanHands && <CleanHandsDisplay />}

        {/* Render dragged hand at cursor (floating) - only show when not hiding images */}
        {!hideAllImages && isDragging && draggedItem === 'hands-group' && (
          <Box
            sx={{
              position: 'fixed',
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              pointerEvents: 'none',
              zIndex: 1500,
              transform: 'translate(-50%, -50%)',
              opacity: 0.95,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
            }}
          >
            {/* Left hand with mud overlay */}
            <Box sx={{ position: 'relative', width: 350, height: 'auto', display: 'inline-block' }}>
              <Box component="img" src={leftHandImg} alt="drag-left-hand" draggable={false} sx={{ width: '100%', height: 'auto', display: 'block' }} />
              {/* Only show mud in steps 1-4, not in step 5 */}
              {gameStep < 5 && (
                <Box component="img" src={mudImg} alt="drag-mud-left" draggable={false}
                  sx={{
                    position: 'absolute',
                    left: '60%',
                    bottom: '18%',
                    transform: 'translate(-50%, 0)',
                    width: 165,
                    height: 'auto',
                    zIndex: 7,
                    pointerEvents: 'none'
                  }}
                />
              )}
              {/* Bubbles in step 5 */}
              {gameStep === 5 && (
                <>
                  <Box component="img" src={bubbleImg} alt="Bubble"
                    sx={{
                      position: 'absolute',
                      left: '40%',
                      top: '30%',
                      width: 40,
                      height: 'auto',
                      zIndex: 9,
                      pointerEvents: 'none'
                    }}
                  />
                  <Box component="img" src={bubbleImg} alt="Bubble"
                    sx={{
                      position: 'absolute',
                      left: '60%',
                      top: '50%',
                      width: 35,
                      height: 'auto',
                      zIndex: 9,
                      pointerEvents: 'none'
                    }}
                  />
                </>
              )}
            </Box>
            {/* Right hand with mud overlay */}
            <Box sx={{ position: 'relative', width: 350, height: 'auto', display: 'inline-block' }}>
              <Box component="img" src={rightHandImg} alt="drag-right-hand" draggable={false} sx={{ width: '100%', height: 'auto', display: 'block' }} />
              {/* Only show mud in steps 1-4, not in step 5 */}
              {gameStep < 5 && (
                <Box component="img" src={mudImg} alt="drag-mud-right" draggable={false}
                  sx={{
                    position: 'absolute',
                    left: '45%',
                    bottom: '35%',
                    transform: 'translate(-50%, 0)',
                    width: 120,
                    height: 'auto',
                    zIndex: 7,
                    pointerEvents: 'none'
                  }}
                />
              )}
              {/* Show soap only in steps 3-4, not in step 5 */}
              {soapPlaced && gameStep < 5 && (
                <Box component="img" src={soapImg} alt="Soap on right hand" draggable={false}
                  sx={{ position: 'absolute', left: '40%', bottom: '28%', transform: 'translate(-50%, 0)', width: 130, height: 'auto', zIndex: 8, pointerEvents: 'none' }} />
              )}
              {/* Bubbles in step 5 */}
              {gameStep === 5 && (
                <>
                  <Box component="img" src={bubbleImg} alt="Bubble"
                    sx={{
                      position: 'absolute',
                      left: '35%',
                      top: '35%',
                      width: 45,
                      height: 'auto',
                      zIndex: 9,
                      pointerEvents: 'none'
                    }}
                  />
                  <Box component="img" src={bubbleImg} alt="Bubble"
                    sx={{
                      position: 'absolute',
                      left: '55%',
                      top: '45%',
                      width: 30,
                      height: 'auto',
                      zIndex: 9,
                      pointerEvents: 'none'
                    }}
                  />
                  <Box component="img" src={bubbleImg} alt="Bubble"
                    sx={{
                      position: 'absolute',
                      left: '70%',
                      top: '25%',
                      width: 38,
                      height: 'auto',
                      zIndex: 9,
                      pointerEvents: 'none'
                    }}
                  />
                </>
              )}
            </Box>
          </Box>
        )}
        
        {/* keep other dragged-item previews if needed (fallback) */}
        {!hideAllImages && isDragging && (draggedItem === 'left' || draggedItem === 'right') && (
          <Box
            component="img"
            src={draggedItem === 'left' ? leftHandImg : rightHandImg}
            alt={`${draggedItem} hand`}
            sx={{
              position: 'fixed',
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              width: '150px',
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 1500,
              transform: 'translate(-50%, -50%)',
              opacity: 0.9,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}
          />
        )}
      </Container>
    </div>
  );
}