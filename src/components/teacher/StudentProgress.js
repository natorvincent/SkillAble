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
  IconButton
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
import Navbar from "../Navbar";
import Background from "../Background";

function StudentProgress() {
  const [loading, setLoading] = useState(true);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailedProgress, setDetailedProgress] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }

    fetchStudentsProgress();
  }, [navigate]);

  const fetchStudentsProgress = async () => {
    try {
      const teacherEmail = localStorage.getItem("userEmail");
      const response = await fetch(`http://localhost:8080/api/progress/teacher/${teacherEmail}/students-progress`, {
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
      setLoading(false);
    } catch (err) {
      console.error("Error fetching students progress:", err);
      setStudentsProgress([]);
      setLoading(false);
    }
  };

  const fetchDetailedProgress = async (studentId) => {
    setLoadingDetail(true);
    try {
      const teacherEmail = localStorage.getItem("userEmail");
      const response = await fetch(`http://localhost:8080/api/progress/teacher/${teacherEmail}/student/${studentId}/detailed`, {
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

  const formatDate = (dateString) => {
    if (!dateString) return "Not started";
    return new Date(dateString).toLocaleDateString();
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
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: "12px",
                backgroundColor: "#4a6cf7",
                color: "white",
                "&:hover": {
                  backgroundColor: "#3a5ce5"
                },
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Back
            </Button>
          </Box>
          
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
              <AssessmentIcon sx={{ color: '#4a6cf7', mr: 2, fontSize: 36 }} />
              <Box>
                <Typography variant="h4" color="#2d3748" fontWeight={700}>
                  Student Progress
                </Typography>
                <Typography variant="body1" color="#4a5568" sx={{ mt: 0.5 }}>
                  Track your students' learning progress and performance
                </Typography>
              </Box>
            </Box>

            {studentsProgress.length > 0 ? (
              <Grid container spacing={3}>
                {studentsProgress.map((student) => (
                  <Grid item xs={12} md={6} lg={4} key={student.id}>
                    <Card sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      border: '1px solid #e0e0e0',
                      boxShadow: "none",
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <Avatar 
                            sx={{ 
                              width: 50, 
                              height: 50, 
                              mr: 2, 
                              backgroundColor: '#4a6cf7',
                              fontSize: '1.2rem',
                              fontWeight: 600
                            }}
                          >
                            {student.firstName ? student.firstName[0].toUpperCase() : 'S'}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight={600} color="#2d3748">
                              {student.firstName && student.lastName 
                                ? `${student.firstName} ${student.lastName}`
                                : "Profile Incomplete"
                              }
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                              {student.email}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="#4a5568" fontWeight={500}>
                              Overall Progress
                            </Typography>
                            <Typography variant="body2" color="#4a6cf7" fontWeight={600}>
                              {getOverallProgress(student.moduleProgresses)}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={getOverallProgress(student.moduleProgresses)} 
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#e5e7eb',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: '#4a6cf7',
                                borderRadius: 4
                              }
                            }}
                          />
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="#2d3748">
                                {student.moduleProgresses?.length || 0}
                              </Typography>
                              <Typography variant="caption" color="#6b7280">
                                Modules
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <StarIcon sx={{ color: '#fbbf24', fontSize: 20, mr: 0.5 }} />
                                <Typography variant="h6" fontWeight={600} color="#2d3748">
                                  {getTotalStars(student.moduleProgresses)}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="#6b7280">
                                Stars
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h6" fontWeight={600} color="#2d3748">
                                {getAverageScore(student.moduleProgresses)}%
                              </Typography>
                              <Typography variant="caption" color="#6b7280">
                                Avg Score
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetails(student)}
                          sx={{
                            borderRadius: "12px",
                            backgroundColor: "#4a6cf7",
                            "&:hover": {
                              backgroundColor: "#3a5ce5"
                            },
                            fontWeight: 600,
                            textTransform: 'none'
                          }}
                        >
                          View Details
                        </Button>
                      </CardContent>
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
                <PersonIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                <Typography variant="h6" color="#4a5568" gutterBottom>
                  No Students Found
                </Typography>
                <Typography variant="body1" color="#4a5568">
                  You haven't assigned any students yet or your students haven't started any modules.
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </div>

      <Dialog
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontWeight: 600,
          color: '#2d3748'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ color: '#4a6cf7', mr: 1 }} />
            Student Progress Details
          </Box>
          <IconButton
            onClick={() => setOpenDetailModal(false)}
            sx={{ color: '#6b7280' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {loadingDetail ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: "#4a6cf7" }} />
            </Box>
          ) : detailedProgress ? (
            <Box>
              <Paper sx={{ 
                p: 3, 
                mb: 3, 
                backgroundColor: '#f8f9ff',
                border: '1px solid #e3e8ff',
                borderRadius: '12px'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      mr: 3, 
                      backgroundColor: '#4a6cf7',
                      fontSize: '1.5rem',
                      fontWeight: 600
                    }}
                  >
                    {detailedProgress.student.firstName ? detailedProgress.student.firstName[0].toUpperCase() : 'S'}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={600} color="#2d3748">
                      {detailedProgress.student.firstName && detailedProgress.student.lastName 
                        ? `${detailedProgress.student.firstName} ${detailedProgress.student.lastName}`
                        : "Profile Incomplete"
                      }
                    </Typography>
                    <Typography variant="body1" color="#6b7280">
                      {detailedProgress.student.email}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              <Typography variant="h6" fontWeight={600} color="#2d3748" sx={{ mb: 2 }}>
                Module Progress
              </Typography>

              {detailedProgress.moduleProgresses?.length > 0 ? (
                detailedProgress.moduleProgresses.map((moduleProgress) => (
                  <Accordion key={moduleProgress.id} sx={{ mb: 2, borderRadius: '12px !important' }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        '&.Mui-expanded': {
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0
                        }
                      }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon sx={{ color: '#4a6cf7', mr: 2 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {moduleProgress.moduleName}
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                              {moduleProgress.completedLessons} of {moduleProgress.totalLessons} lessons completed
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            icon={<StarIcon />}
                            label={`${moduleProgress.totalStars} stars`}
                            sx={{ backgroundColor: '#fef3c7', color: '#d97706' }}
                            size="small"
                          />
                          {moduleProgress.completed && (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Completed"
                              color="success"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                            <Typography variant="h6" fontWeight={600} color="#16a34a">
                              {Math.round((moduleProgress.completedLessons / moduleProgress.totalLessons) * 100)}%
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                              Progress
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                            <Typography variant="h6" fontWeight={600} color="#d97706">
                              {moduleProgress.totalStars}
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                              Stars
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                            <Typography variant="h6" fontWeight={600} color="#2563eb">
                              {Math.round(moduleProgress.averageScore)}%
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                              Avg Score
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
                            <Typography variant="h6" fontWeight={600} color="#7c3aed">
                              {formatDate(moduleProgress.completedAt)}
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                              Completed
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px dashed #dee2e6'
                }}>
                  <SchoolIcon sx={{ fontSize: 40, color: '#9ca3af', mb: 1 }} />
                  <Typography variant="body1" color="#6b7280">
                    No module progress found for this student.
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Typography>No data available</Typography>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentProgress;