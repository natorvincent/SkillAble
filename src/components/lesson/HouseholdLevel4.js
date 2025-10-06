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
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import kitchenBg from "../../assets/householdLevel4/kitchen.jpg";
import mascotHappy from "../../assets/householdLevel4/mascothappy.png";
import mascotSad from "../../assets/householdLevel4/mascotsad.png";

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
import trashBin from "../../assets/householdLevel4/trashbin.png";

// Page constants
const PAGES = {
  LANDING: 'landing',
  INSTRUCTIONS: 'instructions',
  GAME: 'game'
};

// Trash categories
const CATEGORIES = {
  BIODEGRADABLE: 'biodegradable',
  NON_BIODEGRADABLE: 'non-biodegradable',
  RECYCLABLE: 'recyclable'
};

// Trash items data for instructions page with voice descriptions
const trashItems = [
  {
    id: 1,
    name: "Banana Peel",
    image: bananaPeel,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Food waste that decomposes naturally",
    voiceText: "Banana Peel. This is biodegradable because it's food waste that breaks down naturally and enriches the soil."
  },
  {
    id: 2,
    name: "Candy Wrapper",
    image: candyWrapper,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Plastic packaging that doesn't decompose",
    voiceText: "Candy Wrapper. This is non-biodegradable because it's made of plastic that doesn't break down and can harm the environment."
  },
  {
    id: 3,
    name: "Cardboard",
    image: cardboard,
    category: CATEGORIES.RECYCLABLE,
    description: "Paper product that can be recycled",
    voiceText: "Cardboard. This is recyclable because it can be processed into new paper products, saving trees and energy."
  },
  {
    id: 4,
    name: "Carrot Peel",
    image: carrotPeel,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Vegetable waste that decomposes quickly",
    voiceText: "Carrot Peel. This is biodegradable because it's vegetable waste that decomposes quickly and returns nutrients to the soil."
  },
  {
    id: 5,
    name: "Diaper",
    image: diaper,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Hygiene product that takes centuries to decompose",
    voiceText: "Diaper. This is non-biodegradable because it contains plastics and synthetic materials that take hundreds of years to break down."
  },
  {
    id: 6,
    name: "Egg Shell",
    image: eggShell,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Natural material that decomposes",
    voiceText: "Egg Shell. This is biodegradable because it's a natural material that decomposes and adds calcium to compost."
  },
  {
    id: 7,
    name: "Glass Bottle",
    image: glassBottle,
    category: CATEGORIES.RECYCLABLE,
    description: "Glass can be melted and reused",
    voiceText: "Glass Bottle. This is recyclable because glass can be melted down and made into new bottles and jars endlessly."
  },
  {
    id: 8,
    name: "Grass Trimmings",
    image: grassTrimmings,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Yard waste that decomposes naturally",
    voiceText: "Grass Trimmings. This is biodegradable because yard waste breaks down naturally and makes great compost for gardens."
  },
  {
    id: 9,
    name: "Newspaper",
    image: newspaper,
    category: CATEGORIES.RECYCLABLE,
    description: "Paper that can be recycled into new paper",
    voiceText: "Newspaper. This is recyclable because paper can be pulped and made into new paper products, reducing deforestation."
  },
  {
    id: 10,
    name: "Metal Can",
    image: can,
    category: CATEGORIES.RECYCLABLE,
    description: "Metal that can be recycled into new products",
    voiceText: "Metal Can. This is recyclable because metals like aluminum and steel can be melted and reformed into new cans and products."
  },
  {
    id: 11,
    name: "Plastic Bottle",
    image: plasticBottle,
    category: CATEGORIES.RECYCLABLE,
    description: "Plastic that can be processed into new products",
    voiceText: "Plastic Bottle. This is recyclable because certain plastics can be melted and made into new bottles, furniture, and clothing."
  },
  {
    id: 12,
    name: "Styrofoam",
    image: styrofoam,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Foam plastic that doesn't decompose",
    voiceText: "Styrofoam. This is non-biodegradable because this foam plastic doesn't break down and can release harmful chemicals."
  },
  {
    id: 13,
    name: "Tea Bag",
    image: teaBag,
    category: CATEGORIES.BIODEGRADABLE,
    description: "Organic material that decomposes",
    voiceText: "Tea Bag. This is biodegradable because the tea leaves are organic material that decomposes, though some bags have plastic fibers."
  },
  {
    id: 14,
    name: "Plastic Bag",
    image: plasticBag,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Plastic that cannot be recycled",
    voiceText: "Plastic Bag. This is non-biodegradable because most plastic bags aren't recyclable and can take centuries to break down, harming wildlife."
  },
  {
    id: 15,
    name: "Wet Wipes",
    image: wetWipes,
    category: CATEGORIES.NON_BIODEGRADABLE,
    description: "Synthetic material that persists in environment",
    voiceText: "Wet Wipes. This is non-biodegradable because they contain synthetic fibers that don't break down and can clog pipes and harm ecosystems."
  }
];

