import React, { useState, useRef, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Box, Typography, Avatar } from '@mui/material';
import { getStudentModuleProgressStats } from '../services/progressService';
import avatarImage from '../assets/profile.png';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [moduleStats, setModuleStats] = useState(null);
  const dropdownRef = useRef(null);
  const isLogoutInProgress = useRef(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        fetchUserProfile();
      }
    };
    
    checkLoginStatus();
    
    window.addEventListener('localStorageChange', checkLoginStatus);
    
    return () => {
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
      if (!userEmail) return;

      let response = await fetch(`http://localhost:8080/api/students/profile?email=${userEmail}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        response = await fetch(`http://localhost:8080/api/teachers/profile?email=${userEmail}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) return;
      }

      const profileData = await response.json();
      setUserProfile(profileData);
      
      if (profileData.userType === "STUDENT") {
        fetchProgressStats(profileData.id);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchProgressStats = async (studentId) => {
    try {
      const storedStudentId = localStorage.getItem('studentId') || studentId;
      
      if (!storedStudentId) return;
      const progressResponse = await getStudentModuleProgressStats(storedStudentId, 1);
      setProgressStats(progressResponse);
      setModuleStats(progressResponse);
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    }
  };

  const handleLogout = () => {
    if (isLogoutInProgress.current) return;
    isLogoutInProgress.current = true;

    setDropdownOpen(false);
    
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userType');
    
    window.dispatchEvent(new Event('localStorageChange'));
    
    setIsLoggedIn(false);
    setUserProfile(null);
    setProgressStats(null);
    setModuleStats(null);
    
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
      navigate('/homepage');
    }
  };

  const handleBadgesClick = (e) => {
    e.preventDefault();
    navigate('/badges');
  };

  const getHomeTarget = () => {
    const currentPath = location.pathname;
    
    if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') {
      return '/';
    }
    else {
      return '/homepage';
    }
  };

  const shouldShowProfileDropdown = () => {
    const currentPath = location.pathname;
    return isLoggedIn && currentPath !== '/' && currentPath !== '/login' && currentPath !== '/register';
  };

  const shouldShowProgressStats = () => {
    return isLoggedIn && userProfile?.userType === "STUDENT" && progressStats && location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register';
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
        <li><a href="#about">About us</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <div className="navbar-right">
        {shouldShowProgressStats() && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            mr: 2,
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: 'white',
              borderRadius: '25px',
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)'
              }
            }}>
              <MenuBookIcon sx={{ color: '#4a6cf7', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                {progressStats?.completedLessons || 0}
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: 'white',
              borderRadius: '25px',
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)'
              }
            }}>
              <StarIcon sx={{ color: '#ffc107', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                {progressStats?.totalStars || 0}
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: 'white',
              borderRadius: '25px',
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)'
              }
            }}>
              <AssignmentTurnedInIcon sx={{ color: '#48bb78', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                {progressStats?.completedModules || 0}
              </Typography>
            </Box>
          </Box>
        )}

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
                <RouterLink to="/account" className="dropdown-item">
                  Account
                </RouterLink>
                {shouldShowMyBadges() && (
                  <RouterLink to="/badges" className="dropdown-item">
                    My Badges
                  </RouterLink>
                )}
                <div className="dropdown-item" onClick={handleLogout}>
                  Log out
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;