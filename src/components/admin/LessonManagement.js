import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MenuBook as LessonIcon,
  SportsEsports as GameIcon
} from '@mui/icons-material';

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 1,
    displayOrder: 1,
    active: true,
    type: 'multiple_choice',
    moduleId: '',
    activity: ''
  });

  const lessonTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'drag_drop', label: 'Drag & Drop' },
    { value: 'matching', label: 'Matching' },
    { value: 'fill_blanks', label: 'Fill in the Blanks' },
    { value: 'true_false', label: 'True/False' }
  ];

  const activityOptions = [
    {
      value: 'PersonalHygieneLevel1',
      label: 'Personal Hygiene Level 1',
      description: 'Interactive drag-and-drop hygiene categorization game',
      path: '/lesson/hygiene',
      icon: '🧼'
    },
    {
    value: 'PersonalHygieneLevel2',
    label: 'Personal Hygiene Level 2',
    description: 'Daily routine sequencing and hygiene habit formation',
    path: '/lesson/hygiene/level-2',
    icon: '🗓️'
    },
    {
      value: 'PersonalHygieneLevel3',
      label: 'Personal Hygiene Level 3 - Scenarios',
      description: 'Apply hygiene knowledge to real-life situations',
      component: 'PersonalHygieneLevel3',
      path: '/lesson/hygiene/level-3',
      icon: '🎭'
    },
    {
      value: 'cooking-level-1',
      label: 'Cooking Level 1 - Ingredients',
      description: 'Learn basic cooking ingredients identification',
      component: 'CookingLevel1',
      path: '/lesson/cooking/level-1',
      icon: '🥚'
    },
    {
      value: 'cooking-level-2',
      label: 'Cooking Level 2 - Actions',
      description: 'Learn basic cooking actions and techniques',
      component: 'CookingLevel2',
      path: '/lesson/cooking/level-2',
      icon: '👨‍🍳'
    },
    
      {
      value: 'cooking-level-3',
      label: 'Cooking Level 3 - Tools & Actions',
      description: 'Learn cooking tools and advanced techniques',
      component: 'CookingLevel3',
      path: '/lesson/cooking/level-3',
      icon: '🔪'
    },
    {
      value: 'cooking-level-4',
      label: 'Cooking Level 4 - Recipe Assembly',
      description: 'Step-by-step recipe assembly and cooking sequences',
      component: 'CookingLevel4',
      path: '/lesson/cooking/level-4',
      icon: '🍳'
    },
    {
      value: 'HouseholdLevel1',
      label: 'Household Chores Level 1 - Laundry Sorting',
      description: 'Learn to separate clothes by color and type through drag-and-drop',
      component: 'HouseholdLevel1',
      path: '/lesson/household-chores/level-1',
      icon: '👕'
    },
    {
      value: 'SortingLevel1',
      label: 'Food Sorting Level 1',
      description: 'Identify healthy vs. unhealthy food',
      path: '/lesson/food-sorting/level-1',
      icon: '🍎'
    },
    {
      value: 'SortingLevel2',
      label: 'Food Sorting Level 2',
      description: 'Identify fruits, vegetables, or other foods',
      path: '/lesson/food-sorting/level-2',
      icon: '🥦'
    }
  ];

  useEffect(() => {
    fetchLessons();
    fetchModules();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/lessons');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched lessons:', data);
        setLessons(data);
      } else {
        showSnackbar('Failed to fetch lessons', 'error');
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
      showSnackbar('Error fetching lessons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/modules');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched modules:', data);
        setModules(data);
      } else {
        console.error('Failed to fetch modules, status:', response.status);
        showSnackbar('Failed to fetch modules', 'error');
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      showSnackbar('Error fetching modules', 'error');
    }
  };

  const getNextLevelAndOrder = (moduleId) => {
    if (!moduleId) return { nextLevel: 1, nextOrder: 1 };

    const moduleLessons = lessons.filter(lesson => {
      return lesson.moduleId === moduleId || 
             (lesson.module && lesson.module.id === moduleId);
    });

    if (moduleLessons.length === 0) {
      return { nextLevel: 1, nextOrder: 1 };
    }

    const maxLevel = Math.max(...moduleLessons.map(lesson => lesson.level || 1));
    const maxOrder = Math.max(...moduleLessons.map(lesson => lesson.displayOrder || 1));

    return {
      nextLevel: maxLevel + 1,
      nextOrder: maxOrder + 1
    };
  };

  const handleOpenDialog = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      
      let moduleId = '';
      if (lesson.moduleId) {
        moduleId = lesson.moduleId;
      } else if (lesson.module && lesson.module.id) {
        moduleId = lesson.module.id;
      }
      
      console.log('Opening dialog for lesson:', lesson, 'moduleId:', moduleId);
      
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        level: lesson.level || 1,
        displayOrder: lesson.displayOrder || 1,
        active: lesson.active !== false,
        type: lesson.type || 'multiple_choice',
        moduleId: moduleId,
        activity: lesson.activity || ''
      });
    } else {
      setEditingLesson(null);
      setFormData({
        title: '',
        description: '',
        level: 1,
        displayOrder: 1,
        active: true,
        type: 'multiple_choice',
        moduleId: '',
        activity: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLesson(null);
    setFormData({
      title: '',
      description: '',
      level: 1,
      displayOrder: 1,
      active: true,
      type: 'multiple_choice',
      moduleId: '',
      activity: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModuleChange = (moduleId) => {
    const { nextLevel, nextOrder } = getNextLevelAndOrder(moduleId);
    
    setFormData(prev => ({
      ...prev,
      moduleId: moduleId,
      level: editingLesson ? prev.level : nextLevel,
      displayOrder: editingLesson ? prev.displayOrder : nextOrder
    }));
  };

  const handleTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title.trim()) {
        showSnackbar('Title is required', 'error');
        return;
      }
      if (!formData.moduleId) {
        showSnackbar('Please select a module', 'error');
        return;
      }

      const selectedModule = modules.find(m => m.id === formData.moduleId);
      if (!selectedModule) {
        showSnackbar('Selected module not found', 'error');
        return;
      }

      let activityPath = null;
      if (formData.activity) {
        const selectedActivity = activityOptions.find(a => a.value === formData.activity);
        if (selectedActivity) {
          activityPath = selectedActivity.path;
        }
      }

      const lessonData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        level: parseInt(formData.level),
        displayOrder: parseInt(formData.displayOrder),
        active: formData.active,
        type: formData.type,
        activity: formData.activity || null,
        activityPath: activityPath,
        module: {
          id: formData.moduleId,
          name: selectedModule.name
        }
      };

      const url = editingLesson 
        ? `http://localhost:8080/api/lessons/${editingLesson.id}`
        : 'http://localhost:8080/api/lessons';
      
      const method = editingLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });

      if (response.ok) {
        showSnackbar(
          editingLesson ? 'Lesson updated successfully!' : 'Lesson created successfully!',
          'success'
        );
        handleCloseDialog();
        fetchLessons();
      } else {
        const errorData = await response.text();
        showSnackbar(`Failed to ${editingLesson ? 'update' : 'create'} lesson: ${errorData}`, 'error');
      }
    } catch (error) {
      console.error('Error submitting lesson:', error);
      showSnackbar('Error submitting lesson', 'error');
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/lessons/${lessonId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showSnackbar('Lesson deleted successfully!', 'success');
        fetchLessons();
      } else {
        showSnackbar('Failed to delete lesson', 'error');
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      showSnackbar('Error deleting lesson', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getModuleName = (lesson) => {
    if (lesson.moduleName) {
      return lesson.moduleName;
    }
    
    if (lesson.module && lesson.module.name) {
      return lesson.module.name;
    }
    
    if (lesson.moduleId) {
      const module = modules.find(m => m.id === lesson.moduleId);
      if (module) return module.name;
    }
    
    if (lesson.module && lesson.module.id) {
      const module = modules.find(m => m.id === lesson.module.id);
      if (module) return module.name;
    }
    
    console.log('Could not find module for lesson:', lesson);
    return 'Unknown Module';
  };

  const getLessonTypeLabel = (type) => {
    const lessonType = lessonTypes.find(t => t.value === type);
    return lessonType ? lessonType.label : type;
  };

  const getActivityLabel = (activity) => {
    const activityOption = activityOptions.find(a => a.value === activity);
    return activityOption ? activityOption.label : activity;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading lessons...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LessonIcon sx={{ mr: 1, color: '#4a6cf7' }} />
          <Typography variant="h5" fontWeight={600}>
            Lesson Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: '#4a6cf7',
            '&:hover': { backgroundColor: '#3a5ce5' }
          }}
        >
          Add New Lesson
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '10px' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Module</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No lessons found. Create your first lesson!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>
                    <Typography fontWeight={500}>{lesson.title}</Typography>
                    {lesson.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {lesson.description.length > 50 
                          ? `${lesson.description.substring(0, 50)}...` 
                          : lesson.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getModuleName(lesson)} 
                      size="small" 
                      sx={{ backgroundColor: '#e3f2fd' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getLessonTypeLabel(lesson.type)} 
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  </TableCell>
                  <TableCell>
                    {lesson.activity ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GameIcon sx={{ fontSize: 16, color: '#4a6cf7' }} />
                        <Chip 
                          label={getActivityLabel(lesson.activity)} 
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={`Level ${lesson.level}`} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{lesson.displayOrder}</TableCell>
                  <TableCell>
                    <Chip
                      label={lesson.active ? 'Active' : 'Inactive'}
                      color={lesson.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleOpenDialog(lesson)}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(lesson.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Updated Dialog to match Module styling */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '8px',
            backgroundColor: '#f8f9ff',
            border: '3px solid #4CAF50'
          }
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2E7D32',
            textAlign: 'center',
            padding: '24px',
            backgroundColor: '#E8F5E8',
            borderRadius: '12px',
            margin: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: '32px',
              color: '#4CAF50'
            }}
          >
            📖
          </Box>
          {editingLesson ? 'Edit Learning Lesson' : 'Create New Learning Lesson'}
        </DialogTitle>

        <DialogContent sx={{ padding: '24px' }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Lesson Title - Full Width */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#1976D2',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>✏️</span> Lesson Title
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter a clear, engaging title for your lesson"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#2E7D32',
                        borderWidth: '3px'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                        borderWidth: '3px'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px'
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Description - Full Width */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#1976D2',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📝</span> Lesson Description
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Describe what students will learn in this lesson"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      minHeight: '100px',
                      '& fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#2E7D32',
                        borderWidth: '3px'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                        borderWidth: '3px'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px'
                    },
                    '& .MuiInputBase-inputMultiline': {
                      padding: '16px',
                      lineHeight: '1.5'
                    }
                  }}
                />
              </Box>
            </Grid>

            {/* Module Selection - Half Width */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#1976D2',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📚</span> Select Module
                </Typography>
                <FormControl fullWidth required>
                  <Select
                    value={formData.moduleId}
                    onChange={(e) => handleModuleChange(e.target.value)}
                    displayEmpty
                    sx={{
                      fontSize: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4CAF50',
                        borderWidth: '2px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2E7D32',
                        borderWidth: '3px'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '3px'
                      },
                      '& .MuiSelect-select': {
                        padding: '16px'
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>Choose a module...</em>
                    </MenuItem>
                    {modules.map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: module.active ? '#4caf50' : '#bdbdbd' 
                          }} />
                          {module.name || module.title || `Module ${module.id}`}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Lesson Type - Half Width */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#1976D2',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🎯</span> Lesson Type
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    sx={{
                      fontSize: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4CAF50',
                        borderWidth: '2px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2E7D32',
                        borderWidth: '3px'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '3px'
                      },
                      '& .MuiSelect-select': {
                        padding: '16px'
                      }
                    }}
                  >
                    {lessonTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            minWidth: 20, 
                            fontSize: '14px',
                            opacity: 0.7
                          }}>
                            {type.value === 'multiple_choice' && '🔘'}
                            {type.value === 'drag_drop' && '🎯'}
                            {type.value === 'matching' && '🔗'}
                            {type.value === 'fill_blanks' && '📝'}
                            {type.value === 'true_false' && '✅'}
                          </Box>
                          {type.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Activity Selection - Full Width */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#1976D2',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🎮</span> Interactive Activity (Optional)
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={formData.activity}
                    onChange={(e) => handleInputChange('activity', e.target.value)}
                    sx={{
                      fontSize: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#4CAF50',
                        borderWidth: '2px'
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2E7D32',
                        borderWidth: '3px'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976D2',
                        borderWidth: '3px'
                      },
                      '& .MuiSelect-select': {
                        padding: '16px'
                      }
                    }}
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontStyle: 'italic', opacity: 0.7 }}>
                        <span>📄</span>
                        No Interactive Activity
                      </Box>
                    </MenuItem>
                    {activityOptions.map((activity) => (
                      <MenuItem key={activity.value} value={activity.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span style={{ fontSize: '18px' }}>{activity.icon}</span>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {activity.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {activity.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Level, Order, and Status - Three columns */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#1976D2',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>📊</span> Level
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1, max: 10 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#2E7D32',
                        borderWidth: '3px'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                        borderWidth: '3px'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px'
                    }
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#1976D2',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🔢</span> Display Order
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '18px',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      '& fieldset': {
                        borderColor: '#4CAF50',
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#2E7D32',
                        borderWidth: '3px'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1976D2',
                        borderWidth: '3px'
                      }
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px'
                    }
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box 
                sx={{ 
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  minHeight: '96px',
                  backgroundColor: '#fff3e0',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '2px solid #FF9800'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#F57C00',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>🔄</span> Lesson Status
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                      size="large"
                      sx={{
                        '& .MuiSwitch-switchBase': {
                          '&.Mui-checked': {
                            color: '#4CAF50',
                            '& + .MuiSwitch-track': {
                              backgroundColor: '#4CAF50',
                            },
                          },
                        },
                        '& .MuiSwitch-track': {
                          backgroundColor: '#ccc',
                        },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      color: formData.active ? '#4CAF50' : '#666'
                    }}>
                      {formData.active ? '✅ Active' : '❌ Inactive'}
                    </Typography>
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions 
          sx={{ 
            padding: '24px',
            backgroundColor: '#f5f5f5',
            borderRadius: '0 0 12px 12px',
            gap: '16px',
            justifyContent: 'center'
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            size="large"
            sx={{
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '25px',
              backgroundColor: '#f44336',
              color: 'white',
              minWidth: '120px',
              '&:hover': {
                backgroundColor: '#d32f2f',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            ❌ Cancel
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.title || !formData.moduleId}
            size="large"
            sx={{
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '12px 24px',
              borderRadius: '25px',
              backgroundColor: '#4CAF50',
              minWidth: '120px',
              '&:hover': {
                backgroundColor: '#45a049',
                transform: 'scale(1.05)'
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
                color: '#666666'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {editingLesson ? '💾 Update Lesson' : '✅ Create Lesson'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LessonManagement;