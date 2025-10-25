import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Button, 
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

// Images
import successGif from "../../assets/hygienelevel1/roblox.gif"
import bathroomBg from "../../assets/hygienelevel1/bg.png"
import sinkImg from "../../assets/hygienelevel1/sink.png"
import faucetImg from "../../assets/hygienelevel1/onfaucet.png"
import leftHandImg from "../../assets/hygienelevel1/lefthand.png"
import rightHandImg from "../../assets/hygienelevel1/righthand.png"
import germsImg from "../../assets/hygienelevel1/germ.png"
import mudImg from "../../assets/hygienelevel1/mud.png"
import soapImg from "../../assets/hygienelevel1/soap.png"
import wetHandsImg from "../../assets/hygienelevel1/wash.gif"

// Audio files
import backgroundMusic from "../../assets/hygienelevel1/background-music.mp3"
import correctSound from "../../assets/hygienelevel1/correct-sound.mp3"
import incorrectSound from "../../assets/hygienelevel1/incorrect-sound.mp3"
import successSound from "../../assets/hygienelevel1/success-sound.mp3"

// Video files
import scrubVideo from "../../assets/hygienelevel1/scrub1.mp4"
import scrubVideo2 from "../../assets/hygienelevel1/scrub2.mp4"
import scrubVideo3 from "../../assets/hygienelevel1/scrub3.mp4"
import scrubVideo4 from "../../assets/hygienelevel1/scrub4.mp4"
import scrubVideo5 from "../../assets/hygienelevel1/scrub5.mp4"
import scrubVideo6 from "../../assets/hygienelevel1/scrub6.mp4"
import scrubVideo7 from "../../assets/hygienelevel1/scrub7.mp4"

