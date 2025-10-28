import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Button,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TuneIcon from '@mui/icons-material/Tune';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';

const StudentDifficultyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('studentId');
  
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [studentDifficulties, setStudentDifficulties] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
      fetchLessonsAndDifficulties();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/students/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const studentData = await response.json();
        setStudent(studentData);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setSnackbar({
        open: true,
        message: 'Error loading student data',
        severity: 'error'
      });
    }
  };

  const fetchLessonsAndDifficulties = async () => {
    if (!studentId) return;
    
    setLoading(true);
    try {
      // Fetch all lessons
      const lessonsResponse = await fetch('https://skillable-pdv0.onrender.com/api/lessons', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData);

        // Fetch student difficulties for all lessons
        const difficultiesResponse = await fetch(`https://skillable-pdv0.onrender.com/api/difficulty/student-difficulties/${studentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (difficultiesResponse.ok) {
          const difficultiesData = await difficultiesResponse.json();
          const difficultyMap = {};
          
          // Create a map of existing difficulties
          difficultiesData.difficulties.forEach(item => {
            difficultyMap[item.lessonId] = item.difficulty;
          });
          
          // Set default 'easy' for lessons without assigned difficulty
          lessonsData.forEach(lesson => {
            if (!difficultyMap[lesson.id]) {
              difficultyMap[lesson.id] = 'easy';
            }
          });
          
          setStudentDifficulties(difficultyMap);
        }
      }
    } catch (error) {
      console.error('Error fetching lessons and difficulties:', error);
      setSnackbar({
        open: true,
        message: 'Error loading lesson data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDifficultyChange = (lessonId, difficulty) => {
    setStudentDifficulties(prev => ({
      ...prev,
      [lessonId]: difficulty
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(studentDifficulties).map(([lessonId, difficulty]) => {
        return fetch('https://skillable-pdv0.onrender.com/api/difficulty/set-student-difficulty', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            studentId: parseInt(studentId),
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
        setHasChanges(false);
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
      setSaving(false);
    }
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

  if (!studentId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          No student ID provided. Please select a student to manage their difficulty levels.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ 
              mr: 2,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <TuneIcon sx={{ color: '#6366f1', mr: 2, fontSize: 32 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Manage Difficulty Levels
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b', mt: 0.5 }}>
              Set personalized difficulty for each lesson
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Student Info */}
      {student && (
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
                  {student.firstName} {student.lastName}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                  {student.email}
                </Typography>
                <Chip
                  label={`Student ID: ${student.id}`}
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

      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: '#64748b' }}>
            Loading lessons...
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
            Lesson Difficulty Settings
          </Typography>

          <Grid container spacing={3}>
            {lessons.map((lesson) => (
              <Grid item xs={12} sm={6} lg={4} key={lesson.id}>
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
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>
                        {lesson.title}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#64748b', mb: 3, minHeight: '40px' }}>
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

                    <Divider sx={{ mb: 2 }} />

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

          {hasChanges && (
            <Alert 
              severity="info" 
              sx={{ mt: 4, borderRadius: 2 }}
              action={
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAll}
                  disabled={saving}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {saving ? 'Saving...' : 'Save All Changes'}
                </Button>
              }
            >
              You have unsaved changes. Click "Save All Changes" to apply them.
            </Alert>
          )}

          {/* Fixed Save Button */}
          {hasChanges && (
            <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
              <Button
                onClick={handleSaveAll}
                variant="contained"
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5b5bd6 0%, #7c3aed 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </Box>
          )}
        </>
      )}

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
    </Container>
  );
};

export default StudentDifficultyPage;