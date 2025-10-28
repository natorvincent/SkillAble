import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
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
  CircularProgress,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';

function ModuleManagement() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('create');
  const [selectedModule, setSelectedModule] = useState(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    active: true
  });
  
  useEffect(() => {
    fetchModules();
  }, []);
  
  const fetchModules = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://skillable-pdv0.onrender.com/api/modules', {
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
        name: module.name || '',
        description: module.description || '',
        displayOrder: module.displayOrder || 0,
        active: module.active !== undefined ? module.active : true
      });
    } else {
      setSelectedModule(null);
      setFormData({
        name: '',
        description: '',
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
    
    if (name === 'active') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'displayOrder') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      showError('Name and description are required');
      return;
    }
    
    const moduleData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      displayOrder: parseInt(formData.displayOrder) || 0,
      active: Boolean(formData.active)
    };
    
    try {
      let response;
      
      if (dialogAction === 'create') {
        response = await fetch('https://skillable-pdv0.onrender.com/api/modules/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(moduleData)
        });
      } else {
        response = await fetch(`https://skillable-pdv0.onrender.com/api/modules/${selectedModule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(moduleData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to ${dialogAction} module`);
      }
      
      await fetchModules();
      showSuccess(`Module ${dialogAction === 'create' ? 'created' : 'updated'} successfully`);
      handleCloseDialog();
    } catch (err) {
      showError(`Failed to ${dialogAction} module: ${err.message}`);
    }
  };
  
  const handleToggleActive = async (module) => {
    try {
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/modules/${module.id}/active?active=${!module.active}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update module status');
      }
      
      fetchModules();
      showSuccess(`Module ${module.active ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      showError('Failed to update module status. Please try again.');
    }
  };
  
  const handleConfirmDelete = (module) => {
    setSelectedModule(module);
    setConfirmDeleteDialog(true);
  };
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/modules/${selectedModule.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete module');
      }
      
      fetchModules();
      showSuccess('Module deleted successfully');
      setConfirmDeleteDialog(false);
    } catch (err) {
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
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="600" color="#1a237e" gutterBottom>
                Module Management
              </Typography>
              <Typography variant="body1" color="#546e7a">
                Manage learning modules and organize your educational content
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenDialog('create')}
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
              Create Module
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      {/* Modules Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f7ff' }}>
                  <TableCell sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Module Name</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Order</TableCell>
                  <TableCell align="center" sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: '600', color: '#37474f', py: 3, fontSize: '15px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {modules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <FolderIcon sx={{ fontSize: 64, color: '#b0bec5', mb: 2 }} />
                      <Typography variant="h6" color="#78909c" gutterBottom>
                        No modules found
                      </Typography>
                      <Typography variant="body2" color="#b0bec5" sx={{ mb: 3 }}>
                        Start building your curriculum by creating the first module
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog('create')}
                        sx={{
                          backgroundColor: '#1976d2',
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 4,
                          py: 1.5
                        }}
                      >
                        Create First Module
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  modules.map((module) => (
                    <TableRow 
                      key={module.id} 
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <FolderIcon sx={{ color: module.active ? '#1976d2' : '#9e9e9e' }} />
                          <Typography fontWeight="600" color="#2e3a47">
                            {module.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" color="#546e7a" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.5
                        }}>
                          {module.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 3 }}>
                        <Typography 
                          variant="body1" 
                          fontWeight="600" 
                          color="#5c6bc0"
                          sx={{ fontSize: '15px' }}
                        >
                          {module.displayOrder}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={module.active}
                                onChange={() => handleToggleActive(module)}
                                color="primary"
                                size="medium"
                              />
                            }
                            label={
                              <Chip
                                label={module.active ? "Active" : "Inactive"}
                                color={module.active ? "success" : "default"}
                                size="small"
                                sx={{ 
                                  fontWeight: '600',
                                  minWidth: 80
                                }}
                              />
                            }
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="Edit module">
                            <IconButton 
                              onClick={() => handleOpenDialog('edit', module)}
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
                          <Tooltip title="Delete module">
                            <IconButton 
                              onClick={() => handleConfirmDelete(module)}
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
      )}
      
      {/* Create/Edit Module Dialog - Professional Table Style */}
      <Dialog 
        open={openDialog} 
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
            <FolderIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" fontWeight="600">
                {dialogAction === 'create' ? 'Create New Module' : 'Edit Module'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {dialogAction === 'create' ? 'Define a new learning module for your curriculum' : 'Update module configuration and settings'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableBody>
                {/* Module Name Row */}
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
                      <Typography variant="subtitle1">Module Name</Typography>
                      <Typography color="error" component="span">*</Typography>
                    </Box>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Enter a clear, descriptive name
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., Introduction to Personal Hygiene"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">Description</Typography>
                      <Typography color="error" component="span">*</Typography>
                    </Box>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Overview of learning objectives
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Describe what students will learn in this module..."
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      multiline
                      rows={4}
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

                {/* Display Order Row */}
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
                    <Typography variant="subtitle1">Display Order</Typography>
                    <Typography variant="caption" color="#78909c" sx={{ display: 'block', mt: 0.5 }}>
                      Sequence in curriculum
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <TextField
                      variant="outlined"
                      type="number"
                      placeholder="1"
                      name="displayOrder"
                      value={formData.displayOrder}
                      onChange={handleFormChange}
                      size="medium"
                      sx={{ 
                        width: 120,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                      inputProps={{ min: 0 }}
                    />
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
                      Module visibility
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ py: 3, pr: 4 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.active}
                          onChange={handleFormChange}
                          name="active"
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
            disabled={!formData.name || !formData.description}
            startIcon={dialogAction === 'create' ? <AddIcon /> : <EditIcon />}
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
            {dialogAction === 'create' ? 'Create Module' : 'Update Module'}
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
            You are about to delete the following module:
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
              {selectedModule?.name}
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
              ⚠️ This action will permanently delete the module and all associated lessons. This cannot be undone.
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
            Delete Module
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ 
            borderRadius: 2,
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            alignItems: 'center'
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ModuleManagement;