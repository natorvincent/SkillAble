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
  CardMedia,
  Dialog,
  Stack,
  LinearProgress,
  CircularProgress,
  Chip
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../Navbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import Loader from '../Loader';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
} from '../../services/progressService';

// hygiene items images
import toothpaste from "../../assets/hygieneLevel1/toothpaste.png"
import toothbrush from "../../assets/hygieneLevel1/toothbrush.png"
import soap from "../../assets/hygieneLevel1/soap.png"
import lotion from "../../assets/hygieneLevel1/lotion.png"
import shampoo from "../../assets/hygieneLevel1/shampoo.png"
import cottonbuds from "../../assets/hygieneLevel1/cottonbuds.png"
import nailcutter from "../../assets/hygieneLevel1/nailcutter.png"
import deodorant from "../../assets/hygieneLevel1/deodorant.png"
import comb from "../../assets/hygieneLevel1/comb.png"
import handsanitizer from "../../assets/hygieneLevel1/handsanitizer.png"
import mouthwash from "../../assets/hygieneLevel1/mouthwash.png"
import floss from "../../assets/hygieneLevel1/floss.png"
import tongueScraper from "../../assets/hygieneLevel1/tonguescraper.png"
import successGif from "../../assets/hygieneLevel1/roblox.gif"
import noobGif from "../../assets/hygieneLevel1/cat.jpg"
import bathroomBg from "../../assets/hygieneLevel1/bathroom.jpg"
import loofah from "../../assets/hygieneLevel1/loofah.png"
import licecomb from "../../assets/hygieneLevel1/headlicecomb.png"
import razor from "../../assets/hygieneLevel1/razor.png"
import conditioner from "../../assets/hygieneLevel1/conditioner.png"

// Body parts images
import teethImage from "../../assets/hygieneLevel1/teeth.jpg"
import hairImage from "../../assets/hygieneLevel1/hair.png"
import nailsImage from "../../assets/hygieneLevel1/nails.png"
import handsImage from "../../assets/hygieneLevel1/hands.png"
import earImage from "../../assets/hygieneLevel1/ear.png"
import bodyImage from "../../assets/hygieneLevel1/body.png"
import underarmImage from "../../assets/hygieneLevel1/underarm.png"
import tongueImage from "../../assets/hygieneLevel1/tongue.png"

// Audio files
import backgroundMusic from "../../assets/hygieneLevel1/background-music.mp3"
import correctSound from "../../assets/hygieneLevel1/correct-sound.mp3"
import incorrectSound from "../../assets/hygieneLevel1/incorrect-sound.mp3"
import successSound from "../../assets/hygieneLevel1/success-sound.mp3"


