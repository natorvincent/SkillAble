// HouseholdLevel3.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Fab,
  Slider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import { useParams } from 'react-router-dom'; 
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ExpandIcon from '@mui/icons-material/Expand';

// Import progress service
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Import all assets
import sponge from "../../assets/householdLevel3/sponge.png";
import dishLiquid from "../../assets/householdLevel3/dishwashingliquid.png";
import sink from "../../assets/householdLevel3/sink.png";
import sinkWithWater from "../../assets/householdLevel3/sinkwithwater.png";
import glass from "../../assets/householdLevel3/glass.png";
import spoon from "../../assets/householdLevel3/spoon.png";
import plate from "../../assets/householdLevel3/plate.png";
import fork from "../../assets/householdLevel3/fork.png";
import pot from "../../assets/householdLevel3/pot.png";
import cleanGlass from "../../assets/householdLevel3/cleanglass.png";
import cleanSpoon from "../../assets/householdLevel3/cleanspoon.png";
import cleanFork from "../../assets/householdLevel3/cleanfork.png";
import cleanPlate from "../../assets/householdLevel3/cleanplate.png";
import cleanPot from "../../assets/householdLevel3/cleanpot.png";
import dogmascot from "../../assets/householdLevel3/dogmascot.png";
import kitchenbg3 from "../../assets/householdLevel3/kitchenbg3.jpg";

// Import sound effects
import runningFaucetSound from "../../assets/householdLevel3/runningfaucetsound.mp3";
import backgroundMusic from "../../assets/householdLevel3/background-music.mp3";
import correctSound from "../../assets/householdLevel3/correct-sound.mp3";
import incorrectSound from "../../assets/householdLevel3/incorrect-sound.mp3";
import scrubbingSound from "../../assets/householdLevel3/scrubbingsound.mp3";
import successSound from "../../assets/householdLevel3/drum-success-sound.mp3";

// Page constants
const PAGES = {
  LANDING: 'landing',
  GAME: 'game'
};

// Game data
const washingOrder = [
  { id: 1, name: "Glass", dirty: glass, clean: cleanGlass, type: "glass" },
  { id: 2, name: "Spoon", dirty: spoon, clean: cleanSpoon, type: "utensil" },
  { id: 3, name: "Fork", dirty: fork, clean: cleanFork, type: "utensil" },
  { id: 4, name: "Plate", dirty: plate, clean: cleanPlate, type: "plate" },
  { id: 5, name: "Pot", dirty: pot, clean: cleanPot, type: "pot" }
];

// Scoring constants
const MAX_POSSIBLE_SCORE = 100;

