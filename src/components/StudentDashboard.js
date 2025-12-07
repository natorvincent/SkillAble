import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  IconButton,
  Fade,
  Backdrop,
  Divider,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  LinearProgress,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar from "./Navbar";
import Background from "./Background";
import { 
  getAllModuleProgress
} from '../services/progressService';
import AudioToggleButton from "../components/background music/AudioToggleButton";
import backgroundMusic from '../assets/background-music.mp3';

import hygieneImg from '../assets/studentDashboard/hygiene.png';
import cookingImg from '../assets/studentDashboard/cooking.png';
import householdImg from '../assets/studentDashboard/household.png';
import sparkleImg from '../assets/sparkle.png'; // Import sparkle image

// Simple audio hook to prevent infinite re-renders
const useSimpleAudio = (audioFile) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current && audioFile) {
      audioRef.current = new Audio(audioFile);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioFile]);

  const toggleAudio = () => {
    setAudioPlaying(prev => {
      const newState = !prev;
      if (audioRef.current) {
        if (newState) {
          audioRef.current.play().catch(error => {
            console.log('Audio play failed:', error);
          });
        } else {
          audioRef.current.pause();
        }
      }
      return newState;
    });
  };

  return { audioPlaying, toggleAudio };
};

// Sparkle Component with continuous animation
const Sparkle = ({ position, index, isActive }) => {
  const animationDuration = `${0.8 + Math.random() * 0.4}s`;
  const size = `${15 + Math.random() * 40}px`;
  const initialRotation = Math.random() * 360;

  // Multiple position presets for more sparkles
  const positions = {
    // Corner sparkles
    topLeft: { top: '-25px', left: '-25px' },
    topRight: { top: '-25px', right: '-25px' },
    bottomLeft: { bottom: '-25px', left: '-25px' },
    bottomRight: { bottom: '-25px', right: '-25px' },
    
    // Edge center sparkles
    topCenter: { top: '-25px', left: '50%', transform: 'translateX(-50%)' },
    bottomCenter: { bottom: '-25px', left: '50%', transform: 'translateX(-50%)' },
    leftCenter: { top: '50%', left: '-25px', transform: 'translateY(-50%)' },
    rightCenter: { top: '50%', right: '-25px', transform: 'translateY(-50%)' },
    
    // Diagonal sparkles
    topLeftInner: { top: '20px', left: '20px' },
    topRightInner: { top: '20px', right: '20px' },
    bottomLeftInner: { bottom: '20px', left: '20px' },
    bottomRightInner: { bottom: '20px', right: '20px' },
    
    // Middle edges
    topMiddle: { top: '50px', left: '50%', transform: 'translateX(-50%)' },
    bottomMiddle: { bottom: '50px', left: '50%', transform: 'translateX(-50%)' },
    leftMiddle: { top: '50%', left: '50px', transform: 'translateY(-50%)' },
    rightMiddle: { top: '50%', right: '50px', transform: 'translateY(-50%)' },
    
    // Random positions along edges
    random1: { top: '30%', left: '-20px' },
    random2: { top: '70%', right: '-20px' },
    random3: { top: '-20px', left: '30%' },
    random4: { bottom: '-20px', right: '70%' },
    random5: { top: '25%', right: '-15px' },
    random6: { bottom: '25%', left: '-15px' },
  };

  const positionStyle = positions[position] || positions.topLeft;

  return (
    <Box
      sx={{
        position: 'absolute',
        ...positionStyle,
        width: size,
        height: size,
        opacity: isActive ? 1 : 0,
        animation: isActive 
          ? `sparkleAnimation ${animationDuration} ease-in-out infinite ${Math.random() * 0.5}s` 
          : 'none',
        '@keyframes sparkleAnimation': {
          '0%': {
            opacity: 0,
            transform: `scale(0.1) rotate(${initialRotation}deg) ${positionStyle.transform || ''}`,
          },
          '20%': {
            opacity: 0.8,
            transform: `scale(0.5) rotate(${initialRotation + 45}deg) ${positionStyle.transform || ''}`,
          },
          '40%': {
            opacity: 1,
            transform: `scale(1) rotate(${initialRotation + 90}deg) ${positionStyle.transform || ''}`,
          },
          '60%': {
            opacity: 1,
            transform: `scale(1.2) rotate(${initialRotation + 135}deg) ${positionStyle.transform || ''}`,
          },
          '80%': {
            opacity: 0.6,
            transform: `scale(0.8) rotate(${initialRotation + 180}deg) ${positionStyle.transform || ''}`,
          },
          '100%': {
            opacity: 0,
            transform: `scale(0.1) rotate(${initialRotation + 225}deg) ${positionStyle.transform || ''}`,
          },
        },
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease',
      }}
    >
      <Box
        component="img"
        src={sparkleImg}
        alt="sparkle"
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: `hue-rotate(${index * 40}deg) brightness(1.3) drop-shadow(0 0 4px rgba(255, 255, 255, 0.7))`,
        }}
      />
    </Box>
  );
};

