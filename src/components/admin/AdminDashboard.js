import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Tabs, Tab, Container } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TeachersList from './TeachersList';
import ModuleManagement from './ModuleManagement';
import LessonManagement from './LessonManagement';
import StudentsList from './StudentsList';
import PromoteUsers from './PromoteUsers';
import DemoteUsers from './DemoteUsers';
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
        
        <Container maxWidth="lg" sx={{ paddingTop: 5, paddingBottom: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <ShieldIcon sx={{ width: 32, height: 32, color: '#4a6cf7', mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="600">
              Admin Dashboard
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            sx={{ mb: 3 }}
            onClick={() => window.location.href = '/homepage'}
          >
            Back to Home
          </Button>
          
          <Paper sx={{ 
            borderRadius: "15px", 
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
                  py: 2,
                  fontWeight: 500,
                  minWidth: 120
                }
              }}
            >
              <Tab 
                icon={<PeopleIcon />} 
                iconPosition="start" 
                label="Students List" 
              />
              <Tab 
                icon={<GroupIcon />} 
                iconPosition="start" 
                label="Teachers List" 
              />
              <Tab 
                icon={<SchoolIcon />} 
                iconPosition="start" 
                label="Modules" 
              />
              <Tab 
                icon={<MenuBookIcon />} 
                iconPosition="start" 
                label="Lessons" 
              />
              <Tab 
                icon={<PersonAddIcon />} 
                iconPosition="start" 
                label="Promote User" 
              />
              <Tab 
                icon={<PersonRemoveIcon />} 
                iconPosition="start" 
                label="Demote User" 
              />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {/* Updated content rendering to match new tab order */}
              {activeTab === 0 && <StudentsList />}
              {activeTab === 1 && <TeachersList />}
              {activeTab === 2 && <ModuleManagement />}
              {activeTab === 3 && <LessonManagement />}
              {activeTab === 4 && <PromoteUsers />}
              {activeTab === 5 && <DemoteUsers />}
            </Box>
          </Paper>
        </Container>
      </div>
    </div>
  );
};

export default AdminDashboard;