import starsImg from '../../assets/householdLevel2/stars.png';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Dialog,
  Chip,
  LinearProgress,
  Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';

// For items
import diaperImg from '../../assets/householdLevel2/diaper.png';
import toiletPaperImg from '../../assets/householdLevel2/paper towel.png';
import blueWhiteShirtImg from '../../assets/householdLevel2/BlueWhiteShirt.png';
import cottonBudsImg from '../../assets/householdLevel2/cotton buds.png';
import darkBlueShirtImg from '../../assets/householdLevel2/DarkBlueShirtDirt.png';
import dirtyShortImg from '../../assets/householdLevel2/dirty shirt.png';
import lightBlueShirtImg from '../../assets/householdLevel2/LightBlueShirt.png';
import padsImg from '../../assets/householdLevel2/pads.png';
import pantsImg from '../../assets/householdLevel2/PantsDirt.png';
import shampooImg from '../../assets/householdLevel2/shampoo.png';
import toiletbrushImg from '../../assets/householdLevel2/toilet brush.png';
import basinImg from '../../assets/householdLevel2/basin.png';
import broomImg from '../../assets/householdLevel2/broom.png';  
import trashCanImg from '../../assets/householdLevel2/trash can.png';
import dusterImg from '../../assets/householdLevel2/duster.png';
import bathTubImg from '../../assets/householdLevel2/BathTub.png';
import mudStainImg1 from '../../assets/householdLevel2/mud stain1.png';
import mudStainImg2 from '../../assets/householdLevel2/mud stain 2.png';
import waterSpitImg from '../../assets/householdLevel2/waterspit.png';
import web1Img from '../../assets/householdLevel2/web1.png';
import web2Img from '../../assets/householdLevel2/web2.png';
import web3Img from '../../assets/householdLevel2/web3.png';
import web4Img from '../../assets/householdLevel2/web4.png';
import bubbleImg from '../../assets/householdLevel2/bubble1.png';
import towelImg from '../../assets/householdLevel2/towel.png';

// For Background Images
import bathroomBackground from '../../assets/householdLevel2/BathroomBackground1.png';
import mainGameBackground from '../../assets/householdLevel2/MainGameBackground.png';

// Import sound effects
import bathroomBackgroundMusic from '../../assets/householdLevel2/Background-Music.mp3';

import Navbar from '../Navbar';

import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    secondary: {
      main: '#00BCD4',
      light: '#4DD0E1',
      dark: '#0097A7',
    },
    background: {
      default: '#e3f2fd',
    },
  },
});

