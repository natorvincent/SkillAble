// HouseholdLevel4.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
import { useParams } from 'react-router-dom'; 
import Navbar from '../Navbar';
import backyardBg from "../../assets/householdLevel4/backyardbg.jpg";
import mascotHappy from "../../assets/householdLevel4/mascothappy.png";
import mascotSad from "../../assets/householdLevel4/mascotsad.png";
import dinomascot from "../../assets/householdLevel4/dinomascot.png";

// Import all trash items
import bananaPeel from "../../assets/householdLevel4/bananapeel.png";
import candyWrapper from "../../assets/householdLevel4/candywrapper.png";
import cardboard from "../../assets/householdLevel4/cardboard.png";
import carrotPeel from "../../assets/householdLevel4/carrotpeel.png";
import diaper from "../../assets/householdLevel4/diaper.png";
import eggShell from "../../assets/householdLevel4/eggshell.png";
import glassBottle from "../../assets/householdLevel4/glassbottle.png";
import grassTrimmings from "../../assets/householdLevel4/grasstrims.png";
import newspaper from "../../assets/householdLevel4/newspaper.png";
import plasticBottle from "../../assets/householdLevel4/plasticbottle.png";
import plasticBag from "../../assets/householdLevel4/plasticbag.png";
import styrofoam from "../../assets/householdLevel4/styrofoam.png";
import teaBag from "../../assets/householdLevel4/teabag.png";
import wetWipes from "../../assets/householdLevel4/wetwipes.png";
import can from "../../assets/householdLevel4/can.png";
import greenBin from "../../assets/householdLevel4/greenbin.png";
import redBin from "../../assets/householdLevel4/redbin.png";
import blueBin from "../../assets/householdLevel4/bluebin.png";

// Import sound effects
import backgroundMusic from "../../assets/householdLevel3/background-music.mp3";
import correctSound from "../../assets/householdLevel3/correct-sound.mp3";
import incorrectSound from "../../assets/householdLevel3/incorrect-sound.mp3";
import successSound from "../../assets/householdLevel3/drum-success-sound.mp3";

// Page constants
const PAGES = {
  LANDING: 'landing',
  GAME: 'game'
};

// Trash categories
const CATEGORIES = {
  BIODEGRADABLE: 'biodegradable',
  NON_BIODEGRADABLE: 'non-biodegradable',
  RECYCLABLE: 'recyclable'
};

// Trash items data with detailed explanations
const trashItems = [
  {
    id: 1,
    name: "Banana Peel",
    image: bananaPeel,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Food waste that decomposes naturally",
    voiceText: "Banana Peel. This is biodegradable because it's food waste that breaks down naturally and enriches the soil.",
    explanation: "Banana peels are biodegradable because they're organic food waste that decomposes quickly and adds nutrients back to the soil.",
    tip: "Think about whether this item comes from plants or animals - those usually go in the green bin!"
  },
  {
    id: 2,
    name: "Candy Wrapper",
    image: candyWrapper,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Plastic packaging that doesn't decompose",
    voiceText: "Candy Wrapper. This is non-biodegradable because it's made of plastic that doesn't break down and can harm the environment.",
    explanation: "Candy wrappers are non-biodegradable because they're made of mixed plastics and foils that don't break down naturally and can harm wildlife.",
    tip: "Most shiny, crinkly food wrappers can't be recycled and belong in the red bin."
  },
  {
    id: 3,
    name: "Cardboard",
    image: cardboard,
    category: CATEGORIES.RECYCLABLE,
    description: "Paper product that can be recycled",
    voiceText: "Cardboard. This is recyclable because it can be processed into new paper products, saving trees and energy.",
    explanation: "Cardboard is recyclable because it's made from paper fibers that can be broken down and made into new cardboard or paper products.",
    tip: "Paper-based materials like cardboard usually go in the blue recycling bin!"
  },
  {
    id: 4,
    name: "Carrot Peel",
    image: carrotPeel,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Vegetable waste that decomposes quickly",
    voiceText: "Carrot Peel. This is biodegradable because it's vegetable waste that decomposes quickly and returns nutrients to the soil.",
    explanation: "Carrot peels are biodegradable vegetable waste that break down quickly and make excellent compost for gardens.",
    tip: "Food scraps from fruits and vegetables almost always belong in the green biodegradable bin."
  },
  {
    id: 5,
    name: "Diaper",
    image: diaper,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Hygiene product that takes centuries to decompose",
    voiceText: "Diaper. This is non-biodegradable because it contains plastics and synthetic materials that take hundreds of years to break down.",
    explanation: "Diapers are non-biodegradable because they contain plastics, super absorbent polymers, and other synthetic materials that don't break down.",
    tip: "Personal hygiene products with multiple materials usually can't be recycled and go in red bins."
  },
  {
    id: 6,
    name: "Egg Shell",
    image: eggShell,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Natural material that decomposes",
    voiceText: "Egg Shell. This is biodegradable because it's a natural material that decomposes and adds calcium to compost.",
    explanation: "Egg shells are biodegradable natural materials that break down slowly and add valuable calcium to compost.",
    tip: "Natural materials from animals or plants typically go in the green bin for composting."
  },
  {
    id: 7,
    name: "Glass Bottle",
    image: glassBottle,
    category: CATEGORIES.RECYCLABLE,
    description: "Glass can be melted and reused",
    voiceText: "Glass Bottle. This is recyclable because glass can be melted down and made into new bottles and jars endlessly.",
    explanation: "Glass bottles are highly recyclable because glass can be melted and reformed into new containers indefinitely without losing quality.",
    tip: "Clear glass containers for food and drinks are almost always recyclable in blue bins!"
  },
  {
    id: 8,
    name: "Grass Trimmings",
    image: grassTrimmings,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Yard waste that decomposes naturally",
    voiceText: "Grass Trimmings. This is biodegradable because yard waste breaks down naturally and makes great compost for gardens.",
    explanation: "Grass trimmings are biodegradable yard waste that decompose quickly and create nutrient-rich compost for plants.",
    tip: "Yard and garden waste like grass clippings belong in the green compost bin."
  },
  {
    id: 9,
    name: "Newspaper",
    image: newspaper,
    category: CATEGORIES.RECYCLABLE,
    description: "Paper that can be recycled into new paper",
    voiceText: "Newspaper. This is recyclable because paper can be pulped and made into new paper products, reducing deforestation.",
    explanation: "Newspapers are recyclable paper products that can be turned into new newsprint, cardboard, or other paper materials.",
    tip: "Clean, dry paper products typically go in the blue recycling bin."
  },
  {
    id: 10,
    name: "Metal Can",
    image: can,
    category: CATEGORIES.RECYCLABLE,
    description: "Metal that can be recycled into new products",
    voiceText: "Metal Can. This is recyclable because metals like aluminum and steel can be melted and reformed into new cans and products.",
    explanation: "Metal cans are recyclable because aluminum and steel can be melted down and remade into new cans infinitely, saving enormous energy.",
    tip: "Food and beverage cans made of metal are perfect for the blue recycling bin!"
  },
  {
    id: 11,
    name: "Plastic Bottle",
    image: plasticBottle,
    category: CATEGORIES.RECYCLABLE,
    description: "Plastic that can be processed into new products",
    voiceText: "Plastic Bottle. This is recyclable because certain plastics can be melted and made into new bottles, furniture, and clothing.",
    explanation: "Plastic bottles are recyclable because they're typically made from PET or HDPE plastics that can be remade into new bottles or other products.",
    tip: "Look for recycling symbols on plastic containers - numbers 1 and 2 are usually recyclable!"
  },
  {
    id: 12,
    name: "Styrofoam",
    image: styrofoam,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Foam plastic that doesn't decompose",
    voiceText: "Styrofoam. This is non-biodegradable because this foam plastic doesn't break down and can release harmful chemicals.",
    explanation: "Styrofoam is non-biodegradable because it's a foam plastic that doesn't decompose and can break into tiny pieces that harm wildlife.",
    tip: "Foam packaging and food containers usually can't be recycled and belong in red bins."
  },
  {
    id: 13,
    name: "Tea Bag",
    image: teaBag,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Organic material that decomposes",
    voiceText: "Tea Bag. This is biodegradable because the tea leaves are organic material that decomposes, though some bags have plastic fibers.",
    explanation: "Tea bags are mostly biodegradable because the tea leaves decompose, though some bags contain plastic fibers that don't break down.",
    tip: "Most food and beverage leftovers from plants go in the green compost bin."
  },
  {
    id: 14,
    name: "Plastic Bag",
    image: plasticBag,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Plastic that cannot be recycled",
    voiceText: "Plastic Bag. This is non-biodegradable because most plastic bags aren't recyclable and can take centuries to break down, harming wildlife.",
    explanation: "Plastic bags are non-biodegradable because they're made from polyethylene that doesn't break down and can clog recycling machinery.",
    tip: "Thin plastic films and bags usually can't go in regular recycling - they belong in red bins."
  },
  {
    id: 15,
    name: "Wet Wipes",
    image: wetWipes,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Synthetic material that persists in environment",
    voiceText: "Wet Wipes. This is non-biodegradable because they contain synthetic fibers that don't break down and can clog pipes and harm ecosystems.",
    explanation: "Wet wipes are non-biodegradable because they contain plastic fibers that don't decompose and can cause serious plumbing and environmental issues.",
    tip: "Personal care wipes and cleaning cloths with synthetic materials belong in red bins."
  }
];

export default function HouseholdLevel4() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  
  // Mascot state
  const [mascotVisible, setMascotVisible] = useState(false);
  const [mascotMessage, setMascotMessage] = useState("");
  const [isHappyMascot, setIsHappyMascot] = useState(true);
  const [showIntroDialog, setShowIntroDialog] = useState(false);
  const [introSpoken, setIntroSpoken] = useState(false);

  // NEW: Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialTimeout, setTutorialTimeout] = useState(null);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState({
    background: 50,
    voice: 80,
    effects: 70
  });

  // Store previous volume settings when sound is disabled
  const [previousVolume, setPreviousVolume] = useState({
    background: 50,
    voice: 80,
    effects: 70
  });

  // Dialog state for confirmation
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showHomeDialog, setShowHomeDialog] = useState(false);

  // Game state
  const [clickedItems, setClickedItems] = useState(new Set());
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Progress saving state
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const { lessonId } = useParams();
  
  // Game page state
  const [gameItems, setGameItems] = useState([]);
  const [sortedItems, setSortedItems] = useState({
    [CATEGORIES.BIODEGRADABLE]: [],
    [CATEGORIES.NON_BIODEGRADABLE]: [],
    [CATEGORIES.RECYCLABLE]: []
  });

  // NEW: Track attempts for each item
  const [itemAttempts, setItemAttempts] = useState({});

  // Constants
  const MAX_POSSIBLE_SCORE = 150;

  // Sound refs
  const backgroundMusicRef = useRef(null);
  const correctSoundRef = useRef(null);
  const incorrectSoundRef = useRef(null);
  const successSoundRef = useRef(null);

  // Helper functions
  const getStudentId = () => {
    return localStorage.getItem('studentId') || 'mock-student-id';
  };

  const getStarRating = (score, maxScore = MAX_POSSIBLE_SCORE) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Mock API functions
  const saveStudentLessonProgress = async (studentId, lessonId, progressData) => {
    console.log('Saving lesson progress:', progressData);
    return { success: true, data: progressData };
  };

  const updateModuleProgress = async (studentId, moduleId, progressData) => {
    console.log('Updating module progress:', progressData);
    return { success: true, data: progressData };
  };
  
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(15);
  const [animatingItems, setAnimatingItems] = useState({});

  const [assistantMessage, setAssistantMessage] = useState('');
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [messageTimeout, setMessageTimeout] = useState(null);

  // Speech synthesis setup
  const speechSynthesis = useRef(null);

  // Stop speech function
  const stopSpeech = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
    }
  };

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

  const playSuccessSound = () => {
    if (successSoundRef.current && soundEnabled) {
      successSoundRef.current.volume = volume.effects / 100;
      successSoundRef.current.currentTime = 0;
      successSoundRef.current.play().catch(e => console.log('Success sound play failed:', e));
    }
  };

  // Update background music volume
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = volume.background / 100;
    }
  }, [volume.background]);

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

  // Handle sound toggle
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

  // Speak text function with volume control
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

  useEffect(() => {
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
      if (tutorialTimeout) {
        clearTimeout(tutorialTimeout);
      }
    };
  }, [messageTimeout, tutorialTimeout]);

  useEffect(() => {
    speechSynthesis.current = window.speechSynthesis;
    
    // Clean up speech on unmount
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

  // Show mascot intro when game starts
  useEffect(() => {
    if (currentPage === PAGES.GAME && !introSpoken) {
      setShowIntroDialog(true);
      setMascotMessage("Hi there! My name is Dinosort! I will guide you through proper trash sorting.");
      
      const timer = setTimeout(() => {
        if (voiceEnabled && soundEnabled && !introSpoken) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }
          
          speakText("Hi there! My name is Dinosort! I will guide you through proper trash sorting.");
          setIntroSpoken(true);
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage, voiceEnabled, soundEnabled, introSpoken]);

  // Tutorial steps configuration
  const tutorialSteps = [
    {
      highlight: "bins",
      message: "These are the three sorting bins! Green for biodegradable items like food waste, red for non-biodegradable trash, and blue for recyclable materials.",
      voice: "These are the three sorting bins! Green for biodegradable items like food waste, red for non-biodegradable trash, and blue for recyclable materials."
    },
    {
      highlight: "items",
      message: "On the right side, you'll find the trash items to sort. Drag and drop each item into the correct bin based on its material.",
      voice: "On the right side, you'll find the trash items to sort. Drag and drop each item into the correct bin based on its material."
    },
    {
      highlight: "score",
      message: "Your current score is shown here. You earn points for correct sorting!",
      voice: "Your current score is shown here. You earn points for correct sorting!"
    },
    {
      highlight: "remaining",
      message: "This shows how many items you have left to sort. Keep going until all items are sorted!",
      voice: "This shows how many items you have left to sort. Keep going until all items are sorted!"
    },
    {
      highlight: "settings",
      message: "The settings button lets you control sound volumes and access game options. Now let's start sorting!",
      voice: "The settings button lets you control sound volumes and access game options. Now let's start sorting!"
    }
  ];

  // Start tutorial
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

  // Speak tutorial step
  const speakTutorialStep = (step) => {
    if (step < tutorialSteps.length) {
      setMascotMessage(tutorialSteps[step].message);
      speakText(tutorialSteps[step].voice);
      
      // Auto-advance after 10 seconds
      /*const timeout = setTimeout(() => {
        if (step < tutorialSteps.length - 1) {
          handleNextTutorial();
        } else {
          endTutorial();
        }
      }, 10000);
      
      setTutorialTimeout(timeout);*/
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
    setMascotMessage("Great! Now drag the trash items to their correct bins. I'll help explain each item as you sort them!");
    
    // Restart background music
    if (backgroundMusicRef.current && soundEnabled) {
      backgroundMusicRef.current.play().catch(e => console.log('Background music restart failed:', e));
    }
    
    if (voiceEnabled && soundEnabled) {
      speakText("Great! Now drag the trash items to their correct bins. I'll help explain each item as you sort them!");
    }
  };

  const saveProgress = async () => {
      if (progressSaving || progressSaved) return;
  
      try {
        setProgressSaving(true);
        const studentId = getStudentId();
        
        if (!studentId || !lessonId) {
          console.error('Cannot save progress - missing data:', { studentId, lessonId });
          return;
        }
        
        const cappedScore = Math.min(score, MAX_POSSIBLE_SCORE);
        const finalScore = cappedScore;
        
        const progressData = {
          studentId: studentId,
          lessonId: parseInt(lessonId, 10),
          score: finalScore,
          maxScore: MAX_POSSIBLE_SCORE,
          completed: true,
          starsEarned: getStarRating()
        };
        
        try {
          const lessonProgress = await saveStudentLessonProgress(studentId, lessonId, progressData);
          console.log('Lesson progress saved successfully:', lessonProgress);
        } catch (lessonError) {
          console.error('Failed to save lesson progress:', lessonError);
        }
        
        try {
          const moduleId = 4;
          const moduleProgress = await updateModuleProgress(studentId, moduleId, {
            score: finalScore,
            completed: true,
            starsEarned: getStarRating()
          });
          if (moduleProgress) {
            console.log('Module progress updated successfully:', moduleProgress);
          }
        } catch (moduleError) {
          console.log('Module progress update failed:', moduleError);
        }
        
        setProgressSaved(true);
        console.log('Progress saving process completed');
        
      } catch (error) {
        console.error('Error in save progress process:', error);
        setProgressSaved(true);
      } finally {
        setProgressSaving(false);
      }
    };

  // Initialize game
  const initializeGame = () => {
    stopSpeech();
    
    // Shuffle and select 15 random items
    const shuffled = [...trashItems].sort(() => 0.5 - Math.random());
    const selectedItems = shuffled.slice(0, 15);
    setGameItems(selectedItems);
    setSortedItems({
      [CATEGORIES.BIODEGRADABLE]: [],
      [CATEGORIES.NON_BIODEGRADABLE]: [],
      [CATEGORIES.RECYCLABLE]: []
    });
    setItemsRemaining(15);
    setScore(0);
    setGameCompleted(false);
    setItemAttempts({});
  };

  // Page navigation handlers
  const goToGame = () => {
    setCurrentPage(PAGES.GAME);
    initializeGame();
  };
  const goToHome = () => {
    stopSpeech();
    navigate('/homepage');
  };

  // Handle continue to next module
  const handleContinue = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    navigate(`/homepage`);
  };

  // Game page handlers  
  const handleDropWithAnimation = (category, event) => {
    if (showTutorial) return; // Disable during tutorial
    
    event.preventDefault();
    const itemId = parseInt(event.dataTransfer.getData('itemId'));
    const item = gameItems.find(item => item.id === itemId);
    
    if (item) {
      // Clear any existing message timeout
      if (messageTimeout) {
        clearTimeout(messageTimeout);
        setMessageTimeout(null);
      }

      if (item.category === category) {
        // Start animation
        setAnimatingItems(prev => ({
          ...prev,
          [itemId]: true
        }));

        // Update mascot message with explanation
        const successMessage = `Great job! ${item.name} belongs in ${getCategoryName(category)}. ${item.explanation}`;
        setMascotMessage(successMessage);
        setMascotVisible(true);
        setIsHappyMascot(true);
        playCorrectSound();

        // Speak the explanation
        if (voiceEnabled && soundEnabled) {
          speakText(`Correct! ${item.name} goes in the ${getCategoryName(category)} bin. ${item.explanation}`);
        }

        // Wait for animation to complete before updating state
        setTimeout(() => {
          // Correct category - give points regardless of previous attempts
          const points = 10;
          const newScore = Math.min(score + points, MAX_POSSIBLE_SCORE);
          
          setSortedItems(prev => ({
            ...prev,
            [category]: [...prev[category], item]
          }));
          setGameItems(prev => prev.filter(gameItem => gameItem.id !== itemId));
          setItemsRemaining(prev => prev - 1);
          setScore(newScore);
          
          // Remove animation state
          setAnimatingItems(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });

          // Auto-hide message after 5 seconds (longer for explanations)
          const timeout = setTimeout(() => {
            setMascotVisible(false);
          }, 20000);
          setMessageTimeout(timeout);
        }, 800);
      } else {
        // Wrong category - record attempt but don't penalize score
        const attempts = (itemAttempts[itemId] || 0) + 1;
        setItemAttempts(prev => ({
          ...prev,
          [itemId]: attempts
        }));
        
        // Update mascot message with tip
        const tipMessage = `Not quite! ${item.tip}`;
        setMascotMessage(tipMessage);
        setMascotVisible(true);
        setIsHappyMascot(false);
        playIncorrectSound();

        // Speak the tip
        if (voiceEnabled && soundEnabled) {
          speakText(`Try again! ${item.tip}`);
        }

        // Auto-hide error message after 4 seconds
        const timeout = setTimeout(() => {
          setMascotVisible(false);
        }, 10000);
        setMessageTimeout(timeout);
      }
    }
  };

  const handleDragStart = (itemId, event) => {
    if (showTutorial) {
      event.preventDefault(); // Disable during tutorial
      return;
    }
    event.dataTransfer.setData('itemId', itemId);
  };

  const getCategoryName = (category) => {
    switch(category) {
      case CATEGORIES.BIODEGRADABLE: return "Biodegradable";
      case CATEGORIES.NON_BIODEGRADABLE: return "Non-Biodegradable";
      case CATEGORIES.RECYCLABLE: return "Recyclables";
      default: return "";
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case CATEGORIES.BIODEGRADABLE: return "#90BE6D";
      case CATEGORIES.NON_BIODEGRADABLE: return "#FF595E";
      case CATEGORIES.RECYCLABLE: return "#1982C4";
      default: return "#666";
    }
  };

  // Check if game is completed (for non-last items)
  useEffect(() => {
    if (itemsRemaining === 0 && !gameCompleted && itemsRemaining !== 1) {
      // This handles the case where multiple items might be completed at once
      setTimeout(() => {
        setGameCompleted(true);
        playSuccessSound();
      }, 10000); // 3 second delay after last item
    }
  }, [itemsRemaining, gameCompleted]);

  const resetGame = () => {
    initializeGame();
    setMascotVisible(false);
    setShowSettings(false);
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
        🗑️ Smart Sorting 🚮
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
        Learn how to properly sort trash into biodegradable, non-biodegradable, and recyclable categories!
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
        Start Game
        </Button>
    </Box>
  );

  const renderGamePage = () => (
    <Container maxWidth="xl" sx={{ py: 2, flex: 1, position: 'relative' }}>
      {/* Hidden audio elements */}
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
        ref={successSoundRef} 
        src={successSound} 
        preload="auto" 
      />

      {/* Settings Button - Larger */}
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

      {/* Dinosaur Mascot - Used for both tutorial and game feedback */}
      {mascotVisible && (
        <Paper sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          p: 2,
          maxWidth: 350,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          zIndex: 1300,
          border: `3px solid ${isHappyMascot ? '#90BE6D' : '#FF595E'}`,
          borderRadius: '20px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <img 
              src={dinomascot}
              alt="Dinosort" 
              style={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Dinosort
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
                ×
              </IconButton>
            )}
          </Box>
        </Paper>
      )}

      {/* Tutorial Overlay */}
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
          {tutorialSteps[tutorialStep].highlight === "bins" && (
            <Box sx={{
              position: 'absolute',
              top: '30%',
              left: '1%',
              right: '34.5%',
              bottom: '13%',
              border: '4px solid #FFCA3A',
              borderRadius: '20px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "items" && (
            <Box sx={{
              position: 'absolute',
              top: '20%',
              left: '66%',
              right: '1%',
              bottom: '3%',
              border: '4px solid #FFCA3A',
              borderRadius: '20px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "score" && (
            <Box sx={{
              position: 'absolute',
              top: '12.5%',
              left: '92.5%',
              right: '1%',
              bottom: '82%',
              border: '4px solid #FFCA3A',
              borderRadius: '10px',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.7)',
              zIndex: 1201,
              animation: 'pulse 2s infinite'
            }} />
          )}
          
          {tutorialSteps[tutorialStep].highlight === "remaining" && (
            <Box sx={{
              position: 'absolute',
              top: '12%',
              left: '1%',
              right: '83%',
              bottom: '80.5%',
              border: '4px solid #FFCA3A',
              borderRadius: '10px',
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

      {/* Score and Progress */}
      <Box mb={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            px: 2,
            py: 1,
            borderRadius: '10px'
          }}>
            Items Remaining: {itemsRemaining}/15
          </Typography>
          <Chip 
            label={`Score: ${score}/150`} 
            sx={{
              backgroundColor: '#FF595E',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={((15 - itemsRemaining) / 15) * 100} 
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
        pointerEvents: showTutorial ? 'none' : 'auto'
      }}>
        {/* Left Section - Trash Bins */}
        <Box sx={{ 
          flex: 2, 
          display: 'flex', 
          flexDirection: 'row', 
          gap: 2, 
          alignItems: 'center',
          justifyContent: 'space-around'
        }}>
          {/* Biodegradable Bin */}
          <Box sx={{ 
            flex: 1, 
            position: 'relative',
            height: '400px', 
            maxWidth: '350px' 
          }}>
            <Typography variant="h6" sx={{ 
              textAlign: 'center', 
              color: 'white',
              backgroundColor: 'rgba(144, 190, 109, 0.9)',
              py: 0.5,
              borderRadius: '5px',
              fontWeight: 'bold',
              mt: 0.5,
              fontSize: '1.2rem'
            }}>
              ♻️ Biodegradable
            </Typography>
            <img 
              src={greenBin} 
              alt="Biodegradable Bin" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40%',
                height: '80%',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '2px',
                padding: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)', 
                borderRadius: '5px',
                border: '1px solid rgba(0,0,0,0.2)',
                overflow: 'hidden'
              }}
              onDragOver={(e) => showTutorial ? e.preventDefault() : e.preventDefault()}
              onDrop={(e) => handleDropWithAnimation(CATEGORIES.BIODEGRADABLE, e)}
            >
              {sortedItems[CATEGORIES.BIODEGRADABLE].map((item, index) => (
                <Box key={item.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'white', 
                  borderRadius: '3px',
                  border: '1px solid #90BE6D',
                  minHeight: '60px',
                  animation: 'slideIn 0.8s ease-out'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: '45px', 
                      height: '45px', 
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              ))}
              {gameItems.filter(item => animatingItems[item.id] && item.category === CATEGORIES.BIODEGRADABLE).map(item => (
                <Box key={item.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'white', 
                  borderRadius: '3px',
                  border: '1px solid #90BE6D',
                  minHeight: '60px',
                  animation: 'slideDown 0.8s ease-in-out forwards',
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: '45px', 
                      height: '45px', 
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Non-Biodegradable Bin */}
          <Box sx={{ 
            flex: 1, 
            position: 'relative',
            height: '400px',
            maxWidth: '350px'
          }}>
            <Typography variant="h6" sx={{ 
              textAlign: 'center', 
              color: 'white',
              backgroundColor: 'rgba(255, 89, 94, 0.9)',
              py: 0.5,
              borderRadius: '5px',
              fontWeight: 'bold',
              mt: 0.5,
              fontSize: '1.2rem'
            }}>
              🚫 Non-Biodegradable
            </Typography>
            <img 
              src={redBin} 
              alt="Non-Biodegradable Bin" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40%',
                height: '80%',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '2px',
                padding: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '5px',
                border: '1px solid rgba(0,0,0,0.2)',
                overflow: 'hidden'
              }}
              onDragOver={(e) => showTutorial ? e.preventDefault() : e.preventDefault()}
              onDrop={(e) => handleDropWithAnimation(CATEGORIES.NON_BIODEGRADABLE, e)}
            >
              {sortedItems[CATEGORIES.NON_BIODEGRADABLE].map((item, index) => (
                <Box key={item.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '3px',
                  border: '1px solid #FF595E',
                  minHeight: '60px',
                  animation: 'slideIn 0.8s ease-out'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: '45px', 
                      height: '45px', 
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              ))}
              {gameItems.filter(item => animatingItems[item.id] && item.category === CATEGORIES.NON_BIODEGRADABLE).map(item => (
                <Box key={item.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '3px',
                  border: '1px solid #FF595E',
                  minHeight: '60px',
                  animation: 'slideDown 0.8s ease-in-out forwards',
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: '45px', 
                      height: '45px', 
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Recyclable Bin */}
          <Box sx={{ 
            flex: 1, 
            position: 'relative',
            height: '400px',
            maxWidth: '350px'
          }}>
            <Typography variant="h6" sx={{ 
              textAlign: 'center', 
              color: 'white',
              backgroundColor: 'rgba(25, 130, 196, 0.9)',
              py: 0.5,
              borderRadius: '5px',
              fontWeight: 'bold',
              mt: 0.5,
              fontSize: '1.2rem'
            }}>
              🔄 Recycle
            </Typography>
            <img 
              src={blueBin} 
              alt="Recyclable Bin" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40%',
                height: '80%',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '2px',
                padding: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '5px',
                border: '1px solid rgba(0,0,0,0.2)',
                overflow: 'hidden'
              }}
              onDragOver={(e) => showTutorial ? e.preventDefault() : e.preventDefault()}
              onDrop={(e) => handleDropWithAnimation(CATEGORIES.RECYCLABLE, e)}
            >
              {sortedItems[CATEGORIES.RECYCLABLE].map((item, index) => (
                <Box key={item.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '3px',
                  border: '1px solid #1982C4',
                  minHeight: '60px',
                  animation: 'slideIn 0.8s ease-out'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: '45px', 
                      height: '45px', 
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              ))}
              {gameItems.filter(item => animatingItems[item.id] && item.category === CATEGORIES.RECYCLABLE).map(item => (
                <Box key={item.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderRadius: '3px',
                  border: '1px solid #1982C4',
                  minHeight: '60px',
                  animation: 'slideDown 0.8s ease-in-out forwards',
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90%'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ 
                      width: '45px', 
                      height: '45px', 
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Right Section - Draggable Items */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" sx={{ 
            textAlign: 'center', 
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            py: 1,
            borderRadius: '10px',
            fontWeight: 'bold',
            mb: 2
          }}>
            Drag Items to Correct Bin
          </Typography>
          <Paper sx={{ 
            p: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
            alignContent: 'start'
          }}>
            {gameItems.map(item => (
              <Box 
                key={item.id}
                draggable={!showTutorial}
                onDragStart={(e) => handleDragStart(item.id, e)}
                sx={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1,
                  border: `2px solid ${getCategoryColor(item.category)}`,
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: showTutorial ? 'default' : 'grab',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: showTutorial ? 'scale(1)' : 'scale(1.05)',
                    boxShadow: showTutorial ? 0 : 2
                  }
                }}
              >
                <img 
                  src={item.image} 
                  alt={item.name}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    objectFit: 'contain'
                  }}
                />
                <Typography variant="caption" sx={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  mt: 0.5,
                  fontSize: '0.6rem'
                }}>
                  {item.name}
                </Typography>
                {itemAttempts[item.id] > 0 && (
                  <Typography variant="caption" sx={{ 
                    color: '#FF595E', 
                    fontSize: '0.5rem',
                    mt: 0.5
                  }}>
                    Attempts: {itemAttempts[item.id]}
                  </Typography>
                )}
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Container>
  );

  return (
    <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${backyardBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column"
    }}>
      <Navbar />
      
      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          0% {
            transform: translateX(-50%) translateY(-100px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideIn {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% { border-color: #FFCA3A; }
          50% { border-color: #FFB347; }
          100% { border-color: #FFCA3A; }
        }
      `}</style>

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
                src={dinomascot} 
                alt="Dinosort" 
                style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Dinosort
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.5 }}>
              Hi there! My name is Dinosort! I will guide you through proper trash sorting.
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

      {/* Settings Dialog */}
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

      {/* Restart Confirmation Dialog */}
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
                src={dinomascot} 
                alt="Dinosort" 
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

      {/* Go Home Confirmation Dialog */}
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
                src={dinomascot} 
                alt="Dinosort" 
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
      <Dialog open={gameCompleted} fullScreen>
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
          <Typography variant="h1" sx={{ mb: 3, zIndex: 1 }}>🏆</Typography>
          <Typography variant="h2" sx={{ mb: 2, zIndex: 1 }}>Excellent Work!</Typography>
          <Typography variant="h4" sx={{ mb: 4, zIndex: 1 }}>Final Score: {score}/{MAX_POSSIBLE_SCORE}</Typography>
          
          {/* Star Rating */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            {[...Array(getStarRating())].map((_, i) => (
              <span key={i} style={{ 
                color: 'white', 
                fontSize: '80px',
                margin: '0 8px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>⭐</span>
            ))}
            {[...Array(3 - getStarRating())].map((_, i) => (
              <span key={i} style={{ 
                color: 'rgba(255,255,255,0.3)', 
                fontSize: '80px',
                margin: '0 8px'
              }}>⭐</span>
            ))}
          </Box>
          
          <Typography variant="h6" sx={{ mb: 4 }}>
            You've mastered the art of trash sorting!
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
              <span style={{ marginRight: '8px', fontSize: '30px', verticalAlign: 'middle' }}>✓</span>
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
      </Dialog>
    </div>
  );
}