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
  LinearProgress
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navbar from "./Navbar";
import Background from "./Background";
import module1 from "../assets/hygiene.png"
import module2 from "../assets/culinary-skills.jpg"
import { getStudentModuleProgressStats } from '../services/progressService';

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
  const [moduleProgress, setModuleProgress] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [progressStats, setProgressStats] = useState(null);
  const [moduleStats, setModuleStats] = useState(null);
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
      
      if (userProfile.userType === "STUDENT") {
        fetchProgressStats();
      }
    }
  }, [userProfile]);

  const fetchProgressStats = async () => {
    try {
      const studentId = localStorage.getItem('studentId') || userProfile.id;
      
      if (!studentId) return;
      
      const progressResponse = await getStudentModuleProgressStats(studentId, 1);
      setProgressStats(progressResponse);
      setModuleStats(progressResponse);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  };

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
        
        const modulePromises = modulesData.map(async (module) => {
          try {
            const progressResponse = await fetch(`http://localhost:8080/api/modules/${module.id}/progress?studentId=${studentId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json"
              }
            });
            
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              return {
                ...module,
                progress: progressData
              };
            }
            return module;
          } catch (error) {
            return module;
          }
        });
        
        const modulesWithProgress = await Promise.all(modulePromises);
        setModules(modulesWithProgress);
        
        const progressResponse = await fetch("http://localhost:8080/api/modules/progress", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Email": userEmail
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setModuleProgress(progressData);
        }
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

  const getModuleProgress = (moduleId) => {
    if (!moduleProgress || moduleProgress.length === 0) return 0;
    
    const progress = moduleProgress.find(p => p.moduleId === moduleId);
    return progress ? progress.completionPercentage : 0;
  };

  const handleStartModule = (moduleId) => {
    navigate(`/module/${moduleId}`);
  };

  const getModuleButtonText = (module) => {
    if (!module.progress) return "Start Learning";
    
    if (module.progress.completed) return "Review Module";
    
    return module.progress.completedLessons > 0 ? "Continue Learning" : "Start Learning";
  };

  const getModuleImage = (index) => {
    return moduleImages[index % moduleImages.length];
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
              padding: 4, 
              backgroundColor: "transparent",
              mb: 4
            }}
          >
            
            {loadingModules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress size={40} sx={{ color: "#4a6cf7" }} />
              </Box>
            ) : modules.length > 0 ? (
              <Grid container spacing={4} sx={{ justifyContent: 'center'}}>
                {modules.map((module, index) => (
                  <Grid item xs={12} sm={12} md={6} key={module.id}>
                    <Card 
                      sx={{ 
                        height: '500px', 
                        width: '450px',
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: '15px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0',
                        margin: '0 auto', 
                        "&:hover": {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                        }
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
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              {module.name || "Module"}
                            </Typography>
                            <Typography gutterBottom variant="h6" component="div" fontWeight={600}>
                              {module.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              {module.description}
                            </Typography>
                            
                            {userProfile?.userType === "STUDENT" && (
                              <Box sx={{ mt: 2, mb: 1 }}>
                                {module.progress ? (
                                  <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        Progress:
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        {module.progress.completedLessons}/{module.progress.totalLessons} Lessons
                                      </Typography>
                                    </Box>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={module.progress.totalLessons > 0 ? 
                                        (module.progress.completedLessons / module.progress.totalLessons * 100) : 0} 
                                      sx={{ 
                                        height: 8, 
                                        borderRadius: 4,
                                        mb: 1,
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: '#4a6cf7'
                                        }
                                      }}
                                    />
                                    {module.progress.stars > 0 && (
                                      <Typography variant="body2" color="#f59e0b" fontWeight={500} sx={{ display: 'flex', alignItems: 'center' }}>
                                        {module.progress.stars} Stars Earned
                                      </Typography>
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
                                          width: `${getModuleProgress(module.id)}%`,
                                          height: '100%',
                                          backgroundColor: '#4a6cf7',
                                          borderRadius: 4
                                        }}
                                      />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                      {getModuleProgress(module.id)}%
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            )}
                            
                            {userProfile?.userType !== "STUDENT" && module.active !== undefined && (
                              <Box sx={{ mt: 2 }}>
                                <Chip
                                  label={module.active ? "Active" : "Inactive"}
                                  color={module.active ? "success" : "default"}
                                  size="small"
                                  sx={{ fontWeight: 500 }}
                                />
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
                                  backgroundColor: "#4a6cf7",
                                  py: 1,
                                  "&:hover": {
                                    backgroundColor: "#3a5ce5"
                                  },
                                  textTransform: 'none',
                                  fontWeight: 500
                                }}
                              >
                                {getModuleButtonText(module)}
                              </Button>
                            )}
                            
                            {userProfile?.userType !== "STUDENT" && (
                              <Button 
                                size="medium"
                                fullWidth
                                variant="outlined"
                                onClick={() => navigate(`/module-details/${module.id}`)}
                                sx={{ 
                                  borderRadius: "8px",
                                  borderColor: "#4a6cf7",
                                  color: "#4a6cf7",
                                  py: 1,
                                  "&:hover": {
                                    borderColor: "#3a5ce5",
                                    backgroundColor: "rgba(74, 108, 247, 0.05)"
                                  },
                                  textTransform: 'none',
                                  fontWeight: 500
                                }}
                              >
                                View Details
                              </Button>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
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
                        : "No learning modules have been created yet."}
                    </Typography>
                    
                    {userProfile?.userType === "TEACHER" && (
                      <Button
                        variant="contained"
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
                        Create New Module
                      </Button>
                    )}
                  </Box>
                )}
            </Paper>
          
          {userProfile?.userType === "TEACHER" && (
            <Paper
              sx={{ 
                padding: 4, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                mb: 4
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SchoolIcon sx={{ color: '#4a6cf7', mr: 2, fontSize: 32 }} />
                  <Typography variant="h5" color="#2d3748" fontWeight={600}>
                    Teacher Tools
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ mb: 3 }} color="#4a5568">
                  This dashboard allows you to manage students and track their progress. You can create new modules, assign them to students, and monitor their learning journey.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/teacher/dashboard")}
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
                  Go to Teacher Dashboard
                </Button>
              </Box>
            </Paper>
          )}
          
          {localStorage.getItem('isAdmin') === 'true' && (
            <Paper
              sx={{ 
                padding: 4, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                mb: 4
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
              boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
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