const HouseholdLevel2 = () => {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Laundry, 2: Trash, 3: Water spits, 4: Mud stains, 5: Cobwebs
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showHints, setShowHints] = useState(true);
  const [backgroundAudioRef, setBackgroundAudioRef] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showDropZone, setShowDropZone] = useState(false);
  const [collectedLaundry, setCollectedLaundry] = useState([]);
  const [collectedTrash, setCollectedTrash] = useState([]);
  const [bubbles, setBubbles] = useState([]);
  const [taskStars, setTaskStars] = useState([]);
  const [draggingPosition, setDraggingPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const { lessonId } = useParams();

  // All items scattered around the bathroom
  const [allItems, setAllItems] = useState([
    // Laundry Items - Step 1
    { id: 1, name: 'Blue White Shirt', image: blueWhiteShirtImg, x: 15, y: 80, collected: false, type: 'laundry', step: 1, rotation: -25, size: 100 },
    { id: 2, name: 'Dark Blue Shirt', image: darkBlueShirtImg, x: 30, y: 82, collected: false, type: 'laundry', step: 1, rotation: 30, size: 100 },
    { id: 3, name: 'Light Blue Shirt', image: lightBlueShirtImg, x: 45, y: 80, collected: false, type: 'laundry', step: 1, rotation: -10, size: 100 },
    { id: 4, name: 'Dirty Short', image: dirtyShortImg, x: 70, y: 85, collected: false, type: 'laundry', step: 1, rotation: 75, size: 100 },
    { id: 5, name: 'Pants', image: pantsImg, x: 55, y: 80, collected: false, type: 'laundry', step: 1, rotation: -60, size: 100 },

    // Trash Items - Step 2
    { id: 6, name: 'Diaper', image: diaperImg, x: 5, y: 80, collected: false, type: 'trash', step: 2, rotation: 50, size: 80 },
    { id: 7, name: 'Toilet Paper', image: toiletPaperImg, x: 20, y: 83, collected: false, type: 'trash', step: 2, rotation: 40, size: 100 },
    { id: 8, name: 'Cotton Buds', image: cottonBudsImg, x: 65, y: 79, collected: false, type: 'trash', step: 2, rotation: -15, size: 100 },
    { id: 9, name: 'Pads', image: padsImg, x: 75, y: 85, collected: false, type: 'trash', step: 2, rotation: -25, size: 100 },
    { id: 10, name: 'Shampoo', image: shampooImg, x: 60, y: 85, collected: false, type: 'trash', step: 2, rotation: -80, size: 100 },
    { id: 11, name: 'Toilet Brush', image: toiletbrushImg, x: 80, y: 86, collected: false, type: 'trash', step: 2, rotation: 90, size: 100 }
  ]);

  // Dirt spots with proper step assignments
  const [dirtSpots, setDirtSpots] = useState([
    // Water spits ONLY on floor - cleaned with broom in step 3
    { id: 9, x: 1, y: 85, cleaned: false, image: waterSpitImg, size: 120, type: 'water', step: 3 },
    { id: 10, x: 40, y: 85, cleaned: false, image: waterSpitImg, size: 120, type: 'water', step: 3 },
    { id: 11, x: 60, y: 85, cleaned: false, image: waterSpitImg, size: 120, type: 'water', step: 3 },
    { id: 12, x: 80, y: 85, cleaned: false, image: waterSpitImg, size: 120, type: 'water', step: 3 },
    { id: 13, x: 30, y: 85, cleaned: false, image: waterSpitImg, size: 120, type: 'water', step: 3 },
    
    // Mud stains - will be cleaned with towel in step 4
    { id: 1, x: 20, y: 65, cleaned: false, image: mudStainImg1, size: 150, type: 'mud', step: 4 },
    { id: 2, x: 55, y: 60, cleaned: false, image: mudStainImg2, size: 150, type: 'mud', step: 4 },
    { id: 3, x: 70, y: 55, cleaned: false, image: mudStainImg1, size: 150, type: 'mud', step: 4 },
    { id: 4, x: 45, y: 50, cleaned: false, image: mudStainImg2, size: 150, type: 'mud', step: 4 },
    { id: 5, x: 25, y: 40, cleaned: false, image: mudStainImg1, size: 150, type: 'mud', step: 4 },
    { id: 6, x: 80, y: 35, cleaned: false, image: mudStainImg2, size: 150, type: 'mud', step: 4 },
    { id: 7, x: 35, y: 30, cleaned: false, image: mudStainImg1, size: 150, type: 'mud', step: 4 },
    { id: 8, x: 65, y: 25, cleaned: false, image: mudStainImg2, size: 150, type: 'mud', step: 4 },
    { id: 9, x: 55, y: 15, cleaned: false, image: mudStainImg1, size: 150, type: 'mud', step: 4 }
  ]);

  // Cobwebs - Step 5
  const [cobwebs, setCobwebs] = useState([
    { id: 1, x: 4, y: 3, cleaned: false, image: web1Img, size: 250, step: 5 },
    { id: 2, x: 30, y: 12, cleaned: false, image: web2Img, size: 190, step: 5 },
    { id: 3, x: 35, y: 1, cleaned: false, image: web3Img, size: 120, step: 5 },
    { id: 4, x: 50, y: 3, cleaned: false, image: web4Img, size: 100, step: 5 },
    { id: 5, x: 75, y: 3, cleaned: false, image: web1Img, size: 250, step: 5 },
    { id: 6, x: 68, y: 18, cleaned: false, image: web2Img, size: 120, step: 5 },
    { id: 7, x: 2, y: 40, cleaned: false, image: web3Img, size: 190, step: 5 },
    { id: 8, x: 85, y: 38, cleaned: false, image: web4Img, size: 150, step: 5 },
  ]);

  // Available tools for each step
  const [availableTools, setAvailableTools] = useState([
    { id: 1, name: 'Basin', image: basinImg, step: 1, collected: false, used: false },
    { id: 2, name: 'Trash Can', image: trashCanImg, step: 2, collected: false, used: false },
    { id: 3, name: 'Broom', image: broomImg, step: 3, collected: false, used: false },
    { id: 4, name: 'Towel', image: towelImg, step: 4, collected: false, used: false },
    { id: 5, name: 'Duster', image: dusterImg, step: 5, collected: false, used: false }
  ]);

  // Refs for game area
  const gameAreaRef = useRef(null);
  const basinRef = useRef(null);
  const trashCanRef = useRef(null);

  // Add twinkling stars effect for task completion
  const triggerTaskStars = (x, y, count = 3) => {
    const newStars = Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      x: x + (Math.random() * 40 - 20),
      y: y + (Math.random() * 40 - 20),
      size: Math.random() * 60 + 50,
      delay: index * 200
    }));
    
    setTaskStars(prev => [...prev, ...newStars]);
    
    setTimeout(() => {
      setTaskStars(prev => prev.filter(star => !newStars.find(ns => ns.id === star.id)));
    }, 2000);
  };

  useEffect(() => {
    const createBubbles = () => {
      const newBubbles = Array.from({ length: 6 }, (_, index) => ({
        id: Date.now() + index,
        x: Math.random() * 70 + 25,
        y: Math.random() * 20 + 30,
        size: Math.random() * 25 + 20,
        opacity: Math.random() * 0.6 + 0.2,
        animationDelay: Math.random() * 8,
        floatSpeed: Math.random() * 5 + 2
      }));
      setBubbles(prev => [...prev, ...newBubbles].slice(-15));
    };

    createBubbles();
    const bubbleInterval = setInterval(createBubbles, 3000);
    return () => clearInterval(bubbleInterval);
  }, []);

  // Filter items for current step
  const currentStepItems = allItems.filter(item => item.step === currentStep && !item.collected);
  const collectedItems = allItems.filter(item => item.collected);

  // Step progress calculation for 5 steps
  const stepProgress = {
    1: (allItems.filter(item => item.step === 1 && item.collected).length / allItems.filter(item => item.step === 1).length) * 100,
    2: (allItems.filter(item => item.step === 2 && item.collected).length / allItems.filter(item => item.step === 2).length) * 100,
    3: (dirtSpots.filter(spot => spot.step === 3 && spot.cleaned).length / dirtSpots.filter(spot => spot.step === 3).length) * 100,
    4: (dirtSpots.filter(spot => spot.step === 4 && spot.cleaned).length / dirtSpots.filter(spot => spot.step === 4).length) * 100,
    5: (cobwebs.filter(web => web.cleaned).length / cobwebs.length) * 100
  };

  // Background music setup
  useEffect(() => {
    const audio = new Audio(bathroomBackgroundMusic);
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

  // Check step completion and unlock tools for 5 steps
  useEffect(() => {
    const currentProgress = stepProgress[currentStep];
    
    if (currentProgress === 100) {
      const nextStep = currentStep + 1;
      if (nextStep <= 5) {
        setAvailableTools(prev => prev.map(tool => 
          tool.step === nextStep ? { ...tool, collected: true } : tool
        ));
        setTimeout(() => {
          setCurrentStep(nextStep);
          setScore(prev => prev + 20);
          setSelectedTool(null);
          setShowDropZone(false);
        }, 1500);
      } else {
        setTimeout(() => {
          setGameCompleted(true);
          setScore(prev => prev + 20);
        }, 1500);
      }
    }
  }, [stepProgress, currentStep]);

  // Start with basin available
  useEffect(() => {
    setAvailableTools(prev => prev.map(tool => 
      tool.step === 1 ? { ...tool, collected: true } : tool
    ));
  }, []);

  // Start screen handler
  const handleStartGame = () => {
    setShowStartScreen(false);
  };

  // Tool selection handler
  const handleToolSelect = (tool) => {
    if (tool.collected && tool.step === currentStep) {
      setSelectedTool(tool);
      if (tool.step === 1 || tool.step === 2) {
        setShowDropZone(true);
      } else {
        setShowDropZone(false);
      }
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e, item) => {
    if (selectedTool?.step === item.step) {
      e.preventDefault();
      setIsDragging(true);
      setDraggedItem(item);
      updateDraggingPosition(e);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && draggedItem) {
      updateDraggingPosition(e);
    }
  };

  const handleMouseUp = (e) => {
    if (isDragging && draggedItem) {
      // Check if dropped over drop zone
      const rect = gameAreaRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Check for basin drop zone (Step 1)
        if (currentStep === 1 && selectedTool?.step === 1 && basinRef.current) {
          const basinRect = basinRef.current.getBoundingClientRect();
          const basinCenterX = basinRect.left + basinRect.width / 2;
          const basinCenterY = basinRect.top + basinRect.height / 2;
          
          if (
            e.clientX >= basinRect.left &&
            e.clientX <= basinRect.right &&
            e.clientY >= basinRect.top &&
            e.clientY <= basinRect.bottom &&
            draggedItem.type === 'laundry'
          ) {
            handleDropSuccess(draggedItem, 'basin');
          }
        }
        
        // Check for trash can drop zone (Step 2)
        if (currentStep === 2 && selectedTool?.step === 2 && trashCanRef.current) {
          const trashRect = trashCanRef.current.getBoundingClientRect();
          
          if (
            e.clientX >= trashRect.left &&
            e.clientX <= trashRect.right &&
            e.clientY >= trashRect.top &&
            e.clientY <= trashRect.bottom &&
            draggedItem.type === 'trash'
          ) {
            handleDropSuccess(draggedItem, 'trash');
          }
        }
      }
      
      setIsDragging(false);
      setDraggedItem(null);
    }
  };

  const updateDraggingPosition = (e) => {
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (rect) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setDraggingPosition({ x, y });
    }
  };

  // Handle successful drop
  const handleDropSuccess = (item, target) => {
    if (currentStep === 1 && target === 'basin' && item.type === 'laundry' && selectedTool?.step === 1) {
      setAllItems(prev => 
        prev.map(i => 
          i.id === item.id ? { ...i, collected: true } : i
        )
      );
      setCollectedLaundry(prev => [
        ...prev,
        {
          ...item,
          containerPosition: {
            x: Math.random() * 60 + 20,
            y: Math.random() * 30 + 50
          },
          size: 40
        }
      ]);
      setScore(prev => prev + 8);
      triggerTaskStars(item.x, item.y, 6);
      
    } else if (currentStep === 2 && target === 'trash' && item.type === 'trash' && selectedTool?.step === 2) {
      setAllItems(prev => 
        prev.map(i => 
          i.id === item.id ? { ...i, collected: true } : i
        )
      );
      setCollectedTrash(prev => [
        ...prev,
        {
          ...item,
          containerPosition: {
            x: Math.random() * 50 + 25,
            y: Math.random() * 30 + 35
          },
          size: 35
        }
      ]);
      setScore(prev => prev + 8);
      triggerTaskStars(item.x, item.y, 6);
    }

    // Reset dragging state
    setIsDragging(false);
    setDraggedItem(null);
  };

  // Step 3: Clean water spits with broom
  const handleStep3Clean = (e) => {
    if (currentStep !== 3 || !selectedTool || selectedTool?.step !== 3) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSelectedTool(prev => ({ ...prev, cleaningPosition: { x, y } }));

    const updatedDirt = dirtSpots.map(spot => {
      if (spot.step === 3 && !spot.cleaned && !spot.cleaning && Math.abs(spot.x - x) < 10 && Math.abs(spot.y - y) < 10) {
        if (selectedTool.name !== 'Broom') {
          console.log('Use Broom for water spits!');
          return spot;
        }

        setScore(prev => prev + 8);
        const cleaningSpot = { ...spot, cleaning: true, cleaningProgress: 0 };
        setDirtSpots(prev => prev.map(s => 
          s.id === spot.id ? cleaningSpot : s
        ));

        const startTime = Date.now();
        const animateCleaning = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / 1500, 1);
          
          setDirtSpots(prev => prev.map(s => 
            s.id === spot.id ? { 
              ...s, 
              cleaningProgress: progress,
              opacity: 1 - progress,
              scale: 1 - (progress * 0.5)
            } : s
          ));

          if (progress < 1) {
            requestAnimationFrame(animateCleaning);
          } else {
            setDirtSpots(prev => prev.map(s => 
              s.id === spot.id ? { ...s, cleaned: true, cleaning: false } : s
            ));
            triggerTaskStars(spot.x, spot.y, 8);
          }
        };

        requestAnimationFrame(animateCleaning);
        return cleaningSpot;
      }
      return spot;
    });

    setDirtSpots(updatedDirt);
  };

  // Step 4: Clean mud stains with towel
  const handleStep4Clean = (e) => {
    if (currentStep !== 4 || !selectedTool || selectedTool?.step !== 4) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSelectedTool(prev => ({ ...prev, cleaningPosition: { x, y } }));

    const updatedDirt = dirtSpots.map(spot => {
      if (spot.step === 4 && !spot.cleaned && !spot.cleaning && Math.abs(spot.x - x) < 10 && Math.abs(spot.y - y) < 10) {
        if (selectedTool.name !== 'Towel') {
          console.log('Use Towel for mud stains!');
          return spot;
        }

        setScore(prev => prev + 8);
        const cleaningSpot = { ...spot, cleaning: true, cleaningProgress: 0 };
        setDirtSpots(prev => prev.map(s => 
          s.id === spot.id ? cleaningSpot : s
        ));

        const startTime = Date.now();
        const animateCleaning = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / 1500, 1);
          
          setDirtSpots(prev => prev.map(s => 
            s.id === spot.id ? { 
              ...s, 
              cleaningProgress: progress,
              opacity: 1 - progress,
              scale: 1 - (progress * 0.5)
            } : s
          ));

          if (progress < 1) {
            requestAnimationFrame(animateCleaning);
          } else {
            setDirtSpots(prev => prev.map(s => 
              s.id === spot.id ? { ...s, cleaned: true, cleaning: false } : s
            ));
            triggerTaskStars(spot.x, spot.y, 8);
          }
        };

        requestAnimationFrame(animateCleaning);
        return cleaningSpot;
      }
      return spot;
    });

    setDirtSpots(updatedDirt);
  };

  // Step 5: Clean cobwebs with duster
  const handleStep5Clean = (e) => {
    if (currentStep !== 5 || !selectedTool || selectedTool?.step !== 5) return;

    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setSelectedTool(prev => ({ ...prev, cleaningPosition: { x, y } }));

    const updatedWebs = cobwebs.map(web => {
      if (!web.cleaned && !web.cleaning && Math.abs(web.x - x) < 12 && Math.abs(web.y - y) < 12) {
        if (selectedTool.name !== 'Duster') {
          console.log('Use Duster for cobwebs!');
          return web;
        }

        setScore(prev => prev + 8);
        const cleaningWeb = { ...web, cleaning: true, cleaningProgress: 0 };
        setCobwebs(prev => prev.map(w => 
          w.id === web.id ? cleaningWeb : w
        ));

        const startTime = Date.now();
        const animateCleaning = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / 1500, 1);
          
          setCobwebs(prev => prev.map(w => 
            w.id === web.id ? { 
              ...w, 
              cleaningProgress: progress,
              opacity: 1 - progress,
              scale: 1 - (progress * 0.5)
            } : w
          ));

          if (progress < 1) {
            requestAnimationFrame(animateCleaning);
          } else {
            setCobwebs(prev => prev.map(w => 
              w.id === web.id ? { ...w, cleaned: true, cleaning: false } : w
            ));
            triggerTaskStars(web.x, web.y, 8);
          }
        };

        requestAnimationFrame(animateCleaning);
        return cleaningWeb;
      }
      return web;
    });

    setCobwebs(updatedWebs);
  };

  // Reset game function
  const resetGame = () => {
    setCurrentStep(1);
    setGameCompleted(false);
    setScore(0);
    setSelectedTool(null);
    setIsDragging(false);
    setDraggedItem(null);
    setAllItems(prev => prev.map(item => ({ ...item, collected: false })));
    setDirtSpots(prev => prev.map(spot => ({ ...spot, cleaned: false, cleaning: false })));
    setCobwebs(prev => prev.map(web => ({ ...web, cleaned: false, cleaning: false })));
    setAvailableTools(prev => prev.map(tool => ({ 
      ...tool, 
      collected: tool.step === 1, 
      used: false 
    })));
    setCollectedLaundry([]);
    setCollectedTrash([]);
    setTaskStars([]);
    setShowDropZone(false);
  };

  const handleGoHome = () => {
    window.location.href = '/studentdashboard';
  };

  const handleNextLevel = () => {
    try {
      try {
        saveStudentLessonProgress('household', 'level3', 100);
      } catch (error) {
        console.log('Progress saving not available in demo');
      }
      
      try {
        updateModuleProgress('household', 'level3');
      } catch (error) {
        console.log('Module progress update not available in demo');
      }
      
      if (lessonId) {
        navigate(`/lesson/household-chores/level-3/${lessonId}`);
      } else {
        navigate('/lesson/household-chores/level-3');
      }
      
    } catch (error) {
      console.log('Next level functionality:', error);
      navigate('/lesson/household-chores/level-3');
    }
  };

  const toggleHints = () => {
    setShowHints(prev => !prev);
  };

  // Start screen
  if (showStartScreen) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bathroomBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
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
            Bathroom Cleanup
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
            Find and clean all items scattered around the bathroom!
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
              Start Cleaning!
            </Button>
          </Stack>
        </Box>
      </div>
    );
  }

  // Main game screen
  return (
    <ThemeProvider theme={theme}>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${mainGameBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#d0eaff',
          overflow: 'hidden'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isDragging) {
            setIsDragging(false);
            setDraggedItem(null);
          }
        }}
      >
        
        {/* Task Completion Stars */}
        {taskStars.map(star => (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundImage: `url(${starsImg})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              animation: `taskStarBlink 2s ease-out ${star.delay}ms forwards`,
              opacity: 0,
              transform: 'scale(0)',
              zIndex: 25,
              pointerEvents: 'none',
              filter: 'brightness(1.3) drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
            }}
          />
        ))}
        
        {/* Audio Control Button */}
        <Box sx={{ 
          position: 'absolute',
          top: 100,
          right: 16,
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

        {/* Main Layout Container */}
        <div style={{
          display: 'flex',
          height: '100vh',
          width: '100vw',
          position: 'relative',
          userSelect: 'none'
        }}>
          {/* Sidebar - Tools Collection */}
          <Paper sx={{
            width: '120px',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '0 20px 20px 0',
            boxShadow: '4px 0 20px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 2,
            gap: 2,
            zIndex: 100
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: '#2196F3',
              textAlign: 'center',
              mb: 2
            }}>
              Tools
            </Typography>

            {availableTools.map(tool => (
              <Box
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                sx={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  cursor: tool.collected ? 'pointer' : 'default',
                  backgroundColor: tool.collected 
                    ? (selectedTool?.id === tool.id ? '#E3F2FD' : '#F5F5F5')
                    : '#E0E0E0',
                  border: tool.collected 
                    ? (selectedTool?.id === tool.id ? '3px solid #2196F3' : '2px solid #BDBDBD')
                    : '2px solid #BDBDBD',
                  transition: 'all 0.3s ease',
                  opacity: tool.collected ? 1 : 0.5,
                  '&:hover': tool.collected ? {
                    backgroundColor: '#E3F2FD',
                    transform: 'scale(1.05)'
                  } : {},
                  position: 'relative'
                }}
              >
                <img 
                  src={tool.image} 
                  alt={tool.name}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'contain',
                    filter: tool.collected ? 'none' : 'grayscale(1)'
                  }}
                />
                <Typography variant="caption" sx={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: tool.collected ? '#333' : '#999'
                }}>
                  {tool.name}
                </Typography>
                
                {/* Step indicator */}
                <Box sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: '20px',
                  height: '20px',
                  backgroundColor: tool.collected ? '#4CAF50' : '#9E9E9E',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  {tool.step}
                </Box>

                {/* Lock icon for unavailable tools */}
                {!tool.collected && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '1.5rem',
                    color: '#757575'
                  }}>
                    🔒
                  </Box>
                )}
              </Box>
            ))}

            {/* Hints Toggle Button */}
            <Button
              onClick={toggleHints}
              variant="outlined"
              size="small"
              sx={{
                mt: 2,
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}
            >
              {showHints ? 'Hide Hints' : 'Show Hints'}
            </Button>
          </Paper>

          {/* Game Content Area */}
          <Box sx={{
            flex: 1,
            height: '100%',
            position: 'relative',
            overflow: 'hidden'
          }}>

            {/* Progress Header */}
            <Box sx={{ 
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              zIndex: 1000
            }}>
              <Typography variant="h6" sx={{ 
                color: 'white', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                px: 2,
                py: 1,
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                mb: 1,
                display: 'inline-block'
              }}>
                Step {currentStep}/5: {
                  currentStep === 1 ? 'Collect Laundry' :
                  currentStep === 2 ? 'Dispose Trash' :
                  currentStep === 3 ? 'Sweep Floor: Clean water spits with Broom' :
                  currentStep === 4 ? 'Wipe Floor: Clean mud stains with Towel' :
                  'Dust Walls: Clean cobwebs with Duster'
                }
                {selectedTool && ` - Using: ${selectedTool.name}`}
              </Typography>

              {/* Progress Bar */}
              <LinearProgress 
                variant="determinate" 
                value={stepProgress[currentStep]}
                sx={{ 
                  height: 12, 
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: '10px',
                    backgroundColor: '#4CAF50'
                  }
                }} 
              />
            </Box>

            {/* Interactive Game Area */}
            <div 
              ref={gameAreaRef}
              style={{
                position: 'absolute',
                top: '100px',
                left: 0,
                right: 0,
                bottom: '10px', 
                top: '10px',
                cursor: (currentStep >= 3 && currentStep <= 5) && selectedTool ? 'crosshair' : (isDragging ? 'grabbing' : 'default'),
                overflow: 'hidden'
              }}
              onMouseMove={
                currentStep === 3 ? handleStep3Clean : 
                currentStep === 4 ? handleStep4Clean : 
                currentStep === 5 ? handleStep5Clean : 
                undefined
              }
            >
              {/* BathTub Image with Bubbles */}
              <div
                style={{
                  position: 'absolute',
                  left: '0%',
                  bottom: '50px',
                  width: '700px',
                  height: '500px',
                  zIndex: 8
                }}
              >
                <img 
                  src={bathTubImg} 
                  alt="Bath Tub"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                  }}
                />
                
                {/* Bubbles */}
                {bubbles.map(bubble => (
                  <div
                    key={bubble.id}
                    style={{
                      position: 'absolute',
                      left: `${bubble.x}%`,
                      top: `${bubble.y}%`,
                      width: `${bubble.size}px`,
                      height: `${bubble.size}px`,
                      opacity: bubble.opacity,
                      animation: `floatUpLong ${bubble.floatSpeed}s ease-in-out ${bubble.animationDelay}s infinite`,
                      zIndex: 9
                    }}
                  >
                    <img 
                      src={bubbleImg} 
                      alt="Bubble"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 1px 3px rgba(255,255,255,0.5)) brightness(1.1)'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* All Scattered Items with Hints */}
              {allItems.map(item => !item.collected && (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleMouseDown(e, item)}
                  style={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${item.size || 80}px`,
                    height: `${item.size || 80}px`,
                    cursor: selectedTool?.step === item.step ? 'grab' : 'not-allowed',
                    transition: isDragging && draggedItem?.id === item.id ? 'none' : 'all 0.3s ease',
                    zIndex: isDragging && draggedItem?.id === item.id ? 30 : 10,
                    opacity: selectedTool?.step === item.step ? 1 : 0.7,
                    transform: `rotate(${item.rotation || 0}deg) ${isDragging && draggedItem?.id === item.id ? 'scale(1.1)' : ''}`,
                    filter: isDragging && draggedItem?.id === item.id ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.6)) brightness(1.2)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                  }}
                >
                  {/* Hint Circle */}
                  {showHints && selectedTool?.step === item.step && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${(item.size || 80)}px`,
                      height: `${(item.size || 80)}px`,
                      border: '2px solid #FFD700',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite',
                      zIndex: -1
                    }} />
                  )}
                  
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              ))}

              {/* Dragging Item Visual */}
              {isDragging && draggedItem && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${draggingPosition.x}%`,
                    top: `${draggingPosition.y}%`,
                    width: `${draggedItem.size || 80}px`,
                    height: `${draggedItem.size || 80}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 40,
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6)) brightness(1.2)',
                    opacity: 0.9
                  }}
                >
                  <img 
                    src={draggedItem.image} 
                    alt={draggedItem.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                  {/* Dragging indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255, 215, 0, 0.9)',
                    color: '#333',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}>
                    Drag to {draggedItem.type === 'laundry' ? 'Basin' : 'Trash Can'}
                  </div>
                </div>
              )}

              {/* Dirt Spots - Show ALL un-cleaned spots */}
              {dirtSpots.map(spot => !spot.cleaned && (
                <div
                  key={spot.id}
                  style={{
                    position: 'absolute',
                    left: `${spot.x}%`,
                    top: `${spot.y}%`,
                    width: `${spot.size || 60}px`,
                    height: `${spot.size || 60}px`,
                    zIndex: 5,
                    opacity: spot.cleaning ? 1 - (spot.cleaningProgress || 0) : 1,
                    transform: spot.cleaning ? `scale(${1 - ((spot.cleaningProgress || 0) * 0.5)})` : 'scale(1)',
                    transition: spot.cleaning ? 'all 0.1s ease-out' : 'none',
                    pointerEvents: (spot.step === currentStep && selectedTool?.step === currentStep) ? 'auto' : 'none',
                  }}
                >
                  {/* Hint Circle - only show for current step with correct tool */}
                  {showHints && spot.step === currentStep && selectedTool?.step === currentStep && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${(spot.size || 60) + 5}px`,
                      height: `${(spot.size || 60) + 5}px`,
                      border: `2px solid ${spot.type === 'mud' ? '#8B4513' : '#4ECDC4'}`,
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite',
                      zIndex: -1
                    }} />
                  )}
                  <img 
                    src={spot.image} 
                    alt={`${spot.type} stain`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                    }}
                  />
                </div>
              ))}

              {/* Cobwebs - Show ALL un-cleaned cobwebs */}
              {cobwebs.map(web => !web.cleaned && (
                <div
                  key={web.id}
                  style={{
                    position: 'absolute',
                    left: `${web.x}%`,
                    top: `${web.y}%`,
                    width: `${web.size || 80}px`,
                    height: `${web.size || 80}px`,
                    zIndex: 5,
                    opacity: web.cleaning ? 1 - (web.cleaningProgress || 0) : 1,
                    transform: web.cleaning ? `scale(${1 - ((web.cleaningProgress || 0) * 0.5)})` : 'scale(1)',
                    transition: web.cleaning ? 'all 0.1s ease-out' : 'none',
                    pointerEvents: (currentStep === 5 && selectedTool?.step === 5) ? 'auto' : 'none',
                  }}
                > 
                  {/* Glowing Pulse Hint - only show for step 5 with correct tool */}
                  {showHints && currentStep === 5 && selectedTool?.step === 5 && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${(web.size || 80) + 40}px`,
                      height: `${(web.size || 80) + 40}px`,
                      background: 'radial-gradient(circle, rgba(78,205,196,0.3) 0%, rgba(78,205,196,0) 70%)',
                      borderRadius: '50%',
                      animation: 'glowPulse 2s infinite',
                      zIndex: -1  
                    }} />
                  )}
                  <img 
                    src={web.image} 
                    alt="Cobweb"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                    }}
                  />
                </div>
              ))}

              {/* Cleaning Tool Display */}
              {selectedTool?.cleaningPosition && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${selectedTool.cleaningPosition.x}%`,
                    top: `${selectedTool.cleaningPosition.y}%`,
                    width: '250px',
                    height: '250px',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 15,
                    pointerEvents: 'none'
                  }}
                >
                  <img 
                    src={selectedTool.image}
                    alt="Cleaning tool"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                    }}
                  />
                </div>
              )}

              {/* Drop Zones for Steps 1 and 2 */}
              {(showDropZone && currentStep === 1 && selectedTool?.step === 1) && (
                <Box
                  ref={basinRef}
                  sx={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '30px',
                    width: '200px',
                    height: '200px',
                    zIndex: 20,
                    animation: 'dropZonePulse 1.5s infinite alternate',
                    cursor: 'pointer',
                    backgroundColor: isDragging && draggedItem?.type === 'laundry' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(33, 150, 243, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <img 
                    src={basinImg} 
                    alt="Drop laundry here"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 12px rgba(33,150,243,0.5))',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                  
                </Box>
              )}

              {(showDropZone && currentStep === 2 && selectedTool?.step === 2) && (
                <Box
                  ref={trashCanRef}
                  sx={{
                    position: 'absolute',
                    bottom: '20px',
                    right: '30px',
                    width: '200px',
                    height: '200px',
                    zIndex: 20,
                    animation: 'dropZonePulse 1.5s infinite alternate',
                    cursor: 'pointer',
                    
                  }}
                >
                  <img 
                    src={trashCanImg} 
                    alt="Drop trash here"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 12px rgba(255,87,34,0.5))',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                  
                </Box>
              )}
            </div>

            {/* Control Buttons */}
            <Box sx={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              display: 'flex',
              gap: 2,
              zIndex: 1000
            }}>
              <Button 
                variant="contained"
                onClick={resetGame}
                sx={{
                  background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  textTransform: 'none'
                }}
              >
                Restart
              </Button>
              
              <Button 
                variant="contained"
                onClick={handleGoHome}
                sx={{
                  background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                  color: 'white',
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  textTransform: 'none'
                }}
              >
                Go Home
              </Button>
            </Box>
          </Box>
        </div>

        {/* Success Dialog */}
        <Dialog
          open={gameCompleted}
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
            textAlign: 'center',
            color: 'white',
            zIndex: 1001
          }}>
            <Typography variant="h1" sx={{ 
              fontSize: '150px',
              mb: 4
            }}>
              🏆
            </Typography>
            
            <Typography variant="h1" sx={{ 
              fontWeight: 'bold',
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
              mb: 2
            }}>
              Bathroom Perfectly Cleaned!
            </Typography>
            
            <Chip 
              label="All Steps Completed!"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                fontFamily: 'Poppins, sans-serif',
                mb: 4,
                px: 3,
                py: 1
              }}
            />
            
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Excellent work! You've successfully cleaned the entire bathroom!
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                onClick={resetGame}
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
                onClick={handleNextLevel}
                sx={{ 
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.2rem',
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

        <style>
          {`
            @keyframes pulse {
              0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
              50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.7; }
              100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            @keyframes dropZonePulse {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4); }
              70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(33, 150, 243, 0); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
            }
            @keyframes glowPulse {
              0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
              50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
            }
            @keyframes sparkle {
              0%, 100% { opacity: 0; transform: scale(0); }
              50% { opacity: 1; transform: scale(1); }
            }
            @keyframes rotate {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes floatUpLong {
              0% {
                transform: translateY(0) scale(1) rotate(0deg);
                opacity: 0.7;
              }
              20% {
                transform: translateY(-15px) scale(1.05) rotate(3deg);
                opacity: 0.9;
              }
              40% {
                transform: translateY(-30px) scale(1.1) rotate(0deg);
                opacity: 1;
              }
              60% {
                transform: translateY(-45px) scale(1.05) rotate(-3deg);
                opacity: 0.8;
              }
              80% {
                transform: translateY(-60px) scale(1.02) rotate(0deg);
                opacity: 0.6;
              }
              100% {
                transform: translateY(-75px) scale(0.95) rotate(0deg);
                opacity: 0;
              }
            }
            @keyframes taskStarBlink {
              0% {
                opacity: 0;
                transform: scale(0) rotate(0deg);
              }
              25% {
                opacity: 1;
                transform: scale(1.3) rotate(15deg);
              }
              50% {
                opacity: 0.9;
                transform: scale(1.1) rotate(-10deg);
              }
              75% {
                opacity: 1;
                transform: scale(1.2) rotate(5deg);
              }
              100% {
                opacity: 0;
                transform: scale(0.6) rotate(10deg);
              }
            }
          `}
        </style>
      </div>
    </ThemeProvider>
  );
};

export default HouseholdLevel2;