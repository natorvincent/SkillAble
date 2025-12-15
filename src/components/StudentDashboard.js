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
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import InfoIcon from '@mui/icons-material/Info';
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
import sparkleImg from '../assets/sparkle.png';

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
    topLeft: { top: '-25px', left: '-25px' },
    topRight: { top: '-25px', right: '-25px' },
    bottomLeft: { bottom: '-25px', left: '-25px' },
    bottomRight: { bottom: '-25px', right: '-25px' },
    topCenter: { top: '-25px', left: '50%', transform: 'translateX(-50%)' },
    bottomCenter: { bottom: '-25px', left: '50%', transform: 'translateX(-50%)' },
    leftCenter: { top: '50%', left: '-25px', transform: 'translateY(-50%)' },
    rightCenter: { top: '50%', right: '-25px', transform: 'translateY(-50%)' },
    topLeftInner: { top: '20px', left: '20px' },
    topRightInner: { top: '20px', right: '20px' },
    bottomLeftInner: { bottom: '20px', left: '20px' },
    bottomRightInner: { bottom: '20px', right: '20px' },
    topMiddle: { top: '50px', left: '50%', transform: 'translateX(-50%)' },
    bottomMiddle: { bottom: '50px', left: '50%', transform: 'translateX(-50%)' },
    leftMiddle: { top: '50%', left: '50px', transform: 'translateY(-50%)' },
    rightMiddle: { top: '50%', right: '50px', transform: 'translateY(-50%)' },
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
  
  const { audioPlaying, toggleAudio } = useSimpleAudio(backgroundMusic);
  const navigate = useNavigate();
  
  const authCheckedRef = useRef(false);
  const profileModalShownRef = useRef(false);
  const roleSelectionShownRef = useRef(false);
  const modulesFetchedRef = useRef(false);

  const moduleImages = [hygieneImg, cookingImg, householdImg];
  const moduleTitles = ["Hygiene", "Cooking", "Household"];
  const moduleRoutes = [1, 2, 3];

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

    setTimeout(checkAuthentication, 0);
  }, [navigate]);

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
      
      const studentId = localStorage.getItem('studentId') || userProfile?.id;
      const progressMap = await getAllModuleProgress(studentId, modulesData);
      
      setModuleProgress(progressMap);
      setModules(modulesData);
      setLoadingModules(false);
      
    } catch (err) {
      console.error("Error fetching modules:", err);
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

      setUserProfile(prev => ({
        ...prev,
        firstName,
        lastName,
        dateOfBirth
      }));

      setSuccess("Profile information saved!");
      setOpenSnackbar(true);
      setOpenProfileModal(false);
      
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

      localStorage.setItem("userRole", tempSelectedRole);
      setShowRoleSelection(false);
      setSavingRole(false);

      if (tempSelectedRole === "TEACHER") {
        setSuccess("Role set to TEACHER. Redirecting to dashboard...");
        setOpenSnackbar(true);
        setIsRedirecting(true);

        setTimeout(() => {
          console.log("Redirecting to teacher dashboard");
          window.location.href = "/teacherdashboard";
        }, 1500);
      } else {
        setSuccess("Successfully registered as STUDENT!");
        setOpenSnackbar(true);

        setTimeout(() => {
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

  const handleModuleClick = (moduleRoute) => {
    console.log(`Navigating to module: ${moduleRoute}`);
    navigate(`/module/${moduleRoute}`);
  };

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
        width: "100%",
        height: "100vh", // Full viewport height
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
      
      {/* Main scrollable content area */}
      <div style={{ 
        position: "relative", 
        zIndex: 1, 
        height: "100vh", // Full viewport height
        overflowY: "auto", // Vertical scrollbar on the right
        overflowX: "hidden", // Prevent horizontal scrolling
      }}>
        <Navbar />
        
        <Container maxWidth="lg" sx={{ 
          paddingTop: { xs: 3, sm: 4, md: 5 }, 
          paddingBottom: { xs: 3, sm: 4, md: 5 }, 
          px: { xs: 2, sm: 3 },
          minHeight: "calc(100vh - 64px)", // Adjust based on Navbar height
          display: "flex",
          flexDirection: "column",
        }}> 
          <Paper 
            sx={{ 
              padding: { xs: 2, sm: 3, md: 4 }, 
              backgroundColor: "transparent",
              width: "100%",
              boxShadow: "none",
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <Box sx={{ 
              width: "100%", 
              display: "flex", 
              justifyContent: "flex-end",
              mb: 3 
            }}>
              <AudioToggleButton audioPlaying={audioPlaying} toggleAudio={toggleAudio} />
            </Box>
            
            {/* Grid Modules Section - 3 modules per row */}
            <Box sx={{ 
              width: "100%",
              py: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}>
              <Grid 
                container 
                spacing={{ xs: 2, sm: 3, md: 4 }}
                justifyContent="center"
                alignItems="center"
              >
                {moduleImages.map((image, index) => (
                  <Grid 
                    item 
                    key={index} 
                    xs={12} 
                    sm={6} 
                    md={4} // 3 items per row on medium screens and up
                    sx={{ 
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      onClick={() => handleModuleClick(moduleRoutes[index])}
                      onMouseEnter={() => handleModuleHover(index)}
                      onMouseLeave={handleModuleLeave}
                      sx={{
                        position: 'relative',
                        height: { xs: '240px', sm: '280px', md: '320px' },
                        width: { xs: '240px', sm: '280px', md: '320px' },
                        borderRadius: { xs: '16px', sm: '20px', md: '24px' },
                        overflow: 'visible',
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
                          borderRadius: { xs: '16px', sm: '20px', md: '24px' },
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
            </Box>
          </Paper>
        </Container>
      </div>

      {/* Updated Profile Modal - Clean Design */}
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
          backdropFilter: 'blur(4px)',
        }}
      >
        <Fade in={openProfileModal}>
          <Paper
            sx={{
              width: { xs: '90%', sm: '450px', md: '500px' },
              p: 4,
              outline: 'none',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              background: 'white',
              position: 'relative',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                fontWeight={700} 
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2rem' },
                  color: '#4a6cf7',
                  mb: 0.5,
                }}
              >
                SkillAble
              </Typography>
              <Divider sx={{ mb: 2, backgroundColor: '#e5e7eb' }} />
              <Typography 
                variant="h5" 
                fontWeight={600} 
                sx={{ 
                  color: '#374151',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                Complete Your Profile
              </Typography>
            </Box>

            {/* Form content */}
            <Box component="form" onSubmit={handleFormSubmit} sx={{ width: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  sx={{ 
                    color: '#374151',
                    mb: 1.5,
                    fontSize: '0.95rem',
                  }}
                >
                  First Name
                </Typography>
                <TextField
                  required
                  fullWidth
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  variant="outlined"
                  sx={{ 
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: '#f9fafb',
                      "& fieldset": {
                        borderColor: "#e5e7eb",
                        borderWidth: 1,
                      },
                      "&:hover fieldset": {
                        borderColor: "#d1d5db",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4a6cf7",
                        borderWidth: 2,
                      }
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: '12px 16px',
                      color: '#374151',
                    },
                    "& .MuiInputLabel-root": {
                      color: "#6b7280",
                      "&.Mui-focused": {
                        color: "#4a6cf7",
                      }
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  sx={{ 
                    color: '#374151',
                    mb: 1.5,
                    fontSize: '0.95rem',
                  }}
                >
                  Last Name
                </Typography>
                <TextField
                  required
                  fullWidth
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  variant="outlined"
                  sx={{ 
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: '#f9fafb',
                      "& fieldset": {
                        borderColor: "#e5e7eb",
                        borderWidth: 1,
                      },
                      "&:hover fieldset": {
                        borderColor: "#d1d5db",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4a6cf7",
                        borderWidth: 2,
                      }
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: '12px 16px',
                      color: '#374151',
                    },
                    "& .MuiInputLabel-root": {
                      color: "#6b7280",
                      "&.Mui-focused": {
                        color: "#4a6cf7",
                      }
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  sx={{ 
                    color: '#374151',
                    mb: 1.5,
                    fontSize: '0.95rem',
                  }}
                >
                  Date of Birth
                </Typography>
                <TextField
                  required
                  fullWidth
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ 
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: '#f9fafb',
                      "& fieldset": {
                        borderColor: "#e5e7eb",
                        borderWidth: 1,
                      },
                      "&:hover fieldset": {
                        borderColor: "#d1d5db",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4a6cf7",
                        borderWidth: 2,
                      }
                    },
                    "& .MuiOutlinedInput-input": {
                      padding: '12px 16px',
                      color: '#374151',
                      "&::placeholder": {
                        color: '#9ca3af',
                      }
                    },
                    "& .MuiInputLabel-root": {
                      color: "#6b7280",
                      "&.Mui-focused": {
                        color: "#4a6cf7",
                      }
                    }
                  }}
                />
              </Box>

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!firstName || !lastName || !dateOfBirth}
                sx={{ 
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "#4a6cf7",
                  fontSize: "16px",
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  "&:hover": {
                    backgroundColor: "#3a5ce5",
                    boxShadow: '0 4px 12px rgba(74, 108, 247, 0.3)',
                    transform: "translateY(-1px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    backgroundColor: '#e5e7eb',
                    color: '#9ca3af',
                    transform: 'none',
                  },
                }}
              >
                SAVE PROFILE
              </Button>

              {/* Footer note */}
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6b7280', 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 3,
                  fontSize: '0.75rem',
                }}
              >
                Your information helps us personalize your learning experience
              </Typography>
            </Box>

            {/* Close button for completed profile */}
            {isProfileComplete() && (
              <IconButton
                edge="end"
                onClick={handleCloseProfileModal}
                aria-label="close"
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: "#9ca3af",
                  "&:hover": {
                    color: "#4a6cf7",
                    backgroundColor: "rgba(74, 108, 247, 0.1)",
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
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
          backdropFilter: 'blur(8px)',
        }}
      >
        <Fade in={showRoleSelection}>
          <Paper
            sx={{
              width: { xs: '90%', sm: '480px', md: '520px' },
              p: 0,
              outline: 'none',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(74, 108, 247, 0.25)',
              border: 'none',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                py: { xs: 2.5, sm: 3 },
                px: { xs: 2.5, sm: 3 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -20,
                  left: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  color="white" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '1.75rem' },
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  🎯 Almost There!
                </Typography>
                <Typography 
                  variant="body1" 
                  color="rgba(255, 255, 255, 0.9)"
                  sx={{ mt: 0.5 }}
                >
                  Choose how you'll use Skillable
                </Typography>
              </Box>
            </Box>

            {/* Progress indicator */}
            <Box sx={{ px: { xs: 2.5, sm: 3 }, pt: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#718096', 
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 600,
                }}
              >
                Step 2 of 2
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 3 }}>
                <Box sx={{ flex: 1, height: 6, bgcolor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      bgcolor: '#22c55e',
                      borderRadius: 3,
                      boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)',
                    }} 
                  />
                </Box>
                <Typography variant="caption" sx={{ ml: 2, color: '#22c55e', fontWeight: 600 }}>
                  100%
                </Typography>
              </Box>
            </Box>

            {/* Role selection content */}
            <Box sx={{ px: { xs: 2.5, sm: 3 }, pb: 4 }}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  fontWeight={600} 
                  sx={{ 
                    color: '#2d3748',
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                    mb: 0.5,
                  }}
                >
                  Select Your Role
                </Typography>
                <Typography variant="body2" sx={{ color: '#718096' }}>
                  Choose the experience that matches your goals
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Card
                  onClick={() => handleRoleCardClick('STUDENT')}
                  sx={{
                    p: 3,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    border: tempSelectedRole === 'STUDENT' ? '3px solid #4a6cf7' : '2px solid #e2e8f0',
                    borderRadius: '16px',
                    backgroundColor: tempSelectedRole === 'STUDENT' ? 'rgba(74, 108, 247, 0.05)' : 'white',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 30px rgba(74, 108, 247, 0.2)',
                      borderColor: '#4a6cf7',
                      backgroundColor: 'rgba(74, 108, 247, 0.02)',
                    }
                  }}
                >
                  {tempSelectedRole === 'STUDENT' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: '#4a6cf7',
                        color: 'white',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(74, 108, 247, 0.4)',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </Box>
                  )}
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(74, 108, 247, 0.15) 0%, rgba(74, 108, 247, 0.25) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 40, color: '#4a6cf7' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#2d3748', mb: 1 }}>
                    Student
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                    I'm here to learn and complete educational modules
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#4a6cf7', bgcolor: 'rgba(74, 108, 247, 0.1)', px: 1.5, py: 0.5, borderRadius: 4 }}>
                      Interactive Lessons
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#4a6cf7', bgcolor: 'rgba(74, 108, 247, 0.1)', px: 1.5, py: 0.5, borderRadius: 4 }}>
                      Progress Tracking
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#4a6cf7', bgcolor: 'rgba(74, 108, 247, 0.1)', px: 1.5, py: 0.5, borderRadius: 4 }}>
                      Skill Building
                    </Typography>
                  </Box>
                </Card>

                <Card
                  onClick={() => handleRoleCardClick('TEACHER')}
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    border: tempSelectedRole === 'TEACHER' ? '3px solid #22c55e' : '2px solid #e2e8f0',
                    borderRadius: '16px',
                    backgroundColor: tempSelectedRole === 'TEACHER' ? 'rgba(34, 197, 94, 0.05)' : 'white',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 30px rgba(34, 197, 94, 0.2)',
                      borderColor: '#22c55e',
                      backgroundColor: 'rgba(34, 197, 94, 0.02)',
                    }
                  }}
                >
                  {tempSelectedRole === 'TEACHER' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: '#22c55e',
                        color: 'white',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.4)',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </Box>
                  )}
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.25) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 40, color: '#22c55e' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#2d3748', mb: 1 }}>
                    Teacher
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096', mb: 2 }}>
                    I'm here to teach and manage students
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#22c55e', bgcolor: 'rgba(34, 197, 94, 0.1)', px: 1.5, py: 0.5, borderRadius: 4 }}>
                      Class Management
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#22c55e', bgcolor: 'rgba(34, 197, 94, 0.1)', px: 1.5, py: 0.5, borderRadius: 4 }}>
                      Progress Monitoring
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#22c55e', bgcolor: 'rgba(34, 197, 94, 0.1)', px: 1.5, py: 0.5, borderRadius: 4 }}>
                      Assign Modules
                    </Typography>
                  </Box>
                </Card>
              </Box>

              {/* Helper text */}
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '12px',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <InfoIcon sx={{ color: '#22c55e', mr: 1.5, mt: 0.25 }} />
                  <Box>
                    <Typography variant="caption" fontWeight={600} sx={{ color: '#166534', display: 'block' }}>
                      You can always change this later
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#22c55e' }}>
                      Don't worry if you're not sure - you can switch roles from your profile settings.
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Action buttons */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveRole}
                disabled={!tempSelectedRole || savingRole || isRedirecting}
                sx={{ 
                  height: "56px",
                  borderRadius: "14px",
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  fontSize: "16px",
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.5)',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  },
                  "&:disabled": {
                    background: '#e2e8f0',
                    color: '#a0aec0',
                    transform: 'none',
                    boxShadow: 'none',
                  },
                  "&:after": {
                    content: '""',
                    position: 'absolute',
                    top: '-50%',
                    left: '-60%',
                    width: '20%',
                    height: '200%',
                    opacity: 0,
                    transform: 'rotate(30deg)',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                    transition: 'none',
                  },
                  "&:hover:after": {
                    animation: 'shimmer 0.8s ease',
                  },
                }}
              >
                {savingRole ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : isRedirecting ? (
                  'Redirecting...'
                ) : (
                  `Start as ${tempSelectedRole || 'Your Role'} →`
                )}
              </Button>

              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#718096', 
                  display: 'block', 
                  textAlign: 'center', 
                  mt: 2,
                  fontSize: '0.75rem',
                }}
              >
                {tempSelectedRole === 'STUDENT' ? 'Start learning with interactive modules' : 
                 tempSelectedRole === 'TEACHER' ? 'Begin managing your classroom' : 
                 'Select a role to continue'}
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
          sx={{ 
            width: "100%", 
            borderRadius: "12px",
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default StudentDashboard;