export default function PersonalHygieneLevel1() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRef, setAudioRef] = useState(null);
  const [correctSoundRef, setCorrectSoundRef] = useState(null);
  const [incorrectSoundRef, setIncorrectSoundRef] = useState(null);
  const [successSoundRef, setSuccessSoundRef] = useState(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [starAnimationStage, setStarAnimationStage] = useState(0);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Add state to track when to hide all images
  const [hideAllImages, setHideAllImages] = useState(false);

  // Game states for brushing sequence (start at faucet step)
  const [gameStep, setGameStep] = useState(1); // 1: turn on faucet, 2: wet hands, 3: apply soap, 4: rub hands, 5: rinse hands
  const [faucetOn, setFaucetOn] = useState(false); // Track if faucet has been turned on
  const [step2Completed, setStep2Completed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null); // 'left' | 'right' | 'toothbrush' | null
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 }); // client coords while dragging
  const [teethBubbles, setTeethBubbles] = useState([]); // Bubbles that stay on teeth
  
  // Scratch card effect states
  const [scratchMarks, setScratchMarks] = useState([]);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const teethContainerRef = useRef(null);
  const [teethCoverage, setTeethCoverage] = useState(new Set()); // Track grid cells that have been brushed
  
  // New states for step 4
  const [showScrubVideo, setShowScrubVideo] = useState(false);
  const [isHandHovered, setIsHandHovered] = useState(false);
  const [handsRubbed, setHandsRubbed] = useState(false);
  const [currentScrubVideoIndex, setCurrentScrubVideoIndex] = useState(0);

  // New states for step 5
  const [step5Completed, setStep5Completed] = useState(false);
  
  // Create array of all scrub videos
  const scrubVideos = [scrubVideo, scrubVideo2, scrubVideo3, scrubVideo4, scrubVideo5, scrubVideo6, scrubVideo7];
  
  const initializeGerms = () => ([ // keep this for reset
    { id: 'germ1', x: 30, y: 50, image: germsImg, size: 50, removed: false },
    { id: 'germ2', x: 65, y: 58, image: germsImg, size: 60, removed: false },
    { id: 'germ3', x: 70, y: 78, image: germsImg, size: 50, removed: false },
    { id: 'germ4', x: 20, y: 75, image: germsImg, size: 80, removed: false },
    { id: 'germ5', x: 80, y: 65, image: germsImg, size: 50, removed: false }
  ]);
  
  // state to hold the germ blobs so you can render/update them
  const [germBlobs, setGermBlobs] = useState(initializeGerms());
  const [soapPlaced, setSoapPlaced] = useState(false);
  const [leftHandWet, setLeftHandWet] = useState(false);
  const [rightHandWet, setRightHandWet] = useState(false);
  const [showWetHands, setShowWetHands] = useState(false);

  // Helper to check if drop position (relative percent inside container) is over faucet area
   const isOverFaucetArea = (relX, relY) => {
    return relX >= 45 && relX <= 100 && relY >= 0 && relY <= 45;
  };

  // Helper to check if click position is in soap area (upper right of faucet)
  const isInSoapArea = (relX, relY) => {
    return relX >= 65 && relX <= 98 && relY >= 3 && relY <= 30;
  };

  const handleStartGame = () => {
    setShowStartScreen(false);
  };

  const handleTurnOnFaucet = () => {
    // Turn on faucet visual
    setFaucetOn(true);
    // Wait a moment, then advance to brushing step
    setTimeout(() => {
      setGameStep(2);
      playSoundEffect('correct');
    }, 500);
  };

  // New function to handle soap application
  const handleApplySoap = (e) => {
    if (gameStep !== 3) return;
    
    const teethContainer = teethContainerRef.current;
    if (teethContainer) {
      const containerRect = teethContainer.getBoundingClientRect();
      const relativeX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const relativeY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

      if (isInSoapArea(relativeX, relativeY)) {
        // Place soap on right hand directly
        setSoapPlaced(true);
        playSoundEffect('correct');
        
        // Advance to step 4 after a short delay
        setTimeout(() => {
          setGameStep(4);
        }, 1000);
      }
    }
  };

  // New function to handle hand rubbing in step 4
  const handleHandRub = () => {
    if (gameStep !== 4 || handsRubbed) return;
  
    setShowScrubVideo(true);
    playSoundEffect('correct');
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

  // Game mechanics
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    if (isDragging && draggedItem === 'hands-group') {
      // detect drop over faucet area relative to container
      const teethContainer = teethContainerRef.current;
      if (teethContainer) {
        const containerRect = teethContainer.getBoundingClientRect();
        const relativeX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const relativeY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

        if (isOverFaucetArea(relativeX, relativeY)) {
          if (gameStep === 2) {
            // Step 2: Wet hands
            setLeftHandWet(true);
            setRightHandWet(true);

            // Hide all images and show wet hands popup for ~2s, give feedback, then advance to soap step
            setHideAllImages(true);
            setShowWetHands(true);
            playSoundEffect('correct');
            setTimeout(() => {
              setShowWetHands(false);
              setHideAllImages(false); // Bring images back
              setGameStep(3); // move to Apply Soap step
            }, 2000);
          } else if (gameStep === 5) {
            // Step 5: Rinse clean hands - show success
            setHideAllImages(true);
            setShowWetHands(true);
            playSoundEffect('correct');
            setTimeout(() => {
              setShowWetHands(false);
              setHideAllImages(false);
              setStep5Completed(true);
              
              // Show success after a short delay
              setTimeout(() => {
                setShowSuccess(true);
                playSoundEffect('success');
                setGameCompleted(true);
              }, 1000);
            }, 2000);
          }
        }
      }
    }

    // existing per-item drop logic (keep for backward compatibility)
    if (isDragging && (draggedItem === 'left' || draggedItem === 'right')) {
      // detect drop over faucet area relative to container
      const teethContainer = teethContainerRef.current;
      if (teethContainer) {
        const containerRect = teethContainer.getBoundingClientRect();
        const relativeX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const relativeY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

        if (isOverFaucetArea(relativeX, relativeY)) {
          if (draggedItem === 'left') setLeftHandWet(true);
          if (draggedItem === 'right') setRightHandWet(true);
        }
      }

      setTimeout(() => {
        if (leftHandWet || rightHandWet) {
          const nowLeft = (draggedItem === 'left') ? true : leftHandWet;
          const nowRight = (draggedItem === 'right') ? true : rightHandWet;
          if (nowLeft && nowRight) {
            setHideAllImages(true);
            setShowWetHands(true);
            playSoundEffect('correct');
            setTimeout(() => {
              setShowWetHands(false);
              setHideAllImages(false); // Bring images back
              setGameStep(3); // move to Apply Soap step
            }, 2000);
          }
        }
      }, 50);
    }

    setIsDragging(false);
    setDraggedItem(null);
    // Restore germs if hands-group drag ends and still in step 2
    if (draggedItem === 'hands-group' && gameStep === 2) {
      setGermBlobs(initializeGerms());
    }
  };

  // New: start dragging the grouped hands (fix missing handler)
  const startDragHandsGroup = (e) => {
    if (gameStep !== 2 && gameStep !== 5) return; // only draggable during step 2 and 5
    // support mouse and touch events
    const clientX = e.clientX ?? (e.touches && e.touches[0] && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0] && e.touches[0].clientY);
    if (clientX == null || clientY == null) return;
    e.preventDefault && e.preventDefault();
    setIsDragging(true);
    setDraggedItem('hands-group');
    setDragPos({ x: clientX, y: clientY });
    // Keep germs visible - they'll move with the hands
  };

  // Clean up old scratch marks to prevent memory issues - but only when not actively playing
  useEffect(() => {
    const cleanup = setInterval(() => {
      // Only clean up if we're not in the brushing step to prevent marks from disappearing during gameplay
      if (gameStep !== 2) {
        const now = Date.now();
        setScratchMarks(prev => prev.filter(mark => now - mark.timestamp < 60000)); // Keep marks for 60 seconds
      }
    }, 10000); // Check every 10 seconds instead of 5

    return () => clearInterval(cleanup);
  }, [gameStep]);

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
        
        // Set lesson data directly
        setLesson({
          id: lessonId || 1,
          title: "Handwashing",
          description: "Learn proper handwashing technique!",
          level: 1
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Something went wrong');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [lessonId, moduleId]);

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;

    try {
      setProgressSaving(true);
      const studentId = getStudentId();
      
      if (!studentId || !lessonId) {
        console.error('Cannot save progress - missing data:', { studentId, lessonId });
        return;
      }
      
      const progressData = {
        studentId: studentId,
        lessonId: parseInt(lessonId, 10),
        completed: true,
        starsEarned: 3 // Always give 3 stars when completed
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

  // Reset game state
  const resetGame = () => {
    setShowFeedback(false);
    setShowSuccess(false);
    setGameCompleted(false);
    setProgressSaved(false);
    setProgressSaving(false);
    setHideAllImages(false); // Reset image visibility
    
    // Reset game states
    setGameStep(1);
    setFaucetOn(false);
    setStep2Completed(false);
    setIsDragging(false);
    setDraggedItem(null);
    // remove soap when resetting
    setSoapPlaced(false);
    setLeftHandWet(false);
    setRightHandWet(false);
    // Reset step 4 states
    setShowScrubVideo(false);
    setIsHandHovered(false);
    setHandsRubbed(false);
    setCurrentScrubVideoIndex(0); // Reset to first video
    // Reset step 5 state
    setStep5Completed(false);

    // Try to resume background audio if available
    if (audioRef) {
      try {
        // if audio was paused, play it; otherwise leave as is
        audioRef.play().then(() => {
          setAudioPlaying(true);
        }).catch(() => {
          // ignore play errors (autoplay restrictions)
        });
      } catch (err) {
        // ignore
      }
    }
  };

  const getStarRating = () => {
    // Always return 3 stars when game is completed
    return gameCompleted ? 3 : 0;
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
  }, [showSuccess, gameCompleted]);

  useEffect(() => {
    const audio = new Audio(backgroundMusic);
    audio.loop = true;
    audio.volume = 0.3;
    setAudioRef(audio);

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

  // Start screen
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
            Handwashing
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
            Learn how to wash your hands properly to keep them clean and healthy!
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
              Start!
            </Button>
          </Stack>
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

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      backgroundImage: `url(${bathroomBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    >
      
      <Container maxWidth="xl" sx={{ py: 1 }}>
        {/* Progress bar and instructions - positioned with higher z-index */}
        <Box 
          sx={{
            position: 'relative',
            zIndex: 1010,
            mb: 2
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="body1" sx={{ 
              color: 'white', 
              fontWeight: 'bold',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              px: 2,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              Step {gameStep}/5: {gameStep === 1 ? 'Turn on faucet' : gameStep === 2 ? 'Wet Hands' : gameStep === 3 ? 'Apply Soap' : gameStep === 4 ? 'Rub Hands' : 'Rinse Hands'}
            </Typography>
            
            <Chip  
              label="Completed!" 
              sx={{
                backgroundColor: '#90BE6D',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '15px',
                boxShadow: '0 4px 15px rgba(144, 190, 109, 0.4)',
                display: gameCompleted ? 'flex' : 'none'
              }}
            />
          </Stack>
          <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <LinearProgress 
              variant="determinate" 
              value={(gameStep / 5) * 100} 
              sx={{ 
                height: 8, 
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
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
          textAlign: 'center',
          position: 'relative',
          zIndex: 1010
        }}>
          <Typography variant="body1" sx={{ 
            color: 'white', 
            fontWeight: 'bold',
            fontFamily: 'Poppins, sans-serif',
            backgroundColor: gameStep === 3 ? '#FF9800' : 'rgba(25, 130, 196, 0.9)',
            display: 'inline-block',
            px: 3,
            py: 1,
            borderRadius: '15px',
            fontSize: '1rem',
            boxShadow: gameStep === 3 ? '0 4px 15px rgba(255, 152, 0, 0.4)' : '0 4px 15px rgba(25, 130, 196, 0.4)'
          }}>
            {gameStep === 1 ? 'Click the sink to turn on water!' : 
             gameStep === 2 ? 'Drag hands to sink to wet hands!' :
             gameStep === 3 ? 'Click the soap dispenser (upper right) to get soap!' :
             gameStep === 4 ? 'Click on hands to rub them together!' :
             'Drag clean hands to sink to rinse!'}
          </Typography>
        </Box>

        {/* Scrub Video Overlay */}
        {showScrubVideo && (
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <Box sx={{ 
              position: 'relative', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              maxWidth: '90%',
              maxHeight: '90%'
            }}>
              <video
                key={scrubVideos[currentScrubVideoIndex]} // Use the current video URL as key
                autoPlay
                muted
                loop
                style={{
                  maxWidth: '100%',
                  maxHeight: '80%',
                  borderRadius: '15px',
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)'
                }}
              >
                <source src={scrubVideos[currentScrubVideoIndex]} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* NEXT/FINISH Button */}
              <Button
                variant="contained"
                onClick={() => {
                  if (currentScrubVideoIndex < scrubVideos.length - 1) {
                    // If not the last video, go to next video
                    setCurrentScrubVideoIndex(prev => prev + 1);
                  } else {
                    // If on the last video (scrub7.mp4), proceed to step 5
                    setShowScrubVideo(false);
                    setHandsRubbed(true);
                    setGameStep(5); // Move to step 5 instead of showing success
                  }
                }}
                sx={{
                  mt: 3,
                  background: 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.2rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 20px rgba(144, 190, 109, 0.5)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #A8D08D 0%, #90BE6D 100%)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                {currentScrubVideoIndex < scrubVideos.length - 1 ? 'NEXT' : 'FINISH'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Teeth bubbles - bubbles that stay on teeth surface with improved styling */}
        {teethBubbles.map(bubble => (
          <Box
            key={bubble.id}
            sx={{
              position: 'absolute',
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              backgroundColor: 'white',
              border: '1px solid rgba(173, 216, 230, 0.3)',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 10,
              opacity: bubble.opacity,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.6), inset 0 0 8px rgba(173, 216, 230, 0.2)',
              animation: 'gentleBubble 3s ease-in-out infinite',
              '@keyframes gentleBubble': {
                '0%': { transform: 'translate(-50%, -50%) scale(1)' },
                '50%': { transform: 'translate(-50%, -50%) scale(1.1)' },
                '100%': { transform: 'translate(-50%, -50%) scale(1)' }
              }
            }}
          />
        ))}

        {/* Conditionally render game content based on hideAllImages state */}
        {!hideAllImages && !gameCompleted && (
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
            {/* Game Area with Teeth, Toothbrush, and Toothpaste */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                mt: 2,
                position: 'relative',
                width: '100%'
              }}
            >
              
            
              {/* Central teeth container with scratch card effect */}
              <Box
                ref={teethContainerRef}
                data-teeth-container
                sx={{
                  width: '650px',
                  height: '600px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  transform: 'scale(1)',
                  position: 'relative',
                  overflow: 'visible'
                }}
                onDragOver={(e) => e.preventDefault()}
                // removed container-level mousedown that caused accidental drags
                >

                {/* Show sink before turn-on; once faucetOn or game moves past step 1, show faucet image in same position so it replaces the sink */}
                { (faucetOn || gameStep > 1 || step2Completed || gameCompleted) ? (
                  <img
                    src={faucetImg}
                    alt="Faucet"
                    // Add click handler for step 3 to apply soap
                    onClick={gameStep === 3 ? handleApplySoap : undefined}
                    style={{
                      width: '650px',
                      height: '600px',
                      objectFit: 'contain',
                      cursor: gameStep === 3 ? 'pointer' : 'default',
                      boxShadow: 'none',
                      filter: (step2Completed || gameCompleted) ? 'brightness(1.1) drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))' : 'brightness(1)',
                      transition: 'all 0.5s ease',
                      position: 'relative',
                      zIndex: 3
                    }}
                  />
                ) : null}
                {/* render sink when faucet image not shown */}
                { (faucetOn || gameStep > 1 || step2Completed || gameCompleted) ? null : (
                  <Box
                    component="img"
                    src={sinkImg}
                    alt="Sink"
                    onClick={gameStep === 1 && !faucetOn ? handleTurnOnFaucet : undefined}
                    sx={{
                      width: '650px',
                      height: '600px',
                      objectFit: 'contain',
                      cursor: gameStep === 1 && !faucetOn ? 'pointer' : 'default',
                      boxShadow: 'none',
                      transition: 'transform 200ms ease',
                      position: 'relative',
                      zIndex: 3,
                      ...(gameStep === 1 && !faucetOn ? {
                        '&:hover': {
                          transform: 'scale(1.06)'
                        }
                      } : {})
                    }}
                  />
                )}
 
                {/* Render germ blobs over the container (use x/y percent and size px) */}
                {!(isDragging && draggedItem === 'hands-group') && !showWetHands && gameStep < 5 &&
                  germBlobs.filter(b => !b.removed).map(b => (
                    <Box
                      key={b.id}
                      component="img"
                      src={b.image}
                      alt={`germ-${b.id}`}
                      draggable={false}
                      sx={{
                        position: 'absolute',
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.size}px`,
                        height: 'auto',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 6,
                        pointerEvents: 'none',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
                      }}
                    />
                  ))
                }

                {/* Left and right hands shown side-by-side during step 1 and step 2 */}
                {(gameStep === 1 || gameStep === 2 || gameStep === 3 || gameStep === 4 || gameStep === 5) && !(isDragging && draggedItem === 'hands-group') && !showWetHands && (
                  <Box
                    // interactive hands wrapper: enable pointer events and start dragging when in step 2 or 5
                    onMouseDown={(gameStep === 2 || gameStep === 5) ? startDragHandsGroup : undefined}
                    onClick={gameStep === 4 ? handleHandRub : undefined}
                    onMouseEnter={gameStep === 4 ? () => setIsHandHovered(true) : undefined}
                    onMouseLeave={gameStep === 4 ? () => setIsHandHovered(false) : undefined}
                    sx={{
                      position: 'absolute',
                      bottom: '0%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 4,
                      display: 'flex',
                      gap: 2,
                      alignItems: 'center',
                      pointerEvents: (gameStep === 2 || gameStep === 4 || gameStep === 5) ? 'auto' : 'none',
                      cursor: (gameStep === 2 || gameStep === 5) ? 'grab' : (gameStep === 4 ? 'pointer' : 'default'),
                      userSelect: 'none',
                      transition: 'all 0.3s ease',
                      transform: gameStep === 4 && isHandHovered ? 'translateX(-50%) scale(1.1)' : 'translateX(-50%) scale(1)'
                    }}>
                     {/* Left hand wrapper */}
                     <Box sx={{ position: 'relative', width: 400, height: 'auto', display: 'inline-block' }}>
                       <Box component="img" src={leftHandImg} alt="Left Hand" draggable={false}
                         sx={{ width: '100%', height: 'auto', display: 'block' }} />
                       {/* Only show mud in steps 1-4, not in step 5 */}
                       {gameStep < 5 && (
                         <Box component="img" src={mudImg} alt="Mud on left hand" draggable={false}
                           sx={{ position: 'absolute', left: '60%', bottom: '18%', transform: 'translate(-50%, 0)', width: 165, height: 'auto', zIndex: 7, pointerEvents: 'none' }} />
                       )}
                     </Box>
   
                    {/* Right hand wrapper */}
                    <Box sx={{ position: 'relative', width: 400, height: 'auto', display: 'inline-block' }}>
                      <Box component="img" src={rightHandImg} alt="Right Hand" draggable={false}
                        sx={{ width: '100%', height: 'auto', display: 'block' }} />
                      {/* Only show mud in steps 1-4, not in step 5 */}
                      {gameStep < 5 && (
                        <Box component="img" src={mudImg} alt="Mud on right hand" draggable={false}
                          sx={{ position: 'absolute', left: '45%', bottom: '35%', transform: 'translate(-50%, 0)', width: 120, height: 'auto', zIndex: 7, pointerEvents: 'none' }} />
                      )}
                      {/* Show soap only in steps 3-4, not in step 5 */}
                      {soapPlaced && gameStep < 5 && (
                        <Box component="img" src={soapImg} alt="Soap on right hand" draggable={false}
                          sx={{ 
                            position: 'absolute', 
                            left: '40%', 
                            bottom: '28%', 
                            transform: 'translate(-50%, 0)', 
                            width: 130, 
                            height: 'auto', 
                            zIndex: 8, 
                            pointerEvents: 'none',
                            animation: 'soapAppear 0.5s ease-out',
                            '@keyframes soapAppear': {
                              '0%': {
                                transform: 'translate(-50%, 0) scale(0)',
                                opacity: 0
                              },
                              '70%': {
                                transform: 'translate(-50%, 0) scale(1.1)',
                                opacity: 1
                              },
                              '100%': {
                                transform: 'translate(-50%, 0) scale(1)',
                                opacity: 1
                              }
                            }
                          }} 
                        />
                      )}
                    </Box>
                    </Box>
                  )}
               </Box>
             </Box>
           </Box>
         )}

        {/* Upper-left fixed action buttons (reset / home) */}
        <Box sx={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 1020,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <Button 
            variant="contained"
            onClick={resetGame}
            sx={{ 
              background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              width: 64,
              height: 64,
              minWidth: 64,
              borderRadius: '12px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.25rem',
              textTransform: 'none',
              boxShadow: '0 8px 18px rgba(255, 89, 94, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label="Reset"
          >
            🔄
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleGoHome}
            sx={{ 
              background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
              color: 'white',
              width: 64,
              height: 64,
              minWidth: 64,
              borderRadius: '12px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.25rem',
              textTransform: 'none',
              boxShadow: '0 8px 18px rgba(25, 130, 196, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&:hover': {
                background: 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)',
                transform: 'translateY(-2px)'
              }
            }}
            aria-label="Home"
          >
            🏠
          </Button>
        </Box>
        
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
              Sparkling Clean Hands!
            </Typography>
            
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
            <Typography variant="h6" sx={{ 
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              mb: 6,
              maxWidth: '800px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Perfect handwashing technique! Your hands are now sparkling clean and healthy!
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
                Wash Again
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
                {progressSaving ? 'Saving...' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Wet hands popup (temporary image) - shown on top when everything else is hidden */}
        {showWetHands && (
          <Box sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2000,
            pointerEvents: 'none'
          }}>
            <Box
              component="img"
              src={wetHandsImg}
              alt="Wet Hands"
              sx={{
                width: '600px',
                height: 'auto',
                pointerEvents: 'none',
                animation: 'bounceIn 1.2s ease-out',
                '@keyframes bounceIn': {
                  '0%': {
                    transform: 'scale(0.8)',
                    opacity: 0.8
                  },
                  '50%': {
                    transform: 'scale(1.1)'
                  },
                  '70%': {
                    transform: 'scale(0.95)'
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1
                  }
                }
              }}
            />
          </Box>
        )}

        {/* Render dragged hand at cursor (floating) - only show when not hiding images */}
        {!hideAllImages && isDragging && draggedItem === 'hands-group' && (
          <Box
            sx={{
              position: 'fixed',
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              pointerEvents: 'none',
              zIndex: 1500,
              transform: 'translate(-50%, -50%)',
              opacity: 0.95,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
              filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
            }}
          >
            {/* Left hand with mud overlay */}
            <Box sx={{ position: 'relative', width: 350, height: 'auto', display: 'inline-block' }}>
              <Box component="img" src={leftHandImg} alt="drag-left-hand" draggable={false} sx={{ width: '100%', height: 'auto', display: 'block' }} />
              {/* Only show mud in steps 1-4, not in step 5 */}
              {gameStep < 5 && (
                <Box component="img" src={mudImg} alt="drag-mud-left" draggable={false}
                  sx={{
                    position: 'absolute',
                    left: '60%',
                    bottom: '18%',
                    transform: 'translate(-50%, 0)',
                    width: 165,
                    height: 'auto',
                    zIndex: 7,
                    pointerEvents: 'none'
                  }}
                />
              )}
            </Box>
            {/* Right hand with mud overlay */}
            <Box sx={{ position: 'relative', width: 350, height: 'auto', display: 'inline-block' }}>
              <Box component="img" src={rightHandImg} alt="drag-right-hand" draggable={false} sx={{ width: '100%', height: 'auto', display: 'block' }} />
              {/* Only show mud in steps 1-4, not in step 5 */}
              {gameStep < 5 && (
                <Box component="img" src={mudImg} alt="drag-mud-right" draggable={false}
                  sx={{
                    position: 'absolute',
                    left: '45%',
                    bottom: '35%',
                    transform: 'translate(-50%, 0)',
                    width: 120,
                    height: 'auto',
                    zIndex: 7,
                    pointerEvents: 'none'
                  }}
                />
              )}
              {/* Show soap only in steps 3-4, not in step 5 */}
              {soapPlaced && gameStep < 5 && (
                <Box component="img" src={soapImg} alt="Soap on right hand" draggable={false}
                  sx={{ position: 'absolute', left: '40%', bottom: '28%', transform: 'translate(-50%, 0)', width: 130, height: 'auto', zIndex: 8, pointerEvents: 'none' }} />
              )}
            </Box>
          </Box>
        )}
        
        {/* keep other dragged-item previews if needed (fallback) */}
        {!hideAllImages && isDragging && (draggedItem === 'left' || draggedItem === 'right') && (
          <Box
            component="img"
            src={draggedItem === 'left' ? leftHandImg : rightHandImg}
            alt={`${draggedItem} hand`}
            sx={{
              position: 'fixed',
              left: `${dragPos.x}px`,
              top: `${dragPos.y}px`,
              width: '150px',
              height: 'auto',
              pointerEvents: 'none',
              zIndex: 1500,
              transform: 'translate(-50%, -50%)',
              opacity: 0.9,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}
          />
        )}
      </Container>
    </div>
  );
}