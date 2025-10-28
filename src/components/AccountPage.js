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
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment
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
  
  // New states for profile update verification
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationText, setVerificationText] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [pendingFormData, setPendingFormData] = useState(null);
  const [pendingFormType, setPendingFormType] = useState("");
  
  // New states for password change
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Individual error states for each password field
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
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

  useEffect(() => {
    const handleLocalStorageChange = () => {
      console.log("Local storage change detected, refreshing profile...");
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        fetchUserProfile(userEmail);
      }
    };

    window.addEventListener('localStorageChange', handleLocalStorageChange);
    
    return () => {
      window.removeEventListener('localStorageChange', handleLocalStorageChange);
    };
  }, []);

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

    // Store form data and open verification dialog
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

    // Store form data and open verification dialog
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
      // First verify the password by attempting a login
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

      // If password is correct, proceed with the profile update
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
    // Clear previous errors
    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setPasswordError("");

    // Validation with specific field errors
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
      // First verify the current password by calling login
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

      // If current password is correct, change the password
      const endpoint = userType === "TEACHER" 
        ? `https://skillable-pdv0.onrender.com/teachers/change-password?email=${encodeURIComponent(email)}`
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
    navigate("/homepage");
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh" 
      }}>
        <CircularProgress />
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
        <Container maxWidth="md" sx={{ paddingTop: 5, paddingBottom: 5 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <Button
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 'medium',
                fontSize: '1rem'
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
          
          <Paper 
            elevation={3} 
            sx={{ 
              padding: 4, 
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "20px"
            }}
          >
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
              My Account
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 4, borderRadius: "15px" }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="primary">
                    Account Information
                  </Typography>
                  {!editing && userType !== "ADMIN" && (
                    <Button 
                      startIcon={<EditIcon />} 
                      onClick={() => setEditing(true)}
                      variant="outlined"
                      color="primary"
                      size="small"
                    >
                      Edit
                    </Button>
                  )}
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {email}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {userType.toLowerCase()}
                  </Typography>
                </Box>
                
                {userType === "ADMIN" && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Admin Access
                    </Typography>
                    <Typography variant="body1">
                      You have administrator privileges
                    </Typography>
                  </Box>
                )}
                
                {userType === "STUDENT" && !editing && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        First Name
                      </Typography>
                      <Typography variant="body1">
                        {userProfile.firstName || "Not set"}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Name
                      </Typography>
                      <Typography variant="body1">
                        {userProfile.lastName || "Not set"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Date of Birth
                      </Typography>
                      <Typography variant="body1">
                        {formatDateForDisplay(userProfile.dateOfBirth)}
                      </Typography>
                    </Box>
                  </>
                )}
                
                {userType === "TEACHER" && !editing && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1">
                      {userProfile.name || "Not set"}
                    </Typography>
                  </Box>
                )}
                
                {editing && userType === "STUDENT" && (
                  <Box component="form" onSubmit={handleStudentFormSubmit} sx={{ mt: 3 }}>
                    <Alert severity="info" sx={{ mb: 3, borderRadius: "10px" }}>
                      <Typography variant="body2">
                        <SecurityIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        You will need to enter your password to verify this update for security purposes.
                      </Typography>
                    </Alert>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="First Name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          sx={{ 
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
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
                          sx={{ 
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Date of Birth"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{ 
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "10px",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                )}
                
                {editing && userType === "TEACHER" && (
                  <Box component="form" onSubmit={handleTeacherFormSubmit} sx={{ mt: 3 }}>
                    <Alert severity="info" sx={{ mb: 3, borderRadius: "10px" }}>
                      <Typography variant="body2">
                        <SecurityIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        You will need to enter your password to verify this update for security purposes.
                      </Typography>
                    </Alert>
                    
                    <TextField
                      required
                      fullWidth
                      label="Full Name"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      sx={{ 
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                        },
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Card variant="outlined" sx={{ borderRadius: "15px", mb: 4 }}>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Account Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1">
                      Change Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your account password
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    startIcon={<LockIcon />}
                    onClick={handleOpenPasswordDialog}
                  >
                    Change
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            {userType !== "ADMIN" && (
              <Card variant="outlined" sx={{ borderRadius: "15px", bgcolor: 'error.50' }}>
                <CardContent>
                  <Typography variant="h6" color="error" gutterBottom>
                    Danger Zone
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" color="error.dark">
                        Delete Account
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This action cannot be undone. All your data will be permanently removed.
                      </Typography>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleOpenDeleteDialog}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Paper>
        </Container>
      </div>

      {/* Password Change Dialog - Selective Error Highlighting */}
      <Dialog
        open={passwordDialogOpen}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="password-dialog-title"
        aria-describedby="password-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.9)",
            color: "#333",
            overflow: "visible",
            position: "relative",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "50px",
              height: "4px",
              backgroundColor: "rgba(255, 165, 0, 0.6)",
              borderRadius: "2px",
            }
          }
        }}
      >
        <DialogTitle 
          id="password-dialog-title" 
          sx={{ 
            textAlign: "center",
            pt: 4,
            pb: 2,
            color: "#333"
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "50%",
                padding: "16px",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(255, 165, 0, 0.3)",
                boxShadow: "0 4px 16px rgba(255, 165, 0, 0.1)",
              }}
            >
              <LockIcon sx={{ fontSize: 32, color: "#FF8C00" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "600", mt: 1, color: "#333" }}>
              🔐 Change Password
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, fontSize: "14px", color: "#666" }}>
              Keep your account super safe! 
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "24px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              color: "#333",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                textAlign: "center",
                color: "#666",
                fontSize: "15px",
                lineHeight: 1.6
              }}
            >
              🛡️ Create a strong password with at least 6 characters!
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="🔑 Current Password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setCurrentPasswordError("");
                  setPasswordError("");
                }}
                error={!!currentPasswordError}
                helperText={currentPasswordError}
                sx={{ 
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(5px)",
                    border: currentPasswordError ? "1px solid #d32f2f" : "1px solid rgba(255, 165, 0, 0.2)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "translateY(-1px)",
                      boxShadow: currentPasswordError ? "0 4px 12px rgba(211, 47, 47, 0.15)" : "0 4px 12px rgba(255, 165, 0, 0.15)",
                      border: currentPasswordError ? "1px solid #d32f2f" : "1px solid rgba(255, 165, 0, 0.4)"
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "translateY(-1px)",
                      boxShadow: currentPasswordError ? "0 6px 20px rgba(211, 47, 47, 0.25)" : "0 6px 20px rgba(255, 165, 0, 0.25)",
                      border: currentPasswordError ? "2px solid #d32f2f" : "2px solid rgba(255, 165, 0, 0.6)"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666",
                    fontSize: "14px",
                    "&.Mui-focused": {
                      color: currentPasswordError ? "#d32f2f" : "#FF8C00"
                    }
                  },
                  "& .MuiFormHelperText-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    padding: "4px 8px",
                    margin: "4px 0",
                    fontWeight: "500"
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        sx={{
                          color: currentPasswordError ? "#d32f2f" : "#FF8C00",
                          "&:hover": {
                            backgroundColor: currentPasswordError ? "rgba(211, 47, 47, 0.1)" : "rgba(255, 140, 0, 0.1)",
                            transform: "scale(1.1)"
                          }
                        }}
                      >
                        {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="✨ New Password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordError("");
                  setPasswordError("");
                }}
                error={!!newPasswordError}
                helperText={newPasswordError}
                sx={{ 
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(5px)",
                    border: newPasswordError ? "1px solid #d32f2f" : "1px solid rgba(255, 165, 0, 0.2)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "translateY(-1px)",
                      boxShadow: newPasswordError ? "0 4px 12px rgba(211, 47, 47, 0.15)" : "0 4px 12px rgba(255, 165, 0, 0.15)",
                      border: newPasswordError ? "1px solid #d32f2f" : "1px solid rgba(255, 165, 0, 0.4)"
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "translateY(-1px)",
                      boxShadow: newPasswordError ? "0 6px 20px rgba(211, 47, 47, 0.25)" : "0 6px 20px rgba(255, 165, 0, 0.25)",
                      border: newPasswordError ? "2px solid #d32f2f" : "2px solid rgba(255, 165, 0, 0.6)"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666",
                    fontSize: "14px",
                    "&.Mui-focused": {
                      color: newPasswordError ? "#d32f2f" : "#FF8C00"
                    }
                  },
                  "& .MuiFormHelperText-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    padding: "4px 8px",
                    margin: "4px 0",
                    fontWeight: "500"
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        sx={{
                          color: newPasswordError ? "#d32f2f" : "#FF8C00",
                          "&:hover": {
                            backgroundColor: newPasswordError ? "rgba(211, 47, 47, 0.1)" : "rgba(255, 140, 0, 0.1)",
                            transform: "scale(1.1)"
                          }
                        }}
                      >
                        {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                label="🔒 Confirm New Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setConfirmPasswordError("");
                  setPasswordError("");
                }}
                error={!!confirmPasswordError}
                helperText={confirmPasswordError}
                sx={{ 
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    backdropFilter: "blur(5px)",
                    border: confirmPasswordError ? "1px solid #d32f2f" : "1px solid rgba(255, 165, 0, 0.2)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "translateY(-1px)",
                      boxShadow: confirmPasswordError ? "0 4px 12px rgba(211, 47, 47, 0.15)" : "0 4px 12px rgba(255, 165, 0, 0.15)",
                      border: confirmPasswordError ? "1px solid #d32f2f" : "1px solid rgba(255, 165, 0, 0.4)"
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      transform: "translateY(-1px)",
                      boxShadow: confirmPasswordError ? "0 6px 20px rgba(211, 47, 47, 0.25)" : "0 6px 20px rgba(255, 165, 0, 0.25)",
                      border: confirmPasswordError ? "2px solid #d32f2f" : "2px solid rgba(255, 165, 0, 0.6)"
                    }
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666",
                    fontSize: "14px",
                    "&.Mui-focused": {
                      color: confirmPasswordError ? "#d32f2f" : "#FF8C00"
                    }
                  },
                  "& .MuiFormHelperText-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "8px",
                    padding: "4px 8px",
                    margin: "4px 0",
                    fontWeight: "500"
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{
                          color: confirmPasswordError ? "#d32f2f" : "#FF8C00",
                          "&:hover": {
                            backgroundColor: confirmPasswordError ? "rgba(211, 47, 47, 0.1)" : "rgba(255, 140, 0, 0.1)",
                            transform: "scale(1.1)"
                          }
                        }}
                      >
                        {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 4, pb: 4, pt: 2, justifyContent: "center", gap: 2 }}>
          <Button 
            onClick={handleClosePasswordDialog}
            variant="outlined"
            sx={{
              borderRadius: "20px",
              px: 3,
              py: 1.5,
              color: "#666",
              borderColor: "rgba(255, 165, 0, 0.4)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "rgba(255, 140, 0, 0.6)",
                backgroundColor: "rgba(255, 255, 255, 1)",
                color: "#FF8C00",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(255, 165, 0, 0.2)"
              }
            }}
          >
            ❌ Cancel
          </Button>
          <Button 
            onClick={handlePasswordChange}
            variant="contained"
            sx={{
              borderRadius: "20px",
              px: 4,
              py: 1.5,
              background: "linear-gradient(135deg, #FF8C00, #FFA500, #FFD700)",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "none",
              border: "none",
              boxShadow: "0 4px 15px rgba(255, 140, 0, 0.3)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #FF7F00, #FF8C00, #FFA500)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(255, 140, 0, 0.4)"
              },
              "&:active": {
                transform: "translateY(0px)"
              }
            }}
          >
            🚀 Update Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Update Verification Dialog */}
      <Dialog
        open={verificationDialogOpen}
        onClose={handleCloseVerificationDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="verification-dialog-title"
        aria-describedby="verification-dialog-description"
      >
        <DialogTitle id="verification-dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
          Verify Profile Update
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="verification-dialog-description" sx={{ mb: 3 }}>
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
            placeholder="Enter your password"
            sx={{ 
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseVerificationDialog}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleVerificationSubmit}
            variant="contained"
            color="primary"
            startIcon={<SecurityIcon />}
          >
            Verify & Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Confirmation Dialog - Unified Design */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-description"
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.9)",
            color: "#333",
            overflow: "visible",
            position: "relative",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "50px",
              height: "4px",
              backgroundColor: "rgba(244, 67, 54, 0.6)",
              borderRadius: "2px",
            }
          }
        }}
      >
        <DialogTitle 
          id="delete-account-title"
          sx={{ 
            textAlign: "center",
            pt: 4,
            pb: 2,
            color: "#333"
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "50%",
                padding: "16px",
                backdropFilter: "blur(10px)",
                border: "2px solid rgba(244, 67, 54, 0.3)",
                boxShadow: "0 4px 16px rgba(244, 67, 54, 0.1)",
              }}
            >
              <DeleteIcon sx={{ fontSize: 32, color: "#f44336" }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: "600", mt: 1, color: "#333" }}>
              ⚠️ Delete Account
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, fontSize: "14px", color: "#666" }}>
              This action cannot be undone!
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ px: 4, pb: 2 }}>
          <Box
            sx={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "20px",
              padding: "24px",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              color: "#333",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                textAlign: "center",
                color: "#666",
                fontSize: "15px",
                lineHeight: 1.6
              }}
            >
              🚨 All your data will be permanently deleted. This includes your profile, progress, and all associated information.
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3, 
                textAlign: "center",
                color: "#888",
                fontSize: "14px",
                fontWeight: "500"
              }}
            >
              To confirm, please enter your email address: <strong style={{ color: "#f44336" }}>{email}</strong>
            </Typography>
            
            <TextField
              autoFocus
              fullWidth
              label="📧 Enter your email to confirm"
              type="email"
              value={confirmEmail}
              onChange={(e) => {
                setConfirmEmail(e.target.value);
                setDeleteError("");
              }}
              error={!!deleteError}
              helperText={deleteError}
              sx={{ 
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  backdropFilter: "blur(5px)",
                  border: deleteError ? "1px solid #f44336" : "1px solid rgba(244, 67, 54, 0.2)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    transform: "translateY(-1px)",
                    boxShadow: deleteError ? "0 4px 12px rgba(244, 67, 54, 0.15)" : "0 4px 12px rgba(244, 67, 54, 0.15)",
                    border: deleteError ? "1px solid #f44336" : "1px solid rgba(244, 67, 54, 0.4)"
                  },
                  "&.Mui-focused": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    transform: "translateY(-1px)",
                    boxShadow: deleteError ? "0 6px 20px rgba(244, 67, 54, 0.25)" : "0 6px 20px rgba(244, 67, 54, 0.25)",
                    border: deleteError ? "2px solid #f44336" : "2px solid rgba(244, 67, 54, 0.6)"
                  }
                },
                "& .MuiInputLabel-root": {
                  color: "#666",
                  fontSize: "14px",
                  "&.Mui-focused": {
                    color: deleteError ? "#f44336" : "#f44336"
                  }
                },
                "& .MuiFormHelperText-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  padding: "4px 8px",
                  margin: "4px 0",
                  fontWeight: "500",
                  color: "#f44336",
                  border: "1px solid rgba(244, 67, 54, 0.1)"
                }
              }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 4, pb: 4, pt: 2, justifyContent: "center", gap: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            sx={{
              borderRadius: "20px",
              px: 3,
              py: 1.5,
              color: "#666",
              borderColor: "rgba(255, 165, 0, 0.4)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "none",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: "rgba(255, 140, 0, 0.6)",
                backgroundColor: "rgba(255, 255, 255, 1)",
                color: "#FF8C00",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(255, 165, 0, 0.2)"
              }
            }}
          >
            ✅ Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            variant="contained"
            sx={{
              borderRadius: "20px",
              px: 4,
              py: 1.5,
              background: "linear-gradient(135deg, #f44336, #e57373, #ffab91)",
              color: "white",
              fontSize: "14px",
              fontWeight: "600",
              textTransform: "none",
              border: "none",
              boxShadow: "0 4px 15px rgba(244, 67, 54, 0.3)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #d32f2f, #f44336, #e57373)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(244, 67, 54, 0.4)"
              },
              "&:active": {
                transform: "translateY(0px)"
              }
            }}
          >
            🗑️ Delete Account
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
          sx={{ width: "100%" }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AccountPage;