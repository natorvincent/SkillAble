import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

export default function CookingIngredientsLevel1() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneActive, setDropZoneActive] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');
  const [shuffledItems, setShuffledItems] = useState([]);

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

  // Function to shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const activityData = {
    instructions: "Match the ingredient pictures to their names!",
    categories: [
      { 
        id: 1, 
        name: "EGG", 
        color: "#FFF3E0", 
        description: "White or brown, for cooking",
        emoji: "🥚",
        ingredient: "egg"
      },
      { 
        id: 2, 
        name: "RICE", 
        color: "#F3E5F5", 
        description: "Small white grains",
        emoji: "🍚",
        ingredient: "rice"
      },
      { 
        id: 3, 
        name: "TOMATO", 
        color: "#FFEBEE", 
        description: "Red and round",
        emoji: "🍅",
        ingredient: "tomato"
      },
      { 
        id: 4, 
        name: "MILK", 
        color: "#E8F5E8", 
        description: "White drink",
        emoji: "🥛",
        ingredient: "milk"
      },
      { 
        id: 5, 
        name: "CARROT", 
        color: "#FFF8E1", 
        description: "Orange and long",
        emoji: "🥕",
        ingredient: "carrot"
      },
      { 
        id: 6, 
        name: "SUGAR", 
        color: "#F1F8E9", 
        description: "Sweet white crystals",
        emoji: "🧂",
        ingredient: "sugar"
      }
    ],
    items: [
      { id: 1, name: "Egg", category: 1, emoji: "🥚", hint: "I'm used for breakfast!" },
      { id: 2, name: "Rice", category: 2, emoji: "🍚", hint: "I'm a grain that's cooked!" },
      { id: 3, name: "Tomato", category: 3, emoji: "🍅", hint: "I'm red and round!" },
      { id: 4, name: "Milk", category: 4, emoji: "🥛", hint: "I come from cows!" },
      { id: 5, name: "Carrot", category: 5, emoji: "🥕", hint: "I'm orange and crunchy!" },
      { id: 6, name: "Sugar", category: 6, emoji: "🧂", hint: "I make things sweet!" }
    ]
  };

  // Initialize shuffled items when component mounts
  useEffect(() => {
    const shuffled = shuffleArray(activityData.items);
    setShuffledItems(shuffled);
  }, []);

  const currentItem = shuffledItems[currentItemIndex];
  const progressPercentage = ((currentItemIndex + (gameCompleted ? 1 : 0)) / shuffledItems.length) * 100;

  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const studentId = getStudentId();
        if (!studentId || !lessonId) {
          console.log('Missing studentId or lessonId:', { studentId, lessonId });
          return;
        }
        
        console.log('Fetching progress for student:', studentId, 'lesson:', lessonId);
        const progressResponse = await getStudentLessonProgress(studentId, lessonId);
        if (progressResponse) {
          setScore(progressResponse.score || 0);
          if (progressResponse.completed) {
            setShowTip("Great job! You finished this before. Want to try again?");
          }
          console.log('Loaded existing progress:', progressResponse);
        } else {
          console.log('No existing progress found - starting fresh');
          setShowTip('Drag each ingredient picture to its matching name!');
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
        setShowTip('Drag each ingredient picture to its matching name!');
      }
    };
    
    fetchUserProgress();
  }, [lessonId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setLesson({
            id: lessonId || 1,
            title: "Cooking Ingredients",
            description: "Learn about basic cooking ingredients!",
            level: 1
          });
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Something went wrong');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, categoryId) => {
    e.preventDefault();
    setDropZoneActive(categoryId);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropZoneActive(null);
    }
  };

  // Update the score state to reflect current game score
  const handleDrop = (e, category) => {
    e.preventDefault();
    setDropZoneActive(null);
    
    if (!draggedItem || draggedItem.id !== currentItem.id) return;
    
    const isCorrect = currentItem.category === category.id;
    const newAnswer = {
      itemId: currentItem.id,
      selectedCategory: category.id,
      correctCategory: currentItem.category,
      isCorrect
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    // Calculate score based on all correct answers so far
    const allAnswers = [...answers, newAnswer];
    const correctCount = allAnswers.filter(answer => answer.isCorrect).length;
    setScore(correctCount);

    setFeedbackData({
      item: currentItem,
      category: category,
      isCorrect: isCorrect
    });
    
    setShowFeedback(true);
    setDraggedItem(null);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFeedbackData(null);
    
    if (currentItemIndex < shuffledItems.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      setGameCompleted(true);
      setTimeout(() => {
        setShowSuccess(true);
        saveProgress();
      }, 300);
    }
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
      
      const finalScore = answers.filter(answer => answer.isCorrect).length;
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        score: finalScore,
        maxScore: shuffledItems.length,
        completed: true,
        starsEarned: getStarRating()
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

  const resetGame = () => {
    setCurrentItemIndex(0);
    setAnswers([]);
    setShowFeedback(false);
    setFeedbackData(null);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    // Shuffle items again for a new random sequence
    const newShuffled = shuffleArray(activityData.items);
    setShuffledItems(newShuffled);
  };

  const getStarRating = () => {
    const percentage = (score / shuffledItems.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const handleContinue = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

  const getCategoryItems = (categoryId) => {
    return answers
      .filter(answer => answer.selectedCategory === categoryId)
      .map(answer => shuffledItems.find(item => item.id === answer.itemId))
      .filter(Boolean);
  };

  const styles = {
    container: {
      position: "relative",
      overflow: "hidden",
      minHeight: "100vh",
      width: "100%",
    },
    backgroundFixed: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      background: 'linear-gradient(135deg, #FFE5B4, #FFCCCB, #E0E0E0)'
    },
    contentWrapper: {
      position: "relative",
      zIndex: 1
    },
    mainPaper: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      borderRadius: '20px',
      backgroundColor: '#FFFAF4',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
      border: '2px solid #FFCA3A',
      marginTop: '20px',
      marginBottom: '20px'
    },
    titleContainer: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    titleBox: {
      display: 'inline-block',
      backgroundColor: '#FF6B35',
      borderRadius: '40px',
      padding: '10px 30px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    },
    titleText: {
      color: 'white',
      fontWeight: '700',
      fontSize: '2.5rem',
      margin: 0,
      fontFamily: 'Poppins, sans-serif'
    },
    subtitle: {
      color: '#280B60',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      marginBottom: '15px',
      fontFamily: 'Inter, sans-serif'
    },
    tipBox: {
      padding: '15px',
      marginBottom: '15px',
      backgroundColor: '#FFCA3A',
      borderRadius: '20px',
      border: '2px solid #280B60'
    },
    progressContainer: {
      marginBottom: '20px'
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    progressText: {
      color: '#280B60',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      fontFamily: 'Poppins, sans-serif'
    },
    scoreChip: {
      backgroundColor: '#FF595E',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1rem',
      borderRadius: '20px',
      padding: '8px 16px',
      fontFamily: 'Poppins, sans-serif'
    },
    progressBar: {
      width: '100%',
      height: '12px',
      borderRadius: '20px',
      backgroundColor: '#E8E8E8',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#90BE6D',
      borderRadius: '20px',
      transition: 'width 0.3s ease',
      width: `${progressPercentage}%`
    },
    instructionsBox: {
      padding: '15px',
      marginBottom: '20px',
      backgroundColor: '#1982C4',
      borderRadius: '20px',
      border: '2px solid #280B60',
      textAlign: 'center'
    },
    instructionsText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.2rem',
      margin: 0,
      fontFamily: 'Poppins, sans-serif'
    },
    sectionTitle: {
      color: '#FF595E',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: '1.5rem',
      marginBottom: '20px',
      fontFamily: 'Poppins, sans-serif'
    },
    dragItemContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '25px'
    },
    dragItem: {
      width: '220px',
      height: '280px',
      borderRadius: '20px',
      background: '#FFFAF4',
      padding: '20px',
      border: '4px solid #FFCA3A',
      transition: 'all 0.3s ease',
      cursor: 'grab',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dragItemEmoji: {
      fontSize: '5rem',
      marginBottom: '10px',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
    },
    dragItemName: {
      color: '#280B60',
      fontWeight: 'bold',
      fontSize: '1.5rem',
      marginBottom: '8px',
      fontFamily: 'Poppins, sans-serif'
    },
    dragItemHint: {
      color: '#280B60',
      fontStyle: 'italic',
      fontSize: '1rem',
      fontFamily: 'Inter, sans-serif'
    },
    categoriesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
      gap: '12px',
      marginBottom: '25px'
    },
    categoryCard: {
      minHeight: '320px',
      borderRadius: '20px',
      padding: '15px',
      transition: 'all 0.3s ease',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    categoryEmoji: {
      fontSize: '2.5rem',
      marginBottom: '10px'
    },
    categoryName: {
      fontWeight: 'bold',
      color: '#280B60',
      fontSize: '1.5rem',
      marginBottom: '8px',
      fontFamily: 'Poppins, sans-serif'
    },
    categoryDescription: {
      color: '#280B60',
      fontSize: '0.9rem',
      marginBottom: '15px',
      fontFamily: 'Inter, sans-serif'
    },
    dropZone: {
      minHeight: '140px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px dashed #ccc',
      borderRadius: '15px',
      backgroundColor: 'rgba(255, 255, 255, 0.3)'
    },
    droppedItem: {
      padding: '10px',
      marginBottom: '8px',
      textAlign: 'center',
      backgroundColor: '#FFFAF4',
      border: '2px solid',
      borderRadius: '15px',
      position: 'relative'
    },
    controlsContainer: {
      display: 'flex',
      justifyContent: 'center',
      gap: '20px',
      marginTop: '20px'
    },
    button: {
      padding: '10px 20px',
      borderRadius: '20px',
      fontSize: '1.1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
      fontFamily: 'Poppins, sans-serif'
    },
    resetButton: {
      backgroundColor: 'transparent',
      border: '2px solid #FF595E',
      color: '#FF595E'
    },
    homeButton: {
      backgroundColor: '#1982C4',
      color: 'white',
      border: '2px solid #1982C4'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: '#FFFAF4',
      borderRadius: '20px',
      padding: '25px',
      textAlign: 'center',
      maxWidth: '450px',
      width: '90%'
    },
    modalIcon: {
      fontSize: '80px',
      marginBottom: '15px'
    },
    modalTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#280B60',
      marginBottom: '15px',
      fontFamily: 'Poppins, sans-serif'
    },
    modalText: {
      fontSize: '1.3rem',
      color: '#280B60',
      marginBottom: '20px',
      lineHeight: 1.4,
      fontFamily: 'Inter, sans-serif'
    },
    modalButton: {
      backgroundColor: '#FF595E',
      color: 'white',
      padding: '10px 25px',
      borderRadius: '20px',
      fontSize: '1.2rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'Poppins, sans-serif'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh'
    },
    loadingSpinner: {
      width: '50px',
      height: '50px',
      border: '4px solid #E8E8E8',
      borderTop: '4px solid #FF595E',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  // Don't render if shuffledItems is not ready
  if (shuffledItems.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundFixed}></div>
        <div style={styles.contentWrapper}>
          <div style={styles.mainPaper}>
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <h3 style={{ 
                marginTop: '20px', 
                color: '#280B60', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Shuffling ingredients...
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundFixed}></div>
        <div style={styles.contentWrapper}>
          <div style={styles.mainPaper}>
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner}></div>
              <h3 style={{ 
                marginTop: '20px', 
                color: '#280B60', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Getting ready...
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.backgroundFixed}></div>
        <div style={styles.contentWrapper}>
          <div style={styles.mainPaper}>
            <div style={styles.loadingContainer}>
              <h2 style={{ 
                color: '#280B60', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Oops! Something went wrong.
              </h2>
              <button 
                onClick={() => navigate('/homepage')}
                style={{
                  ...styles.button,
                  backgroundColor: '#FF595E',
                  color: 'white',
                  fontSize: '1.2rem',
                  padding: '15px 30px'
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.backgroundFixed}></div>
      <div style={styles.contentWrapper}>
        <div style={styles.mainPaper}>
          
          <div style={styles.titleContainer}>
            <div style={styles.titleBox}>
              <h1 style={styles.titleText}>
                Cooking Ingredients
              </h1>
            </div>
            <h2 style={styles.subtitle}>
              Learn about basic cooking ingredients!
            </h2>
            
            {showTip && (
              <div style={styles.tipBox}>
                <h3 style={{ 
                  color: '#280B60', 
                  fontWeight: 'bold', 
                  margin: 0,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {showTip}
                </h3>
              </div>
            )}
          </div>

          <div style={styles.progressContainer}>
            <div style={styles.progressHeader}>
              <span style={styles.progressText}>
                Item {currentItemIndex + 1} of {shuffledItems.length}
              </span>
              <div style={styles.scoreChip}>
                Score: {score}/{shuffledItems.length}
              </div>
            </div>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
          </div>

          <div style={styles.instructionsBox}>
            <h2 style={styles.instructionsText}>
              {activityData.instructions}
            </h2>
          </div>

          {!gameCompleted && (
            <div>
              <h2 style={styles.sectionTitle}>
                Drag this item:
              </h2>
              
              <div style={styles.dragItemContainer}>
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, currentItem)}
                  style={styles.dragItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = '#FFFAF4';
                  }}
                >
                  <div style={styles.dragItemEmoji}>
                    {currentItem?.emoji}
                  </div>
                  <div style={styles.dragItemName}>
                    {currentItem?.name}
                  </div>
                  <div style={styles.dragItemHint}>
                    {currentItem?.hint}
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2 style={styles.sectionTitle}>
            Drop it here:
          </h2>

          <div style={styles.categoriesGrid}>
            {activityData.categories.map(category => (
              <div
                key={category.id}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, category.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, category)}
                style={{
                  ...styles.categoryCard,
                  background: dropZoneActive === category.id ? 'rgba(255, 255, 255, 0.95)' : '#FFFAF4',
                  border: `4px solid ${dropZoneActive === category.id ? '#FFCA3A' : category.color}`
                }}
                onMouseEnter={(e) => {
                  if (dropZoneActive !== category.id) {
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (dropZoneActive !== category.id) {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                <div style={styles.categoryEmoji}>
                  {category.emoji}
                </div>
                <div style={styles.categoryName}>
                  {category.name}
                </div>
                <div style={styles.categoryDescription}>
                  {category.description}
                </div>

                <div style={{ minHeight: '140px', width: '100%' }}>
                  {getCategoryItems(category.id).length === 0 ? (
                    <div style={styles.dropZone}>
                      <div style={{ fontSize: '40px', color: '#ccc', marginBottom: '8px' }}>
                        🍽️
                      </div>
                      <div style={{ color: '#999', fontFamily: 'Inter, sans-serif' }}>
                        Drop here
                      </div>
                    </div>
                  ) : (
                    getCategoryItems(category.id).map(item => {
                      const answer = answers.find(a => a.itemId === item.id);
                      return (
                        <div
                          key={item.id}
                          style={{
                            ...styles.droppedItem,
                            borderColor: answer?.isCorrect ? '#90BE6D' : '#FF595E'
                          }}
                        >
                          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                            {item.emoji}
                          </div>
                          <div style={{ 
                            fontWeight: 'bold',
                            color: '#280B60',
                            fontSize: '1rem',
                            fontFamily: 'Poppins, sans-serif'
                          }}>
                            {item.name}
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            color: answer?.isCorrect ? '#90BE6D' : '#FF595E',
                            backgroundColor: '#FFFAF4',
                            borderRadius: '50%',
                            fontSize: '24px',
                            border: '2px solid #FFFAF4',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            ✓
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={styles.controlsContainer}>
            <button 
              style={{...styles.button, ...styles.resetButton}}
              onClick={resetGame}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 89, 94, 0.1)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Start Over
            </button>
            <button 
              style={{...styles.button, ...styles.homeButton}}
              onClick={handleGoHome}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1568A0';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1982C4';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Go Home
            </button>
          </div>
        </div>
        
        {showFeedback && (
          <div style={styles.modal} onClick={() => setShowFeedback(false)}>
            <div style={{
              ...styles.modalContent,
              border: `4px solid ${feedbackData?.isCorrect ? '#90BE6D' : '#FFCA3A'}`
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                ...styles.modalIcon,
                color: feedbackData?.isCorrect ? '#90BE6D' : '#FFCA3A'
              }}>
                ✓
              </div>
              <h2 style={styles.modalTitle}>
                {feedbackData?.isCorrect ? 'Great job!' : 'Good try!'}
              </h2>
              <p style={styles.modalText}>
                {feedbackData?.isCorrect 
                  ? `${feedbackData.item?.name} goes in ${feedbackData.category?.name}!`
                  : `${feedbackData?.item?.name} goes in ${activityData.categories.find(cat => cat.id === feedbackData?.item?.category)?.name}.`
                }
              </p>
              <button 
                onClick={handleNext} 
                style={styles.modalButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E04549';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF595E';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {currentItemIndex < shuffledItems.length - 1 ? 'Next Item' : 'Finish'}
              </button>
            </div>
          </div>
        )}
        
        {showSuccess && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={{...styles.modalIcon, color: '#FFCA3A'}}>
                🏆
              </div>
              <div style={{
                display: 'inline-block',
                backgroundColor: '#540D6E',
                borderRadius: '40px',
                padding: '10px 25px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px'
              }}>
                <h1 style={{
                  fontWeight: 'bold',
                  color: 'white',
                  fontSize: '2rem',
                  margin: 0,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  You did it!
                </h1>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                {[...Array(getStarRating())].map((_, i) => (
                  <span key={i} style={{ 
                    color: '#FFCA3A', 
                    fontSize: '50px',
                    margin: '0 5px'
                  }}>
                    ⭐
                  </span>
                ))}
                {[...Array(3 - getStarRating())].map((_, i) => (
                  <span key={i} style={{ 
                    color: '#E0E0E0', 
                    fontSize: '50px',
                    margin: '0 5px'
                  }}>
                    ⭐
                  </span>
                ))}
              </div>
              <h2 style={{
                fontWeight: 'bold',
                color: '#FF595E',
                fontSize: '2rem',
                marginBottom: '15px',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Score: {score}/{shuffledItems.length}
              </h2>
              <p style={{
                color: '#280B60',
                fontSize: '1.3rem',
                lineHeight: 1.6,
                marginBottom: '25px',
                fontFamily: 'Inter, sans-serif'
              }}>
                You learned about cooking ingredients! Great job completing this lesson.
              </p>
              
              {progressSaving && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#1982C4', 
                  borderRadius: '15px',
                  color: 'white'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    display: 'inline-block',
                    marginRight: '10px'
                  }}></div>
                  <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Saving your progress...
                  </span>
                </div>
              )}
              
              {progressSaved && (
                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: '#90BE6D', 
                  borderRadius: '15px',
                  color: 'white'
                }}>
                  <span style={{ marginRight: '10px', fontSize: '24px' }}>✓</span>
                  <span style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Progress saved successfully!
                  </span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    resetGame();
                  }} 
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px solid #FFCA3A',
                    color: '#280B60',
                    padding: '12px 25px',
                    borderRadius: '20px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 202, 58, 0.1)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Play Again
                </button>
                <button 
                  onClick={handleContinue}
                  disabled={progressSaving}
                  style={{
                    backgroundColor: '#FF595E',
                    color: 'white',
                    padding: '12px 30px',
                    borderRadius: '20px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: progressSaving ? 'not-allowed' : 'pointer',
                    opacity: progressSaving ? 0.7 : 1,
                    fontFamily: 'Poppins, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (!progressSaving) {
                      e.currentTarget.style.backgroundColor = '#E04549';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!progressSaving) {
                      e.currentTarget.style.backgroundColor = '#FF595E';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {progressSaving ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}