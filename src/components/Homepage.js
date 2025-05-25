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
import { 
  getStudentModuleProgress,
  getStudentModuleProgressStats,
  getStudentLessonProgress 
} from '../services/progressService';

function Homepage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [modules, setModules] = useState([]);
  const [moduleProgress, setModuleProgress] = useState({});
  const [loadingModules, setLoadingModules] = useState(false);
  const navigate = useNavigate();

  const moduleImages = [
    module1,
    module2 
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
      fetchModules();
    }
  }, [userProfile]);

  const fetchUserProfile = async (email) => {
    try {
      let response = await fetch(`http://localhost:8080/api/students/profile?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        response = await fetch(`http://localhost:8080/api/teachers/profile?email=${email}`, {
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
        setAge(profileData.age || "");
        
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
    if (!userProfile) return;
    
    setLoadingModules(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      const studentId = localStorage.getItem('studentId') || userProfile.id;
      
      let url = "http://localhost:8080/api/modules";
      
      if (userProfile.userType === "STUDENT") {
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
        setModules(modulesData);
      } else {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch modules");
        }
        
        const modulesData = await response.json();
        setModules(modulesData);
      }
      
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
    
    if (!firstName || !lastName || !age) {
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
          age: parseInt(age)
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
      const response = await fetch("http://localhost:8080/api/teachers/update", {
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
      return userProfile.firstName && userProfile.lastName && userProfile.age;
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
        
        <Container maxWidth="lg" sx={{ paddingTop: 5, paddingBottom: 5 }}> 
          {userProfile?.userType === "TEACHER" && (
            <Paper
              sx={{ 
                padding: 4, 
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                mb: 4,
                boxShadow: "none",
                border: '1px solid #e0e0e0'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <SchoolIcon sx={{ color: '#4a6cf7', mr: 2, fontSize: 36 }} />
                <Box>
                  <Typography variant="h4" color="#2d3748" fontWeight={700}>
                    Teacher Dashboard
                  </Typography>
                  <Typography variant="body1" color="#4a5568" sx={{ mt: 0.5 }}>
                    Welcome back, {userProfile.name || 'Teacher'}! Manage your modules and track student progress.
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#f8f9ff',
                    border: '1px solid #e3e8ff',
                    boxShadow: "none"
                  }}>
                    <PlaylistAddCheckIcon sx={{ fontSize: 40, color: '#4a6cf7', mb: 1 }} />
                    <Typography variant="h5" fontWeight={600} color="#2d3748">
                      {modules.length}
                    </Typography>
                    <Typography variant="body2" color="#4a5568">
                      Total Modules
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    boxShadow: "none"
                  }}>
                    <CheckCircle sx={{ fontSize: 40, color: '#22c55e', mb: 1 }} />
                    <Typography variant="h5" fontWeight={600} color="#2d3748">
                      {modules.filter(m => m.active).length}
                    </Typography>
                    <Typography variant="body2" color="#4a5568">
                      Active Modules
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#fefce8',
                    border: '1px solid #fef08a',
                    boxShadow: "none"
                  }}>
                    <GroupIcon sx={{ fontSize: 40, color: '#eab308', mb: 1 }} />
                    <Typography variant="h5" fontWeight={600} color="#2d3748">
                      --
                    </Typography>
                    <Typography variant="body2" color="#4a5568">
                      Students Enrolled
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    backgroundColor: '#fdf2f8',
                    border: '1px solid #fce7f3',
                    boxShadow: "none"
                  }}>
                    <AssessmentIcon sx={{ fontSize: 40, color: '#ec4899', mb: 1 }} />
                    <Typography variant="h5" fontWeight={600} color="#2d3748">
                      --
                    </Typography>
                    <Typography variant="body2" color="#4a5568">
                      Avg. Completion Rate
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/create-module")}
                  sx={{
                    borderRadius: "12px",
                    backgroundColor: "#4a6cf7",
                    py: 1.5,
                    px: 3,
                    "&:hover": {
                      backgroundColor: "#3a5ce5"
                    },
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  Create New Module
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={() => navigate("/teacher/students")}
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
                  onClick={() => navigate("/teacher/dashboard")}
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

          <Paper 
            sx={{ 
              padding: 4, 
              backgroundColor: "transparent",
              mb: 4,
              boxShadow: "none"
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" color="#2d3748" fontWeight={600} gutterBottom>
                {userProfile?.userType === "STUDENT" ? "Your Learning Modules" : "Your Modules"}
              </Typography>
              <Typography variant="body1" color="#4a5568">
                {userProfile?.userType === "STUDENT" 
                  ? "Continue your learning journey with these assigned modules."
                  : "Manage and monitor your created learning modules."}
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
                          height: userProfile?.userType === "STUDENT" ? '550px' : '450px', 
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
                            {userProfile?.userType === "TEACHER" && (
                              <Chip
                                label={module.active ? "Active" : "Inactive"}
                                color={module.active ? "success" : "default"}
                                size="small"
                                sx={{ fontWeight: 500 }}
                              />
                            )}
                          </Box>
                          <Typography gutterBottom variant="h6" component="div" fontWeight={600}>
                            {module.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {module.description}
                          </Typography>
                          
                          {userProfile?.userType === "STUDENT" && (
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
                          )}
                        </CardContent>
                        <CardActions sx={{ p: 3, pt: 0, mt: 'auto' }}>
                          {userProfile?.userType === "STUDENT" && (
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
                          )}
                          
                          {userProfile?.userType === "TEACHER" && (
                            <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                              <Button 
                                size="medium"
                                variant="contained"
                                onClick={() => navigate(`/module-details/${module.id}`)}
                                startIcon={<VisibilityIcon />}
                                sx={{ 
                                  borderRadius: "8px",
                                  backgroundColor: "#4a6cf7",
                                  py: 1,
                                  flex: 1,
                                  "&:hover": {
                                    backgroundColor: "#3a5ce5"
                                  },
                                  textTransform: 'none',
                                  fontWeight: 500
                                }}
                              >
                                View
                              </Button>
                              <Button 
                                size="medium"
                                variant="outlined"
                                onClick={() => navigate(`/edit-module/${module.id}`)}
                                startIcon={<EditIcon />}
                                sx={{ 
                                  borderRadius: "8px",
                                  borderColor: "#4a6cf7",
                                  color: "#4a6cf7",
                                  py: 1,
                                  flex: 1,
                                  "&:hover": {
                                    borderColor: "#3a5ce5",
                                    backgroundColor: "rgba(74, 108, 247, 0.05)"
                                  },
                                  textTransform: 'none',
                                  fontWeight: 500
                                }}
                              >
                                Edit
                              </Button>
                            </Stack>
                          )}
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
                  {userProfile?.userType === "STUDENT" 
                    ? "No learning modules are available for you at the moment." 
                    : "You haven't created any learning modules yet."}
                </Typography>
                
                {userProfile?.userType === "TEACHER" && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/create-module")}
                    sx={{ 
                      mt: 2,
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
                    Create Your First Module
                  </Button>
                )}
              </Box>
            )}
          </Paper>
          
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
              boxShadow: "none",
              border: '2px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="h5" fontWeight={600} color="#2d3748">
                {isProfileComplete() ? 'Edit Your Profile' : 'Complete Your Profile'}
              </Typography>
              {isProfileComplete() && (
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseProfileModal}
                  aria-label="close"
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />
            
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
                    },
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
                    },
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  sx={{ 
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                    },
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
                    "&:hover": {
                      backgroundColor: "#3a5ce5"
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
                    },
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
                    "&:hover": {
                      backgroundColor: "#3a5ce5"
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