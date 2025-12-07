import { useState, useEffect } from "react";
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
  Avatar,
  Divider,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  LinearProgress,
  Stack
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import CheckCircle from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import Navbar from "./Navbar";
import Background from "./Background";
import module1 from "../assets/hygiene.png"
import module2 from "../assets/culinary-skills.jpg"
import module3 from "../assets/household.jpg"
import { 
  getStudentModuleProgress,
  getStudentModuleProgressStats,
  getStudentLessonProgress 
} from '../services/progressService';
import { useGlobalBackgroundMusic } from "../components/background music/useGlobalBackgroundMusic";
import AudioToggleButton from "../components/background music/AudioToggleButton";
import backgroundMusic from '../assets/background-music.mp3';

function Homepage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [modules, setModules] = useState([]);
  const [moduleProgress, setModuleProgress] = useState({});
  const [loadingModules, setLoadingModules] = useState(false);
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [completionRate, setCompletionRate] = useState(0);
  const [loadingCompletionRate, setLoadingCompletionRate] = useState(false);
  const { audioPlaying, toggleAudio } = useGlobalBackgroundMusic(backgroundMusic);
  const navigate = useNavigate();

  const moduleImages = [
    module1,
    module2,
    module3
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }

    fetchUserProfile(userEmail);
  }, [navigate]);

  useEffect(() => {
    if (userProfile && !isProfileComplete()) {
      setOpenProfileModal(true);
    } else if (userProfile && isProfileComplete()) {
      if (userProfile.userType === "STUDENT") {
        fetchModules();
      } else if (userProfile.userType === "TEACHER") {
        fetchTeacherData();
      }
    }
  }, [userProfile]);

  const fetchUserProfile = async (email) => {
    try {
      let response = await fetch(`https://skillable-pdv0.onrender.com/api/students/profile?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        response = await fetch(`https://skillable-pdv0.onrender.com/api/teachers/profile?email=${email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
      }

      const profileData = await response.json();
      setUserProfile(profileData);
      
      if (profileData.userType === "STUDENT") {
        setFirstName(profileData.firstName || "");
        setLastName(profileData.lastName || "");
        setDateOfBirth(profileData.dateOfBirth || "");
        
        if (profileData.id && !localStorage.getItem('studentId')) {
          localStorage.setItem('studentId', profileData.id);
        }
      } else if (profileData.userType === "TEACHER") {
        setTeacherName(profileData.name || "");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Unable to load your profile. Please log in again.");
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const fetchTeacherData = async () => {
    await Promise.all([fetchModules(), fetchEnrolledStudents(), fetchCompletionRate()]);
  };

  const fetchEnrolledStudents = async () => {
    if (!userProfile || userProfile.userType !== "TEACHER") return;
    
    setLoadingStudents(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/teachers/students?email=${userEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch enrolled students");
      }

      const studentsData = await response.json();
      setEnrolledStudentsCount(studentsData.length);
      setLoadingStudents(false);
    } catch (err) {
      console.error("Error fetching enrolled students:", err);
      setEnrolledStudentsCount(0);
      setLoadingStudents(false);
    }
  };
   const fetchCompletionRate = async () => {
    if (!userProfile || userProfile.userType !== "TEACHER") return;
    
    setLoadingCompletionRate(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/progress/teacher/${userEmail}/completion-rate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch completion rate");
      }

      const completionData = await response.json();
      setCompletionRate(Math.round(completionData.averageCompletionRate));
      setLoadingCompletionRate(false);
    } catch (err) {
      console.error("Error fetching completion rate:", err);
      setCompletionRate(0);
      setLoadingCompletionRate(false);
    }
  };
  const fetchModuleProgress = async (moduleId, studentId) => {
    try {
      const moduleProgressResponse = await getStudentModuleProgress(studentId, moduleId);
      return moduleProgressResponse;
    } catch (error) {
      console.error(`Error fetching progress for module ${moduleId}:`, error);
      return null;
    }
  };

  const fetchModules = async () => {
    setLoadingModules(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      
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
      
      if (userProfile?.userType === "STUDENT") {
        const studentId = localStorage.getItem('studentId') || userProfile.id;
        
        const moduleProgressPromises = modulesData.map(async (module) => {
          const progress = await fetchModuleProgress(module.id, studentId);
          return { moduleId: module.id, progress };
        });
        
        const progressResults = await Promise.all(moduleProgressPromises);
        const progressMap = {};
        progressResults.forEach(result => {
          progressMap[result.moduleId] = result.progress;
        });
        
        setModuleProgress(progressMap);
      }
      
      setModules(modulesData);
      setLoadingModules(false);
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError("Failed to load modules. Please try again.");
      setOpenSnackbar(true);
      setLoadingModules(false);
    }
  };

  const handleStudentFormSubmit = async (e) => {
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

      setSuccess("Profile updated successfully!");
      setOpenSnackbar(true);
      setOpenProfileModal(false);
      
      fetchUserProfile(userEmail);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setOpenSnackbar(true);
    }
  };

  const handleTeacherFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!teacherName) {
      setError("Name is required");
      setOpenSnackbar(true);
      return;
    }

    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch("https://skillable-pdv0.onrender.com/api/teachers/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userEmail,
          name: teacherName
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setOpenSnackbar(true);
      setOpenProfileModal(false);
      
      fetchUserProfile(userEmail);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleOpenProfileModal = () => {
    setOpenProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    if (isProfileComplete()) {
      setOpenProfileModal(false);
    } else {
      setError("Please complete your profile before proceeding");
      setOpenSnackbar(true);
    }
  };

  const isProfileComplete = () => {
    if (!userProfile) return false;
    
    if (userProfile.userType === "STUDENT") {
      return userProfile.firstName && userProfile.lastName && userProfile.dateOfBirth;
    } else if (userProfile.userType === "TEACHER") {
      return userProfile.name;
    }
    
    return false;
  };

  const handleStartModule = (moduleId) => {
    navigate(`/module/${moduleId}`);
  };

  const getModuleButtonText = (moduleId) => {
    const progress = moduleProgress[moduleId];
    if (!progress) return "Start Learning";
    
    if (progress.completed) return "Review Module";
    
    return progress.completedLessons > 0 ? "Continue Learning" : "Start Learning";
  };

  const getModuleImage = (index) => {
    return moduleImages[index % moduleImages.length];
  };

  const getProgressPercentage = (moduleId) => {
    const progress = moduleProgress[moduleId];
    if (!progress || progress.totalLessons === 0) return 0;
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
        
        <Container maxWidth="lg" sx={{ paddingTop: { xs: 3, sm: 4, md: 5 }, paddingBottom: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}> 
          {userProfile?.userType === "TEACHER" && (
            <Paper
              sx={{ 
                padding: { xs: 2, sm: 3, md: 4 }, 
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: { xs: "15px", sm: "20px" },
                mb: { xs: 2, sm: 3, md: 4 },
                boxShadow: "none",
                border: '1px solid #e0e0e0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3, md: 4 }, flexWrap: 'wrap' }}>
                <SchoolIcon sx={{ color: '#4a6cf7', mr: { xs: 1, sm: 2 }, fontSize: { xs: 28, sm: 32, md: 36 } }} />
                <Box>
                  <Typography variant="h4" color="#2d3748" fontWeight={700} sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
                    Teacher Dashboard
                  </Typography>
                  <Typography variant="body1" color="#4a5568" sx={{ mt: 0.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Welcome back, Teacher {userProfile.name || 'Teacher'}! Manage your modules and track student progress.
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: { xs: 2, sm: 2.5, md: 3 }, 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9ff',
                    border: '1px solid #e3e8ff',
                    boxShadow: "none"
                  }}>
                    <PlaylistAddCheckIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#4a6cf7', mb: 1 }} />
                    <Typography variant="h5" fontWeight={600} color="#2d3748" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
                      {modules.length}
                    </Typography>
                    <Typography variant="body2" color="#4a5568" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Total Modules
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: { xs: 2, sm: 2.5, md: 3 }, 
                    textAlign: 'center', 
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    boxShadow: "none"
                  }}>
                    <CheckCircle sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#22c55e', mb: 1 }} />
                    <Typography variant="h5" fontWeight={600} color="#2d3748" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
                      {modules.filter(m => m.active).length}
                    </Typography>
                    <Typography variant="body2" color="#4a5568" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Active Modules
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: { xs: 2, sm: 2.5, md: 3 }, 
                    textAlign: 'center', 
                    backgroundColor: '#fefce8',
                    border: '1px solid #fef08a',
                    boxShadow: "none"
                  }}>
                    <GroupIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#eab308', mb: 1 }} />
                    <Typography variant="h5" fontWeight={600} color="#2d3748" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
                      {loadingStudents ? (
                        <CircularProgress size={20} sx={{ color: '#eab308' }} />
                      ) : (
                        enrolledStudentsCount
                      )}
                    </Typography>
                    <Typography variant="body2" color="#4a5568" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Students Enrolled
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: { xs: 2, sm: 2.5, md: 3 }, 
                    textAlign: 'center', 
                    backgroundColor: '#fdf2f8',
                    border: '1px solid #fce7f3',
                    boxShadow: "none"
                  }}>
                    <AssessmentIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#ec4899', mb: 1 }} />
                    <Typography variant="h5" fontWeight={600} color="#2d3748" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }}>
                      {loadingCompletionRate ? (
                        <CircularProgress size={20} sx={{ color: '#ec4899' }} />
                      ) : (
                        `${completionRate}%`
                      )}
                    </Typography>
                    <Typography variant="body2" color="#4a5568" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      Avg. Completion Rate
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={() => navigate("/manageStudents")}
                  sx={{
                    borderRadius: "12px",
                    borderColor: "#4a6cf7",
                    color: "#4a6cf7",
                    py: 1.5,
                    px: 3,
                    "&:hover": {
                      borderColor: "#3a5ce5",
                      backgroundColor: "rgba(74, 108, 247, 0.05)"
                    },
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Manage Students
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate("/studentProgress")}
                  sx={{
                    borderRadius: "12px",
                    borderColor: "#22c55e",
                    color: "#22c55e",
                    py: 1.5,
                    px: 3,
                    "&:hover": {
                      borderColor: "#16a34a",
                      backgroundColor: "rgba(34, 197, 94, 0.05)"
                    },
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  View Analytics
                </Button>
              </Stack>
            </Paper>
          )}

          {userProfile?.userType === "STUDENT" && (
            <Paper 
              sx={{ 
                padding: 4, 
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
                <Typography variant="body1" color="#4a5568">
                  Continue your learning journey with these assigned modules.
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
                      <Grid item xs={12} sm={12} md={6} key={module.id}>
                        <Card 
                          sx={{ 
                            height: '550px', 
                            width: '450px',
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
                          <CardMedia
                            component="img"
                            sx={{
                              height: 180,
                              objectFit: 'cover'
                            }}
                            image={getModuleImage(index)}
                            alt={`${module.name || 'Module'} cover`}
                          />
                          <CardContent sx={{ flexGrow: 1, pb: 1, px: 3, pt: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" color="text.secondary">
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
                                      {progress.completedLessons}/{progress.totalLessons} Lessons
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
          )}
          
          {localStorage.getItem('isAdmin') === 'true' && (
            <Paper
              sx={{ 
                padding: 4, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "20px",
                mb: 4,
                boxShadow: "none",
                border: '1px solid #e0e0e0'
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <AdminPanelSettingsIcon sx={{ color: '#4a6cf7', mr: 2, fontSize: 32 }} />
                  <Typography variant="h5" color="#2d3748" fontWeight={600}>
                    Admin Access
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3 }} color="#4a5568">
                  As an administrator, you have full control over the platform. You can manage users, promote teachers, configure system settings, and oversee all learning content.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/admin")}
                  sx={{ 
                    borderRadius: "10px",
                    backgroundColor: "#4a6cf7",
                    py: 1.5,
                    px: 3,
                    "&:hover": {
                      backgroundColor: "#3a5ce5"
                    },
                    fontWeight: 500
                  }}
                >
                  Go to Admin Dashboard
                </Button>
              </Box>
            </Paper>
          )}
        </Container>
      </div>

      <Modal
        open={openProfileModal}
        onClose={handleCloseProfileModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(74, 108, 247, 0.1)', // Light blue backdrop instead of dark
          }
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
              boxShadow: "0 10px 40px rgba(74, 108, 247, 0.15)", // Bright blue shadow
              border: '2px solid #4a6cf7', // Blue border matching button
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)', // Subtle gradient
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={600} color="#4a6cf7"> {/* Blue text color */}
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

            <Divider sx={{ mb: 3, backgroundColor: "#4a6cf7", height: 2 }} /> {/* Blue divider */}
            
            {userProfile?.userType === "STUDENT" && (
              <Box component="form" onSubmit={handleStudentFormSubmit} sx={{ mt: 2 }}>
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
            )}

            {userProfile?.userType === "TEACHER" && (
              <Box component="form" onSubmit={handleTeacherFormSubmit} sx={{ mt: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
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
            )}
          </Paper>
        </Fade>
      </Modal>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
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

export default Homepage;