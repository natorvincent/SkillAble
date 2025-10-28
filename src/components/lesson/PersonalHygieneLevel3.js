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
  saveStudentLessonProgress,
} from '../../services/progressService';

// Images - Nail care images
import successGif from "../../assets/hygienelevel1/roblox.gif"
import backgroundImg from "../../assets/hygienelevel3/room.png"

// Hand images
import beforeLeftHand from "../../assets/hygienelevel3/before_lefthand.png"
import beforeRightHand from "../../assets/hygienelevel3/before_righthand.png"
import afterLeftHand from "../../assets/hygienelevel3/after_lefthand.png"
import afterRightHand from "../../assets/hygienelevel3/after_righthand.png"
import nailClipperImg from "../../assets/hygienelevel3/nail_clipper.png"

// Character/Cat images - DIFFERENT CATS FOR EACH STATE
import characterCatDefault from "../../assets/hygienelevel3/cat.png" // Default cat
import characterCatExcited from "../../assets/hygienelevel3/cat_excited.png" // Excited cat for success
import characterCatCurious from "../../assets/hygienelevel3/cat_curious.png" // Curious cat for selection
import characterCatHelpful from "../../assets/hygienelevel3/cat_helpful.png" // Helpful cat for instructions
import characterCatProud from "../../assets/hygienelevel3/cat_proud.png" // Proud cat for completion

// Video files
import nailClippingVideo from "../../assets/hygienelevel3/trim.mp4"

// Audio files
import backgroundMusic from "../../assets/hygienelevel1/background-music.mp3"
import correctSound from "../../assets/hygienelevel1/correct-sound.mp3"
import incorrectSound from "../../assets/hygienelevel1/incorrect-sound.mp3"
import successSound from "../../assets/hygienelevel1/success-sound.mp3"

