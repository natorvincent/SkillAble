import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Grid,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
  Divider,
  Stack,
  Fade,
  Slide,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
  Fab
} from '@mui/material';
import {
  VolumeUp,
  Refresh,
  EmojiEvents,
  Star,
  CheckCircle,
  Home,
  Info,
  Close,
  PlayArrow,
  Pause,
  School,
  CleaningServices,
  AutoAwesome,
  Celebration,
  NavigateNext,
  NavigateBefore,
  Build,
  CheckBox,
  RadioButtonUnchecked
} from '@mui/icons-material';
import { createTheme, ThemeProvider, keyframes } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#388E3C',
    },
    secondary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    success: {
      main: '#66BB6A',
    },
    warning: {
      main: '#FFA726',
    },
    background: {
      default: '#f0f8f0',
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
        },
      },
    },
  },
});

// Animations
const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const sweep = keyframes`
  0% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(20px) rotate(10deg); }
  50% { transform: translateX(40px) rotate(0deg); }
  75% { transform: translateX(20px) rotate(-10deg); }
  100% { transform: translateX(0) rotate(0deg); }
`;

const sparkle = keyframes`
  0%, 100% { 
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% { 
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% { 
    transform: translateY(0px);
  }
  50% { 
    transform: translateY(-10px);
  }
`;

const wipe = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -10px) rotate(15deg); }
  50% { transform: translate(-20px, 10px) rotate(-10deg); }
  75% { transform: translate(25px, -5px) rotate(5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const HouseholdLevel2 = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [celebrationItems, setCelebrationItems] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [selectedTools, setSelectedTools] = useState(new Set());
  const [sweepingProgress, setSweepingProgress] = useState(0);
  const [wipingProgress, setWipingProgress] = useState(0);
  const [dirtItems, setDirtItems] = useState([]);
  const [stains, setStains] = useState([]);
  const [cursorPosition, setCursorPosition] = useState({ x: 50, y: 50 });
  const [isAnimating, setIsAnimating] = useState(false);

  const cleaningTools = [
    { 
      id: 1, 
      name: 'Broom', 
      emoji: '🧹', 
      description: 'For sweeping dirt and debris from floors',
      color: '#8D6E63',
      bgColor: 'linear-gradient(135deg, #8D6E63, #A1887F)',
      uses: ['sweeping floors', 'gathering dirt', 'cleaning corners']
    },
    { 
      id: 2, 
      name: 'Dustpan', 
      emoji: '🗑️', 
      description: 'For collecting swept dirt and debris',
      color: '#607D8B',
      bgColor: 'linear-gradient(135deg, #607D8B, #78909C)',
      uses: ['collecting dirt', 'working with broom', 'disposing waste']
    },
    { 
      id: 3, 
      name: 'Cleaning Rag', 
      emoji: '🧽', 
      description: 'For wiping surfaces and cleaning spills',
      color: '#2196F3',
      bgColor: 'linear-gradient(135deg, #2196F3, #42A5F5)',
      uses: ['wiping tables', 'cleaning spills', 'polishing surfaces']
    },
    { 
      id: 4, 
      name: 'Spray Bottle', 
      emoji: '🧴', 
      description: 'For applying cleaning solution to surfaces',
      color: '#4CAF50',
      bgColor: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
      uses: ['spraying surfaces', 'adding moisture', 'applying cleaner']
    }
  ];

  const cleaningSteps = [
    {
      title: 'Meet Your Cleaning Tools',
      content: 'Learn about the essential tools for cleaning',
      activity: 'tool-introduction',
      instruction: 'Click on each tool to learn what it does!',
      icon: '🛠️'
    },
    {
      title: 'Prepare the Area',
      content: 'Clear the space before you start cleaning',
      activity: 'preparation',
      instruction: 'Make sure the area is ready for cleaning',
      icon: '📦'
    },
    {
      title: 'Sweeping Practice',
      content: 'Learn proper sweeping technique',
      activity: 'sweeping',
      instruction: 'Move your mouse to sweep up all the dirt!',
      icon: '🧹'
    },
    {
      title: 'Using the Dustpan',
      content: 'Collect the dirt with your dustpan',
      activity: 'dustpan',
      instruction: 'Practice using the dustpan with the broom',
      icon: '🗑️'
    },
    {
      title: 'Wiping Surfaces',
      content: 'Clean tables and surfaces with a rag',
      activity: 'wiping',
      instruction: 'Move your mouse to wipe away all stains!',
      icon: '🧽'
    },
    {
      title: 'Final Check',
      content: 'Make sure everything is clean and tidy',
      activity: 'final-check',
      instruction: 'Review your cleaning work!',
      icon: '✅'
    }
  ];

  useEffect(() => {
    // Initialize dirt items for sweeping activity
    if (activeStep === 2) {
      const newDirtItems = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 70 + 10,
        y: Math.random() * 60 + 20,
        collected: false,
        type: ['dust', 'crumb', 'leaf'][Math.floor(Math.random() * 3)]
      }));
      setDirtItems(newDirtItems);
      setSweepingProgress(0);
    }
    
    // Initialize stains for wiping activity
    if (activeStep === 4) {
      const newStains = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        x: Math.random() * 60 + 20,
        y: Math.random() * 40 + 30,
        cleaned: false,
        size: Math.random() * 20 + 15
      }));
      setStains(newStains);
      setWipingProgress(0);
    }
  }, [activeStep]);

  const createCelebrationEffect = () => {
    const colors = ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#FF5722', '#00BCD4'];
    const newItems = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: i * 100,
      left: Math.random() * 100,
      size: Math.random() * 10 + 5
    }));
    
    setCelebrationItems(newItems);
    setTimeout(() => setCelebrationItems([]), 3000);
  };

  const handleNext = () => {
    if (activeStep < cleaningSteps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, activeStep]));
      setActiveStep(prev => prev + 1);
      setScore(prev => prev + 15);
      createCelebrationEffect();
      
      setSnackbar({
        open: true,
        message: 'Great job! Moving to the next step! 🎉',
        severity: 'success'
      });
    } else {
      setCompletedSteps(prev => new Set([...prev, activeStep]));
      setShowSuccess(true);
      createCelebrationEffect();
    }
  };

  const handleBack = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleToolClick = (tool) => {
    setSelectedTools(prev => new Set([...prev, tool.id]));
    setScore(prev => prev + 5);
    
    setSnackbar({
      open: true,
      message: `You learned about the ${tool.name}! +5 points`,
      severity: 'success'
    });
    
    playSuccessSound();
  };

  const handleSweepArea = (e) => {
    if (activeStep !== 2) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCursorPosition({ x, y });
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    // Check if broom is near any dirt
    const updatedDirt = dirtItems.map(dirt => {
      if (!dirt.collected && 
          Math.abs(dirt.x - x) < 15 && 
          Math.abs(dirt.y - y) < 15) {
        setScore(prev => prev + 3);
        playSuccessSound();
        return { ...dirt, collected: true };
      }
      return dirt;
    });
    
    setDirtItems(updatedDirt);
    
    const newProgress = (updatedDirt.filter(d => d.collected).length / updatedDirt.length) * 100;
    setSweepingProgress(newProgress);
    
    if (newProgress === 100) {
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: 'Perfect sweeping! All dirt collected! 🧹✨',
          severity: 'success'
        });
      }, 500);
    }
  };

  const handleWipeArea = (e) => {
    if (activeStep !== 4) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCursorPosition({ x, y });
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
    
    // Check if cloth is near any stains
    const updatedStains = stains.map(stain => {
      if (!stain.cleaned && 
          Math.abs(stain.x - x) < 20 && 
          Math.abs(stain.y - y) < 20) {
        setScore(prev => prev + 4);
        playSuccessSound();
        return { ...stain, cleaned: true };
      }
      return stain;
    });
    
    setStains(updatedStains);
    
    const newProgress = (updatedStains.filter(s => s.cleaned).length / updatedStains.length) * 100;
    setWipingProgress(newProgress);
    
    if (newProgress === 100) {
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: 'Excellent wiping! Surface is spotless! 🧽✨',
          severity: 'success'
        });
      }, 500);
    }
  };

  const playSuccessSound = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Great job!');
      utterance.rate = 1.2;
      utterance.pitch = 1.3;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const resetLesson = () => {
    setActiveStep(0);
    setScore(0);
    setCompletedSteps(new Set());
    setSelectedTools(new Set());
    setSweepingProgress(0);
    setWipingProgress(0);
    setDirtItems([]);
    setStains([]);
    setShowSuccess(false);
  };

  const renderActivity = () => {
    const currentStep = cleaningSteps[activeStep];
    
    switch (currentStep.activity) {
      case 'tool-introduction':
        return (
          <Grid container spacing={3}>
            {cleaningTools.map((tool, index) => (
              <Grid item xs={12} sm={6} md={3} key={tool.id}>
                <Zoom in={true} timeout={300 + index * 100}>
                  <Card
                    onClick={() => handleToolClick(tool)}
                    sx={{
                      cursor: 'pointer',
                      minHeight: 280,
                      background: selectedTools.has(tool.id) 
                        ? 'linear-gradient(135deg, #4CAF50, #81C784)'
                        : tool.bgColor,
                      border: selectedTools.has(tool.id) ? '3px solid #2E7D32' : '2px solid rgba(255,255,255,0.3)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.25)',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 3 }}>
                      <Typography variant="h1" sx={{ mb: 3, fontSize: '4rem' }}>
                        {tool.emoji}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          color: 'white',
                          fontWeight: 700,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {tool.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'rgba(255,255,255,0.9)',
                          mb: 2,
                          lineHeight: 1.4
                        }}
                      >
                        {tool.description}
                      </Typography>
                      {selectedTools.has(tool.id) && (
                        <Fade in={true}>
                          <Box sx={{ mt: 2 }}>
                            <CheckCircle 
                              sx={{ 
                                color: 'white', 
                                fontSize: 40,
                                animation: `${bounce} 0.6s ease-out`
                              }} 
                            />
                            <Typography variant="caption" sx={{ color: 'white', display: 'block', mt: 1, fontWeight: 600 }}>
                              Learned! +5 points
                            </Typography>
                          </Box>
                        </Fade>
                      )}
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        );
      
      case 'sweeping':
        return (
          <Box>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', border: '2px solid #ff9800' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                    <span style={{ fontSize: '1.5rem' }}>🧹</span>
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#E65100', fontWeight: 700 }}>
                      Sweeping Practice Area
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#BF360C' }}>
                      Move your mouse around to sweep up all the dirt and debris!
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={sweepingProgress} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    backgroundColor: 'rgba(230, 81, 0, 0.2)',
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4CAF50',
                      borderRadius: 6
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Progress: {Math.round(sweepingProgress)}% complete
                </Typography>
              </CardContent>
            </Card>
            
            <Paper
              onMouseMove={handleSweepArea}
              sx={{
                minHeight: 400,
                background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)',
                border: '4px solid #8D6E63',
                borderRadius: 4,
                position: 'relative',
                cursor: 'none',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: '#5D4037'
                }
              }}
            >
              {/* Dirt items */}
              {dirtItems.map((dirt) => (
                <Box
                  key={dirt.id}
                  sx={{
                    position: 'absolute',
                    left: `${dirt.x}%`,
                    top: `${dirt.y}%`,
                    fontSize: '1.8rem',
                    opacity: dirt.collected ? 0 : 1,
                    transition: 'all 0.5s ease',
                    transform: dirt.collected ? 'scale(0)' : 'scale(1)',
                    pointerEvents: 'none',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  {dirt.type === 'dust' ? '💨' : dirt.type === 'crumb' ? '🍞' : '🍃'}
                </Box>
              ))}
              
              {/* Broom cursor */}
              <Box
                sx={{
                  position: 'absolute',
                  left: `${cursorPosition.x}%`,
                  top: `${cursorPosition.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: '3rem',
                  pointerEvents: 'none',
                  animation: isAnimating ? `${sweep} 0.5s ease-in-out` : 'none',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }}
              >
                🧹
              </Box>
              
              {sweepingProgress === 100 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    animation: `${bounce} 1s ease-out infinite`,
                    background: 'rgba(255,255,255,0.95)',
                    borderRadius: 4,
                    p: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}
                >
                  <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 700, mb: 1 }}>
                    ✨ Perfect! ✨
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#2E7D32' }}>
                    All dirt swept up!
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        );
      
      case 'wiping':
        return (
          <Box>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', border: '2px solid #2196f3' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
                    <span style={{ fontSize: '1.5rem' }}>🧽</span>
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#1565C0', fontWeight: 700 }}>
                      Table Wiping Practice
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#0D47A1' }}>
                      Move your mouse around to wipe away all the stains on the table!
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={wipingProgress} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    backgroundColor: 'rgba(21, 101, 192, 0.2)',
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#4CAF50',
                      borderRadius: 6
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Progress: {Math.round(wipingProgress)}% complete
                </Typography>
              </CardContent>
            </Card>
            
            <Paper
              onMouseMove={handleWipeArea}
              sx={{
                minHeight: 400,
                background: 'linear-gradient(135deg, #8D6E63, #A1887F)',
                border: '4px solid #5D4037',
                borderRadius: 4,
                position: 'relative',
                cursor: 'none',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: '#3E2723'
                }
              }}
            >
              {/* Table surface */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 20,
                  background: 'linear-gradient(135deg, #D7CCC8, #BCAAA4)',
                  borderRadius: 3,
                  border: '3px solid #8D6E63',
                  boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                {/* Stains */}
                {stains.map((stain) => (
                  <Box
                    key={stain.id}
                    sx={{
                      position: 'absolute',
                      left: `${stain.x}%`,
                      top: `${stain.y}%`,
                      width: stain.size,
                      height: stain.size,
                      backgroundColor: 'rgba(139, 69, 19, 0.7)',
                      borderRadius: '50%',
                      opacity: stain.cleaned ? 0 : 1,
                      transition: 'all 0.5s ease',
                      transform: stain.cleaned ? 'scale(0)' : 'scale(1)',
                      pointerEvents: 'none',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  />
                ))}
                
                {/* Cleaning cloth cursor */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${cursorPosition.x}%`,
                    top: `${cursorPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: '3rem',
                    pointerEvents: 'none',
                    animation: isAnimating ? `${wipe} 0.8s ease-in-out` : 'none',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}
                >
                  🧽
                </Box>
                
                {wipingProgress === 100 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      animation: `${bounce} 1s ease-out infinite`,
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: 4,
                      p: 4,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                  >
                    <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 700, mb: 1 }}>
                      ✨ Spotless! ✨
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#2E7D32' }}>
                      Table is perfectly clean!
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        );
      
      default:
        return (
          <Paper sx={{ 
            p: 6, 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #f0f8f0, #e8f5e8)',
            border: '2px solid #4CAF50',
            borderRadius: 4
          }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#4CAF50', 
                mx: 'auto', 
                mb: 3,
                fontSize: '2.5rem'
              }}
            >
              {currentStep.icon}
            </Avatar>
            <Typography variant="h4" gutterBottom sx={{ color: '#2E7D32', fontWeight: 700 }}>
              {currentStep.title}
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, color: '#388E3C' }}>
              {currentStep.content}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              {currentStep.instruction}
            </Typography>
          </Paper>
        );
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return selectedTools.size === cleaningTools.length;
      case 2:
        return sweepingProgress === 100;
      case 4:
        return wipingProgress === 100;
      default:
        return true;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Celebration particles */}
        {celebrationItems.map(item => (
          <Box
            key={item.id}
            sx={{
              position: 'absolute',
              left: `${item.left}%`,
              top: '20%',
              width: `${item.size}px`,
              height: `${item.size}px`,
              backgroundColor: item.color,
              borderRadius: '50%',
              animation: `${sparkle} 2s ease-out ${item.delay}ms`,
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          />
        ))}

        <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2, md: 3 } }}>
          {/* Enhanced Header */}
          <Card sx={{ 
            mb: 3, 
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f8f0 100%)',
            border: '2px solid rgba(255,255,255,0.8)'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2
              }}>
                <Box>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      background: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: `${float} 3s ease-in-out infinite`
                    }}
                  >
                    <CleaningServices sx={{ color: '#4CAF50', fontSize: '2.5rem' }} />
                    Level 2: Sweeping & Cleaning
                    <AutoAwesome sx={{ color: '#2E7D32', fontSize: '1.5rem' }} />
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1, fontSize: '1.1rem' }}>
                    Master the basics of sweeping and surface cleaning! 🧹✨
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Tooltip title="Go back to homepage">
                    <Button
                      variant="outlined"
                      startIcon={<Home />}
                      sx={{ 
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Home
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title={isPlaying ? "Stop instructions" : "Play instructions"}>
                    <Button
                      variant="contained"
                      startIcon={isPlaying ? <Pause /> : <VolumeUp />}
                      onClick={() => playAudio("Welcome to cleaning basics! You'll learn to use cleaning tools, sweep floors, and wipe surfaces. Follow each step carefully to become a cleaning expert!")}
                      sx={{ 
                        background: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #45a049, #256029)'
                        }
                      }}
                    >
                      {isPlaying ? 'Stop' : 'Instructions'}
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Show help">
                    <Button
                      variant="outlined"
                      startIcon={<School />}
                      onClick={() => setShowInstructions(true)}
                      sx={{ 
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Help
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              
              {/* Enhanced Progress and Score */}
              <Box sx={{ mt: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between', 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  mb: 2,
                  gap: 2
                }}>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Step {activeStep + 1} of {cleaningSteps.length}: {cleaningSteps[activeStep].title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      icon={<Star />} 
                      label={`Score: ${score}`} 
                      color="primary" 
                      variant="filled"
                      sx={{ 
                        fontWeight: 600,
                        background: 'linear-gradient(45deg, #4CAF50, #2E7D32)',
                        color: 'white'
                      }}
                    />
                    <Chip 
                      icon={<CheckCircle />}
                      label={`Completed: ${completedSteps.size}/${cleaningSteps.length}`} 
                      color="success" 
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(activeStep / (cleaningSteps.length - 1)) * 100} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    background: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #4CAF50, #2E7D32)',
                      borderRadius: 6
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Grid container spacing={3}>
            {/* Enhanced Stepper */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f8f0 100%)',
                maxHeight: 600,
                overflowY: 'auto'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    📋 Cleaning Steps
                  </Typography>
                  <Stepper activeStep={activeStep} orientation="vertical">
                    {cleaningSteps.map((step, index) => (
                      <Step key={index} completed={completedSteps.has(index)}>
                        <StepLabel
                          sx={{
                            '& .MuiStepLabel-label': {
                              fontWeight: activeStep === index ? 700 : 500,
                              color: activeStep === index ? '#2E7D32' : 'text.secondary'
                            },
                            '& .MuiStepIcon-root': {
                              color: completedSteps.has(index) ? '#4CAF50' : activeStep === index ? '#4CAF50' : '#e0e0e0'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
                            {step.title}
                          </Box>
                        </StepLabel>
                        <StepContent>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {step.content}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            fontWeight: 600,
                            color: '#4CAF50',
                            display: 'block',
                            mb: 1
                          }}>
                            💡 {step.instruction}
                          </Typography>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </CardContent>
              </Card>
            </Grid>

            {/* Enhanced Activity Area */}
            <Grid item xs={12} md={8}>
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fff8 100%)',
                minHeight: 500
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🎯 {cleaningSteps[activeStep].title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    {cleaningSteps[activeStep].instruction}
                  </Typography>
                  
                  {renderActivity()}
                  
                  {/* Enhanced Navigation Buttons */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 4,
                    pt: 3,
                    borderTop: '2px solid #e8f5e8'
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<NavigateBefore />}
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      size="large"
                      sx={{ 
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                        '&:disabled': { borderWidth: 2 }
                      }}
                    >
                      Previous
                    </Button>
                    
                    <Chip 
                      label={`Step ${activeStep + 1} of ${cleaningSteps.length}`} 
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    
                    <Button
                      variant="contained"
                      endIcon={activeStep === cleaningSteps.length - 1 ? <CheckCircle /> : <NavigateNext />}
                      onClick={handleNext}
                      disabled={!canProceed()}
                      size="large"
                      sx={{
                        background: canProceed() ? 'linear-gradient(45deg, #4CAF50, #2E7D32)' : undefined,
                        '&:hover': {
                          background: canProceed() ? 'linear-gradient(45deg, #45a049, #256029)' : undefined
                        },
                        '&:disabled': {
                          background: '#e0e0e0'
                        }
                      }}
                    >
                      {activeStep === cleaningSteps.length - 1 ? 'Complete' : 'Next'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Enhanced Reset Button */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={resetLesson}
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FB8C00, #EF6C00)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(255, 152, 0, 0.4)'
                }
              }}
            >
              Start Over
            </Button>
          </Box>

          {/* Enhanced Success Dialog */}
          <Dialog
            open={showSuccess}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: { 
                borderRadius: 4,
                background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                color: 'white'
              }
            }}
          >
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ position: 'relative', mb: 2 }}>
                  <EmojiEvents 
                    sx={{ 
                      fontSize: 80, 
                      color: '#FFD700',
                      animation: `${bounce} 1s ease-out infinite`
                    }} 
                  />
                  <Celebration
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      fontSize: 30,
                      color: '#ff6b6b',
                      animation: `${sparkle} 2s ease-out infinite`
                    }}
                  />
                </Box>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                  Outstanding! 🎉
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                  Cleaning Master Certified!
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                You've mastered the basics of sweeping and cleaning! You know your tools and techniques!
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 700 }}>
                      {score}
                    </Typography>
                    <Typography variant="body2">Final Score</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    <Typography variant="h4" sx={{ color: '#81C784', fontWeight: 700 }}>
                      {completedSteps.size + 1}
                    </Typography>
                    <Typography variant="body2">Steps Completed</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Congratulations! You're ready for more advanced household skills!
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => {
                  setShowSuccess(false);
                  resetLesson();
                }}
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Practice Again
              </Button>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => alert('Next level coming soon!')}
                sx={{
                  bgcolor: 'white',
                  color: '#4CAF50',
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                Next Level
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => alert('Going home...')}
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Home
              </Button>
            </DialogActions>
          </Dialog>

          {/* Enhanced Instructions Dialog */}
          <Dialog
            open={showInstructions}
            onClose={() => setShowInstructions(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: { 
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f8f0 100%)'
              }
            }}
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E7D32' }}>
                  🧹 Cleaning Basics Guide
                </Typography>
                <IconButton 
                  onClick={() => setShowInstructions(false)}
                  sx={{ 
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.2)' }
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 700 }}>
                🛠️ What You'll Learn:
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {cleaningTools.map((tool) => (
                  <Grid item xs={12} sm={6} key={tool.id}>
                    <Paper sx={{ 
                      p: 2, 
                      border: '2px solid #4CAF50', 
                      borderRadius: 2,
                      background: 'rgba(76, 175, 80, 0.05)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h3">{tool.emoji}</Typography>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {tool.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tool.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              
              <Paper sx={{ p: 3, bgcolor: 'rgba(76, 175, 80, 0.05)', borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 700 }}>
                  📚 Step-by-Step Learning:
                </Typography>
                <Box component="ol" sx={{ pl: 2, '& li': { mb: 1 } }}>
                  <li>
                    <Typography variant="body1">
                      <strong>Learn your tools</strong> - Click on each cleaning tool to discover its purpose
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <strong>Practice sweeping</strong> - Move your mouse to sweep up dirt and debris
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <strong>Master wiping</strong> - Clean stains from surfaces with proper technique
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      <strong>Complete all steps</strong> - Finish each activity to become a cleaning expert!
                    </Typography>
                  </li>
                </Box>
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                    💡 Pro Tips: Follow the steps in order, complete each activity fully, and use the audio instructions for guidance!
                  </Typography>
                </Box>
              </Paper>
            </DialogContent>
          </Dialog>

          {/* Enhanced Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ 
                width: '100%',
                borderRadius: 3,
                fontWeight: 600,
                fontSize: '1rem'
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HouseholdLevel2;