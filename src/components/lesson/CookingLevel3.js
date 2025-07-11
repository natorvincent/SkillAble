import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

export default function ToolMatchingLevel3() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [gamePhase, setGamePhase] = useState('introduction'); // 'introduction', 'matching', 'celebration'
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]); // Track individual correct answers
  const [completedTools, setCompletedTools] = useState([]);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(false);
  const [needsBreak, setNeedsBreak] = useState(false);
  const [showToolAnimation, setShowToolAnimation] = useState(false);
  
  // Progress tracking states
  const [loading, setLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');
  
  // Level progression props
  const [currentLevel] = useState(3); // Level 3
  const [maxLevel] = useState(3);

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

  // Kitchen tools with clear descriptions and uses
  const kitchenTools = [
    {
      id: 'spoon',
      name: 'SPOON',
      emoji: '🥄',
      color: '#E3F2FD',
      borderColor: '#2196F3',
      description: 'We use a spoon to scoop and stir food',
      use: 'scoop or stir',
      animation: 'stirring motion',
      examples: ['soup', 'cereal', 'yogurt'],
      sound: 'This is a spoon. We use it to scoop or stir food.'
    },
    {
      id: 'fork',
      name: 'FORK',
      emoji: '🍴',
      color: '#E8F5E8',
      borderColor: '#4CAF50',
      description: 'We use a fork to pick up and eat soft food',
      use: 'pick up food',
      animation: 'picking motion',
      examples: ['pasta', 'salad', 'fruit'],
      sound: 'This is a fork. We use it to pick up and eat soft food.'
    },
    {
      id: 'knife',
      name: 'KNIFE',
      emoji: '🔪',
      color: '#FFF3E0',
      borderColor: '#FF9800',
      description: 'We use a knife to cut and slice food. Be careful!',
      use: 'cut or slice',
      animation: 'cutting motion',
      examples: ['bread', 'apple', 'cheese'],
      sound: 'This is a knife. We use it to cut or slice food. Be careful!',
      safety: true
    },
    {
      id: 'whisk',
      name: 'WHISK',
      emoji: '🥢',
      color: '#FCE4EC',
      borderColor: '#E91E63',
      description: 'We use a whisk to mix eggs and liquids',
      use: 'mix and beat',
      animation: 'whisking motion',
      examples: ['eggs', 'batter', 'cream'],
      sound: 'This is a whisk. We use it to mix eggs and liquids.'
    },
    {
      id: 'measuring-cup',
      name: 'MEASURING CUP',
      emoji: '🥛',
      color: '#F3E5F5',
      borderColor: '#9C27B0',
      description: 'We use a measuring cup to pour and measure liquids',
      use: 'pour and measure',
      animation: 'pouring motion',
      examples: ['milk', 'water', 'juice'],
      sound: 'This is a measuring cup. We use it to pour and measure drinks like milk or water.'
    }
  ];

  // Matching questions that use the tools
  const matchingQuestions = [
    {
      id: 1,
      action: 'We mix the egg',
      emoji: '🥚',
      correctTool: 'whisk',
      choices: ['knife', 'whisk', 'spoon'],
      feedback: 'Great! A whisk is perfect for mixing eggs!'
    },
    {
      id: 2,
      action: 'We cut the apple',
      emoji: '🍎',
      correctTool: 'knife',
      choices: ['fork', 'spoon', 'knife'],
      feedback: 'Excellent! A knife cuts the apple into pieces!'
    },
    {
      id: 3,
      action: 'We scoop the soup',
      emoji: '🍲',
      correctTool: 'spoon',
      choices: ['spoon', 'whisk', 'measuring-cup'],
      feedback: 'Perfect! A spoon is great for scooping soup!'
    },
    {
      id: 4,
      action: 'We pour the milk',
      emoji: '🥛',
      correctTool: 'measuring-cup',
      choices: ['whisk', 'fork', 'measuring-cup'],
      feedback: 'Wonderful! A measuring cup pours milk perfectly!'
    },
    {
      id: 5,
      action: 'We pick up pasta',
      emoji: '🍝',
      correctTool: 'fork',
      choices: ['fork', 'knife', 'spoon'],
      feedback: 'Amazing! A fork picks up pasta easily!'
    }
  ];

  const currentTool = kitchenTools[currentToolIndex];
  const currentQuestion = matchingQuestions[currentQuestionIndex];

  // Load previous progress on component mount
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          console.log('Missing studentId or lessonId:', { studentId, lessonId });
          setLoading(false);
          setShowTip('Ready to learn kitchen tools? Let\'s get started!');
          return;
        }
        
        console.log('Fetching progress for student:', studentId, 'lesson:', lessonId);
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          const existingScore = progressResponse.score || 0;
          setScore(existingScore);
          
          // Initialize correct answers based on existing score
          if (existingScore > 0) {
            const initialCorrect = Array.from({length: Math.min(existingScore, matchingQuestions.length)}, (_, i) => i + 1);
            setCorrectAnswers(initialCorrect);
          }
          
          if (progressResponse.completed) {
            setShowTip("Fantastic! You've mastered kitchen tools before. Want to practice more?");
          } else {
            setShowTip('Ready to learn kitchen tools? Let\'s get started!');
          }
          console.log('Loaded existing progress:', progressResponse);
        } else {
          console.log('No existing progress found - starting fresh');
          setShowTip('Ready to learn kitchen tools? Let\'s get started!');
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
        setShowTip('Ready to learn kitchen tools? Let\'s get started!');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  // Speech function with slower pace
  const speak = (text) => {
    if ('speechSynthesis' in window && autoPlayEnabled) {
      speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.6; // Slower for processing
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Gentle sound effects
  const playGentleSound = (soundType) => {
    if (!soundEffectsEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      switch(soundType) {
        case 'correct':
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // Happy C
          break;
        case 'wrong':
          oscillator.frequency.setValueAtTime(220, audioContext.currentTime); // Low A
          break;
        case 'celebration':
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime); // E
          break;
        default:
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      }
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Audio not available:', error);
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
      
      // Calculate final score based on unique correct answers
      const uniqueCorrectAnswers = [...new Set(correctAnswers)];
      const finalScore = uniqueCorrectAnswers.length;
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: matchingQuestions.length,
        completed: gamePhase === 'celebration',
        starsEarned: getStarRating(finalScore)
      };
      
      console.log('Saving progress for student:', studentId, progressData);
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      
      // Update module progress if lesson is completed
      if (progressData.completed && moduleId) {
        try {
          console.log('Updating module progress for module:', moduleId);
          await updateModuleProgress(studentId, parseInt(moduleId, 10));
        } catch (moduleError) {
          console.error('Error updating module progress:', moduleError);
          // Don't fail the save if module update fails
        }
      }
      
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
    const percentage = (finalScore / matchingQuestions.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Auto-speak when tool changes
  useEffect(() => {
    if (gamePhase === 'introduction' && autoPlayEnabled && currentTool && !loading) {
      setTimeout(() => {
        speak(currentTool.sound);
      }, 1000);
    }
  }, [currentToolIndex, gamePhase, autoPlayEnabled, loading]);

  // Auto-speak when question changes
  useEffect(() => {
    if (gamePhase === 'matching' && autoPlayEnabled && currentQuestion && !loading) {
      setTimeout(() => {
        speak(`${currentQuestion.action}. What tool do we use?`);
      }, 1000);
    }
  }, [currentQuestionIndex, gamePhase, autoPlayEnabled, loading]);

  // Auto-save progress periodically during matching phase
  useEffect(() => {
    if (gamePhase === 'matching' && score > 0 && !progressSaving && !progressSaved) {
      const autoSaveInterval = setInterval(() => {
        if (score > 0) {
          console.log('Auto-saving progress...');
          saveProgress();
        }
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [gamePhase, score, progressSaving, progressSaved]);

  // Tool introduction navigation
  const nextTool = () => {
    if (currentToolIndex < kitchenTools.length - 1) {
      setCurrentToolIndex(currentToolIndex + 1);
    } else {
      setGamePhase('matching');
      setCurrentQuestionIndex(0);
    }
  };

  const previousTool = () => {
    if (currentToolIndex > 0) {
      setCurrentToolIndex(currentToolIndex - 1);
    }
  };

  const repeatToolInfo = () => {
    if (autoPlayEnabled && currentTool) {
      speak(currentTool.sound);
    }
    setShowToolAnimation(true);
    setTimeout(() => setShowToolAnimation(false), 2000);
  };

  // Matching game functions
  const handleAnswerSelect = (toolId) => {
    setSelectedAnswer(toolId);
    setShowFeedback(true);
    
    const isCorrect = toolId === currentQuestion.correctTool;
    
    if (isCorrect) {
      // Only increment score if this answer hasn't been correct before
      if (!correctAnswers.includes(currentQuestion.id)) {
        setScore(prev => prev + 1);
        setCorrectAnswers(prev => [...prev, currentQuestion.id]);
      }
      playGentleSound('correct');
      if (autoPlayEnabled) {
        setTimeout(() => speak(currentQuestion.feedback), 500);
      }
    } else {
      playGentleSound('wrong');
      if (autoPlayEnabled) {
        setTimeout(() => speak('Try again! Think about what this tool does.'), 500);
      }
    }
    
    if (isCorrect) {
      setTimeout(() => {
        nextQuestion();
      }, 3000);
    } else {
      setTimeout(() => {
        setSelectedAnswer(null);
        setShowFeedback(false);
      }, 2500);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < matchingQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setGamePhase('celebration');
      saveProgress();
      playGentleSound('celebration');
      if (autoPlayEnabled) {
        setTimeout(() => speak('Amazing work! You learned all the kitchen tools! You are a great cook!'), 1000);
      }
    }
  };

  const restartGame = () => {
    setGamePhase('introduction');
    setCurrentToolIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setCorrectAnswers([]);
    setCompletedTools([]);
    setProgressSaved(false);
    setProgressSaving(false);
  };

  const goToMatching = () => {
    setGamePhase('matching');
    setCurrentQuestionIndex(0);
  };

  const goToHomepage = () => {
    navigate('/homepage');
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    setTimeout(() => {
      navigate(-1); // Go back to previous screen since this is the final level
    }, 300);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: 'linear-gradient(to bottom, #F8F9FA, #E3F2FD)',
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
          border: '3px solid #2196F3'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #2196F3',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px auto'
          }}></div>
          <h3 style={{ fontSize: '1.5rem', color: '#1976D2', margin: 0 }}>Loading kitchen tools...</h3>
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

  // Tool Introduction Phase
  const ToolIntroduction = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{
        fontSize: '2rem',
        color: '#1976D2',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        🧑‍🏫 LEARNING KITCHEN TOOLS
      </h2>
      
      <div style={{
        backgroundColor: '#F8F9FA',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '30px',
        border: '2px solid #E0E0E0'
      }}>
        <p style={{ fontSize: '1.2rem', color: '#666', margin: 0 }}>
          Tool {currentToolIndex + 1} of {kitchenTools.length}
        </p>
      </div>

      <div style={{
        backgroundColor: currentTool.color,
        border: `4px solid ${currentTool.borderColor}`,
        borderRadius: '25px',
        padding: '40px',
        marginBottom: '30px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '6rem',
          marginBottom: '20px',
          transform: showToolAnimation ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          {currentTool.emoji}
        </div>
        
        <h3 style={{
          fontSize: '2.5rem',
          color: currentTool.borderColor,
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          {currentTool.name}
        </h3>
        
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '20px',
          borderRadius: '15px',
          border: '2px solid #E0E0E0',
          maxWidth: '500px'
        }}>
          <p style={{
            fontSize: '1.5rem',
            color: '#333',
            lineHeight: '1.4',
            margin: 0
          }}>
            {currentTool.description}
          </p>
        </div>
        
        {currentTool.safety && (
          <div style={{
            backgroundColor: '#FFEBEE',
            border: '2px solid #F44336',
            borderRadius: '10px',
            padding: '10px 15px',
            marginTop: '15px'
          }}>
            <p style={{
              fontSize: '1.1rem',
              color: '#C62828',
              margin: 0,
              fontWeight: 'bold'
            }}>
              ⚠️ Always ask an adult for help with knives!
            </p>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={repeatToolInfo}
          style={{
            padding: '15px 25px',
            borderRadius: '20px',
            border: 'none',
            fontSize: '1.3rem',
            backgroundColor: '#2196F3',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔊 LISTEN AGAIN
        </button>
        
        <button
          onClick={previousTool}
          disabled={currentToolIndex === 0}
          style={{
            padding: '15px 25px',
            borderRadius: '20px',
            border: 'none',
            fontSize: '1.3rem',
            backgroundColor: currentToolIndex === 0 ? '#E0E0E0' : '#9C27B0',
            color: 'white',
            cursor: currentToolIndex === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          ⬅️ BACK
        </button>
        
        <button
          onClick={nextTool}
          style={{
            padding: '15px 25px',
            borderRadius: '20px',
            border: 'none',
            fontSize: '1.3rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {currentToolIndex === kitchenTools.length - 1 ? '🎮 START MATCHING!' : '➡️ NEXT TOOL'}
        </button>
      </div>
    </div>
  );

  // Matching Game Phase
  const MatchingGame = () => (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{
        fontSize: '2rem',
        color: '#1976D2',
        marginBottom: '20px',
        fontWeight: 'bold'
      }}>
        🎮 MATCH THE TOOL
      </h2>
      
      <div style={{
        backgroundColor: '#F8F9FA',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '30px',
        border: '2px solid #E0E0E0'
      }}>
        <p style={{ fontSize: '1.2rem', color: '#666', margin: 0 }}>
          Question {currentQuestionIndex + 1} of {matchingQuestions.length} • Score: {score}/{matchingQuestions.length} • ⭐ {getStarRating()}
        </p>
      </div>

      <div style={{
        backgroundColor: '#E3F2FD',
        border: '4px solid #2196F3',
        borderRadius: '25px',
        padding: '30px',
        marginBottom: '30px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '15px' }}>
          {currentQuestion.emoji}
        </div>
        
        <h3 style={{
          fontSize: '2rem',
          color: '#1976D2',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          {currentQuestion.action}
        </h3>
        
        <p style={{
          fontSize: '1.5rem',
          color: '#333',
          marginBottom: '20px'
        }}>
          What tool do we use?
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        maxWidth: '700px',
        margin: '0 auto 30px auto'
      }}>
        {currentQuestion.choices.map((toolId) => {
          const tool = kitchenTools.find(t => t.id === toolId);
          const isSelected = selectedAnswer === toolId;
          const isCorrect = toolId === currentQuestion.correctTool;
          const showResult = showFeedback && isSelected;
          
          return (
            <button
              key={toolId}
              onClick={() => !showFeedback && handleAnswerSelect(toolId)}
              disabled={showFeedback}
              style={{
                padding: '20px',
                borderRadius: '20px',
                border: `4px solid ${
                  showResult ? (isCorrect ? '#4CAF50' : '#F44336') : 
                  isSelected ? '#2196F3' : tool.borderColor
                }`,
                backgroundColor: showResult ? 
                  (isCorrect ? '#C8E6C9' : '#FFCDD2') : 
                  isSelected ? '#E3F2FD' : tool.color,
                cursor: showFeedback ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                {tool.emoji}
              </div>
              <div style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: showResult ? (isCorrect ? '#2E7D32' : '#C62828') : tool.borderColor
              }}>
                {tool.name}
              </div>
              {showResult && (
                <div style={{
                  fontSize: '2rem',
                  marginTop: '10px'
                }}>
                  {isCorrect ? '✅' : '❌'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showFeedback && selectedAnswer === currentQuestion.correctTool && (
        <div style={{
          backgroundColor: '#C8E6C9',
          border: '3px solid #4CAF50',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '20px',
          maxWidth: '600px',
          margin: '0 auto 20px auto'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🌟</div>
          <h3 style={{
            fontSize: '1.8rem',
            color: '#2E7D32',
            margin: 0,
            fontWeight: 'bold'
          }}>
            {currentQuestion.feedback}
          </h3>
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setGamePhase('introduction')}
          style={{
            padding: '12px 20px',
            borderRadius: '15px',
            border: '2px solid #9C27B0',
            fontSize: '1.1rem',
            backgroundColor: '#9C27B0',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🧑‍🏫 REVIEW TOOLS
        </button>
        
        <button
          onClick={() => speak(`${currentQuestion.action}. What tool do we use?`)}
          style={{
            padding: '12px 20px',
            borderRadius: '15px',
            border: '2px solid #2196F3',
            fontSize: '1.1rem',
            backgroundColor: '#2196F3',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔊 REPEAT QUESTION
        </button>
      </div>
    </div>
  );

  // Celebration Phase
  const Celebration = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(76, 175, 80, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white',
        padding: '40px'
      }}>
        <div style={{ fontSize: '6rem', marginBottom: '20px' }}>🏆</div>
        <h2 style={{
          fontSize: '3rem',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          KITCHEN TOOL EXPERT!
        </h2>
        
        {/* Star Rating Display */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          {[...Array(getStarRating())].map((_, i) => (
            <span key={i} style={{ fontSize: '3rem', color: '#FFD700', margin: '0 5px' }}>⭐</span>
          ))}
          {[...Array(3 - getStarRating())].map((_, i) => (
            <span key={i} style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.3)', margin: '0 5px' }}>⭐</span>
          ))}
        </div>
        
        <p style={{
          fontSize: '1.8rem',
          marginBottom: '10px'
        }}>
          You got {score} out of {matchingQuestions.length} correct!
        </p>
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '20px'
        }}>
          You know all the kitchen tools! 🍴
        </p>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '30px',
          opacity: 0.9
        }}>
          Final Score: {score}/{matchingQuestions.length} ({Math.round((score/matchingQuestions.length)*100)}%)
        </p>

        {/* Progress Saving Status */}
        {progressSaving && (
          <div style={{
            backgroundColor: 'rgba(33, 150, 243, 0.3)',
            border: '2px solid rgba(33, 150, 243, 0.6)',
            borderRadius: '15px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid white',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '10px'
              }}></div>
              <span style={{ color: 'white', fontWeight: 'bold' }}>Saving your kitchen tool mastery...</span>
            </div>
          </div>
        )}
        
        {progressSaved && (
          <div style={{
            backgroundColor: 'rgba(76, 175, 80, 0.3)',
            border: '2px solid rgba(76, 175, 80, 0.6)',
            borderRadius: '15px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', marginRight: '8px', fontSize: '1.2rem' }}>✓</span>
              <span style={{ color: 'white', fontWeight: 'bold' }}>Kitchen tool skills saved!</span>
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <button
            onClick={continueToNextLevel}
            disabled={progressSaving}
            style={{
              padding: '20px 40px',
              borderRadius: '25px',
              border: '3px solid white',
              fontSize: '1.5rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              cursor: progressSaving ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: progressSaving ? 0.7 : 1
            }}
          >
            {progressSaving ? 'Saving...' : '✅ Continue'}
          </button>
          
          <button
            onClick={restartGame}
            style={{
              padding: '20px 40px',
              borderRadius: '25px',
              border: '3px solid white',
              fontSize: '1.5rem',
              backgroundColor: 'transparent',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 PLAY AGAIN
          </button>
          
          <button
            onClick={goToHomepage}
            style={{
              padding: '20px 40px',
              borderRadius: '25px',
              border: '3px solid white',
              fontSize: '1.5rem',
              backgroundColor: '#9C27B0',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🏠 GO HOME
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: 'linear-gradient(to bottom, #F8F9FA, #E3F2FD)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        backgroundColor: '#FFFFFF',
        borderRadius: '25px',
        padding: '30px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        border: '3px solid #E0E0E0'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            color: '#1976D2',
            marginBottom: '10px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
          }}>
            🍴 KITCHEN TOOLS
          </h1>
          <p style={{
            fontSize: '1.3rem',
            color: '#666',
            marginBottom: '20px'
          }}>
            Learn tools, then match them to cooking actions
          </p>
          
          {/* Level indicator */}
          <div style={{
            backgroundColor: '#E3F2FD',
            border: '2px solid #2196F3',
            borderRadius: '15px',
            padding: '10px 20px',
            marginBottom: '20px',
            display: 'inline-block'
          }}>
            <span style={{
              fontSize: '1.1rem',
              color: '#1976D2',
              fontWeight: 'bold'
            }}>
              🔥 Level {currentLevel} of {maxLevel} - Kitchen Tool Mastery!
            </span>
          </div>

          {/* Score Display */}
          {gamePhase === 'matching' && (
            <div style={{
              backgroundColor: '#E8F5E8',
              border: '2px solid #4CAF50',
              borderRadius: '15px',
              padding: '10px 20px',
              marginBottom: '20px',
              display: 'inline-block',
              marginLeft: '10px'
            }}>
              <span style={{
                fontSize: '1.2rem',
                color: '#2E7D32',
                fontWeight: 'bold'
              }}>
                🏆 Score: {score}/{matchingQuestions.length} | ⭐ Stars: {getStarRating()}
              </span>
            </div>
          )}

          {showTip && (
            <div style={{
              backgroundColor: '#FFF3E0',
              border: '2px solid #FF9800',
              borderRadius: '15px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{
                fontSize: '1.1rem',
                color: '#E65100',
                margin: 0,
                fontWeight: '500'
              }}>
                {showTip}
              </p>
            </div>
          )}
          
          {/* Phase indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '8px 16px',
              borderRadius: '15px',
              backgroundColor: gamePhase === 'introduction' ? '#2196F3' : '#E0E0E0',
              color: gamePhase === 'introduction' ? 'white' : '#666',
              fontWeight: 'bold'
            }}>
              1. LEARN TOOLS
            </div>
            <div style={{
              padding: '8px 16px',
              borderRadius: '15px',
              backgroundColor: gamePhase === 'matching' ? '#2196F3' : '#E0E0E0',
              color: gamePhase === 'matching' ? 'white' : '#666',
              fontWeight: 'bold'
            }}>
              2. MATCH TOOLS
            </div>
          </div>
          
          {/* Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
              style={{
                padding: '8px 16px',
                borderRadius: '15px',
                border: '2px solid #2196F3',
                fontSize: '1rem',
                backgroundColor: autoPlayEnabled ? '#2196F3' : '#FFFFFF',
                color: autoPlayEnabled ? 'white' : '#2196F3',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔊 VOICE: {autoPlayEnabled ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => setNeedsBreak(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '15px',
                border: '2px solid #FF9800',
                fontSize: '1rem',
                backgroundColor: '#FF9800',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ⏸️ BREAK
            </button>
            
            {gamePhase === 'introduction' && (
              <button
                onClick={goToMatching}
                style={{
                  padding: '8px 16px',
                  borderRadius: '15px',
                  border: '2px solid #4CAF50',
                  fontSize: '1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🎮 SKIP TO MATCHING
              </button>
            )}
          </div>
        </div>

        {/* Game Content */}
        {gamePhase === 'introduction' && <ToolIntroduction />}
        {gamePhase === 'matching' && <MatchingGame />}
        
        {/* Home Button */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={goToHomepage}
            style={{
              padding: '12px 24px',
              borderRadius: '20px',
              border: '2px solid #9C27B0',
              fontSize: '1.2rem',
              backgroundColor: '#9C27B0',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🏠 HOME
          </button>
        </div>
      </div>

      {/* Break Modal */}
      {needsBreak && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '40px',
            borderRadius: '25px',
            textAlign: 'center',
            border: '4px solid #2196F3'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⏸️</div>
            <h2 style={{ fontSize: '2rem', color: '#2196F3', marginBottom: '20px' }}>
              BREAK TIME
            </h2>
            <p style={{ fontSize: '1.3rem', color: '#666', marginBottom: '30px' }}>
              Take your time. When you're ready, click continue.
            </p>
            <button
              onClick={() => setNeedsBreak(false)}
              style={{
                padding: '15px 30px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '1.5rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✅ I'M READY
            </button>
          </div>
        </div>
      )}

      {/* Celebration */}
      {gamePhase === 'celebration' && <Celebration />}
    </div>
  );
}