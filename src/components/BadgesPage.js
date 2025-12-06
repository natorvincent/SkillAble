import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
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
          const badgesResponse = await fetch(`https://skillable-pdv0.onrender.com/api/badges/student/${studentId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
            }
          });
          
          if (badgesResponse.ok) {
            const badgesData = await badgesResponse.json();
            console.log("Backend badges data:", badgesData);
            
            // Transform backend data to frontend format - ensure all 4 main badges are always present
            const requiredBadges = ['super-learner', 'shining-bright', 'star-master', 'module-legend'];
            const backendBadges = badgesData.badges || [];
            
            const transformedBadges = requiredBadges.map(badgeId => {
              const backendBadge = backendBadges.find(b => b.id === badgeId);
              if (backendBadge) {
                return {
                  id: backendBadge.id,
                  label: backendBadge.label || getBadgeDefaultData(badgeId).label,
                  description: backendBadge.description || getBadgeDefaultData(badgeId).description,
                  category: backendBadge.category || getBadgeDefaultData(badgeId).category,
                  earned: backendBadge.earned || false,
                  progress: backendBadge.progress || getBadgeDefaultData(badgeId).progress,
                  icon: getBadgeIcon(badgeId, backendBadge.color)
                };
              } else {
                // If badge not found in backend, create default
                const defaultData = getBadgeDefaultData(badgeId);
                return {
                  ...defaultData,
                  icon: getBadgeIcon(badgeId, '#ccc')
                };
              }
            });
            
            setBadges(transformedBadges);
            return; // Successfully got badges from backend
          }
        } catch (backendError) {
          console.log("Backend endpoint not available, using fallback:", backendError);
        }
        
        // Fallback to local calculation if backend fails - FETCHES REAL DATA
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

  // Helper function to get default badge data
  const getBadgeDefaultData = (badgeId) => {
    const defaults = {
      'super-learner': {
        id: 'super-learner',
        label: 'Super Learner',
        description: 'Complete 100 lessons',
        category: 'Lessons',
        earned: false,
        progress: '0/100'
      },
      'shining-bright': {
        id: 'shining-bright',
        label: 'Shining Bright',
        description: 'Earn 100 stars',
        category: 'Stars',
        earned: false,
        progress: '⭐ 0/100'
      },
      'star-master': {
        id: 'star-master',
        label: 'Star Master',
        description: 'Earn 500 stars',
        category: 'Stars',
        earned: false,
        progress: '⭐ 0/500'
      },
      'module-legend': {
        id: 'module-legend',
        label: 'Module Legend',
        description: 'Complete 25 modules',
        category: 'Modules',
        earned: false,
        progress: '0/25'
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

  // Helper function to get the correct icon based on badge ID and color
  const getBadgeIcon = (badgeId, color) => {
    const iconColor = color === '#ccc' ? '#ccc' : color;
    const iconSize = 32;
    
    switch (badgeId) {
      case 'super-learner':
        return <SchoolIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      case 'shining-bright':
        return <StarIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      case 'star-master':
        return <StarIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      case 'module-legend':
        return <AssignmentTurnedInIcon sx={{ fontSize: iconSize, color: iconColor }} />;
      default:
        return <HelpOutlineIcon sx={{ fontSize: iconSize, color: iconColor }} />;
    }
  };

  const calculateBadges = (stats) => {
    // Add null safety for stats
    if (!stats) {
      console.log("No stats available, returning default badges");
      // Return all four main badges in locked state using helper function
      return ['super-learner', 'shining-bright', 'star-master', 'module-legend'].map(badgeId => ({
        ...getBadgeDefaultData(badgeId),
        icon: getBadgeIcon(badgeId, '#ccc')
      }));
    }

    console.log("Calculating badges with stats:", stats);
    
    // Safely get values with defaults
    const completedLessons = Number(stats.completedLessons) || 0;
    const totalStars = Number(stats.totalStars) || 0;
    const completedModules = Number(stats.completedModules) || 0;

    console.log("Safe values:", { completedLessons, totalStars, completedModules });

    // Always return all four main achievement badges in consistent order
    const badges = [
      // Super Learner Badge
      {
        id: 'super-learner',
        label: 'Super Learner',
        icon: <SchoolIcon sx={{ fontSize: 40, color: completedLessons >= 100 ? '#4a6cf7' : '#ccc' }} />,
        description: 'Complete 100 lessons',
        category: 'Lessons',
        earned: completedLessons >= 100,
        progress: `${completedLessons}/100`
      },
      // Shining Bright Badge
      {
        id: 'shining-bright',
        label: 'Shining Bright',
        icon: <StarIcon sx={{ fontSize: 40, color: totalStars >= 100 ? '#ff6b35' : '#ccc' }} />,
        description: 'Earn 100 stars',
        category: 'Stars',
        earned: totalStars >= 100,
        progress: `⭐ ${totalStars}/100`
      },
      // Star Master Badge
      {
        id: 'star-master',
        label: 'Star Master',
        icon: <StarIcon sx={{ fontSize: 40, color: totalStars >= 500 ? '#ffc107' : '#ccc' }} />,
        description: 'Earn 500 stars',
        category: 'Stars',
        earned: totalStars >= 500,
        progress: `⭐ ${totalStars}/500`
      },
      // Module Legend Badge 
      {
        id: 'module-legend',
        label: 'Module Legend',
        icon: <AssignmentTurnedInIcon sx={{ fontSize: 40, color: completedModules >= 25 ? '#28a745' : '#ccc' }} />,
        description: 'Complete 25 modules',
        category: 'Modules',
        earned: completedModules >= 25,
        progress: `${completedModules}/25`
      }
    ];

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
        
        <Container maxWidth="xl" sx={{ paddingTop: { xs: 2, sm: 3 }, paddingBottom: { xs: 3, sm: 5 }, px: { xs: 2, sm: 3 } }}>
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
              {/* Main Title */}
              <Typography variant="h3" sx={{ 
                color: '#2c3e50', 
                fontWeight: 700, 
                mb: { xs: 1.5, sm: 2 },
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                px: { xs: 1, sm: 0 }
              }}>
                🏆 Your Amazing Achievements! 🏆
              </Typography>

              {/* Colorful Achievement Button */}
              <Box sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: { xs: '20px', sm: '25px' },
                padding: { xs: '10px 20px', sm: '12px 30px' },
                color: 'white',
                fontSize: { xs: '14px', sm: '16px', md: '18px' },
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease',
                marginBottom: { xs: 2, sm: 3 },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(102, 126, 234, 0.6)',
                }
              }}>
                ✨ Badge Unlocked: {earnedBadgesCount}/{totalBadgesCount} ✨
              </Box>

              {/* Motivational Message */}
              <Typography variant="h6" sx={{
                color: '#34495e',
                fontWeight: 500,
                maxWidth: { xs: '100%', sm: '600px' },
                lineHeight: 1.6,
                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem', lg: '1.25rem' },
                px: { xs: 2, sm: 0 }
              }}>
                🌟 Every achievement is a step forward on your learning journey! 
                Keep up the fantastic work! 🌟
              </Typography>
            </Box>

            {/* Badges Grid - Centered */}
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ justifyContent: 'center' }}>
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
                        height: { xs: '240px', sm: '260px', md: '280px' },
                        width: '100%',
                        maxWidth: { xs: '100%', sm: '280px', md: '260px' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: { xs: '16px', sm: '20px', md: '24px' },
                        background: badge.earned 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        border: badge.earned ? '4px solid #ffd700' : '4px solid #dee2e6',
                        borderRadius: '20px',
                        opacity: badge.earned ? 1 : 0.8,
                        transition: 'all 0.4s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        transform: badge.earned ? 'scale(1.02)' : 'scale(1)',
                        '&:hover': {
                          transform: badge.earned ? 'scale(1.08) translateY(-8px)' : 'scale(1.05) translateY(-4px)',
                          boxShadow: badge.earned 
                            ? '0 20px 40px rgba(102, 126, 234, 0.4)'
                            : '0 12px 24px rgba(0,0,0,0.15)',
                          borderColor: badge.earned ? '#ffd700' : '#adb5bd'
                        }
                      }}>
                        {/* Super Enhanced Earned Badge Indicator */}
                        {badge.earned && (
                          <>
                            {/* Outer glow ring */}
                            <Box sx={{
                              position: 'absolute',
                              top: -12,
                              right: -12,
                              background: 'radial-gradient(circle, #ffd700 0%, #ffed4e 100%)',
                              borderRadius: '50%',
                              width: 48,
                              height: 48,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.6)',
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)', opacity: 1 },
                                '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                                '100%': { transform: 'scale(1)', opacity: 1 }
                              }
                            }}>
                              <Box sx={{
                                background: '#fff',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffd700',
                                fontSize: '20px',
                                fontWeight: 900,
                                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                              }}>
                                ✓
                              </Box>
                            </Box>
                            
                            {/* Sparkle effects */}
                            <Box sx={{
                              position: 'absolute',
                              top: 5,
                              left: 5,
                              color: '#ffd700',
                              fontSize: '16px',
                              animation: 'twinkle 1.5s infinite',
                              '@keyframes twinkle': {
                                '0%, 100%': { opacity: 0.3 },
                                '50%': { opacity: 1 }
                              }
                            }}>
                              ✨
                            </Box>
                            <Box sx={{
                              position: 'absolute',
                              bottom: 5,
                              right: 5,
                              color: '#ffd700',
                              fontSize: '12px',
                              animation: 'twinkle 2s infinite 0.5s',
                            }}>
                              ⭐
                            </Box>
                          </>
                        )}

                        <CardContent sx={{ 
                          textAlign: 'center', 
                          padding: 0,
                          width: '100%',
                          '&:last-child': { paddingBottom: 0 }
                        }}>
                          {/* Badge Icon with Enhanced Styling */}
                          <Box sx={{
                            width: { xs: 60, sm: 70, md: 80 },
                            height: { xs: 60, sm: 70, md: 80 },
                            background: badge.earned 
                              ? 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'
                              : 'linear-gradient(135deg, #fff 0%, #f1f3f4 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: badge.earned 
                              ? '0 8px 20px rgba(0,0,0,0.2)'
                              : '0 4px 12px rgba(0,0,0,0.1)',
                            margin: '0 auto 16px auto',
                            border: badge.earned ? '3px solid #ffd700' : '3px solid #e9ecef',
                            transition: 'all 0.3s ease'
                          }}>
                            {React.cloneElement(badge.icon || <HelpOutlineIcon />, {
                              sx: { fontSize: { xs: 36, sm: 42, md: 48 }, color: badge.earned ? badge.icon?.props?.sx?.color || '#4a6cf7' : '#adb5bd' }
                            })}
                          </Box>

                          {/* Badge Name with Enhanced Typography */}
                          <Typography variant="h6" sx={{
                            color: badge.earned ? '#fff' : '#495057',
                            fontWeight: 700,
                            fontSize: { xs: '14px', sm: '15px', md: '16px' },
                            mb: { xs: 0.5, sm: 1 },
                            lineHeight: 1.2,
                            textAlign: 'center',
                            minHeight: { xs: '36px', sm: '40px', md: '44px' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textShadow: badge.earned ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none'
                          }}>
                            {badge.label || 'Unknown Badge'}
                          </Typography>

                          {/* Badge Description with Better Contrast */}
                          <Typography variant="body2" sx={{
                            color: badge.earned ? 'rgba(255,255,255,0.9)' : '#6c757d',
                            fontSize: { xs: '11px', sm: '12px', md: '13px' },
                            mb: { xs: 1, sm: 1.5 },
                            lineHeight: 1.4,
                            textAlign: 'center',
                            minHeight: { xs: '32px', sm: '36px', md: '40px' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textShadow: badge.earned ? '1px 1px 2px rgba(0,0,0,0.2)' : 'none'
                          }}>
                            {badge.description || 'No description'}
                          </Typography>

                          {/* Enhanced Progress Display */}
                          <Box sx={{
                            background: badge.earned 
                              ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                              : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            color: badge.earned ? '#2c3e50' : '#6c757d',
                            fontSize: { xs: '12px', sm: '13px', md: '14px' },
                            fontWeight: 700,
                            padding: { xs: '6px 12px', sm: '8px 16px' },
                            borderRadius: { xs: '15px', sm: '20px' },
                            display: 'inline-block',
                            boxShadow: badge.earned 
                              ? '0 4px 12px rgba(255, 215, 0, 0.3)'
                              : '0 2px 8px rgba(0,0,0,0.1)',
                            border: badge.earned ? '2px solid #fff' : '2px solid #dee2e6',
                            minWidth: { xs: '70px', sm: '80px' }
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