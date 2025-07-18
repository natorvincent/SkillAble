import React, { useState, useEffect } from 'react';

const CookingLevel5 = () => {
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
  const [completedRecipes, setCompletedRecipes] = useState([]);

  const recipes = {
    sandwich: {
      name: "Sandwich",
      image: "cookingLevel5_recipe/sandwich.png",
      description: "Let's make a delicious sandwich together!",
      correctIngredients: ["bread", "lettuce", "cheese"],
      correctTool: "knife",
      correctAction: "spread",
      ingredients: [
        { id: "bread", name: "Bread", image: "cookingLevel5_ingredients/bread.png", correct: true },
        { id: "lettuce", name: "Lettuce", image: "cookingLevel5_ingredients/lettuce.png", correct: true },
        { id: "cheese", name: "Cheese", image: "cookingLevel5_ingredients/cheese.png", correct: true },
        { id: "tomato", name: "Tomato", image: "cookingLevel5_ingredients/tomato.png", correct: false },
        { id: "chocolate", name: "Chocolate", image: "cookingLevel5_ingredients/chocolate.png", correct: false }
      ],
      tools: [
        { id: "knife", name: "Knife", image: "cookingLevel5_tools/knife.png", correct: true },
        { id: "spatula", name: "Spatula", image: "cookingLevel5_tools/spatula.png", correct: false },
        { id: "tongs", name: "Tongs", image: "cookingLevel5_tools/tongs.png", correct: false }
      ],
      actions: [
        { id: "spread", name: "Spread", image: "cookingLevel5_actions/spread.png", correct: true },
        { id: "grill", name: "Grill", image: "cookingLevel5_actions/grill.png", correct: false },
        { id: "mix", name: "Mix", image: "cookingLevel5_actions/mix.png", correct: false }
      ],
      steps: [
        { id: 1, text: "Put bread on plate", image: "cookingLevel5_steps/putbreadonplate.png" },
        { id: 2, text: "Spread butter on bread", image: "cookingLevel5_steps/spreadbutteronbread.png" },
        { id: 3, text: "Add lettuce and cheese", image: "cookingLevel5_steps/addlettuceandcheese.png" },
        { id: 4, text: "Put top slice of bread", image: "cookingLevel5_steps/puttopsliceofbread.png" }
      ]
    },
    fruitSalad: {
      name: "Fruit Salad",
      image: "cookingLevel5_recipe/fruitsalad.png",
      description: "Let's make a healthy fruit salad!",
      correctIngredients: ["apple", "banana", "bowl"],
      correctTool: "knife",
      correctAction: "cut",
      ingredients: [
        { id: "apple", name: "Apple", image: "cookingLevel5_ingredients/apple.png", correct: true },
        { id: "banana", name: "Banana", image: "cookingLevel5_ingredients/banana.png", correct: true },
        { id: "bowl", name: "Bowl", image: "cookingLevel5_ingredients/bowl.png", correct: true },
        { id: "orange", name: "Orange", image: "cookingLevel5_ingredients/orange.png", correct: false },
        { id: "watermelon", name: "Watermelon", image: "cookingLevel5_ingredients/watermelon.png", correct: false }
      ],
      tools: [
        { id: "knife", name: "Knife", image: "cookingLevel5_tools/knife.png", correct: true },
        { id: "peeler", name: "Peeler", image: "cookingLevel5_tools/peeler.png", correct: false },
        { id: "grater", name: "Grater", image: "cookingLevel5_tools/grater.png", correct: false }
      ],
      actions: [
        { id: "cut", name: "Cut", image: "cookingLevel5_actions/cut.png", correct: true },
        { id: "squeeze", name: "Squeeze", image: "cookingLevel5_actions/squeeze.png", correct: false },
        { id: "stir", name: "Stir", image: "cookingLevel5_actions/stir.png", correct: false }
      ],
      steps: [
        { id: 1, text: "Wash the fruits", image: "cookingLevel5_steps/washthefruit.png" },
        { id: 2, text: "Cut apple into pieces", image: "cookingLevel5_steps/cutappleintopieces.png" },
        { id: 3, text: "Slice the banana", image: "cookingLevel5_steps/slicethebanana.png" },
        { id: 4, text: "Mix in bowl", image: "cookingLevel5_steps/mixinabowl.png" }
      ]
    },
    scrambledEggs: {
      name: "Scrambled Eggs",
      image: "cookingLevel5_recipe/scrambledegg.png",
      description: "Let's cook some fluffy scrambled eggs!",
      correctIngredients: ["egg", "butter", "pan"],
      correctTool: "fork",
      correctAction: "crack",
      ingredients: [
        { id: "egg", name: "Egg", image: "cookingLevel5_ingredients/egg.png", correct: true },
        { id: "butter", name: "Butter", image: "cookingLevel5_ingredients/butter.png", correct: true },
        { id: "pan", name: "Frying Pan", image: "cookingLevel5_tools/spatula.png", correct: true }, // Using spatula as pan placeholder
        { id: "milk", name: "Milk", image: "cookingLevel5_ingredients/milk.png", correct: false },
        { id: "salt", name: "Salt", image: "cookingLevel5_ingredients/salt.png", correct: false }
      ],
      tools: [
        { id: "fork", name: "Fork", image: "cookingLevel5_tools/fork.png", correct: true },
        { id: "tongs", name: "Tongs", image: "cookingLevel5_tools/tongs.png", correct: false },
        { id: "whisk", name: "Whisk", image: "cookingLevel5_tools/whisk.png", correct: false }
      ],
      actions: [
        { id: "crack", name: "Crack", image: "cookingLevel5_actions/crack.png", correct: true },
        { id: "fry", name: "Fry", image: "cookingLevel5_actions/fry.png", correct: false },
        { id: "stir", name: "Stir", image: "cookingLevel5_actions/stir.png", correct: false }
      ],
      steps: [
        { id: 1, text: "Crack eggs in bowl", image: "cookingLevel5_steps/crackeggsinbowl.png" },
        { id: 2, text: "Beat eggs with fork", image: "cookingLevel5_steps/beateggswithfork.png" },
        { id: 3, text: "Heat pan with butter", image: "cookingLevel5_steps/heatpanwithbutter.png" },
        { id: 4, text: "Cook and stir eggs", image: "cookingLevel5_steps/cookandstireggs.png" }
      ]
    }
  };

  // Helper function to create image element
  const createImage = (src, alt, className = "w-12 h-12 object-contain") => {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={(e) => {
          // Fallback to a placeholder or emoji if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline';
        }}
      />
    );
  };

  // Confetti animation
  useEffect(() => {
    if (showCelebration) {
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]
      }));
      setConfettiPieces(pieces);
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setConfettiPieces([]);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // Auto progression logic
  useEffect(() => {
    if (autoPlayEnabled && phaseComplete) {
      const timer = setTimeout(() => {
        progressToNextPhase();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phaseComplete, autoPlayEnabled]);

  const progressToNextPhase = () => {
    setPhaseComplete(false);
    setSelectedItems([]);
    setShowFeedback(false);
    
    if (currentPhase === 'introduction') {
      setCurrentPhase('ingredients');
    } else if (currentPhase === 'ingredients') {
      setCurrentPhase('tools');
    } else if (currentPhase === 'tools') {
      setCurrentPhase('actions');
    } else if (currentPhase === 'actions') {
      setCurrentPhase('sequencing');
      setSequenceSteps([...selectedRecipe.steps].sort(() => Math.random() - 0.5));
      setDraggedSteps([]);
    } else if (currentPhase === 'sequencing') {
      setCurrentPhase('celebration');
      setCompletedRecipes([...completedRecipes, selectedRecipe.name]);
      setShowCelebration(true);
      setScore(score + 100);
    }
  };

  const selectRecipe = (recipeKey) => {
    setSelectedRecipe(recipes[recipeKey]);
    setCurrentPhase('ingredients');
    setScore(0);
    setCompletedRecipes([]);
  };

  const handleItemSelect = (item) => {
    const newSelectedItems = [...selectedItems, item.id];
    setSelectedItems(newSelectedItems);
    
    let correct = false;
    let message = '';
    
    if (currentPhase === 'ingredients') {
      const correctIngredients = selectedRecipe.correctIngredients;
      if (newSelectedItems.length === correctIngredients.length) {
        correct = newSelectedItems.every(id => correctIngredients.includes(id));
        message = correct ? 'Perfect! You chose all the right ingredients!' : 'Oops! Some ingredients don\'t belong in this recipe.';
      } else if (newSelectedItems.length < correctIngredients.length) {
        message = `Good choice! You need ${correctIngredients.length - newSelectedItems.length} more ingredient${correctIngredients.length - newSelectedItems.length === 1 ? '' : 's'}.`;
        return;
      }
    } else if (currentPhase === 'tools') {
      correct = item.id === selectedRecipe.correctTool;
      message = correct ? 'Excellent! That\'s the right tool for the job!' : 'Not quite right. Try a different tool!';
    } else if (currentPhase === 'actions') {
      correct = item.id === selectedRecipe.correctAction;
      message = correct ? 'Great! That\'s the correct cooking action!' : 'That\'s not the right action for this recipe.';
    }
    
    setIsCorrect(correct);
    setFeedbackMessage(message);
    setShowFeedback(true);
    
    if (correct) {
      setPhaseComplete(true);
      setShowCorrectPopup(true);
      setScore(score + 25);
      
      setTimeout(() => {
        setShowCorrectPopup(false);
      }, 1500);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const stepId = parseInt(e.dataTransfer.getData('text/plain'));
    const step = sequenceSteps.find(s => s.id === stepId);
    
    if (step && !draggedSteps.find(s => s.id === stepId)) {
      const newDraggedSteps = [...draggedSteps, step];
      setDraggedSteps(newDraggedSteps);
      
      if (newDraggedSteps.length === selectedRecipe.steps.length) {
        const correct = newDraggedSteps.every((step, index) => step.id === selectedRecipe.steps[index].id);
        setIsCorrect(correct);
        setFeedbackMessage(correct ? 'Perfect! You got the steps in the right order!' : 'Not quite right. Try again!');
        setShowFeedback(true);
        
        if (correct) {
          setPhaseComplete(true);
          setShowCorrectPopup(true);
          setScore(score + 50);
          
          setTimeout(() => {
            setShowCorrectPopup(false);
          }, 1500);
        } else {
          setTimeout(() => {
            setDraggedSteps([]);
            setShowFeedback(false);
          }, 2000);
        }
      }
    }
  };

  const renderIntroduction = () => (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-purple-800 mb-8">🍳 Cooking Adventure! 🍳</h1>
      <p className="text-xl text-gray-700 mb-8">Choose a recipe to start cooking!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {Object.entries(recipes).map(([key, recipe]) => (
          <div
            key={key}
            onClick={() => selectRecipe(key)}
            className="bg-white p-6 rounded-xl shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300 border-2 border-purple-200 hover:border-purple-400"
          >
            <div className="flex justify-center mb-4">
              {createImage(recipe.image, recipe.name, "w-20 h-20 object-contain")}
              <span style={{display: 'none'}} className="text-6xl">{recipe.name === 'Sandwich' ? '🥪' : recipe.name === 'Fruit Salad' ? '🥗' : '🍳'}</span>
            </div>
            <h3 className="text-2xl font-bold text-purple-700 mb-2">{recipe.name}</h3>
            <p className="text-gray-600">{recipe.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPhase = () => {
    if (currentPhase === 'introduction') return renderIntroduction();
    if (!selectedRecipe) return renderIntroduction();

    const phaseData = {
      ingredients: {
        title: 'Choose the Ingredients',
        items: selectedRecipe.ingredients,
        instruction: `Select the ingredients needed for ${selectedRecipe.name}:`
      },
      tools: {
        title: 'Pick the Right Tool',
        items: selectedRecipe.tools,
        instruction: 'Which tool do you need?'
      },
      actions: {
        title: 'Choose the Cooking Action',
        items: selectedRecipe.actions,
        instruction: 'What should you do with the ingredients?'
      }
    };

    if (currentPhase === 'sequencing') {
      return (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-purple-800 mb-6">Put the Steps in Order</h2>
          <p className="text-lg text-gray-700 mb-8">Drag the steps to arrange them in the correct cooking order:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-700">Available Steps:</h3>
              <div className="space-y-3">
                {sequenceSteps.filter(step => !draggedSteps.find(d => d.id === step.id)).map(step => (
                  <div
                    key={step.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', step.id.toString())}
                    className="bg-blue-100 p-4 rounded-lg cursor-move hover:bg-blue-200 transition-colors border-2 border-blue-300 flex items-center gap-3"
                  >
                    {createImage(step.image, step.text, "w-8 h-8 object-contain")}
                    <span style={{display: 'none'}} className="text-2xl mr-3">{step.emoji}</span>
                    <span className="text-lg">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-700">Cooking Order:</h3>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="min-h-96 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg p-4 space-y-3"
              >
                {draggedSteps.map((step, index) => (
                  <div key={step.id} className="bg-purple-100 p-4 rounded-lg border-2 border-purple-400 flex items-center gap-3">
                    <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    {createImage(step.image, step.text, "w-8 h-8 object-contain")}
                    <span style={{display: 'none'}} className="text-2xl mr-3">{step.emoji}</span>
                    <span className="text-lg">{step.text}</span>
                  </div>
                ))}
                {draggedSteps.length === 0 && (
                  <div className="text-center text-gray-500 py-16">
                    Drop steps here in the correct order
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentPhase === 'celebration') {
      return (
        <div className="text-center relative">
          <div className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">🎉 Congratulations! 🎉</h2>
            <p className="text-xl mb-6">You successfully cooked {selectedRecipe.name}!</p>
            <div className="flex justify-center mb-6">
              {createImage(selectedRecipe.image, selectedRecipe.name, "w-32 h-32 object-contain")}
              <span style={{display: 'none'}} className="text-8xl">{selectedRecipe.emoji}</span>
            </div>
            <p className="text-lg mb-4">Final Score: {score} points</p>
            <button
              onClick={() => {
                setCurrentPhase('introduction');
                setSelectedRecipe(null);
                setSelectedItems([]);
                setShowFeedback(false);
                setPhaseComplete(false);
              }}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-purple-100 transition-colors"
            >
              Cook Another Recipe!
            </button>
          </div>
          
          {/* Confetti Animation */}
          {showCelebration && (
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              {confettiPieces.map(piece => (
                <div
                  key={piece.id}
                  className="absolute w-3 h-3 rounded animate-bounce"
                  style={{
                    left: `${piece.left}%`,
                    backgroundColor: piece.color,
                    animationDelay: `${piece.delay}s`,
                    animationDuration: '3s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    const phase = phaseData[currentPhase];
    
    return (
      <div className="text-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-purple-800 mb-2">{phase.title}</h2>
          <div className="flex justify-center mb-4">
            {createImage(selectedRecipe.image, selectedRecipe.name, "w-16 h-16 object-contain")}
            <span style={{display: 'none'}} className="text-4xl">{selectedRecipe.emoji}</span>
          </div>
          <p className="text-lg text-gray-700">{phase.instruction}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto mb-8">
          {phase.items.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemSelect(item)}
              className={`
                p-4 rounded-xl cursor-pointer transform transition-all duration-300 border-2
                ${selectedItems.includes(item.id) 
                  ? 'bg-green-100 border-green-400 scale-105' 
                  : 'bg-white border-gray-200 hover:border-purple-400 hover:scale-105'
                }
                ${item.correct ? 'shadow-lg' : 'shadow-md'}
              `}
            >
              <div className="flex justify-center mb-2">
                {createImage(item.image, item.name, "w-12 h-12 object-contain")}
                <span style={{display: 'none'}} className="text-3xl">{item.emoji}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white p-4 rounded-xl shadow-lg inline-block">
            <div className="flex items-center justify-center gap-4">
              <span className="text-2xl font-bold text-purple-800">Score: {score}</span>
              {selectedRecipe && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-600">Making:</span>
                  {createImage(selectedRecipe.image, selectedRecipe.name, "w-8 h-8 object-contain")}
                  <span style={{display: 'none'}} className="text-2xl">{selectedRecipe.emoji}</span>
                  <span className="text-lg font-semibold text-purple-700">{selectedRecipe.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {renderPhase()}

        {/* Feedback */}
        {showFeedback && (
          <div className={`
            fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 rounded-xl shadow-lg text-white font-semibold text-lg max-w-md text-center
            ${isCorrect ? 'bg-green-500' : 'bg-red-500'}
          `}>
            {feedbackMessage}
          </div>
        )}

        {/* Correct Answer Popup */}
        {showCorrectPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center transform scale-110">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Correct!</h3>
              <p className="text-lg text-gray-700">Great job!</p>
            </div>
          </div>
        )}

        {/* Auto-play Toggle */}
        <div className="fixed top-4 right-4">
          <button
            onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
            className={`
              px-4 py-2 rounded-full font-semibold text-sm transition-colors
              ${autoPlayEnabled 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }
            `}
          >
            Auto-play: {autoPlayEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookingLevel5;