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
  DialogTitle,
  DialogContent,
  DialogActions,
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
import FavoriteIcon from '@mui/icons-material/Favorite';
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';
import toothpaste from "../../assets/hygieneLevel1/toothpaste.png"
import toothbrush from "../../assets/hygieneLevel1/toothbrush.png"
import soap from "../../assets/hygieneLevel1/soap.png"
import lotion from "../../assets/hygieneLevel1/lotion.png"
import shampoo from "../../assets/hygieneLevel1/shampoo.png"
import cottonbuds from "../../assets/hygieneLevel1/cottonbuds.png"
import nailcutter from "../../assets/hygieneLevel1/nailcutter.png"
import deodorant from "../../assets/hygieneLevel1/deodorant.png"
import comb from "../../assets/hygieneLevel1/comb.png"
import successGif from "../../assets/hygieneLevel1/roblox.gif"
import bathroomBg from "../../assets/hygieneLevel1/bathroom.jpg"
// Body parts images
import teethImage from "../../assets/hygieneLevel1/teeth.jpg"
import hairImage from "../../assets/hygieneLevel1/hair.jpg"
import nailsImage from "../../assets/hygieneLevel1/nails.jpg"
import handsImage from "../../assets/hygieneLevel1/hands.png"
import earImage from "../../assets/hygieneLevel1/ear.jpg"

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

  const handleStartGame = () => {
  setShowStartScreen(false);
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

  const activityData = {
    instructions: "Drag the correct hygiene item to the body part!",
    bodyParts: [
      { 
        id: 1, 
        name: "Teeth", 
        imageUrl: teethImage,
        description: "Keep your teeth clean and healthy",
        correctItems: [1, 2] // toothbrush, toothpaste
      },
      { 
        id: 2, 
        name: "Hair", 
        imageUrl: hairImage,
        description: "Keep your hair clean and neat",
        correctItems: [5, 9] // shampoo, comb
      },
      { 
        id: 3, 
        name: "Nails", 
        imageUrl: nailsImage,
        description: "Keep your nails neat and clean",
        correctItems: [7]
      },
      { 
        id: 4, 
        name: "Hands", 
        imageUrl: handsImage,
        description: "Keep your hands clean",
        correctItems: [3] // soap
      },
      { 
        id: 5, 
        name: "Ear", 
        imageUrl: earImage,
        description: "Keep your ears clean",
        correctItems: [6] // lotion
      }
    ],
    items: [
      { id: 1, name: "Toothbrush", imageUrl: toothbrush, hint: "I clean your teeth!" },
      { id: 2, name: "Toothpaste", imageUrl: toothpaste, hint: "I go on the toothbrush!" },
      { id: 3, name: "Soap", imageUrl: soap, hint: "I help you wash!" },
      { id: 4, name: "Body Lotion", imageUrl: lotion, hint: "I make skin soft!" },
      { id: 5, name: "Shampoo", imageUrl: shampoo, hint: "I wash your hair!" },
      { id: 6, name: "Cotton Buds", imageUrl: cottonbuds, hint: "I help keep you clean your ears!" },
      { id: 7, name: "Nail Cutter", imageUrl: nailcutter, hint: "I help keep your nails clean and short!" },
      { id: 8, name: "Deodorant", imageUrl: deodorant, hint: "I keep you smelling nice!" },
      { id: 9, name: "Comb", imageUrl: comb, hint: "I fix your hair!" }
    ]
  };

const generateGameRounds = () => {
  const rounds = [];
  const totalRounds = Math.min(6, activityData.bodyParts.length); // Ensure we don't exceed available body parts
  
  const shuffledBodyParts = [...activityData.bodyParts].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < totalRounds; i++) {
    // Use the shuffled body parts in order (no repeats)
    const bodyPart = shuffledBodyParts[i];
    
    const correctItemId = bodyPart.correctItems[Math.floor(Math.random() * bodyPart.correctItems.length)];
    const correctItem = activityData.items.find(item => item.id === correctItemId);
    
    const incorrectItems = activityData.items
      .filter(item => !bodyPart.correctItems.includes(item.id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    const allItems = [correctItem, ...incorrectItems].sort(() => Math.random() - 0.5);
    
    rounds.push({
      id: i + 1,
      bodyPart,
      items: allItems,
      correctItemId
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
        setTimeout(() => {
          setLesson({
            id: lessonId || 1,
            title: "Personal Hygiene",
            description: "Learn about keeping clean and healthy!",
            level: 1
          });
          // Generate game rounds when component loads
          setGameRounds(generateGameRounds());
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
    
    const isCorrect = draggedItem.id === currentRound.correctItemId;
    const newAnswer = {
      roundId: currentRound.id,
      bodyPartId: currentRound.bodyPart.id,
      selectedItemId: draggedItem.id,
      correctItemId: currentRound.correctItemId,
      isCorrect
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    
    // Calculate score based on all correct answers so far
    const allAnswers = [...answers, newAnswer];
    const correctCount = allAnswers.filter(answer => answer.isCorrect).length;
    setScore(correctCount);
    playSoundEffect(isCorrect ? 'correct' : 'incorrect');

    setFeedbackData({
      draggedItem,
      bodyPart: currentRound.bodyPart,
      correctItem: activityData.items.find(item => item.id === currentRound.correctItemId),
      isCorrect
    });
    
    setShowFeedback(true);
    setDraggedItem(null);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setFeedbackData(null);
    
    if (currentRoundIndex < gameRounds.length - 1) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      setGameCompleted(true);
      setTimeout(() => {
        playSoundEffect('success');
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
        maxScore: gameRounds.length,
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
    setCurrentRoundIndex(0);
    setAnswers([]);
    setShowFeedback(false);
    setFeedbackData(null);
    setShowSuccess(false);
    setScore(0);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    setGameRounds(generateGameRounds()); // Generate new random rounds
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
    
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleGoHome = () => {
    navigate('/homepage');
  };

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
       <Button 
         variant="contained"
         onClick={handleStartGame}
         sx={{ 
           background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
           color: 'white',
           px: 10,
           py: 4,
           borderRadius: '30px',
           fontFamily: 'Poppins, sans-serif',
           fontWeight: '700',
           fontSize: '2rem',
           textTransform: 'none',
           boxShadow: '0 15px 30px rgba(255, 89, 94, 0.6)',
           border: '4px solid rgba(255, 255, 255, 0.3)',
           transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
           '&:hover': {
             transform: 'scale(1.1) translateY(-8px)',
             boxShadow: '0 20px 40px rgba(255, 89, 94, 0.8)',
             background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)'
           },
           '&:active': {
             transform: 'scale(1.05) translateY(-4px)'
           }
         }}
       >
         <span style={{ fontSize: '2.5rem', marginRight: '15px' }}>🎮</span>
         Let's Play!
       </Button>
     </Box>
   </div>
 );
}

  if (loading) {
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
        <Container sx={{ 
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{ 
            p: 6, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: 'none',
            borderRadius: '20px'
          }}>
            <Typography variant="h5" sx={{ color: '#280B60', textAlign: 'center', fontWeight: 'bold' }}>
              Getting ready...
            </Typography>
          </Paper>
        </Container>
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
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ maxWidth: '600px', mx: 'auto' }}>
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
          <Box sx={{ maxWidth: '600px', mx: 'auto' }}>
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
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: 'calc(100vh - 200px)',
              width: '100%',
              pt: 1,
              mb: 0,
              pb: 0
            }}
          >
            <Grid container spacing={8} alignItems="flex-start" sx={{
              maxHeight: '200px',
              maxWidth: '1200px',
              width: '100%'
            }}> 
              {/* Left side*/}
              <Grid item xs={12} md={6}>

                <Grid container spacing={3}>
                  {currentRound.items.map((item, index) => (
                    <Grid item xs={12} sm={4} key={item.id}>
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        style={{
                          width: '100%',
                          minHeight: '250px',
                          borderRadius: '15px',
                          position: 'relative',
                          padding: '1rem',
                          transition: 'all 0.3s ease',
                          cursor: 'grab',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          marginTop: "50px"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          //e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
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
                            width: 200, 
                            height: 200, 
                            objectFit: 'contain',
                            mb: 2
                          }}
                        />
                        <Typography variant="h6" sx={{ 
                          color: '#280B60', 
                          fontWeight: 'bold',
                          mb: 1,
                          fontFamily: 'Poppins, sans-serif'
                        }}>
                          {item.name}
                        </Typography>
                        
                      </div>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Right side - Three hygiene items */}
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" alignItems="center">

                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      width: '300px',
                      height: '350px',
                      borderRadius: '20px',
                      background: dropZoneActive 
                        ? 'rgba(255, 255, 255, 0.3)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      padding: '2rem',
                      border: `4px solid ${dropZoneActive ? '#FFCA3A' : '#90BE6D'}`,
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
                        width: 300, 
                        height: 300, 
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
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontFamily: 'Inter, sans-serif',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      textAlign: 'center'
                    }}>
                      {currentRound.bodyPart.description}
                    </Typography>
                    
                    {!dropZoneActive && (
                      <Box sx={{ 
                        position: 'absolute',
                        bottom: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        
                      </Box>
                    )}
                  </div>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 0 }}>
  <Button 
    variant="contained"
    onClick={resetGame}
    sx={{ 
      background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
      color: 'white',
      px: 5,
      py: 1.5,
      borderRadius: '25px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: '600',
      fontSize: '1rem',
      textTransform: 'none',
      boxShadow: '0 8px 20px rgba(255, 89, 94, 0.4)',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        transition: 'left 0.5s'
      },
      '&:hover': {
        transform: 'scale(1.05) translateY(-3px)',
        boxShadow: '0 12px 30px rgba(255, 89, 94, 0.6)',
        background: 'linear-gradient(135deg, #FF7B7E 0%, #E04549 100%)',
        '&:before': {
          left: '100%'
        }
      },
      '&:active': {
        transform: 'scale(0.98) translateY(1px)',
        boxShadow: '0 4px 15px rgba(255, 89, 94, 0.3)'
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
      px: 5,
      py: 1.5,
      borderRadius: '25px',
      fontFamily: 'Poppins, sans-serif',
      fontWeight: '600',
      fontSize: '1rem',
      textTransform: 'none',
      boxShadow: '0 8px 20px rgba(25, 130, 196, 0.4)',
      border: '3px solid rgba(255, 255, 255, 0.3)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        transition: 'left 0.5s'
      },
      '&:hover': {
        transform: 'scale(1.05) translateY(-3px)',
        boxShadow: '0 12px 30px rgba(25, 130, 196, 0.6)',
        background: 'linear-gradient(135deg, #3A9BD4 0%, #1568A0 100%)',
        '&:before': {
          left: '100%'
        }
      },
      '&:active': {
        transform: 'scale(0.98) translateY(1px)',
        boxShadow: '0 4px 15px rgba(25, 130, 196, 0.8)'
      }
    }}
  >
    <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🏠</span>
    Go Home
  </Button>
</Stack>
        
        <Dialog
 open={showFeedback}
 fullScreen
 PaperProps={{
   sx: { 
     background: feedbackData?.isCorrect 
       ? 'linear-gradient(135deg, rgba(144, 190, 109, 0.95) 0%, rgba(123, 160, 91, 0.95) 100%)'
       : 'linear-gradient(135deg, rgba(255, 89, 94, 0.95) 0%, rgba(224, 69, 73, 0.95) 100%)',
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
   {feedbackData?.isCorrect ? (
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
   ) : (
     <CheckCircleIcon sx={{ 
       fontSize: 150,
       color: 'white',
       mb: 4
     }} />
   )}
   <Typography variant="h1" sx={{ 
     fontWeight: 'bold',
     color: 'white',
     fontFamily: 'Poppins, sans-serif',
     fontSize: { xs: '3rem', md: '5rem' },
     textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
     mb: 4
   }}>
     {feedbackData?.isCorrect ? 'Perfect match!' : 'Good try!'}
   </Typography>
   <Typography variant="h3" sx={{ 
     color: 'white',
     fontFamily: 'Inter, sans-serif',
     textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
     mb: 6,
     maxWidth: '800px',
     lineHeight: 1.4
   }}>
     {feedbackData?.isCorrect 
       ? `Yes! ${feedbackData.draggedItem?.name} is perfect for ${feedbackData.bodyPart?.name.toLowerCase()}!`
       : `${feedbackData?.draggedItem?.name} doesn't match ${feedbackData?.bodyPart?.name.toLowerCase()}. The correct answer is ${feedbackData?.correctItem?.name}.`
     }
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
       border: '3px solid rgba(255, 255, 255, 0.3)',
       transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
       '&:hover': {
         transform: 'scale(1.05) translateY(-5px)',
         boxShadow: '0 15px 35px rgba(255, 89, 94, 0.7)',
         background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)'
       },
       '&:active': {
         transform: 'scale(1.02) translateY(-2px)'
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
   <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
     {[...Array(getStarRating())].map((_, i) => (
       <StarIcon key={i} sx={{ 
         color: 'white', 
         fontSize: 80,
         mx: 1,
         textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
       }} />
     ))}
     {[...Array(3 - getStarRating())].map((_, i) => (
       <StarIcon key={i} sx={{ 
         color: 'rgba(255,255,255,0.3)', 
         fontSize: 80,
         mx: 1
       }} />
     ))}
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
     You learned about staying clean and healthy! Great job matching hygiene items with body parts.
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
   
   <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
     <Button 
       onClick={() => {
         setShowSuccess(false);
         resetGame();
       }} 
       variant="outlined"
       sx={{ 
         borderColor: 'white',
         color: 'white',
         px: 6,
         py: 3,
         borderRadius: '25px',
         fontFamily: 'Poppins, sans-serif',
         fontWeight: '700',
         fontSize: '1.5rem',
         borderWidth: '3px',
         textTransform: 'none',
         '&:hover': {
           borderColor: 'white',
           backgroundColor: 'rgba(255, 255, 255, 0.1)',
           borderWidth: '3px',
           transform: 'scale(1.05)'
         }
       }}
     >
       <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>🔄</span>
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
         py: 3,
         borderRadius: '25px',
         fontFamily: 'Poppins, sans-serif',
         fontWeight: '700',
         fontSize: '1.5rem',
         textTransform: 'none',
         boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
         '&:hover': { 
           background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
           transform: 'scale(1.05)'
         }
       }}
     >
       <span style={{ fontSize: '1.8rem', marginRight: '8px' }}>✅</span>
       {progressSaving ? 'Saving...' : 'Continue'}
     </Button>
   </Box>
 </Box>
</Dialog>
      </Container>
    </div>
  );
}