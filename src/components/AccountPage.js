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
  Card,
  CardContent,
  Stack
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
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
  
  // New state for entry verification
  const [entryVerificationOpen, setEntryVerificationOpen] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationPin, setVerificationPin] = useState(["", "", "", "", "", ""]);
  const [verificationErrorMsg, setVerificationErrorMsg] = useState("");
  
  const [country, setCountry] = useState("Georgia, Tbilisi");
  const [language, setLanguage] = useState("English (UK) - English");
  
  const [accountInfo, setAccountInfo] = useState({
    joinedDate: "2024-01-15",
    lastLogin: new Date().toISOString(),
    passwordLastUpdated: "2024-02-01",
    mfaEnabled: false
  });

  const navigate = useNavigate();

  // Generate random 6-digit verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Initialize verification code on component mount
  useEffect(() => {
    const code = generateVerificationCode();
    setVerificationCode(code);
  }, []);

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
    
    // Only fetch profile after entry verification
    if (!entryVerificationOpen) {
      fetchUserProfile(userEmail);
    }
  }, [navigate, entryVerificationOpen]);

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

  // Handle verification pin input
  const handlePinChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...verificationPin];
      newPin[index] = value;
      setVerificationPin(newPin);
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`pin-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle verification submission
  const handleVerificationSubmit = () => {
    const enteredCode = verificationPin.join("");
    
    if (enteredCode.length !== 6) {
      setVerificationErrorMsg("Please enter all 6 digits");
      return;
    }
    
    if (enteredCode === verificationCode) {
      setEntryVerificationOpen(false);
      setVerificationErrorMsg("");
      setVerificationPin(["", "", "", "", "", ""]);
      setLoading(true); // Start loading profile
    } else {
      setVerificationErrorMsg("Incorrect code. Please try again.");
      // Clear all inputs
      setVerificationPin(["", "", "", "", "", ""]);
      // Focus first input
      const firstInput = document.getElementById("pin-input-0");
      if (firstInput) firstInput.focus();
    }
  };

  // Regenerate verification code
  const handleRegenerateCode = () => {
    const newCode = generateVerificationCode();
    setVerificationCode(newCode);
    setVerificationPin(["", "", "", "", "", ""]);
    setVerificationErrorMsg("");
    // Focus first input
    const firstInput = document.getElementById("pin-input-0");
    if (firstInput) firstInput.focus();
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

  const handleVerificationSubmitOld = async () => {
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

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  // Individual Info Box Component
  const InfoBox = ({ title, value, icon, isDate = false }) => (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2,
        borderRadius: 2,
        height: '100%',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ 
          color: 'primary.main',
          mt: 0.5
        }}>
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: '500' }}>
            {title}
          </Typography>
          <Typography variant="body1" fontWeight="600" sx={{ fontSize: '0.95rem' }}>
            {isDate ? formatDateForDisplay(value) : value || 'Not set'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  // Info Row Component
  const InfoRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" fontWeight="500" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="500">
        {value}
      </Typography>
    </Box>
  );

  // Entry verification dialog - shows before loading anything else
  if (entryVerificationOpen) {
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
        
        {/* Entry Verification Dialog */}
        <Dialog 
          open={entryVerificationOpen} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#2E7D32', 
            color: 'white',
            py: 3,
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Typography variant="h5" fontWeight="bold" sx={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}>
              <SecurityIcon sx={{ fontSize: 28 }} />
              Account Access Verification
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ py: 4, px: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LockIcon sx={{ fontSize: 60, color: '#2E7D32', mb: 2, mt: 2, opacity: 0.8 }} />
              
              {/*
              <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 2 }}>
                Security Verification Required
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                For security purposes, please verify your identity to access your account settings.
              </Typography>
              */}
              
              {/* Verification Code Display */}
              <Paper 
                elevation={3}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  backgroundColor: '#f8f9fa',
                  border: '2px dashed #2E7D32',
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  Enter this verification code:
                </Typography>
                <Typography 
                  variant="h3" 
                  fontWeight="bold" 
                  sx={{ 
                    color: '#2E7D32',
                    letterSpacing: '0.5em',
                    textAlign: 'center',
                    mb: 1
                  }}
                >
                  {verificationCode}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This code will refresh if you generate a new one
                </Typography>
              </Paper>
              
              {/* Pin Input Fields */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                  Enter the 6-digit code in the fields below:
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1.5,
                  mb: 2 
                }}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <TextField
                      key={index}
                      id={`pin-input-${index}`}
                      value={verificationPin[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      inputProps={{
                        maxLength: 1,
                        style: { 
                          textAlign: 'center',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }
                      }}
                      sx={{
                        width: 55,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          height: 55,
                          '& input': {
                            textAlign: 'center',
                            padding: '12px',
                          }
                        },
                      }}
                    />
                  ))}
                </Box>
                
                {verificationErrorMsg && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {verificationErrorMsg}
                  </Typography>
                )}
              </Box>
              
              {/* Regenerate Code Button */}
              <Box sx={{ mb: 4 }}>
                <Button
                  onClick={handleRegenerateCode}
                  variant="outlined"
                  size="small"
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    color: '#2E7D32',
                    borderColor: '#2E7D32',
                    '&:hover': {
                      backgroundColor: 'rgba(46, 125, 50, 0.04)',
                      borderColor: '#1B5E20',
                    }
                  }}
                >
                  Generate New Code
                </Button>
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            px: 4, 
            py: 3, 
            borderTop: '1px solid rgba(0,0,0,0.1)',
            justifyContent: 'center'
          }}>
            <Button
              onClick={handleVerificationSubmit}
              variant="contained"
              size="large"
              sx={{ 
                borderRadius: 3, 
                textTransform: 'none',
                fontWeight: '600',
                px: 6,
                py: 1.5,
                backgroundColor: '#2E7D32',
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#1B5E20',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(27, 94, 32, 0.3)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              Verify & Continue
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

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
          {/* Header Section - Compact */}
          <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
            <Paper
              elevation={0}
              sx={{
                background: 'none',
                backdropFilter: 'blur(25px)',
                borderRadius: { xs: 2, sm: 3 },
                p: { xs: 2, sm: 2, md: 2.5 },
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap', 
                gap: 2,
                mb: 2 
              }}>
                {/*}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: '600',
                      px: 1.5,
                      py: 0.5,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      minWidth: 'auto'
                    }}
                  >
                    Back to Dashboard
                  </Button>
                  
                  <Button
                    startIcon={<LogoutIcon />}
                    onClick={handleSignOut}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: '600',
                      px: 1.5,
                      py: 0.5,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      minWidth: 'auto'
                    }}
                  >
                    Sign out
                  </Button>
                </Box>
                */}
              </Box>
              
             <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 2, sm: 2.5, md: 3 },
                flexWrap: 'wrap',
                mt: -2
              }}>
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
                
                <Box>
                  <Typography variant="h5" fontWeight="bold" sx={{ 
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.5rem' },
                    //mb: 0.5,
                    color: 'white'
                  }}>
                    Hello! {getUserDisplayName()}
                  </Typography>
                  {/* Optionally add email below the name */}
                  {/* <Typography variant="body1" sx={{ 
                    opacity: 0.9, 
                    fontSize: '0.95rem',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    {email}
                  </Typography> */}
                </Box>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    sx={{
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: '600',
                      marginLeft: '440px',
                      px: 1.5,
                      py: 0.5,
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      minWidth: 'auto'
                    }}
                  >
                    Back to Dashboard
                  </Button>
              </Box>
              
            </Paper>
          </Box>
          

          {/* Main Content Grid - Personal Information on RIGHT side */}
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {/* Left Column - Account Info & Security (4 grid units) */}
            <Grid item xs={12} md={4}>
              <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Account Information Card */}
                <Card 
                  elevation={2}
                  sx={{
                    borderRadius: { xs: 2, sm: 3 },
                    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2, md: 2.5 } }}>
                    <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 2 }}>
                      Account Information
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
                      <InfoRow 
                        label="Account Type" 
                        value={
                          <Chip
                            icon={userType === "ADMIN" ? <AdminPanelSettingsIcon /> : userType === "TEACHER" ? <SchoolIcon /> : <PersonIcon />}
                            label={userType.toLowerCase()}
                            size="small"
                            sx={{
                              backgroundColor: 'grey.100',
                              color: 'text.primary',
                              fontWeight: '500',
                              fontSize: '0.75rem'
                            }}
                          />
                        }
                      />
                      <InfoRow 
                        label="Joined Date" 
                        value={formatDateForDisplay(accountInfo.joinedDate)}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body2" fontWeight="500" color="text.secondary">
                          Last Login
                        </Typography>
                        <Typography variant="body2" fontWeight="500">
                          {formatDateTime(accountInfo.lastLogin)}
                        </Typography>
                      </Box>
                    </Paper>
                  </CardContent>
                </Card>

                {/* Security Settings Card */}
                <Card 
                  elevation={2}
                  sx={{
                    borderRadius: { xs: 2, sm: 3 },
                    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
                    height: '100%'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2, md: 2.5 } }}>
                    <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 2 }}>
                      Security Settings
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ borderRadius: 2, mb: 1.5, overflow: 'hidden' }}>
                      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                              Password
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Last updated {formatDateForDisplay(accountInfo.passwordLastUpdated)}
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              fontWeight: '600',
                              backgroundColor: '#2E7D32',
                              fontSize: '0.75rem',
                              px: 1.5,
                              py: 0.5,
                              '&:hover': {
                                backgroundColor: '#1B5E20',
                              }
                            }}
                            onClick={handleOpenPasswordDialog}
                          >
                            Update
                          </Button>
                        </Box>
                      </Box>
                      
                      {/* Only show delete account for non-admin users */}
                      {userType !== "ADMIN" && (
                        <Box sx={{ p: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="500" color="error.main" sx={{ mb: 0.5 }}>
                                Delete Account
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Permanently remove your account and data
                              </Typography>
                            </Box>
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: '600',
                                fontSize: '0.75rem',
                                px: 1.5,
                                py: 0.5,
                                marginLeft: 1.49,
                                '&:hover': {
                                  backgroundColor: 'error.dark',
                                }
                              }}
                              onClick={handleOpenDeleteDialog}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Right Column - Personal Information (8 grid units) */}
            <Grid item xs={12} md={8}>
              <Card 
                elevation={2}
                sx={{
                  borderRadius: { xs: 2, sm: 3 },
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.08)',
                  height: '100%'
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography variant="h5" fontWeight="600" color="text.primary" sx={{ mb: 2 }}>
                    Personal Information
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Manage your personal information, including phone numbers and email address where you can be contacted
                  </Typography>

              

                  {/* Individual Info Boxes Grid */}
                  <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <InfoBox
                        title="Name"
                        value={userType === "STUDENT" 
                          ? `${capitalizeName(userProfile.firstName || '')} ${capitalizeName(userProfile.lastName || '')}`.trim()
                          : capitalizeName(userProfile?.name || '')}
                        icon={<PersonIcon />}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <InfoBox
                        title="Date of Birth"
                        value={userType === "STUDENT" ? userProfile?.dateOfBirth : ''}
                        icon={<CalendarTodayIcon />}
                        isDate={true}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <InfoBox
                        title="Email"
                        value={email}
                        icon={<ContactMailIcon />}
                      />
                    </Grid>
                  </Grid>

                  {/* Edit Button */}
                  {userType !== "ADMIN" && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => setEditing(true)}
                        variant="contained"
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: '600',
                          backgroundColor: '#2E7D32',
                          '&:hover': {
                            backgroundColor: '#1B5E20',
                          }
                        }}
                      >
                        Edit Personal Information
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </div>

    {/* Edit Dialog */}
      <Dialog open={editing} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#2E7D32', 
          color: 'white',
          py: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        
        }}>
          <Typography variant="h6" fontWeight="600">
            Edit Personal Information
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {userType === "STUDENT" ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mt: 3 }}>
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
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mt: 3 }}>
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
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
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
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ mt: 1 }}>
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
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button
            onClick={handleCancelEdit}
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
            onClick={userType === "STUDENT" ? handleStudentFormSubmit : handleTeacherFormSubmit}
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
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onClose={handleCloseVerificationDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: '#2E7D32', 
          color: 'white',
          py: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" fontWeight="600">
            Verify Your Identity
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText sx={{ mb: 3, color: 'text.primary' }}>
            Please enter your password to confirm these changes.
          </DialogContentText>
          
          <Box sx={{ mt: 3 }}>
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
          </Box>
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
            onClick={handleVerificationSubmitOld}
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
          <Typography variant="h6" fontWeight="600">
            Change Password
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ mt: 3 }}>
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
            </Box>

            <Box sx={{ mt: 1 }}>
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
            </Box>

            <Box sx={{ mt: 1 }}>
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
            </Box>
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
          <Typography variant="h6" fontWeight="600">
            Delete Account
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3, mt: 3 }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>

          <DialogContentText sx={{ mb: 1, color: 'text.primary' }}>
            To confirm deletion, please type your email address:
          </DialogContentText>

          <Box sx={{ mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="Confirm Email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              error={!!deleteError}
              helperText={deleteError}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
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
          >
            Delete Account
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