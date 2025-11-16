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
  import PersonIcon from '@mui/icons-material/Person';
  import DeleteIcon from '@mui/icons-material/Delete';

  const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const API_BASE_URL = 'http://localhost:8080/api';
    const getAuthToken = () => localStorage.getItem('token');

    useEffect(() => {
      fetchStudents();
    }, []);

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/admin/students/non-teachers`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        
        const data = await response.json();
        setStudents(data);
        setError(null);
      } catch (err) {
        setError('Error fetching students: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    // Open modal when delete button is clicked
    const handleOpenDeleteModal = (student) => {
      setSelectedStudent(student);
      setOpenDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
      setSelectedStudent(null);
      setOpenDeleteModal(false);
    };

   const handleDeleteConfirm = async () => {
  if (!selectedStudent) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/students/delete?email=${encodeURIComponent(selectedStudent.email)}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${getAuthToken()}`
        }
      }
    );

    if (response.ok) {
      setStudents((prev) => prev.filter((s) => s.email !== selectedStudent.email));
      handleCloseDeleteModal();
    } else {
      setError("Failed to delete student");
    }
  } catch (err) {
    setError("Error deleting student: " + err.message);
  }
};


    const filteredStudents = students.filter(student => 
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.firstName && student.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.lastName && student.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          All Students
        </Typography>
        
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          View all students who are not teachers in the system.
        </Typography>
        
        {/* Search and refresh section */}
        <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
          <TextField
            placeholder="Search students by name or email..."
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
            onClick={fetchStudents}
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
        
        {/* Students table */}
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
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'No students matching your search' : 'No students available'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
                  <TableRow 
                    key={student.id || index}
                    sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                  >
                    <TableCell padding="checkbox">
                      <PersonIcon style={{ color: '#4a6cf7', fontSize: 20 }} />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {student.firstName} {student.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteModal(student)}
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
                {selectedStudent?.firstName} {selectedStudent?.lastName}
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

  export default StudentsList;