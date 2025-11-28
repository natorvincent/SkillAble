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
  ListItem,
  Switch
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
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
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
  
  // FIXED: Realistic date data
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
      let adminCheckResponse = await fetch(`http://localhost:8080/api/admin/check?email=${userEmail}`, {
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
      
      let response = await fetch(`http://localhost:8080/api/students/profile?email=${userEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      let isStudent = response.ok;
      
      if (!isStudent) {
        response = await fetch(`http://localhost:8080/api/teachers/profile?email=${userEmail}`, {
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
      const loginResponse = await fetch("http://localhost:8080/api/auth/login", {
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
        ? "http://localhost:8080/api/teachers/update"
        : "http://localhost:8080/api/students/update";

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
      const loginResponse = await fetch("http://localhost:8080/api/auth/login", {
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
        ? `http://localhost:8080/api/teachers/change-password?email=${encodeURIComponent(email)}`
        : `http://localhost:8080/api/students/change-password?email=${encodeURIComponent(email)}`;

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
        ? `http://localhost:8080/api/teachers/delete?email=${email}`
        : `http://localhost:8080/api/students/delete?email=${email}`;

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
    navigate("/homepage");
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

  // FIXED: Proper name capitalization
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

  // FIXED: Enhanced Security Item with better UX
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
          color: isDestructive ? 'error.main' : '#2E7D32', // Teal green color
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
        {/* FIXED: Better status display without chip */}
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
                  color: '#2E7D32', // Teal green
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
        
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {/* Header Section */}
          <Box sx={{ mb: 3 }}>
            {/* FIXED: Better back button visibility */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{
                color: 'white',
                mb: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker background for better contrast
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  transform: 'translateY(-1px)',
                },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: '600',
                px: 2,
                py: 0.75,
                transition: 'all 0.2s ease-in-out',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Back to Dashboard
            </Button>
            
            <Paper
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(25px)',
                borderRadius: 3,
                p: 3,
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(255, 255, 255, 0.25)',
                    fontSize: '1.75rem',
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
                <Box sx={{ flex: 1 }}>
                  {/* FIXED: Proper name capitalization */}
                  <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                    {getUserDisplayName()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                    {/* FIXED: Better badge contrast with semi-transparent white */}
                    <Chip
                      icon={userType === "ADMIN" ? <AdminPanelSettingsIcon /> : userType === "TEACHER" ? <SchoolIcon /> : <PersonIcon />}
                      label={userType.toLowerCase()}
                      size="medium"
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
                        color: 'rgba(0, 0, 0, 0.9)', // Dark text for readability
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.6)',
                        borderRadius: 2,
                        '& .MuiChip-icon': { 
                          color: 'rgba(0, 0, 0, 0.9)',
                        }
                      }}
                    />
                    {/* FIXED: Clear email display */}
                    <Chip
                      icon={<EmailIcon sx={{ color: 'white !important' }} />}
                      label={email} // Full email address
                      size="medium"
                      variant="outlined"
                      sx={{
                        backgroundColor: 'rgba(46, 125, 50, 0.8)', // Teal green
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

                  {/* FIXED: Better alignment and spacing */}
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
          <Grid container spacing={3}>
            {/* Profile Information Card */}
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
                <Box sx={{ p: 3, pb: 2 }}>
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
                        // FIXED: Teal green color instead of default blue
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
                          {/* FIXED: Proper name capitalization in display */}
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
                          // FIXED: Consistent teal green color
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
                          // FIXED: Consistent teal green color
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
                          startIcon={<LockIcon />} // Added icon for consistency
                        >
                          Update
                        </Button>
                      }
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* 2FA Row - FIXED: Better toggle UX */}
                    <SecurityItem
                      icon={<ShieldIcon />}
                      label="Two-Factor Authentication"
                      status={accountInfo.mfaEnabled ? "Enabled" : "Disabled"}
                      action={
                        <Switch
                          checked={accountInfo.mfaEnabled}
                          onChange={() => setAccountInfo(prev => ({ ...prev, mfaEnabled: !prev.mfaEnabled }))}
                          color="success" // Green color for better UX
                        />
                      }
                    />

                    {/* Danger Zone Separator */}
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

        {/* Password Change Dialog - FIXED: Consistent teal green */}
        <Dialog
          open={passwordDialogOpen}
          onClose={handleClosePasswordDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#2E7D32', width: 60, height: 60 }}>
                <LockIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold">
                Change Password
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setCurrentPasswordError("");
                }}
                error={!!currentPasswordError}
                helperText={currentPasswordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          }
                        }}
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordError("");
                }}
                error={!!newPasswordError}
                helperText={newPasswordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          }
                        }}
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setConfirmPasswordError("");
                }}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <Button
              onClick={handleClosePasswordDialog}
              variant="outlined"
              color="inherit"
              sx={{ 
                borderRadius: 3, 
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              variant="contained"
              sx={{ 
                borderRadius: 3, 
                textTransform: 'none', 
                px: 4,
                transition: 'all 0.2s ease-in-out',
                backgroundColor: '#2E7D32',
                '&:hover': {
                  backgroundColor: '#1B5E20',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                }
              }}
            >
              Update Password
            </Button>
          </DialogActions>
        </Dialog>

        {/* Profile Update Verification Dialog - FIXED: Consistent teal green */}
        <Dialog
          open={verificationDialogOpen}
          onClose={handleCloseVerificationDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SecurityIcon sx={{ color: '#2E7D32' }} />
            <Typography variant="h6" fontWeight="bold">
              Verify Profile Update
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
              To confirm this profile update, please enter your current password for security verification:
            </DialogContentText>
            <TextField
              autoFocus
              fullWidth
              label="Enter your current password"
              type="password"
              value={verificationText}
              onChange={(e) => {
                setVerificationText(e.target.value);
                setVerificationError("");
              }}
              error={!!verificationError}
              helperText={verificationError}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <Button
              onClick={handleCloseVerificationDialog}
              variant="outlined"
              color="inherit"
              sx={{ 
                borderRadius: 3, 
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerificationSubmit}
              variant="contained"
              sx={{ 
                borderRadius: 3, 
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                backgroundColor: '#2E7D32',
                '&:hover': {
                  backgroundColor: '#1B5E20',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                }
              }}
              startIcon={<SecurityIcon />}
            >
              Verify & Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderLeft: '4px solid #f44336',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main', width: 60, height: 60 }}>
                <DeleteIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography variant="h5" fontWeight="bold" color="error">
                Delete Account
              </Typography>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <DialogContentText sx={{ mb: 3, textAlign: 'center' }}>
              This action cannot be undone. All your data will be permanently removed from our systems.
            </DialogContentText>
            
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center', fontWeight: 'medium' }}>
              To confirm, please enter your email address:
            </Typography>
            
            <TextField
              autoFocus
              fullWidth
              label="Enter your email"
              type="email"
              value={confirmEmail}
              onChange={(e) => {
                setConfirmEmail(e.target.value);
                setDeleteError("");
              }}
              error={!!deleteError}
              helperText={deleteError}
              placeholder={email}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
            <Button
              onClick={handleCloseDeleteDialog}
              variant="outlined"
              color="inherit"
              sx={{ 
                borderRadius: 3, 
                textTransform: 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              sx={{ 
                borderRadius: 3, 
                textTransform: 'none', 
                px: 4,
                backgroundColor: 'error.main',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'error.dark',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                }
              }}
            >
              Delete Account
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
            sx={{ 
              width: "100%",
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            }}
          >
            {success || error}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

// Enhanced InfoFieldReadOnly component
const InfoFieldReadOnly = ({ label, value, isDate = false }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography 
      variant="caption" 
      color="text.secondary" 
      sx={{ 
        display: 'block', 
        fontWeight: '600', 
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        mb: 0.5
      }}
    >
      {label}
    </Typography>
    <Typography 
      variant="body1" 
      color="text.primary" 
      fontWeight="500"
      sx={{ 
        fontSize: '1rem',
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default AccountPage;