// Generate sparkle positions
const generateSparklePositions = () => {
  const allPositions = [
    'topLeft', 'topRight', 'bottomLeft', 'bottomRight',
    'topCenter', 'bottomCenter', 'leftCenter', 'rightCenter',
    'topLeftInner', 'topRightInner', 'bottomLeftInner', 'bottomRightInner',
    'topMiddle', 'bottomMiddle', 'leftMiddle', 'rightMiddle',
    'random1', 'random2', 'random3', 'random4', 'random5', 'random6'
  ];
  
  // Take all positions for maximum sparkles
  return allPositions;
};

function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [tempSelectedRole, setTempSelectedRole] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleProgress, setModuleProgress] = useState({});
  const [loadingModules, setLoadingModules] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hoveredModule, setHoveredModule] = useState(null);
  const [sparklePositions] = useState(generateSparklePositions());
  
  // Use the simple audio hook
  const { audioPlaying, toggleAudio } = useSimpleAudio(backgroundMusic);
  const navigate = useNavigate();
  
  // Refs to track navigation state and prevent loops
  const navigationBlockedRef = useRef(false);
  const authCheckedRef = useRef(false);
  const profileModalShownRef = useRef(false);
  const roleSelectionShownRef = useRef(false);
  const modulesFetchedRef = useRef(false);

  const moduleImages = [hygieneImg, cookingImg, householdImg];
  const moduleTitles = ["Hygiene", "Cooking", "Household"];
  const moduleRoutes = [1, 2, 3]; // Routes for each module

  // FIXED: Simplified authentication check - only run once
  useEffect(() => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    const checkAuthentication = () => {
      const token = localStorage.getItem("token");
      const userEmail = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole");
      
      console.log("StudentDashboard Auth check:", { token: !!token, userEmail, userRole });

      if (!token || !userEmail) {
        console.log("No auth token, redirecting to login");
        navigate("/login", { replace: true });
        return;
      }

      if (userRole === "TEACHER") {
        console.log("Teacher role detected, redirecting to teacher dashboard");
        navigate("/teacherdashboard", { replace: true });
        return;
      }

      console.log("User authenticated as STUDENT, fetching profile...");
      fetchUserProfile(userEmail);
    };

    // Use setTimeout to ensure this runs after component mount
    setTimeout(checkAuthentication, 0);
  }, [navigate]);

  // FIXED: Profile completion check
  useEffect(() => {
    if (userProfile && !loading) {
      console.log("User profile loaded, complete:", isProfileComplete());
      
      if (!isProfileComplete() && !profileModalShownRef.current) {
        console.log("Profile incomplete, showing modal");
        setOpenProfileModal(true);
        profileModalShownRef.current = true;
      } else if (isProfileComplete() && !modulesFetchedRef.current) {
        console.log("Profile complete, fetching modules");
        modulesFetchedRef.current = true;
        fetchModules();
      }
    }
  }, [userProfile, loading]);

  const fetchUserProfile = async (email) => {
    try {
      console.log("Fetching user profile for:", email);
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/students/profile?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const profileData = await response.json();
      console.log("Profile data received:", profileData);
      
      setUserProfile(profileData);
      setFirstName(profileData.firstName || "");
      setLastName(profileData.lastName || "");
      setDateOfBirth(profileData.dateOfBirth || "");
      
      if (profileData.id && !localStorage.getItem('studentId')) {
        localStorage.setItem('studentId', profileData.id);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Unable to load your profile. Please log in again.");
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  // FIXED: Module fetching
  const fetchModules = async () => {
    if (modulesFetchedRef.current && modules.length > 0) return;
    
    setLoadingModules(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      
      console.log("Fetching available modules...");
      const availableResponse = await fetch("https://skillable-pdv0.onrender.com/api/modules/available", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Email": userEmail
        }
      });
      
      if (!availableResponse.ok) {
        throw new Error("Failed to fetch available modules");
      }
      
      const modulesData = await availableResponse.json();
      console.log("Modules data received:", modulesData);
      
      // Use the simplified utility function to get all progress
      const studentId = localStorage.getItem('studentId') || userProfile?.id;
      const progressMap = await getAllModuleProgress(studentId, modulesData);
      
      setModuleProgress(progressMap);
      setModules(modulesData);
      setLoadingModules(false);
      
    } catch (err) {
      console.error("Error fetching modules:", err);
      // Set default progress for all modules on error
      const progressMap = {};
      if (modules && modules.length > 0) {
        modules.forEach(module => {
          progressMap[module.id] = getDefaultModuleProgress();
        });
      }
      setModuleProgress(progressMap);
      setLoadingModules(false);
    }
  };

  // Default progress function
  const getDefaultModuleProgress = () => {
    return {
      completed: false,
      completedLessons: 0,
      totalLessons: 0,
      totalStars: 0,
      averageScore: 0,
      lastAccessed: null
    };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !dateOfBirth) {
      setError("All fields are required");
      setOpenSnackbar(true);
      return;
    }

    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch("https://skillable-pdv0.onrender.com/api/students/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userEmail,
          firstName,
          lastName,
          dateOfBirth
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update local user profile state
      setUserProfile(prev => ({
        ...prev,
        firstName,
        lastName,
        dateOfBirth
      }));

      setSuccess("Profile information saved!");
      setOpenSnackbar(true);
      setOpenProfileModal(false);
      
      // Show role selection after profile is saved
      console.log("Profile saved, showing role selection");
      setShowRoleSelection(true);
      roleSelectionShownRef.current = true;
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setOpenSnackbar(true);
    }
  };

  const handleRoleCardClick = (role) => {
    console.log("Role card clicked:", role);
    setTempSelectedRole(role);
  };

  const handleSaveRole = async () => {
    if (!tempSelectedRole) {
      setError("Please select a role");
      setOpenSnackbar(true);
      return;
    }

    setSavingRole(true);

    try {
      const userEmail = localStorage.getItem("userEmail");

      const endpoint =
        tempSelectedRole === "STUDENT"
          ? "https://skillable-pdv0.onrender.com/api/students/set-role"
          : "https://skillable-pdv0.onrender.com/api/teachers/set-role";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, role: tempSelectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to set role");
      }

      // Save role locally
      localStorage.setItem("userRole", tempSelectedRole);
      setShowRoleSelection(false);
      setSavingRole(false);

      if (tempSelectedRole === "TEACHER") {
        setSuccess("Role set to TEACHER. Redirecting to dashboard...");
        setOpenSnackbar(true);
        setIsRedirecting(true);

        setTimeout(() => {
          console.log("Redirecting to teacher dashboard");
          // Redirect to teacher dashboard without clearing auth data
          window.location.href = "/teacherdashboard";
        }, 1500);
      } else {
        setSuccess("Successfully registered as STUDENT!");
        setOpenSnackbar(true);

        setTimeout(() => {
          // Reload to reset all state for student
          window.location.reload();
        }, 1500);
      }

    } catch (err) {
      console.error("Error setting role:", err);
      setError(err.message || "Failed to set role");
      setOpenSnackbar(true);
      setSavingRole(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccess("");
  };

  const handleCloseProfileModal = () => {
    // Don't allow closing if profile is incomplete
    if (!isProfileComplete()) {
      setError("Please complete your profile before proceeding");
      setOpenSnackbar(true);
      return;
    }
    setOpenProfileModal(false);
  };

  const isProfileComplete = () => {
    if (!userProfile) return false;
    const complete = !!(userProfile.firstName && userProfile.lastName && userProfile.dateOfBirth);
    return complete;
  };

  // FIXED: Navigation function - completely simplified
  const handleStartModule = (moduleId) => {
    console.log("Starting module:", moduleId);
    
    // Use a simple navigation without any complex logic
    navigate(`/module/${moduleId}`);
  };

  // Handle module image click
  const handleModuleClick = (moduleRoute) => {
    console.log(`Navigating to module: ${moduleRoute}`);
    navigate(`/module/${moduleRoute}`);
  };

  // Handle module hover
  const handleModuleHover = (index) => {
    setHoveredModule(index);
  };

  const handleModuleLeave = () => {
    setHoveredModule(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}>
        <CircularProgress sx={{ color: "#4a6cf7" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
        height: "100vh",
        overflowY: "hidden"
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <Background />
      </div>
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Navbar />
        
        <Container maxWidth="lg" sx={{ paddingTop: { xs: 3, sm: 4, md: 5 }, paddingBottom: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}> 
        <Paper 
          sx={{ 
            padding: { xs: 1, sm: 2 }, 
            backgroundColor: "transparent",
            mb: { xs: 2, sm: 3, md: 4 },
            boxShadow: "none",
            marginLeft: { xs: 0, sm: '-20px', md: '-40px', lg: '-200px' }
          }}
        >
          <AudioToggleButton audioPlaying={audioPlaying} toggleAudio={toggleAudio} />
          
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ 
            justifyContent: 'center',
          }}>
            {moduleImages.map((image, index) => (
              <Grid item key={index} xs={12} sm={6} md={4} lg={3} sx={{ 
                display: 'flex',
                justifyContent: 'center',
                width: '100%'
              }}>
                <Box
                  onClick={() => handleModuleClick(moduleRoutes[index])}
                  onMouseEnter={() => handleModuleHover(index)}
                  onMouseLeave={handleModuleLeave}
                  sx={{
                    position: 'relative',
                    height: { xs: '240px', sm: '260px', md: '280px' },
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '280px', md: '260px' },
                    borderRadius: { xs: '12px', sm: '15px', md: '20px' },
                    overflow: 'visible',
                    margin: '0 auto',
                    transition: 'transform 0.3s ease, scale 0.3s ease',
                    cursor: 'pointer',
                    transform: hoveredModule === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center center',
                    zIndex: hoveredModule === index ? 2 : 1,
                    '&:hover': {
                      transform: { xs: 'scale(1.02)', sm: 'scale(1.05)' },
                      zIndex: 2,
                    }
                  }}
                >
                  {/* Continuous sparkle effects while hovering */}
                  {sparklePositions.map((position, sparkleIndex) => (
                    <Sparkle 
                      key={sparkleIndex} 
                      position={position} 
                      index={sparkleIndex}
                      isActive={hoveredModule === index}
                    />
                  ))}
                  
                  <Box
                    component="img"
                    src={image}
                    alt={moduleTitles[index]}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      backgroundColor: 'transparent',
                      borderRadius: { xs: '12px', sm: '15px', md: '20px' },
                      position: 'relative',
                      zIndex: 1,
                      transition: 'transform 0.3s ease',
                      transform: hoveredModule === index ? 'scale(1.02)' : 'scale(1)',
                      transformOrigin: 'center center',
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
        </Container>
      </div>

      {/* Profile Modal */}
      <Modal
        open={openProfileModal}
        onClose={handleCloseProfileModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={openProfileModal}>
          <Paper
            sx={{
              width: { xs: '90%', sm: '450px' },
              p: 4,
              outline: 'none',
              borderRadius: '20px',
              boxShadow: "0 10px 40px rgba(74, 108, 247, 0.15)",
              border: '2px solid #4a6cf7',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={600} color="#4a6cf7">
                {isProfileComplete() ? 'Edit Your Profile' : 'Complete Your Profile'}
              </Typography>
              {isProfileComplete() && (
                <IconButton
                  edge="end"
                  onClick={handleCloseProfileModal}
                  aria-label="close"
                  sx={{
                    color: "#4a6cf7",
                    backgroundColor: "rgba(74, 108, 247, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(74, 108, 247, 0.2)",
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            <Divider sx={{ mb: 3, backgroundColor: "#4a6cf7", height: 2 }} />
            
            <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ 
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& fieldset": {
                      borderColor: "#4a6cf7",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "#3a5ce5",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4a6cf7",
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#4a6cf7",
                    "&.Mui-focused": {
                      color: "#4a6cf7",
                    }
                  }
                }}
              />
              <TextField
                required
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ 
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& fieldset": {
                      borderColor: "#4a6cf7",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "#3a5ce5",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4a6cf7",
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#4a6cf7",
                    "&.Mui-focused": {
                      color: "#4a6cf7",
                    }
                  }
                }}
              />
              <TextField
                required
                fullWidth
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ 
                  mb: 3,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    "& fieldset": {
                      borderColor: "#4a6cf7",
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "#3a5ce5",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4a6cf7",
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#4a6cf7",
                    "&.Mui-focused": {
                      color: "#4a6cf7",
                    }
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 2, 
                  height: "50px",
                  borderRadius: "10px",
                  backgroundColor: "#4a6cf7",
                  fontSize: "16px",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(74, 108, 247, 0.3)",
                  "&:hover": {
                    backgroundColor: "#3a5ce5",
                    boxShadow: "0 6px 20px rgba(74, 108, 247, 0.4)",
                    transform: "translateY(-1px)",
                  }
                }}
              >
                {isProfileComplete() ? 'Update Profile' : 'Save Profile'}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>

      {/* Role Selection Modal */}
      <Modal
        open={showRoleSelection}
        closeAfterTransition
        BackdropComponent={Backdrop}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={showRoleSelection}>
          <Paper
            sx={{
              width: { xs: '90%', sm: '480px' },
              p: 3,
              outline: 'none',
              borderRadius: '20px',
              boxShadow: "0 10px 40px rgba(74, 108, 247, 0.15)",
              border: '2px solid #4a6cf7',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 1.5 }}>
              <Typography variant="h5" fontWeight={600} color="#4a6cf7" gutterBottom>
                Choose Your Role
              </Typography>
              <Typography variant="body2" color="#4a5568">
                Are you joining as a student or a teacher?
              </Typography>
            </Box>

            <Divider sx={{ my: 2, backgroundColor: "#4a6cf7", height: 2 }} />

            <Box sx={{ mb: 2.5, px: 2 }}>
              <Card
                onClick={() => handleRoleCardClick('STUDENT')}
                sx={{
                  p: 2.5,
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  border: tempSelectedRole === 'STUDENT' ? '3px solid #4a6cf7' : '2px solid #e0e0e0',
                  borderRadius: '15px',
                  backgroundColor: tempSelectedRole === 'STUDENT' ? 'rgba(74, 108, 247, 0.05)' : 'white',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 25px rgba(74, 108, 247, 0.2)',
                    borderColor: '#4a6cf7',
                  }
                }}
              >
                {tempSelectedRole === 'STUDENT' && (
                  <CheckCircleIcon 
                    sx={{ 
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      color: '#4a6cf7',
                      fontSize: 28
                    }} 
                  />
                )}
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(74, 108, 247, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 36, color: '#4a6cf7' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="#2d3748" gutterBottom>
                  Student
                </Typography>
                <Typography variant="body2" color="#4a5568">
                  I'm here to learn and complete educational modules
                </Typography>
              </Card>

              <Card
                onClick={() => handleRoleCardClick('TEACHER')}
                sx={{
                  p: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  border: tempSelectedRole === 'TEACHER' ? '3px solid #22c55e' : '2px solid #e0e0e0',
                  borderRadius: '15px',
                  backgroundColor: tempSelectedRole === 'TEACHER' ? 'rgba(34, 197, 94, 0.05)' : 'white',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.2)',
                    borderColor: '#22c55e',
                  }
                }}
              >
                {tempSelectedRole === 'TEACHER' && (
                  <CheckCircleIcon 
                    sx={{ 
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      color: '#22c55e',
                      fontSize: 28
                    }} 
                  />
                )}
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 36, color: '#22c55e' }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="#2d3748" gutterBottom>
                  Teacher
                </Typography>
                <Typography variant="body2" color="#4a5568">
                  I'm here to teach and manage students
                </Typography>
              </Card>
            </Box>

            <Box sx={{ px: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveRole}
                disabled={!tempSelectedRole || savingRole || isRedirecting}
                sx={{ 
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "#4a6cf7",
                  fontSize: "15px",
                  fontWeight: 600,
                  boxShadow: "0 4px 15px rgba(74, 108, 247, 0.3)",
                  "&:hover": {
                    backgroundColor: "#3a5ce5",
                    boxShadow: "0 6px 20px rgba(74, 108, 247, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    backgroundColor: "#cbd5e0",
                    color: "#718096"
                  }
                }}
              >
                {savingRole ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Save Role'
                )}
              </Button>

              <Typography variant="caption" color="#718096" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
                Click on a card to select your role, then click Save
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Modal>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? "success" : "error"}
          sx={{ width: "100%", borderRadius: "10px" }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default StudentDashboard;