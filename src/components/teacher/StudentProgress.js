import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from '../DarkModeContext';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  alpha,
  Tooltip,
  Divider,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimerIcon from '@mui/icons-material/Timer';
import CheckIcon from '@mui/icons-material/Check';
import PendingIcon from '@mui/icons-material/Pending';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

function StudentProgress() {
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailedProgress, setDetailedProgress] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [completionStats, setCompletionStats] = useState({
    averageCompletion: 0,
    totalStudents: 0,
    activeStudents: 0,
    completedModules: 0
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const navigate = useNavigate();
  const location = useLocation();

  // Use dark mode context instead of local state
  const { darkMode, toggleDarkMode, colors } = useDarkMode();

  // Sidebar menu items
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }

    fetchStudentsProgress();
  }, [navigate]);

  useEffect(() => {
    filterStudents();
  }, [studentsProgress, searchTerm, tabValue]);

  const fetchStudentsProgress = async () => {
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
      calculateStats(progressData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students progress:", err);
      setStudentsProgress([]);
      setLoading(false);
    }
  };

  const calculateStats = (students) => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.moduleProgresses?.length > 0).length;
    const completedModules = students.reduce((sum, s) => 
      sum + (s.moduleProgresses?.filter(mp => mp.completed).length || 0), 0
    );
    
    let totalCompletion = 0;
    let studentsWithProgress = 0;
    
    students.forEach(student => {
      if (student.moduleProgresses?.length > 0) {
        const progress = getOverallProgress(student.moduleProgresses);
        if (progress > 0) {
          totalCompletion += progress;
          studentsWithProgress++;
        }
      }
    });

    const averageCompletion = studentsWithProgress > 0 ? Math.round(totalCompletion / studentsWithProgress) : 0;

    setCompletionStats({
      averageCompletion,
      totalStudents,
      activeStudents,
      completedModules
    });
  };

  const filterStudents = () => {
    let filtered = studentsProgress;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        (student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (student.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      );
    }

    // Tab filter
    switch (tabValue) {
      case 0: // All students
        break;
      case 1: // Active students
        filtered = filtered.filter(s => s.moduleProgresses?.length > 0);
        break;
      case 2: // Leaderboard - sorted by performance
        filtered = filtered.filter(s => s.moduleProgresses?.length > 0);
        // Sort by overall progress, then by total stars, then by average score
        filtered = filtered.sort((a, b) => {
          const progressA = getOverallProgress(a.moduleProgresses);
          const progressB = getOverallProgress(b.moduleProgresses);
          
          if (progressA !== progressB) {
            return progressB - progressA; // Higher progress first
          }
          
          const starsA = getTotalStars(a.moduleProgresses);
          const starsB = getTotalStars(b.moduleProgresses);
          
          if (starsA !== starsB) {
            return starsB - starsA; // More stars first
          }
          
          const scoreA = getAverageScore(a.moduleProgresses);
          const scoreB = getAverageScore(b.moduleProgresses);
          
          return scoreB - scoreA; // Higher score first
        });
        break;
      default:
        break;
    }

    setFilteredStudents(filtered);
  };

  const fetchDetailedProgress = async (studentId) => {
    setLoadingDetail(true);
    try {
      const teacherEmail = localStorage.getItem("userEmail");
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/progress/teacher/${teacherEmail}/student/${studentId}/detailed`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch detailed progress");
      }

      const detailData = await response.json();
      setDetailedProgress(detailData);
      setLoadingDetail(false);
    } catch (err) {
      console.error("Error fetching detailed progress:", err);
      setLoadingDetail(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setOpenDetailModal(true);
    fetchDetailedProgress(student.id);
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

  const getProgressStatus = (progress) => {
    if (progress >= 90) return { label: 'Excellent', color: '#10b981', bg: '#f0fdf4' };
    if (progress >= 70) return { label: 'Good', color: '#22c55e', bg: '#f0fdf4' };
    if (progress >= 50) return { label: 'Average', color: '#f59e0b', bg: '#fffbeb' };
    if (progress > 0) return { label: 'Needs Help', color: '#ef4444', bg: '#fef2f2' };
    return { label: 'Not Started', color: '#6b7280', bg: '#f9fafb' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not started";
    return new Date(dateString).toLocaleDateString();
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

  const { fontColor, sidebarBgColor, offWhiteColors, gradientColors } = colors;

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
            Loading student progress...
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: offWhiteColors.background }}>
      {/* Fixed Sidebar */}
      <Box
        sx={{
          width: 280,
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
              localStorage.removeItem("token");
              localStorage.removeItem("userEmail");
              localStorage.removeItem("userRole");
              localStorage.removeItem("isAdmin");
              localStorage.removeItem("teacherId");
              navigate("/login");
              setSnackbar({
                open: true,
                message: 'Logged out successfully!',
                severity: 'success'
              });
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
          ml: '280px',
          width: 'calc(100% - 280px)',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="xl" sx={{ paddingTop: 4, paddingBottom: 6 }}>

          {/* Overview Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                backgroundColor: offWhiteColors.surface,
                borderRadius: "16px",
                boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
                background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: fontColor, mb: 0.5 }}>
                      {completionStats.averageCompletion}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                      Average Completion
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: alpha(fontColor, 0.1) 
                  }}>
                    <TrendingUpIcon sx={{ color: fontColor, fontSize: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                backgroundColor: offWhiteColors.surface,
                borderRadius: "16px",
                boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
                background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: fontColor, mb: 0.5 }}>
                      {completionStats.activeStudents}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                      Active Students
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: alpha(fontColor, 0.1) 
                  }}>
                    <PersonIcon sx={{ color: fontColor, fontSize: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                backgroundColor: offWhiteColors.surface,
                borderRadius: "16px",
                boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
                background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: fontColor, mb: 0.5 }}>
                      {completionStats.completedModules}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                      Completed Modules
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: alpha(fontColor, 0.1) 
                  }}>
                    <EmojiEventsIcon sx={{ color: fontColor, fontSize: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                backgroundColor: offWhiteColors.surface,
                borderRadius: "16px",
                boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
                background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: fontColor, mb: 0.5 }}>
                      {completionStats.totalStudents}
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                      Total Students
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: alpha(fontColor, 0.1) 
                  }}>
                    <SchoolIcon sx={{ color: fontColor, fontSize: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Paper
            sx={{ 
              backgroundColor: offWhiteColors.cardBg,
              borderRadius: "24px",
              mb: 4,
              boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
              background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
              overflow: 'hidden'
            }}
          >
            {/* Header with Search and Filters */}
            <Box sx={{ p: 4, borderBottom: `1px solid ${alpha(fontColor, 0.1)}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ color: fontColor, mr: 2, fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: fontColor, mb: 0.5 }}>
                      Student Performance Overview
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7) }}>
                      Monitor and track student learning progress
                    </Typography>
                  </Box>
                </Box>
                <TextField
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: alpha(fontColor, 0.7) }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: 320,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: offWhiteColors.subtleBg,
                      border: `1px solid ${alpha(fontColor, 0.1)}`,
                      "&:hover": {
                        borderColor: fontColor
                      },
                      "&.Mui-focused": {
                        borderColor: fontColor,
                        boxShadow: `0 0 0 3px ${alpha(fontColor, 0.1)}`
                      }
                    }
                  }}
                />
              </Box>
              
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 48,
                    fontSize: '0.95rem'
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: fontColor,
                    height: 3,
                    borderRadius: '2px 2px 0 0'
                  }
                }}
              >
                <Tab label={`All Students (${studentsProgress.length})`} sx={{ color: fontColor }} />
                <Tab label={`Active (${studentsProgress.filter(s => s.moduleProgresses?.length > 0).length})`} sx={{ color: fontColor }} />
                <Tab 
                  icon={<LeaderboardIcon />}
                  iconPosition="start"
                  label={`Leaderboard (${studentsProgress.filter(s => s.moduleProgresses?.length > 0).length})`} 
                  sx={{ color: fontColor }}
                />
              </Tabs>
            </Box>

            {/* Student Cards Grid */}
            <Box sx={{ p: 4 }}>
              {filteredStudents.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredStudents.map((student, index) => {
                    const progress = getOverallProgress(student.moduleProgresses);
                    const status = getProgressStatus(progress);
                    const isLeaderboard = tabValue === 2;
                    
                    return (
                      <Grid item xs={12} sm={6} lg={4} key={student.id}>
                        <Card sx={{ 
                          height: '100%',
                          borderRadius: '20px',
                          border: isLeaderboard && index < 3 ? `2px solid ${alpha(fontColor, 0.5)}` : `1px solid ${alpha(fontColor, 0.1)}`,
                          boxShadow: isLeaderboard && index < 3 ? `0 8px 32px ${alpha(fontColor, 0.3)}` : darkMode ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.05)',
                          background: isLeaderboard && index < 3 ? `linear-gradient(135deg, ${alpha(fontColor, 0.05)} 0%, ${alpha(fontColor, 0.1)} 100%)` : offWhiteColors.surface,
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: isLeaderboard && index < 3 ? `0 16px 48px ${alpha(fontColor, 0.4)}` : darkMode ? '0 12px 40px rgba(0,0,0,0.3)' : '0 12px 40px rgba(0,0,0,0.15)',
                            borderColor: alpha(fontColor, 0.3)
                          }
                        }}>
                          {isLeaderboard && (
                            <Box sx={{ 
                              position: 'absolute', 
                              top: -8, 
                              right: 16, 
                              backgroundColor: fontColor,
                              color: 'white',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              zIndex: 1
                            }}>
                              #{index + 1}
                            </Box>
                          )}
                          <CardContent sx={{ p: 3 }}>
                            {/* Student Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                              <Avatar 
                                sx={{ 
                                  width: 56, 
                                  height: 56, 
                                  mr: 2, 
                                  background: isLeaderboard && index < 3 ? 
                                    `linear-gradient(135deg, ${alpha(fontColor, 0.8)} 0%, ${alpha(fontColor, 0.6)} 100%)` :
                                    `linear-gradient(135deg, ${alpha(fontColor, 0.8)} 0%, ${alpha(fontColor, 0.6)} 100%)`,
                                  fontSize: '1.25rem',
                                  fontWeight: 700,
                                  color: 'white'
                                }}
                              >
                                {student.firstName ? student.firstName[0].toUpperCase() : 'S'}
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: fontColor, mb: 0.5 }}>
                                  {student.firstName && student.lastName 
                                    ? `${student.firstName} ${student.lastName}`
                                    : "Profile Incomplete"
                                  }
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7) }}>
                                  {student.email}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                <Chip
                                  label={status.label}
                                  size="small"
                                  sx={{
                                    backgroundColor: status.bg,
                                    color: status.color,
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                  }}
                                />
                                {isLeaderboard && index < 3 && (
                                  <EmojiEventsIcon sx={{ 
                                    color: fontColor,
                                    fontSize: 20
                                  }} />
                                )}
                              </Box>
                            </Box>

                            {/* Progress Bar */}
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                  Overall Progress
                                </Typography>
                                <Typography variant="body2" sx={{ color: fontColor, fontWeight: 700 }}>
                                  {progress}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: offWhiteColors.subtleBg,
                                  '& .MuiLinearProgress-bar': {
                                    background: progress >= 70 ? 'linear-gradient(90deg, #10b981 0%, #22c55e 100%)' : 
                                               progress >= 50 ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' : 
                                               'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                                    borderRadius: 4
                                  }
                                }}
                              />
                            </Box>

                            {/* Stats Grid */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: offWhiteColors.subtleBg, borderRadius: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                    <MenuBookIcon sx={{ color: fontColor, fontSize: 20, mr: 0.5 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: fontColor }}>
                                      {student.moduleProgresses?.length || 0}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                    Modules
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha(fontColor, 0.05), borderRadius: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                    <StarIcon sx={{ color: fontColor, fontSize: 20, mr: 0.5 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: fontColor }}>
                                      {getTotalStars(student.moduleProgresses)}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                    Stars
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha('#10b981', 0.1), borderRadius: 2 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: fontColor, mb: 1 }}>
                                    {getAverageScore(student.moduleProgresses)}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                    Avg Score
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            {/* Action Button - Details Only */}
                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewDetails(student)}
                              sx={{
                                borderRadius: "12px",
                                backgroundColor: fontColor,
                                py: 1.5,
                                fontWeight: 600,
                                textTransform: 'none',
                                boxShadow: `0 4px 20px ${alpha(fontColor, 0.3)}`,
                                "&:hover": {
                                  backgroundColor: darkMode ? '#5a67d8' : '#1f0750',
                                  boxShadow: `0 6px 25px ${alpha(fontColor, 0.4)}`,
                                  transform: 'translateY(-1px)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ 
                  p: 8, 
                  textAlign: 'center'
                }}>
                  <PersonIcon sx={{ fontSize: 64, color: alpha(fontColor, 0.3), mb: 2 }} />
                  <Typography variant="h5" sx={{ color: alpha(fontColor, 0.7), mb: 1, fontWeight: 600 }}>
                    {searchTerm ? "No students found" : "No students to display"}
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha(fontColor, 0.7) }}>
                    {searchTerm 
                      ? "Try adjusting your search criteria or filters"
                      : "Students will appear here once they start learning modules"
                    }
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Enhanced Detailed Progress Modal */}
      <Dialog
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: '90vh',
            backgroundColor: offWhiteColors.modalBg,
            background: `linear-gradient(135deg, ${gradientColors.modalGradient1} 0%, ${gradientColors.modalGradient2} 100%)`,
            boxShadow: darkMode ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontWeight: 700,
          color: fontColor,
          borderBottom: `1px solid ${alpha(fontColor, 0.1)}`,
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ color: fontColor, mr: 2, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: fontColor }}>
              Detailed Student Progress
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenDetailModal(false)}
            sx={{ 
              color: alpha(fontColor, 0.7),
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
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: fontColor }} />
            </Box>
          ) : detailedProgress ? (
            <Box sx={{ p: 4 }}>
              {/* Student Header */}
              <Paper sx={{ 
                p: 4, 
                mb: 4, 
                backgroundColor: fontColor,
                borderRadius: 3,
                color: 'white'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mr: 3, 
                      backgroundColor: alpha('#ffffff', 0.2),
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 700,
                      border: '3px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {detailedProgress.student.firstName ? detailedProgress.student.firstName[0].toUpperCase() : 'S'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {detailedProgress.student.firstName && detailedProgress.student.lastName 
                        ? `${detailedProgress.student.firstName} ${detailedProgress.student.lastName}`
                        : "Profile Incomplete"
                      }
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                      {detailedProgress.student.email}
                    </Typography>
                    
                    {/* Quick Stats */}
                    <Grid container spacing={2}>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha('#ffffff', 0.15), borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {getOverallProgress(detailedProgress.moduleProgresses)}%
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Overall Progress
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha('#ffffff', 0.15), borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {detailedProgress.moduleProgresses?.length || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Modules
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha('#ffffff', 0.15), borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {getTotalStars(detailedProgress.moduleProgresses)}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Total Stars
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: alpha('#ffffff', 0.15), borderRadius: 2 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {getAverageScore(detailedProgress.moduleProgresses)}%
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            Avg Score
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </Paper>

              {/* Module Progress Details */}
              <Typography variant="h5" sx={{ fontWeight: 700, color: fontColor, mb: 3 }}>
                Module Progress Details
              </Typography>

              {detailedProgress.moduleProgresses?.length > 0 ? (
                <Box sx={{ mb: 4 }}>
                  {detailedProgress.moduleProgresses.map((moduleProgress) => (
                    <Accordion key={moduleProgress.id} sx={{ mb: 3, borderRadius: '16px !important', border: `1px solid ${alpha(fontColor, 0.1)}`, backgroundColor: offWhiteColors.surface }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: fontColor }} />}
                        sx={{ 
                          backgroundColor: offWhiteColors.subtleBg,
                          borderRadius: '16px',
                          p: 2,
                          '&.Mui-expanded': {
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0
                          }
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ 
                              p: 2, 
                              borderRadius: 2, 
                              backgroundColor: fontColor,
                              mr: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: fontColor, mb: 0.5 }}>
                                {moduleProgress.moduleName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7) }}>
                                {moduleProgress.completedLessons} of {moduleProgress.totalLessons} lessons completed
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: fontColor }}>
                                {Math.round((moduleProgress.completedLessons / moduleProgress.totalLessons) * 100)}%
                              </Typography>
                              <Typography variant="caption" sx={{ color: alpha(fontColor, 0.7) }}>
                                Complete
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: alpha(fontColor, 0.05), px: 2, py: 1, borderRadius: 2 }}>
                              <StarIcon sx={{ color: fontColor, fontSize: 16 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: fontColor }}>
                                {moduleProgress.totalStars}
                              </Typography>
                            </Box>
                            {moduleProgress.completed && (
                              <Chip
                                icon={<CheckCircleIcon sx={{ color: '#16a34a' }} />}
                                label="Completed"
                                size="small"
                                sx={{ 
                                  backgroundColor: '#f0fdf4', 
                                  color: '#16a34a',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 4, backgroundColor: offWhiteColors.surface }}>
                        <Grid container spacing={4}>
                          <Grid item xs={12} md={8}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="h6" sx={{ color: fontColor, mb: 2, fontWeight: 600 }}>
                                Progress Overview
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={(moduleProgress.completedLessons / moduleProgress.totalLessons) * 100}
                                sx={{
                                  height: 12,
                                  borderRadius: 6,
                                  backgroundColor: offWhiteColors.subtleBg,
                                  mb: 2,
                                  '& .MuiLinearProgress-bar': {
                                    background: moduleProgress.completed ? 'linear-gradient(90deg, #10b981 0%, #22c55e 100%)' : `linear-gradient(90deg, ${fontColor} 0%, ${alpha(fontColor, 0.7)} 100%)`,
                                    borderRadius: 6
                                  }
                                }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                  {moduleProgress.completedLessons} completed
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                  {moduleProgress.totalLessons - moduleProgress.completedLessons} remaining
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ color: fontColor, mb: 2, fontWeight: 600 }}>
                              Performance Metrics
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: alpha(fontColor, 0.05), border: `1px solid ${alpha(fontColor, 0.1)}` }}>
                                  <Typography variant="h5" sx={{ fontWeight: 700, color: fontColor, mb: 1 }}>
                                    {moduleProgress.totalStars}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                    Stars Earned
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={12}>
                                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: alpha('#2563eb', 0.05), border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#2563eb', mb: 1 }}>
                                    {Math.round(moduleProgress.averageScore)}%
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#1d4ed8', fontWeight: 500 }}>
                                    Average Score
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, backgroundColor: offWhiteColors.subtleBg, borderRadius: 3 }}>
                              <TimerIcon sx={{ color: alpha(fontColor, 0.7), fontSize: 24 }} />
                              <Typography variant="body1" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                <strong>Started:</strong> {formatDate(moduleProgress.createdAt)}
                              </Typography>
                              {moduleProgress.completedAt && (
                                <>
                                  <CheckIcon sx={{ color: '#10b981', fontSize: 24 }} />
                                  <Typography variant="body1" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                    <strong>Completed:</strong> {formatDate(moduleProgress.completedAt)}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  backgroundColor: offWhiteColors.subtleBg,
                  border: `2px dashed ${alpha(fontColor, 0.2)}`,
                  borderRadius: 4
                }}>
                  <SchoolIcon sx={{ fontSize: 64, color: alpha(fontColor, 0.3), mb: 2 }} />
                  <Typography variant="h5" sx={{ color: alpha(fontColor, 0.7), mb: 1, fontWeight: 600 }}>
                    No Module Progress
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha(fontColor, 0.7) }}>
                    This student hasn't started any learning modules yet.
                  </Typography>
                </Paper>
              )}

              {/* Lesson Progress Summary */}
              {detailedProgress.lessonProgresses?.length > 0 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: fontColor, mb: 3 }}>
                    Recent Lesson Activity
                  </Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 3, border: `1px solid ${alpha(fontColor, 0.1)}`, backgroundColor: offWhiteColors.surface }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: offWhiteColors.subtleBg }}>
                          <TableCell sx={{ fontWeight: 700, color: fontColor, py: 2 }}>Lesson</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: fontColor, py: 2 }}>Score</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: fontColor, py: 2 }}>Stars</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: fontColor, py: 2 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: fontColor, py: 2 }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailedProgress.lessonProgresses.slice(0, 10).map((lessonProgress) => (
                          <TableRow key={lessonProgress.id} hover sx={{ '&:hover': { backgroundColor: offWhiteColors.subtleBg } }}>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: fontColor }}>
                                {lessonProgress.lessonTitle}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: fontColor }}>
                                  {lessonProgress.score}
                                </Typography>
                                <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7) }}>
                                  / {lessonProgress.maxScore}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StarIcon sx={{ color: fontColor, fontSize: 18 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600, color: fontColor }}>
                                  {lessonProgress.starsEarned}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Chip
                                icon={lessonProgress.completed ? <CheckIcon /> : <PendingIcon />}
                                label={lessonProgress.completed ? "Completed" : "In Progress"}
                                size="small"
                                sx={{
                                  backgroundColor: lessonProgress.completed ? '#f0fdf4' : '#fffbeb',
                                  color: lessonProgress.completed ? '#16a34a' : '#d97706',
                                  fontWeight: 600
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7), fontWeight: 500 }}>
                                {formatDate(lessonProgress.completedAt || lessonProgress.createdAt)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: alpha(fontColor, 0.7) }}>
                No detailed progress data available
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontWeight: 500,
            backgroundColor: offWhiteColors.cardBg,
            color: fontColor,
            '& .MuiAlert-message': {
              color: fontColor,
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentProgress;