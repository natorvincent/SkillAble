// TeacherDashboard.jsx - Updated with completed lessons in leaderboard
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  alpha,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
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
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PublicIcon from '@mui/icons-material/Public';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import { useDarkMode } from './DarkModeContext';

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
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Use dark mode context
  const { darkMode, toggleDarkMode, colors } = useDarkMode();
  const { fontColor, sidebarBgColor, offWhiteColors, gradientColors } = colors;

  // Sidebar menu items - simplified to just 3 main items
  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/teacherdashboard",
      active: location.pathname === "/teacherdashboard"
    },
    {
      text: "Manage Students",
      icon: <PeopleAltIcon />,
      path: "/manageStudents",
      active: location.pathname === "/manageStudents"
    },
    {
      text: "View Analytics",
      icon: <AnalyticsIcon />,
      path: "/studentProgress",
      active: location.pathname === "/studentProgress"
    },
  ];

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
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/teachers/profile?email=${email}`, {
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
    await Promise.all([
      fetchModules(), 
      fetchEnrolledStudents(), 
      fetchCompletionRate(),
      fetchStudentsProgress()
    ]);
  };

  const fetchStudentsProgress = async () => {
    setLoadingLeaderboard(true);
    try {
      const teacherEmail = localStorage.getItem("userEmail");
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/progress/teacher/${teacherEmail}/students-progress`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch students progress");
      }

      const progressData = await response.json();
      setStudentsProgress(progressData);
      
      // Create leaderboard data from students with progress
      const activeStudents = progressData.filter(s => s.moduleProgresses?.length > 0);
      
      // Sort by overall progress (highest first), then by completed lessons, then by stars
      const sortedLeaderboard = activeStudents
        .sort((a, b) => {
          const progressA = getOverallProgress(a.moduleProgresses);
          const progressB = getOverallProgress(b.moduleProgresses);
          
          if (progressA !== progressB) {
            return progressB - progressA; // Higher progress first
          }
          
          const lessonsA = getCompletedLessons(a.moduleProgresses);
          const lessonsB = getCompletedLessons(b.moduleProgresses);
          
          if (lessonsA !== lessonsB) {
            return lessonsB - lessonsA; // More completed lessons first
          }
          
          const starsA = getTotalStars(a.moduleProgresses);
          const starsB = getTotalStars(b.moduleProgresses);
          
          return starsB - starsA; // More stars first
        })
        .slice(0, 5); // Show top 5 on dashboard
      
      setLeaderboardData(sortedLeaderboard);
      setLoadingLeaderboard(false);
    } catch (err) {
      console.error("Error fetching students progress:", err);
      setStudentsProgress([]);
      setLeaderboardData([]);
      setLoadingLeaderboard(false);
    }
  };

  const getOverallProgress = (moduleProgresses) => {
    if (!moduleProgresses || moduleProgresses.length === 0) return 0;
    const totalCompleted = moduleProgresses.reduce((sum, mp) => sum + mp.completedLessons, 0);
    const totalLessons = moduleProgresses.reduce((sum, mp) => sum + mp.totalLessons, 0);
    return totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  };

  const getTotalStars = (moduleProgresses) => {
    if (!moduleProgresses || moduleProgresses.length === 0) return 0;
    return moduleProgresses.reduce((sum, mp) => sum + mp.totalStars, 0);
  };

  const getAverageScore = (moduleProgresses) => {
    if (!moduleProgresses || moduleProgresses.length === 0) return 0;
    const validScores = moduleProgresses.filter(mp => mp.averageScore > 0);
    if (validScores.length === 0) return 0;
    const total = validScores.reduce((sum, mp) => sum + mp.averageScore, 0);
    return Math.round(total / validScores.length);
  };

  const getCompletedLessons = (moduleProgresses) => {
    if (!moduleProgresses || moduleProgresses.length === 0) return 0;
    return moduleProgresses.reduce((sum, mp) => sum + mp.completedLessons, 0);
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
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/teachers/profile`, {
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

  const handleMenuItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleViewStudentDetails = (student) => {
    navigate("/studentProgress");
  };

  const getProgressStatus = (progress) => {
    if (progress >= 90) return { label: 'Excellent', color: '#10b981', bg: '#f0fdf4' };
    if (progress >= 70) return { label: 'Good', color: '#22c55e', bg: '#f0fdf4' };
    if (progress >= 50) return { label: 'Average', color: '#f59e0b', bg: '#fffbeb' };
    if (progress > 0) return { label: 'Needs Help', color: '#ef4444', bg: '#fef2f2' };
    return { label: 'Not Started', color: '#6b7280', bg: '#f9fafb' };
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: offWhiteColors.background
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: fontColor, mb: 2 }} size={48} />
          <Typography variant="h6" sx={{ color: fontColor, fontWeight: 500 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: offWhiteColors.background }}>
      {/* Simple Fixed Sidebar - always open, consistent width */}
      <Box
        sx={{
          width: 280, // Fixed width
          flexShrink: 0,
          backgroundColor: sidebarBgColor,
          color: fontColor,
          borderRight: darkMode ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
          overflowX: 'hidden',
          position: 'fixed',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${alpha(fontColor, 0.1)}`,
          backgroundColor: gradientColors.sidebarHeader,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {getInitials(teacherName)}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: fontColor }}>
                {teacherName}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha(fontColor, 0.7) }}>
                Teacher
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Menu */}
        <List sx={{ p: 1, flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text} 
              disablePadding 
              sx={{ 
                mb: 0.5,
                borderRadius: '12px',
                backgroundColor: item.active ? alpha(fontColor, 0.1) : 'transparent',
              }}
            >
              <ListItemButton
                onClick={() => handleMenuItemClick(item)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: alpha(fontColor, 0.05),
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: item.active ? fontColor : alpha(fontColor, 0.7),
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: item.active ? 600 : 300,
                      color: item.active ? fontColor : alpha(fontColor, 0.9),
                      fontSize: '0.9rem',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          
          {/* Dark Mode Toggle Button in Sidebar */}
          <ListItem disablePadding sx={{ mt: 2 }}>
            <ListItemButton
              onClick={toggleDarkMode}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: alpha(fontColor, 0.05),
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: alpha(fontColor, 0.7),
                minWidth: 40
              }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText 
                primary={darkMode ? "Light Mode" : "Dark Mode"} 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    color: fontColor,
                    fontSize: '0.875rem',
                    '--tw-text-opacity': 1,
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Sidebar Footer */}
        <Box sx={{ p: 3, borderTop: `1px solid ${alpha(fontColor, 0.1)}` }}>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={() => {
              // Clear all authentication data from localStorage
              localStorage.removeItem("token");
              localStorage.removeItem("userEmail");
              localStorage.removeItem("userRole");
              localStorage.removeItem("isAdmin");
              localStorage.removeItem("teacherId");
              
              // Redirect to login page
              navigate("/login");
              
              // Optional: Show a logout success message
              setSuccess("Logged out successfully!");
              setOpenSnackbar(true);
            }}
            sx={{
              borderRadius: '12px',
              backgroundColor: darkMode ? '#667eea' : fontColor,
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: darkMode ? '#5a67d8' : '#1f0750',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(40, 11, 96, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Log out
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          ml: '280px', // Fixed margin to match sidebar width
          width: 'calc(100% - 280px)',
          minHeight: '100vh'
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "100vh",
            width: "100%",
            backgroundColor: offWhiteColors.background,
          }}
        >
          <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
            <Container maxWidth="xl" sx={{ paddingTop: 2, paddingBottom: 2 }}> 
              {/* Main Dashboard Layout */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}> {/* Changed to flex-start */}
                <Grid container spacing={4} sx={{ maxWidth: '1400px' }}>
                  {/* Left Side - Main Welcome Box */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        minHeight: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: alpha(offWhiteColors.cardBg, 0.9),
                        borderRadius: "24px",
                        backdropFilter: 'blur(10px)',
                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
                        background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
                        boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                        padding: 4
                      }}
                    >
                      {/* Header Section */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h5" sx={{ 
                              color: fontColor, 
                              fontWeight: 700,
                              mb: 0.5
                            }}>
                              Hi, {userProfile?.name}!
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              color: fontColor,
                              fontWeight: 400,
                              opacity: 0.8,
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
                                backgroundColor: alpha(fontColor, 0.1),
                                color: fontColor,
                                '&:hover': {
                                  backgroundColor: alpha(fontColor, 0.2),
                                  transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  {/* Right Side - Stats Cards */}
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            height: '100%',
                            backgroundColor: alpha(offWhiteColors.cardBg, 0.9),
                            borderRadius: "16px",
                            backdropFilter: 'blur(10px)',
                            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
                            background: `linear-gradient(135deg, ${alpha(fontColor, 0.1)} 0%, ${alpha(fontColor, 0.05)} 100%)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="h3" sx={{ fontWeight: 700, color: fontColor, mb: 1 }}>
                            {enrolledStudentsCount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), textAlign: 'center' }}>
                            Students
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            height: '100%',
                            backgroundColor: alpha(offWhiteColors.cardBg, 0.9),
                            borderRadius: "16px",
                            backdropFilter: 'blur(10px)',
                            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
                            background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, ${alpha('#10b981', 0.05)} 100%)`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="h3" sx={{ fontWeight: 700, color: fontColor, mb: 1 }}>
                            {completionRate}%
                          </Typography>
                          <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), textAlign: 'center' }}>
                            Avg Completion
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
              
              {/* LEADERBOARD SECTION - Added below main welcome box */}
              <Paper
                elevation={0}
                sx={{
                  mt: 4,
                  backgroundColor: alpha(offWhiteColors.cardBg, 0.9),
                  borderRadius: "24px",
                  backdropFilter: 'blur(10px)',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
                  background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
                  boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                  overflow: 'hidden'
                }}
              >
                {/* Leaderboard Header */}
                <Box sx={{ 
                  p: 3, 
                  borderBottom: `1px solid ${alpha(fontColor, 0.1)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmojiEventsIcon sx={{ 
                      color: fontColor, 
                      fontSize: 32,
                      background: `linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)`,
                      borderRadius: '8px',
                      p: 1
                    }} />
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: fontColor }}>
                        Top Performing Students
                      </Typography>
                      <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7) }}>
                        Based on overall progress and completed lessons
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${leaderboardData.length} Active Students`}
                    sx={{
                      backgroundColor: alpha(fontColor, 0.1),
                      color: fontColor,
                      fontWeight: 600
                    }}
                  />
                </Box>

                {/* Leaderboard Content */}
                <Box sx={{ p: 2 }}>
                  {loadingLeaderboard ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress sx={{ color: fontColor }} />
                    </Box>
                  ) : leaderboardData.length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: alpha(fontColor, 0.05) }}>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: fontColor, 
                              py: 2,
                              width: '60px',
                              textAlign: 'center'
                            }}>
                              Rank
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: fontColor, 
                              py: 2 
                            }}>
                              Student
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: fontColor, 
                              py: 2,
                              textAlign: 'center'
                            }}>
                              Progress
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: fontColor, 
                              py: 2,
                              textAlign: 'center'
                            }}>
                              Stars
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: fontColor, 
                              py: 2,
                              textAlign: 'center'
                            }}>
                              Completed Lessons
                            </TableCell>
                            <TableCell sx={{ 
                              fontWeight: 700, 
                              color: fontColor, 
                              py: 2,
                              textAlign: 'center'
                            }}>
                              Modules
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {leaderboardData.map((student, index) => {
                            const progress = getOverallProgress(student.moduleProgresses);
                            const stars = getTotalStars(student.moduleProgresses);
                            const completedLessons = getCompletedLessons(student.moduleProgresses);
                            const moduleCount = student.moduleProgresses?.length || 0;
                            const status = getProgressStatus(progress);
                            
                            return (
                              <TableRow 
                                key={student.id}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: alpha(fontColor, 0.03) 
                                  },
                                  borderBottom: `1px solid ${alpha(fontColor, 0.05)}`
                                }}
                              >
                                {/* Rank Cell */}
                                <TableCell sx={{ 
                                  py: 2,
                                  textAlign: 'center'
                                }}>
                                  {index < 3 ? (
                                    <Box sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      width: 32,
                                      height: 32,
                                      borderRadius: '50%',
                                      backgroundColor: 
                                        index === 0 ? '#fbbf24' : 
                                        index === 1 ? '#d1d5db' : 
                                        '#f59e0b',
                                      color: index === 0 ? '#000' : '#fff',
                                      fontWeight: 700,
                                      fontSize: '0.875rem',
                                      margin: '0 auto'
                                    }}>
                                      {index + 1}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" sx={{ 
                                      color: alpha(fontColor, 0.7),
                                      fontWeight: 600
                                    }}>
                                      #{index + 1}
                                    </Typography>
                                  )}
                                </TableCell>

                                {/* Student Cell */}
                                <TableCell sx={{ py: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar 
                                      sx={{ 
                                        width: 40, 
                                        height: 40,
                                        backgroundColor: alpha(fontColor, 0.1),
                                        color: fontColor,
                                        fontWeight: 600,
                                        fontSize: '1rem'
                                      }}
                                    >
                                      {student.firstName ? student.firstName[0].toUpperCase() : 'S'}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body1" sx={{ 
                                        fontWeight: 600, 
                                        color: fontColor,
                                        mb: 0.5
                                      }}>
                                        {student.firstName && student.lastName 
                                          ? `${student.firstName} ${student.lastName}`
                                          : "Profile Incomplete"
                                        }
                                      </Typography>
                                      <Typography variant="caption" sx={{ 
                                        color: alpha(fontColor, 0.7),
                                        display: 'block'
                                      }}>
                                        {student.email}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>

                                {/* Progress Cell */}
                                <TableCell sx={{ py: 2, textAlign: 'center' }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="body1" sx={{ 
                                        fontWeight: 700, 
                                        color: fontColor
                                      }}>
                                        {progress}%
                                      </Typography>
                                      <Chip
                                        label={status.label}
                                        size="small"
                                        sx={{
                                          backgroundColor: status.bg,
                                          color: status.color,
                                          fontWeight: 600,
                                          fontSize: '0.7rem',
                                          height: 20
                                        }}
                                      />
                                    </Box>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={progress}
                                      sx={{
                                        width: '80%',
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: alpha(fontColor, 0.1),
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: status.color,
                                          borderRadius: 3
                                        }
                                      }}
                                    />
                                  </Box>
                                </TableCell>

                                {/* Stars Cell */}
                                <TableCell sx={{ py: 2, textAlign: 'center' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <StarIcon sx={{ 
                                      color: '#fbbf24',
                                      fontSize: 20
                                    }} />
                                    <Typography variant="body1" sx={{ 
                                      fontWeight: 700, 
                                      color: fontColor
                                    }}>
                                      {stars}
                                    </Typography>
                                  </Box>
                                </TableCell>

                                {/* Completed Lessons Cell */}
                                <TableCell sx={{ py: 2, textAlign: 'center' }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="h6" sx={{ 
                                      fontWeight: 700, 
                                      color: fontColor,
                                      lineHeight: 1
                                    }}>
                                      {completedLessons}
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: alpha(fontColor, 0.7),
                                      fontWeight: 500
                                    }}>
                                      Lessons
                                    </Typography>
                                  </Box>
                                </TableCell>

                                {/* Modules Cell */}
                                <TableCell sx={{ py: 2, textAlign: 'center' }}>
                                  <Box sx={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    backgroundColor: alpha(fontColor, 0.1),
                                    fontWeight: 600,
                                    color: fontColor
                                  }}>
                                    {moduleCount}
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box sx={{ 
                      p: 6, 
                      textAlign: 'center',
                      border: `2px dashed ${alpha(fontColor, 0.1)}`,
                      borderRadius: 2,
                      m: 2
                    }}>
                      <EmojiEventsIcon sx={{ 
                        fontSize: 64, 
                        color: alpha(fontColor, 0.2),
                        mb: 2
                      }} />
                      <Typography variant="h6" sx={{ 
                        color: alpha(fontColor, 0.5), 
                        mb: 1,
                        fontWeight: 600
                      }}>
                        No active students yet
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: alpha(fontColor, 0.5),
                        mb: 3
                      }}>
                        Students will appear here once they start making progress in modules
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<PeopleAltIcon />}
                        onClick={() => navigate("/manageStudents")}
                        sx={{
                          borderRadius: '8px',
                          borderColor: alpha(fontColor, 0.3),
                          color: fontColor,
                          '&:hover': {
                            borderColor: fontColor,
                            backgroundColor: alpha(fontColor, 0.05)
                          }
                        }}
                      >
                        Manage Students
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* Footer with View All Button */}
                {leaderboardData.length > 0 && (
                  <Box sx={{ 
                    p: 2, 
                    borderTop: `1px solid ${alpha(fontColor, 0.1)}`,
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <Button
                      variant="text"
                      endIcon={<TrendingUpIcon />}
                      onClick={() => navigate("/studentProgress")}
                      sx={{
                        color: fontColor,
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: alpha(fontColor, 0.05)
                        }
                      }}
                    >
                      View Full Leaderboard
                    </Button>
                  </Box>
                )}
              </Paper>
              
              {/* Admin Panel */}
              {localStorage.getItem('isAdmin') === 'true' && (
                <Paper
                  elevation={0}
                  sx={{ 
                    padding: 4, 
                    backgroundColor: alpha(offWhiteColors.cardBg, 0.95),
                    borderRadius: "24px",
                    mt: 4,
                    backdropFilter: 'blur(10px)',
                    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
                    background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
                    boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)'
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
                          <Typography variant="h4" fontWeight={700} sx={{ mb: 1, color: 'white' }}>
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
                      <Typography variant="body1" sx={{ mb: 3, opacity: 0.9, fontSize: '1.1rem', color: 'white' }}>
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
                backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
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
                  backgroundColor: offWhiteColors.modalBg,
                  background: `linear-gradient(135deg, ${gradientColors.modalGradient1} 0%, ${gradientColors.modalGradient2} 100%)`,
                  boxShadow: darkMode ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 20px 60px rgba(0, 0, 0, 0.15)',
                  border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ 
                      color: fontColor, 
                      fontSize: 32, 
                      mr: 2,
                      background: alpha(fontColor, 0.1),
                      borderRadius: '50%',
                      p: 1
                    }} />
                    <Typography variant="h5" fontWeight={700} sx={{ color: fontColor }}>
                      {isProfileComplete() ? 'Edit Your Profile' : 'Complete Your Profile'}
                    </Typography>
                  </Box>
                  {isProfileComplete() && (
                    <IconButton
                      edge="end"
                      onClick={handleCloseProfileModal}
                      aria-label="close"
                      sx={{
                        color: fontColor,
                        backgroundColor: alpha(fontColor, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(fontColor, 0.2),
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </Box>

                <Divider sx={{ mb: 4, height: 2, backgroundColor: fontColor }} />
                
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
                        backgroundColor: alpha(fontColor, 0.05),
                        "& fieldset": {
                          borderColor: alpha(fontColor, 0.3),
                          borderWidth: 2,
                        },
                        "&:hover fieldset": {
                          borderColor: fontColor,
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: fontColor,
                        }
                      },
                      "& .MuiInputLabel-root": {
                        color: fontColor,
                        fontWeight: 500,
                        "&.Mui-focused": {
                          color: fontColor,
                        }
                      },
                      "& .MuiInputBase-input": {
                        color: fontColor,
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
                      backgroundColor: fontColor,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: "0 8px 25px rgba(40, 11, 96, 0.4)",
                      "&:hover": {
                        backgroundColor: darkMode ? '#5a67d8' : '#1f0750',
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 35px rgba(40, 11, 96, 0.5)",
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
                backgroundColor: offWhiteColors.cardBg,
                color: fontColor,
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                },
                '& .MuiAlert-message': {
                  color: fontColor,
                }
              }}
            >
              {success || error}
            </Alert>
          </Snackbar>
        </div>
      </Box>
    </Box>
  );
}

export default TeacherDashboard;