export default function PersonalHygieneLevel1() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [gameRounds, setGameRounds] = useState([]);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const [correctSoundRef, setCorrectSoundRef] = useState(null);
  const [incorrectSoundRef, setIncorrectSoundRef] = useState(null);
  const [successSoundRef, setSuccessSoundRef] = useState(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [triedIncorrectItems, setTriedIncorrectItems] = useState([]);
  const [difficulty, setDifficulty] = useState('easy');
  const [difficultyLoading, setDifficultyLoading] = useState(true);


  const handleStartGame = () => {
    setShowStartScreen(false);
  };

  const getActivityData = () => {
    const baseBodyParts = [
      { 
        id: 1, 
        name: "Teeth", 
        imageUrl: teethImage,
        hint: "What do you use to brush and clean these?",
        correctItems: {
          easy: [1, 2],
          intermediate: [1, 2, 15],
          difficult: [1,2,15, 16] 
        }
      },
      { 
        id: 2, 
        name: "Hair", 
        imageUrl: hairImage,
        hint: "What makes your hair clean and tidy?",
        correctItems: {
          easy: [5, 9, 11], 
          intermediate: [5, 9, 12, 11],
          difficult: [5, 9, 12, 11] 
        }
      },
      { 
        id: 3, 
        name: "Nails", 
        imageUrl: nailsImage,
        hint: "What keeps these short and neat?",
        correctItems: {
          easy: [7], 
          intermediate: [7],
        }
      },
      { 
        id: 4, 
        name: "Hands", 
        imageUrl: handsImage,
        hint: "What do you use to wash these?",
        correctItems: {
          easy: [3], 
          intermediate: [3, 8],
          difficult: [3, 8] 
        }
      },
      { 
        id: 5, 
        name: "Ears", 
        imageUrl: earImage,
        hint: "What gently cleans inside these?",
        correctItems: {
          easy: [6], 
        }
      },
      { 
        id: 6, 
        name: "Body", 
        imageUrl: bodyImage,
        hint: "What cleans our body?",
        correctItems: {
          easy: [3,4], 
          intermediate: [3,4,,13,14],
          difficult: [3,4,13,14] 
        }
      }
    ];

    if (difficulty === 'intermediate' || difficulty === 'difficult') {
      baseBodyParts.push({
        id: 7,
        name: "Underarm",
        imageUrl: underarmImage,  
        hint: "What keeps your face clean and fresh?",
        correctItems: {
          intermediate: [10],
          difficult: [10] 
        }
      });
    }

    if (difficulty === 'difficult') {
      baseBodyParts.push({
        id: 8,
        name: "Tongue",
        imageUrl: tongueImage, 
        hint: "What keeps these from smelling?",
        correctItems: {
          difficult: [17] 
        }
      });
    }

    const allItems = [
      // Easy level items (existing)
      { id: 1, name: "Toothbrush", imageUrl: toothbrush, hint: "I clean your teeth!", level: "easy" },
      { id: 2, name: "Toothpaste", imageUrl: toothpaste, hint: "I go on the toothbrush!", level: "easy" },
      { id: 3, name: "Soap", imageUrl: soap, hint: "I help you wash!", level: "easy" },
      { id: 4, name: "Body Lotion", imageUrl: lotion, hint: "I make skin soft!", level: "easy" },
      { id: 5, name: "Shampoo", imageUrl: shampoo, hint: "I wash your hair!", level: "easy" },
      { id: 6, name: "Cotton Buds", imageUrl: cottonbuds, hint: "I help clean your ears!", level: "easy" },
      { id: 7, name: "Nail Cutter", imageUrl: nailcutter, hint: "I keep nails short!", level: "easy" },
      { id: 8, name: "Hand Sanitizer", imageUrl: handsanitizer, hint: "I keep you smelling nice!", level: "easy" },
      { id: 9, name: "Comb", imageUrl: comb, hint: "I fix your hair!", level: "easy" },
      
      // Intermediate level items
      { id: 10, name: "Deodorant", imageUrl: deodorant, hint: "I clean your face gently!", level: "intermediate" }, 
      { id: 11, name: "Conditioner", imageUrl: conditioner, hint: "I make hair soft after shampoo!", level: "intermediate" }, 
      { id: 12, name: "Head Lice Comb", imageUrl: licecomb, hint: "I kill germs on hands!", level: "intermediate" }, 
      { id: 13, name: "Razor", imageUrl: razor, hint: "I protect and soften lips!", level: "intermediate" }, 
      { id: 14, name: "Loofah", imageUrl: loofah, hint: "I protect skin from sun!", level: "intermediate" },
      
      // Difficult level items
      { id: 15, name: "Mouthwash", imageUrl: mouthwash, hint: "I rinse and freshen mouth!", level: "difficult" }, 
      { id: 16, name: "Dental Floss", imageUrl: floss, hint: "I clean between teeth!", level: "difficult" }, 
      { id: 17, name: "Tongue Scraper", imageUrl: tongueScraper, hint: "I exfoliate dead skin!", level: "difficult" }, 
    ];

    return {
      instructions: `Drag the correct hygiene item to the body part!`,
      bodyParts: baseBodyParts.map(bodyPart => ({
        ...bodyPart,
        correctItems: bodyPart.correctItems[difficulty] || bodyPart.correctItems.easy
      })),
      items: allItems
    };
  };

  const getDifficultySettings = () => {
    switch (difficulty) {
      case 'easy':
        return {
          totalItems: 5,
          itemsPerRound: 3,
          totalRounds: 5,
          multipleCorrectAnswers: false
        };
      case 'intermediate':
        return {
          totalItems: 12,
          itemsPerRound: 4,
          totalRounds: 7,
          multipleCorrectAnswers: true
        };
      case 'difficult':
        return {
          totalItems: 17,
          itemsPerRound: 5,
          totalRounds: 10,
          multipleCorrectAnswers: true
        };
      default:
        return {
          totalItems: 5,
          itemsPerRound: 3,
          totalRounds: 5,
          multipleCorrectAnswers: false
        };
    }
  };

  const fetchAssignedDifficulty = async () => {
  try {
    const studentId = getStudentId();
    if (!studentId || !lessonId) {
      console.log('Missing studentId or lessonId for difficulty fetch');
      setDifficultyLoading(false);
      return;
    }

    const response = await fetch(`http://localhost:8080/api/difficulty/student-difficulty/${studentId}/${lessonId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      setDifficulty(data.difficulty || 'easy');
      console.log('Fetched assigned difficulty:', data.difficulty);
    } else {
      console.log('No assigned difficulty found, using default: easy');
      setDifficulty('easy');
    }
  } catch (error) {
    console.error('Error fetching assigned difficulty:', error);
    setDifficulty('easy'); // Default to easy on error
  } finally {
    setDifficultyLoading(false);
  }
};

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

  const playSoundEffect = (soundType) => {
    try {
      if (soundType === 'correct' && correctSoundRef) {
        correctSoundRef.currentTime = 0;
        correctSoundRef.play();
      } else if (soundType === 'incorrect' && incorrectSoundRef) {
        incorrectSoundRef.currentTime = 0;
        incorrectSoundRef.play();
      } else if (soundType === 'success' && successSoundRef) {
        successSoundRef.currentTime = 0;
        successSoundRef.play();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const generateGameRounds = () => {
    const activityData = getActivityData();
    const settings = getDifficultySettings();
    const rounds = [];
    
    const shuffledBodyParts = [...activityData.bodyParts].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < Math.min(settings.totalRounds, shuffledBodyParts.length); i++) {
      const bodyPart = shuffledBodyParts[i];
      
      const correctItemId = bodyPart.correctItems[Math.floor(Math.random() * bodyPart.correctItems.length)];
      const correctItem = activityData.items.find(item => item.id === correctItemId);
      
      // Filter items based on difficulty level
      const availableItems = activityData.items.filter(item => {
        if (difficulty === 'easy') return item.level === 'easy';
        if (difficulty === 'intermediate') return ['easy', 'intermediate'].includes(item.level);
        return true; // difficult includes all items
      });
      
      const incorrectItems = availableItems
        .filter(item => !bodyPart.correctItems.includes(item.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, settings.itemsPerRound - 1);
      
      const allItems = [correctItem, ...incorrectItems].sort(() => Math.random() - 0.5);
      
      rounds.push({
        id: i + 1,
        bodyPart,
        items: allItems,
        correctItemId,
        allCorrectItems: bodyPart.correctItems 
      });
    }
    
    return rounds;
  };

  const currentRound = gameRounds[currentRoundIndex];
  const progressPercentage = ((currentRoundIndex + (gameCompleted ? 1 : 0)) / gameRounds.length) * 100;

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
            // You can add a tip here if needed
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
      
      // Fetch assigned difficulty first
      await fetchAssignedDifficulty();
      
      setTimeout(() => {
        setLesson({
          id: lessonId || 1,
          title: "Personal Hygiene",
          description: "Learn about keeping clean and healthy!",
          level: 1
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  };
  
  fetchData();
}, [lessonId, moduleId]);

  // Generate game rounds when difficulty is loaded
useEffect(() => {
  if (!difficultyLoading && !showStartScreen && difficulty) {
    setGameRounds(generateGameRounds());
  }
}, [difficulty, difficultyLoading, showStartScreen]);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', item.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDropZoneActive(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropZoneActive(false);
    }
  };

  const handleDrop = (e) => {
  e.preventDefault();
  setDropZoneActive(false);
  
  if (!draggedItem || !currentRound) return;
  
  const settings = getDifficultySettings();
  let isCorrect;
  
  if (settings.multipleCorrectAnswers) {
    isCorrect = currentRound.allCorrectItems.includes(draggedItem.id);
  } else {
    isCorrect = draggedItem.id === currentRound.correctItemId;
  }
  
  if (isCorrect) {
    // Correct answer - proceed as normal
    const newAnswer = {
      roundId: currentRound.id,
      bodyPartId: currentRound.bodyPart.id,
      selectedItemId: draggedItem.id,
      correctItemId: currentRound.correctItemId,
      allCorrectItems: currentRound.allCorrectItems,
      isCorrect: true
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    // Calculate score based on all correct answers so far
    const allAnswers = [...answers, newAnswer];
    const correctCount = allAnswers.filter(answer => answer.isCorrect).length;
    setScore(correctCount);
    playSoundEffect('correct');

    const activityData = getActivityData();
    setFeedbackData({
      draggedItem,
      bodyPart: currentRound.bodyPart,
      correctItem: activityData.items.find(item => item.id === currentRound.correctItemId),
      allCorrectItems: currentRound.allCorrectItems.map(id => 
        activityData.items.find(item => item.id === id)
      ),
      isCorrect: true,
      multipleCorrectAnswers: settings.multipleCorrectAnswers
    });
    
    setShowFeedback(true);
    setTriedIncorrectItems([]); // Reset for next round
  } else {
    // Incorrect answer - just remove the item and let them try again
    playSoundEffect('incorrect');
    setTriedIncorrectItems(prev => [...prev, draggedItem.id]);
  }
  
  setDraggedItem(null);
};
  const handleNext = () => {
  setShowFeedback(false);
  setFeedbackData(null);
  setTriedIncorrectItems([]); // Reset for next round
  
  if (currentRoundIndex < gameRounds.length - 1) {
    setCurrentRoundIndex(prev => prev + 1);
  } else {
    setGameCompleted(true);
    if (audioRef) {
      audioRef.pause();
      setAudioPlaying(false);
    }
    setTimeout(() => {
      playSoundEffect('success');
      setShowSuccess(true);
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
        maxScore: gameRounds.length,
        completed: true,
        starsEarned: getStarRating(),
        difficulty: difficulty
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
  setCurrentRoundIndex(0);
  setAnswers([]);
  setShowFeedback(false);
  setFeedbackData(null);
  setShowSuccess(false);
  setScore(0);
  setGameCompleted(false);
  setProgressSaved(false);
  setProgressSaving(false);
  setTriedIncorrectItems([]); // Reset tried incorrect items
  setGameRounds(generateGameRounds());
  if (audioRef && !audioPlaying) {
    audioRef.play().then(() => {
      setAudioPlaying(true);
    }).catch(error => {
      console.log('Audio play failed:', error);
    });
  }
};

  const getStarRating = () => {
    const percentage = (score / gameRounds.length) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  const handleContinue = async () => {
    if (!progressSaved && !progressSaving) {
      await saveProgress();
    }
    
    if (audioRef) {
      audioRef.pause();
      setAudioPlaying(false);
    }
    
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleGoHome = () => {
    if (audioRef) {
      audioRef.pause();
      setAudioPlaying(false);
    }
    navigate('/homepage');
  };

  useEffect(() => {
    if (showSuccess) {
      const animateStars = async () => {
        setStarAnimationStage(0);
        const totalStars = getStarRating();
        
        for (let i = 0; i < totalStars; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          setStarAnimationStage(i + 1);
        }
      };
      
      const timer = setTimeout(animateStars, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, score, gameRounds.length]);

  useEffect(() => {
    const audio = new Audio(backgroundMusic);
    audio.loop = true;
    audio.volume = 0.3;
    setAudioRef(audio);

    // Initialize sound effects
    const correctAudio = new Audio(correctSound);
    const incorrectAudio = new Audio(incorrectSound);
    const successAudio = new Audio(successSound);
    
    correctAudio.volume = 0.7;
    incorrectAudio.volume = 0.7;
    successAudio.volume = 0.7;
    
    setCorrectSoundRef(correctAudio);
    setIncorrectSoundRef(incorrectAudio);
    setSuccessSoundRef(successAudio);

    const playAudio = () => {
      audio.play().then(() => {
        setAudioPlaying(true);
      }).catch(error => {
        console.log('Audio autoplay prevented:', error);
      });
    };

    const timer = setTimeout(playAudio, 1000);

    return () => {
      clearTimeout(timer);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const createConfetti = () => {
        const pieces = [];
        for (let i = 0; i < 150; i++) {
          pieces.push({
            id: i,
            x: Math.random() * 100,
            y: -10,
            rotation: Math.random() * 360,
            color: [
              '#FF0080', '#00FFFF', '#FF4500', '#9400D3', '#32CD32', '#FFD700', 
              '#FF1493', '#00FF7F', '#1E90FF', '#FF6347', '#ADFF2F', '#FF69B4', 
              '#00CED1', '#FFA500', '#DA70D6'
            ][Math.floor(Math.random() * 15)],
            size: Math.random() * 12 + 6,
            speed: Math.random() * 4 + 2,
            drift: (Math.random() - 0.5) * 3,
            width: Math.random() * 8 + 4,
            height: Math.random() * 12 + 6
          });
        }
        setConfettiPieces(pieces);
      };
      
      const timer = setTimeout(createConfetti, 500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Simple start screen - only shows title and play button
  if (showStartScreen) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bathroomBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(144, 190, 109, 0.8) 0%, rgba(25, 130, 196, 0.8) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 1
        }}>
          <Typography variant="h1" sx={{ 
            color: 'white', 
            fontWeight: 'bold', 
            mb: 2,
            fontFamily: 'Poppins, sans-serif',
            fontSize: { xs: '3rem', md: '5rem' },
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            🧼 Hygiene Match-Up 🧼
          </Typography>
          
          <Typography variant="h4" sx={{ 
            color: 'rgba(255, 255, 255, 0.95)', 
            mb: 6,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.5,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            maxWidth: '600px',
            px: 2
          }}>
            Match the right hygiene items with body parts to stay clean and healthy!
          </Typography>
          
          <Stack direction="row" spacing={3}>
            <Button 
              variant="contained"
              onClick={handleStartGame}
              sx={{ 
                background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                color: 'white',
                px: 8,
                py: 2,
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.5rem',
                textTransform: 'none',
                boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🎮</span>
              Let's Play!
            </Button>
          </Stack>
        </Box>
      </div>
    );
  }

  if (loading || difficultyLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bathroomBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column"
      }}>
        <Navbar />
        <div style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(2px)'
        }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bathroomBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
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
    );
  }

  const activityData = getActivityData();

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${bathroomBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 1 }}>
        <Box mb={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              px: 2,
              py: 1,
              borderRadius: '10px'
            }}>
              Round {currentRoundIndex + 1} of {gameRounds.length}
            </Typography>
            
            <Chip 
              label={`Score: ${score}/${gameRounds.length}`} 
              sx={{
                backgroundColor: '#FF595E',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '15px'
              }}
            />
          </Stack>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ 
                height: 8, 
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: '10px',
                  backgroundColor: '#90BE6D'
                }
              }} 
            />
          </Box>
        </Box>

        <Box sx={{ 
          position: 'fixed',
          top: 100,
          right: 20,
          zIndex: 1000
        }}>
          <Button
            onClick={() => {
              if (audioRef) {
                if (audioPlaying) {
                  audioRef.pause();
                  setAudioPlaying(false);
                } else {
                  audioRef.play().then(() => {
                    setAudioPlaying(true);
                  }).catch(error => {
                    console.log('Audio play failed:', error);
                  });
                }
              }
            }}
            sx={{
              minWidth: '60px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: audioPlaying 
                ? 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)'
                : 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              fontSize: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
              }
            }}
          >
            {audioPlaying ? '🔊' : '🔇'}
          </Button>
        </Box>

        <Box sx={{ 
          mb: 1,
          textAlign: 'center'
        }}>
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            backgroundColor: 'rgba(25, 130, 196, 0.8)',
            display: 'inline-block',
            px: 3,
            py: 1,
            borderRadius: '15px',
            fontSize: '1rem'
          }}>
            {activityData.instructions}
          </Typography>
        </Box>

        {!gameCompleted && currentRound && (
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 'calc(100vh - 200px)',
              width: '100%',
              pt: 1,
              mb: 0,
              pb: 0
            }}
          >
            {/* Top - Body part drop zone */}
            <Box display="flex" flexDirection="column" alignItems="center" sx={{ mb: 4 }}>
              <div
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  width: '400px',
                  height: '400px',
                  borderRadius: '20px',
                  background: dropZoneActive 
                    ? 'rgba(255, 255, 255, 0.3)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  padding: '2rem',
                  border: `4px dashed ${dropZoneActive ? '#FFCA3A' : '#90BE6D'}`,
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <CardMedia
                  component="img"
                  image={currentRound.bodyPart.imageUrl}
                  alt={currentRound.bodyPart.name}
                  sx={{ 
                    width: 400, 
                    height: 400, 
                    objectFit: 'contain',
                    mb: 2,
                    filter: 'drop-shadow(2px 2px 8px rgba(0,0,0,0.3))'
                  }}
                />
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold',
                  color: 'white',
                  mb: 1,
                  fontFamily: 'Poppins, sans-serif',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.7)'
                }}>
                  {currentRound.bodyPart.name}
                </Typography>
              </div>
            </Box>

            {/* Bottom - Hygiene items */}
            <Box sx={{ maxWidth: '1500px', width: '100%' }}>
              <Grid container spacing={3} justifyContent="center">
                {currentRound.items
                  .filter(item => !triedIncorrectItems.includes(item.id)) // Filter out tried incorrect items
                  .map((item, index) => (
                  <Grid item xs={6} sm={4} md={3} key={item.id}>
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      style={{
                        width: '100%',
                        minHeight: '200px',
                        position: 'relative',
                        padding: '0.5rem',
                        transition: 'all 0.3s ease',
                        cursor: 'grab',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.cursor = 'grabbing';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.cursor = 'grab';
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={item.imageUrl}
                        alt={item.name}
                        sx={{ 
                          width: '100%',
                          height: 200, 
                          objectFit: 'contain',
                          mb: 1
                        }}
                      />
                      <Typography variant="h6" sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontFamily: 'Poppins, sans-serif',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                        fontSize: '0.9rem'
                      }}>
                        {item.name}
                      </Typography>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 8, mb: 8 }}>
  <Button 
    variant="contained"
    onClick={resetGame}
    sx={{ 
      background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
      color: 'white',
      px: 6,
      py: 2,
      borderRadius: '25px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: '700',
      fontSize: '1.3rem',
      textTransform: 'none',
      boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
      '&:hover': {
        background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 30px rgba(255, 89, 94, 0.7)'
      }
    }}
  >
    <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🔄</span>
    Start Over
  </Button>
  
  <Button 
    variant="contained"
    onClick={handleGoHome}
    sx={{ 
      background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
      color: 'white',
      px: 6,
      py: 2,
      borderRadius: '25px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: '700',
      fontSize: '1.3rem',
      textTransform: 'none',
      boxShadow: '0 10px 25px rgba(25, 130, 196, 0.5)',
      '&:hover': {
        background: 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 30px rgba(25, 130, 196, 0.7)'
      }
    }}
  >
    <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🏠</span>
    Go Home
  </Button>
</Stack>
        
        {/* Feedback Dialog - Only for Correct Answers */}
<Dialog
  open={showFeedback}
  fullScreen
  PaperProps={{
    sx: { 
      background: 'linear-gradient(135deg, rgba(144, 190, 109, 0.95) 0%, rgba(123, 160, 91, 0.95) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }
  }}
>
  <Box sx={{
    textAlign: 'center',
    color: 'white'
  }}>
    <Box sx={{ mb: 4 }}>
      <img 
        src={successGif}
        alt="Success celebration"
        style={{
          width: '300px',
          height: '300px',
          objectFit: 'contain'
        }}
      />
    </Box>
    
    <Typography variant="h1" sx={{ 
      fontWeight: 'bold',
      color: 'white',
      fontFamily: 'Poppins, sans-serif',
      fontSize: { xs: '3rem', md: '5rem' },
      textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
      mb: 4
    }}>
      Perfect match!
    </Typography>
    
    <Typography variant="h3" sx={{ 
      color: 'white',
      fontFamily: 'Inter, sans-serif',
      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      mb: 6,
      maxWidth: '800px',
      lineHeight: 1.4
    }}>
      Yes! {feedbackData?.draggedItem?.name} is perfect for {feedbackData?.bodyPart?.name.toLowerCase()}!
    </Typography>
    
    <Button 
      onClick={handleNext} 
      variant="contained"
      sx={{ 
        background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
        color: 'white',
        px: 8,
        py: 3,
        borderRadius: '25px',
        fontSize: '1.8rem',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: '700',
        textTransform: 'none',
        boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
        '&:hover': {
          background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
          transform: 'translateY(-2px)',
          boxShadow: '0 15px 35px rgba(255, 89, 94, 0.7)'
        }
      }}
    >
      <span style={{ fontSize: '2rem', marginRight: '12px' }}>
        {currentRoundIndex < gameRounds.length - 1 ? '➡️' : '🏁'}
      </span>
      {currentRoundIndex < gameRounds.length - 1 ? 'Next Round' : 'Finish'}
    </Button>
  </Box>
</Dialog>

        {/* Success Dialog */}
        <Dialog
          open={showSuccess}
          fullScreen
          PaperProps={{
            sx: { 
              background: 'linear-gradient(135deg, rgba(255, 202, 58, 0.95) 0%, rgba(230, 184, 0, 0.95) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }
          }}
        >
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1000,
            overflow: 'hidden'
          }}>
            {confettiPieces.map(piece => (
              <Box
                key={piece.id}
                sx={{
                  position: 'absolute',
                  left: `${piece.x}%`,
                  top: `${piece.y}%`,
                  width: `${piece.width}px`,
                  height: `${piece.height}px`,
                  backgroundColor: piece.color,
                  transform: `rotate(${piece.rotation}deg)`,
                  boxShadow: `0 0 10px ${piece.color}`,
                  animation: `confettiFall 4s linear infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                  '@keyframes confettiFall': {
                    '0%': {
                      transform: `translateY(-100vh) rotate(${piece.rotation}deg) scale(0.8)`,
                      opacity: 1
                    },
                    '10%': {
                      opacity: 1,
                      transform: `translateY(-90vh) rotate(${piece.rotation + 36}deg) scale(1)`
                    },
                    '90%': {
                      opacity: 0.8,
                      transform: `translateY(90vh) translateX(${piece.drift * 60}px) rotate(${piece.rotation + 324}deg) scale(0.6)`
                    },
                    '100%': {
                      transform: `translateY(100vh) translateX(${piece.drift * 70}px) rotate(${piece.rotation + 360}deg) scale(0)`,
                      opacity: 0
                    }
                  }
                }}
              />
            ))}
          </Box>
          <Box sx={{
            textAlign: 'center',
            color: 'white'
          }}>
            <EmojiEventsIcon sx={{ 
              fontSize: 150,
              color: 'white',
              mb: 4
            }} />
            <Typography variant="h1" sx={{ 
              fontWeight: 'bold',
              color: 'white',
              fontFamily: 'Poppins, sans-serif',
              fontSize: { xs: '2rem', md: '3rem' },
              textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
              mb: 2
            }}>
              You did it!
            </Typography>
            
            <Chip 
              label={`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level Completed!`}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                fontFamily: 'Poppins, sans-serif',
                mb: 4,
                px: 3,
                py: 1
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              {[...Array(3)].map((_, i) => {
                const isActive = i < getStarRating();
                const shouldAnimate = i < starAnimationStage;
                
                return (
                  <StarIcon 
                    key={i} 
                    sx={{ 
                      color: isActive ? 'white' : 'rgba(255,255,255,0.3)',
                      fontSize: 80,
                      mx: 1,
                      textShadow: isActive ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none',
                      transform: shouldAnimate ? 'scale(1.3)' : 'scale(1)',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      animation: shouldAnimate ? 'starPop 0.6s ease-out' : 'none',
                      '@keyframes starPop': {
                        '0%': {
                          transform: 'scale(0)',
                          opacity: 0
                        },
                        '50%': {
                          transform: 'scale(1.5)',
                          opacity: 1
                        },
                        '100%': {
                          transform: 'scale(1)',
                          opacity: 1
                        }
                      }
                    }} 
                  />
                );
              })}
            </Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold',
              color: 'white',
              mb: 3,
              fontFamily: 'Poppins, sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Score: {score}/{gameRounds.length}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {difficulty === 'easy' && 'Great job learning the basics of hygiene! You matched everyday items with body parts.'}
              {difficulty === 'intermediate' && 'Excellent work! You handled both basic and specialized hygiene items like a pro.'}
              {difficulty === 'difficult' && 'Outstanding! You mastered advanced hygiene knowledge and multiple correct answers.'}
            </Typography>
            
            {progressSaving && (
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                backgroundColor: 'rgba(25, 130, 196, 0.8)', 
                borderRadius: '15px',
                color: 'white'
              }}>
                <CircularProgress size={30} sx={{ mr: 2, color: 'white' }} />
                <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', display: 'inline' }}>
                  Saving your progress...
                </Typography>
              </Box>
            )}
            
            {progressSaved && (
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                backgroundColor: 'rgba(144, 190, 109, 0.8)', 
                borderRadius: '15px',
                color: 'white'
              }}>
                <CheckCircleIcon sx={{ mr: 2, fontSize: 30, verticalAlign: 'middle' }} />
                <Typography variant="h6" sx={{ fontFamily: 'Poppins, sans-serif', display: 'inline' }}>
                  Progress saved successfully!
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>

              <Button 
                onClick={() => {
                  setShowSuccess(false);
                  resetGame();
                }} 
                variant="outlined"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '600',
                  fontSize: '1.2rem',
                  borderWidth: '2px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: '2px'
                  }
                }}
              >
                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>🔄</span>
                Play Again
              </Button>
              <Button 
                variant="contained"
                onClick={handleContinue}
                disabled={progressSaving}
                sx={{ 
                  background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                  '&:hover': { 
                    background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>✅</span>
                {progressSaving ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </Dialog>
      </Container>
    </div>
  );
}