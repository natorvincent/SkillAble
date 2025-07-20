import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Button, 
  Card, 
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import Background from '../Background';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress
} from '../../services/progressService';

export default function PersonalHygieneLevel3() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [showTip, setShowTip] = useState('');

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

  const scenarios = [
    {
      id: 1,
      category: "After Physical Activity",
      scenario: "You just finished playing soccer outside in the dirt",
      image: "🏃⚽",
      question: "What should you do FIRST?",
      options: [
        { text: "Go eat lunch immediately", feedback: "Not safe! Your hands are dirty from playing outside." },
        { text: "Wash your hands and face with soap", feedback: "Perfect! Always clean up after playing outside.", correct: true },
        { text: "Just wipe hands on your clothes", feedback: "Not enough! Clothes won't remove all the germs." },
        { text: "Only use hand sanitizer", feedback: "Good start, but soap and water work better when hands are visibly dirty." }
      ],
      explanation: "After playing outside, always wash with soap and water to remove dirt and germs.",
      difficulty: "Easy"
    },
    {
      id: 2,
      category: "Before Meals",
      scenario: "You're about to eat dinner with your family",
      image: "🍽️👨‍👩‍👧‍👦",
      question: "What should you do before sitting down?",
      options: [
        { text: "Sit down right away", feedback: "Wait! You need to clean your hands first." },
        { text: "Wash your hands with soap and water", feedback: "Excellent! Clean hands prevent getting sick from food.", correct: true },
        { text: "Just rinse hands with water only", feedback: "Close, but soap is needed to kill germs properly." },
        { text: "Wipe hands with a dry napkin", feedback: "Not enough! Napkins don't remove germs." }
      ],
      explanation: "Always wash hands before eating to avoid getting germs in your mouth.",
      difficulty: "Easy"
    },
    {
      id: 3,
      category: "Bathroom Hygiene",
      scenario: "You just used the toilet at school",
      image: "🚽🏫",
      question: "What should you do before leaving the bathroom?",
      options: [
        { text: "Leave immediately", feedback: "No! This spreads germs to everything you touch." },
        { text: "Just rinse hands quickly", feedback: "Not enough! You need soap to kill germs." },
        { text: "Wash hands with soap for 20 seconds", feedback: "Perfect! This kills germs and keeps everyone healthy.", correct: true },
        { text: "Use hand sanitizer only", feedback: "Soap and water work better in bathrooms." }
      ],
      explanation: "Always wash hands with soap after using the toilet - it's the most important hygiene rule!",
      difficulty: "Easy"
    },
    {
      id: 4,
      category: "When Sick",
      scenario: "Your friend just sneezed and coughed near you without covering their mouth",
      image: "🤧😷",
      question: "What should you do?",
      options: [
        { text: "Continue playing normally", feedback: "Risky! Germs can make you sick too." },
        { text: "Move away and wash your hands", feedback: "Smart choice! This protects you from getting sick.", correct: true },
        { text: "Cover your own mouth only", feedback: "Good thinking, but you should also clean your hands." },
        { text: "Tell them to go home", feedback: "That's not very kind. Better to protect yourself instead." }
      ],
      explanation: "When someone coughs or sneezes near you, move away and wash your hands to avoid catching their germs.",
      difficulty: "Medium"
    },
    {
      id: 5,
      category: "Social Settings",
      scenario: "You're about to shake hands with your teacher",
      image: "👋👩‍🏫",
      question: "What should you check first?",
      options: [
        { text: "If your hands are clean", feedback: "Excellent! Clean hands show respect and prevent spreading germs.", correct: true },
        { text: "If the teacher wants to shake hands", feedback: "Thoughtful, but clean hands should always come first." },
        { text: "Nothing, just shake hands", feedback: "Wait! Make sure your hands are clean first." },
        { text: "If other students are watching", feedback: "Don't worry about others - focus on good hygiene!" }
      ],
      explanation: "Before any physical contact like handshakes, make sure your hands are clean.",
      difficulty: "Medium"
    },
    {
      id: 6,
      category: "After Meals",
      scenario: "You just finished eating a messy sandwich",
      image: "🥪😋",
      question: "What's the COMPLETE routine you should follow?",
      options: [
        { text: "Just wipe mouth with napkin", feedback: "Good start, but you're not finished yet!" },
        { text: "Wash hands only", feedback: "Good, but don't forget your face!" },
        { text: "Wipe mouth, wash hands, brush teeth if possible", feedback: "Perfect! This complete routine keeps you clean and fresh.", correct: true },
        { text: "Do nothing if it wasn't that messy", feedback: "Even small messes need cleaning up!" }
      ],
      explanation: "After eating, always clean your mouth and hands. Brush teeth when possible!",
      difficulty: "Medium"
    },
    {
      id: 7,
      category: "Pet Interaction",
      scenario: "You just finished petting and playing with your neighbor's dog",
      image: "🐕🤗",
      question: "What should you do before doing anything else?",
      options: [
        { text: "Pet more dogs", feedback: "Fun, but clean up first!" },
        { text: "Wash your hands thoroughly", feedback: "Absolutely right! Pets can carry germs even when they're clean.", correct: true },
        { text: "Just wipe hands on pants", feedback: "Not enough! Animal germs need soap and water." },
        { text: "Wait until you get home", feedback: "Don't wait! Clean your hands as soon as possible." }
      ],
      explanation: "Always wash hands after touching animals - they can carry germs that make people sick.",
      difficulty: "Medium"
    },
    {
      id: 8,
      category: "Public Places",
      scenario: "You're at the grocery store and touched shopping carts, door handles, and products",
      image: "🛒🏪",
      question: "Before eating a snack, what should you do?",
      options: [
        { text: "Eat the snack right away", feedback: "Dangerous! Public places have lots of germs." },
        { text: "Wipe hands on your clothes", feedback: "Not effective against public place germs." },
        { text: "Use hand sanitizer or wash hands", feedback: "Excellent! Public places are full of germs from many people.", correct: true },
        { text: "Just blow on your hands", feedback: "That doesn't remove any germs!" }
      ],
      explanation: "Public places have germs from many people. Always clean hands before eating or touching your face.",
      difficulty: "Hard"
    },
    {
      id: 9,
      category: "Medical Situations",
      scenario: "You have a small cut on your finger that stopped bleeding",
      image: "🩹🤕",
      question: "What's the proper hygiene routine?",
      options: [
        { text: "Just leave it alone", feedback: "Cuts need protection to prevent infection!" },
        { text: "Clean it with water, apply bandage, wash hands", feedback: "Perfect! This prevents infection and keeps germs away.", correct: true },
        { text: "Put a bandage on without cleaning", feedback: "Clean the cut first to prevent infection!" },
        { text: "Ask someone else to fix it", feedback: "You can handle small cuts yourself with proper hygiene!" }
      ],
      explanation: "Always clean cuts, cover them, and wash your hands to prevent infection.",
      difficulty: "Hard"
    },
    {
      id: 10,
      category: "Cooking Preparation",
      scenario: "You want to help make cookies in the kitchen",
      image: "🍪👩‍🍳",
      question: "What should you do BEFORE touching any ingredients?",
      options: [
        { text: "Put on an apron only", feedback: "Aprons protect clothes, but your hands need cleaning too!" },
        { text: "Wash hands, tie back hair, remove jewelry", feedback: "Outstanding! You know all the kitchen hygiene rules!", correct: true },
        { text: "Just wash hands", feedback: "Good start! But don't forget about hair and jewelry." },
        { text: "Start cooking immediately", feedback: "Stop! Kitchen hygiene is very important for food safety." }
      ],
      explanation: "Kitchen hygiene prevents food poisoning. Clean hands, tied hair, and no jewelry are essential!",
      difficulty: "Hard"
    }
  ];

  const currentScenario = scenarios[currentScenarioIndex];
  const progressPercentage = ((currentScenarioIndex + (gameCompleted ? 1 : 0)) / scenarios.length) * 100;

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
        }
      } catch (error) {
        console.log('Error fetching progress, starting fresh:', error);
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
            id: lessonId || 3,
            title: "Personal Hygiene Level 3",
            description: "Real-life hygiene scenarios and decision-making!",
            level: 3
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

  // Timer effect
  useEffect(() => {
    if (gameStarted && !showResult && !gameCompleted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
  }, [timeLeft, gameStarted, showResult, gameCompleted]);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(30);
  };

  const handleTimeUp = () => {
    const newAnswer = {
      scenarioIndex: currentScenarioIndex,
      selectedAnswer: null,
      isCorrect: false,
      timeUp: true
    };
    setAnswers(prev => [...prev, newAnswer]);
    setShowResult(true);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (showResult || gameCompleted) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = currentScenario.options[answerIndex].correct || false;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
    }

    const newAnswer = {
      scenarioIndex: currentScenarioIndex,
      selectedAnswer: answerIndex,
      isCorrect: isCorrect,
      timeUp: false
    };
    setAnswers(prev => [...prev, newAnswer]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentScenarioIndex < scenarios.length - 1) {
      setCurrentScenarioIndex(prev => prev + 1);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setGameCompleted(true);
      setTimeout(() => {
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
        maxScore: scenarios.length,
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
    setCurrentScenarioIndex(0);
    setTimeLeft(30);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameStarted(false);
    setGameCompleted(false);
    setAnswers([]);
    setProgressSaved(false);
    setProgressSaving(false);
  };

  const getStarRating = () => {
    const percentage = (score / scenarios.length) * 100;
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

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return { backgroundColor: '#C8E6C9', color: '#2E7D32' };
      case 'Medium': return { backgroundColor: '#FFF3E0', color: '#F57C00' };
      case 'Hard': return { backgroundColor: '#FFCDD2', color: '#C62828' };
      default: return { backgroundColor: '#E0E0E0', color: '#424242' };
    }
  };

  if (loading) {
    return (
      <div style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
      }}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}>
          <Background />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar />
          <Container sx={{ py: 8, textAlign: 'center' }}>
            <Paper sx={{ 
              p: 6, 
              borderRadius: '20px', 
              backgroundColor: '#FFFAF4',
              border: '2px solid #FFCA3A',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)'
            }}>
              <CircularProgress size={50} sx={{ color: '#FF595E' }} />
              <Typography variant="h5" sx={{ 
                mt: 3, 
                color: '#280B60', 
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif'
              }}>
                Getting ready...
              </Typography>
            </Paper>
          </Container>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
      }}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}>
          <Background />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar />
          <Container sx={{ py: 8, textAlign: 'center' }}>
            <Paper sx={{ 
              p: 6, 
              borderRadius: '20px', 
              backgroundColor: '#FFFAF4',
              border: '2px solid #FF595E'
            }}>
              <Typography variant="h5" sx={{ 
                color: '#280B60', 
                fontWeight: 'bold', 
                mb: 3,
                fontFamily: 'Poppins, sans-serif'
              }}>
                Oops! Something went wrong.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/homepage')}
                sx={{ 
                  backgroundColor: '#FF595E',
                  fontSize: '1.2rem',
                  px: 4,
                  py: 2,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  '&:hover': { backgroundColor: '#E04549' }
                }}
              >
                Go Home
              </Button>
            </Paper>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      minHeight: "100vh",
      width: "100%",
    }}>
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
      }}>
        <Background />
    </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ 
            p: 4, 
            borderRadius: '20px', 
            backgroundColor: '#FFFAF4',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.1)',
            border: '2px solid #FFCA3A'
          }}>
            
            <Box textAlign="center" mb={4}>
              <div style={{
                display: "inline-block",
                backgroundColor: "#540D6E",
                borderRadius: "40px",
                padding: "10px 30px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                marginBottom: "20px",
              }}>
                <Typography variant="h3" sx={{ 
                  color: 'white', 
                  fontWeight: '700',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '2.5rem',
                  margin: 0
                }}>
                  Personal Hygiene Level 3
                </Typography>
              </div>
              <Typography variant="h6" sx={{ 
                color: '#280B60',
                mb: 3,
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.2rem'
              }}>
                Real-life hygiene scenarios and decision-making!
              </Typography>
              
              {showTip && (
                <Paper sx={{ 
                  p: 3, 
                  mb: 3, 
                  backgroundColor: '#FFCA3A',
                  borderRadius: '20px',
                  border: '2px solid #280B60'
                }}>
                  <Typography variant="body1" sx={{ 
                    color: '#280B60', 
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {showTip}
                  </Typography>
                </Paper>
              )}
            </Box>

            {!gameStarted ? (
              <Box textAlign="center">
                <Paper sx={{ 
                  p: 4, 
                  mb: 4,
                  backgroundColor: '#1982C4',
                  borderRadius: '20px',
                  border: '2px solid #280B60'
                }}>
                  <Typography variant="h5" sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    mb: 3,
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    Real-Life Hygiene Scenarios
                  </Typography>
                  <Stack spacing={2} sx={{ color: 'white' }}>
                    <Typography variant="body1" sx={{ fontFamily: 'Inter, sans-serif' }}>
                      🎭 {scenarios.length} Real-life situations
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Inter, sans-serif' }}>
                      ⏰ 30 seconds per scenario
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Inter, sans-serif' }}>
                      🎯 Choose the best hygiene action
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Inter, sans-serif' }}>
                      🧠 Learn when to use what you know!
                    </Typography>
                  </Stack>
                </Paper>
                
                <Button 
                  variant="contained"
                  onClick={startGame}
                  sx={{ 
                    backgroundColor: '#4CAF50',
                    px: 6,
                    py: 3,
                    borderRadius: '20px',
                    fontSize: '1.5rem',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: '600',
                    '&:hover': { backgroundColor: '#45A049' }
                  }}
                >
                  Start Scenarios! 🚀
                </Button>
              </Box>
            ) : !gameCompleted ? (
              <>
                <Box mb={4}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{ 
                      color: '#280B60', 
                      fontWeight: 'bold',
                      fontFamily: 'Poppins, sans-serif'
                    }}>
                      Scenario {currentScenarioIndex + 1} of {scenarios.length}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Chip 
                        label={currentScenario.difficulty}
                        sx={{
                          ...getDifficultyColor(currentScenario.difficulty),
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      />
                      <Chip 
                        label={`Score: ${score} points`} 
                        sx={{
                          backgroundColor: '#FF595E',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      />
                    </Stack>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={progressPercentage} 
                    sx={{ 
                      height: 12, 
                      borderRadius: '20px',
                      backgroundColor: '#E8E8E8',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '20px',
                        backgroundColor: '#90BE6D'
                      }
                    }} 
                  />
                </Box>

                <Paper sx={{ 
                  p: 3, 
                  mb: 4,
                  backgroundColor: '#E3F2FD',
                  borderRadius: '20px',
                  border: '2px solid #1976D2'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip 
                      label={`📍 ${currentScenario.category}`}
                      sx={{
                        backgroundColor: '#9C27B0',
                        color: 'white',
                        fontWeight: 'bold',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    />
                    <Chip 
                      label={`⏰ ${timeLeft} seconds`}
                      sx={{
                        backgroundColor: timeLeft > 10 ? '#4CAF50' : timeLeft > 5 ? '#FF9800' : '#F44336',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    />
                  </Stack>
                </Paper>

                <Paper sx={{ 
                  p: 4, 
                  mb: 4,
                  background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
                  borderRadius: '20px',
                  border: '2px solid #1976D2',
                  textAlign: 'center'
                }}>
                  <Typography variant="h2" sx={{ mb: 3 }}>
                    {currentScenario.image}
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: '#1565C0', 
                    fontWeight: 'bold',
                    mb: 2,
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {currentScenario.scenario}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: '#7B1FA2',
                    fontWeight: 'bold',
                    fontFamily: 'Poppins, sans-serif'
                  }}>
                    {currentScenario.question}
                  </Typography>
                </Paper>

              <Grid container spacing={3} mb={4}>
                  {currentScenario.options.map((option, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Button
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        sx={{
                          width: '100%',
                          minHeight: '100px',
                          p: 3,
                          borderRadius: '20px',
                          textAlign: 'left',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          fontFamily: 'Poppins, sans-serif',
                          border: '3px solid',
                          transition: 'all 0.3s ease',
                          ...(showResult
                            ? selectedAnswer === index
                              ? option.correct
                                ? { 
                                    backgroundColor: '#4CAF50', 
                                    color: 'white', 
                                    borderColor: '#388E3C' 
                                  }
                                : { 
                                    backgroundColor: '#F44336', 
                                    color: 'white', 
                                    borderColor: '#D32F2F' 
                                  }
                              : option.correct
                                ? { 
                                    backgroundColor: '#4CAF50', 
                                    color: 'white', 
                                    borderColor: '#388E3C' 
                                  }
                                : { 
                                    backgroundColor: '#E0E0E0', 
                                    color: '#757575', 
                                    borderColor: '#BDBDBD' 
                                  }
                            : { 
                                backgroundColor: '#E3F2FD', 
                                color: '#1565C0', 
                                borderColor: '#1976D2',
                                '&:hover': {
                                  backgroundColor: '#BBDEFB',
                                  borderColor: '#1565C0',
                                  transform: 'scale(1.02)'
                                }
                              })
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                          <Typography variant="h5" sx={{ mr: 2, fontWeight: 'bold' }}>
                            {String.fromCharCode(65 + index)}.
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 'bold',
                            textAlign: 'left'
                          }}>
                            {option.text}
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                {showResult && (
                  <Paper sx={{ 
                    p: 4, 
                    mb: 4,
                    backgroundColor: answers[currentScenarioIndex]?.timeUp 
                      ? '#FFF3E0' 
                      : answers[currentScenarioIndex]?.isCorrect 
                        ? '#E8F5E8' 
                        : '#FFEBEE',
                    borderRadius: '20px',
                    border: '3px solid',
                    borderColor: answers[currentScenarioIndex]?.timeUp 
                      ? '#FF9800' 
                      : answers[currentScenarioIndex]?.isCorrect 
                        ? '#4CAF50' 
                        : '#F44336'
                  }}>
                    <Box textAlign="center" mb={3}>
                      <Chip 
                        icon={answers[currentScenarioIndex]?.timeUp 
                          ? <AccessTimeIcon /> 
                          : answers[currentScenarioIndex]?.isCorrect 
                            ? <CheckCircleIcon /> 
                            : <InfoIcon />}
                        label={answers[currentScenarioIndex]?.timeUp 
                          ? "⏰ Time's up!" 
                          : answers[currentScenarioIndex]?.isCorrect 
                            ? "✅ Excellent choice! +10 points" 
                            : "❌ Not quite right, but good try!"}
                        sx={{
                          backgroundColor: answers[currentScenarioIndex]?.timeUp 
                            ? '#FF9800' 
                            : answers[currentScenarioIndex]?.isCorrect 
                              ? '#4CAF50' 
                              : '#F44336',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          p: 3,
                          fontFamily: 'Poppins, sans-serif'
                        }}
                      />
                    </Box>

                    <Alert 
                      severity={answers[currentScenarioIndex]?.isCorrect ? "success" : "warning"}
                      sx={{ 
                        mb: 3,
                        borderRadius: '15px',
                        fontSize: '1rem',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {selectedAnswer !== null ? currentScenario.options[selectedAnswer]?.feedback : "Time ran out!"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>💡 Remember:</strong> {currentScenario.explanation}
                      </Typography>
                    </Alert>
                    
                    <Box textAlign="center">
                      <Button 
                        onClick={handleNext}
                        variant="contained"
                        sx={{ 
                          backgroundColor: '#1565C0',
                          px: 6,
                          py: 2,
                          borderRadius: '20px',
                          fontSize: '1.3rem',
                          fontFamily: 'Poppins, sans-serif',
                          fontWeight: '600',
                          '&:hover': { backgroundColor: '#0D47A1' }
                        }}
                      >
                        {currentScenarioIndex < scenarios.length - 1 ? 'Next Scenario →' : 'See Final Results 🏆'}
                      </Button>
                    </Box>
                  </Paper>
                )}
              </>
            ) : (
              <Box textAlign="center">
                <EmojiEventsIcon sx={{ fontSize: 100, color: '#FFCA3A', mb: 2 }} />
                
                <div style={{
                  display: "inline-block",
                  backgroundColor: "#540D6E",
                  borderRadius: "40px",
                  padding: "10px 25px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                  marginBottom: "20px",
                }}>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 'bold',
                    color: 'white',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '2rem',
                    margin: 0
                  }}>
                    Level 3 Complete!
                  </Typography>
                </div>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  {[...Array(getStarRating())].map((_, i) => (
                    <StarIcon key={i} sx={{ 
                      color: '#FFCA3A', 
                      fontSize: 50,
                      mx: 0.5
                    }} />
                  ))}
                  {[...Array(3 - getStarRating())].map((_, i) => (
                    <StarIcon key={i} sx={{ 
                      color: '#E0E0E0', 
                      fontSize: 50,
                      mx: 0.5
                    }} />
                  ))}
                </Box>

                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '15px', backgroundColor: '#E3F2FD' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565C0', mb: 1 }}>
                        Final Score
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0D47A1' }}>
                        {score} / {scenarios.length * 10}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1565C0' }}>
                        {Math.round((score / (scenarios.length * 10)) * 100)}% correct
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '15px', backgroundColor: '#E8F5E8' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 1 }}>
                        Scenarios Mastered
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1B5E20' }}>
                        {answers.filter(a => a.isCorrect).length} / {scenarios.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2E7D32' }}>
                        situations handled correctly
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: '15px', backgroundColor: '#F3E5F5' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7B1FA2', mb: 1 }}>
                        Achievement
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4A148C' }}>
                        🎓 Real-World
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4A148C' }}>
                        Hygiene Master!
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ 
                  color: '#280B60',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: 1.6,
                  mb: 4
                }}>
                  Excellent work! You've mastered real-world hygiene decision-making and can now apply your knowledge to keep yourself and others healthy in any situation!
                </Typography>

                {progressSaving && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 3, 
                    backgroundColor: '#1982C4', 
                    borderRadius: '15px',
                    color: 'white',
                    mb: 3
                  }}>
                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      Saving your progress...
                    </Typography>
                  </Box>
                )}
                
                {progressSaved && (
                  <Box sx={{ 
                    mt: 3, 
                    p: 3, 
                    backgroundColor: '#90BE6D', 
                    borderRadius: '15px',
                    color: 'white',
                    mb: 3
                  }}>
                    <CheckCircleIcon sx={{ mr: 1, fontSize: 24 }} />
                    <Typography variant="body2" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                      Progress saved successfully!
                    </Typography>
                  </Box>
                )}

                <Stack direction="row" spacing={3} justifyContent="center">
                  <Button 
                    onClick={resetGame}
                    variant="outlined"
                    sx={{ 
                      borderColor: '#FFCA3A',
                      color: '#280B60',
                      px: 4,
                      py: 2,
                      borderRadius: '20px',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      borderWidth: '2px',
                      '&:hover': {
                        borderColor: '#E6B800',
                        backgroundColor: 'rgba(255, 202, 58, 0.1)',
                        borderWidth: '2px'
                      }
                    }}
                  >
                    Practice Again 🔄
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={handleContinue}
                    disabled={progressSaving}
                    sx={{ 
                      backgroundColor: '#FF595E',
                      px: 5,
                      py: 2,
                      borderRadius: '20px',
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      '&:hover': { backgroundColor: '#E04549' }
                    }}
                  >
                    {progressSaving ? 'Saving...' : 'Continue'}
                  </Button>
                </Stack>
              </Box>
            )}

            <Stack direction="row" spacing={3} justifyContent="center" mt={4}>
              <Button 
                variant="outlined"
                onClick={resetGame}
                sx={{ 
                  borderColor: '#FF595E',
                  color: '#FF595E',
                  px: 4,
                  py: 2,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#E04549',
                    backgroundColor: 'rgba(255, 89, 94, 0.1)',
                    borderWidth: '2px'
                  }
                }}
              >
                Start Over
              </Button>
              <Button 
                variant="outlined"
                onClick={handleGoHome}
                sx={{ 
                  borderColor: '#1982C4',
                  color: '#1982C4',
                  px: 4,
                  py: 2,
                  borderRadius: '20px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#1568A0',
                    backgroundColor: 'rgba(25, 130, 196, 0.1)',
                    borderWidth: '2px'
                  }
                }}
              >
                Go Home
              </Button>
            </Stack>
          </Paper>
        </Container>
        </div>
    </div>
  );
}