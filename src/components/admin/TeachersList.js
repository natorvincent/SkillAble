import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchoolIcon from '@mui/icons-material/School';
import DeleteIcon from '@mui/icons-material/Delete';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const API_BASE_URL = 'https://skillable-pdv0.onrender.com/api';
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/teachers`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      setTeachers(data);
      setError(null);
    } catch (err) {
      setError('Error fetching teachers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedTeacher(null);
    setOpenDeleteModal(false);
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/teachers/${selectedTeacher.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete teacher');
      fetchTeachers();
    } catch (err) {
      setError('Error deleting teacher: ' + err.message);
    } finally {
      handleCloseDeleteModal();
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.name && teacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }}>
        Current Teachers
      </Typography>
      <Typography color="text.secondary" sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
        View all teachers in the system. These are users who have been promoted to teacher status.
      </Typography>

      {/* Search and refresh */}
      <Box sx={{ display: 'flex', mb: { xs: 2, sm: 2.5, md: 3 }, gap: { xs: 1, sm: 2 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
        <TextField
          placeholder="Search teachers by name or email..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ borderRadius: "10px", minWidth: { xs: '100%', sm: '200px' } }}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon fontSize="small" />}
          onClick={fetchTeachers}
          sx={{ 
            whiteSpace: 'nowrap',
            minWidth: { xs: '100%', sm: 'auto' }
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <TableContainer component={Paper} sx={{ borderRadius: "10px", minWidth: 600 }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell width="60px" sx={{ py: { xs: 1, sm: 1.5 } }}></TableCell>
                <TableCell sx={{ py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Name</TableCell>
                <TableCell sx={{ py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Email</TableCell>
                <TableCell align="center" sx={{ py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Actions</TableCell>
              </TableRow>
            </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No teachers matching your search' : 'No teachers available'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers.map((teacher, index) => (
                <TableRow
                  key={teacher.id || index}
                  sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                >
                  <TableCell padding="checkbox" sx={{ py: { xs: 1, sm: 1.5 } }}>
                    <SchoolIcon style={{ color: '#4a6cf7', fontSize: 20 }} />
                  </TableCell>
                  <TableCell sx={{ py: { xs: 1, sm: 1.5 } }}>
                    <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{teacher.name || 'Not specified'}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}>{teacher.email}</TableCell>
                  <TableCell align="center" sx={{ py: { xs: 1, sm: 1.5 } }}>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteModal(teacher)}
                        size="small"
                      >
                        <DeleteIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>

      {/* Delete modal */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove{" "}
            <b>{selectedTeacher?.name || "this teacher"}</b> from the system?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteTeacher} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeachersList;
