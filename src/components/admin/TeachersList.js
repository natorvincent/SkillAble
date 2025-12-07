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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
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
      
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      
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

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/teachers/${selectedTeacher.id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${getAuthToken()}`
          }
        }
      );

      if (response.ok) {
        setTeachers((prev) => prev.filter((t) => t.id !== selectedTeacher.id));
        handleCloseDeleteModal();
      } else {
        setError("Failed to delete teacher");
      }
    } catch (err) {
      setError("Error deleting teacher: " + err.message);
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.name && teacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Current Teachers
      </Typography>
      
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        View all teachers in the system. These are users who have been promoted to teacher status.
      </Typography>
      
      {/* Search and refresh section */}
      <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
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
          sx={{ borderRadius: "10px" }}
        />
        <Button
          variant="outlined"
          startIcon={<RefreshIcon fontSize="small" />}
          onClick={fetchTeachers}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Teachers table */}
      <TableContainer component={Paper} sx={{ borderRadius: "10px" }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width="60px"></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Actions</TableCell>
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
                  <TableCell padding="checkbox">
                    <SchoolIcon style={{ color: '#4a6cf7', fontSize: 20 }} />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {teacher.name || 'Not specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteModal(teacher)}
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

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove{" "}
            <strong>
              {selectedTeacher?.name || "this teacher"}
            </strong>{" "}
            from the system? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeachersList;