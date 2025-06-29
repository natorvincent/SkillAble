import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { getStudentModuleProgressStats } from '../services/progressService';
import Navbar from './Navbar';
import Background from './Background';

function BadgesPage() {
  const [progressStats, setProgressStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressAndBadges();
  }, []);

  const fetchProgressAndBadges = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem('studentId');
      
      if (studentId) {
        // Try to fetch badges from your new backend endpoint first
        try {
          const badgesResponse = await fetch(`http://localhost:8080/api/badges/student/${studentId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          });
          
          if (badgesResponse.ok) {
            const badgesData = await badgesResponse.json();
            console.log("Backend badges data:", badgesData);
            
            // Transform backend data to frontend format
            const transformedBadges = badgesData.badges ? badgesData.badges.map(badge => ({
              id: badge.id || 'unknown',
              label: badge.label || 'Unknown Badge',
              description: badge.description || 'No description',
              category: badge.category || 'General',
              earned: badge.earned || false,
              progress: badge.progress || '0/0',
              icon: getBadgeIcon(badge.id, badge.color)
            })) : [];
            
            setBadges(transformedBadges);
            return; // Successfully got badges from backend
          }
        } catch (backendError) {
          console.log("Backend endpoint not available, using fallback:", backendError);
        }
        
        // Fallback to local calculation if backend fails
        const progressResponse = await getStudentModuleProgressStats(studentId, 1);
        console.log("Progress stats:", progressResponse);
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

  // Helper function to get the correct icon based on badge ID and color
  const getBadgeIcon = (badgeId, color) => {
    const iconColor = color === '#ccc' ? '#ccc' : color;
    const iconSize = 32;
    
    switch (badgeId) {
      case 'super-learner':
      case 'lesson-master':
      case 'lesson-expert':
      case 'lesson-achiever':
        return <SchoolIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      case 'star-master':
      case 'star-collector':
      case 'rising-star':
        return <StarIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      case 'module-legend':
      case 'module-champion':
      case 'module-warrior':
        return <AssignmentTurnedInIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      case 'streak-legend':
      case 'streak-keeper':
      case 'streak-starter':
        return <LocalFireDepartmentIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      case 'perfectionist':
      case 'almost-perfect':
      case 'high-achiever':
        return <TrendingUpIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      default:
        return <HelpOutlineIcon sx={{ fontSize: iconSize, color: iconColor }} />;
    }
  };

  const calculateBadges = (stats) => {
    const badges = [];
    
    // Add null safety for stats
    if (!stats) {
      console.log("No stats available, returning default badges");
      // Return some default locked badges
      return [
        {
          id: 'super-learner',
          label: 'Super Learner',
          icon: <SchoolIcon sx={{ fontSize: 40, color: '#ccc' }} />,
          description: 'Complete 100 lessons',
          category: 'Lessons',
          earned: false,
          progress: '0/100'
        },
        {
          id: 'star-master',
          label: 'Star Master',
          icon: <StarIcon sx={{ fontSize: 40, color: '#ccc' }} />,
          description: 'Earn 500 stars',
          category: 'Stars',
          earned: false,
          progress: '0/500'
        },
        {
          id: 'module-legend',
          label: 'Module Legend',
          icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: '#ccc' }} />,
          description: 'Complete 25 modules',
          category: 'Modules',
          earned: false,
          progress: '0/25'
        }
      ];
    }

    console.log("Calculating badges with stats:", stats);
    
    // Safely get values with defaults - FIXED undefined issue
    const completedLessons = Number(stats.completedLessons) || 0;
    const totalStars = Number(stats.totalStars) || 0;
    const completedModules = Number(stats.completedModules) || 0;
    const currentStreak = Number(stats.currentStreak) || 0;
    const progressPercentage = Number(stats.totalProgress) || 0;

    console.log("Safe values:", { completedLessons, totalStars, completedModules, currentStreak, progressPercentage });

    // Lesson completion badges
    if (completedLessons >= 50) {
      badges.push({
        id: 'lesson-master',
        label: 'Lesson Master',
        icon: <SchoolIcon sx={{ fontSize: 40, color: '#4a6cf7' }} />,
        description: 'Completed 50+ lessons',
        category: 'Lessons',
        earned: true,
        progress: `${completedLessons}/50`
      });
    } else if (completedLessons >= 25) {
      badges.push({
        id: 'lesson-expert',
        label: 'Lesson Expert',
        icon: <MenuBookIcon sx={{ fontSize: 40, color: '#4a6cf7' }} />,
        description: 'Completed 25+ lessons',
        category: 'Lessons',
        earned: true,
        progress: `${completedLessons}/25`
      });
    } else if (completedLessons >= 10) {
      badges.push({
        id: 'lesson-achiever',
        label: 'Achiever',
        icon: <MenuBookIcon sx={{ fontSize: 40, color: '#4a6cf7' }} />,
        description: 'Completed 10+ lessons',
        category: 'Lessons',
        earned: true,
        progress: `${completedLessons}/10`
      });
    }

    // Star collection badges
    if (totalStars >= 100) {
      badges.push({
        id: 'star-collector',
        label: 'Star Collector',
        icon: <StarIcon sx={{ fontSize: 40, color: '#ffc107' }} />,
        description: 'Earned 100+ stars',
        category: 'Stars',
        earned: true,
        progress: `${totalStars}/100`
      });
    } else if (totalStars >= 50) {
      badges.push({
        id: 'rising-star',
        label: 'Rising Star',
        icon: <StarIcon sx={{ fontSize: 40, color: '#ffc107' }} />,
        description: 'Earned 50+ stars',
        category: 'Stars',
        earned: true,
        progress: `${totalStars}/50`
      });
    }

    // Module completion badges
    if (completedModules >= 10) {
      badges.push({
        id: 'module-champion',
        label: 'Champion',
        icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#28a745' }} />,
        description: 'Completed 10+ modules',
        category: 'Modules',
        earned: true,
        progress: `${completedModules}/10`
      });
    } else if (completedModules >= 5) {
      badges.push({
        id: 'module-warrior',
        label: 'Warrior',
        icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: '#48bb78' }} />,
        description: 'Completed 5+ modules',
        category: 'Modules',
        earned: true,
        progress: `${completedModules}/5`
      });
    }

    // Always show these major achievement badges
    // Super Learner Badge
    badges.push({
      id: 'super-learner',
      label: 'Super Learner',
      icon: <SchoolIcon sx={{ fontSize: 40, color: completedLessons >= 100 ? '#4a6cf7' : '#ccc' }} />,
      description: 'Complete 100 lessons',
      category: 'Lessons',
      earned: completedLessons >= 100,
      progress: `${completedLessons}/100`
    });

    // Star Master Badge
    badges.push({
      id: 'star-master',
      label: 'Star Master',
      icon: <StarIcon sx={{ fontSize: 40, color: totalStars >= 500 ? '#ffc107' : '#ccc' }} />,
      description: 'Earn 500 stars',
      category: 'Stars',
      earned: totalStars >= 500,
      progress: `${totalStars}/500`
    });

    // Module Legend Badge - FIXED: No more undefined
    badges.push({
      id: 'module-legend',
      label: 'Module Legend',
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: completedModules >= 25 ? '#28a745' : '#ccc' }} />,
      description: 'Complete 25 modules',
      category: 'Modules',
      earned: completedModules >= 25,
      progress: `${completedModules}/25`
    });

    // Perfectionist Badge
    badges.push({
      id: 'perfectionist',
      label: 'Perfectionist',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: progressPercentage >= 100 ? '#28a745' : '#ccc' }} />,
      description: '100% completion',
      category: 'Completion',
      earned: progressPercentage >= 100,
      progress: `${progressPercentage}%`
    });

    console.log("Final badges calculated:", badges.length);
    return badges;
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
        
        <Container maxWidth="xl" sx={{ paddingTop: 3, paddingBottom: 5 }}>
          {/* Your Badges Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ 
              color: '#333', 
              fontWeight: 600, 
              mb: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Box sx={{
                backgroundColor: '#ff6b6b',
                borderRadius: '8px',
                padding: '8px 16px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600
              }}>
               Achievements
              </Box>
            </Typography>

            <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
              {badges.map((badge, index) => {
                // Additional safety check for each badge
                if (!badge) return null;
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={badge.id || index}>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      width: '100%'
                    }}>
                      <Card sx={{
                        height: '220px',
                        width: '240px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '20px',
                        backgroundColor: badge.earned ? 'rgba(255, 255, 255, 0.95)' : 'rgba(245, 245, 245, 0.95)',
                        border: badge.earned ? '3px solid #4caf50' : '3px solid #e0e0e0',
                        borderRadius: '16px',
                        opacity: badge.earned ? 1 : 0.7,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                          borderColor: badge.earned ? '#4caf50' : '#bbb'
                        }
                      }}>
                        {/* Enhanced Earned Badge Indicator - more visible for perfectionist */}
                        {badge.earned && (
                          <Box sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: badge.id === 'perfectionist' ? '#2e7d32' : '#4caf50',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: 700,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            border: badge.id === 'perfectionist' ? '2px solid white' : 'none'
                          }}>
                            ✓
                          </Box>
                        )}

                        <CardContent sx={{ 
                          textAlign: 'center', 
                          padding: 0,
                          width: '100%',
                          '&:last-child': { paddingBottom: 0 }
                        }}>
                          {/* Badge Icon */}
                          <Box sx={{
                            width: 60,
                            height: 60,
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1.5,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            margin: '0 auto 12px auto'
                          }}>
                            {badge.icon || <HelpOutlineIcon sx={{ fontSize: 32, color: '#ccc' }} />}
                          </Box>

                          {/* Badge Name */}
                          <Typography variant="h6" sx={{
                            color: '#333',
                            fontWeight: 600,
                            fontSize: '14px',
                            mb: 0.5,
                            lineHeight: 1.2,
                            textAlign: 'center',
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {badge.label || 'Unknown Badge'}
                          </Typography>

                          {/* Badge Description */}
                          <Typography variant="body2" sx={{
                            color: '#666',
                            fontSize: '12px',
                            mb: 1,
                            lineHeight: 1.3,
                            textAlign: 'center',
                            minHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {badge.description || 'No description'}
                          </Typography>

                          {/* Progress */}
                          <Typography variant="caption" sx={{
                            color: badge.earned ? '#4caf50' : '#999',
                            fontSize: '12px',
                            fontWeight: 600,
                            backgroundColor: badge.earned ? '#e8f5e8' : '#f0f0f0',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            display: 'inline-block'
                          }}>
                            {badge.progress || '0/0'}
                          </Typography>
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