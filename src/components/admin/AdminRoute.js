import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log("AdminRoute mounting at path:", location.pathname);
    
    const checkAdminStatus = async () => {
      // Log initial state for debugging
      console.log("Checking admin status...");
      
      // First check localStorage for role information
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole'); // Use userRole instead of userType
      const email = localStorage.getItem('userEmail');
      
      console.log("Auth state:", { token: !!token, userRole, email });
      
      // If not logged in, bail early
      if (!token || !email) {
        console.log("Not logged in, redirecting...");
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      // Fast path: if we already know from token this is an ADMIN
      if (userRole === 'ADMIN') {
        console.log("Already know user is admin from token");
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // If user is clearly not admin, redirect immediately
      if (userRole === 'STUDENT' || userRole === 'TEACHER') {
        console.log("User is not admin, redirecting...");
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // If we're not sure, verify with the API
        console.log("Verifying admin status with API...");
        const response = await fetch(`http://localhost:8080/api/admin/check?email=${encodeURIComponent(email)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("Admin check response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to verify admin status: ${response.status}`);
        }

        const isAdminUser = await response.json();
        console.log("Admin API result:", isAdminUser);
        
        // Store the result in localStorage for future fast checks
        localStorage.setItem('isAdmin', isAdminUser ? 'true' : 'false');
        if (isAdminUser) {
          localStorage.setItem('userRole', 'ADMIN');
        }
        
        setIsAdmin(isAdminUser);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [location.pathname]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying admin access...
        </Typography>
      </Box>
    );
  }

  if (!isAdmin) {
    console.log("Not an admin, redirecting to homepage");
    return <Navigate to="/" replace />; // Redirect to home instead of homepage to avoid loops
  }
  
  console.log("Admin access verified, rendering admin content");
  return children;
};

export default AdminRoute;