export default function HouseholdLevel3() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  
  // Voice feature state
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Game page state
  const [currentStep, setCurrentStep] = useState(0);
  const [gameState, setGameState] = useState({
    spongeHasSoap: false,
    dishesPlaced: [],
    dishesCleaned: [],
    dishesOnRack: [],
    dishScores: {},
    faucetOn: false,
    currentDishRinsing: null
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Progress saving state
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const [draggingSoap, setDraggingSoap] = useState(false);
  const [spongeActive, setSpongeActive] = useState(false);
  const [scrubbingDish, setScrubbingDish] = useState(null);
  const [scrubProgress, setScrubProgress] = useState(0);

  // ADD MASCOT STATE
  const [mascotVisible, setMascotVisible] = useState(false);
  const [mascotMessage, setMascotMessage] = useState("");

  // ADD DIALOG STATE
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showHomeDialog, setShowHomeDialog] = useState(false);
  const [showTipDialog, setShowTipDialog] = useState(false);
  const [showIntroDialog, setShowIntroDialog] = useState(false);

  // NEW: Settings and Tutorial State
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState({
    background: 50,
    voice: 80,
    effects: 70
  });
  const [previousVolume, setPreviousVolume] = useState({
    background: 50,
    voice: 80,
    effects: 70
  });
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialTimeout, setTutorialTimeout] = useState(null);

  // ADD SOUND REFS
  const faucetSoundRef = useRef(null);
  const backgroundMusicRef = useRef(null);
  const correctSoundRef = useRef(null);
  const incorrectSoundRef = useRef(null);
  const scrubbingSoundRef = useRef(null);
  const successSoundRef = useRef(null);

  // NEW: Track if intro has been spoken
  const [introSpoken, setIntroSpoken] = useState(false);

  const getNextExpectedDish = () => {
    const remainingDishes = washingOrder.filter(dish => getDishStatus(dish.id) !== 'completed');
    return remainingDishes[gameState.dishesPlaced.length];
  };

  const steps = [
    "Add dish liquid to sponge",
    "Place dirty dishes in sink in correct order",
    "Turn on faucet to rinse",
    "Scrub each dish with sponge", 
    "Rinse off soap",
    "Move clean dishes to drying rack"
  ];

  const progressPercentage = ((currentStep + (gameCompleted ? 1 : 0)) / steps.length) * 100;
  const { lessonId, moduleId } = useParams();

  // Sound functions
  const playCorrectSound = () => {
    if (correctSoundRef.current && soundEnabled) {
      correctSoundRef.current.volume = volume.effects / 100;
      correctSoundRef.current.currentTime = 0;
      correctSoundRef.current.play().catch(e => console.log('Correct sound play failed:', e));
    }
  };

  const playIncorrectSound = () => {
    if (incorrectSoundRef.current && soundEnabled) {
      incorrectSoundRef.current.volume = volume.effects / 100;
      incorrectSoundRef.current.currentTime = 0;
      incorrectSoundRef.current.play().catch(e => console.log('Incorrect sound play failed:', e));
    }
  };

  const playScrubbingSound = () => {
    if (scrubbingSoundRef.current && soundEnabled) {
      scrubbingSoundRef.current.volume = volume.effects / 100;
      scrubbingSoundRef.current.currentTime = 0;
      scrubbingSoundRef.current.play().catch(e => console.log('Scrubbing sound play failed:', e));
    }
  };

  const stopScrubbingSound = () => {
    if (scrubbingSoundRef.current) {
      scrubbingSoundRef.current.pause();
    }
  };

  // NEW: Handle sound toggle with volume control
  const handleSoundToggle = (enabled) => {
    if (enabled) {
      // Turning sound on - restore previous volumes
      setSoundEnabled(true);
      setVolume(previousVolume);
    } else {
      // Turning sound off - store current volumes and set to 0
      setPreviousVolume(volume);
      setSoundEnabled(false);
      setVolume({
        background: 0,
        voice: 0,
        effects: 0
      });
      
      // Stop all sounds immediately
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
      stopSpeech();
    }
  };

  // Initialize background music
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = volume.background / 100;
      backgroundMusicRef.current.loop = true;
      if (currentPage === PAGES.GAME && soundEnabled && !showTutorial) {
        backgroundMusicRef.current.play().catch(e => console.log('Background music play failed:', e));
      }
    }
  }, [currentPage, soundEnabled, showTutorial, volume.background]);

  // Show intro dialog when game starts
  useEffect(() => {
    if (currentPage === PAGES.GAME && !introSpoken) {
      setShowIntroDialog(true);
      setMascotMessage("Hi there! My name is Kitchi! I am your guide for washing dishes.");
      
      // Speak intro after a short delay to ensure dialog is rendered
      const timer = setTimeout(() => {
        if (voiceEnabled && soundEnabled && !introSpoken) {
          // Stop any current speech first
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
          
          speakText("Hi there! My name is Kitchi! I am your guide for washing dishes.");
          setIntroSpoken(true);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, voiceEnabled, soundEnabled, introSpoken]);

  // Get student ID from localStorage
  const getStudentId = () => {
    try {
      const studentId = localStorage.getItem('studentId');
      
      console.log('Retrieving student ID:', { studentId });
      
      // Check if we have a valid student ID
      if (!studentId || studentId === 'null' || studentId === 'undefined') {
        console.warn('No student ID found');
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

  const getStepMessage = (step, includeDishName = true) => {
    switch(step) {
      case 0:
        return "Let's start! First, drag the soap to the sponge to activate it";
      case 1:
        const nextDish = getNextExpectedDish();
        const dishPart = includeDishName ? `${nextDish?.name || 'next dish'} ` : '';
        return `Now drag ${dishPart}to the sink in correct order: Glass → Spoon → Fork → Plate → Pot`;
      case 2:
        return "Great! Click the sink to turn on faucet and rinse the dish";
      case 3:
        return "Perfect! Drag the sponge to the dish and hold to scrub";
      case 4:
        return "Almost done! Click the sink again to rinse off soap";
      case 5:
        return "Final step! Drag clean dishes to the drying rack";
      default:
        return "Let's continue washing dishes!";
    }
  };

  // Fetch user progress when lessonId changes
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
          if (progressResponse.completed) {
            setFeedbackMessage("Great job! You finished this before. Want to try again?");
            setShowFeedback(true);
          }
        } else {
          console.log('No existing progress found, starting fresh');
          setScore(0);
        }
      } catch (error) {
        console.log('Error fetching progress (starting fresh):', error);
        setScore(0);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  useEffect(() => {
    const saveProgressOnComplete = async () => {
      if (gameCompleted && !progressSaved && !progressSaving) {
        console.log('Game completed, auto-saving progress...');
        await saveProgress();
      }
    };
    
    saveProgressOnComplete();
  }, [gameCompleted, progressSaved, progressSaving]);

  // Page navigation handlers
  const goToGame = () => {
    setCurrentPage(PAGES.GAME);
  };
  const goToHome = () => navigate('/homepage');

  // Voice feature handlers
  const speakText = (text) => {
    if (!voiceEnabled || !soundEnabled) {
      return;
    }

    // Stop any current speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.rate = 0.8;
    speech.pitch = 1.2;
    speech.volume = volume.voice / 100;

    speech.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeech(speech);
    };

    speech.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };

    speech.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };

    window.speechSynthesis.speak(speech);
  };

  const stopSpeech = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
    }
  };


  // NEW: Tutorial steps configuration
  const tutorialSteps = [
    {
      highlight: "progress",
      message: "This shows your current step in the dishwashing process. You'll see your progress as you complete each step!",
      voice: "This shows your current step in the dishwashing process. You'll see your progress as you complete each step!"
    },
    {
      highlight: "score",
      message: "Your current score is shown here. You earn points for completing each step correctly!",
      voice: "Your current score is shown here. You earn points for completing each step correctly!"
    },
    {
      highlight: "drying-rack",
      message: "This is the drying rack where you'll place clean dishes after washing them. Drag clean dishes here in the final step!",
      voice: "This is the drying rack where you'll place clean dishes after washing them. Drag clean dishes here in the final step!"
    },
    {
      highlight: "tools",
      message: "These are your tools! The soap activates the sponge, and the sponge is used to scrub dishes clean.",
      voice: "These are your tools! The soap activates the sponge, and the sponge is used to scrub dishes clean."
    },
    {
      highlight: "sink",
      message: "This is the sink where you'll place dirty dishes and rinse them with water. Click the sink to turn on the faucet!",
      voice: "This is the sink where you'll place dirty dishes and rinse them with water. Click the sink to turn on the faucet!"
    },
    {
      highlight: "dirty-dishes",
      message: "These are the dirty dishes you need to wash. Drag them to the sink in the correct order: Glass, Spoon, Fork, Plate, then Pot.",
      voice: "These are the dirty dishes you need to wash. Drag them to the sink in the correct order: Glass, Spoon, Fork, Plate, then Pot."
    },
    {
      highlight: "settings",
      message: "The settings button lets you control sound volumes and access game options. Now let's start washing dishes!",
      voice: "The settings button lets you control sound volumes and access game options. Now let's start washing dishes!"
    }
  ];

  // NEW: Start tutorial
  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
    setShowIntroDialog(false);
    setMascotVisible(true);
    
    // Stop background music during tutorial
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
    
    // Start first tutorial step
    speakTutorialStep(0);
  };

  // NEW: Speak tutorial step
  const speakTutorialStep = (step) => {
    if (step < tutorialSteps.length) {
      setMascotMessage(tutorialSteps[step].message);
      speakText(tutorialSteps[step].voice);
    }
  };

  const handleNextTutorial = () => {
    if (tutorialTimeout) clearTimeout(tutorialTimeout);
    const nextStep = tutorialStep + 1;
    if (nextStep < tutorialSteps.length) {
      setTutorialStep(nextStep);
      speakTutorialStep(nextStep);
    } else {
      endTutorial();
    }
  };

  const handlePreviousTutorial = () => {
    if (tutorialTimeout) clearTimeout(tutorialTimeout);
    const prevStep = tutorialStep - 1;
    if (prevStep >= 0) {
      setTutorialStep(prevStep);
      speakTutorialStep(prevStep);
    }
  };

  const endTutorial = () => {
    setShowTutorial(false);
    
    // Restart background music
    if (backgroundMusicRef.current && soundEnabled) {
      backgroundMusicRef.current.play().catch(e => console.log('Background music restart failed:', e));
    }
    
  };

  // UPDATED: Speak instructions when step changes - only after intro is done
  useEffect(() => {
    if (currentPage === PAGES.GAME && !showIntroDialog && introSpoken && !showTutorial) {
      const newMessage = getStepMessage(currentStep, true);
      setMascotMessage(newMessage);
      
      if (voiceEnabled && soundEnabled) {
        // Use a small delay to ensure smooth transition
        const timer = setTimeout(() => {
          speakText(newMessage);
        }, 300);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentStep, currentPage, showIntroDialog, voiceEnabled, soundEnabled, introSpoken, showTutorial]);

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      // Clean up sounds
      if (faucetSoundRef.current) {
        faucetSoundRef.current.pause();
        faucetSoundRef.current = null;
      }
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
        backgroundMusicRef.current = null;
      }
      if (scrubbingSoundRef.current) {
        scrubbingSoundRef.current.pause();
        scrubbingSoundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gameCompleted) {
      // Stop background music
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
      
      // Play success sound if not already playing
      if (successSoundRef.current && soundEnabled) {
        successSoundRef.current.volume = volume.effects / 100;
        successSoundRef.current.currentTime = 0;
        successSoundRef.current.play().catch(e => console.log('Success sound play failed:', e));
      }
      
    }
  }, [gameCompleted, soundEnabled, volume.effects]);

  // Progress saving function
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      const lessonIdNum = parseInt(lessonId, 10);
      
      console.log('Saving progress with:', { studentId, lessonId: lessonIdNum });
      
      if (!studentId || !lessonIdNum) {
        throw new Error(`Missing IDs: studentId=${studentId}, lessonId=${lessonIdNum}`);
      }
      
      const cappedScore = Math.min(score, 100);
      const finalScore = cappedScore;
      
      const progressData = {
        score: finalScore,
        maxScore: 100,
        completed: true,
        starsEarned: getStarRating(),
        moduleId: moduleId ? parseInt(moduleId, 10) : null
      };
      
      console.log('Attempting to save progress with data:', {
        studentId,
        lessonId: lessonIdNum,
        ...progressData
      });
      
      const result = await saveStudentLessonProgress(studentId, lessonIdNum, progressData);
      
      console.log('Progress save result:', result);
      
      if (result.success || result.queued) {
        setProgressSaved(true);
        console.log('Progress saved or queued successfully');
      } else {
        throw new Error('Progress save failed');
      }
      
    } catch (error) {
      console.error('Error in save progress process:', error);
      setProgressSaved(false);
    } finally {
      setProgressSaving(false);
    }
  };

  // Star rating calculation
  const getStarRating = () => {
    const percentage = (Math.min(score, MAX_POSSIBLE_SCORE) / MAX_POSSIBLE_SCORE) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // FAUCET FUNCTIONS
  const handleFaucetClick = () => {
    if (currentStep === 2 || currentStep === 4) {
      // Turn on faucet
      setGameState(prev => ({ ...prev, faucetOn: true }));
      
      // Play faucet sound
      if (faucetSoundRef.current && soundEnabled) {
        faucetSoundRef.current.volume = volume.effects / 100;
        faucetSoundRef.current.currentTime = 0;
        faucetSoundRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
      
      // Set timer to turn off faucet
      setTimeout(() => {
        setGameState(prev => ({ ...prev, faucetOn: false }));
        if (faucetSoundRef.current) {
          faucetSoundRef.current.pause();
        }
        
        // Advance game step after faucet completes
        if (currentStep === 2) {
          setCurrentStep(3); // Move to scrubbing step
        } else if (currentStep === 4) {
          setCurrentStep(5); // Move to rack step
        }
      }, 3000); // 3 second timer
    }
  };

  // Game page handlers
  const handleSpongeClick = () => {
    if (currentStep === 0) {
      setGameState(prev => ({ ...prev, spongeHasSoap: true }));
      setSpongeActive(true);
      playCorrectSound();
      setCurrentStep(1);
    }
  };

  const handleDishDrop = (dish) => {
    // Don't allow placing dishes that are already completed
    if (getDishStatus(dish.id) === 'completed') {
      return;
    }

    if (currentStep === 1) {
      // Get the next expected dish - filter out completed dishes first
      const remainingDishes = washingOrder.filter(dishItem => getDishStatus(dishItem.id) !== 'completed');
      const expectedDish = remainingDishes[gameState.dishesPlaced.length];
      
      if (!expectedDish) {
        console.log('No more dishes to place');
        return;
      }
      
      if (dish.id === expectedDish.id) {
        const newDishesPlaced = [...gameState.dishesPlaced, dish];
        
        const placementPoints = 5;
        const newScore = Math.min(score + placementPoints, MAX_POSSIBLE_SCORE);
        
        setGameState(prev => ({ 
          ...prev, 
          dishesPlaced: newDishesPlaced,
          dishScores: {
            ...prev.dishScores,
            [dish.id]: (prev.dishScores[dish.id] || 0) + placementPoints
          }
        }));
        
        setScore(newScore);
        playCorrectSound();
        setCurrentStep(2); // Move to faucet step
      } else {
        console.log(`Wrong dish! Expected ${expectedDish.name} but got ${dish.name}`);
        playIncorrectSound();
        // Provide feedback for wrong order
        setFeedbackMessage(`Wrong order! You should place ${expectedDish.name} next. Remember: Glass → Spoon → Fork → Plate → Pot`);
        setShowTipDialog(true);
        if (voiceEnabled && soundEnabled) {
          speakText(`Wrong order! You should place ${expectedDish.name} next. Remember: Glass, then Spoon, then Fork, then Plate, then Pot`);
        }
      }
    }
  };

  const handleScrubComplete = (dishId) => {
    if (currentStep === 3 && gameState.spongeHasSoap) {
      const dish = washingOrder.find(d => d.id === dishId);
      if (dish && !gameState.dishesCleaned.includes(dishId)) {
        const scrubPoints = 5;
        const newScore = Math.min(score + scrubPoints, MAX_POSSIBLE_SCORE);
        
        setGameState(prev => ({
          ...prev,
          dishesCleaned: [...prev.dishesCleaned, dishId],
          dishScores: {
            ...prev.dishScores,
            [dishId]: (prev.dishScores[dishId] || 0) + scrubPoints
          }
        }));
        
        setScore(newScore);
        playCorrectSound();
        stopScrubbingSound();
        setCurrentStep(4); // Move to rinse step
      }
    }
  };

  const handleScrubStart = (dishId) => {
    if (currentStep === 3 && spongeActive) {
      setScrubbingDish(dishId);
      setScrubProgress(0);
      playScrubbingSound();
      
      const scrubInterval = setInterval(() => {
        setScrubProgress(prev => {
          if (prev >= 100) {
            clearInterval(scrubInterval);
            handleScrubComplete(dishId);
            setScrubbingDish(null);
            return 100;
          }
          return prev + 20;
        });
      }, 1000);
    }
  };

  // SIMPLIFIED DRAG LOGIC - Dish becomes draggable after rinsing
  const handleMoveToRack = (dishId) => {
    // Check if dish is clean and can be moved to rack
    const isDishClean = gameState.dishesCleaned.includes(dishId);
    const isDishNotOnRack = !gameState.dishesOnRack?.includes(dishId);
    
    if (currentStep === 5 && isDishClean && isDishNotOnRack) {
      const rackPoints = 10;
      const newScore = Math.min(score + rackPoints, MAX_POSSIBLE_SCORE);
      
      setGameState(prev => {
        const updatedDishesPlaced = prev.dishesPlaced.filter(dish => dish.id !== dishId);
        const updatedDishesCleaned = prev.dishesCleaned.filter(id => id !== dishId);
        const updatedDishesOnRack = [...(prev.dishesOnRack || []), dishId];
        
        const allDishesOnRack = updatedDishesOnRack.length === washingOrder.length;
        
        if (allDishesOnRack) {
          setGameCompleted(true);
          // Stop background music
          if (backgroundMusicRef.current) {
            backgroundMusicRef.current.pause();
          }
          // Play success sound
          if (successSoundRef.current && soundEnabled) {
            successSoundRef.current.volume = volume.effects / 100;
            successSoundRef.current.currentTime = 0;
            successSoundRef.current.play().catch(e => console.log('Success sound play failed:', e));
          }
        } else {
          // Always go back to step 1 to place next dish
          setCurrentStep(1);
        }
        
        setScore(newScore);
        playCorrectSound();
        
        return {
          ...prev,
          dishesPlaced: updatedDishesPlaced,
          dishesCleaned: updatedDishesCleaned,
          dishesOnRack: updatedDishesOnRack,
          dishScores: {
            ...prev.dishScores,
            [dishId]: (prev.dishScores[dishId] || 0) + rackPoints
          }
        };
      });
    }
  };

  const getDishStatus = (dishId) => {
    if (gameState.dishesOnRack?.includes(dishId)) return 'completed';
    if (gameState.dishesCleaned.includes(dishId)) return 'clean';
    if (gameState.dishesPlaced.find(d => d.id === dishId)) return 'in-sink';
    return 'dirty';
  };

  const resetGame = () => {
    setCurrentStep(0);
    setGameState({
      spongeHasSoap: false,
      dishesPlaced: [],
      dishesCleaned: [],
      dishesOnRack: [],
      dishScores: {},
      faucetOn: false,
      currentDishRinsing: null
    });
    setGameCompleted(false);
    setScore(0);
    setShowFeedback(false);
    setSpongeActive(false);
    setScrubbingDish(null);
    setScrubProgress(0);
    setProgressSaving(false);
    setProgressSaved(false);
    setShowRestartDialog(false);
    stopScrubbingSound();

    // Restart background music if sound is enabled
    if (backgroundMusicRef.current && soundEnabled && currentPage === PAGES.GAME) {
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.play().catch(e => console.log('Background music restart failed:', e));
    }
    setProgressSaving(false);
    setProgressSaved(false);
  };

  // Handle continue to next module
  const handleContinue = async () => {
    console.log('Continue clicked, progress state:', { progressSaved, progressSaving });
    
    if (!progressSaved && !progressSaving) {
      console.log('Saving progress before continue...');
      await saveProgress();
    } else if (progressSaving) {
      console.log('Progress is currently saving, please wait...');
      return;
    }
    
    console.log('Navigating...');
    setTimeout(() => {
      navigate(`/lesson/household-chores/level-4/${lessonId}`);
    }, 300);
  };

  // Render different pages based on currentPage state
  const renderLandingPage = () => (
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
        🏠 Household Helper 🧽
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
        Learn how to properly wash dishes and keep your kitchen clean!
        </Typography>
        <Button 
        variant="contained"
        onClick={goToGame}
        sx={{ 
            background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
            color: 'white',
            px: 10,
            py: 4,
            borderRadius: '30px',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            fontSize: '2rem',
            textTransform: 'none',
            boxShadow: '0 15px 30px rgba(255, 89, 94, 0.6)',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': {
            transform: 'scale(1.1) translateY(-8px)',
            boxShadow: '0 20px 40px rgba(255, 89, 94, 0.8)',
            background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)'
            },
            '&:active': {
            transform: 'scale(1.05) translateY(-4px)'
            }
        }}
        >
        <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>🎮</span>
        Start Learning
        </Button>
    </Box>
  );

  const renderGamePage = () => (
    <Container maxWidth="xl" sx={{ py: 2, flex: 1, position: 'relative', zIndex: 1 }}>
      {/* Hidden audio elements */}
      <audio 
        ref={faucetSoundRef} 
        src={runningFaucetSound} 
        preload="auto" 
        loop
      />
      <audio 
        ref={backgroundMusicRef} 
        src={backgroundMusic} 
        preload="auto" 
      />
      <audio 
        ref={correctSoundRef} 
        src={correctSound} 
        preload="auto" 
      />
      <audio 
        ref={incorrectSoundRef} 
        src={incorrectSound} 
        preload="auto" 
      />
      <audio 
        ref={scrubbingSoundRef} 
        src={scrubbingSound} 
        preload="auto" 
        loop
      />
      <audio 
        ref={successSoundRef} 
        src={successSound} 
        preload="auto" 
      />

      {/* NEW: Settings Button - Bottom Left */}
      <Fab
        size="large"
        onClick={() => setShowSettings(true)}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          backgroundColor: '#90BE6D',
          zIndex: 1100,
          width: 50,
          height: 50,
          '&:hover': {
            backgroundColor: '#7DA85D'
          }
        }}
      >
        <Typography sx={{ fontSize: '2rem' }}>
          ⚙️
        </Typography>
      </Fab>

      {/* Mascot - Only show after intro dialog is closed */}
      {mascotVisible && !showIntroDialog ? (
        <Paper sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          p: 2,
          maxWidth: 350,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 1300,
          border: '3px solid #90BE6D',
          borderRadius: '20px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <img 
              src={dogmascot}
              alt="Kitchen Helper" 
              style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Kitchi
              </Typography>
              <Typography variant="body2">
                {mascotMessage}
              </Typography>
              {showTutorial && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
                  <Button 
                    variant="outlined"
                    size="small"
                    onClick={handlePreviousTutorial}
                    disabled={tutorialStep === 0}
                    sx={{ 
                      borderColor: '#90BE6D',
                      color: '#90BE6D',
                      fontSize: '0.7rem',
                      minWidth: 'auto',
                      px: 1
                    }}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="contained"
                    size="small"
                    onClick={tutorialStep === tutorialSteps.length - 1 ? endTutorial : handleNextTutorial}
                    sx={{ 
                      backgroundColor: '#90BE6D',
                      fontSize: '0.7rem',
                      minWidth: 'auto',
                      px: 1,
                      '&:hover': {
                        backgroundColor: '#7DA85D'
                      }
                    }}
                  >
                    {tutorialStep === tutorialSteps.length - 1 ? 'Start' : 'Next'}
                  </Button>
                </Box>
              )}
            </Box>
            {!showTutorial && (
              <IconButton 
                size="small" 
                onClick={() => setMascotVisible(false)}
                sx={{ alignSelf: 'flex-start' }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Paper>
      ) : !showIntroDialog && !showTutorial && (
        <Fab
          size="small"
          onClick={() => setMascotVisible(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: '#90BE6D',
            zIndex: 1100,
            '&:hover': {
              backgroundColor: '#7DA85D'
            }
          }}
        >
          <ExpandIcon />
        </Fab>
      )}

      {/* NEW: Tutorial Overlay */}
      {showTutorial && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          zIndex: 1200,
          pointerEvents: 'auto'
        }}>
          {/* Highlighted Areas */}
          {tutorialSteps[tutorialStep].highlight === "progress" && (
            <Box sx={{
              position: 'absolute',
              top: '12%',
              left: '1%',
              right: '90%',
              bottom: '81%',
              border: '4px solid #FFCA3A',
              borderRadius: '10px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "score" && (
            <Box sx={{
              position: 'absolute',
              top: '12.5%',
              left: '91%',
              right: '1%',
              bottom: '82%',
              border: '4px solid #FFCA3A',
              borderRadius: '10px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "drying-rack" && (
            <Box sx={{
              position: 'absolute',
              top: '20%',
              left: '1%',
              right: '74%',
              bottom: '6%',
              border: '4px solid #FFCA3A',
              borderRadius: '20px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "tools" && (
            <Box sx={{
              position: 'absolute',
              top: '20%',
              left: '27%',
              right: '27%',
              bottom: '56%',
              border: '4px solid #FFCA3A',
              borderRadius: '15px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "sink" && (
            <Box sx={{
              position: 'absolute',
              top: '44%',
              left: '34.5%',
              right: '34.5%',
              bottom: '18%',
              border: '4px solid #FFCA3A',
              borderRadius: '20px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "dirty-dishes" && (
            <Box sx={{
              position: 'absolute',
              top: '20%',
              left: '74.4%',
              right: '1%',
              bottom: '3%',
              border: '4px solid #FFCA3A',
              borderRadius: '20px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "settings" && (
            <Box sx={{
              position: 'absolute',
              top: '90%',
              left: '1%',
              width: '53px',
              height: '53px',
              border: '4px solid #FFCA3A',
              borderRadius: '50%',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
        </Box>
      )}

      {/* Progress Section */}
      <Box mb={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            px: 2,
            py: 1,
            borderRadius: '10px'
          }}>
            Step {currentStep + 1} of {steps.length}
          </Typography>
          <Chip 
            label={`Score: ${score}/100`} 
            sx={{
              backgroundColor: '#FF595E',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={progressPercentage} 
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

      {/* Game Area */}
      <Box sx={{ 
        display: 'flex', 
        height: '70vh',
        gap: 3,
        position: 'relative',
        zIndex: 10,
        pointerEvents: showTutorial ? 'none' : 'auto'
      }}>
        {/* Left Section - Drying Rack */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          opacity: currentStep === 5 ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
          position: 'relative',
          zIndex: 10
        }}>
          <Typography variant="h6" sx={{ 
            textAlign: 'center', 
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            py: 1,
            borderRadius: '10px',
            fontWeight: 'bold'
          }}>
            🏠 Drying Rack
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 2,
            flex: 1
          }}>
            {washingOrder.map(dish => (
              <Paper 
                key={dish.id}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: getDishStatus(dish.id) === 'completed' 
                    ? 'rgba(144, 190, 109, 0.95)'
                    : 'rgba(255, 255, 255, 0.4)',
                  borderRadius: '10px',
                  p: 1,
                  opacity: getDishStatus(dish.id) === 'completed' ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                  border: getDishStatus(dish.id) === 'completed' 
                    ? '3px solid #90BE6D' 
                    : '1px solid #ccc',
                  boxShadow: getDishStatus(dish.id) === 'completed' 
                    ? '0 0 20px rgba(144, 190, 109, 1), 0 0 30px rgba(144, 190, 109, 0.7)' 
                    : 'none',
                  position: 'relative',
                  zIndex: getDishStatus(dish.id) === 'completed' ? 20 : 10
                }}
                onDragOver={(e) => {
                  if (currentStep === 5) {
                    e.preventDefault();
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (currentStep === 5) {
                    const dishId = parseInt(e.dataTransfer.getData('dishId'));
                    if (!isNaN(dishId)) {
                      handleMoveToRack(dishId);
                    }
                  }
                }}
              >
                <img 
                  src={dish.clean} 
                  alt={dish.name}
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'contain',
                    filter: getDishStatus(dish.id) === 'completed' 
                      ? 'none' 
                      : 'grayscale(100%) opacity(40%)'
                  }}
                />
                <Typography variant="caption" sx={{ 
                  mt: 1, 
                  fontWeight: 'bold',
                  color: getDishStatus(dish.id) === 'completed' 
                    ? '#90BE6D' 
                    : '#666'
                }}>
                  {dish.name}
                </Typography>
                {getDishStatus(dish.id) === 'completed' && (
                  <Typography variant="caption" sx={{ 
                    color: '#90BE6D', 
                    fontSize: '0.6rem', 
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    px: 1,
                    borderRadius: '4px'
                  }}>
                    ✓ COMPLETED
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Center Section - Sink Area */}
        <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, height: '100%' }}>
          {/* Tools positioned in top corners */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 2,
            position: 'relative',
            zIndex: 20,
            height: '120px'
          }}>
            {/* Soap - Top Left */}
            <Box 
              draggable={currentStep === 0 && !spongeActive && !showTutorial}
              onDragStart={(e) => {
                if (currentStep === 0 && !spongeActive && !showTutorial) {
                  setDraggingSoap(true);
                  e.dataTransfer.setData('soap', 'true');
                } else {
                  e.preventDefault();
                }
              }}
              onDragEnd={() => setDraggingSoap(false)}
              sx={{ 
                textAlign: 'center',
                p: 2,
                border: '3px solid #90BE6D',
                borderRadius: '15px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                width: '120px',
                cursor: (currentStep === 0 && !spongeActive && !showTutorial) ? 'grab' : 'not-allowed',
                opacity: spongeActive ? 0.6 : 1,
                userSelect: 'none',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                marginLeft: '20px'
              }}
            >
              <img 
                src={dishLiquid} 
                alt="Dish Liquid" 
                style={{ 
                  width: '80px', 
                  height: '80px',
                  pointerEvents: 'none'
                }} 
              />
              <Typography variant="caption" sx={{ fontSize: '0.8rem', display: 'block', mt: 1, fontWeight: 'bold' }}>
                Soap
              </Typography>
            </Box>

            {/* Sponge - Top Right */}
            <Box 
              draggable={spongeActive && currentStep === 3 && !showTutorial}
              onDragStart={(e) => {
                if (spongeActive && currentStep === 3 && !showTutorial) {
                  e.dataTransfer.setData('sponge', 'true');
                } else {
                  e.preventDefault();
                }
              }}
              onDragEnd={() => {}}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const hasSoapData = e.dataTransfer.types.includes('soap');
                
                if (hasSoapData && currentStep === 0 && !spongeActive && !showTutorial) {
                  handleSpongeClick();
                }
              }}
              sx={{ 
                textAlign: 'center',
                p: 2,
                border: spongeActive ? '3px solid #90BE6D' : '3px solid #ccc',
                borderRadius: '15px',
                backgroundColor: spongeActive ? 'rgba(240, 255, 240, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                width: '120px',
                cursor: spongeActive ? (currentStep === 3 && !showTutorial ? 'grab' : 'default') : 'default',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                marginRight: '20px'
              }}
            >
              <img src={sponge} alt="Sponge" style={{ 
                width: '80px', 
                height: '80px',
                animation: spongeActive ? 'pulse 1s infinite' : 'none',
                pointerEvents: 'none'
              }} />
              <Typography variant="caption" sx={{ fontSize: '0.8rem', display: 'block', mt: 1, fontWeight: 'bold' }}>
                Sponge {spongeActive && '🧼'}
              </Typography>
            </Box>
          </Box>

          {/* Sink Area - Centered below tools */}
          <Box sx={{ 
            position: 'relative', 
            height: '350px',
            flexShrink: 0,
            overflow: 'hidden',
            cursor: (currentStep === 2 || currentStep === 4) && !showTutorial ? 'pointer' : 'default',
            border: 'none',
            background: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleFaucetClick}
          >
            <img 
              src={gameState.faucetOn ? sinkWithWater : sink} 
              alt="Sink" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                maxWidth: '700px'
              }} 
            />
            
            {/* Drop zone for dishes - invisible but functional */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                width: '180px',
                height: '180px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (currentStep === 1 && gameState.dishesPlaced.length < washingOrder.length && !showTutorial) {
                  const dishId = parseInt(e.dataTransfer.getData('dishId'));
                  const dish = washingOrder.find(d => d.id === dishId);
                  if (dish) handleDishDrop(dish);
                } else if (currentStep === 3 && spongeActive && gameState.dishesPlaced.length > 0 && !showTutorial) {
                  const spongeData = e.dataTransfer.types.includes('sponge');
                  if (spongeData) {
                    const currentDish = gameState.dishesPlaced[gameState.dishesPlaced.length - 1];
                    if (!gameState.dishesCleaned.includes(currentDish.id) && !gameState.dishesOnRack?.includes(currentDish.id)) {
                      handleScrubStart(currentDish.id);
                    }
                  }
                }
              }}
            >
              {/* Show dish in sink if it hasn't been moved to rack yet */}
              {gameState.dishesPlaced.length > 0 && 
              !gameState.dishesOnRack?.includes(gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id) ? (
                <Box 
                draggable={getDishStatus(gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id) === 'clean' && 
                          currentStep === 5 &&
                          !gameState.dishesOnRack?.includes(gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id) &&
                          !showTutorial}
                  onDragStart={(e) => {
                    const currentDishId = gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id;
                    if (getDishStatus(currentDishId) === 'clean' && currentStep === 5 && !showTutorial) {
                      e.dataTransfer.setData('dishId', currentDishId.toString());
                      e.dataTransfer.effectAllowed = 'move';
                    }
                  }}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: (getDishStatus(gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id) === 'clean' && 
                            currentStep === 5 && !showTutorial) ? 'grab' : 'default'
                  }}
                >
                  <img 
                    src={getDishStatus(gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id) === 'clean' 
                      ? gameState.dishesPlaced[gameState.dishesPlaced.length - 1].clean 
                      : gameState.dishesPlaced[gameState.dishesPlaced.length - 1].dirty}
                    alt={gameState.dishesPlaced[gameState.dishesPlaced.length - 1].name}
                    style={{ 
                      width: '120px',
                      height: '120px',
                    }}
                  />
                  {scrubbingDish === gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id && (
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={scrubProgress} 
                        sx={{ height: 8, borderRadius: '4px' }}
                      />
                      
                    </Box>
                  )}
                  {getDishStatus(gameState.dishesPlaced[gameState.dishesPlaced.length - 1].id) === 'clean' && 
                  currentStep === 5 && (
                    <Typography variant="caption" sx={{ color: 'white', mt: 1, fontSize: '0.6rem', textShadow: '1px 1px 2px black' }}>
                      Drag to drying rack!
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: 'white', textAlign: 'center', textShadow: '1px 1px 2px black' }}>
                
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Right Section - Dirty Dishes */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          opacity: currentStep === 1 ? 1 : 0.3,
          transition: 'opacity 0.3s ease',
          position: 'relative',
          zIndex: 10
        }}>
          <Typography variant="h6" sx={{ 
            textAlign: 'center', 
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            py: 1,
            borderRadius: '10px',
            fontWeight: 'bold',
            mb: 2
          }}>
            Dirty Dishes
          </Typography>
          <Paper sx={{ 
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {washingOrder.map(dish => {
              // Skip dishes that are already completed (on rack)
              if (getDishStatus(dish.id) === 'completed') return null;
              
              return (
                <Box 
                  key={dish.id}
                  draggable={
                    currentStep === 1 && !gameState.dishesPlaced.find(d => d.id === dish.id) && getDishStatus(dish.id) !== 'completed' && !showTutorial
                  }
                  onDragStart={(e) => {
                    if (currentStep === 1 && !gameState.dishesPlaced.find(d => d.id === dish.id) && !showTutorial) {
                      e.dataTransfer.setData('dishId', dish.id.toString());
                    }
                  }}
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1,
                    borderRadius: '8px',
                    backgroundColor: gameState.dishesPlaced.find(d => d.id === dish.id) ? 'rgba(0,0,0,0.1)' : 'transparent',
                    opacity: gameState.dishesPlaced.find(d => d.id === dish.id) ? 0.5 : 1,
                    cursor: (currentStep === 1 && !gameState.dishesPlaced.find(d => d.id === dish.id) && !showTutorial) ? 'grab' : 'default',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    zIndex: (currentStep === 1 && !gameState.dishesPlaced.find(d => d.id === dish.id) && !showTutorial) ? 30 : 10
                  }}
                >
                  <img 
                    src={dish.dirty} 
                    alt={dish.name}
                    style={{ width: '60px', height: '60px' }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {dish.name}
                  </Typography>
                </Box>
              );
            })}
          </Paper>
        </Box>
      </Box>
    </Container>
  );

  return (
    <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${kitchenbg3})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        position: 'relative'
    }}>
      {/* Add CSS animations */}
      <style>{`
        @keyframes zoomRotate {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          70% {
            transform: scale(1.1) rotate(10deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% { border-color: #FFCA3A; }
          50% { border-color: #FFB347; }
          100% { border-color: #FFCA3A; }
        }
        
        .success-animation {
          animation: zoomRotate 1.5s ease-out forwards;
        }
      `}</style>

      <Navbar />
      
      {/* Render current page based on state */}
      {currentPage === PAGES.LANDING && renderLandingPage()}
      {currentPage === PAGES.GAME && renderGamePage()}

      {/* Intro Dialog */}
      {showIntroDialog && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{
            p: 3,
            maxWidth: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 2100,
            border: '3px solid #90BE6D',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center' }}>
              <img 
                src={dogmascot} 
                alt="Kitchi" 
                style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Kitchi
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.5 }}>
              Hi there! My name is Kitchi! I am your guide for washing dishes.
            </Typography>
            <Button 
              variant="contained"
              onClick={startTutorial}
              sx={{ 
                backgroundColor: '#90BE6D',
                '&:hover': {
                  backgroundColor: '#7DA85D'
                }
              }}
            >
              Start Tutorial
            </Button>
          </Paper>
        </Box>
      )}

      {/* NEW: Settings Dialog */}
      {showSettings && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{
            p: 3,
            width: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 2100,
            border: '3px solid #90BE6D',
            borderRadius: '20px'
          }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
              ⚙️ Game Settings
            </Typography>
            
            {/* Sound Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={(e) => handleSoundToggle(e.target.checked)}
                  color="success"
                />
              }
              label="Sound Enabled"
              sx={{ mb: 2, width: '100%' }}
            />
            
            {/* Volume Controls */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Background Music: {volume.background}%
              </Typography>
              <Slider
                value={volume.background}
                onChange={(e, newValue) => setVolume(prev => ({ ...prev, background: newValue }))}
                aria-labelledby="background-music-slider"
                sx={{ color: '#90BE6D' }}
                disabled={!soundEnabled}
              />
              
              <Typography variant="body2" sx={{ mb: 1, mt: 2 }}>
                Voice Volume: {volume.voice}%
              </Typography>
              <Slider
                value={volume.voice}
                onChange={(e, newValue) => setVolume(prev => ({ ...prev, voice: newValue }))}
                aria-labelledby="voice-volume-slider"
                sx={{ color: '#90BE6D' }}
                disabled={!soundEnabled}
              />
              
              <Typography variant="body2" sx={{ mb: 1, mt: 2 }}>
                Sound Effects: {volume.effects}%
              </Typography>
              <Slider
                value={volume.effects}
                onChange={(e, newValue) => setVolume(prev => ({ ...prev, effects: newValue }))}
                aria-labelledby="effects-volume-slider"
                sx={{ color: '#90BE6D' }}
                disabled={!soundEnabled}
              />
            </Box>
            
            {/* Action Buttons - Not full width */}
            <Stack direction="column" spacing={2} sx={{ alignItems: 'center' }}>
              <Button 
                variant="outlined"
                onClick={() => setShowRestartDialog(true)}
                sx={{ 
                  borderColor: '#90BE6D',
                  color: '#90BE6D',
                  width: '200px'
                }}
              >
                🔄 Restart Game
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setShowHomeDialog(true)}
                sx={{ 
                  borderColor: '#FF595E',
                  color: '#FF595E',
                  width: '200px'
                }}
              >
                🏠 Go Home
              </Button>
              <Button 
                variant="contained"
                onClick={() => setShowSettings(false)}
                sx={{ 
                  backgroundColor: '#90BE6D',
                  width: '200px',
                  '&:hover': {
                    backgroundColor: '#7DA85D'
                  }
                }}
              >
                Close Settings
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Custom Tip Dialog */}
      {showTipDialog && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{
            p: 3,
            maxWidth: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 2100,
            border: '3px solid #90BE6D',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center' }}>
              <img 
                src={dogmascot} 
                alt="Kitchi" 
                style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Tip from Kitchi
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3 }}>
              {feedbackMessage}
            </Typography>
            <Button 
              variant="contained"
              onClick={() => setShowTipDialog(false)}
              sx={{ 
                backgroundColor: '#90BE6D',
                '&:hover': {
                  backgroundColor: '#7DA85D'
                }
              }}
            >
              Got it!
            </Button>
          </Paper>
        </Box>
      )}

      {/* Custom Restart Confirmation Dialog */}
      {showRestartDialog && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{
            p: 3,
            maxWidth: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 3100,
            border: '3px solid #90BE6D',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center' }}>
              <img 
                src={dogmascot} 
                alt="Kitchi" 
                style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Restart Game?
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Are you sure you want to restart the game? Your current progress will be lost.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined"
                onClick={() => setShowRestartDialog(false)}
                sx={{ 
                  borderColor: '#90BE6D',
                  color: '#90BE6D',
                  '&:hover': {
                    backgroundColor: 'rgba(144, 190, 109, 0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={() => {
                  resetGame();
                  setShowRestartDialog(false);
                  setShowSettings(false);
                }}
                sx={{ 
                  backgroundColor: '#FF595E',
                  '&:hover': {
                    backgroundColor: '#E04549'
                  }
                }}
              >
                Restart
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Custom Go Home Confirmation Dialog */}
      {showHomeDialog && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{
            p: 3,
            maxWidth: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            zIndex: 3100,
            border: '3px solid #90BE6D',
            borderRadius: '20px',
            textAlign: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent: 'center' }}>
              <img 
                src={dogmascot} 
                alt="Kitchi" 
                style={{ 
                  width: 50, 
                  height: 50, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Go Home?
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Are you sure you want to go home? Your current progress will be saved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button 
                variant="outlined"
                onClick={() => setShowHomeDialog(false)}
                sx={{ 
                  borderColor: '#90BE6D',
                  color: '#90BE6D',
                  '&:hover': {
                    backgroundColor: 'rgba(144, 190, 109, 0.1)'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={goToHome}
                sx={{ 
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
              >
                Go Home
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Success Dialog */}
      <Dialog open={gameCompleted} fullScreen onEnter={() => {
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #FFCA3A 0%, #FFB347 100%)',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Content Container */}
          <Box 
            className="success-animation"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'scale(0) rotate(-180deg)'
            }}
          >
            <Typography variant="h1" sx={{ mb: 3 }}>🏆</Typography>
            <Typography variant="h2" sx={{ mb: 2 }}>Excellent Work!</Typography>
            <Typography variant="h4" sx={{ mb: 4 }}>Final Score: {score}/100</Typography>
            
            {/* Star Rating */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              {[...Array(getStarRating())].map((_, i) => (
                <StarIcon key={i} sx={{ 
                  color: 'white', 
                  fontSize: 80,
                  mx: 1,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }} />
              ))}
              {[...Array(3 - getStarRating())].map((_, i) => (
                <StarIcon key={i} sx={{ 
                  color: 'rgba(255,255,255,0.3)', 
                  fontSize: 80,
                  mx: 1
                }} />
              ))}
            </Box>
            
            <Typography variant="h6" sx={{ mb: 4 }}>
              You've mastered the proper dishwashing technique!
            </Typography>
            
            {/* Progress Saving Status */}
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
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button 
                variant="contained"
                onClick={goToHome}
                sx={{ 
                  backgroundColor: '#FF595E',
                  px: 4,
                  minWidth: '140px',
                  '&:hover': {
                    backgroundColor: '#E04549'
                  }
                }}
              >
                🏠 Return Home
              </Button>
              <Button 
                variant="outlined"
                onClick={() => {
                  resetGame();
                  setGameCompleted(false);
                }}
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  px: 3,
                  minWidth: '140px'
                }}
              >
                🔄 Play Again
              </Button>
              
              <Button 
                variant="contained"
                onClick={handleContinue}
                disabled={progressSaving}
                sx={{ 
                  backgroundColor: '#90BE6D',
                  px: 4,
                  minWidth: '140px',
                  '&:hover': {
                    backgroundColor: '#7DA95D'
                  }
                }}
              >
                {progressSaving ? 'Saving...' : '➡️ Next Module'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
}