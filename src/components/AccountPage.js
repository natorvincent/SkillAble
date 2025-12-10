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
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Avatar,
  Fade,
  Chip,
  List,
  ListItem
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Navbar from "./Navbar";
import Background from "./Background";

function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState("");
  
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationText, setVerificationText] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [pendingFormData, setPendingFormData] = useState(null);
  const [pendingFormType, setPendingFormType] = useState("");
  
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  const [accountInfo, setAccountInfo] = useState({
    joinedDate: "2024-01-15",
    lastLogin: new Date().toISOString(),
    passwordLastUpdated: "2024-02-01",
    mfaEnabled: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const storedUserType = localStorage.getItem("userType");
    
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }

    setEmail(userEmail);
    
    if (storedUserType) {
      setUserType(storedUserType);
    }
    
    fetchUserProfile(userEmail);
  }, [navigate]);

  const fetchUserProfile = async (userEmail) => {
    try {
      let adminCheckResponse = await fetch(`https://skillable-pdv0.onrender.com/api/admin/check?email=${userEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      if (adminCheckResponse.ok) {
        const isAdmin = await adminCheckResponse.json();
        if (isAdmin) {
          setUserType("ADMIN");
          setUserProfile({ email: userEmail });
          localStorage.setItem("userType", "ADMIN");
          setLoading(false);
          return;
        }
      }
      
      let response = await fetch(`https://skillable-pdv0.onrender.com/api/students/profile?email=${userEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      let isStudent = response.ok;
      
      if (!isStudent) {
        response = await fetch(`https://skillable-pdv0.onrender.com/api/teachers/profile?email=${userEmail}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
      }
      const profileData = await response.json();
      setUserProfile(profileData);
      
      const type = isStudent ? "STUDENT" : "TEACHER";
      setUserType(type);
      
      if (type === "STUDENT") {
        setFirstName(profileData.firstName || "");
        setLastName(profileData.lastName || "");
        setDateOfBirth(profileData.dateOfBirth || "");
      } else if (type === "TEACHER") {
        setTeacherName(profileData.name || "");
      }
      
      localStorage.setItem("userType", type);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Unable to load your profile. Please log in again.");
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleStudentFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !dateOfBirth) {
      setError("All fields are required");
      setOpenSnackbar(true);
      return;
    }

    setPendingFormData({
      email: email,
      firstName,
      lastName,
      dateOfBirth
    });
    setPendingFormType("STUDENT");
    setVerificationDialogOpen(true);
  };

  const handleTeacherFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!teacherName) {
      setError("Name is required");
      setOpenSnackbar(true);
      return;
    }

    setPendingFormData({
      email: email,
      name: teacherName
    });
    setPendingFormType("TEACHER");
    setVerificationDialogOpen(true);
  };

  const handleVerificationSubmit = async () => {
    if (!verificationText.trim()) {
      setVerificationError("Please enter your password to confirm the update");
      return;
    }

    try {
      const loginResponse = await fetch("https://skillable-pdv0.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email, 
          password: verificationText 
        }),
      });

      if (!loginResponse.ok) {
        setVerificationError("Incorrect password. Please try again.");
        return;
      }

      const endpoint = pendingFormType === "TEACHER" 
        ? "https://skillable-pdv0.onrender.com/api/teachers/update"
        : "https://skillable-pdv0.onrender.com/api/students/update";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pendingFormData)
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setOpenSnackbar(true);
      setEditing(false);
      setVerificationDialogOpen(false);
      setVerificationText("");
      setVerificationError("");
      setPendingFormData(null);
      setPendingFormType("");
      
      fetchUserProfile(email);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setOpenSnackbar(true);
      setVerificationDialogOpen(false);
      setVerificationText("");
      setVerificationError("");
    }
  };

  const handlePasswordChange = async () => {
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setPasswordError("");

    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError("Current password is required");
      hasError = true;
    }

    if (!newPassword) {
      setNewPasswordError("New password is required");
      hasError = true;
    } else if (newPassword.length < 6) {
      setNewPasswordError("New password must be at least 6 characters long");
      hasError = true;
    }

    if (!confirmNewPassword) {
      setConfirmPasswordError("Please confirm your new password");
      hasError = true;
    } else if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      setConfirmPasswordError("New passwords do not match");
      hasError = true;
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      setNewPasswordError("New password must be different from current password");
      hasError = true;
    }

    if (hasError) return;

    try {
      const loginResponse = await fetch("https://skillable-pdv0.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email, 
          password: currentPassword 
        }),
      });

      if (!loginResponse.ok) {
        setCurrentPasswordError("Current password is incorrect");
        return;
      }

      const endpoint = userType === "TEACHER" 
        ? `https://skillable-pdv0.onrender.com/api/teachers/change-password?email=${encodeURIComponent(email)}`
        : `https://skillable-pdv0.onrender.com/api/students/change-password?email=${encodeURIComponent(email)}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          newPassword: newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setOpenSnackbar(true);
      setPasswordDialogOpen(false);
      resetPasswordFields();
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError(err.message || "Failed to change password");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmEmail !== email) {
      setDeleteError("Email does not match your account email");
      return;
    }

    try {
      const endpoint = userType === "TEACHER"
        ? `https://skillable-pdv0.onrender.com/api/teachers/delete?email=${email}`
        : `https://skillable-pdv0.onrender.com/api/students/delete?email=${email}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userType");
      localStorage.removeItem("studentId");
      localStorage.removeItem("teacherId");
      localStorage.removeItem("userId");
      
      setSuccess("Your account has been deleted successfully");
      setOpenSnackbar(true);
      setTimeout(() => navigate("/"), 1500);
      
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Failed to delete account");
      setOpenSnackbar(true);
      setDeleteDialogOpen(false);
    }
  };

  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
    setDeleteError("");
    setConfirmEmail("");
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteError("");
    setConfirmEmail("");
  };

  const handleCloseVerificationDialog = () => {
    setVerificationDialogOpen(false);
    setVerificationText("");
    setVerificationError("");
    setPendingFormData(null);
    setPendingFormType("");
  };

  const handleOpenPasswordDialog = () => {
    setPasswordDialogOpen(true);
    resetPasswordFields();
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    resetPasswordFields();
  };

  const resetPasswordFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCancelEdit = () => {
    if (userType === "STUDENT") {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setDateOfBirth(userProfile.dateOfBirth || "");
    } else if (userType === "TEACHER") {
      setTeacherName(userProfile.name || "");
    }
    setEditing(false);
  };

  const handleBack = () => {
    // Redirect to appropriate dashboard based on user type
    if (userType === "TEACHER") {
      navigate("/teacherdashboard");
    } else if (userType === "ADMIN") {
      navigate("/admindashboard");
    } else {
      navigate("/studentdashboard");
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitials = () => {
    if (userType === "STUDENT" && userProfile) {
      return `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase();
    } else if (userType === "TEACHER" && userProfile) {
      return userProfile.name?.[0]?.toUpperCase() || 'U';
    }
    return email[0].toUpperCase();
  };

  const capitalizeName = (name) => {
    if (!name) return '';
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getUserDisplayName = () => {
    if (userType === "STUDENT" && userProfile) {
      const firstName = userProfile.firstName || '';
      const lastName = userProfile.lastName || '';
      return capitalizeName(`${firstName} ${lastName}`.trim()) || 'Student';
    } else if (userType === "TEACHER" && userProfile) {
      return capitalizeName(userProfile.name) || 'Teacher';
    } else if (userType === "ADMIN") {
      return 'Administrator';
    }
    return 'User';
  };

  // Read-only Info Field Component
  const InfoFieldReadOnly = ({ label, value, isDate = false }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: '500' }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ 
        p: 1.5, 
        backgroundColor: 'grey.50', 
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'grey.200',
        color: 'text.primary',
        fontWeight: '500',
        fontSize: '0.95rem'
      }}>
        {isDate ? formatDateForDisplay(value) : value}
      </Typography>
    </Box>
  );

  // Enhanced Security Item Component
  const SecurityItem = ({ icon, label, value, action, status, isDestructive = false }) => (
    <ListItem 
      sx={{ 
        px: 0, 
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        gap: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 2,
        }
      }}
    >
      {/* Left side: Icon + Text */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, minWidth: 0 }}>
        <Box sx={{ 
          color: isDestructive ? 'error.main' : '#2E7D32',
          mt: 0.5,
          flexShrink: 0
        }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography 
            variant="body1" 
            fontWeight="500"
            color={isDestructive ? 'error.main' : 'text.primary'}
            sx={{ mb: 0.5 }}
          >
            {label}
          </Typography>
          {value && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              {value}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Right side: Status + Action */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        flexShrink: 0,
        ml: 2
      }}>
        {status && (
          <Typography 
            variant="body2" 
            color={status === "Enabled" ? "success.main" : "text.secondary"}
            sx={{ 
              fontWeight: '500',
              minWidth: 80,
              textAlign: 'right'
            }}
          >
            {status}
          </Typography>
        )}
        {action}
      </Box>
    </ListItem>
  );

  if (loading) {
    return (
      <div style={{ 
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
      }}>
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}>
          <Background />
        </div>
        <div style={{ 
          position: "relative", 
          zIndex: 1, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh" 
        }}>
          <Fade in={true} timeout={1000}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress 
                size={60} 
                sx={{ 
                  color: '#2E7D32',
                  mb: 2 
                }} 
              />
              <Typography variant="h6" color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                Loading your profile...
              </Typography>
            </Box>
          </Fade>
        </div>
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
        
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 2.5, md: 3 }, px: { xs: 2, sm: 3 } }}>
          {/* Header Section */}
          <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{
                color: 'white',
                mb: { xs: 1.5, sm: 2 },
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  transform: 'translateY(-1px)',
                },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: '600',
                px: { xs: 1.5, sm: 2 },
                py: 0.75,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.2s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Back to {userType === "TEACHER" ? "Teacher" : userType === "ADMIN" ? "Admin" : "Student"} Dashboard
            </Button>
            
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(25px)',
                borderRadius: { xs: 2, sm: 3 },
                p: { xs: 2, sm: 2.5, md: 3 },
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 2.5, md: 3 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Avatar
                  sx={{
                    width: { xs: 60, sm: 70, md: 80 },
                    height: { xs: 60, sm: 70, md: 80 },
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                    fontWeight: 'bold',
                    border: '3px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 } }}>
                  <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}>
                    {getUserDisplayName()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      icon={userType === "ADMIN" ? <AdminPanelSettingsIcon /> : userType === "TEACHER" ? <SchoolIcon /> : <PersonIcon />}
                      label={userType.toLowerCase()}
                      size="medium"
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: 'rgba(0, 0, 0, 0.9)',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        borderRadius: 2,
                        '& .MuiChip-icon': { 
                          color: 'rgba(0, 0, 0, 0.9)',
                        }
                      }}
                    />
                    <Chip
                      icon={<EmailIcon sx={{ color: 'white !important' }} />}
                      label={email}
                      size="medium"
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(46, 125, 50, 0.8)',
                        color: 'white',
                        fontWeight: '500',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 2,
                        '& .MuiChip-icon': { 
                          color: 'white',
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EventIcon fontSize="small" sx={{ opacity: 0.9 }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Joined {formatDateForDisplay(accountInfo.joinedDate)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" sx={{ opacity: 0.9 }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Last login: {formatDateTime(accountInfo.lastLogin)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Main Content Grid */}
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Profile Information Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  background: 'white',
                  borderRadius: { xs: 2, sm: 3 },
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, pb: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3,
                    width: '100%',
                    gap: 2
                  }}>
                    <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ flexShrink: 0 }}>
                      Profile Information
                    </Typography>
                    {!editing && userType !== "ADMIN" && (
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => setEditing(true)}
                        variant="contained"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: '600',
                          flexShrink: 0,
                          ml: 'auto',
                          transition: 'all 0.2s ease-in-out',
                          backgroundColor: '#2E7D32',
                          '&:hover': {
                            backgroundColor: '#1B5E20',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                          }
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>

                  {!editing ? (
                    <Box>
                      {userType === "STUDENT" && (
                        <>
                          <InfoFieldReadOnly 
                            label="First Name"
                            value={capitalizeName(userProfile.firstName) || "Not set"}
                          />
                          <InfoFieldReadOnly 
                            label="Last Name"
                            value={capitalizeName(userProfile.lastName) || "Not set"}
                          />
                          <InfoFieldReadOnly 
                            label="Date of Birth"
                            value={formatDateForDisplay(userProfile.dateOfBirth)}
                            isDate={true}
                          />
                        </>
                      )}
                      {userType === "TEACHER" && (
                        <InfoFieldReadOnly 
                          label="Full Name"
                          value={capitalizeName(userProfile.name) || "Not set"}
                        />
                      )}
                      {userType === "ADMIN" && (
                        <InfoFieldReadOnly 
                          label="Role"
                          value="Administrator"
                        />
                      )}
                    </Box>
                  ) : (
                    <Box component="form" onSubmit={userType === "STUDENT" ? handleStudentFormSubmit : handleTeacherFormSubmit}>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 3, 
                          borderRadius: 2,
                          backgroundColor: 'rgba(46, 125, 50, 0.08)',
                          border: '1px solid rgba(46, 125, 50, 0.2)',
                        }}
                        icon={<SecurityIcon />}
                      >
                        You will need to enter your password to verify this update for security purposes.
                      </Alert>

                      {userType === "STUDENT" ? (
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              required
                              fullWidth
                              label="First Name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              required
                              fullWidth
                              label="Last Name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              required
                              fullWidth
                              label="Date of Birth"
                              type="date"
                              value={dateOfBirth}
                              onChange={(e) => setDateOfBirth(e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        <TextField
                          required
                          fullWidth
                          label="Full Name"
                          value={teacherName}
                          onChange={(e) => setTeacherName(e.target.value)}
                          size="small"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                            mb: 2
                          }}
                        />
                      )}

                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                          variant="outlined"
                          color="inherit"
                          onClick={handleCancelEdit}
                          sx={{ 
                            borderRadius: 2, 
                            textTransform: 'none',
                            px: 3,
                            fontWeight: '500',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          sx={{ 
                            borderRadius: 2, 
                            textTransform: 'none', 
                            px: 3,
                            fontWeight: '600',
                            transition: 'all 0.2s ease-in-out',
                            backgroundColor: '#2E7D32',
                            '&:hover': {
                              backgroundColor: '#1B5E20',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                            }
                          }}
                          startIcon={<SaveIcon />}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Security Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  background: 'white',
                  borderRadius: 3,
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                  }
                }}
              >
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 3 }}>
                    Security Settings
                  </Typography>
                  
                  <List sx={{ width: '100%', p: 0 }}>
                    {/* Password Row */}
                    <SecurityItem
                      icon={<LockIcon />}
                      label="Password"
                      value={`Last updated ${formatDateForDisplay(accountInfo.passwordLastUpdated)}`}
                      action={
                        <Button
                          variant="contained"
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: '600',
                            minWidth: 100,
                            transition: 'all 0.2s ease-in-out',
                            backgroundColor: '#2E7D32',
                            '&:hover': {
                              backgroundColor: '#1B5E20',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                            }
                          }}
                          onClick={handleOpenPasswordDialog}
                          startIcon={<LockIcon />}
                        >
                          Update
                        </Button>
                      }
                    />
                    
                    {/* Only show delete account for non-admin users */}
                    {userType !== "ADMIN" && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        
                        {/* Delete Account Row */}
                        <SecurityItem
                          icon={<DeleteIcon />}
                          label="Delete Account"
                          value="Permanently remove your account and data"
                          action={
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={handleOpenDeleteDialog}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: '600',
                                minWidth: 100,
                                backgroundColor: 'error.main',
                                color: 'white',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  backgroundColor: 'error.dark',
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                                }
                              }}
                              startIcon={<DeleteIcon />}
                            >
                              Delete
                            </Button>
                          }
                          isDestructive={true}
                        />
                      </>
                    )}
                  </List>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onClose={handleCloseVerificationDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          py: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <SecurityIcon />
            <Typography variant="h6" fontWeight="600">
              Verify Your Identity
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText sx={{ mb: 3, color: 'text.primary', fontWeight: '500' }}>
            For security purposes, please enter your current password to confirm these changes.
          </DialogContentText>
          
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Current Password"
            value={verificationText}
            onChange={(e) => setVerificationText(e.target.value)}
            error={!!verificationError}
            helperText={verificationError}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button
            onClick={handleCloseVerificationDialog}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: '500',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerificationSubmit}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: '600',
              px: 3,
              backgroundColor: '#2E7D32',
              '&:hover': {
                backgroundColor: '#1B5E20',
              }
            }}
            startIcon={<LockIcon />}
          >
            Verify & Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#2E7D32', 
          color: 'white',
          py: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LockIcon />
            <Typography variant="h6" fontWeight="600">
              Change Password
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText sx={{ mb: 3, color: 'text.primary', fontWeight: '500' }}>
            Please enter your current password and set a new password.
          </DialogContentText>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Current Password */}
            <TextField
              fullWidth
              type={showCurrentPassword ? "text" : "password"}
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={!!currentPasswordError}
              helperText={currentPasswordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      edge="end"
                      size="small"
                    >
                      {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* New Password */}
            <TextField
              fullWidth
              type={showNewPassword ? "text" : "password"}
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!newPasswordError}
              helperText={newPasswordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {/* Confirm New Password */}
            <TextField
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            {passwordError && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {passwordError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button
            onClick={handleClosePasswordDialog}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: '500',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: '600',
              px: 3,
              backgroundColor: '#2E7D32',
              '&:hover': {
                backgroundColor: '#1B5E20',
              }
            }}
            startIcon={<SaveIcon />}
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: 'error.main', 
          color: 'white',
          py: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <DeleteIcon />
            <Typography variant="h6" fontWeight="600">
              Delete Account
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(244, 67, 54, 0.3)' }}>
            <Typography fontWeight="600" gutterBottom>
              This action cannot be undone
            </Typography>
            <Typography variant="body2">
              All your data, including progress, courses, and personal information will be permanently deleted.
            </Typography>
          </Alert>

          <DialogContentText sx={{ mb: 2, color: 'text.primary' }}>
            To confirm deletion, please type your email address:
          </DialogContentText>

          <Typography variant="body2" fontWeight="600" color="text.secondary" sx={{ mb: 1 }}>
            {email}
          </Typography>

          <TextField
            autoFocus
            fullWidth
            label="Confirm Email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            error={!!deleteError}
            helperText={deleteError}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button
            onClick={handleCloseDeleteDialog}
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: '500',
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none',
              fontWeight: '600',
              px: 3,
              '&:hover': {
                backgroundColor: 'error.dark',
              }
            }}
            startIcon={<DeleteIcon />}
          >
            Delete Account Permanently
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
          severity={error ? "error" : "success"}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            alignItems: 'center'
          }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AccountPage;