import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  useTheme,
  alpha,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import SaveIcon from '@mui/icons-material/Save';
import Navbar from "../Navbar";
import Background from "../Background";

function StudentProgress() {
  const [loading, setLoading] = useState(true);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailedProgress, setDetailedProgress] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openDifficultyModal, setOpenDifficultyModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [completionStats, setCompletionStats] = useState({
    averageCompletion: 0,
    totalStudents: 0,
    activeStudents: 0,
    completedModules: 0
  });

  // Difficulty management state
  const [lessons, setLessons] = useState([]);
  const [studentDifficulties, setStudentDifficulties] = useState({});
  const [loadingDifficulties, setLoadingDifficulties] = useState(false);
  const [savingDifficulties, setSavingDifficulties] = useState(false);
  const [difficultyChanges, setDifficultyChanges] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }

    fetchStudentsProgress();
    fetchLessons();
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

  const fetchLessons = async () => {
    try {
      const response = await fetch('https://skillable-pdv0.onrender.com/api/lessons', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const lessonsData = await response.json();
        setLessons(lessonsData);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchStudentDifficulties = async (studentId) => {
    setLoadingDifficulties(true);
    try {
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/difficulty/student-difficulties/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const difficultiesData = await response.json();
        const difficultyMap = {};
        
        // Create a map of existing difficulties
        difficultiesData.difficulties.forEach(item => {
          difficultyMap[item.lessonId] = item.difficulty;
        });
        
        // Set default 'easy' for lessons without assigned difficulty
        lessons.forEach(lesson => {
          if (!difficultyMap[lesson.id]) {
            difficultyMap[lesson.id] = 'easy';
          }
        });
        
        setStudentDifficulties(difficultyMap);
      }
    } catch (error) {
      console.error('Error fetching student difficulties:', error);
      setSnackbar({
        open: true,
        message: 'Error loading difficulty data',
        severity: 'error'
      });
    } finally {
      setLoadingDifficulties(false);
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

  const handleManageDifficulty = (student) => {
    setSelectedStudent(student);
    setOpenDifficultyModal(true);
    fetchStudentDifficulties(student.id);
  };

  const handleDifficultyChange = (lessonId, difficulty) => {
    setStudentDifficulties(prev => ({
      ...prev,
      [lessonId]: difficulty
    }));
    setDifficultyChanges(true);
  };

  const handleSaveDifficulties = async () => {
    setSavingDifficulties(true);
    try {
      const promises = Object.entries(studentDifficulties).map(([lessonId, difficulty]) => {
        return fetch('https://skillable-pdv0.onrender.com/api/difficulty/set-student-difficulty', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            lessonId: parseInt(lessonId),
            difficulty: difficulty
          })
        });
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every(response => response.ok);

      if (allSuccessful) {
        setSnackbar({
          open: true,
          message: 'Difficulty levels saved successfully!',
          severity: 'success'
        });
        setDifficultyChanges(false);
      } else {
        throw new Error('Some updates failed');
      }
    } catch (error) {
      console.error('Error saving difficulties:', error);
      setSnackbar({
        open: true,
        message: 'Error saving difficulty levels',
        severity: 'error'
      });
    } finally {
      setSavingDifficulties(false);
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

  const getProgressStatus = (progress) => {
    if (progress >= 90) return { label: 'Excellent', color: '#10b981', bg: '#f0fdf4' };
    if (progress >= 70) return { label: 'Good', color: '#22c55e', bg: '#f0fdf4' };
    if (progress >= 50) return { label: 'Average', color: '#f59e0b', bg: '#fffbeb' };
    if (progress > 0) return { label: 'Needs Help', color: '#ef4444', bg: '#fef2f2' };
    return { label: 'Not Started', color: '#6b7280', bg: '#f9fafb' };
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return { color: '#16a34a', bg: '#f0fdf4' };
      case 'intermediate': return { color: '#d97706', bg: '#fffbeb' };
      case 'difficult': return { color: '#dc2626', bg: '#fef2f2' };
      default: return { color: '#6b7280', bg: '#f9fafb' };
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🌟';
      case 'intermediate': return '⭐';
      case 'difficult': return '🏆';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not started";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
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
        <div style={{ 
          position: "relative", 
          zIndex: 1,
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh"
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ color: "#6366f1", mb: 2 }} size={48} />
            <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 500 }}>
              Loading student progress...
            </Typography>
          </Box>
        </div>
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
        
        <Container maxWidth="xl" sx={{ paddingTop: 4, paddingBottom: 6 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                mb: 3,
                borderColor: alpha("#ffffff", 0.3),
                color: "#ffffff",
                backgroundColor: alpha("#ffffff", 0.1),
                backdropFilter: 'blur(10px)',
                "&:hover": {
                  borderColor: alpha("#ffffff", 0.5),
                  backgroundColor: alpha("#ffffff", 0.2)
                }
              }}
            >
              Back to Dashboard
            </Button>
            
            <Typography variant="h3" sx={{ 
              fontWeight: 800,
              color: "#ffffff",
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Student Progress & Difficulty Management
            </Typography>
            <Typography variant="h6" sx={{ 
              color: alpha("#ffffff", 0.9),
              fontWeight: 400
            }}>
              Track performance and customize difficulty levels for each student
            </Typography>
          </Box>

          {/* Overview Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                backgroundColor: alpha("#ffffff", 0.95),
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: 'blur(10px)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                      {completionStats.averageCompletion}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                      Average Completion
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: alpha('#6366f1', 0.1) 
                  }}>
                    <TrendingUpIcon sx={{ color: '#6366f1', fontSize: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                backgroundColor: alpha("#ffffff", 0.95),
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: 'blur(10px)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                      {completionStats.activeStudents}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                      Active Students
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: alpha('#10b981', 0.1) 
                  }}>
                    <PersonIcon sx={{ color: '#10b981', fontSize: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                backgroundColor: alpha("#ffffff", 0.95),
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: 'blur(10px)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                      {completionStats.completedModules}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                      Completed Modules
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: alpha('#f59e0b', 0.1) 
                  }}>
                    <EmojiEventsIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                backgroundColor: alpha("#ffffff", 0.95),
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: 'blur(10px)'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                      {completionStats.totalStudents}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                      Total Students
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: alpha('#8b5cf6', 0.1) 
                  }}>
                    <SchoolIcon sx={{ color: '#8b5cf6', fontSize: 32 }} />
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Main Content */}
          <Paper
            sx={{ 
              backgroundColor: alpha("#ffffff", 0.95),
              borderRadius: "24px",
              mb: 4,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              backdropFilter: 'blur(10px)',
              overflow: 'hidden'
            }}
          >
            {/* Header with Search and Filters */}
            <Box sx={{ p: 4, borderBottom: "1px solid #e2e8f0" }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AssessmentIcon sx={{ color: '#6366f1', mr: 2, fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                      Student Performance Overview
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      Monitor progress and adjust learning difficulty
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
                        <SearchIcon sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    width: 320,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        borderColor: "#6366f1"
                      },
                      "&.Mui-focused": {
                        borderColor: "#6366f1",
                        boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)"
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
                    backgroundColor: '#6366f1',
                    height: 3,
                    borderRadius: '2px 2px 0 0'
                  }
                }}
              >
                <Tab label={`All Students (${studentsProgress.length})`} />
                <Tab label={`Active (${studentsProgress.filter(s => s.moduleProgresses?.length > 0).length})`} />
                <Tab 
                  icon={<LeaderboardIcon />}
                  iconPosition="start"
                  label={`Leaderboard (${studentsProgress.filter(s => s.moduleProgresses?.length > 0).length})`} 
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
                          border: isLeaderboard && index < 3 ? '2px solid #fbbf24' : '1px solid #e2e8f0',
                          boxShadow: isLeaderboard && index < 3 ? "0 8px 32px rgba(251, 191, 36, 0.3)" : "0 4px 20px rgba(0,0,0,0.05)",
                          background: isLeaderboard && index < 3 ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' : 'white',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: isLeaderboard && index < 3 ? '0 16px 48px rgba(251, 191, 36, 0.4)' : '0 12px 40px rgba(0,0,0,0.15)',
                            borderColor: isLeaderboard && index < 3 ? '#f59e0b' : '#6366f1'
                          }
                        }}>
                          {isLeaderboard && (
                            <Box sx={{ 
                              position: 'absolute', 
                              top: -8, 
                              right: 16, 
                              backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#fb7185' : '#6366f1',
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
                                    (index === 0 ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' :
                                     index === 1 ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' :
                                     'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)') :
                                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                  fontSize: '1.25rem',
                                  fontWeight: 700,
                                  boxShadow: isLeaderboard && index < 3 ? '0 6px 24px rgba(251, 191, 36, 0.4)' : '0 4px 20px rgba(99, 102, 241, 0.3)'
                                }}
                              >
                                {student.firstName ? student.firstName[0].toUpperCase() : 'S'}
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                                  {student.firstName && student.lastName 
                                    ? `${student.firstName} ${student.lastName}`
                                    : "Profile Incomplete"
                                  }
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b" }}>
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
                                    color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#fb7185',
                                    fontSize: 20
                                  }} />
                                )}
                              </Box>
                            </Box>

                            {/* Progress Bar */}
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                  Overall Progress
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#6366f1", fontWeight: 700 }}>
                                  {progress}%
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: '#f1f5f9',
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
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f8fafc', borderRadius: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                    <MenuBookIcon sx={{ color: '#6366f1', fontSize: 20, mr: 0.5 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                      {student.moduleProgresses?.length || 0}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Modules
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fef3c7', borderRadius: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                    <StarIcon sx={{ color: '#f59e0b', fontSize: 20, mr: 0.5 }} />
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                      {getTotalStars(student.moduleProgresses)}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Stars
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0fdf4', borderRadius: 2 }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                                    {getAverageScore(student.moduleProgresses)}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                                    Avg Score
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<TuneIcon />}
                                onClick={() => handleManageDifficulty(student)}
                                sx={{
                                  borderRadius: "12px",
                                  py: 1.5,
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  borderColor: '#f59e0b',
                                  color: '#d97706',
                                  backgroundColor: '#fffbeb',
                                  "&:hover": {
                                    borderColor: '#d97706',
                                    backgroundColor: '#fef3c7',
                                    transform: 'translateY(-1px)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                Difficulty
                              </Button>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewDetails(student)}
                                sx={{
                                  borderRadius: "12px",
                                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                  py: 1.5,
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
                                  "&:hover": {
                                    boxShadow: '0 6px 25px rgba(99, 102, 241, 0.4)',
                                    transform: 'translateY(-1px)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                Details
                              </Button>
                            </Box>
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
                  <PersonIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: "#64748b", mb: 1, fontWeight: 600 }}>
                    {searchTerm ? "No students found" : "No students to display"}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#64748b" }}>
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
      </div>

      {/* Difficulty Management Modal */}
      <Dialog
        open={openDifficultyModal}
        onClose={() => setOpenDifficultyModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontWeight: 700,
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TuneIcon sx={{ color: '#6366f1', mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Manage Difficulty Levels
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Set personalized difficulty for {selectedStudent?.firstName} {selectedStudent?.lastName}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={() => setOpenDifficultyModal(false)}
            sx={{ 
              color: '#64748b',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {/* Student Header */}
          {selectedStudent && (
            <Card sx={{ 
              mb: 4,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ fontSize: 48, mr: 2, opacity: 0.9 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                      {selectedStudent.email}
                    </Typography>
                    <Chip
                      label={`Student ID: ${selectedStudent.id}`}
                      size="small"
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {loadingDifficulties ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress sx={{ color: "#6366f1", mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#64748b' }}>
                Loading lesson difficulties...
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
                Lesson Difficulty Settings
              </Typography>

              <Grid container spacing={3}>
                {lessons.map((lesson) => (
                  <Grid item xs={12} sm={6} key={lesson.id}>
                    <Card sx={{ 
                      height: '100%',
                      border: '1px solid #e2e8f0',
                      borderRadius: 3,
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <SchoolIcon sx={{ color: '#6366f1', mr: 2, fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {lesson.title}
                          </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                          {lesson.description}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ mr: 1, fontWeight: 500 }}>
                              Current:
                            </Typography>
                            <Chip
                              label={`${getDifficultyIcon(studentDifficulties[lesson.id] || 'easy')} ${(studentDifficulties[lesson.id] || 'easy').charAt(0).toUpperCase() + (studentDifficulties[lesson.id] || 'easy').slice(1)}`}
                              size="small"
                              sx={{
                                backgroundColor: getDifficultyColor(studentDifficulties[lesson.id] || 'easy').bg,
                                color: getDifficultyColor(studentDifficulties[lesson.id] || 'easy').color,
                                fontWeight: 600
                              }}
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <FormControl fullWidth size="small">
                          <InputLabel>Set Difficulty</InputLabel>
                          <Select
                            value={studentDifficulties[lesson.id] || 'easy'}
                            label="Set Difficulty"
                            onChange={(e) => handleDifficultyChange(lesson.id, e.target.value)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2
                              }
                            }}
                          >
                            <MenuItem value="easy">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px' }}>🌟</span>
                                Easy
                              </Box>
                            </MenuItem>
                            <MenuItem value="intermediate">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px' }}>⭐</span>
                                Intermediate
                              </Box>
                            </MenuItem>
                            <MenuItem value="difficult">
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '8px' }}>🏆</span>
                                Difficult
                              </Box>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {difficultyChanges && (
                <Alert 
                  severity="info" 
                  sx={{ mt: 3, borderRadius: 2 }}
                  action={
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveDifficulties}
                      disabled={savingDifficulties}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      {savingDifficulties ? 'Saving...' : 'Save Changes'}
                    </Button>
                  }
                >
                  You have unsaved changes. Click "Save Changes" to apply them.
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => setOpenDifficultyModal(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748b',
              borderColor: '#d1d5db',
              '&:hover': {
                borderColor: '#6366f1',
                color: '#6366f1'
              }
            }}
          >
            Close
          </Button>
          <Button
            onClick={handleSaveDifficulties}
            variant="contained"
            disabled={!difficultyChanges || savingDifficulties}
            startIcon={<SaveIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b5bd6 0%, #7c3aed 100%)'
              }
            }}
          >
            {savingDifficulties ? 'Saving...' : 'Save All Changes'}
          </Button>
        </DialogActions>
      </Dialog>

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
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontWeight: 700,
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0',
          pb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ color: '#6366f1', mr: 2, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Detailed Student Progress
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpenDetailModal(false)}
            sx={{ 
              color: '#64748b',
              backgroundColor: alpha('#6366f1', 0.1),
              '&:hover': {
                backgroundColor: alpha('#6366f1', 0.2),
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
              <CircularProgress sx={{ color: "#6366f1" }} />
            </Box>
          ) : detailedProgress ? (
            <Box sx={{ p: 4 }}>
              {/* Student Header */}
              <Paper sx={{ 
                p: 4, 
                mb: 4, 
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
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
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}>
                Module Progress Details
              </Typography>

              {detailedProgress.moduleProgresses?.length > 0 ? (
                <Box sx={{ mb: 4 }}>
                  {detailedProgress.moduleProgresses.map((moduleProgress) => (
                    <Accordion key={moduleProgress.id} sx={{ mb: 3, borderRadius: '16px !important', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ 
                          backgroundColor: '#f8fafc',
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
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              mr: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                                {moduleProgress.moduleName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#64748b" }}>
                                {moduleProgress.completedLessons} of {moduleProgress.totalLessons} lessons completed
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                                {Math.round((moduleProgress.completedLessons / moduleProgress.totalLessons) * 100)}%
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#64748b" }}>
                                Complete
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: '#fef3c7', px: 2, py: 1, borderRadius: 2 }}>
                              <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#d97706' }}>
                                {moduleProgress.totalStars}
                              </Typography>
                            </Box>
                            {moduleProgress.completed && (
                              <Chip
                                icon={<CheckCircleIcon />}
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
                      <AccordionDetails sx={{ p: 4, backgroundColor: 'white' }}>
                        <Grid container spacing={4}>
                          <Grid item xs={12} md={8}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="h6" sx={{ color: "#1e293b", mb: 2, fontWeight: 600 }}>
                                Progress Overview
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={(moduleProgress.completedLessons / moduleProgress.totalLessons) * 100}
                                sx={{
                                  height: 12,
                                  borderRadius: 6,
                                  backgroundColor: '#f1f5f9',
                                  mb: 2,
                                  '& .MuiLinearProgress-bar': {
                                    background: moduleProgress.completed ? 'linear-gradient(90deg, #10b981 0%, #22c55e 100%)' : 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                                    borderRadius: 6
                                  }
                                }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                  {moduleProgress.completedLessons} completed
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                                  {moduleProgress.totalLessons - moduleProgress.completedLessons} remaining
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ color: "#1e293b", mb: 2, fontWeight: 600 }}>
                              Performance Metrics
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }}>
                                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#d97706", mb: 1 }}>
                                    {moduleProgress.totalStars}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "#92400e", fontWeight: 500 }}>
                                    Stars Earned
                                  </Typography>
                                </Paper>
                              </Grid>
                              <Grid item xs={12}>
                                <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#dbeafe', border: '1px solid #93c5fd' }}>
                                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#2563eb", mb: 1 }}>
                                    {Math.round(moduleProgress.averageScore)}%
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "#1d4ed8", fontWeight: 500 }}>
                                    Average Score
                                  </Typography>
                                </Paper>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, backgroundColor: '#f8fafc', borderRadius: 3 }}>
                              <TimerIcon sx={{ color: '#64748b', fontSize: 24 }} />
                              <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 500 }}>
                                <strong>Started:</strong> {formatDate(moduleProgress.createdAt)}
                              </Typography>
                              {moduleProgress.completedAt && (
                                <>
                                  <CheckIcon sx={{ color: '#10b981', fontSize: 24 }} />
                                  <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 500 }}>
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
                  backgroundColor: '#f8fafc',
                  border: '2px dashed #cbd5e1',
                  borderRadius: 4
                }}>
                  <SchoolIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="h5" sx={{ color: "#64748b", mb: 1, fontWeight: 600 }}>
                    No Module Progress
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#64748b" }}>
                    This student hasn't started any learning modules yet.
                  </Typography>
                </Paper>
              )}

              {/* Lesson Progress Summary */}
              {detailedProgress.lessonProgresses?.length > 0 && (
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b", mb: 3 }}>
                    Recent Lesson Activity
                  </Typography>
                  <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 700, color: "#1e293b", py: 2 }}>Lesson</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1e293b", py: 2 }}>Score</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1e293b", py: 2 }}>Stars</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1e293b", py: 2 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#1e293b", py: 2 }}>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailedProgress.lessonProgresses.slice(0, 10).map((lessonProgress) => (
                          <TableRow key={lessonProgress.id} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600, color: "#1e293b" }}>
                                {lessonProgress.lessonTitle}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  {lessonProgress.score}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "#64748b" }}>
                                  / {lessonProgress.maxScore}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
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
                              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
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
              <Typography variant="h6" sx={{ color: "#64748b" }}>
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
            fontWeight: 500
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default StudentProgress;