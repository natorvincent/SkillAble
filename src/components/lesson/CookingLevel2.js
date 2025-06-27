import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

export default function CookingActionsLevel2() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [currentAction, setCurrentAction] = useState(0);
  const [gameMode, setGameMode] = useState('learn'); // 'learn' or 'practice'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');
  
  // Level progression props
  const [currentLevel] = useState(2); // Level 2
  const [maxLevel] = useState(3);
  const [moduleIdentifier] = useState('cooking-basics');
  const [lessonIdentifier] = useState('cooking-actions');

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

  // Get student ID from localStorage
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

  // Load previous progress on component mount
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          console.log('Missing studentId or lessonId:', { studentId, lessonId });
          setLoading(false);
          setShowTip('Ready to learn cooking actions? Let\'s get started!');
          return;
        }
        
        console.log('Fetching progress for student:', studentId, 'lesson:', lessonId);
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Awesome! You've completed this level before. Want to practice more?");
          } else {
            setShowTip('Ready to learn cooking actions? Let\'s get started!');
          }
          console.log('Loaded existing progress:', progressResponse);
        } else {
          console.log('No existing progress found - starting fresh');
          setShowTip('Ready to learn cooking actions? Let\'s get started!');
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
        setShowTip('Ready to learn cooking actions? Let\'s get started!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

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
    if (gameMode === 'learn' && !loading) {
      handleLearnMode();
    }
  }, [currentAction, gameMode, loading]);

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
          saveProgress();
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

  // Save progress to database
  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      const finalScore = score + (completed.length > score ? 1 : 0); // Account for current correct answer
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: cookingActions.length,
        completed: true,
        starsEarned: getStarRating(finalScore)
      };
      
      console.log('Saving progress for student:', studentId, progressData);
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      
      console.log('Progress saved successfully!');
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
  };

  // Calculate star rating based on score
  const getStarRating = (finalScore = score) => {
    const percentage = (finalScore / cookingActions.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const resetGame = () => {
    setCurrentAction(0);
    setGameMode('learn');
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCompleted([]);
    setShowCelebration(false);
    setProgressSaved(false);
    setProgressSaving(false);
  };

  const goToHomepage = () => {
    if (navigate) {
      navigate('/homepage');
    } else if (window.history && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/homepage';
    }
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    const hasNextLevel = currentLevel < maxLevel;
    
    setTimeout(() => {
      if (hasNextLevel) {
        // Navigate to Level 3 (if it exists)
        if (navigate) {
          navigate('/lesson/cooking/level-3');
        } else {
          window.location.href = '/lesson/cooking/level-3';
        }
      } else {
        goToHomepage();
      }
    }, 300);
  };

  const hasNextLevel = currentLevel < maxLevel;

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #F8F9FA, #FFF3E0, #E8F5E8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '25px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
          border: '3px solid #FF9800'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #FF9800',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <h3 style={{ fontSize: '1.5rem', color: '#E65100', margin: 0 }}>Loading cooking lesson...</h3>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

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
    tipSection: {
      backgroundColor: '#FFF3E0',
      border: '2px solid #FF9800',
      borderRadius: '15px',
      padding: '15px',
      marginBottom: '20px',
      textAlign: 'center'
    },
    tipText: {
      fontSize: '1.1rem',
      color: '#E65100',
      margin: 0,
      fontWeight: '500'
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
    },
    progressStatus: {
      textAlign: 'center',
      padding: '15px',
      borderRadius: '15px',
      marginBottom: '20px'
    },
    savingProgress: {
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      border: '2px solid rgba(33, 150, 243, 0.5)'
    },
    savedProgress: {
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
      border: '2px solid rgba(76, 175, 80, 0.5)'
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

          {showTip && (
            <div style={styles.tipSection}>
              <p style={styles.tipText}>{showTip}</p>
            </div>
          )}
          
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
            <p style={{ fontSize: '1.1rem', marginBottom: '20px', opacity: 0.9 }}>
              Level {currentLevel} Complete! 
              {hasNextLevel ? ` Ready to learn more cooking skills?` : ' You\'re becoming a great cook!'}
            </p>

            {/* Progress Saving Status */}
            {progressSaving && (
              <div style={{...styles.progressStatus, ...styles.savingProgress}}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #2196F3',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '10px'
                  }}></div>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>Saving your cooking progress...</span>
                </div>
              </div>
            )}
            
            {progressSaved && (
              <div style={{...styles.progressStatus, ...styles.savedProgress}}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'white', marginRight: '8px', fontSize: '1.2rem' }}>✓</span>
                  <span style={{ color: 'white', fontWeight: 'bold' }}>Cooking skills saved!</span>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={continueToNextLevel}
                disabled={progressSaving}
                style={{
                  ...styles.controlButton,
                  backgroundColor: hasNextLevel ? '#4CAF50' : '#2196F3',
                  color: 'white',
                  fontSize: '1.2rem',
                  padding: '15px 30px',
                  border: '2px solid white',
                  opacity: progressSaving ? 0.7 : 1,
                  cursor: progressSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {progressSaving ? 'Saving...' : (hasNextLevel ? '🚀 Next Level' : '🏠 Go Home')}
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