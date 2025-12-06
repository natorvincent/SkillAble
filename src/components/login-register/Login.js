import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { IconButton, InputAdornment, Divider, CircularProgress } from "@mui/material";
import Navbar from "../Navbar";
import "./Login.css";
import Background from "../Background";

function Login() {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  // Cleanup effect to handle redirects from role selection and check auth status
  useEffect(() => {
    console.log("Login component mounted - checking authentication status");
    
    // Clear any redirect flags or temporary storage
    const cleanupRedirectState = () => {
      localStorage.removeItem("redirecting");
      sessionStorage.removeItem("pendingRoleSelection");
    };

    cleanupRedirectState();

    // Check if user is already authenticated with a more robust approach
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");
    
    console.log("Current auth state:", { token: !!token, userEmail, userRole });

    if (token && userEmail) {
      console.log("User already authenticated, redirecting based on role:", userRole);
      
      // Use setTimeout to ensure the component is fully mounted before navigation
      setTimeout(() => {
        if (userRole === "ADMIN") {
          console.log("Redirecting to admin dashboard");
          // Use hard redirect for admin to prevent conflicts with AdminRoute
          window.location.href = "/admin";
        } else if (userRole === "TEACHER") {
          console.log("Redirecting to teacher dashboard");
          // Use hard redirect for teachers to prevent loops
          window.location.href = "/teacherdashboard";
        } else if (userRole === "STUDENT") {
          console.log("Redirecting to student dashboard");
          navigate("/studentdashboard", { replace: true });
        } else {
          // If role is not set but user is authenticated, clear and stay on login
          console.log("Role not set but user authenticated, clearing auth data");
          clearAuthData();
        }
      }, 100);
    } else {
      // Clean up any stale auth data - CLEAR ALL USER-SPECIFIC DATA
      clearAuthData();
    }
  }, [navigate]);

  // Function to clear all authentication data
  const clearAuthData = () => {
    console.log("Clearing all authentication data");
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('studentId');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('redirecting');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Prevent double submission
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    
    const data = new FormData(event.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    let isValid = true;

    // Validations
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) {
      setIsLoggingIn(false);
      return;
    }

    try {
      console.log("Sending login request:", { email });
      
      const response = await fetch("https://skillable-pdv0.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Invalid email or password");
      }
      
      const result = await response.text();
      console.log("Login successful, token:", result);

      // Parse token to extract user info
      // Token format: "user_[userId]_[role]_[timestamp]"
      let userId = null;
      let userRole = "STUDENT"; // Default role
      
      try {
        const tokenParts = result.split('_');
        if (tokenParts.length >= 4) {
          userId = parseInt(tokenParts[1]);
          userRole = tokenParts[2];
          console.log("Parsed from token - User ID:", userId, "Role:", userRole);
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }
      
      // Check if user is admin based on role from token
      const isAdmin = userRole === "ADMIN";
      console.log("Is admin user:", isAdmin, "User role:", userRole);
      
      // CLEAR ALL PREVIOUS USER DATA FIRST
      clearAuthData();
      
      // Store authentication data
      localStorage.setItem("token", result);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("isAdmin", isAdmin ? "true" : "false");
      
      // Store user-specific ID based on role
      if (userId) {
        if (userRole === "STUDENT") {
          localStorage.setItem("studentId", userId.toString());
          console.log("Stored student ID:", userId);
        } else if (userRole === "TEACHER") {
          localStorage.setItem("teacherId", userId.toString());
          console.log("Stored teacher ID:", userId);
        } else if (userRole === "ADMIN") {
          localStorage.setItem("userId", userId.toString());
          console.log("Stored admin ID:", userId);
        }
      }
      
      // Show success message
      setSuccessMessage("Login successful! Redirecting...");
      setOpenSnackbar(true);
      
      // Log the current localStorage state to confirm values are set
      console.log("localStorage after login:", {
        userRole: localStorage.getItem("userRole"),
        isAdmin: localStorage.getItem("isAdmin"),
        studentId: localStorage.getItem("studentId"),
        teacherId: localStorage.getItem("teacherId"),
        userId: localStorage.getItem("userId")
      });
      
      // Wait a moment before navigating to ensure localStorage values are set and user sees success message
      setTimeout(() => {
        try {
          console.log("Navigating based on role:", userRole);
          
          if (isAdmin) {
            console.log("Navigating to admin dashboard...");
            // Use hard redirect for admin to prevent conflicts with AdminRoute
            window.location.href = "/admin";
          } else if (userRole === "STUDENT") {
            console.log("Navigating to student dashboard...");
            navigate("/studentdashboard", { replace: true });
          } else if (userRole === "TEACHER") {
            console.log("Navigating to teacher dashboard...");
            // Use hard redirect for teachers to prevent loops
            window.location.href = "/teacherdashboard";
          } else {
            // Fallback to homepage if role is unclear
            console.log("Unknown role, navigating to homepage...");
            navigate("/homepage", { replace: true });
          }
        } catch (navError) {
          console.error("Navigation error:", navError);
          // If navigation fails, try a more direct approach
          setTimeout(() => {
            if (isAdmin) {
              window.location.href = "/admin";
            } else if (userRole === "STUDENT") {
              window.location.href = "/studentdashboard";
            } else if (userRole === "TEACHER") {
              window.location.href = "/teacherdashboard";
            } else {
              window.location.href = "/homepage";
            }
          }, 100);
        }
      }, 1500);
      
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage(err.message || "Login failed");
      setOpenSnackbar(true);
      setIsLoggingIn(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
    // Clear messages when snackbar closes to prevent stale messages
    setTimeout(() => {
      setErrorMessage("");
      setSuccessMessage("");
    }, 300);
  };

  return (
    <div
      className="login-page"
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
        <Container
          component="main"
          maxWidth="xs"
          className="main-container"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: { xs: "85vh", sm: "90vh" },
            paddingBottom: { xs: "50px", sm: "100px" },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            className="login-box"
            sx={{
              marginTop: { xs: 4, sm: 6, md: 8 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: { xs: "15px", sm: "20px" },
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: { xs: "20px", sm: "25px", md: "30px" },
              borderRadius: { xs: "15px", sm: "20px" },
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              position: "relative",
              width: "100%",
              maxWidth: "450px",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ 
                fontSize: { xs: "24px", sm: "28px", md: "32px" }, 
                fontFamily: "Arial", 
                fontWeight: "600", 
                color: "#28313B" 
              }}
            >
              Welcome Back!
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                disabled={isLoggingIn}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: { xs: 55, sm: 60, md: 65 },
                    borderRadius: { xs: "12px", sm: "15px" },
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                disabled={isLoggingIn}
                error={!!passwordError}
                helperText={passwordError}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: { xs: 55, sm: 60, md: 65 },
                    borderRadius: { xs: "12px", sm: "15px" },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleClickShowPassword} 
                        onMouseDown={handleMouseDownPassword} 
                        edge="end"
                        disabled={isLoggingIn}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {errorMessage && (
                <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: 'center' }}>
                  {errorMessage}
                </Typography>
              )}

              <Grid container justifyContent="flex-end" sx={{ pt: 0, pb: 3 }}>
                <Grid item>
                  <RouterLink 
                    to="/forgot-password" 
                    variant="body2" 
                    style={{ 
                      textDecoration: "none",
                      color: "#4a6cf7",
                      fontWeight: "500"
                    }}
                  >
                    {"Forgot Password?"}
                  </RouterLink>
                </Grid>
              </Grid>

              <Grid container justifyContent="center">
                <button 
                  className="loginbutton" 
                  type="submit"
                  disabled={isLoggingIn}
                  style={{ 
                    position: 'relative',
                    opacity: isLoggingIn ? 0.8 : 1,
                    cursor: isLoggingIn ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoggingIn ? (
                    <>
                      <span style={{ visibility: 'hidden' }}>Log in</span>
                      <CircularProgress 
                        size={24} 
                        sx={{ 
                          color: 'white',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-12px',
                          marginLeft: '-12px',
                        }} 
                      />
                    </>
                  ) : (
                    "Log in"
                  )}
                </button>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Divider sx={{ width: '100%', my: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Don't have an account?
                </Typography>
                <RouterLink 
                  to="/register" 
                  style={{ 
                    textDecoration: "none",
                    color: "#4a6cf7",
                    fontWeight: "600",
                    fontSize: "16px"
                  }}
                >
                  Sign up here
                </RouterLink>
              </Box>
            </Box>
          </Box>
        </Container>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={successMessage ? "success" : "error"}
            sx={{ width: "100%", borderRadius: "10px" }}
            icon={successMessage ? <CheckCircleIcon /> : undefined}
          >
            {successMessage || errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}

export default Login;