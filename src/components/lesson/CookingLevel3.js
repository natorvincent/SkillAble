import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

export default function CookingLevel3() {
  const navigate = useNavigate();
  const { moduleId: routeModuleId, lessonId: routeLessonId } = useParams();
  const [currentIngredient, setCurrentIngredient] = useState(0);
  const [gameMode, setGameMode] = useState('explore'); // 'explore', 'memory', or 'create'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [discovered, setDiscovered] = useState([]);
  const [memoryCards, setMemoryCards] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(false); // Off by default for sensory sensitivity
  const [currentRecipe, setCurrentRecipe] = useState([]);
  const [animationSpeed, setAnimationSpeed] = useState('normal'); // 'slow', 'normal', 'fast'
  
  // Level progression props
  const currentLevel = 3; // Level 3
  const maxLevel = 3;
  const moduleId = routeModuleId || 'cooking-basics';
  const lessonId = routeLessonId || 'sensory-cooking';

  // Level 3: Sensory-Friendly Cooking Experience - Gentle textures and familiar foods
  const sensoryIngredients = [
    { 
      id: 1, 
      name: "SOFT BANANA", 
      emoji: "🍌", 
      textureEmoji: "🟡",
      color: "#FFF9C4", // Very soft yellow
      texture: "smooth and creamy",
      temperature: "room temperature",
      description: "Bananas are soft, sweet, and easy to mash with a fork",
      sensoryTip: "Feel the smooth peel and soft inside",
      soundDescription: "quiet squishing sound when mashed",
      encouragement: "Great! Bananas are perfect for gentle cooking!"
    },
    { 
      id: 2, 
      name: "WARM OATS", 
      emoji: "🥣", 
      textureEmoji: "🟤",
      color: "#F3E5AB", // Warm beige
      texture: "soft and warm",
      temperature: "comfortably warm",
      description: "Oats become soft and creamy when cooked with warm milk",
      sensoryTip: "Stir gently and feel the smooth texture",
      soundDescription: "gentle bubbling when cooking",
      encouragement: "Perfect! Warm oats are so comforting!"
    },
    { 
      id: 3, 
      name: "COOL YOGURT", 
      emoji: "🥛", 
      textureEmoji: "⚪",
      color: "#F8F8FF", // Very pale blue-white
      texture: "smooth and cool",
      temperature: "pleasantly cool",
      description: "Yogurt is creamy, cool, and gentle on the tummy",
      sensoryTip: "Notice the cool, smooth feeling",
      soundDescription: "very quiet stirring sound",
      encouragement: "Wonderful! Cool yogurt feels so refreshing!"
    },
    { 
      id: 4, 
      name: "SOFT BERRIES", 
      emoji: "🫐", 
      textureEmoji: "🔵",
      color: "#E8EAF6", // Very soft lavender
      texture: "small and juicy",
      temperature: "cool and fresh",
      description: "Blueberries are small, sweet, and burst with gentle flavor",
      sensoryTip: "Feel their small, round shape",
      soundDescription: "tiny pop when you bite them",
      encouragement: "Amazing! Berries add gentle sweetness!"
    },
    { 
      id: 5, 
      name: "SMOOTH HONEY", 
      emoji: "🍯", 
      textureEmoji: "🟨",
      color: "#FFF8E1", // Very pale honey
      texture: "smooth and flowing",
      temperature: "room temperature",
      description: "Honey drizzles slowly and tastes sweet and gentle",
      sensoryTip: "Watch it drizzle slowly and smoothly",
      soundDescription: "no sound - completely quiet",
      encouragement: "Perfect! Honey makes everything taste sweet!"
    }
  ];

  const currentItem = sensoryIngredients[currentIngredient];

  // Simple, sensory-friendly recipes
  const gentleRecipes = [
    {
      name: "Calming Breakfast Bowl",
      ingredients: ["WARM OATS", "SOFT BANANA", "SMOOTH HONEY"],
      description: "A warm, comforting bowl perfect for starting the day"
    },
    {
      name: "Cool Berry Treat",
      ingredients: ["COOL YOGURT", "SOFT BERRIES", "SMOOTH HONEY"],
      description: "A refreshing, cool snack that's gentle and sweet"
    }
  ];

  // Load progress on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const progress = await getStudentLessonProgress(moduleId, lessonId);
        
        if (progress) {
          setCurrentIngredient(progress.currentIngredient || 0);
          setGameMode(progress.gameMode || 'explore');
          setScore(progress.score || 0);
          setDiscovered(progress.discovered || []);
          setCurrentRecipe(progress.currentRecipe || []);
          
          if (progress.discovered && progress.discovered.length === sensoryIngredients.length) {
            setShowCelebration(true);
          }
        }
      } catch (error) {
        console.error('Error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [moduleId, lessonId]);

  // Save progress
  const saveProgress = async (progressData) => {
    try {
      setProgressSaving(true);
      
      const progressToSave = {
        moduleId,
        lessonId,
        currentLevel,
        currentIngredient: progressData.currentIngredient,
        gameMode: progressData.gameMode,
        score: progressData.score,
        discovered: progressData.discovered,
        currentRecipe: progressData.currentRecipe,
        lastUpdated: new Date().toISOString(),
        isCompleted: progressData.discovered.length === sensoryIngredients.length
      };

      await saveStudentLessonProgress(moduleId, lessonId, progressToSave);
      
      if (progressToSave.isCompleted) {
        await updateModuleProgress(moduleId, {
          lessonsCompleted: [lessonId],
          lastCompletedLesson: lessonId,
          overallProgress: progressToSave.score / sensoryIngredients.length
        });
      }
      
      setProgressSaved(true);
      setTimeout(() => setProgressSaved(false), 2000);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  // Auto-save progress
  useEffect(() => {
    if (!loading) {
      const progressData = {
        currentIngredient,
        gameMode,
        score,
        discovered,
        currentRecipe
      };
      
      const saveTimer = setTimeout(() => {
        saveProgress(progressData);
      }, 1500); // Slightly longer delay for sensory comfort

      return () => clearTimeout(saveTimer);
    }
  }, [currentIngredient, gameMode, score, discovered, currentRecipe, loading]);

  // Gentle audio feedback
  const speak = (text, options = {}) => {
    if ('speechSynthesis' in window && autoPlayEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.6; // Even slower for sensory comfort
      utterance.pitch = 1.0; // Neutral pitch
      utterance.volume = 0.6; // Quieter for sensitivity
      speechSynthesis.speak(utterance);
    }
  };

  // Gentle sound effects (optional)
  const playGentleSound = (soundType) => {
    if (!soundEffectsEnabled) return;
    
    // Very quiet, pleasant sound effects only
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Very quiet
    
    switch(soundType) {
      case 'discover':
        oscillator.frequency.setValueAtTime(330, audioContext.currentTime); // Gentle E note
        break;
      case 'success':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Gentle A note
        break;
      default:
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // Gentle A note
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3); // Very brief
  };

  const handleExploreMode = () => {
    if (autoPlayEnabled && currentItem) {
      setTimeout(() => {
        speak(`Let's explore ${currentItem.name}. ${currentItem.description}. ${currentItem.sensoryTip}`);
      }, 800);
    }
  };

  useEffect(() => {
    if (gameMode === 'explore' && !loading) {
      handleExploreMode();
    }
  }, [currentIngredient, gameMode, autoPlayEnabled, loading]);

  const nextIngredient = () => {
    if (currentIngredient < sensoryIngredients.length - 1) {
      setCurrentIngredient(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else if (gameMode === 'explore') {
      setGameMode('memory');
      setCurrentIngredient(0);
      setupMemoryGame();
    }
  };

  const previousIngredient = () => {
    if (currentIngredient > 0) {
      setCurrentIngredient(prev => prev - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const discoverIngredient = () => {
    if (!discovered.includes(currentItem.id)) {
      const newDiscovered = [...discovered, currentItem.id];
      const newScore = score + 1;
      
      setDiscovered(newDiscovered);
      setScore(newScore);
      
      playGentleSound('discover');
      
      setTimeout(() => {
        speak(currentItem.encouragement);
      }, 400);
      
      setTimeout(() => {
        nextIngredient();
      }, 2500);
    }
  };

  const setupMemoryGame = () => {
    // Create gentle memory matching pairs
    const shuffledIngredients = [...sensoryIngredients]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3); // Only 3 pairs for sensory comfort
    
    const pairs = shuffledIngredients.concat(shuffledIngredients)
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({
        ...item,
        cardId: index,
        isFlipped: false,
        isMatched: false
      }));
    
    setMemoryCards(pairs);
  };

  const handleMemoryCard = (cardId) => {
    const flippedCards = memoryCards.filter(card => card.isFlipped && !card.isMatched);
    if (flippedCards.length >= 2) return;
    
    const newCards = memoryCards.map(card => 
      card.cardId === cardId ? { ...card, isFlipped: true } : card
    );
    
    setMemoryCards(newCards);
    
    const newFlippedCards = newCards.filter(card => card.isFlipped && !card.isMatched);
    
    if (newFlippedCards.length === 2) {
      setTimeout(() => {
        if (newFlippedCards[0].id === newFlippedCards[1].id) {
          // Match found
          const matchedCards = newCards.map(card => 
            card.id === newFlippedCards[0].id ? { ...card, isMatched: true } : card
          );
          setMemoryCards(matchedCards);
          playGentleSound('success');
          
          // Check if all matched
          if (matchedCards.every(card => card.isMatched)) {
            setTimeout(() => {
              setGameMode('create');
            }, 1500);
          }
        } else {
          // No match - flip back
          const resetCards = newCards.map(card => 
            newFlippedCards.includes(card) ? { ...card, isFlipped: false } : card
          );
          setMemoryCards(resetCards);
        }
      }, 1200); // Longer delay for processing
    }
  };

  const addToRecipe = (ingredientName) => {
    if (!currentRecipe.includes(ingredientName)) {
      const newRecipe = [...currentRecipe, ingredientName];
      setCurrentRecipe(newRecipe);
      playGentleSound('discover');
      
      // Check if recipe is complete
      const matchingRecipe = gentleRecipes.find(recipe => 
        recipe.ingredients.every(ing => newRecipe.includes(ing)) &&
        newRecipe.length === recipe.ingredients.length
      );
      
      if (matchingRecipe) {
        setTimeout(() => {
          setShowCelebration(true);
          speak(`Wonderful! You made ${matchingRecipe.name}! ${matchingRecipe.description}`);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCurrentIngredient(0);
    setGameMode('explore');
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setDiscovered([]);
    setCurrentRecipe([]);
    setMemoryCards([]);
    setShowCelebration(false);
    
    saveProgress({
      currentIngredient: 0,
      gameMode: 'explore',
      score: 0,
      discovered: [],
      currentRecipe: []
    });
  };

  const goToHomepage = () => {
    navigate('/homepage');
  };

  const continueToNextLevel = () => {
    // This is the final level, so go home
    goToHomepage();
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F8F9FA, #F3E5F5, #E8F5E8)',
        fontFamily: '"Segoe UI", "Comic Sans MS", cursive, Arial, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '30px',
          padding: '40px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
          border: '2px solid #E8EAF6'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🌟</div>
          <h2 style={{ fontSize: '1.4rem', color: '#5E35B1', marginBottom: '10px' }}>
            Loading your gentle cooking experience...
          </h2>
          <div style={{ 
            width: '30px', 
            height: '30px', 
            border: '3px solid #E1BEE7',
            borderTop: '3px solid #9C27B0',
            borderRadius: '50%',
            animation: `spin ${animationSpeed === 'slow' ? '2s' : '1s'} linear infinite`,
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  const getAnimationDuration = () => {
    switch(animationSpeed) {
      case 'slow': return '1s';
      case 'fast': return '0.3s';
      default: return '0.6s';
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: 'linear-gradient(135deg, #F8F9FA, #F3E5F5, #E8F5E8)', 
      padding: '20px',
      fontFamily: '"Segoe UI", "Comic Sans MS", cursive, Arial, sans-serif'
    },
    mainCard: {
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#FFFFFF',
      borderRadius: '30px',
      padding: '40px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      border: '2px solid #E8EAF6'
    },
    headerSection: {
      textAlign: 'center',
      marginBottom: '35px'
    },
    title: {
      fontSize: '2.2rem',
      fontWeight: '600', // Slightly lighter
      color: '#5E35B1',
      marginBottom: '10px',
      textShadow: '1px 1px 2px rgba(0,0,0,0.05)' // Softer shadow
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#6A4C93',
      marginBottom: '20px'
    },
    levelIndicator: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '1rem',
      color: '#5E35B1',
      fontWeight: '500',
      backgroundColor: '#F3E5F5',
      padding: '8px 16px',
      borderRadius: '20px',
      display: 'inline-block'
    },
    accessibilityControls: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginBottom: '25px',
      flexWrap: 'wrap'
    },
    accessibilityGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.9rem'
    },
    progressIndicator: {
      textAlign: 'center',
      marginBottom: '15px',
      fontSize: '0.9rem',
      color: progressSaving ? '#9C27B0' : progressSaved ? '#4CAF50' : '#666',
      opacity: progressSaving || progressSaved ? 1 : 0.7
    },
    modeToggle: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '30px',
      flexWrap: 'wrap'
    },
    modeButton: {
      padding: '10px 20px',
      borderRadius: '20px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: `all ${getAnimationDuration()} ease`,
      minWidth: '120px'
    },
    activeMode: {
      backgroundColor: '#9C27B0',
      color: 'white',
      transform: 'scale(1.02)'
    },
    inactiveMode: {
      backgroundColor: '#F5F5F5',
      color: '#666'
    },
    progressBar: {
      width: '100%',
      height: '12px',
      backgroundColor: '#F5F5F5',
      borderRadius: '10px',
      marginBottom: '20px',
      overflow: 'hidden',
      border: '1px solid #E0E0E0'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#9C27B0',
      borderRadius: '10px',
      transition: `width ${getAnimationDuration()} ease`,
      width: `${((currentIngredient + 1) / sensoryIngredients.length) * 100}%`
    },
    ingredientDisplay: {
      textAlign: 'center',
      backgroundColor: currentItem?.color || '#F8F9FA',
      borderRadius: '25px',
      padding: '30px',
      marginBottom: '25px',
      border: '2px solid #E8EAF6',
      transition: `background-color ${getAnimationDuration()} ease`
    },
    ingredientVisual: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px'
    },
    emojiLarge: {
      fontSize: '4rem',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
    },
    textureEmoji: {
      fontSize: '2rem',
      opacity: 0.7
    },
    ingredientName: {
      fontSize: '2rem',
      fontWeight: '500',
      color: '#5E35B1',
      marginBottom: '15px'
    },
    description: {
      fontSize: '1.2rem',
      color: '#6A4C93',
      lineHeight: 1.5,
      maxWidth: '500px',
      margin: '0 auto 15px auto'
    },
    sensoryInfo: {
      fontSize: '1rem',
      color: '#7B1FA2',
      fontStyle: 'italic',
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: '#F3E5F5',
      padding: '10px 15px',
      borderRadius: '15px',
      border: '1px solid #E1BEE7'
    },
    controlButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    controlButton: {
      padding: '10px 16px',
      borderRadius: '16px',
      border: 'none',
      fontSize: '0.95rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: `all ${getAnimationDuration()} ease`,
      minWidth: '120px'
    },
    primaryButton: {
      backgroundColor: '#2196F3',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    gentleButton: {
      backgroundColor: '#9C27B0',
      color: 'white'
    },
    exploreButton: {
      backgroundColor: '#FF9800',
      color: 'white',
      fontSize: '1.1rem',
      padding: '12px 24px'
    },
    memoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '15px',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px'
    },
    memoryCard: {
      width: '100px',
      height: '100px',
      borderRadius: '15px',
      border: '2px solid #E8EAF6',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: `all ${getAnimationDuration()} ease`,
      backgroundColor: '#FAFAFA'
    },
    memoryCardFlipped: {
      backgroundColor: '#F3E5F5',
      transform: 'scale(1.02)'
    },
    memoryCardMatched: {
      backgroundColor: '#C8E6C9',
      border: '2px solid #4CAF50'
    },
    recipeBuilder: {
      textAlign: 'center',
      padding: '20px'
    },
    recipeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      maxWidth: '600px',
      margin: '20px auto'
    },
    ingredientCard: {
      padding: '15px',
      borderRadius: '15px',
      border: '2px solid #E8EAF6',
      cursor: 'pointer',
      transition: `all ${getAnimationDuration()} ease`,
      backgroundColor: '#FAFAFA'
    },
    selectedIngredient: {
      backgroundColor: '#E8F5E8',
      border: '2px solid #4CAF50',
      transform: 'scale(1.02)'
    },
    celebration: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(156, 39, 176, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    celebrationContent: {
      textAlign: 'center',
      color: 'white',
      padding: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        
        <div style={styles.headerSection}>
          <h1 style={styles.title}>🌟 Gentle Cooking</h1>
          <p style={styles.subtitle}>Explore ingredients with all your senses</p>
          <div style={styles.levelIndicator}>
            ✨ Level {currentLevel} - Sensory Experience
          </div>
          
          <div style={styles.progressIndicator}>
            {progressSaving && '💾 Saving gently...'}
            {progressSaved && '✅ Saved!'}
            {!progressSaving && !progressSaved && `🌟 Discovered: ${discovered.length}/${sensoryIngredients.length}`}
          </div>
          
          <div style={styles.accessibilityControls}>
            <div style={styles.accessibilityGroup}>
              <span>🔊 Voice:</span>
              <button
                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                style={{
                  ...styles.controlButton,
                  ...(autoPlayEnabled ? styles.primaryButton : styles.secondaryButton),
                  minWidth: '60px',
                  padding: '6px 10px'
                }}
              >
                {autoPlayEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div style={styles.accessibilityGroup}>
              <span>🔔 Sounds:</span>
              <button
                onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
                style={{
                  ...styles.controlButton,
                  ...(soundEffectsEnabled ? styles.primaryButton : styles.secondaryButton),
                  minWidth: '60px',
                  padding: '6px 10px'
                }}
              >
                {soundEffectsEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            
            <div style={styles.accessibilityGroup}>
              <span>⚡ Speed:</span>
              <select
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #E0E0E0',
                  fontSize: '0.9rem'
                }}
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>

          <div style={styles.modeToggle}>
            <button
              onClick={() => setGameMode('explore')}
              style={{
                ...styles.modeButton,
                ...(gameMode === 'explore' ? styles.activeMode : styles.inactiveMode)
              }}
            >
              🔍 Explore
            </button>
            <button
              onClick={() => { setGameMode('memory'); setupMemoryGame(); }}
              style={{
                ...styles.modeButton,
                ...(gameMode === 'memory' ? styles.activeMode : styles.inactiveMode)
              }}
            >
              🧠 Memory
            </button>
            <button
              onClick={() => setGameMode('create')}
              style={{
                ...styles.modeButton,
                ...(gameMode === 'create' ? styles.activeMode : styles.inactiveMode)
              }}
            >
              👨‍🍳 Create
            </button>
          </div>
        </div>

        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>

        {gameMode === 'explore' && (
          <>
            <p style={{ textAlign: 'center', fontSize: '1rem', color: '#6A4C93', marginBottom: '20px' }}>
              Ingredient {currentIngredient + 1} of {sensoryIngredients.length}
            </p>
            
            <div style={styles.ingredientDisplay}>
              <div style={styles.ingredientVisual}>
                <span style={styles.emojiLarge}>{currentItem.emoji}</span>
                <span style={styles.textureEmoji}>{currentItem.textureEmoji}</span>
              </div>
              <h2 style={styles.ingredientName}>{currentItem.name}</h2>
              <p style={styles.description}>{currentItem.description}</p>
              <div style={styles.sensoryInfo}>
                🤚 Feel: {currentItem.texture} • 🌡️ {currentItem.temperature}
                <br />
                💡 {currentItem.sensoryTip}
              </div>
            </div>

            <div style={styles.controlButtons}>
              <button
                onClick={() => speak(`${currentItem.name}. ${currentItem.description}`)}
                style={{
                  ...styles.controlButton,
                  ...styles.primaryButton
                }}
              >
                🔊 Listen
              </button>
              <button
                onClick={() => speak(currentItem.sensoryTip)}
                style={{
                  ...styles.controlButton,
                  ...styles.secondaryButton
                }}
              >
                💡 Sensory Tip
              </button>
              <button
                onClick={discoverIngredient}
                style={{
                  ...styles.controlButton,
                  ...styles.exploreButton
                }}
              >
                ✨ Discover
              </button>
            </div>

            <div style={styles.controlButtons}>
              <button
                onClick={previousIngredient}
                disabled={currentIngredient === 0}
                style={{
                  ...styles.controlButton,
                  ...styles.gentleButton,
                  opacity: currentIngredient === 0 ? 0.5 : 1
                }}
              >
                ⬅️ Previous
              </button>
              <button
                onClick={nextIngredient}
                style={{
                  ...styles.controlButton,
                  ...styles.gentleButton
                }}
              >
                {currentIngredient === sensoryIngredients.length - 1 ? '🧠 Try Memory!' : '➡️ Next'}
              </button>
              <button
                onClick={goToHomepage}
                style={{
                  ...styles.controlButton,
                  ...styles.primaryButton
                }}
              >
                🏠 Home
              </button>
            </div>
          </>
        )}

        {gameMode === 'memory' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#5E35B1', fontSize: '1.5rem', marginBottom: '10px' }}>
                🧠 Gentle Memory Game
              </h3>
              <p style={{ color: '#6A4C93', fontSize: '1rem' }}>
                Find matching pairs of ingredients. Take your time!
              </p>
            </div>
            
            <div style={styles.memoryGrid}>
              {memoryCards.map((card) => (
                <div
                  key={card.cardId}
                  onClick={() => handleMemoryCard(card.cardId)}
                  style={{
                    ...styles.memoryCard,
                    ...(card.isFlipped ? styles.memoryCardFlipped : {}),
                    ...(card.isMatched ? styles.memoryCardMatched : {}),
                    cursor: card.isMatched ? 'default' : 'pointer'
                  }}
                >
                  {card.isFlipped || card.isMatched ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem' }}>{card.emoji}</div>
                      <div style={{ fontSize: '0.7rem', color: '#5E35B1', marginTop: '5px' }}>
                        {card.name.split(' ')[0]}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '2rem', color: '#9C27B0' }}>❓</div>
                  )}
                </div>
              ))}
            </div>

            <div style={styles.controlButtons}>
              <button
                onClick={() => setGameMode('explore')}
                style={{
                  ...styles.controlButton,
                  ...styles.secondaryButton
                }}
              >
                🔍 Back to Explore
              </button>
              <button
                onClick={() => setGameMode('create')}
                style={{
                  ...styles.controlButton,
                  ...styles.gentleButton
                }}
              >
                👨‍🍳 Create Recipe
              </button>
            </div>
          </>
        )}

        {gameMode === 'create' && (
          <>
            <div style={styles.recipeBuilder}>
              <h3 style={{ color: '#5E35B1', fontSize: '1.5rem', marginBottom: '10px' }}>
                👨‍🍳 Create Your Gentle Recipe
              </h3>
              <p style={{ color: '#6A4C93', fontSize: '1rem', marginBottom: '20px' }}>
                Choose ingredients to make a delicious treat!
              </p>
              
              {currentRecipe.length > 0 && (
                <div style={{
                  backgroundColor: '#E8F5E8',
                  padding: '15px',
                  borderRadius: '15px',
                  margin: '20px auto',
                  maxWidth: '400px',
                  border: '2px solid #4CAF50'
                }}>
                  <h4 style={{ color: '#2E7D32', marginBottom: '10px' }}>Your Recipe:</h4>
                  <div style={{ fontSize: '1.1rem' }}>
                    {currentRecipe.join(' + ')}
                  </div>
                </div>
              )}
              
              <div style={styles.recipeGrid}>
                {sensoryIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    onClick={() => addToRecipe(ingredient.name)}
                    style={{
                      ...styles.ingredientCard,
                      ...(currentRecipe.includes(ingredient.name) ? styles.selectedIngredient : {}),
                      cursor: currentRecipe.includes(ingredient.name) ? 'default' : 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{ingredient.emoji}</div>
                    <div style={{ fontSize: '0.9rem', color: '#5E35B1', fontWeight: '500' }}>
                      {ingredient.name}
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#5E35B1', marginBottom: '15px' }}>Recipe Ideas:</h4>
                {gentleRecipes.map((recipe, index) => (
                  <div key={index} style={{
                    backgroundColor: '#F3E5F5',
                    padding: '10px 15px',
                    borderRadius: '12px',
                    margin: '8px auto',
                    maxWidth: '500px',
                    textAlign: 'left'
                  }}>
                    <strong style={{ color: '#5E35B1' }}>{recipe.name}:</strong> {recipe.ingredients.join(' + ')}
                    <br />
                    <span style={{ fontSize: '0.9rem', color: '#6A4C93', fontStyle: 'italic' }}>
                      {recipe.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.controlButtons}>
              <button
                onClick={() => setCurrentRecipe([])}
                style={{
                  ...styles.controlButton,
                  ...styles.secondaryButton
                }}
              >
                🔄 Clear Recipe
              </button>
              <button
                onClick={() => setGameMode('explore')}
                style={{
                  ...styles.controlButton,
                  ...styles.gentleButton
                }}
              >
                🔍 Back to Explore
              </button>
              <button
                onClick={goToHomepage}
                style={{
                  ...styles.controlButton,
                  ...styles.primaryButton
                }}
              >
                🏠 Home
              </button>
            </div>
          </>
        )}
      </div>

      {showCelebration && (
        <div style={styles.celebration}>
          <div style={styles.celebrationContent}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🌟</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Wonderful Cooking!</h2>
            <p style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
              You completed the gentle cooking experience!
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '30px', opacity: 0.9 }}>
              You've learned to cook with all your senses!
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={continueToNextLevel}
                style={{
                  ...styles.controlButton,
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  fontSize: '1.2rem',
                  padding: '15px 30px',
                  border: '2px solid white'
                }}
              >
                🏠 Complete Journey
              </button>
              
              <button
                onClick={resetGame}
                style={{
                  ...styles.controlButton,
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  fontSize: '1.2rem',
                  padding: '15px 30px'
                }}
              >
                🔄 Experience Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}