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

  // Clear any stale login state on mount
  useEffect(() => {
    console.log("Login component mounted");
    
    // Check for any existing login state
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (isLoggedIn) {
      console.log("User already logged in, checking admin status:", isAdmin);
      
      // If already logged in, redirect to appropriate page
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/homepage', { replace: true });
      }
    } else {
      // Clean up any stale auth data - CLEAR ALL USER-SPECIFIC DATA
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('userType');
      localStorage.removeItem('studentId');  // Add this
      localStorage.removeItem('teacherId');  // Add this
      localStorage.removeItem('userId');     // Add this
      localStorage.removeItem('isLoggedIn');
    }
  }, [navigate]);

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
      
      const response = await fetch("http://localhost:8080/api/auth/login", {
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
      console.log("Is admin user:", isAdmin);
      
      // CLEAR ALL PREVIOUS USER DATA FIRST
      localStorage.removeItem('studentId');
      localStorage.removeItem('teacherId');
      localStorage.removeItem('userId');
      
      // Store authentication data
      localStorage.setItem("token", result);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", userRole);
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
      setSuccessMessage("Login successful!");
      setOpenSnackbar(true);
      
      // Dispatch custom event to notify App component about the change
      window.dispatchEvent(new Event('localStorageChange'));
      
      // Log the current localStorage state to confirm values are set
      console.log("localStorage after login:", {
        isLoggedIn: localStorage.getItem("isLoggedIn"),
        userType: localStorage.getItem("userType"),
        isAdmin: localStorage.getItem("isAdmin"),
        studentId: localStorage.getItem("studentId"),
        teacherId: localStorage.getItem("teacherId"),
        userId: localStorage.getItem("userId")
      });
      
      // Wait a moment before navigating to ensure localStorage values are set
      setTimeout(() => {
        try {
          if (isAdmin) {
            console.log("Navigating to admin dashboard...");
            navigate("/admin", { replace: true });
          } else {
            console.log("Navigating to homepage...");
            navigate("/homepage", { replace: true });
          }
        } catch (navError) {
          console.error("Navigation error:", navError);
          // If navigation fails, try a more direct approach
          window.location.href = isAdmin ? "/admin" : "/homepage";
        }
      }, 800);
      
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
            minHeight: "90vh",
            paddingBottom: "100px",
          }}
        >
          <Box
            className="login-box"
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            <Typography
              component="h1"
              variant="h5"
              sx={{ fontSize: "32px", fontFamily: "Arial", fontWeight: "600", color: "#28313B" }}
            >
              Welcome Back!
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth={false}
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                disabled={isLoggingIn}
                error={!!emailError}
                helperText={emailError}
                sx={{
                  width: 380,
                  "& .MuiOutlinedInput-root": {
                    height: 65,
                    borderRadius: "15px",
                  },
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth={false}
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                disabled={isLoggingIn}
                error={!!passwordError}
                helperText={passwordError}
                sx={{
                  width: 380,
                  "& .MuiOutlinedInput-root": {
                    height: 65,
                    borderRadius: "15px",
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
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {errorMessage && (
                <Typography variant="body2" color="error">
                  {errorMessage}
                </Typography>
              )}

              <Grid container justifyContent="flex-end" sx={{ pt: 0, pb: 3 }}>
                <Grid item>
                  <RouterLink to="/forgot-password" variant="body2" style={{ textDecoration: "none" }}>
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
                    opacity: isLoggingIn ? 0.8 : 1 
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
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={successMessage ? "success" : "error"}
            sx={{ width: "100%" }}
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