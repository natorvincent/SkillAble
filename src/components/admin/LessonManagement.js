import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
  
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
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
      label: 'Personal Hygiene Level 3 - Nail Care',
      description: 'Apply hygiene knowledge to real-life situations',
      component: 'PersonalHygieneLevel3',
      path: '/lesson/hygiene/level-3',
      icon: '🎭'
    },
    {
      value: 'PersonalHygieneLevel4',
      label: 'Personal Hygiene Level 4 - Shower',
      description: 'Apply hygiene knowledge to real-life situations',
      component: 'PersonalHygieneLevel4',
      path: '/lesson/hygiene/level-4',
      icon: '🎭'
    },
    {
      value: 'PersonalHygieneLevel5',
      label: 'Personal Hygiene Level 5 - DressUp',
      description: 'Apply hygiene knowledge to real-life situations',
      component: 'PersonalHygieneLevel5',
      path: '/lesson/hygiene/level-5',
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
      value: 'cooking-level-5',
      label: 'Cooking Level 5 - Complete Cooking Adventure',
      description: 'Full recipe experience with ingredients, tools, actions, and sequencing',
      component: 'CookingLevel5',
      path: '/lesson/cooking/level-5',
      icon: '🍽️'
    },
    {
      value: 'HouseholdLevel1',
      label: 'Household Chores Level 1 - Sorting Laundry',
      description: 'Drag-and-drop interaction to sort clothing items into appropriate laundry baskets category',
      component: 'HouseholdLevel1',
      path: '/lesson/household-chores/level-1',
      icon: '🧹'
    },  
    {
      value: 'HouseholdLevel2',
      label: 'Household Chores Level 2 - Sweeping & Cleaning',
      description: 'Master basic cleaning tools and techniques through interactive sweeping and wiping practice',
      component: 'HouseholdLevel2',
      path: '/lesson/household-chores/level-2',
      icon: '🧹'
    },  
    {
      value: 'HouseholdLevel3',
      label: 'Household Chores Level 3 - Washing Dishes',
      description: 'Learn proper dishwashing steps and hygiene through a fun, interactive game',
      component: 'HouseholdLevel3',
      path: '/lesson/household-chores/level-3',
      icon: '🧹'
    },  
    {
      value: 'HouseholdLevel4',
      label: 'Household Chores Level 4 - Sorting Trash',
      description: 'Learn proper trash sorting and recycling through a fun, interactive game',
      component: 'HouseholdLevel4',
      path: '/lesson/household-chores/level-4',
      icon: '🧹'
    }, 
    {
      value: 'SortingLevel1 - Healthy vs Unhealthy Food Sorting',
      label: 'Food Sorting Level 1',
      description: 'Identify healthy vs. unhealthy food',
      component: 'SortingLevel1',
      path: '/lesson/food-sorting/level-1',
      icon: '🍎'
    },
    {
      value: 'SortingLevel2 - Fruit, Vegetable, or Neither?',
      label: 'Food Sorting Level 2',
      description: 'Identify fruits, vegetables, or other foods',
      component: 'SortingLevel2',
      path: '/lesson/food-sorting/level-2',
      icon: '🥦'
    },
    {
      value: 'SortingLevel3',
      label: 'Food Sorting Level 3 - Food Pyramid Builder',
      description: 'Classify foods into 5 main groups and build balanced meals',
      component: 'SortingLevel3',
      path: '/lesson/food-sorting/level-3',
      icon: '🛕'
    },
    {
      value: 'SortingLevel4',
      label: 'Food Sorting Level 4 - Plate Arrangement',
      description: 'Teach portion control and meal composition',
      component: 'SortingLevel4',
      path: '/lesson/food-sorting/level-4',
      icon: '🍽️'
    },
    {
      value: 'SortingLevel5',
      label: 'Food Sorting Level 5 - The Nutrition Detective',
      description: 'Combine all prior learning into one detective-themed game.',
      component: 'SortingLevel5',
      path: '/lesson/food-sorting/level-5',
      icon: '🔍︎'
    }
  ];

  useEffect(() => {
    fetchLessons();
    fetchModules();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('https://skillable-pdv0.onrender.com/api/lessons');
      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch('https://skillable-pdv0.onrender.com/api/modules');
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      } else {
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
        ? `https://skillable-pdv0.onrender.com/api/lessons/${editingLesson.id}`
        : 'https://skillable-pdv0.onrender.com/api/lessons';
      
      const method = editingLesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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
        showSnackbar(`Failed to ${editingLesson ? 'update' : 'create'} lesson`, 'error');
      }
    } catch (error) {
      showSnackbar('Error submitting lesson', 'error');
    }
  };

  const handleConfirmDelete = (lesson) => {
    setSelectedLesson(lesson);
    setConfirmDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/lessons/${selectedLesson.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showSnackbar('Lesson deleted successfully!', 'success');
        fetchLessons();
        setConfirmDeleteDialog(false);
      } else {
        showSnackbar('Failed to delete lesson', 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting lesson', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getModuleName = (lesson) => {
    if (lesson.moduleName) return lesson.moduleName;
    if (lesson.module && lesson.module.name) return lesson.module.name;
    if (lesson.moduleId) {
      const module = modules.find(m => m.id === lesson.moduleId);
      if (module) return module.name;
    }
    if (lesson.module && lesson.module.id) {
      const module = modules.find(m => m.id === lesson.module.id);
      if (module) return module.name;
    }
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
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="600" color="#1a237e" gutterBottom>
                Lesson Management
              </Typography>
              <Typography variant="body1" color="#546e7a">
                Manage learning lessons and educational activities
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog()}
              sx={{
                backgroundColor: '#1976d2',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: '600',
                textTransform: 'none',
                fontSize: '16px',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                }
              }}
            >
              Create Lesson
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Lessons Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f7ff' }}>
                <TableCell sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Module</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Activity</TableCell>
                <TableCell align="center" sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Level</TableCell>
                <TableCell align="center" sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Order</TableCell>
                <TableCell align="center" sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <LessonIcon sx={{ fontSize: 64, color: '#b0bec5', mb: 2 }} />
                    <Typography variant="h6" color="#78909c" gutterBottom>
                      No lessons found
                    </Typography>
                    <Typography variant="body2" color="#b0bec5" sx={{ mb: 3 }}>
                      Start building your curriculum by creating the first lesson
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenDialog()}
                      sx={{
                        backgroundColor: '#1976d2',
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 4,
                        py: 1.5
                      }}
                    >
                      Create First Lesson
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                lessons.map((lesson) => (
                  <TableRow 
                    key={lesson.id} 
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: '#fafafa',
                        transition: 'background-color 0.2s ease'
                      },
                      '&:not(:last-child)': {
                        borderBottom: '1px solid #f0f0f0'
                      }
                    }}
                  >
                    <TableCell sx={{ py: 3 }}>
                      <Box>
                        <Typography fontWeight="600" color="#2e3a47">
                          {lesson.title}
                        </Typography>
                        {lesson.description && (
                          <Typography variant="body2" color="#546e7a" sx={{ 
                            mt: 0.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {lesson.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Chip 
                        label={getModuleName(lesson)} 
                        size="small"
                        sx={{ 
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          fontWeight: '500'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      <Chip 
                        label={getLessonTypeLabel(lesson.type)} 
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: '500' }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 3 }}>
                      {lesson.activity ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GameIcon sx={{ fontSize: 16, color: '#1976d2' }} />
                          <Chip 
                            label={getActivityLabel(lesson.activity)} 
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: '500' }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="#b0bec5">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 3 }}>
                      <Typography 
                        variant="body1" 
                        fontWeight="600" 
                        color="#5c6bc0"
                        sx={{ fontSize: '15px' }}
                      >
                        {lesson.level}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 3 }}>
                      <Typography 
                        variant="body1" 
                        fontWeight="600" 
                        color="#5c6bc0"
                        sx={{ fontSize: '15px' }}
                      >
                        {lesson.displayOrder}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 3 }}>
                      <Chip
                        label={lesson.active ? "Active" : "Inactive"}
                        color={lesson.active ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: '600' }}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Edit lesson">
                          <IconButton 
                            onClick={() => handleOpenDialog(lesson)}
                            sx={{ 
                              color: '#1976d2',
                              backgroundColor: 'rgba(25, 118, 210, 0.04)',
                              '&:hover': { 
                                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease',
                              borderRadius: 2
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete lesson">
                          <IconButton 
                            onClick={() => handleConfirmDelete(lesson)}
                            sx={{ 
                              color: '#d32f2f',
                              backgroundColor: 'rgba(211, 47, 47, 0.04)',
                              '&:hover': { 
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease',
                              borderRadius: 2
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create/Edit Lesson Dialog - Professional Table Style */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        fullWidth 
        maxWidth="md"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            py: 3,
            px: 4,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LessonIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="600">
                {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {editingLesson ? 'Update lesson configuration and settings' : 'Define a new learning lesson for your curriculum'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableBody>
                {/* Title Row */}
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      width: '30%',
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#455a64',
                      borderRight: '1px solid #e0e0e0',
                      py: 3,
                      pl: 4
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">Lesson Title</Typography>
                      <Typography color="error" component="span">*</Typography>
                    </Box>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Enter a clear, descriptive title
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., Introduction to Personal Hygiene"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          }
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>

                {/* Description Row */}
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#455a64',
                      borderRight: '1px solid #e0e0e0',
                      py: 3,
                      pl: 4
                    }}
                  >
                    <Typography variant="subtitle1">Description</Typography>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Overview of learning content
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Describe what students will learn in this lesson..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      multiline
                      rows={3}
                      size="medium"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#1976d2'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1976d2',
                            borderWidth: '2px'
                          }
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>

                {/* Module Selection Row */}
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#455a64',
                      borderRight: '1px solid #e0e0e0',
                      py: 3,
                      pl: 4
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">Module</Typography>
                      <Typography color="error" component="span">*</Typography>
                    </Box>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Select parent module
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.moduleId}
                        onChange={(e) => handleModuleChange(e.target.value)}
                        displayEmpty
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e0e0e0'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#1976d2'
                          }
                        }}
                      >
                        <MenuItem value="" disabled>
                          Choose a module...
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
                              {module.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>

                {/* Lesson Type Row */}
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#455a64',
                      borderRight: '1px solid #e0e0e0',
                      py: 3,
                      pl: 4
                    }}
                  >
                    <Typography variant="subtitle1">Lesson Type</Typography>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Type of learning activity
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        {lessonTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>

                {/* Activity Selection Row */}
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#455a64',
                      borderRight: '1px solid #e0e0e0',
                      py: 3,
                      pl: 4
                    }}
                  >
                    <Typography variant="subtitle1">Interactive Activity</Typography>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Optional game activity
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <FormControl fullWidth>
                      <Select
                        value={formData.activity}
                        onChange={(e) => handleInputChange('activity', e.target.value)}
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        <MenuItem value="">
                          No Interactive Activity
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
                  </TableCell>
                </TableRow>

                {/* Level and Order Row */}
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#455a64',
                      borderRight: '1px solid #e0e0e0',
                      py: 3,
                      pl: 4
                    }}
                  >
                    <Typography variant="subtitle1">Level & Order</Typography>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Lesson sequence
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Level"
                        type="number"
                        value={formData.level}
                        onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1, max: 10 }}
                        sx={{ width: 120 }}
                      />
                      <TextField
                        label="Order"
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 1)}
                        inputProps={{ min: 1 }}
                        sx={{ width: 120 }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>

                {/* Status Row */}
                <TableRow>
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      backgroundColor: '#f8f9fa',
                      fontWeight: '600',
                      color: '#455a64',
                      borderRight: '1px solid #e0e0e0',
                      py: 3,
                      pl: 4
                    }}
                  >
                    <Typography variant="subtitle1">Status</Typography>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Lesson visibility
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.active}
                          onChange={(e) => handleInputChange('active', e.target.checked)}
                          color="primary"
                          size="medium"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip 
                            label={formData.active ? "Active" : "Inactive"} 
                            size="medium"
                            color={formData.active ? "success" : "default"}
                            variant="outlined"
                            sx={{ 
                              fontWeight: '600',
                              minWidth: 90
                            }}
                          />
                          <Typography variant="body2" color="#546e7a">
                            {formData.active ? "Visible to students" : "Hidden from students"}
                          </Typography>
                        </Box>
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          gap: 2, 
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#fafafa'
        }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: '600',
              textTransform: 'none',
              borderColor: '#b0bec5',
              color: '#546e7a',
              '&:hover': {
                borderColor: '#78909c',
                backgroundColor: 'rgba(120, 144, 156, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.title || !formData.moduleId}
            startIcon={editingLesson ? <EditIcon /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '16px',
              backgroundColor: '#1976d2',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
              '&:hover': {
                backgroundColor: '#1565c0',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
              },
              '&:disabled': {
                backgroundColor: '#e0e0e0',
                color: '#9e9e9e',
                boxShadow: 'none'
              }
            }}
          >
            {editingLesson ? 'Update Lesson' : 'Create Lesson'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={() => setConfirmDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ color: '#d32f2f', fontSize: '64px', mb: 3 }}>
            ⚠️
          </Box>
          <Typography variant="h5" fontWeight="600" color="#2e3a47" gutterBottom>
            Confirm Deletion
          </Typography>
          <Typography variant="body1" color="#546e7a" sx={{ mb: 3, lineHeight: 1.6 }}>
            You are about to delete the following lesson:
          </Typography>
          
          <Box
            sx={{
              backgroundColor: '#ffebee',
              borderRadius: 2,
              padding: 3,
              border: '1px solid #ffcdd2',
              mb: 3
            }}
          >
            <Typography variant="h6" fontWeight="600" color="#d32f2f">
              {selectedLesson?.title}
            </Typography>
          </Box>
          
          <Box
            sx={{
              backgroundColor: '#fff3e0',
              borderRadius: 2,
              padding: 2.5,
              border: '1px solid #ffe0b2'
            }}
          >
            <Typography variant="body2" color="#e65100" fontWeight="500">
              ⚠️ This action will permanently delete the lesson and cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            onClick={() => setConfirmDeleteDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: '600',
              textTransform: 'none',
              borderColor: '#b0bec5',
              color: '#546e7a',
              '&:hover': {
                borderColor: '#78909c',
                backgroundColor: 'rgba(120, 144, 156, 0.04)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: '600',
              textTransform: 'none',
              backgroundColor: '#d32f2f',
              boxShadow: '0 2px 8px rgba(211, 47, 47, 0.2)',
              '&:hover': {
                backgroundColor: '#c62828',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)'
              }
            }}
          >
            Delete Lesson
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            alignItems: 'center'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LessonManagement;