// Sparkle Animation Component
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

  // Game states
  const [currentStep, setCurrentStep] = useState('hand-selection'); // 'hand-selection', 'tool-introduction', 'first-hand', 'second-hand', 'complete'
  const [selectedHand, setSelectedHand] = useState(null); // 'left' or 'right'
  const [isDraggingClipper, setIsDraggingClipper] = useState(false);
  const [showNailClipper, setShowNailClipper] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [clippingCount, setClippingCount] = useState(0);
  const [completedFirstHand, setCompletedFirstHand] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [showAfterFirstHand, setShowAfterFirstHand] = useState(false);
  const [showToolIntroduction, setShowToolIntroduction] = useState(false); // Tool introduction popup

  // Nail clipper position states (like toothbrush)
  const [nailClipperPosition, setNailClipperPosition] = useState({ x: 0, y: 0 });
  const [originalClipperPosition, setOriginalClipperPosition] = useState({ x: 0, y: 0 });

  // Text-to-Speech states
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeech, setCurrentSpeech] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState([]);

  const gameAreaRef = useRef(null);
  const videoRef = useRef(null);

  // Initialize speech synthesis and load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
      
      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        console.log('Available voices:', voices);
      };
      
      // Some browsers load voices asynchronously
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      }
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    } else {
      console.warn('Speech Synthesis not supported in this browser');
    }
  }, []);

  // Text-to-Speech function with female voice and cheerful tone
  const speakText = (text, rate = 1.1, pitch = 1.3, volume = 0.9) => {
    if (!speechSynthesis || !ttsEnabled) {
      console.log('TTS disabled or not available');
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Cheerful and feminine settings
    utterance.rate = rate; // Slightly faster for more energy
    utterance.pitch = pitch; // Higher pitch for more feminine voice
    utterance.volume = volume; // Clear volume
    
    // Try to find a female voice
    const voices = availableVoices.length > 0 ? availableVoices : speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('zira') ||
      voice.name.toLowerCase().includes('ava') ||
      voice.name.toLowerCase().includes('emma') ||
      voice.name.includes('Google UK English Female') ||
      voice.name.includes('Microsoft Zira Desktop') ||
      voice.name.includes('Samantha') ||
      (voice.lang.includes('en') && !voice.name.toLowerCase().includes('male') && !voice.name.toLowerCase().includes('david'))
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
      console.log('Using female voice:', femaleVoice.name);
    } else if (voices.length > 0) {
      // Fallback to first available voice
      utterance.voice = voices[0];
      console.log('Using default voice:', voices[0].name);
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeech(text);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeech('');
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setCurrentSpeech('');
    };
    
    speechSynthesis.speak(utterance);
  };

  // Stop speech function
  const stopSpeech = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeech('');
    }
  };

  // Toggle TTS on/off
  const toggleTTS = () => {
    if (ttsEnabled) {
      stopSpeech();
    }
    setTtsEnabled(!ttsEnabled);
  };

  // Cheerful narrator messages for different game states
  const narratorMessages = {
    'hand-selection': 'Welcome to Nail Care! This is going to be so much fun! Choose which hand you\'d like to start with - left or right! Go ahead, pick one!',
    'tool-introduction': 'Great! Now let me show you the nail clipper tool. This is what we use to trim our nails and keep them neat and tidy!',
    'first-hand': 'Yay! Great choice! Now, grab the nail clipper and drag it over to your hand. Let\'s make those nails look beautiful and tidy!',
    'second-hand': 'Wow, you\'re doing amazing! First hand looks perfect! Now let\'s give the other hand the same lovely treatment. You\'re a natural at this!',
    'complete': 'Hooray! You did it! Both hands look absolutely wonderful! Your nails are so clean and well-groomed now!',
    'success': 'Fantastic job! You\'ve completed the nail care activity perfectly! Your hands look healthy, clean, and absolutely beautiful!',
    'incorrect': 'Oopsie! Let\'s try that again. Remember to drag the nail clipper right onto the hand. You can do it!',
    'correct': 'Wonderful! You\'re doing it just right! Keep going, you\'re amazing at this!',
    'welcome': 'Hello there! Welcome to our fun nail care adventure! Let\'s learn how to keep our nails healthy and beautiful together!'
  };

  // Speak when game step changes
  useEffect(() => {
    if (currentStep && !showStartScreen) {
      const message = narratorMessages[currentStep];
      if (message) {
        // Small delay to ensure UI is updated
        setTimeout(() => {
          speakText(message);
        }, 800);
      }
    }
  }, [currentStep, showStartScreen]);

  // Speak when clipping count changes
  useEffect(() => {
    if (currentStep === 'first-hand' || currentStep === 'second-hand') {
      if (clippingCount === 1) {
        speakText('Great start! First nail done! Only four more to go!');
      } else if (clippingCount === 2) {
        speakText('Two nails trimmed! You\'re moving right along!');
      } else if (clippingCount === 3) {
        speakText('Three nails looking perfect! You\'re halfway there!');
      } else if (clippingCount === 4) {
        speakText('Almost there! Just one more nail to go! You\'re doing fantastic!');
      } else if (clippingCount === 5) {
        speakText('Perfect! All five nails are beautifully trimmed! Wonderful job!');
      }
    }
  }, [clippingCount, currentStep]);

  const handleStartGame = () => {
    setShowStartScreen(false);
    setCurrentStep('hand-selection');
    // Speak welcome message when game starts
    setTimeout(() => {
      speakText(narratorMessages.welcome);
    }, 1000);
  };

  const resetGame = () => {
    setShowFeedback(false);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    
    // Reset all game states
    setCurrentStep('hand-selection');
    setSelectedHand(null);
    setClippingCount(0);
    setCompletedFirstHand(false);
    setShowNailClipper(false);
    setIsDraggingClipper(false);
    setShowVideo(false);
    setShowAfterFirstHand(false);
    setShowToolIntroduction(false); // Reset tool introduction
    
    // Stop any ongoing speech
    stopSpeech();
    
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
    // Stop speech when leaving
    stopSpeech();
    navigate('/homepage');
  };

  const getStudentId = () => {
    const studentId = localStorage.getItem('studentId');
    const userType = localStorage.getItem('userType');
    
    console.log("Getting student ID - Type:", userType, "ID:", studentId);
    
    if (userType !== 'STUDENT') {
      console.error('User is not a student:', userType);
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

  const handleHandSelection = (hand) => {
    setSelectedHand(hand);
    // Show tool introduction first before going to first-hand
    setCurrentStep('tool-introduction');
    setShowToolIntroduction(true);
    
    // Speak selection confirmation
    speakText(`You selected the ${hand} hand. Excellent choice! Now let me show you the tool we'll be using.`);
  };

  // Handle tool introduction completion
  const handleToolIntroductionComplete = () => {
    setShowToolIntroduction(false);
    setCurrentStep('first-hand');
    setShowNailClipper(true);
    
    // Set initial position for nail clipper beside the hand
    const clipperPosition = { x: 25, y: 50 }; // Left side of the hand
    setNailClipperPosition(clipperPosition);
    setOriginalClipperPosition(clipperPosition);
    
    // Speak next instruction
    speakText(narratorMessages['first-hand']);
  };

  const handleNailClipperMouseDown = (e) => {
    if (!showNailClipper || showVideo) return;
    
    // PREVENT BLUE HIGHLIGHT - Add these lines
    e.preventDefault();
    e.stopPropagation();
    
    setIsDraggingClipper(true);
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDraggingClipper || !gameAreaRef.current || showVideo) return;
    
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    if (!isDraggingClipper || showVideo) return;
    
    setIsDraggingClipper(false);
    
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;
    
    const rect = gameArea.getBoundingClientRect();
    const dropX = ((e.clientX - rect.left) / rect.width) * 100;
    const dropY = ((e.clientY - rect.top) / rect.height) * 100;
    
    // DEBUG: Log coordinates and current hand info
    console.log('Drop coordinates:', { 
      dropX, 
      dropY, 
      currentStep, 
      selectedHand,
      isFirstHand: currentStep === 'first-hand',
      isSecondHand: currentStep === 'second-hand',
      currentHand: currentStep === 'first-hand' ? selectedHand : (selectedHand === 'left' ? 'right' : 'left')
    });
    
    // Define hand areas
    const leftHandArea = {
      x: 35, y: 25, width: 30, height: 60
    };
    
    const rightHandArea = {
      x: 35, y: 25, width: 30, height: 60
    };
    
    let handArea;
    if (currentStep === 'first-hand') {
      handArea = selectedHand === 'left' ? leftHandArea : rightHandArea;
    } else if (currentStep === 'second-hand') {
      handArea = selectedHand === 'left' ? rightHandArea : leftHandArea;
    }
    
    const isOnHand = dropX >= handArea.x && 
                    dropX <= handArea.x + handArea.width &&
                    dropY >= handArea.y && 
                    dropY <= handArea.y + handArea.height;
    
    console.log('Is on hand:', isOnHand, 'Hand area:', handArea);
    
    if (isOnHand) {
      setShowVideo(true);
      playSoundEffect('correct');
      speakText('Perfect! You\'re trimming the nails just right! Keep up the great work!');
      
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else {
      playSoundEffect('incorrect');
      speakText('Almost! Remember to drag the clipper right onto the hand. Let\'s try that again!');
    }
    
    setNailClipperPosition(originalClipperPosition);
  };

  const handleVideoNext = () => {
    setShowVideo(false);
    setClippingCount(prev => prev + 1);
    setScore(prev => Math.min(100, prev + 10));
    
    // Check if 5 clips completed
    if (clippingCount + 1 >= 5) {
      if (currentStep === 'first-hand') {
        // Show after hand with sparkles for 3 seconds before switching
        setShowAfterFirstHand(true);
        speakText('Amazing! First hand is all done and looking beautiful! Check out those sparkly clean nails!');
        
        setTimeout(() => {
          setShowAfterFirstHand(false);
          setCompletedFirstHand(true);
          setCurrentStep('second-hand');
          setClippingCount(0);
          
          // Reset nail clipper position for second hand - BESIDE THE HAND (same as first hand)
          const clipperPosition = { x: 25, y: 50 }; // Left side of the hand
          setNailClipperPosition(clipperPosition);
          setOriginalClipperPosition(clipperPosition);
          
          // Speak transition message
          speakText('Fantastic! Now let\'s work on the other hand! You\'re doing so well!');
        }, 3000);
      } else {
        completeGame();
      }
    }
  };

  const completeGame = () => {
    setScore(100);
    setGameCompleted(true);
    playSoundEffect('success');
    speakText('Hooray! You did it! Both hands are perfectly groomed! You should be so proud of yourself!');
    setTimeout(() => {
      setShowSuccess(true);
    }, 1000);
  };

  const getCurrentInstruction = () => {
    switch (currentStep) {
      case 'hand-selection':
        return 'Select a hand to start trimming nails';
      case 'tool-introduction':
        return 'Learn about the nail clipper tool';
      case 'first-hand':
        return `Drag the nail clipper to the hand to trim nails (${clippingCount}/5)`;
      case 'second-hand':
        return `Drag the nail clipper to the other hand to trim nails (${clippingCount}/5)`;
      case 'complete':
        return 'Great job! All nails are trimmed.';
      default:
        return 'Complete the nail care activity';
    }
  };

  const getProgressPercentage = () => {
    const totalClips = 10; // 5 per hand
    const completedClips = (completedFirstHand ? 5 : 0) + clippingCount;
    return (completedClips / totalClips) * 100;
  };

  // FIXED: Proper progress saving function
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        setProgressSaving(false);
        return;
      }
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: score,
        maxScore: 100,
        completed: true,
        starsEarned: getStarRating(),
        // Add moduleId if needed by your backend
        moduleId: moduleId ? parseInt(moduleId, 10) : null
      };
      
      console.log('Saving progress for student:', studentId, progressData);
      const result = await saveStudentLessonProgress(studentId, lessonId, progressData);
      
      console.log('Progress saved successfully!', result);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
      // Optionally show error message to user
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
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    if (audioRef) {
      audioRef.pause();
      setAudioPlaying(false);
    }
    
    // Stop speech when continuing
    stopSpeech();
    
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  // FIXED: Proper progress loading on component mount
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
          
          // If already completed, show success screen
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

  // FIXED: Proper lesson data loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set lesson data directly
        setLesson({
          id: lessonId || 1,
          title: "Nail Care",
          description: "Learn proper nail care technique!",
          level: 3 // Make sure this matches your level
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
      // Clean up speech synthesis
      stopSpeech();
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

  // Get appropriate character message based on game state
  const getCharacterMessage = () => {
    switch (currentStep) {
      case 'hand-selection':
        return 'Choose a hand to start! 🐾';
      case 'tool-introduction':
        return 'This is the nail clipper! ✂️';
      case 'first-hand':
        return `Keep going! ${clippingCount}/5 nails done!`;
      case 'second-hand':
        return `Almost there! ${clippingCount}/5 nails done!`;
      case 'complete':
        return 'You did it! Amazing job! 🎉';
      default:
        return 'Let\'s trim those nails!';
    }
  };

  // Character/Cat Component with different images for each state
  const CharacterCat = () => {
    // Get appropriate cat image based on game state
    const getCatImage = () => {
      switch (currentStep) {
        case 'hand-selection':
          return characterCatCurious; // Curious cat for selection phase
        case 'tool-introduction':
          return characterCatHelpful; // Helpful cat showing tools
        case 'first-hand':
        case 'second-hand':
          return characterCatHelpful; // Helpful cat during gameplay
        case 'complete':
          return characterCatProud; // Proud cat for completion
        default:
          return characterCatDefault; // Default cat
      }
    };

    // Get appropriate animation based on game state
    const getCatAnimation = () => {
      switch (currentStep) {
        case 'hand-selection':
          return 'bounce 2s ease-in-out infinite'; // Bounce for excitement
        case 'tool-introduction':
          return 'tilt 3s ease-in-out infinite'; // Tilt for curiosity
        case 'first-hand':
        case 'second-hand':
          return 'float 3s ease-in-out infinite'; // Float for calm guidance
        case 'complete':
          return 'celebrate 2s ease-in-out infinite'; // Celebrate for success
        default:
          return 'float 3s ease-in-out infinite';
      }
    };

    return (
      <Box
        sx={{
          position: 'fixed',
          left: 20, // Position on left side
          bottom: 20, // Position near bottom
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
            width: 120, // Adjust size as needed
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
        {/* Speech bubble */}
        <Paper
          sx={{
            position: 'absolute',
            top: -80,
            left: 140,
            backgroundColor: 'white',
            color: '#280B60',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '500',
            maxWidth: '150px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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
          {getCharacterMessage()}
        </Paper>
      </Box>
    );
  };

  // Tool Introduction Popup Component with Cat
  const ToolIntroductionPopup = () => (
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
      {/* Centered Nail Clipper */}
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
          maxWidth: '600px', // Increased width to accommodate cat
          width: '90%',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          border: '3px solid #90BE6D',
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }}
      >
        {/* Cat on left side - using helpful cat for tool introduction */}
        <Box
          component="img"
          src={characterCatDefault} // Specific cat for tool introduction
          alt="Cute Cat Helper"
          sx={{
            width: 80,
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
            Used to trim your nails and keep them neat and healthy!
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleToolIntroductionComplete}
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

  // Render game content based on current step
  const renderGameContent = () => {
    // Show tool introduction popup
    if (showToolIntroduction) {
      return <ToolIntroductionPopup />;
    }

    if (showVideo) {
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
        
        {/* Smaller video container */}
        <Box sx={{
          width: '60%', // Adjust width as needed
          maxWidth: 500, // Maximum size
          minWidth: 300, // Minimum size
          height: 'auto',
          aspectRatio: '16/9', // Maintain video aspect ratio
          backgroundColor: 'black',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '3px solid #90BE6D'
        }}>
          <Box
            component="video"
            ref={videoRef}
            src={nailClippingVideo}
            autoPlay
            loop
            muted
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </Box>
        
        {/* Instruction text above video */}
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 'bold',
            mt: 3,
            mb: 2,
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          Watch how to trim nails properly! ✂️
        </Typography>
        
        <Button
          variant="contained"
          onClick={handleVideoNext}
          sx={{
            mt: 2,
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
    );
  }
    // Show after hand with sparkles when first hand is completed
    if (showAfterFirstHand) {
      return (
        <Box sx={{ position: 'relative', width: '100%', height: 600, mt: 7 }}>
          {/* Show after image of completed first hand with sparkles */}
          <Box
            component="img"
            src={selectedHand === 'left' ? afterLeftHand : afterRightHand}
            alt="Completed Hand"
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
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              backgroundColor: 'rgba(144, 190, 109, 0.8)',
              px: 4,
              py: 2,
              borderRadius: '20px',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            ✨ First Hand Completed! ✨
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
        return (
          <Box sx={{ position: 'relative', width: '100%', height: 600, mt: 7 }}>
            {/* Show only the selected hand centered */}
            <Box
              component="img"
              src={selectedHand === 'left' ? beforeLeftHand : beforeRightHand}
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

            {/* Nail clipper - positioned beside hand like toothbrush */}
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
                  // PREVENT BLUE HIGHLIGHT - Add these styles
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

      case 'second-hand':
        return (
          <Box sx={{ position: 'relative', width: '100%', height: 600, mt: 7 }}>
            {/* Show only the second hand centered */}
            <Box
              component="img"
              src={selectedHand === 'left' ? beforeRightHand : beforeLeftHand}
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

            {/* Nail clipper - positioned BESIDE THE HAND for second hand (same as first hand) */}
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
                  // PREVENT BLUE HIGHLIGHT - Add these styles
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
              Congratulations! You've completed nail care!
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              <Box
                component="img"
                src={afterLeftHand}
                alt="Trimmed Left Hand"
                sx={{ width: 350, height: 350, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
              />
              <Box
                component="img"
                src={afterRightHand}
                alt="Trimmed Right Hand"
                sx={{ width: 350, height: 350, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  // Start screen
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
            Nail Care
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
            Learn how to take care of your nails properly!
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
        backgroundImage: `url(${backgroundImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        // PREVENT BLUE HIGHLIGHT - Add this style to main container
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      
      <Container maxWidth="xl" sx={{ py: 1 }}>
        {/* Progress bar and instructions */}
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

        {/* Character/Cat Component with different images for each state */}
        {!showStartScreen && !showToolIntroduction && !showVideo && !showAfterFirstHand && <CharacterCat />}

        {/* Action buttons */}
        <Box sx={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Button 
            variant="contained"
            onClick={resetGame}
            sx={{ 
              background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              width: 64,
              height: 64,
              minWidth: 64,
              borderRadius: '12px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.25rem',
              textTransform: 'none',
              boxShadow: '0 8px 18px rgba(255, 89, 94, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label="Reset"
          >
            🔄
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleGoHome}
            sx={{ 
              background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
              color: 'white',
              width: 64,
              height: 64,
              minWidth: 64,
              borderRadius: '12px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.25rem',
              textTransform: 'none',
              boxShadow: '0 8px 18px rgba(25, 130, 196, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label="Home"
          >
            🏠
          </Button>
        </Box>

        {/* Audio and TTS Controls */}
        <Box sx={{ 
          position: 'fixed',
          top: 100,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* TTS Toggle Button */}
          <Tooltip title={ttsEnabled ? "Turn off cheerful narrator" : "Turn on cheerful narrator"}>
            <IconButton
              onClick={toggleTTS}
              sx={{
                minWidth: '60px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: ttsEnabled 
                  ? 'linear-gradient(135deg, #FF69B4 0%, #FF1493 100%)'
                  : 'linear-gradient(135deg, #6A6A6A 0%, #4A4A4A 100%)',
                color: 'white',
                fontSize: '1.5rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                }
              }}
            >
              {ttsEnabled ? '👩‍🏫' : '🔇'}
            </IconButton>
          </Tooltip>

          {/* Background Music Toggle */}
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

        {/* Game Area */}
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

        {/* Dragging nail clipper preview - like toothbrush */}
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
              // PREVENT BLUE HIGHLIGHT - Add these styles
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          />
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
              Perfect Nail Care!
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
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              color: 'white',
              mb: 3,
              fontFamily: 'Poppins, sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Score: {score}/100
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Great job! Your nails look healthy and well-maintained!
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
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
}