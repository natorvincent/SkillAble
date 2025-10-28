import React, { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Box, Typography, Avatar } from '@mui/material';
import avatarImage from '../assets/profile.png';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);
  const isLogoutInProgress = useRef(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      const loggedIn = !!(token && userEmail);
      
      console.log("Navbar auth check:", { token: !!token, userEmail, loggedIn });
      
      setIsLoggedIn(loggedIn);
      
      // Only fetch profile if logged in AND not on landing/auth pages
      const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);
      
      if (loggedIn && !isAuthPage) {
        fetchUserProfile();
      } else if (isAuthPage) {
        // Clear profile data when on auth pages to prevent stale data
        setUserProfile(null);
      }
    };
    
    checkLoginStatus();
    
    // Listen for both storage events and custom localStorageChange events
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('localStorageChange', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('localStorageChange', checkLoginStatus);
    };
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail");
      const userRole = localStorage.getItem("userRole");
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      
      if (!userEmail) return;

      let apiEndpoint;
      let detectedRole = null;

      // Determine which endpoint to call based on stored role
      if (isAdmin) {
        apiEndpoint = `http://localhost:8080/api/admin/profile?email=${userEmail}`;
        detectedRole = "ADMIN";
      } else if (userRole === "TEACHER") {
        apiEndpoint = `http://localhost:8080/api/teachers/profile?email=${userEmail}`;
        detectedRole = "TEACHER";
      } else {
        apiEndpoint = `http://localhost:8080/api/students/profile?email=${userEmail}`;
        detectedRole = "STUDENT";
      }

      console.log("Fetching profile from:", apiEndpoint);

      const response = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        console.error(`Profile fetch failed for ${detectedRole}`);
        return;
      }

      const profileData = await response.json();
      profileData.userType = detectedRole;
      setUserProfile(profileData);
      
      // Store the appropriate ID
      if (detectedRole === "STUDENT" && profileData.id) {
        localStorage.setItem('studentId', profileData.id);
      } else if (detectedRole === "TEACHER" && profileData.id) {
        localStorage.setItem('teacherId', profileData.id);
      }
      
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // REMOVED: fetchProgressStats function entirely

  const handleLogout = () => {
    if (isLogoutInProgress.current) return;
    isLogoutInProgress.current = true;

    setDropdownOpen(false);
    
    // Clear all authentication data consistently
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('studentId');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('userId');
    
    // Also remove the old isLoggedIn flag if it exists
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('localStorageChange'));
    
    setIsLoggedIn(false);
    setUserProfile(null);
    
    navigate('/login', { replace: true });
    
    setTimeout(() => {
      isLogoutInProgress.current = false;
    }, 500);
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    
    const currentPath = location.pathname;
    
    if (currentPath === '/login' || currentPath === '/register') {
      navigate('/');
    }
    else if (currentPath === '/') {
      navigate('/');
    }
    else {
      // Redirect to appropriate dashboard based on user role
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'TEACHER') {
        navigate('/teacherdashboard');
      } else if (userRole === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/studentdashboard');
      }
    }
  };

  const getHomeTarget = () => {
    const currentPath = location.pathname;
    
    if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
      return '/';
    }
    else {
      // Return appropriate dashboard based on user role
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'TEACHER') {
        return '/teacherdashboard';
      } else if (userRole === 'ADMIN') {
        return '/admin';
      } else {
        return '/studentdashboard';
      }
    }
  };

  const shouldShowProfileDropdown = () => {
    const currentPath = location.pathname;
    return isLoggedIn && currentPath !== '/' && currentPath !== '/login' && currentPath !== '/register';
  };

  const shouldShowProgressStats = () => {
    // REMOVED: Progress stats display to reduce API calls
    return false;
  };

  const shouldShowMyBadges = () => {
    return isLoggedIn && userProfile?.userType === "STUDENT";
  };

  const getUserDisplayName = () => {
    if (!userProfile) return "User";
    
    if (userProfile.userType === "STUDENT") {
      return userProfile.firstName || "Student";
    } else if (userProfile.userType === "TEACHER") {
      const fullName = userProfile.name || "Teacher";
      return fullName.split(' ')[0];
    } else if (userProfile.userType === "ADMIN") {
      return "Admin";
    }
    
    return "User";
  };

  const homeTarget = getHomeTarget();

  return (
    <nav className="nav-bar">
      <RouterLink to={homeTarget} style={{ textDecoration: 'none' }}>
        <div className="navbar-title">SkillAble</div>
      </RouterLink>

      <ul className="navbar-links">
        <li>
          <a href="/" onClick={handleHomeClick}>Home</a>
        </li>
        <li><a href="/about">About us</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>

      <div className="navbar-right">
        {/* REMOVED: Progress stats display */}

        {shouldShowProfileDropdown() && (
          <div className="profile-dropdown" ref={dropdownRef}>
            <div 
              className="profile-dropdown-trigger-white" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <Avatar
                src={avatarImage}
                alt={getUserDisplayName()}
                sx={{ 
                  width: 32, 
                  height: 32,
                  mr: 1
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#333', 
                  fontWeight: 600,
                  mr: 0.5
                }}
              >
                {getUserDisplayName()}
              </Typography>
              <ExpandMoreIcon sx={{ color: "#666", fontSize: 20 }} />
            </div>
            
            {dropdownOpen && (
              <div className="profile-dropdown-menu">
                <RouterLink to="/account" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Account
                </RouterLink>
                {shouldShowMyBadges() && (
                  <RouterLink to="/badges" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Badges
                  </RouterLink>
                )}
                <div className="dropdown-item" onClick={handleLogout}>
                  Log out
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show login/register buttons when not logged in */}
        {!isLoggedIn && location.pathname !== '/login' && location.pathname !== '/register' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <RouterLink to="/login" style={{ textDecoration: 'none' }}>
              <button className="login-btn-nav">Login</button>
            </RouterLink>
            <RouterLink to="/register" style={{ textDecoration: 'none' }}>
              <button className="register-btn-nav">Register</button>
            </RouterLink>
          </Box>
        )}
      </div>
    </nav>
  );
}

export default Navbar;