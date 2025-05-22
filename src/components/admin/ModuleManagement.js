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
      >
        <DialogTitle>
          {dialogAction === 'create' ? 'Create New Module' : 'Edit Module'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Module Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Display Order"
                name="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={handleFormChange}
                    name="active"
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
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.description}
          >
            {dialogAction === 'create' ? 'Create' : 'Save'}
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