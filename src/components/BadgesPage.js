import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { getStudentModuleProgressStats } from '../services/progressService';
import Navbar from './Navbar';
import Background from './Background';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// Import PNG icons
import FirstLessonIcon from '../assets/badges/first_lesson.png';
import StarMasterIcon from '../assets/badges/star_master.png';
import FirstModuleIcon from '../assets/badges/first_module.png';
import SuperLearnerIcon from '../assets/badges/super_learner.png';
import LockedIcon from '../assets/badges/locked.png'; // Import locked badge icon
import ExitButtonIcon from '../assets/exitbtn.png'; // Import exit button icon

function BadgesPage() {
  const [progressStats, setProgressStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    fetchProgressAndBadges();
  }, []);

  const fetchProgressAndBadges = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem('studentId');
      
      if (studentId) {
        const progressResponse = await getStudentModuleProgressStats(studentId);
        console.log("Progress stats from database:", progressResponse);
        setProgressStats(progressResponse);
        const calculatedBadges = calculateBadges(progressResponse);
        setBadges(calculatedBadges);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
      // Set empty badges array as fallback
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
    // Alternatively, you can navigate to a specific route:
    // navigate('/dashboard'); // Or whatever your main page route is
  };

  // Helper function to get default badge data
  const getBadgeDefaultData = (badgeId) => {
    const defaults = {
      'super-learner': {
        id: 'super-learner',
        label: 'Super Learner',
        description: 'Complete 10 lessons',
        category: 'Lessons',
        earned: false,
        progress: '0/10'
      },
      'star-master': {
        id: 'star-master',
        label: 'Star Master',
        description: 'Earn 15 stars',
        category: 'Stars',
        earned: false,
        progress: '⭐ 0/15'
      },
      'module-legend': {
        id: 'module-legend',
        label: 'Module Legend',
        description: 'Complete 3 modules',
        category: 'Modules',
        earned: false,
        progress: '0/3'
      },
      'first-module': {
        id: 'first-module',
        label: 'First Module',
        description: 'Complete your first module',
        category: 'Milestones',
        earned: false,
        progress: '1/1'
      },
      'first-lesson': {
        id: 'first-lesson',
        label: 'First Lesson',
        description: 'Complete your first lesson',
        category: 'Milestones',
        earned: false,
        progress: '1/1'
      }
    };
    return defaults[badgeId] || {
      id: badgeId,
      label: 'Unknown Badge',
      description: 'No description',
      category: 'General',
      earned: false,
      progress: '0/0'
    };
  };

  // Helper function to get the correct icon based on badge ID
  const getBadgeIcon = (badgeId, earned) => {
    // Use locked icon for unearned badges
    if (!earned) {
      return <img src={LockedIcon} alt="Locked" style={{ width: 200, height: 200 }} />;
    }
    
    // Use actual badge icons for earned badges
    switch (badgeId) {
      case 'super-learner':
        return <img src={SuperLearnerIcon} alt="Super Learner" style={{ width: 200, height: 200 }} />;
      case 'star-master':
        return <img src={StarMasterIcon} alt="Star Master" style={{ width: 200, height: 200 }} />;
      case 'module-legend':
        return <img src={FirstModuleIcon} alt="Module Legend" style={{ width: 200, height: 200 }} />;
      case 'first-module':
        return <img src={FirstModuleIcon} alt="First Module" style={{ width: 200, height: 200 }} />;
      case 'first-lesson':
        return <img src={FirstLessonIcon} alt="First Lesson" style={{ width: 200, height: 200 }} />;
      default:
        return <img src={LockedIcon} alt="Locked" style={{ width: 200, height: 200 }} />;
    }
  };

  const calculateBadges = (stats) => {
    // Add null safety for stats
    if (!stats) {
      console.log("No stats available, returning default badges");
      // Return all badges in locked state using helper function
      return ['super-learner', 'star-master', 'module-legend', 'first-module', 'first-lesson'].map(badgeId => {
        const badgeData = getBadgeDefaultData(badgeId);
        return {
          ...badgeData,
          icon: getBadgeIcon(badgeId, false) // Show locked icon
        };
      });
    }

    console.log("Calculating badges with stats:", stats);
    
    // Safely get values with defaults
    const completedLessons = Number(stats.completedLessons) || 0;
    const totalStars = Number(stats.totalStars) || 0;
    const completedModules = Number(stats.completedModules) || 0;

    console.log("Safe values:", { completedLessons, totalStars, completedModules });

    // Always return all achievement badges in consistent order
    const badges = [
      // First Lesson Badge
      {
        id: 'first-lesson',
        label: 'First Lesson',
        earned: completedLessons >= 1,
        description: 'Complete your first lesson',
        category: 'Milestones',
        progress: completedLessons >= 1 ? '1/1' : '0/1'
      },
      // First Module Badge
      {
        id: 'first-module',
        label: 'First Module',
        earned: completedModules >= 1,
        description: 'Complete your first module',
        category: 'Milestones',
        progress: completedModules >= 1 ? '1/1' : '0/1'
      },
      // Super Learner Badge (changed from 100 to 10)
      {
        id: 'super-learner',
        label: 'Super Learner',
        earned: completedLessons >= 10,
        description: 'Complete 10 lessons',
        category: 'Lessons',
        progress: `${completedLessons}/10`
      },
      // Star Master Badge (changed from 500 to 15)
      {
        id: 'star-master',
        label: 'Star Master',
        earned: totalStars >= 15,
        description: 'Earn 15 stars',
        category: 'Stars',
        progress: `⭐ ${totalStars}/15`
      },
      // Module Legend Badge 
      {
        id: 'module-legend',
        label: 'Module Legend',
        earned: completedModules >= 3,
        description: 'Complete 3 modules',
        category: 'Modules',
        progress: `${completedModules}/3`
      }
    ];

    // Add icons based on earned status
    const badgesWithIcons = badges.map(badge => ({
      ...badge,
      icon: getBadgeIcon(badge.id, badge.earned)
    }));

    console.log("Final badges calculated:", badgesWithIcons.length);
    return badgesWithIcons;
  };

  const earnedBadgesCount = badges.filter(badge => badge && badge.earned).length;
  const totalBadgesCount = badges.length;

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
      }}>
        <CircularProgress sx={{ color: "#4a6cf7" }} />
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
        
        {/* Back Button - Positioned in upper left corner */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: 80, sm: 90, md: 100 }, // Position below navbar
            left: { xs: 16, sm: 24, md: 32 },
            zIndex: 10,
          }}
        >
          <Box
            component="button"
            onClick={handleBackClick}
            sx={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              }
            }}
          >
            <img 
              src={ExitButtonIcon} 
              alt="Back" 
              style={{ 
                width: 80, 
                height: 80,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              }} 
            />
          </Box>
        </Box>
        
        <Container maxWidth="xl" sx={{ 
          paddingTop: { xs: 10, sm: 12, md: 14 }, // Increased top padding to accommodate back button
          paddingBottom: { xs: 3, sm: 5 }, 
          px: { xs: 2, sm: 3 } 
        }}>
          {/* Enhanced Achievements Section */}
          <Box sx={{ mb: { xs: 4, sm: 6 } }}>
            {/* Centered Header with Fun Design */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              mb: { xs: 3, sm: 5 },
              textAlign: 'center',
              px: { xs: 2, sm: 0 }
            }}>
              {/* Colorful Achievement Button */}
              <Box sx={{
                background: '#282828',
                borderRadius: { xs: '20px', sm: '25px' },
                padding: { xs: '10px 20px', sm: '12px 30px' },
                color: 'white',
                fontSize: { xs: '14px', sm: '16px', md: '18px' },
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
                marginBottom: { xs: 2, sm: 3 },
              }}>
                Badges Unlocked: {earnedBadgesCount}/{totalBadgesCount}
              </Box>
            </Box>

            {/* Badges Grid - 3 badges per row on medium screens and up */}
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ justifyContent: 'center' }}>
              {badges.map((badge, index) => {
                // Additional safety check for each badge
                if (!badge) return null;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={badge.id || index}>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%'
                    }}>
                      <Card sx={{
                        height: { xs: '340px', sm: '360px', md: '400px' }, // Adjusted height
                        width: '100%',
                        maxWidth: { xs: '320px', sm: '340px', md: '360px' }, // Adjusted width
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: { xs: '16px', sm: '20px', md: '24px' },
                        background: 'transparent',
                        boxShadow: 'none',
                        transition: 'all 0.4s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        transform: badge.earned ? 'scale(1.02)' : 'scale(1)',
                        '&:hover': {
                          transform: badge.earned ? 'scale(1.05) translateY(-6px)' : 'scale(1.03) translateY(-3px)',
                        }
                      }}>
                        
                        <CardContent sx={{ 
                          textAlign: 'center', 
                          padding: 0,
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                          justifyContent: 'space-between',
                          '&:last-child': { paddingBottom: 0 }
                        }}>
                          {/* Badge Icon Area - Larger with transparent background */}
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: { xs: 1, sm: 2 },
                            flex: 1,
                            minHeight: '140px', // Increased minimum height
                            width: '100%',
                            background: 'transparent', // Transparent background
                          }}>
                            {/* Render the badge icon - PNG will show with its own background */}
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '100%',
                              width: '100%',
                              background: 'transparent',
                            }}>
                              {badge.icon || <img src={LockedIcon} alt="Locked" style={{ width: 200, height: 200 }} />}
                            </Box>
                          </Box>

                          {/* Badge Name */}
                          <Typography variant="h6" sx={{
                            color: '#495057',
                            fontWeight: 700,
                            fontSize: { xs: '16px', sm: '17px', md: '18px' },
                            mb: { xs: 1, sm: 1 },
                            lineHeight: 1.2,
                            textAlign: 'center',
                            minHeight: { xs: '36px', sm: '40px', md: '44px' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textShadow: badge.earned ? '0 1px 2px rgba(74, 108, 247, 0.3)' : 'none'
                          }}>
                            {badge.label || 'Unknown Badge'}
                          </Typography>

                          {/* Badge Description */}
                          <Typography variant="body2" sx={{
                            color: badge.earned ? '#6c757d' : '#868e96',
                            fontSize: { xs: '12px', sm: '13px', md: '14px' },
                            mb: { xs: 1.5, sm: 2 },
                            lineHeight: 1.4,
                            textAlign: 'center',
                            minHeight: { xs: '32px', sm: '36px', md: '40px' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {badge.description || 'No description'}
                          </Typography>

                          {/* Progress Display */}
                          <Box sx={{
                            background: badge.earned 
                              ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 237, 78, 0.9) 100%)'
                              : 'linear-gradient(135deg, rgba(248, 249, 250, 0.9) 0%, rgba(233, 236, 239, 0.9) 100%)',
                            color: badge.earned ? '#2c3e50' : '#6c757d',
                            fontSize: { xs: '12px', sm: '13px', md: '14px' },
                            fontWeight: 700,
                            padding: { xs: '6px 14px', sm: '8px 18px' },
                            borderRadius: { xs: '18px', sm: '22px' },
                            display: 'inline-block',
                            boxShadow: badge.earned 
                              ? '0 3px 10px rgba(255, 215, 0, 0.3)'
                              : '0 2px 6px rgba(0,0,0,0.1)',
                            border: badge.earned ? '2px solid rgba(255, 255, 255, 0.8)' : '2px solid rgba(222, 226, 230, 0.8)',
                            minWidth: { xs: '70px', sm: '80px' },
                            backdropFilter: 'blur(5px)',
                          }}>
                            {badge.progress || '0/0'}
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Container>
      </div>
    </div>
  );
}

export default BadgesPage;