// Group items by category for instructions
const itemsByCategory = {
  [CATEGORIES.BIODEGRADABLE]: trashItems.filter(item => item.category === CATEGORIES.BIODEGRADABLE),
  [CATEGORIES.NON_BIODEGRADABLE]: trashItems.filter(item => item.category === CATEGORIES.NON_BIODEGRADABLE),
  [CATEGORIES.RECYCLABLE]: trashItems.filter(item => item.category === CATEGORIES.RECYCLABLE)
};

export default function HouseholdLevel4() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(PAGES.LANDING);
  
  // Instructions page state
  const [clickedItems, setClickedItems] = useState(new Set());
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Game page state
  const [gameItems, setGameItems] = useState([]);
  const [sortedItems, setSortedItems] = useState({
    [CATEGORIES.BIODEGRADABLE]: [],
    [CATEGORIES.NON_BIODEGRADABLE]: [],
    [CATEGORIES.RECYCLABLE]: []
  });
  
  const [gameCompleted, setGameCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [itemsRemaining, setItemsRemaining] = useState(15);
  const [animatingItems, setAnimatingItems] = useState({});

  const [assistantMessage, setAssistantMessage] = useState('');
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [isHappyMascot, setIsHappyMascot] = useState(true);
  const [messageTimeout, setMessageTimeout] = useState(null);

  // Speech synthesis setup
  const speechSynthesis = useRef(null);

  useEffect(() => {
    return () => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [messageTimeout]);

  useEffect(() => {
    speechSynthesis.current = window.speechSynthesis;
    
    // Clean up speech on unmount
    return () => {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  // Voice function
  const speakItem = (item) => {
    // Cancel any current speech
    if (speechSynthesis.current && isSpeaking) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
    }

    // Create new speech
    const utterance = new SpeechSynthesisUtterance(item.voiceText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeech(item.id);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeech(null);
    };

    speechSynthesis.current.speak(utterance);
  };

  // Stop speech function
  const stopSpeech = () => {
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
      setIsSpeaking(false);
      setCurrentSpeech(null);
    }
  };

  // Initialize game
  const initializeGame = () => {
    // Stop any ongoing speech when leaving instructions
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
  };

  // Page navigation handlers
  const goToInstructions = () => setCurrentPage(PAGES.INSTRUCTIONS);
  const goToGame = () => {
    setCurrentPage(PAGES.GAME);
    initializeGame();
  };
  const goToHome = () => {
    stopSpeech();
    navigate('/homepage');
  };

  // Instructions page handlers
  const handleItemClick = (item) => {
    // Stop current speech if any
    if (isSpeaking) {
      stopSpeech();
      // If clicking the same item that was speaking, just stop and return
      if (currentSpeech === item.id) {
        return;
      }
    }

    // Mark as clicked
    const newClickedItems = new Set(clickedItems);
    newClickedItems.add(item.id);
    setClickedItems(newClickedItems);
  };

  const allItemsClicked = clickedItems.size === trashItems.length;

  // Game page handlers
  const handleDrop = (category, event) => {
    event.preventDefault();
    const itemId = parseInt(event.dataTransfer.getData('itemId'));
    const item = gameItems.find(item => item.id === itemId);
    
    if (item) {
      if (item.category === category) {
        // Correct category
        setSortedItems(prev => ({
          ...prev,
          [category]: [...prev[category], item]
        }));
        setGameItems(prev => prev.filter(gameItem => gameItem.id !== itemId));
        setItemsRemaining(prev => prev - 1);
        setScore(prev => prev + 10);
        setFeedbackMessage(`Correct! ${item.name} goes in ${getCategoryName(category)}.`);
        setShowFeedback(true);
      } else {
        // Wrong category
        setScore(prev => Math.max(0, prev - 5));
        setFeedbackMessage(`Try again! ${item.name} doesn't belong in ${getCategoryName(category)}.`);
        setShowFeedback(true);
      }
    }
  };

  const handleDropWithAnimation = (category, event) => {
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

        // Show success message immediately
        setAssistantMessage(`Great job! ${item.name} belongs in ${getCategoryName(category)}.`);
        setAssistantVisible(true);
        setIsHappyMascot(true);

        // Wait for animation to complete before updating state
        setTimeout(() => {
          // Correct category
          setSortedItems(prev => ({
            ...prev,
            [category]: [...prev[category], item]
          }));
          setGameItems(prev => prev.filter(gameItem => gameItem.id !== itemId));
          setItemsRemaining(prev => prev - 1);
          setScore(prev => prev + 10);
          
          // Remove animation state
          setAnimatingItems(prev => {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
          });

          // Auto-hide message after 3 seconds
          const timeout = setTimeout(() => {
            setAssistantVisible(false);
          }, 3000);
          setMessageTimeout(timeout);
        }, 800);
      } else {
        // Wrong category
        setScore(prev => Math.max(0, prev - 5));
        
        // Show error message
        setAssistantMessage(`Try again! ${item.name} doesn't belong in ${getCategoryName(category)}.`);
        setAssistantVisible(true);
        setIsHappyMascot(false);

        // Auto-hide error message after 3 seconds
        const timeout = setTimeout(() => {
          setAssistantVisible(false);
        }, 3000);
        setMessageTimeout(timeout);
      }
    }
  };

  const handleDragStart = (itemId, event) => {
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
      case CATEGORIES.BIODEGRADABLE: return "#90BE6D"; // Green
      case CATEGORIES.NON_BIODEGRADABLE: return "#FF595E"; // Red
      case CATEGORIES.RECYCLABLE: return "#1982C4"; // Blue
      default: return "#666";
    }
  };

  // Check if game is completed
  useEffect(() => {
    if (itemsRemaining === 0 && !gameCompleted) {
      setGameCompleted(true);
      setAssistantMessage("Congratulations! You've sorted all the trash correctly!");
      setAssistantVisible(true);
      setIsHappyMascot(true);
      
      // Auto-hide success message after 3 seconds
      const timeout = setTimeout(() => {
        setAssistantVisible(false);
      }, 3000);
      setMessageTimeout(timeout);
    }
  }, [itemsRemaining, gameCompleted]);

  const resetGame = () => {
    initializeGame();
    setAssistantVisible(false);
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
        onClick={goToInstructions}
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

  const renderInstructionsPage = () => (
    <Container maxWidth="xl" sx={{ py: 1, flex: 1 }}>
      <Paper elevation={10} sx={{ 
        p: 2, // Increased padding for better spacing
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '15px', 
        mb: 1,
        flexShrink: 0,
        position: 'relative'
      }}>
        {/* Header Container with centered title and right-aligned button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          position: 'relative',
          mb: 2,
          pt: 1.5
        }}>
          {/* Centered Title Section */}
          <Box sx={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            width: 'fit-content'
          }}>
            <Typography variant="h4" sx={{ 
              color: '#1982C4', 
              fontWeight: 'bold', 
              fontFamily: 'Poppins, sans-serif',
              whiteSpace: 'nowrap'
            }}>
              🗑️ Trash Sorting Guide
            </Typography>
            
            <Typography variant="h6" sx={{ 
              color: '#280B60', 
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              whiteSpace: 'nowrap'
            }}>
              Click on each item to learn about its proper disposal category
            </Typography>
          </Box>

          {/* Spacer to balance the layout */}
          <Box sx={{ flex: 1 }} />
          
          {/* Voice Toggle Button - Right side */}
          <Button 
            variant={voiceEnabled ? "contained" : "outlined"}
            onClick={() => {
              const newVoiceState = !voiceEnabled;
              setVoiceEnabled(newVoiceState);
              // Stop any currently running speech when turning voice off
              if (!newVoiceState && isSpeaking) {
                stopSpeech();
              }
            }}
            startIcon={voiceEnabled ? "🔊" : "🔇"}
            sx={{ 
              minWidth: '140px',
              backgroundColor: voiceEnabled ? '#90BE6D' : 'transparent',
              color: voiceEnabled ? 'white' : '#90BE6D',
              borderColor: '#90BE6D',
              '&:hover': {
                backgroundColor: voiceEnabled ? '#7DA85D' : 'rgba(144, 190, 109, 0.1)',
              },
              fontWeight: 'bold',
              flexShrink: 0
            }}
          >
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </Button>
        </Box>
      </Paper>

      {/* Categories Grid - 3 rows x 5 columns with labels */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr 1fr',
        gridTemplateRows: 'auto 1fr 1fr 1fr',
        gap: '12px',
        height: 'calc(100vh - 200px)',
        overflow: 'hidden'
      }}>
        {/* Category Labels */}
        <Box sx={{ gridColumn: '1', gridRow: '2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#90BE6D', transform: 'rotate(-90deg)' }}>
            Biodegradable
          </Typography>
        </Box>
        <Box sx={{ gridColumn: '1', gridRow: '3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FF595E', transform: 'rotate(-90deg)' }}>
            Non-Biodegradable
          </Typography>
        </Box>
        <Box sx={{ gridColumn: '1', gridRow: '4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1982C4', transform: 'rotate(-90deg)' }}>
            Recyclables
          </Typography>
        </Box>

        {/* Biodegradable Items */}
        {itemsByCategory[CATEGORIES.BIODEGRADABLE].map((item, index) => (
          <Card 
            key={item.id}
            onClick={() => {
              handleItemClick(item);
              if (voiceEnabled) {
                speakItem(item);
              }
            }}
            sx={{ 
              gridColumn: `${index + 2}`,
              gridRow: '2',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: clickedItems.has(item.id) ? '4px solid #90BE6D' : '4px solid transparent',
              backgroundColor: clickedItems.has(item.id) ? '#f0f9f0' : 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0,
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 6
              }
            }}
          >
            {voiceEnabled && currentSpeech === item.id && (
              <Box sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#90BE6D',
                animation: 'pulse 1s infinite'
              }}>
                <style>{`
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                `}</style>
              </Box>
            )}
            <Box sx={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
              <CardMedia
                component="img"
                image={item.image}
                alt={item.name}
                sx={{ 
                  objectFit: 'contain', 
                  maxHeight: '60px',
                  maxWidth: '60px'
                }}
              />
            </Box>
            <CardContent sx={{ textAlign: 'center', py: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1982C4', fontSize: '0.8rem', mb: 0.5 }}>
                {item.name}
              </Typography>
              {clickedItems.has(item.id) && (
                <Typography variant="caption" sx={{ color: '#90BE6D', fontWeight: 'bold' }}>
                  ✓ Learned
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Non-Biodegradable Items */}
        {itemsByCategory[CATEGORIES.NON_BIODEGRADABLE].map((item, index) => (
          <Card 
            key={item.id}
            onClick={() => {
              handleItemClick(item);
              if (voiceEnabled) {
                speakItem(item);
              }
            }}
            sx={{ 
              gridColumn: `${index + 2}`,
              gridRow: '3',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: clickedItems.has(item.id) ? '4px solid #FF595E' : '4px solid transparent',
              backgroundColor: clickedItems.has(item.id) ? '#fff0f0' : 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0,
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 6
              }
            }}
          >
            {voiceEnabled && currentSpeech === item.id && (
              <Box sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FF595E',
                animation: 'pulse 1s infinite'
              }} />
            )}
            <Box sx={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
              <CardMedia
                component="img"
                image={item.image}
                alt={item.name}
                sx={{ 
                  objectFit: 'contain', 
                  maxHeight: '60px',
                  maxWidth: '60px'
                }}
              />
            </Box>
            <CardContent sx={{ textAlign: 'center', py: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1982C4', fontSize: '0.8rem', mb: 0.5 }}>
                {item.name}
              </Typography>
              {clickedItems.has(item.id) && (
                <Typography variant="caption" sx={{ color: '#FF595E', fontWeight: 'bold' }}>
                  ✓ Learned
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Recyclable Items */}
        {itemsByCategory[CATEGORIES.RECYCLABLE].map((item, index) => (
          <Card 
            key={item.id}
            onClick={() => {
              handleItemClick(item);
              if (voiceEnabled) {
                speakItem(item);
              }
            }}
            sx={{ 
              gridColumn: `${index + 2}`,
              gridRow: '4',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: clickedItems.has(item.id) ? '4px solid #1982C4' : '4px solid transparent',
              backgroundColor: clickedItems.has(item.id) ? '#f0f7ff' : 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 0,
              position: 'relative',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 6
              }
            }}
          >
            {voiceEnabled && currentSpeech === item.id && (
              <Box sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#1982C4',
                animation: 'pulse 1s infinite'
              }} />
            )}
            <Box sx={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
              <CardMedia
                component="img"
                image={item.image}
                alt={item.name}
                sx={{ 
                  objectFit: 'contain', 
                  maxHeight: '60px',
                  maxWidth: '60px'
                }}
              />
            </Box>
            <CardContent sx={{ textAlign: 'center', py: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1982C4', fontSize: '0.8rem', mb: 0.5 }}>
                {item.name}
              </Typography>
              {clickedItems.has(item.id) && (
                <Typography variant="caption" sx={{ color: '#1982C4', fontWeight: 'bold' }}>
                  ✓ Learned
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ 
        textAlign: 'center', 
        py: 1,
        flexShrink: 0 
      }}>
        <Button 
          variant="contained"
          onClick={goToGame}
          disabled={!allItemsClicked}
          sx={{ 
            background: allItemsClicked 
              ? 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)'
              : '#ccc',
            color: 'white',
            px: 6,
            py: 2,
            borderRadius: '25px',
            fontSize: '1.3rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: '700',
            textTransform: 'none',
            '&:hover': allItemsClicked ? {
              transform: 'scale(1.05)',
              boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)'
            } : {},
            '&.Mui-disabled': {
              backgroundColor: '#ccc'
            }
          }}
        >
          {allItemsClicked ? '🚀 Start Game' : 'Click all items to continue'}
        </Button>
        
        {!allItemsClicked && (
          <Typography variant="body2" sx={{ color: '#666', mt: 2 }}>
            {trashItems.length - clickedItems.size} items remaining
          </Typography>
        )}
      </Box>
    </Container>
  );

  const renderGamePage = () => (
    <Container maxWidth="xl" sx={{ py: 2, flex: 1 }}>
      {/* Score and Progress */}
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
            Items Remaining: {itemsRemaining}/15
          </Typography>
          <Chip 
            label={`Score: ${score}`} 
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
        gap: 3
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
              fontSize: '0.8rem'
            }}>
              ♻️ Biodegradable
            </Typography>
            <img 
              src={trashBin} 
              alt="Biodegradable Bin" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                filter: 'hue-rotate(120deg)'
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute',
                top: '15%',
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
              onDragOver={(e) => e.preventDefault()}
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
              fontSize: '0.8rem'
            }}>
              🚫 Non-Biodegradable
            </Typography>
            <img 
              src={trashBin} 
              alt="Non-Biodegradable Bin" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                filter: 'hue-rotate(300deg)'
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute',
                top: '15%',
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
              onDragOver={(e) => e.preventDefault()}
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
              fontSize: '0.8rem'
            }}>
              🔄 Recycle
            </Typography>
            <img 
              src={trashBin} 
              alt="Recyclable Bin" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                filter: 'hue-rotate(240deg)'
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute',
                top: '15%',
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
              onDragOver={(e) => e.preventDefault()}
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
                draggable
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
                  cursor: 'grab',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 2
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
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Button 
          variant="contained"
          onClick={() => setCurrentPage(PAGES.INSTRUCTIONS)}
          sx={{ 
            backgroundColor: 'white',
            color: '#1976d2',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          ↩️ Back to Instructions
        </Button>
        <Button 
          variant="contained"
          onClick={resetGame}
          sx={{ 
            backgroundColor: 'white',
            color: '#1976d2',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          🔄 Restart Game
        </Button>
        <Button 
          variant="contained"
          onClick={goToHome}
          sx={{ 
            backgroundColor: '#FF595E',
            color: 'white',
            '&:hover': {
              backgroundColor: '#E04549'
            }
          }}
        >
          🏠 Go Home
        </Button>
      </Stack>
    </Container>
  );

  return (
    <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${kitchenBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column"
    }}>
      <Navbar />
      
      {/* Voice Assistant Mascot - ALWAYS VISIBLE BUT MESSAGE BOX APPEARS/DISAPPEARS */}
      <Box sx={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 2,
        zIndex: 1000
      }}>
        {/* Mascot Image - Always visible and fixed in position */}
        <Box sx={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: `3px solid ${isHappyMascot ? '#90BE6D' : '#FF595E'}`,
          backgroundColor: 'white',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1001
        }}>
          <img 
            src={isHappyMascot ? mascotHappy : mascotSad} 
            alt="Assistant" 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }} 
          />
        </Box>
        
        {/* Message Box with Callout Style - Positioned absolutely relative to container */}
        {assistantVisible && (
          <Box sx={{
            position: 'absolute',
            left: '90px', // Position to the right of the avatar
            bottom: '0px',
            zIndex: 1000,
            animation: 'fadeIn 0.5s ease-in'
          }}>
            <Paper sx={{
              p: 2,
              backgroundColor: 'white',
              borderRadius: '20px',
              border: `3px solid ${isHappyMascot ? '#90BE6D' : '#FF595E'}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              maxWidth: '300px',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: '15px',
                left: '-20px',
                width: 0,
                height: 0,
                borderTop: '15px solid transparent',
                borderBottom: '15px solid transparent',
                borderRight: `20px solid ${isHappyMascot ? '#90BE6D' : '#FF595E'}`
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '18px',
                left: '-14px',
                width: 0,
                height: 0,
                borderTop: '12px solid transparent',
                borderBottom: '12px solid transparent',
                borderRight: '15px solid white'
              }
            }}>
              <Typography variant="body1" sx={{ 
                fontWeight: 'bold',
                color: isHappyMascot ? '#90BE6D' : '#FF595E',
                textAlign: 'center'
              }}>
                {assistantMessage}
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      {/* Add CSS animations - ONLY ONCE */}
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
      `}</style>

      {/* Render current page based on state */}
      {currentPage === PAGES.LANDING && renderLandingPage()}
      {currentPage === PAGES.INSTRUCTIONS && renderInstructionsPage()}
      {currentPage === PAGES.GAME && renderGamePage()}

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
          color: 'white'
        }}>
          <Typography variant="h1" sx={{ mb: 3 }}>🏆</Typography>
          <Typography variant="h2" sx={{ mb: 2 }}>Excellent Work!</Typography>
          <Typography variant="h4" sx={{ mb: 4 }}>Final Score: {score}</Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            You've mastered the art of trash sorting!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined"
              onClick={resetGame}
              sx={{ 
                borderColor: 'white',
                color: 'white',
                px: 3
              }}
            >
              🔄 Play Again
            </Button>
            <Button 
              variant="contained"
              onClick={goToHome}
              sx={{ 
                backgroundColor: '#FF595E',
                px: 4
              }}
            >
              🏠 Return Home
            </Button>
          </Box>
        </Box>
      </Dialog>
    </div>
  );
}