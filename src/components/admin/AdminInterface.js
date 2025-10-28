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
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import SchoolIcon from '@mui/icons-material/School';

const AdminInterface = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherName, setTeacherName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Base URL for API
  const API_BASE_URL = 'https://skillable-pdv0.onrender.com/api';
  
  // Get the auth token from localStorage
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 0) {
      fetchStudents();
    } else if (activeTab === 1) {
      fetchTeachers();
    }
  }, [activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedStudent(null);
    setSelectedTeacher(null);
    setTeacherName('');
    setError(null);
    setSuccessMessage('');
    setSearchTerm('');
  };

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

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedTeacher(null);
    const nameToUse = student.firstName ? student.firstName : student.email.split('@')[0];
    setTeacherName(nameToUse);
  };

  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedStudent(null);
    setTeacherName('');
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
      
      const currentUserEmail = localStorage.getItem('userEmail');
      if (currentUserEmail === selectedStudent.email) {
        localStorage.setItem('userType', 'TEACHER');
        window.dispatchEvent(new Event('localStorageChange'));
      }
      
      setSelectedStudent(null);
      setTeacherName('');
      fetchStudents();
    } catch (err) {
      setError('Error promoting student: ' + err.message);
    }
  };

  const handleDemoteTeacher = async () => {
    if (!selectedTeacher) {
      setError('Please select a teacher to demote');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/demote-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          teacherId: selectedTeacher.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to demote teacher');
      }

      const result = await response.text();
      setSuccessMessage(result);
      
      const currentUserEmail = localStorage.getItem('userEmail');
      if (currentUserEmail === selectedTeacher.email) {
        localStorage.setItem('userType', 'STUDENT');
        window.dispatchEvent(new Event('localStorageChange'));
      }
      
      setSelectedTeacher(null);
      fetchTeachers();
    } catch (err) {
      setError('Error demoting teacher: ' + err.message);
    }
  };

  const filteredStudents = students.filter(student => 
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.firstName && student.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.lastName && student.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTeachers = teachers.filter(teacher => 
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.name && teacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentData = activeTab === 0 ? filteredStudents : filteredTeachers;

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab 
          icon={<PersonAddIcon fontSize="small" />} 
          label="Promote to Teacher" 
          iconPosition="start"
        />
        <Tab 
          icon={<PersonRemoveIcon fontSize="small" />} 
          label="Demote Teacher" 
          iconPosition="start"
        />
      </Tabs>

      <Typography variant="h6" gutterBottom>
        {activeTab === 0 ? 'Promote Students to Teachers' : 'Demote Teachers to Students'}
      </Typography>
      
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {activeTab === 0 
          ? 'Select any student to promote them to teacher status.'
          : 'Select any teacher to demote them back to student status.'
        }
      </Typography>
      
      {/* Search and refresh section */}
      <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
        <TextField
          placeholder={activeTab === 0 ? "Search students by name or email..." : "Search teachers by name or email..."}
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
          onClick={activeTab === 0 ? fetchStudents : fetchTeachers}
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
      
      {/* Data table */}
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
            ) : currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {searchTerm 
                      ? `No ${activeTab === 0 ? 'students' : 'teachers'} matching your search`
                      : `No ${activeTab === 0 ? 'students' : 'teachers'} available`
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map(item => (
                <TableRow 
                  key={item.id}
                  selected={
                    (activeTab === 0 && selectedStudent && selectedStudent.id === item.id) ||
                    (activeTab === 1 && selectedTeacher && selectedTeacher.id === item.id)
                  }
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
                      checked={
                        (activeTab === 0 && selectedStudent && selectedStudent.id === item.id) ||
                        (activeTab === 1 && selectedTeacher && selectedTeacher.id === item.id)
                      }
                      onChange={() => activeTab === 0 ? handleStudentSelect(item) : handleTeacherSelect(item)}
                    />
                  </TableCell>
                  <TableCell>
                    {activeTab === 0 
                      ? `${item.firstName} ${item.lastName}`
                      : item.name || 'Not specified'
                    }
                  </TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => activeTab === 0 ? handleStudentSelect(item) : handleTeacherSelect(item)}
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
      
      {/* Action form */}
      {((activeTab === 0 && selectedStudent) || (activeTab === 1 && selectedTeacher)) && (
        <Card sx={{ borderRadius: "10px", bgcolor: '#f8f9fa', mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {activeTab === 0 ? (
                <PersonAddIcon fontSize="small" sx={{ mr: 1, color: '#4a6cf7' }} />
              ) : (
                <PersonRemoveIcon fontSize="small" sx={{ mr: 1, color: '#f44336' }} />
              )}
              <Typography variant="h6">
                {activeTab === 0 ? 'Promote to Teacher' : 'Demote to Student'}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Selected {activeTab === 0 ? 'Student' : 'Teacher'}:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {activeTab === 0 
                  ? `${selectedStudent.firstName} ${selectedStudent.lastName} (${selectedStudent.email})`
                  : `${selectedTeacher.name} (${selectedTeacher.email})`
                }
              </Typography>
            </Box>
            
            {activeTab === 0 && (
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
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedStudent(null);
                  setSelectedTeacher(null);
                  setTeacherName('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={activeTab === 0 ? <PersonAddIcon fontSize="small" /> : <PersonRemoveIcon fontSize="small" />}
                onClick={activeTab === 0 ? handlePromoteStudent : handleDemoteTeacher}
                sx={{ 
                  backgroundColor: activeTab === 0 ? "#4a6cf7" : "#f44336",
                  "&:hover": {
                    backgroundColor: activeTab === 0 ? "#3a5ce5" : "#d32f2f"
                  }
                }}
              >
                {activeTab === 0 ? 'Promote to Teacher' : 'Demote to Student'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminInterface;