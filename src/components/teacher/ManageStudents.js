import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDarkMode } from '../DarkModeContext';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  Divider,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha
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
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ManageStudents() {
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");
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
  const location = useLocation();

  // Use dark mode context instead of local state
  const { darkMode, toggleDarkMode, colors } = useDarkMode();

  // Sidebar menu items
  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/teacherdashboard",
      active: location.pathname === "/teacherdashboard"
    },
    {
      text: "Manage Students",
      icon: <PeopleAltIcon />,
      path: "/manageStudents",
      active: location.pathname === "/manageStudents"
    },
    {
      text: "View Analytics",
      icon: <AnalyticsIcon />,
      path: "/studentProgress",
      active: location.pathname === "/studentProgress"
    },
  ];

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

  const getInitials = (name) => {
    if (!name) return "T";
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleMenuItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  const { fontColor, sidebarBgColor, offWhiteColors, gradientColors } = colors;

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        backgroundColor: offWhiteColors.background
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: fontColor, mb: 2 }} size={48} />
          <Typography variant="h6" sx={{ color: fontColor, fontWeight: 500 }}>
            Loading students...
          </Typography>
        </Box>
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: offWhiteColors.background }}>
      {/* Fixed Sidebar */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          backgroundColor: sidebarBgColor,
          color: fontColor,
          borderRight: darkMode ? `1px solid ${alpha('#ffffff', 0.1)}` : 'none',
          overflowX: 'hidden',
          position: 'fixed',
          height: '100vh',
          top: 0,
          left: 0,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: `1px solid ${alpha(fontColor, 0.1)}`,
          backgroundColor: gradientColors.sidebarHeader,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              {getInitials(teacherName)}
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: fontColor }}>
                {teacherName}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha(fontColor, 0.7) }}>
                Teacher
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Main Menu */}
        <List sx={{ p: 1, flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem 
              key={item.text} 
              disablePadding 
              sx={{ 
                mb: 0.5,
                borderRadius: '12px',
                backgroundColor: item.active ? alpha(fontColor, 0.1) : 'transparent',
              }}
            >
              <ListItemButton
                onClick={() => handleMenuItemClick(item)}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderRadius: '12px',
                  '&:hover': {
                    backgroundColor: alpha(fontColor, 0.05),
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: item.active ? fontColor : alpha(fontColor, 0.7),
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiListItemText-primary': {
                      fontWeight: item.active ? 600 : 300,
                      color: item.active ? fontColor : alpha(fontColor, 0.9),
                      fontSize: '0.9rem',
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          
          {/* Dark Mode Toggle Button in Sidebar */}
          <ListItem disablePadding sx={{ mt: 2 }}>
            <ListItemButton
              onClick={toggleDarkMode}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: alpha(fontColor, 0.05),
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: alpha(fontColor, 0.7),
                minWidth: 40
              }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText 
                primary={darkMode ? "Light Mode" : "Dark Mode"} 
                sx={{ 
                  '& .MuiListItemText-primary': {
                    color: fontColor,
                    fontSize: '0.875rem',
                    '--tw-text-opacity': 1,
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Sidebar Footer */}
        <Box sx={{ p: 3, borderTop: `1px solid ${alpha(fontColor, 0.1)}` }}>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userEmail");
              localStorage.removeItem("userRole");
              localStorage.removeItem("isAdmin");
              localStorage.removeItem("teacherId");
              navigate("/login");
              setSuccess("Logged out successfully!");
              setOpenSnackbar(true);
            }}
            sx={{
              borderRadius: '12px',
              backgroundColor: darkMode ? '#667eea' : fontColor,
              color: 'white',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: darkMode ? '#5a67d8' : '#1f0750',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(40, 11, 96, 0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Log out
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          ml: '280px',
          width: 'calc(100% - 280px)',
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="xl" sx={{ paddingTop: 4, paddingBottom: 5 }}>
          {/* Main Content Card */}
          <Paper
            sx={{ 
              padding: 4, 
              backgroundColor: alpha(offWhiteColors.cardBg, 0.95),
              borderRadius: "24px",
              backdropFilter: 'blur(10px)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
              background: `linear-gradient(135deg, ${gradientColors.cardGradient1} 0%, ${gradientColors.cardGradient2} 100%)`,
              boxShadow: darkMode ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GroupIcon sx={{ color: fontColor, mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h5" fontWeight={700} color={fontColor}>
                    Student Management
                  </Typography>
                  <Typography variant="body1" sx={{ color: alpha(fontColor, 0.7), mt: 0.5 }}>
                    Assign and manage students in your class
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
  variant="contained"
  startIcon={<AssignmentIndIcon />}
  onClick={() => setOpenAssignModal(true)}
  disabled={unassignedStudents.length === 0}
  sx={{
    borderRadius: "12px",
    backgroundColor: darkMode ? '#667eea' : fontColor,
    color: 'white',
    py: 1.5,
    px: 3,
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: darkMode 
      ? '0 4px 15px rgba(102, 126, 234, 0.3)'
      : `0 4px 15px ${alpha(fontColor, 0.3)}`,
    '&:hover': {
      backgroundColor: darkMode ? '#1f0750' : '#1f0750',
      transform: 'translateY(-2px)',
      boxShadow: darkMode 
        ? '0 6px 20px rgba(102, 126, 234, 0.4)'
        : `0 6px 20px ${alpha(fontColor, 0.4)}`,
    },
    '&:disabled': {
      backgroundColor: darkMode ? '#4b5563' : '#cbd5e1',
      color: darkMode ? '#9ca3af' : 'white',
      boxShadow: 'none',
    },
    transition: 'all 0.2s ease',
  }}
>
  Add a Student
</Button>
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: alpha(fontColor, 0.1), mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2,
                    px: 3,
                    color: alpha(fontColor, 0.7),
                    '&.Mui-selected': {
                      color: fontColor,
                    }
                  }
                }}
              >
                <Tab 
                  label={`My Students (${myStudents.length})`} 
                  icon={<GroupIcon />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder={tabValue === 0 ? "Search my students..." : "Search available students..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: alpha(fontColor, 0.5), mr: 1 }} />
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: offWhiteColors.surface,
                    "& fieldset": {
                      borderColor: alpha(fontColor, 0.1),
                    },
                    "&:hover fieldset": {
                      borderColor: fontColor,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: fontColor,
                      borderWidth: 2,
                    }
                  },
                  "& .MuiInputBase-input": {
                    color: fontColor,
                  }
                }}
              />
            </Box>

            {/* Students Table */}
            {filteredStudents.length > 0 ? (
              <TableContainer component={Paper} sx={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: `1px solid ${alpha(fontColor, 0.1)}`,
                backgroundColor: offWhiteColors.surface
              }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: offWhiteColors.subtleBg }}>
                      <TableCell sx={{ fontWeight: 700, color: fontColor, fontSize: '0.95rem' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: fontColor, fontSize: '0.95rem' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: fontColor, fontSize: '0.95rem' }}>Date of Birth</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: fontColor, fontSize: '0.95rem' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: fontColor, fontSize: '0.95rem', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} hover sx={{ 
                        '&:hover': {
                          backgroundColor: offWhiteColors.subtleBg
                        }
                      }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ 
                              width: 36, 
                              height: 36, 
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${fontColor} 0%, ${alpha(fontColor, 0.7)} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                              mr: 2
                            }}>
                              {student.firstName ? student.firstName.charAt(0).toUpperCase() : 'S'}
                            </Box>
                            <Box>
                              <Typography variant="body1" fontWeight={600} color={fontColor}>
                                {student.firstName && student.lastName 
                                  ? `${student.firstName} ${student.lastName}`
                                  : "Profile Incomplete"
                                }
                              </Typography>
                              <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7) }}>
                                ID: {student.id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ color: fontColor, mr: 1, fontSize: 18 }} />
                            <Typography variant="body2" color={fontColor}>
                              {student.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarTodayIcon sx={{ color: fontColor, mr: 1, fontSize: 18 }} />
                            <Typography variant="body2" color={fontColor}>
                              {formatDate(student.dateOfBirth)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={student.firstName && student.lastName ? "Active" : "Incomplete"}
                            sx={{ 
                              fontWeight: 600,
                              backgroundColor: student.firstName && student.lastName 
                                ? alpha('#22c55e', 0.1)
                                : alpha('#f59e0b', 0.1),
                              color: student.firstName && student.lastName 
                                ? '#22c55e'
                                : '#f59e0b'
                            }}
                            size="small"
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
                                color: fontColor, 
                                backgroundColor: alpha(fontColor, 0.1),
                                '&:hover': { 
                                  backgroundColor: alpha(fontColor, 0.2),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
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
                                backgroundColor: alpha('#ef4444', 0.1),
                                '&:hover': { 
                                  backgroundColor: alpha('#ef4444', 0.2),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
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
                p: 6, 
                textAlign: 'center', 
                backgroundColor: offWhiteColors.subtleBg,
                borderRadius: '20px',
                border: `2px dashed ${alpha(fontColor, 0.2)}`
              }}>
                {tabValue === 0 ? 
                  <GroupIcon sx={{ fontSize: 60, color: alpha(fontColor, 0.3), mb: 2 }} /> : 
                  <SchoolIcon sx={{ fontSize: 60, color: alpha(fontColor, 0.3), mb: 2 }} />
                }
                <Typography variant="h5" sx={{ color: fontColor, gutterBottom: true, fontWeight: 600, mb: 2 }}>
                  {tabValue === 0 ? "No Students Assigned" : "No Available Students"}
                </Typography>
                <Typography variant="body1" sx={{ color: alpha(fontColor, 0.7), mb: 3, maxWidth: '400px', mx: 'auto' }}>
                  {searchTerm 
                    ? "No students match your search criteria." 
                    : tabValue === 0 
                      ? "You haven't assigned any students yet. Assign students from the available list."
                      : "All students have been assigned to teachers."
                  }
                </Typography>
                {!searchTerm && tabValue === 0 && unassignedStudents.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<AssignmentIndIcon />}
                    onClick={() => setOpenAssignModal(true)}
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: fontColor,
                      fontWeight: 600,
                      textTransform: 'none',
                      boxShadow: `0 4px 15px ${alpha(fontColor, 0.3)}`,
                      '&:hover': {
                        backgroundColor: darkMode ? '#5a67d8' : '#1f0750',
                        boxShadow: `0 6px 20px ${alpha(fontColor, 0.4)}`,
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
      </Box>

      {/* Assign Student Modal */}
<Modal
  open={openAssignModal}
  onClose={() => setOpenAssignModal(false)}
  closeAfterTransition
  // Removed BackdropComponent and BackdropProps
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Fade in={openAssignModal}>
    <Paper
      sx={{
        width: { xs: '90%', sm: '500px' },
        p: 4,
        outline: 'none',
        borderRadius: '24px',
        backgroundColor: offWhiteColors.modalBg,
        background: `linear-gradient(135deg, ${gradientColors.modalGradient1} 0%, ${gradientColors.modalGradient2} 100%)`,
        boxShadow: darkMode ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 20px 60px rgba(0, 0, 0, 0.15)',
        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
      }}
    >
      {/* Rest of your modal content remains the same */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: fontColor }}>
          Assign Student
        </Typography>
        <IconButton
          onClick={() => setOpenAssignModal(false)}
          sx={{ 
            color: fontColor,
            backgroundColor: alpha(fontColor, 0.1),
            '&:hover': {
              backgroundColor: alpha(fontColor, 0.2),
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3, height: 2, backgroundColor: fontColor }} />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: fontColor, fontWeight: 500 }}>Select Student</InputLabel>
        <Select
          value={selectedStudent?.id || ''}
          label="Select Student"
          onChange={(e) => {
            const student = unassignedStudents.find(s => s.id === e.target.value);
            setSelectedStudent(student);
          }}
          sx={{
            borderRadius: "16px",
            backgroundColor: alpha(fontColor, 0.05),
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(fontColor, 0.3),
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: fontColor,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: fontColor,
              borderWidth: 2,
            }
          }}
        >
          {unassignedStudents.map((student) => (
            <MenuItem key={student.id} value={student.id}>
              <Box>
                <Typography variant="body1" fontWeight={500} color={fontColor}>
                  {student.firstName && student.lastName 
                    ? `${student.firstName} ${student.lastName}`
                    : "Profile Incomplete"
                  }
                </Typography>
                <Typography variant="body2" sx={{ color: alpha(fontColor, 0.7) }}>
                  {student.email}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedStudent && (
        <Box sx={{ 
          p: 3, 
          backgroundColor: offWhiteColors.subtleBg, 
          borderRadius: '16px', 
          mb: 3,
          border: `1px solid ${alpha(fontColor, 0.1)}`
        }}>
          <Typography variant="subtitle2" fontWeight={600} color={fontColor} gutterBottom>
            Selected Student:
          </Typography>
          <Typography variant="body1" fontWeight={500} color={fontColor}>
            {selectedStudent.firstName && selectedStudent.lastName 
              ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
              : "Profile Incomplete"
            }
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
            borderRadius: "16px",
            borderColor: alpha(fontColor, 0.3),
            color: fontColor,
            fontWeight: 500,
            textTransform: 'none',
            py: 1.5,
            '&:hover': {
              borderColor: fontColor,
              backgroundColor: alpha(fontColor, 0.05)
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
            borderRadius: "16px",
            backgroundColor: fontColor,
            fontWeight: 600,
            textTransform: 'none',
            py: 1.5,
            boxShadow: `0 4px 15px ${alpha(fontColor, 0.3)}`,
            '&:hover': {
              backgroundColor: darkMode ? '#5a67d8' : '#1f0750',
              boxShadow: `0 6px 20px ${alpha(fontColor, 0.4)}`,
            },
            '&:disabled': {
              backgroundColor: '#cbd5e1',
              boxShadow: 'none',
            }
          }}
        >
          {assigning ? <CircularProgress size={24} color="inherit" /> : "Assign Student"}
        </Button>
      </Box>
    </Paper>
  </Fade>
</Modal>

      {/* Unassign Student Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 2,
            backgroundColor: offWhiteColors.modalBg,
            background: `linear-gradient(135deg, ${gradientColors.modalGradient1} 0%, ${gradientColors.modalGradient2} 100%)`,
            boxShadow: darkMode ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.5)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: fontColor, fontSize: '1.25rem' }}>
          Unassign Student
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: alpha(fontColor, 0.7) }}>
            Are you sure you want to unassign {studentToDelete?.firstName} {studentToDelete?.lastName} from your class? 
            The student will become available for other teachers to assign.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ 
              borderRadius: "12px",
              color: fontColor,
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: offWhiteColors.subtleBg
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUnassignStudent}
            variant="contained"
            sx={{ 
              borderRadius: "12px",
              backgroundColor: '#ef4444',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                backgroundColor: '#dc2626',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
              }
            }}
          >
            Unassign Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? "success" : "error"}
          sx={{ 
            width: "100%", 
            borderRadius: "16px",
            fontWeight: 500,
            fontSize: '1rem',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            backgroundColor: offWhiteColors.cardBg,
            color: fontColor,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            },
            '& .MuiAlert-message': {
              color: fontColor,
            }
          }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ManageStudents;