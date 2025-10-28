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
import module1 from "../assets/hygiene.png"
import module2 from "../assets/culinary-skills.jpg"
import module3 from "../assets/chores.jpg"
import { 
  getAllModuleProgress
} from '../services/progressService';
import AudioToggleButton from "../components/background music/AudioToggleButton";
import backgroundMusic from '../assets/background-music.mp3';

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
  const [selectedRole, setSelectedRole] = useState(null);
  const [tempSelectedRole, setTempSelectedRole] = useState(null);
  const [modules, setModules] = useState([]);
  const [moduleProgress, setModuleProgress] = useState({});
  const [loadingModules, setLoadingModules] = useState(false);
  const [savingRole, setSavingRole] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Use the simple audio hook
  const { audioPlaying, toggleAudio } = useSimpleAudio(backgroundMusic);
  const navigate = useNavigate();
  
  // Refs to track navigation state and prevent loops
  const navigationBlockedRef = useRef(false);
  const authCheckedRef = useRef(false);
  const profileModalShownRef = useRef(false);
  const roleSelectionShownRef = useRef(false);
  const modulesFetchedRef = useRef(false);

  const moduleImages = [
    module1,
    module2,
    module3
  ];

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
      const response = await fetch(`http://localhost:8080/api/students/profile?email=${email}`, {
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
      const availableResponse = await fetch("http://localhost:8080/api/modules/available", {
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
      const response = await fetch("http://localhost:8080/api/students/update", {
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
          ? "http://localhost:8080/api/students/set-role"
          : "http://localhost:8080/api/teachers/set-role";

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
      setSelectedRole(tempSelectedRole);
      setShowRoleSelection(false);
      setSavingRole(false);

      if (tempSelectedRole === "TEACHER") {
        setSuccess("Role set to TEACHER. Redirecting to login...");
        setOpenSnackbar(true);
        setIsRedirecting(true);

        setTimeout(() => {
          console.log("Clearing auth data and redirecting to login");
          // Clear ALL authentication data
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userRole");
          localStorage.removeItem("studentId");
          localStorage.removeItem("teacherId");
          localStorage.removeItem("isAdmin");
          
          // Use window.location for hard redirect to ensure complete cleanup
          window.location.href = "/login";
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

  const getModuleButtonText = (moduleId) => {
    const progress = moduleProgress[moduleId];
    if (!progress) return "Start Learning";
    
    if (progress.completed) return "Review Module";
    
    return progress.completedLessons > 0 ? "Continue Learning" : "Start Learning";
  };

  const getModuleImage = (index) => {
    const image = moduleImages[index % moduleImages.length];
    return image || module1;
  };

  const getProgressPercentage = (moduleId) => {
    const progress = moduleProgress[moduleId];
    if (!progress || !progress.totalLessons || progress.totalLessons === 0) return 0;
    return Math.round((progress.completedLessons / progress.totalLessons) * 100);
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
        
        <Container maxWidth="lg" sx={{ paddingTop: 5, paddingBottom: 5 }}> 
          <Paper 
            sx={{ 
              padding: 2, 
              backgroundColor: "transparent",
              mb: 4,
              boxShadow: "none"
            }}
          >
            <AudioToggleButton audioPlaying={audioPlaying} toggleAudio={toggleAudio} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" color="#2d3748" fontWeight={600} gutterBottom>
                Your Learning Modules
              </Typography>
            </Box>
            
            {loadingModules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={40} sx={{ color: "#4a6cf7" }} />
              </Box>
            ) : modules.length > 0 ? (
              <Grid container spacing={4} sx={{ justifyContent: 'center'}}>
                {modules.map((module, index) => {
                  const progress = moduleProgress[module.id];
                  const progressPercentage = getProgressPercentage(module.id);
                  
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={module.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card 
                        sx={{ 
                          height: '535px', 
                          width: '339px',
                          display: 'flex', 
                          flexDirection: 'column',
                          borderRadius: '15px',
                          overflow: 'hidden',
                          margin: '0 auto',
                          backgroundColor: 'white',
                          boxShadow: "none",
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            sx={{
                              height: 200,
                              objectFit: 'cover',
                              transition: 'transform 0.6s ease',
                              '&:hover': {
                                transform: 'scale(1.1)'
                              }
                            }}
                            image={getModuleImage(index)}
                            alt={`${module.name || 'Module'} cover`}
                            onError={(e) => {
                              e.target.src = module1;
                            }}
                          />
                          
                          {progress && (
                            <Chip
                              label={`${progressPercentage}%`}
                              sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                backgroundColor: progress.completed ? '#4caf50' : '#4a6cf7',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                '& .MuiChip-label': {
                                  px: 1.5
                                }
                              }}
                            />
                          )}
                          
                          {progress?.completed && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 16,
                                left: 16,
                                backgroundColor: '#4caf50',
                                color: 'white',
                                borderRadius: '12px',
                                padding: '4px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}
                            >
                              ✓ Completed
                            </Box>
                          )}
                        </Box>

                        <CardContent sx={{ flexGrow: 1, pb: 1, px: 3, pt: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6">
                              {module.name || "Module"}
                            </Typography>
                          </Box>
                          <Typography gutterBottom variant="h6" component="div" fontWeight={600}>
                            {module.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {module.description}
                          </Typography>
                          
                          <Box sx={{ mt: 2, mb: 2 }}>
                            {progress ? (
                              <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                    Progress:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {progress.completedLessons || 0}/{progress.totalLessons || 0} Lessons
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={progressPercentage} 
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 4,
                                    mb: 2,
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: progress.completed ? '#4caf50' : '#4a6cf7'
                                    }
                                  }}
                                />
                                
                                <Grid container spacing={2} sx={{ mb: 1 }}>
                                  <Grid item xs={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <StarIcon sx={{ color: '#f59e0b', fontSize: 16, mr: 0.5 }} />
                                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        {progress.totalStars || 0} Stars
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={6}>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                      {progress.averageScore ? Math.round(progress.averageScore) + '% Avg' : 'No Score'}
                                    </Typography>
                                  </Grid>
                                </Grid>

                                {progress.completed && (
                                  <Chip
                                    label="Completed"
                                    color="success"
                                    size="small"
                                    sx={{ fontWeight: 500 }}
                                  />
                                )}
                              </>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 500 }}>
                                  Progress:
                                </Typography>
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: 8,
                                    backgroundColor: '#e9ecef',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    mr: 1
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: '0%',
                                      height: '100%',
                                      backgroundColor: '#4a6cf7',
                                      borderRadius: 4
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                  0%
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                        <CardActions sx={{ p: 3, pt: 0, mt: 'auto' }}>
                          <Button 
                            size="medium" 
                            variant="contained"
                            fullWidth
                            onClick={() => handleStartModule(module.id)}
                            endIcon={<ArrowForwardIcon />}
                            sx={{ 
                              borderRadius: "8px",
                              backgroundColor: progress?.completed ? "#4caf50" : "#4a6cf7",
                              py: 1,
                              "&:hover": {
                                backgroundColor: progress?.completed ? "#3d8b40" : "#3a5ce5"
                              },
                              textTransform: 'none',
                              fontWeight: 500
                            }}
                          >
                            {getModuleButtonText(module.id)}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ 
                p: 5, 
                textAlign: 'center', 
                backgroundColor: '#f8f9fa',
                borderRadius: '15px',
                border: '1px dashed #dee2e6'
              }}>
                <Typography variant="h6" color="#4a5568" gutterBottom>
                  No Modules Available
                </Typography>
                <Typography variant="body1" color="#4a5568" sx={{ mb: 3 }}>
                  No learning modules are available for you at the moment.
                </Typography>
              </Box>
            )}
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