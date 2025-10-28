import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  Backdrop,
  Fade,
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
  Card,
  Divider,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Navbar from "../Navbar";
import Background from "../Background";

function ManageStudents() {
  const [loading, setLoading] = useState(true);
  const [myStudents, setMyStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }

    fetchData();
  }, [navigate]);

  useEffect(() => {
    const currentList = tabValue === 0 ? myStudents : unassignedStudents;
    const filtered = currentList.filter(student =>
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [myStudents, unassignedStudents, searchTerm, tabValue]);

  const fetchData = async () => {
    await Promise.all([fetchMyStudents(), fetchUnassignedStudents()]);
    setLoading(false);
  };

  const fetchMyStudents = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch(`https://skillable-pdv0.onrender.com/api/teachers/students?email=${userEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch my students");
      }

      const studentsData = await response.json();
      setMyStudents(studentsData);
    } catch (err) {
      console.error("Error fetching my students:", err);
      setMyStudents([]);
    }
  };

  const fetchUnassignedStudents = async () => {
    try {
      const response = await fetch("https://skillable-pdv0.onrender.com/api/teachers/unassigned-students", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unassigned students");
      }

      const studentsData = await response.json();
      setUnassignedStudents(studentsData);
    } catch (err) {
      console.error("Error fetching unassigned students:", err);
      setUnassignedStudents([]);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudent) return;

    setAssigning(true);
    try {
      const teacherEmail = localStorage.getItem("userEmail");
      const response = await fetch("https://skillable-pdv0.onrender.com/api/teachers/assign-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          teacherEmail: teacherEmail,
          studentEmail: selectedStudent.email
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to assign student");
      }

      setSuccess("Student assigned successfully!");
      setOpenSnackbar(true);
      setOpenAssignModal(false);
      setSelectedStudent(null);
      
      fetchData();
    } catch (err) {
      console.error("Error assigning student:", err);
      setError(err.message || "Failed to assign student");
      setOpenSnackbar(true);
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassignStudent = async () => {
    if (!studentToDelete) return;

    try {
      const teacherEmail = localStorage.getItem("userEmail");
      const response = await fetch("https://skillable-pdv0.onrender.com/api/teachers/unassign-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          teacherEmail: teacherEmail,
          studentEmail: studentToDelete.email
        })
      });

      if (!response.ok) {
        throw new Error("Failed to unassign student");
      }

      setSuccess("Student unassigned successfully!");
      setOpenSnackbar(true);
      setOpenDeleteDialog(false);
      setStudentToDelete(null);
      
      fetchData();
    } catch (err) {
      console.error("Error unassigning student:", err);
      setError("Failed to unassign student");
      setOpenSnackbar(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
    setSuccess("");
  };

  const getTotalStudents = () => {
    return myStudents.length + unassignedStudents.length;
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}>
        <CircularProgress sx={{ color: "#4a6cf7" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <Background />
      </div>
      
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Navbar />
        
        <Container maxWidth="lg" sx={{ paddingTop: 5, paddingBottom: 5 }}>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: "12px",
                backgroundColor: "#4a6cf7",
                color: "white",
                "&:hover": {
                  backgroundColor: "#3a5ce5"
                },
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Back
            </Button>
          </Box>
          
          <Paper
            sx={{ 
              padding: 4, 
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              mb: 4,
              boxShadow: "none",
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ color: '#4a6cf7', mr: 2, fontSize: 36 }} />
                <Box>
                  <Typography variant="h4" color="#2d3748" fontWeight={700}>
                    Manage Students
                  </Typography>
                  <Typography variant="body1" color="#4a5568" sx={{ mt: 0.5 }}>
                    Assign students to your class
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AssignmentIndIcon />}
                onClick={() => setOpenAssignModal(true)}
                disabled={unassignedStudents.length === 0}
                sx={{
                  borderRadius: "12px",
                  backgroundColor: "#4a6cf7",
                  py: 1.5,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#3a5ce5"
                  },
                  "&:disabled": {
                    backgroundColor: "#9ca3af"
                  },
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                Assign Student
              </Button>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  backgroundColor: '#f8f9ff',
                  border: '1px solid #e3e8ff',
                  boxShadow: "none"
                }}>
                  <GroupIcon sx={{ fontSize: 40, color: '#4a6cf7', mb: 1 }} />
                  <Typography variant="h5" fontWeight={600} color="#2d3748">
                    {myStudents.length}
                  </Typography>
                  <Typography variant="body2" color="#4a5568">
                    My Students
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  backgroundColor: '#fff7ed',
                  border: '1px solid #fed7aa',
                  boxShadow: "none"
                }}>
                  <SchoolIcon sx={{ fontSize: 40, color: '#f97316', mb: 1 }} />
                  <Typography variant="h5" fontWeight={600} color="#2d3748">
                    {unassignedStudents.length}
                  </Typography>
                  <Typography variant="body2" color="#4a5568">
                    Available to Assign
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  boxShadow: "none"
                }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#22c55e', mb: 1 }} />
                  <Typography variant="h5" fontWeight={600} color="#2d3748">
                    {getTotalStudents()}
                  </Typography>
                  <Typography variant="body2" color="#4a5568">
                    Total Students
                  </Typography>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }
                }}
              >
                <Tab 
                  label={`My Students (${myStudents.length})`} 
                  icon={<GroupIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label={`Available Students (${unassignedStudents.length})`} 
                  icon={<SchoolIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder={tabValue === 0 ? "Search my students..." : "Search available students..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: '#9ca3af', mr: 1 }} />
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "white"
                  }
                }}
              />
            </Box>

            {filteredStudents.length > 0 ? (
              <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Date of Birth</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2d3748' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#2d3748', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ color: '#4a6cf7', mr: 2 }} />
                            <Box>
                              <Typography variant="body1" fontWeight={500}>
                                {student.firstName && student.lastName 
                                  ? `${student.firstName} ${student.lastName}`
                                  : "Profile Incomplete"
                                }
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                ID: {student.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ color: '#6b7280', mr: 1, fontSize: 18 }} />
                            <Typography variant="body2">
                              {student.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon sx={{ color: '#6b7280', mr: 1, fontSize: 18 }} />
                            <Typography variant="body2">
                              {formatDate(student.dateOfBirth)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.firstName && student.lastName ? "Active" : "Incomplete"}
                            color={student.firstName && student.lastName ? "success" : "warning"}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {tabValue === 1 ? (
                            <IconButton
                              onClick={() => {
                                setSelectedStudent(student);
                                setOpenAssignModal(true);
                              }}
                              sx={{ 
                                color: '#4a6cf7', 
                                '&:hover': { backgroundColor: 'rgba(74, 108, 247, 0.1)' }
                              }}
                              title="Assign to me"
                            >
                              <AddIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              onClick={() => {
                                setStudentToDelete(student);
                                setOpenDeleteDialog(true);
                              }}
                              sx={{ 
                                color: '#ef4444', 
                                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' }
                              }}
                              title="Unassign student"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ 
                p: 5, 
                textAlign: 'center', 
                backgroundColor: '#f8f9fa',
                borderRadius: '15px',
                border: '1px dashed #dee2e6'
              }}>
                {tabValue === 0 ? <GroupIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} /> : <SchoolIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />}
                <Typography variant="h6" color="#4a5568" gutterBottom>
                  {tabValue === 0 ? "No Students Assigned" : "No Available Students"}
                </Typography>
                <Typography variant="body1" color="#4a5568" sx={{ mb: 3 }}>
                  {searchTerm 
                    ? "No students match your search criteria." 
                    : tabValue === 0 
                      ? "You haven't assigned any students yet."
                      : "All students have been assigned to teachers."
                  }
                </Typography>
                {!searchTerm && tabValue === 0 && unassignedStudents.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AssignmentIndIcon />}
                    onClick={() => setOpenAssignModal(true)}
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#4a6cf7",
                      "&:hover": {
                        backgroundColor: "#3a5ce5"
                      }
                    }}
                  >
                    Assign Student
                  </Button>
                )}
              </Box>
            )}
          </Paper>
        </Container>
      </div>

      <Modal
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openAssignModal}>
          <Paper
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '500px' },
              p: 4,
              outline: 'none',
              borderRadius: '20px',
              boxShadow: "none",
              border: '2px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={600} color="#2d3748">
                Assign Student
              </Typography>
              <IconButton
                onClick={() => setOpenAssignModal(false)}
                sx={{ color: '#6b7280' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Student</InputLabel>
              <Select
                value={selectedStudent?.id || ''}
                label="Select Student"
                onChange={(e) => {
                  const student = unassignedStudents.find(s => s.id === e.target.value);
                  setSelectedStudent(student);
                }}
                sx={{
                  borderRadius: "10px",
                }}
              >
                {unassignedStudents.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    <Box>
                      <Typography variant="body1">
                        {student.firstName && student.lastName 
                          ? `${student.firstName} ${student.lastName}`
                          : "Profile Incomplete"
                        }
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.email}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedStudent && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px', 
                mb: 3,
                border: '1px solid #e9ecef'
              }}>
                <Typography variant="subtitle2" color="#2d3748" gutterBottom>
                  Selected Student:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {selectedStudent.firstName && selectedStudent.lastName 
                    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                    : "Profile Incomplete"
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedStudent.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  DOB: {formatDate(selectedStudent.dateOfBirth)}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setOpenAssignModal(false);
                  setSelectedStudent(null);
                }}
                sx={{
                  borderRadius: "10px",
                  borderColor: "#e5e7eb",
                  color: "#6b7280",
                  "&:hover": {
                    borderColor: "#d1d5db",
                    backgroundColor: "#f9fafb"
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                disabled={!selectedStudent || assigning}
                onClick={handleAssignStudent}
                sx={{ 
                  borderRadius: "10px",
                  backgroundColor: "#4a6cf7",
                  "&:hover": {
                    backgroundColor: "#3a5ce5"
                  }
                }}
              >
                {assigning ? <CircularProgress size={24} color="inherit" /> : "Assign Student"}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Modal>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, color: '#2d3748' }}>
          Unassign Student
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to unassign {studentToDelete?.firstName} {studentToDelete?.lastName} from your class? The student will become available for other teachers to assign.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ 
              borderRadius: "8px",
              color: "#6b7280"
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUnassignStudent}
            variant="contained"
            color="warning"
            sx={{ 
              borderRadius: "8px",
              backgroundColor: "#f97316",
              "&:hover": {
                backgroundColor: "#ea580c"
              }
            }}
          >
            Unassign Student
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? "success" : "error"}
          sx={{ width: "100%", borderRadius: "10px" }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ManageStudents;