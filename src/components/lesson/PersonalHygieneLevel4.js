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

// Images - Import all the hygiene level 4 images
// import successGif from "../../assets/hygieneLevel1/roblox.gif"
import backgroundImg from "../../assets/hygienelevel4/bg.png"
import showerBasketImg from "../../assets/hygienelevel4/showerbasket.png"
import towelImg from "../../assets/hygienelevel4/towel.png"
import soapImg from "../../assets/hygienelevel4/soap.png"
import shampooImg from "../../assets/hygienelevel4/shampoo.png"
import spoonImg from "../../assets/hygienelevel4/spoon.png"
import toothbrushImg from "../../assets/hygienelevel4/toothbrush.png"
import bookImg from "../../assets/hygienelevel4/book.png"
import toyImg from "../../assets/hygienelevel4/toy.png"
import shoeImg from "../../assets/hygienelevel4/shoe.png"
import glassesImg from "../../assets/hygienelevel4/glasses.png"

//step2
import boyWithClothesImg from "../../assets/hygienelevel4/boywithclothes.png"
import boyNakedImg from "../../assets/hygienelevel4/boynaked.png"
import laundryBasketImg from "../../assets/hygienelevel4/laundrybasket.png"
import clothesOnlyImg from "../../assets/hygieneLevel4/clothes.png"

//step3
import wetshowerImg from "../../assets/hygienelevel4/wetshower.png"
import showerImg from "../../assets/hygienelevel4/shower.png"

// Character/Cat images - DIFFERENT CATS FOR EACH STATE
import characterCatDefault from "../../assets/hygienelevel3/cat.png" // Default cat
import characterCatExcited from "../../assets/hygienelevel3/cat_excited.png" // Excited cat for success
import characterCatCurious from "../../assets/hygienelevel3/cat_curious.png" // Curious cat for selection
import characterCatHelpful from "../../assets/hygienelevel3/cat_helpful.png" // Helpful cat for instructions
import characterCatProud from "../../assets/hygienelevel3/cat_proud.png" // Proud cat for completion
import characterCatOops from "../../assets/hygienelevel4/cat_oops.png"

export default function ShowerGame() {
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
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [animatingItems, setAnimatingItems] = useState([]);
  const [step2Ready, setStep2Ready] = useState(false);
  const [showProceedToStep3, setShowProceedToStep3] = useState(false);
  const [catVisible, setCatVisible] = useState(true);

  // Game states for shower game
  const [gameStep, setGameStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [basketItems, setBasketItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([
    { id: 'towel', name: 'Towel', image: towelImg, correct: true, size: 'large', position: { left: '5%', top: '15%' } },
    { id: 'soap', name: 'Soap', image: soapImg, correct: true, size: 'small', position: { left: '12%', top: '45%' } },
    { id: 'shampoo', name: 'Shampoo', image: shampooImg, correct: true, size: 'large', position: { right: '2%', top: '5%' } },
    { id: 'spoon', name: 'Spoon', image: spoonImg, correct: false, size: 'small', position: { left: '18%', top: '25%' } },
    { id: 'toothbrush', name: 'Toothbrush', image: toothbrushImg, correct: false, size: 'small', position: { left: '15%', top: '60%' } },
    { id: 'book', name: 'Book', image: bookImg, correct: false, size: 'large', position: { left: '8%', top: '75%' } },
    { id: 'toy', name: 'Toy', image: toyImg, correct: false, size: 'medium', position: { right: '12%', top: '50%' } },
    { id: 'shoe', name: 'Shoe', image: shoeImg, correct: false, size: 'large', position: { right: '8%', top: '80%' } },
    { id: 'glasses', name: 'Glasses', image: glassesImg, correct: false, size: 'medium', position: { right: '15%', top: '25%' } }
  ]);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Step 2 states
  const [boyHasClothes, setBoyHasClothes] = useState(true);
  const [isDraggingBoy, setIsDraggingBoy] = useState(false);
  const [clothesInBasket, setClothesInBasket] = useState(false);

  // Step 3 states
  const [showerImage, setShowerImage] = useState(wetshowerImg);
  const [showerOn, setShowerOn] = useState(false); // Start with shower OFF
  const [shampooApplied, setShampooApplied] = useState(false);
  const [soapApplied, setSoapApplied] = useState(false);
  const [showBubbles, setShowBubbles] = useState(false);
  const [bubbleType, setBubbleType] = useState(''); // 'shampoo' or 'soap'
  const [boyInShower, setBoyInShower] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [rinsing, setRinsing] = useState(false);
  const [towelApplied, setTowelApplied] = useState(false);

  const handleStartGame = () => {
    setShowStartScreen(false);
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

  // Drag and drop handlers for shower items (Step 1)
  const handleDragStart = (e, itemType) => {
    if (gameStep !== 1) return;
    e.dataTransfer.setData('text/plain', itemType);
    setDraggedItem(itemType);
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (gameStep !== 1) return;
    
    const itemType = e.dataTransfer.getData('text/plain');
    const item = availableItems.find(item => item.id === itemType);
    
    if (item) {
        if (item.correct) {
        // Get basket position for animation target
        const basketRect = e.currentTarget.getBoundingClientRect();
        const basketCenter = {
            x: basketRect.left + basketRect.width / 2,
            y: basketRect.top + basketRect.height / 2
        };

        // Start animation
        const animatingItem = {
            ...item,
            startX: e.clientX,
            startY: e.clientY,
            targetX: basketCenter.x,
            targetY: basketCenter.y,
            id: `${item.id}-${Date.now()}` // Unique ID for animation
        };
        
        setAnimatingItems(prev => [...prev, animatingItem]);
        
        // Remove from available items immediately
        setAvailableItems(prev => prev.filter(i => i.id !== item.id));
        setFeedbackMessage(`Great! You added the correct item to your shower basket!`);
        
        // Remove the item after animation completes and add to basket
        setTimeout(() => {
            setAnimatingItems(prev => prev.filter(i => i.id !== animatingItem.id));
            setBasketItems(prev => [...prev, item]);
            
            // Check if all correct items are collected
            const remainingCorrectItems = availableItems.filter(i => i.correct && i.id !== item.id);
            if (remainingCorrectItems.length === 0) {
            setTimeout(() => {
                setScore(prev => prev + 25);
                setGameStep(2);
                setFeedbackMessage('Excellent! You have all the items needed for your shower!');
                
                // Hide the cat when the success message shows
                setCatVisible(false);
                
                // Immediately show the instruction with button (no 5-second delay)
                setStep2Ready(false);
            }, 1500);
            }
        }, 600); // Match this with CSS animation duration
        
        } else {
        // Incorrect item
        setFeedbackMessage(`Oops! That item isn't needed for taking a shower. Try again!`);
        }
    }
    
    setIsDragging(false);
    setDraggedItem(null);
    };

  // Drag and drop handlers for boy with clothes (Step 2)
  const handleBoyDragStart = (e) => {
    if (gameStep !== 2 || !boyHasClothes || !step2Ready) return;
    e.dataTransfer.setData('text/plain', 'boyClothes');
    setIsDraggingBoy(true);
    };

  const handleLaundryDrop = (e) => {
  e.preventDefault(); 
  if (gameStep !== 2 || !boyHasClothes || !step2Ready) return;
  
  const itemType = e.dataTransfer.getData('text/plain');
  
  if (itemType === 'boyClothes') {
    // Successfully dropped clothes in laundry basket
    setBoyHasClothes(false);
    setClothesInBasket(true);
    setFeedbackMessage('Great! You put your clothes in the laundry basket! Now you\'re ready to shower! Click the button below to continue.');
    
    // Show the proceed button instead of auto-proceeding
    setShowProceedToStep3(true);
  }
  
  setIsDraggingBoy(false);
};

const handleProceedToStep3 = () => {
  setScore(prev => prev + 25);
  setGameStep(3);
  setShowProceedToStep3(false);
  setFeedbackMessage('');
  setCurrentInstruction('Drag the boy to the shower to start!');
  // Reset shower to initial state (wet shower visible but OFF)
  setShowerImage(wetshowerImg);
  setShowerOn(false);
};

  const handleProceedToDragDrop = () => {
    setStep2Ready(true);
    setFeedbackMessage('');
    setCatVisible(true); // Show the cat again
    };

  // Step 3 handlers
  const handleBoyToShowerDragStart = (e) => {
    if (gameStep !== 3 || boyInShower) return;
    e.dataTransfer.setData('text/plain', 'boy');
    setIsDraggingBoy(true);
  };

  const handleShowerDrop = (e) => {
    e.preventDefault();
    if (gameStep !== 3 || boyInShower) return;
    
    const itemType = e.dataTransfer.getData('text/plain');
    if (itemType === 'boy') {
      setBoyInShower(true);
      setCurrentInstruction('Click the shower to turn it on!');
    }
    
    setIsDraggingBoy(false);
  };

  const handleShowerClick = () => {
    if (gameStep !== 3 || !boyInShower) return;
    
    if (!showerOn) {
      // First click: Turn ON the shower (replace with showerImg)
      setShowerOn(true);
      setShowerImage(showerImg);
      setCurrentInstruction('Now, apply shampoo!');
    } else if (shampooApplied && !soapApplied && !rinsing) {
      // Rinse shampoo
      setRinsing(true);
      setShowBubbles(false);
      setCurrentInstruction('Click the shower to rinse the shampoo!');
      
      setTimeout(() => {
        setRinsing(false);
        setCurrentInstruction('Now apply soap!');
      }, 2000);
    } else if (soapApplied && !rinsing) {
      // Final rinse
      setRinsing(true);
      setShowBubbles(false);
      setCurrentInstruction('Click the shower to rinse again!');
      
      setTimeout(() => {
        setRinsing(false);
        setShowerOn(false);
        setShowerImage(wetshowerImg);
        setCurrentInstruction('Great job! Now dry off.');
      }, 2000);
    }
  };

  const handleShampooDragStart = (e) => {
    if (gameStep !== 3 || !boyInShower || !showerOn || shampooApplied) return;
    e.dataTransfer.setData('text/plain', 'shampoo');
  };

  const handleSoapDragStart = (e) => {
    if (gameStep !== 3 || !boyInShower || !showerOn || !shampooApplied || soapApplied) return;
    e.dataTransfer.setData('text/plain', 'soap');
  };

  const handleTowelDragStart = (e) => {
    if (gameStep !== 3 || !boyInShower || showerOn || !soapApplied || towelApplied) return;
    e.dataTransfer.setData('text/plain', 'towel');
  };

  const handleBoyHeadDrop = (e) => {
    e.preventDefault();
    if (gameStep !== 3 || !boyInShower || !showerOn || shampooApplied) return;
    
    const itemType = e.dataTransfer.getData('text/plain');
    if (itemType === 'shampoo') {
      setShampooApplied(true);
      setShowBubbles(true);
      setBubbleType('shampoo');
      setCurrentInstruction('Great! Now click the shower to rinse the shampoo!');
    }
  };

  const handleBoyBodyDrop = (e) => {
    e.preventDefault();
    if (gameStep !== 3 || !boyInShower || !showerOn || !shampooApplied || soapApplied) return;
    
    const itemType = e.dataTransfer.getData('text/plain');
    if (itemType === 'soap') {
      setSoapApplied(true);
      setShowBubbles(true);
      setBubbleType('soap');
      setCurrentInstruction('Excellent! Now click the shower to rinse again!');
    }
  };

  const handleBoyTowelDrop = (e) => {
    e.preventDefault();
    if (gameStep !== 3 || !boyInShower || showerOn || !soapApplied || towelApplied) return;
    
    const itemType = e.dataTransfer.getData('text/plain');
    if (itemType === 'towel') {
      setTowelApplied(true);
      setCurrentInstruction('Perfect! You are all clean and dry!');
      
      setTimeout(() => {
        setScore(prev => prev + 50);
        setGameCompleted(true);
        setShowSuccess(true);
      }, 1500);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleMouseDown = (e) => {
    // Mouse handling for touch devices if needed
  };

  const handleMouseMove = (e) => {
    // Mouse move handling if needed
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingBoy(false);
    setDraggedItem(null);
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
        
        // Set lesson data for shower game
        setLesson({
          id: lessonId || 1,
          title: "Shower Time",
          description: "Learn how to take a bath and clean yourself!",
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
  const getStarRating = () => {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  if (score >= 50) return 1;
  return 0;
};

// Add the missing handleContinue function
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

  const resetGame = () => {
  setShowFeedback(false);
  setShowSuccess(false);
  setScore(0);
  setGameCompleted(false);
  setProgressSaved(false);
  setProgressSaving(false);
  
  // Reset game states for shower game
  setGameStep(1);
  setIsDragging(false);
  setIsDraggingBoy(false);
  setDraggedItem(null);
  setBasketItems([]);
  setAnimatingItems([]);
  setAvailableItems([
      { id: 'towel', name: 'Towel', image: towelImg, correct: true, size: 'large', position: { left: '5%', top: '15%' } },
      { id: 'soap', name: 'Soap', image: soapImg, correct: true, size: 'small', position: { left: '12%', top: '45%' } },
      { id: 'shampoo', name: 'Shampoo', image: shampooImg, correct: true, size: 'medium', position: { left: '8%', top: '75%' } },
      { id: 'spoon', name: 'Spoon', image: spoonImg, correct: false, size: 'small', position: { left: '18%', top: '25%' } },
      { id: 'toothbrush', name: 'Toothbrush', image: toothbrushImg, correct: false, size: 'small', position: { left: '15%', top: '60%' } },
      { id: 'book', name: 'Book', image: bookImg, correct: false, size: 'large', position: { right: '5%', top: '20%' } },
      { id: 'toy', name: 'Toy', image: toyImg, correct: false, size: 'medium', position: { right: '12%', top: '50%' } },
      { id: 'shoe', name: 'Shoe', image: shoeImg, correct: false, size: 'large', position: { right: '8%', top: '80%' } },
      { id: 'glasses', name: 'Glasses', image: glassesImg, correct: false, size: 'medium', position: { right: '15%', top: '35%' } }
  ]);
  setFeedbackMessage('');
  
  // Reset Step 2 states
  setBoyHasClothes(true);
  setClothesInBasket(false);
  setStep2Ready(false);
  setShowProceedToStep3(false); // Reset the new state
  
  // Reset Step 3 states
  setShowerImage(wetshowerImg);
  setShowerOn(false);
  setShampooApplied(false);
  setSoapApplied(false);
  setShowBubbles(false);
  setBubbleType('');
  setBoyInShower(false);
  setCurrentInstruction('');
  setRinsing(false);
  setTowelApplied(false);
  
  // Reset cat visibility
  setCatVisible(true);
};

  const handleGoHome = () => {
    navigate('/homepage');
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

  // Character/Cat Component with different images for each state
  const CharacterCat = () => {
  // If cat is not visible, return null
  if (!catVisible) {
    return null;
  }

  // Get appropriate cat image based on game state and feedback
  const getCatImage = () => {
      // Show oops cat when there's an incorrect feedback message
      if (feedbackMessage && feedbackMessage.includes('Oops!')) {
      return characterCatOops;
      }
      
      switch (gameStep) {
      case 1:
          return characterCatCurious; // Curious cat for item selection
      case 2:
          return characterCatHelpful; // Helpful cat during shower
      case 3:
          return characterCatProud; // Proud cat for completion
      default:
          return characterCatDefault; // Default cat
      }
  };

    // Get appropriate animation based on game state
    const getCatAnimation = () => {
        // Special animation for oops cat
        if (feedbackMessage && feedbackMessage.includes('Oops!')) {
        return 'shake 0.5s ease-in-out'; // Shake animation for oops
        }
        
        switch (gameStep) {
        case 1:
            return 'bounce 2s ease-in-out infinite'; // Bounce for excitement
        case 2:
            return 'float 3s ease-in-out infinite'; // Float for calm guidance
        case 3:
            return 'celebrate 2s ease-in-out infinite'; // Celebrate for success
        default:
            return 'float 3s ease-in-out infinite';
        }
    };

    // Get character message based on game state
    const getCharacterMessage = () => {
        // Special message for incorrect responses
        if (feedbackMessage && feedbackMessage.includes('Oops!')) {
        return 'Oops! Try again! 🐾';
        }
        
        switch (gameStep) {
        case 1:
            return `Find shower items! ${basketItems.length}/3 collected!`;
        case 2:
            return boyHasClothes ? 'Drag clothes to the laundry basket! 👕' : 'Great! Now time to shower! 🚿';
        case 3:
            return currentInstruction || 'Let\'s take a shower! 🚿';
        default:
            return 'Let\'s take a shower!';
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
            '@keyframes celebrate': {
                '0%': { transform: 'translateY(0px) rotate(0deg)' },
                '25%': { transform: 'translateY(-15px) rotate(10deg)' },
                '50%': { transform: 'translateY(-20px) rotate(0deg)' },
                '75%': { transform: 'translateY(-15px) rotate(-10deg)' },
                '100%': { transform: 'translateY(0px) rotate(0deg)' }
            },
            '@keyframes shake': {
                '0%': { transform: 'translateX(0px)' },
                '25%': { transform: 'translateX(-5px)' },
                '50%': { transform: 'translateX(5px)' },
                '75%': { transform: 'translateX(-5px)' },
                '100%': { transform: 'translateX(0px)' }
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
            Shower Game
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
            Learn how to take a bath and clean yourself properly!
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
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${backgroundImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    >
      {/* Animation Styles */}
      <style>
        {`
          @keyframes flyToBasket {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 1;
            }
            70% {
              transform: translate(var(--target-x), var(--target-y)) scale(0.8);
              opacity: 0.8;
            }
            100% {
              transform: translate(var(--target-x), var(--target-y)) scale(0);
              opacity: 0;
            }
          }

          .animating-item {
            position: fixed !important;
            pointer-events: none;
            z-index: 1000;
            animation: flyToBasket 0.6s ease-in forwards;
          }

          @keyframes bubbleFloat {
            0% {
              transform: translateY(0) scale(0);
              opacity: 0;
            }
            50% {
              transform: translateY(-20px) scale(1);
              opacity: 1;
            }
            100% {
              transform: translateY(-40px) scale(1.2);
              opacity: 0;
            }
          }

          .bubble {
            position: absolute;
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 70%);
            border-radius: 50%;
            animation: bubbleFloat 2s ease-in-out infinite;
          }

          @keyframes rinseWater {
            0% {
              transform: translateY(-100%) scale(1);
              opacity: 0.8;
            }
            100% {
              transform: translateY(100%) scale(1.2);
              opacity: 0;
            }
          }

          .rinse-water {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, rgba(173, 216, 230, 0.6) 0%, transparent 50%);
            animation: rinseWater 1.5s ease-in-out;
          }
        `}
      </style>
      
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
              Step {gameStep}/3: {gameStep === 1 ? 'Gather Items' : gameStep === 2 ? 'Remove Clothes' : 'Take a Shower'}
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

        {/* Character/Cat Component */}
        {!showStartScreen && <CharacterCat />}

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

        {/* Game Area - Shower Game Components */}
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
            {/* Step 1: Gather Shower Items */}
            {gameStep === 1 && (
              <Box sx={{ 
                width: '100%', 
                maxWidth: '1200px',
                position: 'relative',
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* Basket Area with Image - Centered */}
                <Box 
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  sx={{
                    width: '350px',
                    height: '350px',
                    mx: 'auto',
                    mb: 6,
                    position: 'relative',
                    backgroundImage: `url(${showerBasketImg})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 10,
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  {/* Simple drop message */}
                  {basketItems.length === 0 && availableItems.some(item => item.correct) && (
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        px: 2,
                        py: 1,
                        borderRadius: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      Drop shower items here!
                    </Typography>
                  )}
                </Box>

                {/* Available Items - Scattered around the basket */}
                <Box sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 5
                }}>
                  {availableItems.map((item, index) => {
                    const sizeMap = {
                        small: '120px',
                        medium: '150px', 
                        large: '180px'
                    };
                    
                    return (
                        <Box
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        sx={{
                            position: 'absolute',
                            ...item.position, // Use the fixed position from the item object
                            width: sizeMap[item.size],
                            height: sizeMap[item.size],
                            backgroundImage: `url(${item.image})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            cursor: 'grab',
                            transition: 'all 0.3s ease',
                            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
                            '&:hover': {
                            transform: 'scale(1.2)',
                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.6))',
                            zIndex: 15,
                            },
                            '&:active': {
                            cursor: 'grabbing',
                            transform: 'scale(1.1)',
                            }
                        }}
                        />
                    );
                    })}
                </Box>

                {/* Animating Items */}
                {animatingItems.map((item) => {
                  const sizeMap = {
                    small: '60px',
                    medium: '80px', 
                    large: '100px'
                  };
                  
                  // Calculate animation coordinates relative to start position
                  const deltaX = item.targetX - item.startX;
                  const deltaY = item.targetY - item.startY;
                  
                  return (
                    <Box
                      key={item.id}
                      className="animating-item"
                      sx={{
                        position: 'fixed',
                        left: item.startX,
                        top: item.startY,
                        width: sizeMap[item.size],
                        height: sizeMap[item.size],
                        backgroundImage: `url(${item.image})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1000,
                        '--target-x': `${deltaX}px`,
                        '--target-y': `${deltaY}px`,
                      }}
                    />
                  );
                })}

                {/* Feedback Message with Cat Picture */}
                {feedbackMessage && (
                <Paper
                    sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    p: 3,
                    maxWidth: '700px', // Slightly wider to accommodate cat
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    textAlign: 'left',
                    animation: 'fadeIn 0.5s ease-out',
                    zIndex: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    border: feedbackMessage.includes('Oops!') ? '3px solid #FF595E' : '3px solid #90BE6D',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateX(-50%) translateY(10px)' },
                        '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' }
                    }
                    }}
                >
                    {/* Cat Picture on Left Side - Different based on feedback type */}
                    <Box
                    component="img"
                    src={
                        feedbackMessage.includes('Great!') || feedbackMessage.includes('Excellent!') 
                        ? characterCatExcited 
                        : feedbackMessage.includes('Oops!') 
                        ? characterCatOops // Use oops cat for incorrect responses
                        : characterCatHelpful
                    }
                    alt="Cute Cat Helper"
                    sx={{
                        width: 100,
                        height: 'auto',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                        animation: 
                        feedbackMessage.includes('Great!') || feedbackMessage.includes('Excellent!') 
                            ? 'celebrate 1s ease-in-out infinite' 
                            : feedbackMessage.includes('Oops!') 
                            ? 'shake 0.5s ease-in-out' // Shake animation for oops
                            : 'bounce 2s ease-in-out infinite',
                        '@keyframes celebrate': {
                        '0%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.1)' },
                        '100%': { transform: 'scale(1)' }
                        },
                        '@keyframes shake': {
                        '0%': { transform: 'translateX(0px)' },
                        '25%': { transform: 'translateX(-5px)' },
                        '50%': { transform: 'translateX(5px)' },
                        '75%': { transform: 'translateX(-5px)' },
                        '100%': { transform: 'translateX(0px)' }
                        },
                        '@keyframes bounce': {
                        '0%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-5px)' },
                        '100%': { transform: 'translateY(0px)' }
                        }
                    }}
                    />
                    
                    {/* Message Content */}
                    <Box sx={{ flex: 1 }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                        color: feedbackMessage.includes('Oops!') ? '#FF595E' : '#280B60',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 'bold',
                        mb: 1
                        }}
                    >
                        {feedbackMessage}
                    </Typography>
    
                    </Box>
                </Paper>
                )}
              </Box>
            )}

            {/* Step 2: Take Off Clothes */}
            {gameStep === 2 && (
              <Box sx={{ 
                textAlign: 'center', 
                color: 'white', 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '70vh',
                position: 'relative'
              }}> 
                
                {/* Initial instruction message - Centered at the bottom */}
                {!step2Ready && (
                  <Box sx={{ 
                    position: 'absolute',
                    bottom: 40, // Position at the bottom
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    width: '100%',
                    maxWidth: '500px',
                    textAlign: 'center'
                  }}>
                  </Box>
                )}

                {/* Drag and Drop Section - Only show when step2Ready is true */}
                {step2Ready && (
                  <>
                    {/* Boy and Laundry Basket Container */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: 8,
                      mb: 6,
                      position: 'relative'
                    }}>
                      {/* Boy Base Image (Not draggable - shows naked boy after clothes are removed) */}
                      <Box
                        draggable={boyHasClothes} // Only draggable when boy has clothes
                        onDragStart={boyHasClothes ? handleBoyDragStart : undefined}
                        sx={{ 
                          width: '600px',
                          height: '600px',
                          backgroundImage: `url(${boyHasClothes ? boyWithClothesImg : boyNakedImg})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))',
                          transition: 'all 0.3s ease',
                          cursor: boyHasClothes ? 'grab' : 'default',
                          '&:hover': boyHasClothes ? {
                            transform: 'scale(1.05)',
                          } : {}
                        }}
                      />

                      {/* Laundry Basket - Drop Target */}
                      <Box 
                        onDrop={handleLaundryDrop}
                        onDragOver={handleDragOver}
                        sx={{
                          width: '300px',
                          height: '300px',
                          backgroundImage: `url(${laundryBasketImg})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          cursor: step2Ready ? 'pointer' : 'default',
                          transition: 'all 0.3s ease',
                          borderRadius: '20px',
                          opacity: step2Ready ? 1 : 0.6,
                          '&:hover': step2Ready ? {
                            transform: 'scale(1.05)',
                          } : {}
                        }}
                      >
                      </Box>
                    </Box>

                    {/* Proceed to Step 3 Button - Show only after successful laundry drop */}
                    {showProceedToStep3 && (
                      <Box sx={{ 
                        position: 'absolute',
                        bottom: 40,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 100
                      }}>
                        <Button 
                          variant="contained"
                          onClick={handleProceedToStep3}
                          sx={{ 
                            background: 'linear-gradient(135deg, #90BE6D 0%, #7DA85A 100%)',
                            color: 'white',
                            px: 6,
                            py: 2,
                            borderRadius: '25px',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: '700',
                            fontSize: '1.2rem',
                            textTransform: 'none',
                            boxShadow: '0 10px 25px rgba(144, 190, 109, 0.5)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #A3D178 0%, #90BE6D 100%)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          Take Shower! 🚿
                        </Button>
                      </Box>
                    )}
                  </>
                )}

                {/* Feedback Message with Cat Picture */}
                {feedbackMessage && !step2Ready && (
                  <Paper
                    sx={{
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      p: 3,
                      maxWidth: '700px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '20px',
                      textAlign: 'left',
                      animation: 'fadeIn 0.5s ease-out',
                      zIndex: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      border: '3px solid #90BE6D',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateX(-50%) translateY(10px)' },
                        '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' }
                      }
                    }}
                  >
                    {/* Cat Picture on Left Side */}
                    <Box
                      component="img"
                      src={characterCatExcited}
                      alt="Cute Cat Helper"
                      sx={{
                        width: 100,
                        height: 'auto',
                        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                        animation: 'celebrate 1s ease-in-out infinite',
                        '@keyframes celebrate': {
                          '0%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.1)' },
                          '100%': { transform: 'scale(1)' }
                        }
                      }}
                    />
                    
                    {/* Message Content */}
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#280B60',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: 'bold',
                          mb: 1
                        }}
                      >
                        {feedbackMessage}
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained"
                      onClick={handleProceedToDragDrop}
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
                      Okay, Let's Go!
                    </Button>
                  </Paper>
                )}
              </Box>
            )}

            {/* Step 3: Shower Interaction */}
            {gameStep === 3 && (
              <Box sx={{ 
                textAlign: 'center', 
                color: 'white', 
                width: '100%',
                height: '70vh',
                position: 'relative'
              }}>
                {/* Instruction message */}
                {currentInstruction && (
                  <Paper sx={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    p: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '15px',
                    zIndex: 100,
                    textAlign: 'center'
                  }}>
                    <Typography variant="h6" sx={{ color: '#280B60', fontWeight: 'bold' }}>
                      {currentInstruction}
                    </Typography>
                  </Paper>
                )}

                {/* Shower in upper center */}
                <Box 
                  onDrop={handleShowerDrop}
                  onDragOver={handleDragOver}
                  onClick={handleShowerClick}
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    top: '10%',
                    transform: 'translateX(-50%)',
                    width: '400px',
                    height: '400px',
                    backgroundImage: `url(${showerImage})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))',
                    border: boyInShower ? '3px solid #90BE6D' : '3px solid transparent',
                    borderRadius: '20px',
                    '&:hover': boyInShower ? {
                      transform: 'translateX(-50%) scale(1.05)',
                    } : {}
                  }}
                />

                {/* Boy - Draggable until in shower */}
                <Box
                  draggable={!boyInShower}
                  onDragStart={handleBoyToShowerDragStart}
                  onDrop={handleBoyTowelDrop}
                  onDragOver={handleDragOver}
                  sx={{
                    position: 'absolute',
                    right: '10%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: boyInShower ? '300px' : '400px',
                    height: boyInShower ? '350px' : '450px',
                    backgroundImage: `url(${boyNakedImg})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.5))',
                    cursor: !boyInShower ? 'grab' : (showerOn || towelApplied) ? 'default' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: boyInShower ? 0.7 : 1,
                    border: (boyInShower && !showerOn && soapApplied && !towelApplied) ? '3px dashed #90BE6D' : 'none',
                    '&:hover': !boyInShower ? {
                      transform: 'translateY(-50%) scale(1.05)',
                    } : {}
                  }}
                >
                  {/* Head drop zone for shampoo */}
                  {boyInShower && showerOn && !shampooApplied && (
                    <Box
                      onDrop={handleBoyHeadDrop}
                      onDragOver={handleDragOver}
                      sx={{
                        position: 'absolute',
                        top: '15%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '2px dashed #90BE6D',
                        backgroundColor: 'rgba(144, 190, 109, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: 'rgba(144, 190, 109, 0.5)',
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Head
                      </Typography>
                    </Box>
                  )}

                  {/* Body drop zone for soap */}
                  {boyInShower && showerOn && shampooApplied && !soapApplied && (
                    <Box
                      onDrop={handleBoyBodyDrop}
                      onDragOver={handleDragOver}
                      sx={{
                        position: 'absolute',
                        top: '40%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '120px',
                        height: '150px',
                        borderRadius: '20px',
                        border: '2px dashed #1982C4',
                        backgroundColor: 'rgba(25, 130, 196, 0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 130, 196, 0.5)',
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Body
                      </Typography>
                    </Box>
                  )}

                  {/* Rinsing effect */}
                  {rinsing && (
                    <Box
                      className="rinse-water"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 5
                      }}
                    />
                  )}

                  {/* Bubbles effect */}
                  {showBubbles && (
                    <>
                      {[...Array(15)].map((_, i) => (
                        <Box
                          key={i}
                          className="bubble"
                          sx={{
                            left: `${20 + (i * 5)}%`,
                            top: `${30 + (i * 2)}%`,
                            width: `${10 + (i % 5)}px`,
                            height: `${10 + (i % 5)}px`,
                            animationDelay: `${i * 0.2}s`,
                            background: bubbleType === 'shampoo' 
                              ? 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(173, 216, 230, 0.4) 70%)'
                              : 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(135, 206, 250, 0.4) 70%)'
                          }}
                        />
                      ))}
                    </>
                  )}
                </Box>

                {/* Shower items on the left side */}
                <Box sx={{
                  position: 'absolute',
                  left: '5%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  alignItems: 'center'
                }}>
                  {/* Shampoo - Draggable when appropriate */}
                  <Box
                    draggable={boyInShower && showerOn && !shampooApplied}
                    onDragStart={handleShampooDragStart}
                    sx={{
                      width: '100px',
                      height: '100px',
                      backgroundImage: `url(${shampooImg})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
                      cursor: (boyInShower && showerOn && !shampooApplied) ? 'grab' : 'default',
                      opacity: (boyInShower && showerOn && !shampooApplied) ? 1 : 0.5,
                      transition: 'all 0.3s ease',
                      '&:hover': (boyInShower && showerOn && !shampooApplied) ? {
                        transform: 'scale(1.1)',
                      } : {}
                    }}
                  />

                  {/* Soap - Draggable when appropriate */}
                  <Box
                    draggable={boyInShower && showerOn && shampooApplied && !soapApplied}
                    onDragStart={handleSoapDragStart}
                    sx={{
                      width: '80px',
                      height: '80px',
                      backgroundImage: `url(${soapImg})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
                      cursor: (boyInShower && showerOn && shampooApplied && !soapApplied) ? 'grab' : 'default',
                      opacity: (boyInShower && showerOn && shampooApplied && !soapApplied) ? 1 : 0.5,
                      transition: 'all 0.3s ease',
                      '&:hover': (boyInShower && showerOn && shampooApplied && !soapApplied) ? {
                        transform: 'scale(1.1)',
                      } : {}
                    }}
                  />

                  {/* Towel - For final step */}
                  <Box
                    draggable={boyInShower && !showerOn && soapApplied && !towelApplied}
                    onDragStart={handleTowelDragStart}
                    sx={{
                      width: '120px',
                      height: '120px',
                      backgroundImage: `url(${towelImg})`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))',
                      cursor: (boyInShower && !showerOn && soapApplied && !towelApplied) ? 'grab' : 'default',
                      opacity: (boyInShower && !showerOn && soapApplied && !towelApplied) ? 1 : 0.5,
                      transition: 'all 0.3s ease',
                      '&:hover': (boyInShower && !showerOn && soapApplied && !towelApplied) ? {
                        transform: 'scale(1.1)',
                      } : {}
                    }}
                  />
                </Box>

                {/* Water effects when shower is on */}
                {showerOn && boyInShower && (
                  <>
                    {/* Water droplets */}
                    <Box sx={{
                      position: 'absolute',
                      top: '25%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '200px',
                      height: '200px',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 1%, transparent 10%)',
                      backgroundSize: '50px 50px',
                      animation: 'waterSpray 1.5s ease-in-out infinite',
                      '@keyframes waterSpray': {
                        '0%': { opacity: 0.5, transform: 'translateX(-50%) scale(0.8)' },
                        '50%': { opacity: 0.8, transform: 'translateX(-50%) scale(1.1)' },
                        '100%': { opacity: 0.5, transform: 'translateX(-50%) scale(0.8)' }
                      }
                    }} />
                    
                    {/* Steam effect */}
                    <Box sx={{
                      position: 'absolute',
                      top: '15%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '150px',
                      height: '100px',
                      background: 'radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)',
                      animation: 'steamRise 3s ease-in-out infinite',
                      '@keyframes steamRise': {
                        '0%': { opacity: 0, transform: 'translateX(-50%) translateY(0) scale(0.8)' },
                        '50%': { opacity: 0.6, transform: 'translateX(-50%) translateY(-20px) scale(1)' },
                        '100%': { opacity: 0, transform: 'translateX(-50%) translateY(-40px) scale(1.2)' }
                      }
                    }} />
                  </>
                )}
              </Box>
            )}
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
              Perfect Shower Routine!
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
              Great job! You completed your shower routine perfectly! You're clean, fresh, and ready for the day!
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
              <Button 
                onClick={async () => {
                navigate(`/lesson/hygiene/level-5/${moduleId || 1}/${parseInt(lessonId) + 1 || 2}`);
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