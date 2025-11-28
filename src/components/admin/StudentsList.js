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
  DialogTitle,
  Chip,
  Tooltip,
  Pagination,
  Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

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

  // Generate avatar initials
  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last;
  };

  // Generate consistent color based on name
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  // Format name to proper case
  const formatName = (firstName, lastName) => {
    const formatPart = (part) => 
      part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : '';
    
    return `${formatPart(firstName)} ${formatPart(lastName)}`.trim();
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  // Custom status styles
  const getStatusStyles = (status) => {
    const statusLower = status?.toLowerCase() || 'active';
    
    switch (statusLower) {
      case 'active':
        return {
          bgcolor: '#dcfce7',
          color: '#166534',
          border: 'none'
        };
      case 'pending':
        return {
          bgcolor: '#ffedd5',
          color: '#9a3412',
          border: 'none'
        };
      case 'inactive':
        return {
          bgcolor: '#f3f4f6',
          color: '#374151',
          border: 'none'
        };
      case 'new':
        return {
          bgcolor: '#dbeafe',
          color: '#1e40af',
          border: 'none'
        };
      default:
        return {
          bgcolor: '#f3f4f6',
          color: '#374151',
          border: 'none'
        };
    }
  };

  // Get status from student data - adjust this based on your API response structure
  const getStudentStatus = (student) => {
    // Adjust these property names based on your actual API response
    return student.status || student.accountStatus || 'active';
  };

  // Filter and sort students
  const processedStudents = students
    .filter(student => 
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.firstName && student.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.lastName && student.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortConfig.key === 'name') {
        const nameA = formatName(a.firstName, a.lastName).toLowerCase();
        const nameB = formatName(b.firstName, b.lastName).toLowerCase();
        return sortConfig.direction === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (sortConfig.key === 'email') {
        return sortConfig.direction === 'asc' 
          ? a.email.localeCompare(b.email) 
          : b.email.localeCompare(a.email);
      }
      return 0;
    });

  // Pagination
  const paginatedStudents = processedStudents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          All Students
        </Typography>
        <Typography color="text.secondary">
          View all students who are not teachers in the system.
        </Typography>
      </Box>
      
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
          sx={{ 
            borderRadius: 2,
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#d97706',
              },
            },
          }}
        />
        <Tooltip title="Reload Students">
          <IconButton
            onClick={fetchStudents}
            sx={{ 
              border: 1, 
              borderColor: 'divider',
              borderRadius: '50%',
              width: 40,
              height: 40
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Students table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell 
                sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider', cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Name
                  {getSortIcon('name')}
                </Box>
              </TableCell>
              <TableCell 
                sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider', cursor: 'pointer' }}
                onClick={() => handleSort('email')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Email
                  {getSortIcon('email')}
                </Box>
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}
              >
                Status
              </TableCell>
              <TableCell 
                align="center" 
                sx={{ fontWeight: 600, borderBottom: '2px solid', borderBottomColor: 'divider' }}
                width="100px"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No students matching your search' : 'No students available'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => {
                const status = getStudentStatus(student);
                const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                
                return (
                  <TableRow 
                    key={student.id || student.email}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(255, 249, 196, 0.3)' 
                      },
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: stringToColor(student.firstName + student.lastName),
                            width: 40,
                            height: 40,
                            fontSize: '0.9rem',
                            fontWeight: 600
                          }}
                        >
                          {getInitials(student.firstName, student.lastName)}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600} color="text.primary">
                            {formatName(student.firstName, student.lastName)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography color="text.secondary" fontSize="0.9rem">
                        {student.email}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={formattedStatus}
                        size="small"
                        sx={getStatusStyles(status)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete Student">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenDeleteModal(student)}
                          sx={{ 
                            color: 'text.secondary',
                            '&:hover': {
                              color: 'error.main',
                              backgroundColor: 'rgba(211, 47, 47, 0.04)'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && processedStudents.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(processedStudents.length / rowsPerPage)} 
            page={page} 
            onChange={handlePageChange}
            color="primary"
            showFirstButton 
            showLastButton
          />
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove{" "}
            <strong>
              {selectedStudent ? formatName(selectedStudent.firstName, selectedStudent.lastName) : ''}
            </strong>{" "}
            from the system? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDeleteModal} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Delete Student
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsList;