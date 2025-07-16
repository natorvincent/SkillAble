import React, { useState } from 'react';
import { Check, X, RotateCcw, Play, Star, Volume2, Home, ArrowLeft } from 'lucide-react';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

// Import kitchen background only (using online URLs for clipart)
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

export default function CookingLevel4() {
  const [currentStep, setCurrentStep] = useState(0);
  const [gamePhase, setGamePhase] = useState('intro');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState('sandwich');
  const [confetti, setConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip] = useState('Ready to learn recipe sequences? Let\'s start cooking step by step!');
  const [score, setScore] = useState(0);
  const [completedRecipes, setCompletedRecipes] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [currentLevel] = useState(4);

  const navigate = (path) => {
    // Replace with your navigation logic
    console.log('Navigate to:', path);
  };

  const recipes = {
    sandwich: {
      name: "Sandwich",
      emoji: "🥪",
      steps: [
        { completed: "Step 1: We put the bread on the plate.", image: "🍞", description: "A slice of bread on a plate" },
        { completed: "Step 2: We spread butter on the bread.", image: "🧈", description: "Butter spread on bread" },
        { completed: "Step 3: We add cheese to the bread.", image: "🧀", description: "Cheese placed on buttered bread" },
        { completed: "Step 4: We add lettuce on top.", image: "🥬", description: "Fresh lettuce on the cheese" },
        { completed: "Step 5: We put the top slice of bread.", image: "🥪", description: "Complete sandwich with top bread" }
      ],
      choices: [
        [
          { text: "Spread butter", emoji: "🧈", correct: true },
          { text: "Add lettuce", emoji: "🥬", correct: false },
          { text: "Drink juice", emoji: "🧃", correct: false }
        ],
        [
          { text: "Add cheese", emoji: "🧀", correct: true },
          { text: "Put another plate", emoji: "🍽️", correct: false },
          { text: "Eat the bread", emoji: "😋", correct: false }
        ],
        [
          { text: "Add lettuce", emoji: "🥬", correct: true },
          { text: "Add more butter", emoji: "🧈", correct: false },
          { text: "Put in toaster", emoji: "🔥", correct: false }
        ],
        [
          { text: "Put top bread", emoji: "🍞", correct: true },
          { text: "Add more cheese", emoji: "🧀", correct: false },
          { text: "Cut in half", emoji: "🔪", correct: false }
        ]
      ]
    },
    fruitSalad: {
      name: "Fruit Salad",
      emoji: "🥗",
      steps: [
        { completed: "Step 1: We wash the fruits.", image: "🚿", description: "Clean fruits under running water" },
        { completed: "Step 2: We cut the apple into pieces.", image: "🍎", description: "Apple cut into small pieces" },
        { completed: "Step 3: We slice the banana.", image: "🍌", description: "Banana sliced into rounds" },
        { completed: "Step 4: We put everything in a bowl.", image: "🥣", description: "All fruits in a mixing bowl" },
        { completed: "Step 5: We mix gently with a spoon.", image: "🥗", description: "Beautiful mixed fruit salad" }
      ],
      choices: [
        [
          { text: "Cut the apple", emoji: "🍎", correct: true },
          { text: "Eat the banana", emoji: "😋", correct: false },
          { text: "Add sugar", emoji: "🍯", correct: false }
        ],
        [
          { text: "Slice banana", emoji: "🍌", correct: true },
          { text: "Wash again", emoji: "🚿", correct: false },
          { text: "Add ice cream", emoji: "🍦", correct: false }
        ],
        [
          { text: "Put in bowl", emoji: "🥣", correct: true },
          { text: "Cut more apple", emoji: "🍎", correct: false },
          { text: "Drink water", emoji: "💧", correct: false }
        ],
        [
          { text: "Mix with spoon", emoji: "🥄", correct: true },
          { text: "Add more fruit", emoji: "🍓", correct: false },
          { text: "Put in fridge", emoji: "🧊", correct: false }
        ]
      ]
    },
    scrambledEggs: {
      name: "Scrambled Eggs",
      emoji: "🍳",
      steps: [
        { completed: "Step 1: We crack the eggs into a bowl.", image: "🥚", description: "Eggs cracked into mixing bowl" },
        { completed: "Step 2: We beat the eggs with a fork.", image: "🍴", description: "Eggs beaten until smooth" },
        { completed: "Step 3: We heat the pan on the stove.", image: "🔥", description: "Pan heating on the stove" },
        { completed: "Step 4: We pour eggs into the hot pan.", image: "🍳", description: "Beaten eggs poured into pan" },
        { completed: "Step 5: We scramble and serve!", image: "🍽️", description: "Perfect scrambled eggs on plate" }
      ],
      choices: [
        [
          { text: "Beat with fork", emoji: "🍴", correct: true },
          { text: "Add milk", emoji: "🥛", correct: false },
          { text: "Put in toaster", emoji: "🔥", correct: false }
        ],
        [
          { text: "Heat the pan", emoji: "🔥", correct: true },
          { text: "Add cheese", emoji: "🧀", correct: false },
          { text: "Beat more", emoji: "🍴", correct: false }
        ],
        [
          { text: "Pour eggs in pan", emoji: "🍳", correct: true },
          { text: "Turn off heat", emoji: "❄️", correct: false },
          { text: "Add salt", emoji: "🧂", correct: false }
        ],
        [
          { text: "Scramble and serve", emoji: "🍽️", correct: true },
          { text: "Add more eggs", emoji: "🥚", correct: false },
          { text: "Let it sit", emoji: "⏰", correct: false }
        ]
      ]
    },
    cereal: {
      name: "Cereal with Milk",
      emoji: "🥣",
      steps: [
        { completed: "Step 1: We get a clean bowl.", image: "🥣", description: "Empty bowl ready for cereal" },
        { completed: "Step 2: We pour cereal into the bowl.", image: "🥣", description: "Cereal in the bowl" },
        { completed: "Step 3: We pour milk over the cereal.", image: "🥛", description: "Milk poured over cereal" },
        { completed: "Step 4: We get a spoon to eat.", image: "🥄", description: "Spoon ready for eating" },
        { completed: "Step 5: We enjoy our breakfast!", image: "😋", description: "Delicious cereal breakfast" }
      ],
      choices: [
        [
          { text: "Pour cereal", emoji: "🥣", correct: true },
          { text: "Pour milk first", emoji: "🥛", correct: false },
          { text: "Get a fork", emoji: "🍴", correct: false }
        ],
        [
          { text: "Pour milk", emoji: "🥛", correct: true },
          { text: "Add sugar", emoji: "🍯", correct: false },
          { text: "Get another bowl", emoji: "🥣", correct: false }
        ],
        [
          { text: "Get a spoon", emoji: "🥄", correct: true },
          { text: "Add more cereal", emoji: "🥣", correct: false },
          { text: "Put in microwave", emoji: "🔥", correct: false }
        ],
        [
          { text: "Enjoy breakfast", emoji: "😋", correct: true },
          { text: "Add more milk", emoji: "🥛", correct: false },
          { text: "Put in fridge", emoji: "🧊", correct: false }
        ]
      ]
    }
  };

  const currentRecipe = recipes[selectedRecipe];

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;
    setProgressSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProgressSaving(false);
    setProgressSaved(true);
    setTimeout(() => setProgressSaved(false), 3000);
  };

  const getStarRating = (finalScore = score) => {
    const percentage = (finalScore / Object.keys(recipes).length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const handleChoice = (choice) => {
    if (choice.correct) {
      setCorrectAnswers(prev => prev + 1);
      setFeedbackType('correct');
      setShowFeedback(true);

      setTimeout(() => {
        setShowFeedback(false);
        if (currentStep < currentRecipe.choices.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          if (!completedRecipes.includes(selectedRecipe)) {
            setScore(prev => prev + 1);
            setCompletedRecipes(prev => [...prev, selectedRecipe]);
          }
          setGamePhase('complete');
          setConfetti(true);
          saveProgress();
          setTimeout(() => setConfetti(false), 3000);
        }
      }, 2000);
    } else {
      setFeedbackType('incorrect');
      setShowFeedback(true);
      setTimeout(() => {
        setShowFeedback(false);
      }, 2000);
    }
  };

  const resetGame = () => {
    setCurrentStep(0);
    setGamePhase('intro');
    setShowFeedback(false);
    setConfetti(false);
    setCorrectAnswers(0);
  };

  const startGame = () => {
    setCurrentStep(0);
    setGamePhase('game');
    setShowFeedback(false);
    setCorrectAnswers(0);
  };

  const goToHomepage = () => {
    navigate('/homepage');
  };

  const continueToNextLevel = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const Confetti = () => (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-ping"
          style={{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 2 + 's',
            animationDuration: '1s'
          }}
        >
          {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full border border-orange-200">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-bold text-orange-600 mb-4">Loading recipe sequences...</h3>
          <div className="text-5xl animate-pulse">👨‍🍳🥪🥗</div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'intro') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fed7aa 0%, #fecaca 100%)',
        padding: '1rem'
      }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '1rem', 
              marginBottom: '1.5rem' 
            }}>
              <div style={{
                background: '#fed7aa',
                padding: '0.75rem',
                borderRadius: '50%',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Volume2 style={{ width: '2rem', height: '2rem', color: '#ea580c' }} />
              </div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: '#ea580c',
                margin: 0
              }}>
                Cooking Steps Game
              </h1>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginBottom: '1.5rem' 
            }}>
              <div style={{
                background: 'linear-gradient(to right, #fed7aa, #fecaca)',
                border: '2px solid #fdba74',
                borderRadius: '1rem',
                padding: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🔥</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#c2410c' }}>
                    Level {currentLevel} - Recipe Sequences
                  </span>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(to right, #dcfce7, #d1fae5)',
                border: '2px solid #86efac',
                borderRadius: '1rem',
                padding: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>🏆</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#15803d' }}>
                    Completed: {score}/{Object.keys(recipes).length}
                  </span>
                  <div style={{ display: 'flex' }}>
                    {[...Array(getStarRating())].map((_, i) => (
                      <span key={i} style={{ fontSize: '1.25rem' }}>⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {showTip && (
              <div style={{
                background: 'linear-gradient(to right, #fef3c7, #fed7aa)',
                border: '2px solid #fbbf24',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                maxWidth: '48rem',
                margin: '0 auto 2rem auto',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>💡</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#92400e' }}>Cooking Tip!</span>
                </div>
                <p style={{ fontSize: '1.125rem', color: '#92400e', margin: 0 }}>{showTip}</p>
              </div>
            )}

            <div style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '1.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              marginBottom: '2rem',
              maxWidth: '32rem',
              margin: '0 auto 2rem auto',
              border: '1px solid #fed7aa'
            }}>
              <div style={{ fontSize: '1.875rem', marginBottom: '1rem' }}>👨‍🍳</div>
              <p style={{
                fontSize: '1.25rem',
                color: '#374151',
                fontWeight: '500',
                margin: 0
              }}>
                "We are going to make food together. Let's find out what step comes next!"
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {Object.entries(recipes).map(([key, recipe]) => (
              <button
                key={key}
                onClick={() => setSelectedRecipe(key)}
                style={{
                  position: 'relative',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: selectedRecipe === key ? '2px solid #fb923c' : '2px solid #e5e7eb',
                  background: selectedRecipe === key 
                    ? 'linear-gradient(135deg, #fed7aa, #fecaca)' 
                    : 'white',
                  boxShadow: selectedRecipe === key 
                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transform: selectedRecipe === key ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (selectedRecipe !== key) {
                    e.target.style.borderColor = '#fb923c';
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedRecipe !== key) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {completedRecipes.includes(key) && (
                  <div style={{
                    position: 'absolute',
                    top: '-0.75rem',
                    right: '-0.75rem',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    width: '2.5rem',
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}>
                    ✓
                  </div>
                )}
                <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>{recipe.emoji}</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {recipe.name}
                </div>
                {completedRecipes.includes(key) && (
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#059669',
                    fontWeight: '600',
                    background: '#d1fae5',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px'
                  }}>
                    Completed! ✨
                  </div>
                )}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <button
                onClick={startGame}
                style={{
                  background: 'linear-gradient(to right, #10b981, #059669)',
                  color: 'white',
                  padding: '1rem 2.5rem',
                  borderRadius: '1rem',
                  fontWeight: 'bold',
                  fontSize: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #059669, #047857)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(to right, #10b981, #059669)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <Play style={{ width: '1.5rem', height: '1.5rem' }} />
                Start Cooking!
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: 'linear-gradient(to right, #6b7280, #4b5563)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
                Back
              </button>
              <button
                onClick={goToHomepage}
                style={{
                  background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Home style={{ width: '1.25rem', height: '1.25rem' }} />
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gamePhase === 'complete') {
    const allRecipesCompleted = completedRecipes.length >= Object.keys(recipes).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        {confetti && <Confetti />}

        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-200">
            <div className="text-8xl mb-6 animate-bounce">{currentRecipe.emoji}</div>
            <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-6">
              🎉 Congratulations! 🎉
            </h1>

            {allRecipesCompleted && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 rounded-2xl p-4 mb-6 inline-block shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-xl font-bold text-purple-700">
                    Level {currentLevel} Complete!
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-center mb-6">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={`text-5xl mx-1 ${i < getStarRating() ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ⭐
                </span>
              ))}
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6 border border-green-200">
              <p className="text-2xl text-gray-700 mb-4 font-medium">
                "You finished making a {currentRecipe.name.toLowerCase()}! Great job!"
              </p>
              <div className="text-6xl mb-4 animate-pulse">🌟</div>
              <p className="text-lg text-gray-600 mb-4">
                You learned all the steps and followed them perfectly!
              </p>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  Progress: {completedRecipes.length}/{Object.keys(recipes).length} recipes completed
                </p>
                <p className="text-base text-gray-600">
                  Score: {Math.round((score / Object.keys(recipes).length) * 100)}%
                </p>
              </div>
            </div>

            {progressSaving && (
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400 rounded-2xl p-4 mb-6 max-w-md mx-auto shadow-md">
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <span className="text-blue-700 font-medium">Saving your cooking progress...</span>
                </div>
              </div>
            )}

            {progressSaved && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-2xl p-4 mb-6 max-w-md mx-auto shadow-md">
                <div className="flex items-center justify-center">
                  <span className="text-green-700 mr-2 text-xl">✓</span>
                  <span className="text-green-700 font-medium">Recipe skills saved!</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {allRecipesCompleted ? (
              <>
                <button
                  onClick={continueToNextLevel}
                  disabled={progressSaving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-300 disabled:to-pink-300 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all duration-300 disabled:cursor-not-allowed shadow-lg transform hover:scale-105"
                >
                  {progressSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🚀</span>
                      Next Level
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(0);
                    setGamePhase('game');
                    setCorrectAnswers(0);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md"
                >
                  <Star className="w-5 h-5" />
                  Play Again
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Another Recipe
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(0);
                    setGamePhase('game');
                    setCorrectAnswers(0);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md"
                >
                  <Star className="w-5 h-5" />
                  Play Again
                </button>
                <button
                  onClick={resetGame}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md"
                >
                  <Star className="w-5 h-5" />
                  Complete More Recipes
                </button>
              </>
            )}
            <button
              onClick={goToHomepage}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game phase
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fecaca 100%)',
        padding: '2rem'
      }}
    >
      <div
        style={{
          maxWidth: 500,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 2px 16px #fbbf24',
          textAlign: 'center'
        }}
      >
        <h2 style={{ color: '#ea580c', fontSize: 32, marginBottom: 8 }}>
          Making {currentRecipe.name} {currentRecipe.emoji}
        </h2>
        <div style={{ margin: '8px 0', color: '#b45309', fontWeight: 'bold' }}>
          🏆 Completed: {score}/{Object.keys(recipes).length}
        </div>
        <div style={{ fontSize: 18, margin: '8px 0' }}>
          Step {currentStep + 1} of {currentRecipe.steps.length} | Correct: {correctAnswers}
        </div>
        <div style={{ fontSize: 48, margin: '16px 0' }}>{currentRecipe.steps[currentStep].image}</div>
        <div style={{ fontSize: 18, marginBottom: 8 }}>{currentRecipe.steps[currentStep].completed}</div>
        <div style={{ color: '#374151', marginBottom: 16 }}>{currentRecipe.steps[currentStep].description}</div>
        <div style={{ fontWeight: 'bold', fontSize: 22, margin: '16px 0' }}>What comes next?</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          {currentRecipe.choices[currentStep] &&
            currentRecipe.choices[currentStep].map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoice(choice)}
                disabled={showFeedback}
                style={{
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: '1px solid #e5e7eb',
                  background: '#f1f5f9',
                  fontSize: 18,
                  cursor: showFeedback ? 'not-allowed' : 'pointer',
                  minWidth: 120
                }}
              >
                <span style={{ fontSize: 28 }}>{choice.emoji}</span> {choice.text}
              </button>
            ))}
        </div>
        {showFeedback && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: feedbackType === 'correct' ? '#bbf7d0' : '#fecaca',
              color: feedbackType === 'correct' ? '#166534' : '#b91c1c',
              fontWeight: 'bold'
            }}
          >
            {feedbackType === 'correct' ? 'Correct!' : 'Try again!'}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button
            onClick={resetGame}
            style={{
              background: '#6b7280',
              color: 'white',
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: 16,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <RotateCcw style={{ width: 20, height: 20, verticalAlign: 'middle' }} /> Change Recipe
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#3b82f6',
              color: 'white',
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: 16,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft style={{ width: 20, height: 20, verticalAlign: 'middle' }} /> Back
          </button>
          <button
            onClick={goToHomepage}
            style={{
              background: '#a21caf',
              color: 'white',
              padding: '8px 18px',
              borderRadius: 8,
              fontWeight: 'bold',
              fontSize: 16,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Home style={{ width: 20, height: 20, verticalAlign: 'middle' }} /> Home
          </button>
        </div>
      </div>
    </div>
  );
}