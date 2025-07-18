import React, { useState, useEffect } from 'react';
import { ChefHat, Star, Trophy, Home, RotateCcw } from 'lucide-react';

const CookItYourselfGame = () => {
  const [currentPhase, setCurrentPhase] = useState('introduction'); // introduction, ingredients, tools, actions, sequencing, celebration
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [phaseComplete, setPhaseComplete] = useState(false);
  const [sequenceSteps, setSequenceSteps] = useState([]);
  const [draggedSteps, setDraggedSteps] = useState([]);
  const [score, setScore] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showCorrectPopup, setShowCorrectPopup] = useState(false);

  const recipes = {
    sandwich: {
      name: "Sandwich",
      emoji: "🥪",
      description: "Let's make a delicious sandwich together!",
      correctIngredients: ["bread", "lettuce", "cheese"],
      correctTool: "knife",
      correctAction: "spread",
      ingredients: [
        { id: "bread", name: "Bread", emoji: "🍞", correct: true },
        { id: "lettuce", name: "Lettuce", emoji: "🥬", correct: true },
        { id: "cheese", name: "Cheese", emoji: "🧀", correct: true },
        { id: "soap", name: "Dish Soap", emoji: "🧽", correct: false },
        { id: "candy", name: "Candy", emoji: "🍭", correct: false }
      ],
      tools: [
        { id: "knife", name: "Knife", emoji: "🔪", correct: true },
        { id: "spoon", name: "Spoon", emoji: "🥄", correct: false },
        { id: "fork", name: "Fork", emoji: "🍴", correct: false }
      ],
      actions: [
        { id: "spread", name: "Spread", emoji: "🧈", correct: true },
        { id: "slice", name: "Slice", emoji: "✂️", correct: false },
        { id: "pour", name: "Pour", emoji: "🥛", correct: false }
      ],
      steps: [
        { id: 1, text: "Put bread on plate", emoji: "🍞➡️🍽️" },
        { id: 2, text: "Spread butter on bread", emoji: "🧈➡️🍞" },
        { id: 3, text: "Add lettuce and cheese", emoji: "🥬🧀➡️🍞" },
        { id: 4, text: "Put top slice of bread", emoji: "🍞➡️🥪" }
      ]
    },
    fruitSalad: {
      name: "Fruit Salad",
      emoji: "🥗",
      description: "Let's make a healthy fruit salad!",
      correctIngredients: ["apple", "banana", "bowl"],
      correctTool: "knife",
      correctAction: "cut",
      ingredients: [
        { id: "apple", name: "Apple", emoji: "🍎", correct: true },
        { id: "banana", name: "Banana", emoji: "🍌", correct: true },
        { id: "bowl", name: "Bowl", emoji: "🥣", correct: true },
        { id: "pencil", name: "Pencil", emoji: "✏️", correct: false },
        { id: "toy", name: "Toy Car", emoji: "🚗", correct: false }
      ],
      tools: [
        { id: "knife", name: "Knife", emoji: "🔪", correct: true },
        { id: "hammer", name: "Hammer", emoji: "🔨", correct: false },
        { id: "brush", name: "Brush", emoji: "🖌️", correct: false }
      ],
      actions: [
        { id: "cut", name: "Cut", emoji: "✂️", correct: true },
        { id: "throw", name: "Throw", emoji: "🤾", correct: false },
        { id: "paint", name: "Paint", emoji: "🎨", correct: false }
      ],
      steps: [
        { id: 1, text: "Wash the fruits", emoji: "🍎🍌💧" },
        { id: 2, text: "Cut apple into pieces", emoji: "🔪➡️🍎" },
        { id: 3, text: "Slice the banana", emoji: "🔪➡️🍌" },
        { id: 4, text: "Mix in bowl", emoji: "🍎🍌➡️🥣" }
      ]
    },
    scrambledEggs: {
      name: "Scrambled Eggs",
      emoji: "🍳",
      description: "Let's cook some fluffy scrambled eggs!",
      correctIngredients: ["egg", "butter", "pan"],
      correctTool: "fork",
      correctAction: "crack",
      ingredients: [
        { id: "egg", name: "Egg", emoji: "🥚", correct: true },
        { id: "butter", name: "Butter", emoji: "🧈", correct: true },
        { id: "pan", name: "Frying Pan", emoji: "🍳", correct: true },
        { id: "shampoo", name: "Shampoo", emoji: "🧴", correct: false },
        { id: "ball", name: "Ball", emoji: "⚽", correct: false }
      ],
      tools: [
        { id: "fork", name: "Fork", emoji: "🍴", correct: true },
        { id: "scissors", name: "Scissors", emoji: "✂️", correct: false },
        { id: "ruler", name: "Ruler", emoji: "📏", correct: false }
      ],
      actions: [
        { id: "crack", name: "Crack", emoji: "💥", correct: true },
        { id: "jump", name: "Jump", emoji: "🦘", correct: false },
        { id: "read", name: "Read", emoji: "📖", correct: false }
      ],
      steps: [
        { id: 1, text: "Crack eggs in bowl", emoji: "🥚➡️🥣" },
        { id: 2, text: "Beat eggs with fork", emoji: "🍴➡️🥚" },
        { id: 3, text: "Heat pan with butter", emoji: "🔥➡️🍳" },
        { id: 4, text: "Cook and stir eggs", emoji: "🥚➡️🍳" }
      ]
    }
  };

  // Speech synthesis
  const speak = (text) => {
    if ('speechSynthesis' in window && autoPlayEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  // Initialize introduction
  useEffect(() => {
    if (currentPhase === 'introduction') {
      speak("Hi Chef! Today, we will make a yummy snack together. Let's choose what we need!");
    }
  }, [currentPhase, autoPlayEnabled]);

  // Show correct popup with confetti
  const showCorrectFeedback = () => {
    setShowCorrectPopup(true);
    triggerConfetti();
    
    setTimeout(() => {
      setShowCorrectPopup(false);
    }, 2000);
  };

  // Confetti animation
  const triggerConfetti = () => {
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)]
      });
    }
    setConfettiPieces(pieces);
    
    setTimeout(() => setConfettiPieces([]), 4000);
  };

  const selectRecipe = (recipeKey) => {
    setSelectedRecipe(recipeKey);
    setCurrentPhase('ingredients');
    setSelectedItems([]);
    speak(`Great choice! Let's make ${recipes[recipeKey].name}. First, tap the ingredients we need.`);
  };

  const handleItemSelection = (item, phase) => {
    if (phaseComplete) return;

    const recipe = recipes[selectedRecipe];
    let correct = false;
    let message = '';

    if (phase === 'ingredients') {
      correct = recipe.correctIngredients.includes(item.id);
      if (correct) {
        setSelectedItems(prev => [...prev, item.id]);
        message = "Good job! We need that.";
        showCorrectFeedback();
        // Check if all ingredients selected
        if (selectedItems.length + 1 === recipe.correctIngredients.length) {
          setPhaseComplete(true);
          setTimeout(() => {
            setCurrentPhase('tools');
            setSelectedItems([]);
            setPhaseComplete(false);
            speak("Perfect! Now, which tool do we use?");
          }, 2000);
        }
      } else {
        message = "Oops, that's not for cooking. Try again.";
        speak(message);
      }
    } else if (phase === 'tools') {
      correct = item.id === recipe.correctTool;
      if (correct) {
        message = "Excellent choice! That's the right tool.";
        showCorrectFeedback();
        setPhaseComplete(true);
        setTimeout(() => {
          setCurrentPhase('actions');
          setSelectedItems([]);
          setPhaseComplete(false);
          speak(`What do we do with the ${recipe.name === 'scrambledEggs' ? 'egg' : recipe.name === 'fruitSalad' ? 'apple' : 'butter'}?`);
        }, 2000);
      } else {
        message = "That's not the right tool. Try again.";
        speak(message);
      }
    } else if (phase === 'actions') {
      correct = item.id === recipe.correctAction;
      if (correct) {
        message = "Perfect! That's exactly what we do.";
        showCorrectFeedback();
        setPhaseComplete(true);
        setTimeout(() => {
          setCurrentPhase('sequencing');
          setSequenceSteps([...recipe.steps].sort(() => Math.random() - 0.5));
          setDraggedSteps([]);
          setPhaseComplete(false);
          speak("Now let's put the cooking steps in the right order!");
        }, 2000);
      } else {
        message = "Not quite right. Think about what we do when cooking.";
        speak(message);
      }
    }

    setIsCorrect(correct);
    setFeedbackMessage(message);
    setShowFeedback(true);

    setTimeout(() => setShowFeedback(false), 2000);
  };

  const handleStepDrag = (step) => {
    if (draggedSteps.find(s => s.id === step.id)) return;
    
    const newDraggedSteps = [...draggedSteps, step];
    setDraggedSteps(newDraggedSteps);
    
    // Check if sequence is complete and correct
    if (newDraggedSteps.length === recipes[selectedRecipe].steps.length) {
      const isCorrectOrder = newDraggedSteps.every((step, index) => step.id === index + 1);
      
      if (isCorrectOrder) {
        setScore(prev => prev + 1);
        showCorrectFeedback();
        setTimeout(() => {
          setCurrentPhase('celebration');
          setShowCelebration(true);
          speak(`You made ${recipes[selectedRecipe].name}! Great job, Chef!`);
        }, 1500);
      } else {
        speak("Let's try again. Think about what comes first, then second, then third...");
        setTimeout(() => setDraggedSteps([]), 2000);
      }
    }
  };

  const resetGame = () => {
    setCurrentPhase('introduction');
    setSelectedRecipe(null);
    setSelectedItems([]);
    setSequenceSteps([]);
    setDraggedSteps([]);
    setPhaseComplete(false);
    setShowCelebration(false);
    setScore(0);
  };

  const restartRecipe = () => {
    setCurrentPhase('ingredients');
    setSelectedItems([]);
    setSequenceSteps([]);
    setDraggedSteps([]);
    setPhaseComplete(false);
    setShowCelebration(false);
  };

  if (currentPhase === 'introduction') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-200 to-orange-300 p-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-8xl">👨‍🍳</div>
              <div>
                <h1 className="text-5xl font-bold text-orange-800">Cook It Yourself!</h1>
                <p className="text-xl text-orange-600 mt-2">Level 5: Independent Cooking</p>
              </div>
            </div>
            
            {/* Audio Toggle */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${
                  autoPlayEnabled 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-400 text-white hover:bg-gray-500'
                }`}
              >
                <span className="text-xl">{autoPlayEnabled ? '🔊' : '🔇'}</span>
                Sound {autoPlayEnabled ? 'On' : 'Off'}
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border-4 border-orange-300">
              <p className="text-2xl text-orange-800 font-bold">
                Hi Chef! Today, we will make a yummy snack together. 
              </p>
              <p className="text-xl text-orange-700 mt-2">
                Let's choose what we need! 🍳
              </p>
            </div>
          </div>

          {/* Recipe Selection */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {Object.entries(recipes).map(([key, recipe]) => (
              <div
                key={key}
                onClick={() => selectRecipe(key)}
                className="bg-white rounded-3xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg border-4 border-orange-200 hover:border-orange-500"
              >
                <div className="text-8xl mb-4">{recipe.emoji}</div>
                <h3 className="text-2xl font-bold text-orange-800 mb-2">
                  {recipe.name}
                </h3>
                <p className="text-orange-600">
                  {recipe.description}
                </p>
              </div>
            ))}
          </div>

          {/* Correct Popup */}
          {showCorrectPopup && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pulse">
              <div className="bg-green-500 text-white px-8 py-6 rounded-2xl text-4xl font-bold shadow-2xl border-4 border-white">
                🎉 Correct! 🎉
              </div>
            </div>
          )}

          {/* Confetti */}
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="fixed w-4 h-4 rounded animate-bounce z-40"
              style={{
                top: '-20px',
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (currentPhase === 'ingredients') {
    const recipe = recipes[selectedRecipe];
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-200 to-blue-300 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4 text-shadow-lg">
            Making {recipe.name} {recipe.emoji}
          </h2>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border-4 border-green-400">
            <p className="text-2xl font-bold text-green-800">
              Tap the ingredients we need for {recipe.name}
            </p>
            <p className="text-lg text-green-700 mt-2">
              Selected: {selectedItems.length}/{recipe.correctIngredients.length}
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 mb-8">
            {recipe.ingredients.map((ingredient) => (
              <div
                key={ingredient.id}
                onClick={() => handleItemSelection(ingredient, 'ingredients')}
                className={`bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 border-4 ${
                  selectedItems.includes(ingredient.id)
                    ? 'border-green-500 bg-green-100 scale-105'
                    : phaseComplete
                    ? 'border-gray-300 cursor-not-allowed opacity-50'
                    : 'border-gray-200 hover:border-green-400 hover:scale-105'
                }`}
              >
                <div className="text-6xl mb-3">{ingredient.emoji}</div>
                <p className="text-lg font-bold text-gray-800">{ingredient.name}</p>
                {selectedItems.includes(ingredient.id) && (
                  <div className="mt-2 text-green-600 font-bold">✓ Selected!</div>
                )}
              </div>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-6 rounded-2xl mb-6 border-4 ${
              isCorrect 
                ? 'bg-green-100 border-green-500 text-green-800' 
                : 'bg-red-100 border-red-500 text-red-800'
            }`}>
              <p className="text-xl font-bold">{feedbackMessage}</p>
            </div>
          )}

          {/* Correct Popup */}
          {showCorrectPopup && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pulse">
              <div className="bg-green-500 text-white px-8 py-6 rounded-2xl text-4xl font-bold shadow-2xl border-4 border-white">
                🎉 Correct! 🎉
              </div>
            </div>
          )}

          {/* Confetti */}
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="fixed w-4 h-4 rounded animate-bounce z-40"
              style={{
                top: '-20px',
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (currentPhase === 'tools') {
    const recipe = recipes[selectedRecipe];
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-200 to-pink-300 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4 text-shadow-lg">
            Choose the Right Tool 🔧
          </h2>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border-4 border-purple-400">
            <p className="text-2xl font-bold text-purple-800">
              Which tool do we use to make {recipe.name}?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {recipe.tools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => handleItemSelection(tool, 'tools')}
                className="bg-white rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 border-4 border-gray-200 hover:border-purple-400"
              >
                <div className="text-8xl mb-4">{tool.emoji}</div>
                <p className="text-xl font-bold text-gray-800">{tool.name}</p>
              </div>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-6 rounded-2xl mb-6 border-4 ${
              isCorrect 
                ? 'bg-green-100 border-green-500 text-green-800' 
                : 'bg-red-100 border-red-500 text-red-800'
            }`}>
              <p className="text-xl font-bold">{feedbackMessage}</p>
            </div>
          )}

          {/* Correct Popup */}
          {showCorrectPopup && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pulse">
              <div className="bg-green-500 text-white px-8 py-6 rounded-2xl text-4xl font-bold shadow-2xl border-4 border-white">
                🎉 Correct! 🎉
              </div>
            </div>
          )}

          {/* Confetti */}
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="fixed w-4 h-4 rounded animate-bounce z-40"
              style={{
                top: '-20px',
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (currentPhase === 'actions') {
    const recipe = recipes[selectedRecipe];
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-200 to-orange-300 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4 text-shadow-lg">
            What Do We Do? ⚡
          </h2>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border-4 border-red-400">
            <p className="text-2xl font-bold text-red-800">
              What do we do when making {recipe.name}?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {recipe.actions.map((action) => (
              <div
                key={action.id}
                onClick={() => handleItemSelection(action, 'actions')}
                className="bg-white rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 border-4 border-gray-200 hover:border-red-400"
              >
                <div className="text-8xl mb-4">{action.emoji}</div>
                <p className="text-xl font-bold text-gray-800">{action.name}</p>
              </div>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-6 rounded-2xl mb-6 border-4 ${
              isCorrect 
                ? 'bg-green-100 border-green-500 text-green-800' 
                : 'bg-red-100 border-red-500 text-red-800'
            }`}>
              <p className="text-xl font-bold">{feedbackMessage}</p>
            </div>
          )}

          {/* Correct Popup */}
          {showCorrectPopup && (
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-pulse">
              <div className="bg-green-500 text-white px-8 py-6 rounded-2xl text-4xl font-bold shadow-2xl border-4 border-white">
                🎉 Correct! 🎉
              </div>
            </div>
          )}

          {/* Confetti */}
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="fixed w-4 h-4 rounded animate-bounce z-40"
              style={{
                top: '-20px',
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (currentPhase === 'sequencing') {
    const recipe = recipes[selectedRecipe];
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-300 p-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4 text-shadow-lg">
            Put Steps in Order 📋
          </h2>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border-4 border-blue-400">
            <p className="text-2xl font-bold text-blue-800">
              Click the steps in the right order to make {recipe.name}
            </p>
            <p className="text-lg text-blue-700 mt-2">
              Step {draggedSteps.length + 1} of {recipe.steps.length}
            </p>
          </div>

          {/* Sequence Building Area */}
          <div className="bg-white/80 rounded-2xl p-6 mb-8 border-4 border-green-400">
            <h3 className="text-xl font-bold text-green-800 mb-4">Your Recipe Order:</h3>
            <div className="flex flex-wrap justify-center gap-4 min-h-[100px] items-center">
              {draggedSteps.length === 0 ? (
                <p className="text-gray-500 italic">Click steps below to build your recipe...</p>
              ) : (
                draggedSteps.map((step, index) => (
                  <div key={step.id} className="bg-green-100 border-2 border-green-500 rounded-xl p-4 flex items-center gap-3">
                    <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <div className="text-3xl">{step.emoji}</div>
                    <p className="font-bold text-green-800">{step.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sequenceSteps.map((step) => (
              <div
                key={step.id}
                onClick={() => handleStepDrag(step)}
                className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 border-4 ${
                  draggedSteps.find(s => s.id === step.id)
                    ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                    : 'bg-white border-blue-200 hover:border-blue-400 hover:scale-105'
                }`}
              >
                <div className="text-6xl mb-3">{step.emoji}</div>
                <p className="text-lg font-bold text-gray-800">{step.text}</p>
                {draggedSteps.find(s => s.id === step.id) && (
                  <div className="mt-2 text-green-600 font-bold">✓ Added!</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentPhase === 'celebration') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-200 to-orange-300 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Confetti */}
        {confettiPieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-4 h-4 rounded animate-bounce"
            style={{
              top: '-20px',
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: '4s'
            }}
          />
        ))}

        <div className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-2xl w-full border-8 border-yellow-400 relative z-10">
          <div className="text-8xl mb-6">🎉</div>
          <Trophy className="mx-auto mb-6 text-yellow-500" size={80} />
          
          <h1 className="text-5xl font-bold text-green-600 mb-4">
            You Made It!
          </h1>
          
          <p className="text-2xl text-gray-700 mb-6">
            Great job, Chef! You made {recipes[selectedRecipe].name} all by yourself! 🌟
          </p>

          <div className="flex justify-center gap-2 mb-8">
            {[...Array(3)].map((_, i) => (
              <Star key={i} className="text-yellow-500" size={40} fill="currentColor" />
            ))}
          </div>

          <p className="text-xl text-gray-600 mb-8">
            You completed all the steps perfectly! 
            <br />
            Now you can cook this recipe anytime! 👨‍🍳
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={restartRecipe}
              className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={24} />
              Cook Again
            </button>
            <button
              onClick={resetGame}
              className="bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <ChefHat size={24} />
              Try New Recipe
            </button>
            <button
              onClick={resetGame}
              className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Home size={24} />
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default CookItYourselfGame;