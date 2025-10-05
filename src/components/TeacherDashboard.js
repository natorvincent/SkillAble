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
  Divider,
  Card,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  CardContent,
  CardActions,
  useTheme,
  alpha
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircle from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Navbar from "./Navbar";
import Background from "./Background";

function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [teacherName, setTeacherName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [enrolledStudentsCount, setEnrolledStudentsCount] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [completionRate, setCompletionRate] = useState(0);
  const [loadingCompletionRate, setLoadingCompletionRate] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  // FIXED: Authentication check with role verification
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    
    console.log("TeacherDashboard auth check:", { token: !!token, userEmail, userRole });
    
    // If no token or not a teacher, redirect appropriately
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }
    
    if (userRole !== "TEACHER") {
      console.log("Non-teacher user in TeacherDashboard, redirecting...");
      // Redirect to appropriate dashboard based on role
      if (userRole === "STUDENT") {
        navigate("/studentdashboard", { replace: true });
      } else if (userRole === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
      return;
    }

    fetchUserProfile(userEmail);
  }, [navigate]);

  useEffect(() => {
    if (userProfile && !isProfileComplete()) {
      setOpenProfileModal(true);
    } else if (userProfile && isProfileComplete()) {
      fetchTeacherData();
    }
  }, [userProfile]);

  const fetchUserProfile = async (email) => {
    try {
      const response = await fetch(`http://localhost:8080/api/teachers/profile?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const profileData = await response.json();
      setUserProfile(profileData);
      setTeacherName(profileData.name || "");
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
      const response = await fetch(`http://localhost:8080/api/teachers/students?email=${userEmail}`, {
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
      const response = await fetch(`http://localhost:8080/api/progress/teacher/${userEmail}/completion-rate`, {
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

  const fetchModules = async () => {
    setLoadingModules(true);
    try {
      const userEmail = localStorage.getItem("userEmail");
      
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
      setModules(modulesData);
      setLoadingModules(false);
    } catch (err) {
      console.error("Error fetching modules:", err);
      setError("Failed to load modules. Please try again.");
      setOpenSnackbar(true);
      setLoadingModules(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!teacherName.trim()) {
      setError("Please enter your full name");
      setOpenSnackbar(true);
      return;
    }

    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch(`http://localhost:8080/api/teachers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userEmail,
          name: teacherName.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
      setSuccess("Profile updated successfully!");
      setError("");
      setOpenSnackbar(true);
      setOpenProfileModal(false);
      
      if (isProfileComplete()) {
        fetchTeacherData();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
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
    return userProfile.name;
  };

  const getInitials = (name) => {
    if (!name) return "T";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getProgressColor = (rate) => {
    if (rate >= 80) return "#22c55e";
    if (rate >= 60) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: "#ffffff", mb: 2 }} size={48} />
          <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 500 }}>
            Loading your dashboard...
          </Typography>
        </Box>
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
        
        <Container maxWidth="xl" sx={{ paddingTop: 4, paddingBottom: 5 }}> 
          {/* Main Dashboard Layout */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={4} sx={{ maxWidth: '1400px' }}>
              {/* Left Side - Main Welcome Box */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{ 
                    height: '100%',
                    minHeight: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: alpha("#ffffff", 0.95),
                    borderRadius: "24px",
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                    padding: 4
                  }}
                >
                  {/* Header Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="h3" sx={{ 
                          color: "#1a202c", 
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          mb: 0.5
                        }}>
                          Hi, {userProfile?.name}!
                        </Typography>
                        <Typography variant="h6" sx={{ 
                          color: "#4a5568",
                          fontWeight: 400,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          What are we doing today?
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Tooltip title="Edit Profile">
                        <IconButton
                          onClick={handleOpenProfileModal}
                          sx={{
                            backgroundColor: alpha('#667eea', 0.1),
                            color: '#667eea',
                            '&:hover': {
                              backgroundColor: alpha('#667eea', 0.2),
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Notifications">
                        <IconButton
                          sx={{
                            backgroundColor: alpha('#f59e0b', 0.1),
                            color: '#f59e0b',
                            '&:hover': {
                              backgroundColor: alpha('#f59e0b', 0.2),
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <NotificationsIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Spacer to push buttons to center */}
                  <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Stack spacing={3} sx={{ width: '100%', maxWidth: '400px' }}>
                      <Button
                        variant="contained"
                        startIcon={<GroupIcon />}
                        onClick={() => navigate("/manageStudents")}
                        sx={{
                          borderRadius: "20px",
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          py: 3,
                          px: 4,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Manage Students
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AssessmentIcon />}
                        onClick={() => navigate("/studentProgress")}
                        sx={{
                          borderRadius: "20px",
                          background: 'linear-gradient(135deg, #06d6a0 0%, #118ab2 100%)',
                          py: 3,
                          px: 4,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 8px 25px rgba(6, 214, 160, 0.3)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 35px rgba(6, 214, 160, 0.4)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        View Analytics
                      </Button>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>

              {/* Right Side - Stats Cards */}
              <Grid item xs={12} md={6}>
                <Stack spacing={3} sx={{ height: '100%' }}>
                  {/* Top Grid - First 2 cards */}
                  <Grid container spacing={3}>
                    {/* Learning Modules */}
                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card sx={{ 
                        height: '280px',
                        width: '300px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <PlaylistAddCheckIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                            <Chip 
                              label="Total" 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha('#ffffff', 0.2),
                                color: 'white',
                                fontWeight: 500
                              }} 
                            />
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                              {modules.length}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Learning Modules
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Active Modules */}
                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card sx={{ 
                        height: '280px',
                        width: '300px',
                        background: 'linear-gradient(135deg, #06d6a0 0%, #118ab2 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(6, 214, 160, 0.3)',
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                            <Chip 
                              label="Active" 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha('#ffffff', 0.2),
                                color: 'white',
                                fontWeight: 500
                              }} 
                            />
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                              {modules.filter(m => m.active).length}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Active Modules
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Bottom Grid - Last 2 cards */}
                  <Grid container spacing={3}>
                    {/* Number of Students */}
                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card sx={{ 
                        height: '280px',
                        width: '300px',
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <PeopleAltIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                            <Chip 
                              label="Enrolled" 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha('#ffffff', 0.2),
                                color: 'white',
                                fontWeight: 500
                              }} 
                            />
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                              {loadingStudents ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                              ) : (
                                enrolledStudentsCount
                              )}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Students
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Completion Rate */}
                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Card sx={{ 
                        height: '280px',
                        width: '300px',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 10px 30px rgba(79, 172, 254, 0.3)',
                        transition: 'all 0.3s ease'
                      }}>
                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <AutoGraphIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                            <Chip 
                              label="Progress" 
                              size="small" 
                              sx={{ 
                                backgroundColor: alpha('#ffffff', 0.2),
                                color: 'white',
                                fontWeight: 500
                              }} 
                            />
                          </Box>
                          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                              {loadingCompletionRate ? (
                                <CircularProgress size={24} sx={{ color: 'white' }} />
                              ) : (
                                `${completionRate}%`
                              )}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              Completion Rate
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={completionRate} 
                              sx={{ 
                                mt: 1,
                                backgroundColor: alpha('#ffffff', 0.3),
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: '#ffffff'
                                }
                              }} 
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </Box>
          
          {/* Admin Panel */}
          {localStorage.getItem('isAdmin') === 'true' && (
            <Paper
              elevation={0}
              sx={{ 
                padding: 4, 
                backgroundColor: alpha("#ffffff", 0.95),
                borderRadius: "24px",
                mt: 4,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)'
              }}
            >
              <Card sx={{ 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                color: 'white',
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AdminPanelSettingsIcon sx={{ fontSize: 48, mr: 2, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                        Admin Access
                      </Typography>
                      <Chip 
                        label="Administrator" 
                        size="small" 
                        sx={{ 
                          backgroundColor: alpha('#ffffff', 0.2),
                          color: 'white',
                          fontWeight: 500
                        }} 
                      />
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, fontSize: '1.1rem' }}>
                    As an administrator, you have comprehensive control over the platform. Manage users, 
                    promote teachers, configure system settings, and oversee all learning content with 
                    advanced administrative tools.
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 4, pb: 4 }}>
                  <Button
                    variant="contained"
                    startIcon={<AdminPanelSettingsIcon />}
                    onClick={() => navigate("/admin")}
                    sx={{ 
                      borderRadius: "12px",
                      backgroundColor: alpha('#ffffff', 0.2),
                      color: 'white',
                      py: 1.5,
                      px: 3,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.3),
                        transform: 'translateY(-1px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Access Admin Dashboard
                  </Button>
                </CardActions>
              </Card>
            </Paper>
          )}
        </Container>
      </div>

      {/* Enhanced Profile Modal */}
      <Modal
        open={openProfileModal}
        onClose={handleCloseProfileModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)'
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
              width: { xs: '90%', sm: '500px' },
              p: 4,
              outline: 'none',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ 
                  color: '#667eea', 
                  fontSize: 32, 
                  mr: 2,
                  background: alpha('#667eea', 0.1),
                  borderRadius: '50%',
                  p: 1
                }} />
                <Typography variant="h5" fontWeight={700} sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {isProfileComplete() ? 'Edit Your Profile' : 'Complete Your Profile'}
                </Typography>
              </Box>
              {isProfileComplete() && (
                <IconButton
                  edge="end"
                  onClick={handleCloseProfileModal}
                  aria-label="close"
                  sx={{
                    color: "#667eea",
                    backgroundColor: alpha('#667eea', 0.1),
                    '&:hover': {
                      backgroundColor: alpha('#667eea', 0.2),
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CloseIcon />
                </IconButton>
              )}
            </Box>

            <Divider sx={{ mb: 4, height: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
            
            <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 2 }}>
              <TextField
                required
                fullWidth
                label="Full Name"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                sx={{ 
                  mb: 4,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: alpha('#667eea', 0.05),
                    "& fieldset": {
                      borderColor: alpha('#667eea', 0.3),
                      borderWidth: 2,
                    },
                    "&:hover fieldset": {
                      borderColor: "#667eea",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#667eea",
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#667eea",
                    fontWeight: 500,
                    "&.Mui-focused": {
                      color: "#667eea",
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
                  height: "56px",
                  borderRadius: "16px",
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 12px 35px rgba(102, 126, 234, 0.5)",
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {isProfileComplete() ? 'Update Profile' : 'Save Profile'}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? "success" : "error"}
          sx={{ 
            width: "100%", 
            borderRadius: "16px",
            fontWeight: 500,
            fontSize: '1rem',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TeacherDashboard;