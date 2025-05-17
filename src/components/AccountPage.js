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
  DialogTitle
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import Navbar from "./Navbar";
import Background from "./Background";

function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  // Check if user is authenticated and get profile info
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const storedUserType = localStorage.getItem("userType");
    
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }

    setEmail(userEmail);
    
    // If we have a stored user type, set it now (quick UI update)
    if (storedUserType) {
      setUserType(storedUserType);
    }
    
    fetchUserProfile(userEmail);
  }, [navigate]);

  // Add event listener for localStorage changes
  useEffect(() => {
    // Function to handle localStorage changes
    const handleLocalStorageChange = () => {
      console.log("Local storage change detected, refreshing profile...");
      const userEmail = localStorage.getItem("userEmail");
      if (userEmail) {
        fetchUserProfile(userEmail);
      }
    };

    // Add event listener for localStorage changes
    window.addEventListener('localStorageChange', handleLocalStorageChange);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('localStorageChange', handleLocalStorageChange);
    };
  }, []);

  const fetchUserProfile = async (userEmail) => {
    try {
      // Check if the user is an admin first
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
          // User is an admin
          setUserType("ADMIN");
          setUserProfile({ email: userEmail });
          
          // Update localStorage with current user type
          localStorage.setItem("userType", "ADMIN");
          
          setLoading(false);
          return;
        }
      }
      
      // Try to get profile as a student
      let response = await fetch(`http://localhost:8080/api/students/profile?email=${userEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      let isStudent = response.ok;
      
      // If not found as student, try as teacher
      if (!isStudent) {
        response = await fetch(`http://localhost:8080/api/teachers/profile?email=${userEmail}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        // If still not found, throw error
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
      }
      const profileData = await response.json();
      setUserProfile(profileData);
      
      // Set user type based on which API call succeeded
      const type = isStudent ? "STUDENT" : "TEACHER";
      setUserType(type);
      
      // Set form data from profile
      if (type === "STUDENT") {
        setFirstName(profileData.firstName || "");
        setLastName(profileData.lastName || "");
        setAge(profileData.age || "");
      } else if (type === "TEACHER") {
        setTeacherName(profileData.name || "");
      }
      
      // Update localStorage with the current user type
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
    
    if (!firstName || !lastName || !age) {
      setError("All fields are required");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/students/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          firstName,
          lastName,
          age: parseInt(age)
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setOpenSnackbar(true);
      setEditing(false);
      
      // Refresh user profile
      fetchUserProfile(email);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setOpenSnackbar(true);
    }
  };

  const handleTeacherFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!teacherName) {
      setError("Name is required");
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/teachers/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          name: teacherName
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setOpenSnackbar(true);
      setEditing(false);
      
      // Refresh user profile
      fetchUserProfile(email);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setOpenSnackbar(true);
    }
  };

  const handleDeleteAccount = async () => {
    // Check if confirmation email matches
    if (confirmEmail !== email) {
      setDeleteError("Email does not match your account email");
      return;
    }

    try {
      // Use correct endpoint based on user type
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

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("userType");
      
      // Show success message and redirect to landing page
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

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleCancelEdit = () => {
    // Reset form values to current profile values
    if (userType === "STUDENT") {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setAge(userProfile.age || "");
    } else if (userType === "TEACHER") {
      setTeacherName(userProfile.name || "");
    }
    setEditing(false);
  };

  const handleBack = () => {
    navigate("/homepage");
  };

  // Render loading state
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
          {/* Back button */}
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
                
                {/* Email display - always visible and not editable */}
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
                        Age
                      </Typography>
                      <Typography variant="body1">
                        {userProfile.age || "Not set"}
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
                
                {/* Editing Forms */}
                {editing && userType === "STUDENT" && (
                  <Box component="form" onSubmit={handleStudentFormSubmit} sx={{ mt: 3 }}>
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
                          label="Age"
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
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
            
            {/* Account Settings Card */}
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
                    onClick={() => navigate("/change-password")}
                  >
                    Change
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            {/* Danger Zone Card - Don't show for Admin users */}
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

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-account-title"
        aria-describedby="delete-account-description"
      >
        <DialogTitle id="delete-account-title" color="error">
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-account-description" sx={{ mb: 3 }}>
            This action cannot be undone. All your data will be permanently deleted.
            To confirm, please enter your email address: <strong>{email}</strong>
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            label="Enter your email to confirm"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            error={!!deleteError}
            helperText={deleteError}
            sx={{ 
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseDeleteDialog} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
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
          sx={{ width: "100%" }}
        >
          {success || error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AccountPage;