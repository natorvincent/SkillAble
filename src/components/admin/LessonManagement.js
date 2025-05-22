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
  MenuBook as LessonIcon
} from '@mui/icons-material';

const LessonManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 1,
    displayOrder: 1,
    active: true,
    type: 'multiple_choice',
    moduleId: ''
  });

  const lessonTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'drag_drop', label: 'Drag & Drop' },
    { value: 'matching', label: 'Matching' },
    { value: 'fill_blanks', label: 'Fill in the Blanks' },
    { value: 'true_false', label: 'True/False' }
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
        console.log('Fetched lessons:', data); // Debug log
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
        console.log('Fetched modules:', data); // Debug log
        console.log('Number of modules:', data.length); // Debug log
        console.log('First module structure:', data[0]); // Debug log
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

  const handleOpenDialog = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      
      // Determine moduleId from various possible sources
      let moduleId = '';
      if (lesson.moduleId) {
        moduleId = lesson.moduleId;
      } else if (lesson.module && lesson.module.id) {
        moduleId = lesson.module.id;
      }
      
      console.log('Opening dialog for lesson:', lesson, 'moduleId:', moduleId); // Debug log
      
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        level: lesson.level || 1,
        displayOrder: lesson.displayOrder || 1,
        active: lesson.active !== false,
        type: lesson.type || 'multiple_choice',
        moduleId: moduleId
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
        moduleId: ''
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
      moduleId: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!formData.title.trim()) {
        showSnackbar('Title is required', 'error');
        return;
      }
      if (!formData.moduleId) {
        showSnackbar('Please select a module', 'error');
        return;
      }

      // Find the selected module
      const selectedModule = modules.find(m => m.id === formData.moduleId);
      if (!selectedModule) {
        showSnackbar('Selected module not found', 'error');
        return;
      }

      const lessonData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        level: parseInt(formData.level),
        displayOrder: parseInt(formData.displayOrder),
        active: formData.active,
        type: formData.type,
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
    // Check if lesson has moduleName (from DTO)
    if (lesson.moduleName) {
      return lesson.moduleName;
    }
    
    // Check if lesson has module object with name
    if (lesson.module && lesson.module.name) {
      return lesson.module.name;
    }
    
    // Check if lesson has moduleId and find in modules list
    if (lesson.moduleId) {
      const module = modules.find(m => m.id === lesson.moduleId);
      if (module) return module.name;
    }
    
    // Check if lesson.module has id and find in modules list
    if (lesson.module && lesson.module.id) {
      const module = modules.find(m => m.id === lesson.module.id);
      if (module) return module.name;
    }
    
    console.log('Could not find module for lesson:', lesson); // Debug log
    return 'Unknown Module';
  };

  const getLessonTypeLabel = (type) => {
    const lessonType = lessonTypes.find(t => t.value === type);
    return lessonType ? lessonType.label : type;
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
              <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Order</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
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
                    />
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lesson Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
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
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Module</InputLabel>
                <Select
                  value={formData.moduleId}
                  onChange={(e) => handleInputChange('moduleId', e.target.value)}
                  label="Module"
                >
                  {modules.length === 0 ? (
                    <MenuItem disabled>
                      <em>No modules available</em>
                    </MenuItem>
                  ) : (
                    modules.map((module) => (
                      <MenuItem key={module.id} value={module.id}>
                        {module.name || module.title || `Module ${module.id}`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {modules.length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  No modules found. Please create a module first.
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Lesson Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  label="Lesson Type"
                >
                  {lessonTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Level"
                type="number"
                value={formData.level}
                onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
                inputProps={{ min: 1, max: 10 }}
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
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              backgroundColor: '#4a6cf7',
              '&:hover': { backgroundColor: '#3a5ce5' }
            }}
          >
            {editingLesson ? 'Update' : 'Create'} Lesson
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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