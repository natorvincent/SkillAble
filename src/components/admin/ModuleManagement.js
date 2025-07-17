import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function ModuleManagement() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('create'); // 'create' or 'edit'
  const [selectedModule, setSelectedModule] = useState(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    active: true
  });
  
  useEffect(() => {
    fetchModules();
  }, []);
  
  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/modules', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      
      const data = await response.json();
      setModules(data);
    } catch (err) {
      console.error('Error fetching modules:', err);
      showError('Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenDialog = (action, module = null) => {
    setDialogAction(action);
    
    if (action === 'edit' && module) {
      setSelectedModule(module);
      setFormData({
        name: module.name,
        description: module.description,
        imageUrl: module.imageUrl || '',
        displayOrder: module.displayOrder,
        active: module.active
      });
    } else {
      // For create, initialize with defaults
      setSelectedModule(null);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        displayOrder: modules.length + 1,
        active: true
      });
    }
    
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleFormChange = (e) => {
    const { name, value, checked } = e.target;
    
    // Handle checkbox separately
    if (name === 'active') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.description) {
      showError('Name and description are required');
      return;
    }
    
    try {
      let response;
      
      if (dialogAction === 'create') {
        // Create new module
        response = await fetch('http://localhost:8080/api/modules/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } else {
        // Update existing module
        response = await fetch(`http://localhost:8080/api/modules/${selectedModule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to ${dialogAction} module`);
      }
      
      // Refresh the modules list
      fetchModules();
      
      // Show success message
      showSuccess(`Module ${dialogAction === 'create' ? 'created' : 'updated'} successfully`);
      
      // Close the dialog
      handleCloseDialog();
    } catch (err) {
      console.error(`Error ${dialogAction}ing module:`, err);
      showError(`Failed to ${dialogAction} module. Please try again.`);
    }
  };
  
  const handleToggleActive = async (module) => {
    try {
      const response = await fetch(`http://localhost:8080/api/modules/${module.id}/active?active=${!module.active}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update module status');
      }
      
      // Update the module list with the new status
      fetchModules();
      
      showSuccess(`Module ${module.active ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      console.error('Error toggling module status:', err);
      showError('Failed to update module status. Please try again.');
    }
  };
  
  const handleConfirmDelete = (module) => {
    setSelectedModule(module);
    setConfirmDeleteDialog(true);
  };
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/modules/${selectedModule.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete module');
      }
      
      // Refresh the modules list
      fetchModules();
      
      showSuccess('Module deleted successfully');
      
      // Close the confirmation dialog
      setConfirmDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting module:', err);
      showError('Failed to delete module. Please try again.');
    }
  };
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  const showError = (message) => {
    setError(message);
    setSuccess('');
    setOpenSnackbar(true);
  };
  
  const showSuccess = (message) => {
    setSuccess(message);
    setError('');
    setOpenSnackbar(true);
  };
  
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Module Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenDialog('create')}
        >
          Create Module
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Order</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No modules found. Create your first module!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell>{module.id}</TableCell>
                    <TableCell>{module.name}</TableCell>
                    <TableCell>{module.description}</TableCell>
                    <TableCell align="center">{module.displayOrder}</TableCell>
                    <TableCell align="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={module.active}
                            onChange={() => handleToggleActive(module)}
                            color="primary"
                          />
                        }
                        label={module.active ? "Active" : "Inactive"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenDialog('edit', module)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleConfirmDelete(module)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Create/Edit Module Dialog */}
      <Dialog 
  open={openDialog} 
  onClose={handleCloseDialog} 
  fullWidth 
  maxWidth="md"
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
      📚
    </Box>
    {dialogAction === 'create' ? 'Create New Learning Module' : 'Edit Learning Module'}
  </DialogTitle>
  
  <DialogContent sx={{ padding: '24px' }}>
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {/* Module Name - Full Width */}
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
            <span>✏️</span> Module Name
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter a clear, simple name for your module"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
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
            <span>📝</span> Description
          </Typography>
          <TextField
            fullWidth
            placeholder="Describe what students will learn in this module"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            multiline
            rows={4}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '18px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                minHeight: '120px',
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
      
      {/* Order Number and Status - Side by Side */}
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
            <span>🔢</span> Order Number
          </Typography>
          <TextField
            fullWidth
            placeholder="1, 2, 3..."
            name="displayOrder"
            type="number"
            value={formData.displayOrder}
            onChange={handleFormChange}
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
      
      <Grid item xs={12} md={6}>
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
            <span>🔄</span> Module Status
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={handleFormChange}
                name="active"
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
      disabled={!formData.name || !formData.description}
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
      {dialogAction === 'create' ? '✅ Create Module' : '💾 Save Changes'}
    </Button>
  </DialogActions>
</Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={() => setConfirmDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the module "{selectedModule?.name}"? 
            This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Note: Deleting a module will also delete all associated lessons.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ModuleManagement;