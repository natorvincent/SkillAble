import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  InputAdornment,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const DemoteUsers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [demoting, setDemoting] = useState(false);

  // Base URL for API
  const API_BASE_URL = 'http://localhost:8080/api';
  
  // Get the auth token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/teachers`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
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

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setError(null);
    setSuccessMessage('');
  };

  const handleDemoteTeacher = async () => {
    if (!selectedTeacher) {
      setError('Please select a teacher to demote');
      return;
    }

    setDemoting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/demote-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          teacherId: selectedTeacher.id,
          email: selectedTeacher.email
        })
      });

      const result = await response.text();
      
      if (response.ok) {
        setSuccessMessage(result);
        
        // Check if current user is being demoted
        const currentUserEmail = localStorage.getItem('userEmail');
        if (currentUserEmail === selectedTeacher.email) {
          // Update localStorage to reflect the user is now a student
          localStorage.setItem('userType', 'STUDENT');
          localStorage.removeItem('isAdmin'); // Remove admin status if exists
          
          // Dispatch event to notify other components
          window.dispatchEvent(new Event('localStorageChange'));
          
          // Show message and redirect to homepage after delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        }
        
        setSelectedTeacher(null);
        setError(null);
        fetchTeachers(); // Refresh the teachers list
      } else {
        // Handle error responses
        setError(result || 'Failed to demote teacher');
        setSuccessMessage('');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
      setSuccessMessage('');
    } finally {
      setDemoting(false);
    }
  };

  const handleCancel = () => {
    setSelectedTeacher(null);
    setError(null);
    setSuccessMessage('');
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.name && teacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Demote Teachers to Students
      </Typography>
      
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Select any teacher to demote them back to student status. They will need to complete their profile information when they next log in.
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
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Error and success messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      {/* Teachers table */}
      <TableContainer component={Paper} sx={{ mb: 4, borderRadius: "10px" }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width="60px"></TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
             
              <TableCell width="100px">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : filteredTeachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No teachers matching your search' : 'No teachers available for demotion'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTeachers.map(teacher => (
                <TableRow 
                  key={teacher.id}
                  selected={selectedTeacher && selectedTeacher.id === teacher.id}
                  sx={{ 
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Radio
                      checked={selectedTeacher && selectedTeacher.id === teacher.id}
                      onChange={() => handleTeacherSelect(teacher)}
                      disabled={demoting}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">
                      {teacher.name || 'Not specified'}
                    </Typography>
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
              
                  <TableCell>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleTeacherSelect(teacher)}
                      disabled={demoting}
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Demotion form */}
      {selectedTeacher && (
        <Card sx={{ borderRadius: "10px", bgcolor: '#fff5f5', mb: 2, border: '1px solid #ffebee' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonRemoveIcon fontSize="small" sx={{ mr: 1, color: '#f44336' }} />
              <Typography variant="h6" color="#f44336">
                Demote to Student
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Selected Teacher:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {selectedTeacher.name || 'Not specified'} ({selectedTeacher.email})
              </Typography>
             
            </Box>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              This action will:
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li>Remove teacher privileges and convert the account to student status</li>
                <li>Unassign all students currently assigned to this teacher</li>
                <li>Reset profile information - user will need to complete their profile on next login</li>
              </ul>
            </Alert>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={demoting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={demoting ? <CircularProgress size={16} color="inherit" /> : <PersonRemoveIcon fontSize="small" />}
                onClick={handleDemoteTeacher}
                disabled={demoting}
                sx={{ 
                  backgroundColor: "#f44336",
                  "&:hover": {
                    backgroundColor: "#d32f2f"
                  },
                  "&:disabled": {
                    backgroundColor: "#ffcdd2"
                  }
                }}
              >
                {demoting ? 'Demoting...' : 'Demote to Student'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DemoteUsers;