import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import images for Level 3 cooking game from assets folder
import oilImg from "../../assets/cookingLevel3/oil.png";
import butterImg from "../../assets/cookingLevel3/butter.png";
import eggImg from "../../assets/cookingLevel3/egg-bowl.png";
import saltImg from "../../assets/cookingLevel3/salt.png";
import springOnionImg from "../../assets/cookingLevel3/spring-onion-chopped.png";
import spatulaImg from "../../assets/cookingLevel3/wooden-spatula.png";
import cookedEggImg from "../../assets/cookingLevel3/cooked-egg.png";

// Progress service imports
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

const CookingLevel3 = () => {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();

  const [gameState, setGameState] = useState({
    currentStep: 0,
    stepsCompleted: [false, false, false, false, false, false, false],
    showOil: false,
    flameOn: false,
    showButter: false,
    eggInPan: false,
    saltAdded: false,
    eggCooked: false,
    springOnionAdded: false,
    showSuccess: false,
    feedbackMessage: '',
    showFeedback: false,
    showCookedEggPrompt: false
  });

  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState(null);
  const panRef = useRef(null);

  const ingredientImages = {
    oil: oilImg,
    butter: butterImg,
    egg: eggImg,
    salt: saltImg,
    springOnion: springOnionImg,
    spatula: spatulaImg,
    cookedEgg: cookedEggImg
  };

  const eggRecipeSteps = [
    { id: 0, instruction: "Drag the oil bottle to the frying pan", target: "pan" },
    { id: 1, instruction: "Tap the stove button to turn on the heat", target: "stove" },
    { id: 2, instruction: "Drag the butter to the pan", target: "pan" },
    { id: 3, instruction: "Drag the egg to the pan to crack it", target: "pan" },
    { id: 4, instruction: "Drag the salt to season the egg", target: "pan" },
    { id: 5, instruction: "Drag the spatula over the pan to scramble the egg", target: "pan" },
    { id: 6, instruction: "Drag the spring onion to garnish", target: "pan" }
  ];

  const getStudentId = () => {
    const studentId = localStorage.getItem('studentId');
    const userType = localStorage.getItem('userType');
    
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

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      const finalScore = 7;
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: 7,
        completed: true,
        starsEarned: 3
      };
      
      await saveStudentLessonProgress(studentId, lessonId, progressData);
      setProgressSaved(true);
      
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setProgressSaving(false);
    }
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

  const showFeedback = (message) => {
    setGameState(prev => ({ ...prev, feedbackMessage: message, showFeedback: true }));
    setTimeout(() => {
      setGameState(prev => ({ ...prev, showFeedback: false }));
    }, 2000);
  };

  const completeStep = (stepIndex, updates) => {
    const newStepsCompleted = [...gameState.stepsCompleted];
    newStepsCompleted[stepIndex] = true;
    
    setGameState(prev => ({
      ...prev,
      ...updates,
      stepsCompleted: newStepsCompleted,
      currentStep: stepIndex + 1
    }));

    if (newStepsCompleted.every(step => step)) {
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showSuccess: true }));
        saveProgress();
      }, 1000);
    }
  };

  const handleDragStart = (e, item) => {
    setIsDragging(true);
    setDragItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    setIsDragging(false);

    if (dragItem === 'oil' && target === 'pan' && gameState.currentStep === 0) {
      completeStep(0, { showOil: true });
      showFeedback("Perfect! Oil added to the pan!");
    } else if (dragItem === 'butter' && target === 'pan' && gameState.currentStep === 2) {
      completeStep(2, { showButter: true });
      showFeedback("Great! Butter is melting in the pan!");
    } else if (dragItem === 'egg' && target === 'pan' && gameState.currentStep === 3) {
      completeStep(3, { eggInPan: true });
      showFeedback("Excellent! Egg cracked into the pan!");
    } else if (dragItem === 'salt' && target === 'pan' && gameState.currentStep === 4) {
      completeStep(4, { saltAdded: true });
      showFeedback("Nice! Salt added for flavor!");
    } else if (dragItem === 'spatula' && target === 'pan' && gameState.currentStep === 5) {
      completeStep(5, { eggCooked: true });
      showFeedback("Amazing! Your scrambled egg is perfectly cooked!");
      setTimeout(() => {
        setGameState(prev => ({ ...prev, showCookedEggPrompt: true }));
      }, 2500);
    } else if (dragItem === 'springOnion' && target === 'pan' && gameState.currentStep === 6) {
      completeStep(6, { springOnionAdded: true });
      showFeedback("Beautiful! Spring onion garnish added!");
    }
    
    setDragItem(null);
  };

  const handleStoveClick = () => {
    if (gameState.currentStep === 1) {
      completeStep(1, { flameOn: true });
      showFeedback("Excellent! The stove is heating up!");
    }
  };

  const resetGame = () => {
    setGameState({
      currentStep: 0,
      stepsCompleted: [false, false, false, false, false, false, false],
      showOil: false,
      flameOn: false,
      showButter: false,
      eggInPan: false,
      saltAdded: false,
      eggCooked: false,
      springOnionAdded: false,
      showSuccess: false,
      feedbackMessage: '',
      showFeedback: false,
      showCookedEggPrompt: false
    });
    setProgressSaved(false);
    setProgressSaving(false);
  };

  const closeCookedEggPrompt = () => {
    setGameState(prev => ({ ...prev, showCookedEggPrompt: false }));
  };

  const DraggableIngredient = ({ type, isActive, isCompleted, style = {} }) => {
    return (
      <div
        draggable={isActive}
        onDragStart={(e) => handleDragStart(e, type)}
        style={{
          cursor: isActive ? 'grab' : 'default',
          opacity: isCompleted ? 0.5 : isActive ? 1 : 0.7,
          border: isActive ? '3px solid #FF9800' : '2px solid #ccc',
          borderRadius: '8px',
          padding: '4px',
          backgroundColor: 'white',
          ...style
        }}
      >
        <img 
          src={ingredientImages[type]} 
          alt={type}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '4px',
            userSelect: 'none',
            pointerEvents: 'none'
          }}
        />
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Sound Toggle Button */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        zIndex: 100 
      }}>
        <button
          onClick={() => setIsMuted(!isMuted)}
          style={{
            backgroundColor: isMuted ? '#FF5722' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(45deg, #FF9800, #F57C00)',
        color: 'white',
        padding: '15px',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
          Level 3: Scrambled Eggs
        </h1>
        <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
          {eggRecipeSteps[gameState.currentStep]?.instruction || "Your deluxe scrambled egg is ready!"}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: 'white',
        margin: '20px',
        borderRadius: '10px',
        padding: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: 'bold', color: '#E65100' }}>Recipe Progress:</span>
          <span style={{ color: '#FF9800', fontWeight: 'bold' }}>
            {gameState.stepsCompleted.filter(Boolean).length}/7 steps
          </span>
        </div>
        <div style={{
          background: '#E0E0E0',
          borderRadius: '5px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
            height: '100%',
            width: `${(gameState.stepsCompleted.filter(Boolean).length / 7) * 100}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* Main Cooking Area */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        height: '70%',
        padding: '20px'
      }}>
        {/* Ingredients Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '15px',
          alignItems: 'start',
          width: '200px'
        }}>
          <h3 style={{ 
            gridColumn: '1 / -1',
            margin: '0 0 10px 0', 
            color: '#E65100',
            textAlign: 'center'
          }}>
            Ingredients & Tools
          </h3>
          
          <DraggableIngredient 
            type="oil"
            isActive={gameState.currentStep === 0}
            isCompleted={gameState.stepsCompleted[0]}
            style={{ width: '60px', height: '80px' }}
          />

          <DraggableIngredient 
            type="butter"
            isActive={gameState.currentStep === 2}
            isCompleted={gameState.stepsCompleted[2]}
            style={{ width: '60px', height: '40px' }}
          />

          <DraggableIngredient 
            type="egg"
            isActive={gameState.currentStep === 3}
            isCompleted={gameState.stepsCompleted[3]}
            style={{ width: '55px', height: '70px' }}
          />

          <DraggableIngredient 
            type="salt"
            isActive={gameState.currentStep === 4}
            isCompleted={gameState.stepsCompleted[4]}
            style={{ width: '45px', height: '45px' }}
          />

          <DraggableIngredient 
            type="springOnion"
            isActive={gameState.currentStep === 6}
            isCompleted={gameState.stepsCompleted[6]}
            style={{ 
              gridColumn: '1 / -1',
              width: '80px', 
              height: '25px',
              margin: '0 auto'
            }}
          />

          <DraggableIngredient 
            type="spatula"
            isActive={gameState.currentStep === 5}
            isCompleted={gameState.stepsCompleted[5]}
            style={{ 
              gridColumn: '1 / -1',
              width: '80px', 
              height: '25px',
              margin: '10px auto 0'
            }}
          />
        </div>

        {/* Cooking Station */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ position: 'relative' }}>
            {/* Stove */}
            <div style={{
              width: '200px',
              height: '120px',
              background: 'linear-gradient(45deg, #424242, #616161)',
              borderRadius: '10px',
              position: 'relative',
              boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
            }}>
              <button
                onClick={handleStoveClick}
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '15px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '3px solid #757575',
                  background: gameState.flameOn 
                    ? 'linear-gradient(45deg, #FF5722, #F44336)' 
                    : 'linear-gradient(45deg, #9E9E9E, #757575)',
                  cursor: gameState.currentStep === 1 ? 'pointer' : 'default',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'white'
                }}
              >
                {gameState.flameOn ? 'ON' : 'OFF'}
              </button>

              {gameState.flameOn && (
                <div style={{
                  position: 'absolute',
                  bottom: '60px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '30px',
                  background: 'radial-gradient(circle, #FF9800 30%, #FF5722 70%)',
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'
                }}
                />
              )}
            </div>

            {/* Frying Pan */}
            <div
              ref={panRef}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'pan')}
              style={{
                position: 'absolute',
                top: '-30px',
                left: '30px',
                width: '140px',
                height: '140px',
                background: 'linear-gradient(45deg, #37474F, #546E7A)',
                borderRadius: '50%',
                border: '4px solid #263238',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {gameState.showOil && (
                <div style={{
                  width: '90%',
                  height: '90%',
                  background: 'radial-gradient(circle, #FFE082 50%, #FFC107 80%)',
                  borderRadius: '50%',
                  position: 'absolute',
                  opacity: 0.7
                }} />
              )}

              {gameState.showButter && (
                <div style={{
                  width: '30%',
                  height: '30%',
                  background: 'radial-gradient(circle, #FFF176 30%, #FFD54F 80%)',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '30%',
                  left: '35%',
                  opacity: 0.8
                }} />
              )}

              {gameState.eggInPan && !gameState.eggCooked && (
                <div style={{
                  width: '70%',
                  height: '70%',
                  background: 'radial-gradient(circle, #FFFFFF 20%, #FFF176 40%, #FFE082 80%)',
                  borderRadius: '60% 40% 40% 60%',
                  position: 'absolute'
                }} />
              )}

              {gameState.saltAdded && (
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  background: 'radial-gradient(circle, transparent 60%, rgba(255,255,255,0.3) 65%, transparent 70%)',
                  borderRadius: '50%'
                }} />
              )}

              {gameState.eggCooked && (
                <div style={{
                  width: '80%',
                  height: '80%',
                  background: 'radial-gradient(circle, #FFF9C4 30%, #FFF176 60%, #FFE082 90%)',
                  borderRadius: '40% 60% 50% 50%',
                  position: 'absolute'
                }} />
              )}

              {gameState.springOnionAdded && (
                <div style={{
                  position: 'absolute',
                  width: '60%',
                  height: '60%',
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(76, 175, 80, 0.6) 3px, rgba(76, 175, 80, 0.6) 6px)',
                  borderRadius: '50%'
                }} />
              )}

              <div style={{
                position: 'absolute',
                right: '-50px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '50px',
                height: '8px',
                background: 'linear-gradient(45deg, #5D4037, #795548)',
                borderRadius: '4px'
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {gameState.showFeedback && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
          color: 'white',
          padding: '20px 30px',
          borderRadius: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          {gameState.feedbackMessage}
        </div>
      )}

      {/* Cooked Egg Prompt */}
      {gameState.showCookedEggPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
            padding: '30px',
            borderRadius: '20px',
            textAlign: 'center',
            border: '3px solid #FF9800',
            maxWidth: '350px'
          }}>
            <h3 style={{ 
              color: '#E65100', 
              marginBottom: '20px',
              fontSize: '22px',
              fontWeight: 'bold'
            }}>
              Look at your delicious egg!
            </h3>
            
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: 'white',
              borderRadius: '15px',
              border: '2px solid #FFE082'
            }}>
              <img 
                src={ingredientImages.cookedEgg} 
                alt="Perfectly cooked scrambled egg"
                style={{
                  width: '200px',
                  height: '150px',
                  objectFit: 'contain',
                  borderRadius: '10px'
                }}
              />
            </div>
            
            <p style={{ 
              color: '#5D4037', 
              marginBottom: '25px',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              Your scrambled egg is perfectly fluffy and golden! 
              The spatula helped mix everything together beautifully.
            </p>
            
            <button
              onClick={closeCookedEggPrompt}
              style={{
                background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Continue Cooking!
            </button>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {gameState.showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            border: '4px solid #FF9800',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🍳</div>
            <h2 style={{ 
              color: '#E65100', 
              marginBottom: '15px',
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              Delicious! Your gourmet scrambled egg is ready!
            </h2>
            <p style={{ 
              color: '#5D4037', 
              marginBottom: '30px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              You've mastered the complete recipe with oil, butter, egg, salt, and spring onion garnish! 
              This is restaurant-quality cooking!
            </p>

            {progressSaving && (
              <div style={{ marginBottom: '20px', color: '#FF8F00' }}>
                Saving your progress...
              </div>
            )}
            
            {progressSaved && (
              <div style={{ marginBottom: '20px', color: '#4CAF50' }}>
                Progress saved successfully!
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={resetGame}
                style={{
                  background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cook Another Deluxe Egg
              </button>

              <button 
                onClick={goToHomepage}
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  fontSize: '16px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookingLevel3;