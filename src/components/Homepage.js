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
  Alert
} from "@mui/material";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Navbar from "./Navbar";
import Background from "./Background";

function Homepage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated and get profile info
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    
    if (!token || !userEmail) {
      navigate("/login");
      return;
    }

    fetchUserProfile(userEmail);
  }, [navigate]);

  // In Homepage.js
const fetchUserProfile = async (email) => {
  try {
    // First try to get profile as a student
    let response = await fetch(`http://localhost:8080/api/students/profile?email=${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    // If not found as student, try as teacher
    if (!response.ok) {
      response = await fetch(`http://localhost:8080/api/teachers/profile?email=${email}`, {
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
    
    // Pre-fill form data if available
    if (profileData.userType === "STUDENT") {
      setFirstName(profileData.firstName || "");
      setLastName(profileData.lastName || "");
      setAge(profileData.age || "");
    } else if (profileData.userType === "TEACHER") {
      setTeacherName(profileData.name || "");
    }
    
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
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch("http://localhost:8080/api/students/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userEmail,
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
      
      // Refresh user profile
      fetchUserProfile(userEmail);
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
      const userEmail = localStorage.getItem("userEmail");
      const response = await fetch("http://localhost:8080/api/teachers/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: userEmail,
          name: teacherName
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccess("Profile updated successfully!");
      setOpenSnackbar(true);
      
      // Refresh user profile
      fetchUserProfile(userEmail);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Function to check if user profile is complete
  const isProfileComplete = () => {
    if (!userProfile) return false;
    
    if (userProfile.userType === "STUDENT") {
      return userProfile.firstName && userProfile.lastName && userProfile.age;
    } else if (userProfile.userType === "TEACHER") {
      return userProfile.name;
    }
    
    return false;
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
        <Container maxWidth="lg" sx={{ paddingTop: 5, paddingBottom: 5 }}>
          {!isProfileComplete() ? (
            <Paper 
              elevation={3} 
              sx={{ 
                padding: 4, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "20px"
              }}
            >
              <Typography variant="h4" gutterBottom align="center">
                Complete Your Profile
              </Typography>
              
              {userProfile?.userType === "STUDENT" && (
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
                            borderRadius: "15px",
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
                            borderRadius: "15px",
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
                            borderRadius: "15px",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      mb: 2, 
                      height: "50px",
                      borderRadius: "15px",
                      backgroundColor: "#4a6cf7",
                      "&:hover": {
                        backgroundColor: "#3a5ce5"
                      }
                    }}
                  >
                    Save Profile
                  </Button>
                </Box>
              )}

              {userProfile?.userType === "TEACHER" && (
                <Box component="form" onSubmit={handleTeacherFormSubmit} sx={{ mt: 3 }}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    sx={{ 
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "15px",
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      mb: 2, 
                      height: "50px",
                      borderRadius: "15px",
                      backgroundColor: "#4a6cf7",
                      "&:hover": {
                        backgroundColor: "#3a5ce5"
                      }
                    }}
                  >
                    Save Profile
                  </Button>
                </Box>
              )}
            </Paper>
          ) : (
            <Paper 
              elevation={3} 
              sx={{ 
                padding: 4, 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "20px"
              }}
            >
              <Typography variant="h4" gutterBottom align="center">
                Welcome to SkillAble!
              </Typography>
              
              {userProfile?.userType === "STUDENT" && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">
                    Welcome, {userProfile.firstName} {userProfile.lastName}!
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    You are logged in as a student. You can now browse courses, enroll in classes, and track your progress.
                  </Typography>
                  {/* Add student dashboard content here */}
                </Box>
              )}

              {userProfile?.userType === "TEACHER" && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6">
                    Welcome, {userProfile.name}!
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    You are logged in as a teacher. You can now manage your courses, view your students, and create new content.
                  </Typography>
                  {/* Add teacher dashboard content here */}
                </Box>
              )}
              
              {/* Admin section */}
              {localStorage.getItem('isAdmin') === 'true' && (
                <Box sx={{ mt: 4, p: 3, bgcolor: '#f8f9fa', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AdminPanelSettingsIcon sx={{ color: '#4a6cf7', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" color="#4a6cf7">
                      Admin Access
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    As an administrator, you can manage users, promote teachers, and configure system settings.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/admin")}
                    sx={{ 
                      borderRadius: "10px",
                      backgroundColor: "#4a6cf7",
                      "&:hover": {
                        backgroundColor: "#3a5ce5"
                      }
                    }}
                  >
                    Go to Admin Dashboard
                  </Button>
                </Box>
              )}
            </Paper>
          )}
        </Container>
      </div>

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

export default Homepage;