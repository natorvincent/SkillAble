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
      label: 'Cooking Level 3 - Actions',
      description: 'Learn basic cooking actions and techniques',
      component: 'CookingLevel3',
      path: '/lesson/cooking/level-3',
      icon: '👨‍🍳'
    },
    {
      value: 'SortingLevel1',
      label: 'Food Sorting Level 1',
      description: 'Identify healthy vs. unhealthy food',
      path: '/lesson/food-sorting',
      icon: '🍎'
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

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#f8f9fa', 
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <LessonIcon sx={{ color: '#4a6cf7' }} />
          <Typography variant="h6" fontWeight={600}>
            {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#f0f7ff', 
                borderRadius: '8px', 
                border: '1px solid #bde0ff',
                mb: 2
              }}>
                <Typography variant="body2" color="#1565c0" fontWeight={500}>
                  💡 Tip: Select a module first to automatically assign the next level and display order
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Lesson Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                multiline
                rows={3}
                placeholder="Describe what students will learn in this lesson..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px'
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Module</InputLabel>
                <Select
                  value={formData.moduleId}
                  onChange={(e) => handleModuleChange(e.target.value)}
                  label="Module"
                  sx={{ borderRadius: '8px' }}
                >
                  {modules.length === 0 ? (
                    <MenuItem disabled>
                      <em>No modules available</em>
                    </MenuItem>
                  ) : (
                    modules.map((module) => (
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
                    ))
                  )}
                </Select>
              </FormControl>
              {modules.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  ⚠️ No modules found. Please create a module first.
                </Typography>
              )}
              {formData.moduleId && !editingLesson && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block', fontWeight: 500 }}>
                  ✓ Level and order will be auto-assigned
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lesson Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  label="Lesson Type"
                  sx={{ borderRadius: '8px' }}
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
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Activity (Optional)</InputLabel>
                <Select
                  value={formData.activity}
                  onChange={(e) => handleInputChange('activity', e.target.value)}
                  label="Activity (Optional)"
                  sx={{ borderRadius: '8px' }}
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
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                🎮 Interactive activities provide hands-on learning experiences
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Level"
                type="number"
                value={formData.level}
                onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 10 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: !editingLesson && formData.moduleId ? '#f0f7ff' : 'inherit'
                  }
                }}
                helperText={!editingLesson && formData.moduleId ? 
                  `🎯 Auto-assigned: Level ${getNextLevelAndOrder(formData.moduleId).nextLevel}` : 
                  'Difficulty level (1-10)'
                }
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Display Order"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: !editingLesson && formData.moduleId ? '#f0f7ff' : 'inherit'
                  }
                }}
                helperText={!editingLesson && formData.moduleId ? 
                  `📋 Auto-assigned: Order ${getNextLevelAndOrder(formData.moduleId).nextOrder}` : 
                  'Order in module sequence'
                }
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={(e) => handleInputChange('active', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span>{formData.active ? '✅' : '⏸️'}</span>
                      {formData.active ? 'Active' : 'Inactive'}
                    </Box>
                  }
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {formData.active ? 'Students can access this lesson' : 'Hidden from students'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          backgroundColor: '#f8f9fa', 
          borderTop: '1px solid #e9ecef',
          gap: 1
        }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: '#6c757d',
              '&:hover': {
                backgroundColor: '#e9ecef'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            startIcon={editingLesson ? <EditIcon /> : <AddIcon />}
            sx={{
              backgroundColor: '#4a6cf7',
              '&:hover': { backgroundColor: '#3a5ce5' },
              borderRadius: '8px',
              px: 3
            }}
          >
            {editingLesson ? 'Update Lesson' : 'Create Lesson'}
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