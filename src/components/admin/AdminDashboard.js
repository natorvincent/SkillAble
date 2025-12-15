import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Tabs, Tab, Container } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TeachersList from './TeachersList';
import ModuleManagement from './ModuleManagement';
import LessonManagement from './LessonManagement';
import StudentsList from './StudentsList';
import Background from '../Background';
import Navbar from '../Navbar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Confirm admin status after component mounts
  useEffect(() => {
    console.log("AdminDashboard mounting");
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin) {
      console.warn("Non-admin access attempt to AdminDashboard");
      // AdminRoute should have already redirected, but just in case
      window.location.href = '/homepage';
      return;
    }
    
    setIsLoaded(true);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!isLoaded) {
    return null; // Return empty while checking
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
        
        <Container maxWidth="lg" sx={{ paddingTop: { xs: 3, sm: 4, md: 5 }, paddingBottom: { xs: 3, sm: 4, md: 5 }, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3, md: 4 }, flexWrap: 'wrap' }}>
            <ShieldIcon sx={{ width: { xs: 24, sm: 28, md: 32 }, height: { xs: 24, sm: 28, md: 32 }, color: '#4a6cf7', mr: { xs: 1, sm: 2 } }} />
            <Typography variant="h4" component="h1" fontWeight="600" sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
              Admin Dashboard
            </Typography>
          </Box>
          
          {/* <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            sx={{ mb: 3 }}
            onClick={() => window.location.href = '/homepage'}
          >
            Back to Home
          </Button> */}
          
          <Paper sx={{ 
            borderRadius: { xs: "10px", sm: "15px" }, 
            overflow: 'hidden', 
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  py: { xs: 1.5, sm: 2 },
                  fontWeight: 500,
                  minWidth: { xs: 80, sm: 100, md: 120 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }
              }}
            >
              <Tab 
                icon={<PeopleIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start" 
                label="Students"
              />
              <Tab 
                icon={<GroupIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start" 
                label="Teachers"
              />
              <Tab 
                icon={<SchoolIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start" 
                label="Modules"
              />
              <Tab 
                icon={<MenuBookIcon sx={{ fontSize: { xs: 18, sm: 20, md: 24 } }} />} 
                iconPosition="start" 
                label="Lessons"
              />
            </Tabs>
            
            <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, overflowX: 'auto' }}>
              {/* Updated content rendering to match new tab order */}
              {activeTab === 0 && <StudentsList />}
              {activeTab === 1 && <TeachersList />}
              {activeTab === 2 && <ModuleManagement />}
              {activeTab === 3 && <LessonManagement />}
            </Box>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;