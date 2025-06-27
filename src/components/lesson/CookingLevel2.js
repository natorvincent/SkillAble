import React, { useState, useEffect } from 'react';

export default function CookingActionsLevel2() {
  const [currentAction, setCurrentAction] = useState(0);
  const [gameMode, setGameMode] = useState('learn'); // 'learn' or 'practice'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  
  // Level progression props
  const [currentLevel] = useState(2); // Level 2
  const [maxLevel] = useState(3);
  const [moduleId] = useState('cooking-basics');
  const [lessonId] = useState('cooking-actions');

  // Level 2: Basic Cooking Actions - Building on ingredient knowledge
  const cookingActions = [
    { 
      id: 1, 
      name: "CRACK", 
      emoji: "🥚", 
      actionEmoji: "",
      color: "#FFF3E0", // Soft orange
      sound: "crack",
      description: "We crack eggs by tapping them gently on a bowl",
      encouragement: "Great! You know how to crack eggs safely!",
      demonstration: "Tap the egg, then pull apart with your thumbs"
    },
    { 
      id: 2, 
      name: "POUR", 
      emoji: "🥛", 
      actionEmoji: "",
      color: "#E8F5E8", // Soft green
      sound: "pour", 
      description: "We pour milk slowly into a cup or bowl",
      encouragement: "Perfect! Pouring slowly prevents spills!",
      demonstration: "Tilt the container slowly and steadily"
    },
    { 
      id: 3, 
      name: "SLICE", 
      emoji: "🍞", 
      actionEmoji: "",
      color: "#FFF8E1", // Soft yellow
      sound: "slice",
      description: "We slice bread carefully with a knife",
      encouragement: "Excellent! Always be careful with knives!",
      demonstration: "Use a sawing motion, keep fingers away from blade"
    },
    { 
      id: 4, 
      name: "WASH", 
      emoji: "🍎", 
      actionEmoji: "",
      color: "#FFEBEE", // Soft pink
      sound: "wash",
      description: "We wash apples with clean water before eating",
      encouragement: "Wonderful! Clean food is healthy food!",
      demonstration: "Rinse under running water and rub gently"
    },
    { 
      id: 5, 
      name: "MIX", 
      emoji: "🥣", 
      actionEmoji: "",
      color: "#F3E5F5", // Soft purple
      sound: "mix",
      description: "We mix ingredients together with a spoon",
      encouragement: "Amazing! Mixing makes ingredients combine!",
      demonstration: "Stir in circles, scrape the sides of the bowl"
    }
  ];

  const currentItem = cookingActions[currentAction];

  // Gentle audio feedback for cooking instructions
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7; // Slower for cooking instructions
      utterance.pitch = 1.1; 
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleLearnMode = () => {
    if (autoPlayEnabled) {
      setTimeout(() => {
        speak(`${currentItem.name}. ${currentItem.description}`);
      }, 500);
    }
  };

  useEffect(() => {
    if (gameMode === 'learn') {
      handleLearnMode();
    }
  }, [currentAction, gameMode]);

  const nextAction = () => {
    if (currentAction < cookingActions.length - 1) {
      setCurrentAction(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setGameMode('practice');
      setCurrentAction(0);
    }
  };

  const previousAction = () => {
    if (currentAction > 0) {
      setCurrentAction(prev => prev - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const handlePracticeAnswer = (answerId) => {
    setSelectedAnswer(answerId);
    setShowFeedback(true);
    
    const isCorrect = answerId === currentItem.id;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setCompleted(prev => [...prev, currentItem.id]);
      
      setTimeout(() => {
        speak(currentItem.encouragement);
      }, 300);
      
      setTimeout(() => {
        if (currentAction < cookingActions.length - 1) {
          setCurrentAction(prev => prev + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        } else {
          setShowCelebration(true);
          setTimeout(() => {
            speak("Fantastic! You learned all the cooking actions!");
          }, 500);
        }
      }, 3500);
    } else {
      setTimeout(() => {
        speak(`Let's try again. This cooking action is ${currentItem.name}`);
      }, 300);
      
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, 2500);
    }
  };

  const resetGame = () => {
    setCurrentAction(0);
    setGameMode('learn');
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCompleted([]);
    setShowCelebration(false);
  };

  const goToHomepage = () => {
    if (window.history && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/homepage';
    }
  };

  const continueToNextLevel = () => {
    const hasNextLevel = currentLevel < maxLevel;
    
    if (hasNextLevel) {
      const nextLevel = currentLevel + 1;
      const nextLevelUrl = `/module/${moduleId}/lesson/${lessonId}/level/${nextLevel}`;
      window.location.href = nextLevelUrl;
    } else {
      goToHomepage();
    }
  };

  const hasNextLevel = currentLevel < maxLevel;

  const styles = {
    container: {
      minHeight: "100vh",
      background: 'linear-gradient(135deg, #F8F9FA, #FFF3E0, #E8F5E8)', 
      padding: '20px',
      fontFamily: '"Comic Sans MS", cursive, Arial, sans-serif'
    },
    mainCard: {
      maxWidth: '850px',
      margin: '0 auto',
      backgroundColor: '#FFFFFF',
      borderRadius: '25px',
      padding: '35px',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
      border: '3px solid #FF9800' // Orange for cooking theme
    },
    headerSection: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '2.3rem',
      fontWeight: 'bold',
      color: '#E65100', // Cooking orange
      marginBottom: '10px',
      textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
    },
    subtitle: {
      fontSize: '1.2rem',
      color: '#5D4037', // Warm brown
      marginBottom: '20px'
    },
    levelIndicator: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '1.1rem',
      color: '#E65100',
      fontWeight: 'bold',
      backgroundColor: '#FFF3E0',
      padding: '10px 20px',
      borderRadius: '20px',
      display: 'inline-block'
    },
    modeToggle: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginBottom: '30px'
    },
    modeButton: {
      padding: '12px 25px',
      borderRadius: '20px',
      border: 'none',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.4s ease',
      minWidth: '140px'
    },
    activeMode: {
      backgroundColor: '#FF9800',
      color: 'white',
      transform: 'scale(1.02)'
    },
    inactiveMode: {
      backgroundColor: '#F5F5F5',
      color: '#666'
    },
    progressBar: {
      width: '100%',
      height: '18px',
      backgroundColor: '#F5F5F5',
      borderRadius: '12px',
      marginBottom: '20px',
      overflow: 'hidden',
      border: '2px solid #E0E0E0'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#FF9800',
      borderRadius: '12px',
      transition: 'width 0.8s ease',
      width: `${((currentAction + 1) / cookingActions.length) * 100}%`
    },
    actionDisplay: {
      textAlign: 'center',
      backgroundColor: currentItem?.color || '#F8F9FA',
      borderRadius: '20px',
      padding: '35px',
      marginBottom: '30px',
      border: '2px solid #FF9800',
      transition: 'background-color 0.5s ease'
    },
    actionVisual: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '20px',
      marginBottom: '20px'
    },
    emojiLarge: {
      fontSize: '5rem',
      filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))'
    },
    actionEmoji: {
      fontSize: '3rem',
      color: '#E65100'
    },
    actionName: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#E65100',
      marginBottom: '15px',
      textShadow: '1px 1px 3px rgba(0,0,0,0.1)'
    },
    description: {
      fontSize: '1.3rem',
      color: '#5D4037',
      lineHeight: 1.6,
      maxWidth: '500px',
      margin: '0 auto 15px auto'
    },
    demonstration: {
      fontSize: '1.1rem',
      color: '#795548',
      fontStyle: 'italic',
      maxWidth: '450px',
      margin: '0 auto',
      backgroundColor: '#FFF8E1',
      padding: '10px 15px',
      borderRadius: '15px',
      border: '1px solid #FFE0B2'
    },
    controlButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
      marginBottom: '25px',
      flexWrap: 'wrap'
    },
    controlButton: {
      padding: '12px 20px',
      borderRadius: '18px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: '130px'
    },
    primaryButton: {
      backgroundColor: '#2196F3',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    navigationButton: {
      backgroundColor: '#9C27B0',
      color: 'white'
    },
    practiceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '18px',
      maxWidth: '700px',
      margin: '0 auto'
    },
    answerOption: {
      padding: '18px',
      borderRadius: '18px',
      border: '2px solid #E8E8E8',
      cursor: 'pointer',
      transition: 'all 0.4s ease',
      textAlign: 'center',
      backgroundColor: '#FAFAFA'
    },
    correctAnswer: {
      backgroundColor: '#C8E6C9',
      border: '2px solid #4CAF50',
      transform: 'scale(1.02)'
    },
    incorrectAnswer: {
      backgroundColor: '#FFCDD2',
      border: '2px solid #E57373'
    },
    answerVisual: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
      marginBottom: '8px'
    },
    answerEmoji: {
      fontSize: '2rem'
    },
    answerActionEmoji: {
      fontSize: '1.5rem',
      color: '#E65100'
    },
    answerText: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#E65100'
    },
    feedbackSection: {
      textAlign: 'center',
      padding: '18px',
      borderRadius: '18px',
      marginTop: '20px'
    },
    celebration: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 152, 0, 0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    celebrationContent: {
      textAlign: 'center',
      color: 'white',
      padding: '20px'
    },
    toggleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '20px'
    },
    audioToggle: {
      fontSize: '1rem',
      color: '#5D4037'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        
        <div style={styles.headerSection}>
          <h1 style={styles.title}>👨‍🍳 Cooking Actions</h1>
          <p style={styles.subtitle}>Let's learn how to cook safely!</p>
          <div style={styles.levelIndicator}>
            🔥 Level {currentLevel} of {maxLevel} - Cooking Skills!
          </div>
          
          <div style={styles.toggleContainer}>
            <span style={styles.audioToggle}>🔊 Cooking Instructions:</span>
            <button
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              style={{
                ...styles.controlButton,
                ...(autoPlayEnabled ? styles.primaryButton : styles.secondaryButton),
                minWidth: '70px',
                padding: '8px 12px'
              }}
            >
              {autoPlayEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div style={styles.modeToggle}>
            <button
              onClick={() => setGameMode('learn')}
              style={{
                ...styles.modeButton,
                ...(gameMode === 'learn' ? styles.activeMode : styles.inactiveMode)
              }}
            >
              📖 Learn
            </button>
            <button
              onClick={() => setGameMode('practice')}
              style={{
                ...styles.modeButton,
                ...(gameMode === 'practice' ? styles.activeMode : styles.inactiveMode)
              }}
            >
              🎯 Practice
            </button>
          </div>
        </div>

        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>
        <p style={{ textAlign: 'center', fontSize: '1rem', color: '#5D4037', marginBottom: '20px' }}>
          Cooking Action {currentAction + 1} of {cookingActions.length}
        </p>

        {gameMode === 'learn' ? (
          <>
            <div style={styles.actionDisplay}>
              <div style={styles.actionVisual}>
                <span style={styles.emojiLarge}>{currentItem.emoji}</span>
              </div>
              <h2 style={styles.actionName}>{currentItem.name}</h2>
              <p style={styles.description}>{currentItem.description}</p>
              <div style={styles.demonstration}>
                💡 How to: {currentItem.demonstration}
              </div>
            </div>

            <div style={styles.controlButtons}>
              <button
                onClick={() => speak(currentItem.name)}
                style={{
                  ...styles.controlButton,
                  ...styles.primaryButton
                }}
              >
                🔊 Say Action
              </button>
              <button
                onClick={() => speak(currentItem.demonstration)}
                style={{
                  ...styles.controlButton,
                  ...styles.secondaryButton
                }}
              >
                📝 How To
              </button>
            </div>

            <div style={styles.controlButtons}>
              <button
                onClick={previousAction}
                disabled={currentAction === 0}
                style={{
                  ...styles.controlButton,
                  ...styles.navigationButton,
                  opacity: currentAction === 0 ? 0.5 : 1
                }}
              >
                ⬅️ Back
              </button>
              <button
                onClick={nextAction}
                style={{
                  ...styles.controlButton,
                  ...styles.navigationButton
                }}
              >
                {currentAction === cookingActions.length - 1 ? '🎯 Try Practice!' : '➡️ Next'}
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
        ) : (
          <>
            <div style={styles.actionDisplay}>
              <span style={styles.emojiLarge}>🤔</span>
              <h2 style={styles.actionName}>What do we do with this?</h2>
              <span style={styles.emojiLarge}>{currentItem.emoji}</span>
            </div>

            <div style={styles.practiceGrid}>
              {cookingActions.map((action) => (
                <div
                  key={action.id}
                  onClick={() => !showFeedback && handlePracticeAnswer(action.id)}
                  style={{
                    ...styles.answerOption,
                    ...(showFeedback && selectedAnswer === action.id && action.id === currentItem.id ? styles.correctAnswer : {}),
                    ...(showFeedback && selectedAnswer === action.id && action.id !== currentItem.id ? styles.incorrectAnswer : {}),
                    cursor: showFeedback ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div style={styles.answerVisual}>
                    <span style={styles.answerEmoji}>{action.emoji}</span>
                  </div>
                  <div style={styles.answerText}>{action.name}</div>
                </div>
              ))}
            </div>

            {showFeedback && (
              <div style={{
                ...styles.feedbackSection,
                backgroundColor: selectedAnswer === currentItem.id ? '#C8E6C9' : '#FFCDD2'
              }}>
                <h3 style={{ fontSize: '1.4rem', margin: '0 0 10px 0' }}>
                  {selectedAnswer === currentItem.id ? '🎉 Perfect!' : '💪 Keep trying!'}
                </h3>
                <p style={{ fontSize: '1.1rem', margin: 0 }}>
                  {selectedAnswer === currentItem.id 
                    ? currentItem.encouragement
                    : `We ${currentItem.name} the ${currentItem.emoji}. ${currentItem.description}`
                  }
                </p>
              </div>
            )}

            <div style={styles.controlButtons}>
              <button
                onClick={resetGame}
                style={{
                  ...styles.controlButton,
                  ...styles.secondaryButton
                }}
              >
                📖 Learn Again
              </button>
              <button
                onClick={goToHomepage}
                style={{
                  ...styles.controlButton,
                  ...styles.primaryButton
                }}
              >
                🏠 Go Home
              </button>
            </div>
          </>
        )}
      </div>

      {showCelebration && (
        <div style={styles.celebration}>
          <div style={styles.celebrationContent}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>👨‍🍳</div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Great Cooking!</h2>
            <p style={{ fontSize: '1.3rem', marginBottom: '10px' }}>
              You learned all {cookingActions.length} cooking actions!
            </p>
            <p style={{ fontSize: '1.1rem', marginBottom: '30px', opacity: 0.9 }}>
              Level {currentLevel} Complete! 
              {hasNextLevel ? ` Ready to learn more cooking skills?` : ' You\'re becoming a great cook!'}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={continueToNextLevel}
                style={{
                  ...styles.controlButton,
                  backgroundColor: hasNextLevel ? '#4CAF50' : '#2196F3',
                  color: 'white',
                  fontSize: '1.2rem',
                  padding: '15px 30px',
                  border: '2px solid white'
                }}
              >
                {hasNextLevel ? '🚀 Next Level' : '🏠 Go Home'}
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
                🔄 Practice Again
              </button>
              
              <button
                onClick={goToHomepage}
                style={{
                  ...styles.controlButton,
                  backgroundColor: '#9C27B0',
                  color: 'white',
                  fontSize: '1.2rem',
                  padding: '15px 30px',
                  border: '2px solid white'
                }}
              >
                🏠 Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}