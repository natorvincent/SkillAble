import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
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
  Tabs,
  Tab
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

const AdminInterface = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Base URL for API
  const API_BASE_URL = 'http://localhost:8080/api';
  
  // Get the auth token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Updated to fetch students that are not teachers
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

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    // Pre-fill teacher name with student's first name or email
    const nameToUse = student.firstName ? student.firstName : student.email.split('@')[0];
    setTeacherName(nameToUse);
  };

  const handlePromoteStudent = async () => {
    if (!selectedStudent || !teacherName.trim()) {
      setError('Please select a student and provide a teacher name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/promote-to-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          userId: selectedStudent.id,
          name: teacherName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to promote student to teacher');
      }

      const result = await response.text();
      setSuccessMessage(result);
      
      // If the promoted student is the currently logged-in user,
      // update their userType in localStorage
      const currentUserEmail = localStorage.getItem('userEmail');
      if (currentUserEmail === selectedStudent.email) {
        localStorage.setItem('userType', 'TEACHER');
        
        // Dispatch custom event to notify components about the change
        window.dispatchEvent(new Event('localStorageChange'));
      }
      
      setSelectedStudent(null);
      setTeacherName('');
      
      // Refresh the student list
      fetchStudents();
    } catch (err) {
      setError('Error promoting student: ' + err.message);
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
        Promote Students to Teachers
      </Typography>
      
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Select any student to promote them to teacher status.
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
      
      {/* Students table */}
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
              filteredStudents.map(student => (
                <TableRow 
                  key={student.id}
                  selected={selectedStudent && selectedStudent.id === student.id}
                  sx={{ 
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(74, 108, 247, 0.08)',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Radio
                      checked={selectedStudent && selectedStudent.id === student.id}
                      onChange={() => handleStudentSelect(student)}
                    />
                  </TableCell>
                  <TableCell>{student.firstName} {student.lastName}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleStudentSelect(student)}
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
      
      {/* Promotion form */}
      {selectedStudent && (
        <Card sx={{ borderRadius: "10px", bgcolor: '#f8f9fa', mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 1 }}>
                <Tab 
                  icon={<PersonAddIcon fontSize="small" sx={{ mr: 1 }} />} 
                  label="Promote to Teacher" 
                  iconPosition="start"
                />

              </Tabs>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {activeTab === 0 && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Selected Student:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedStudent.firstName} {selectedStudent.lastName} ({selectedStudent.email})
                  </Typography>
                </Box>
                
                <TextField
                  label="Teacher Name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  required
                  sx={{ 
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedStudent(null);
                      setTeacherName('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon fontSize="small" />}
                    onClick={handlePromoteStudent}
                    sx={{ 
                      backgroundColor: "#4a6cf7",
                      "&:hover": {
                        backgroundColor: "#3a5ce5"
                      }
                    }}
                  >
                    Promote to Teacher
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminInterface;