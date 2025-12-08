import React, { useState, useRef, useEffect } from 'react';
import { 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Avatar, 
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Navbar from './Navbar';
import Background from './Background';
import bookgirl from '../assets/bookgirl.png';
import bgbookgirl from '../assets/bgbookgirl.png';

// Import profile images
import ezzel from '../assets/profiles/ezzel.png';
import rj from '../assets/profiles/rj.png';
import vincent from '../assets/profiles/vincent.png';
import raven from '../assets/profiles/raven.png';
import claire from '../assets/profiles/claire.png';

function AboutUsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const teamContainerRef = useRef(null);

  const teamMembers = [
    { 
      name: "Ezzel Jan Francisco",
      image: ezzel,
      role: "Developer"
    },
    { 
      name: "Ragelo John C. Gare",
      image: rj,
      role: "Developer"
    },
    { 
      name: "Vincent Nino G. Nator",
      image: vincent,
      role: "Developer"
    },
    { 
      name: "Raven King O. Pavo",
      image: raven,
      role: "Developer"
    },
    { 
      name: "Claire Andrea S. Saniel",
      image: claire,
      role: "Developer"
    }
  ];

  // Handle touch events for team member carousel on mobile
  const handleTouchStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    setTouchStartX(touch.clientX);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    setTouchEndX(touch.clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left
        setCurrentSlide(prev => Math.min(prev + 1, teamMembers.length - 1));
      } else {
        // Swipe right
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      }
    }

    setTouchStartX(0);
    setTouchEndX(0);
  };

  // Handle pointer events for better cross-platform compatibility
  const handlePointerDown = (e) => {
    handleTouchStart(e);
  };

  const handlePointerMove = (e) => {
    if (e.buttons === 1) { // Left mouse button pressed
      handleTouchMove(e);
    }
  };

  const handlePointerUp = () => {
    handleTouchEnd();
  };

  // Auto-scroll team container on slide change for mobile
  useEffect(() => {
    if (teamContainerRef.current && (isMobile || isTablet)) {
      const container = teamContainerRef.current;
      const slideWidth = container.offsetWidth;
      container.scrollTo({
        left: currentSlide * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [currentSlide, isMobile, isTablet]);

  // Get responsive values
  const getResponsiveValue = (values) => {
    if (isMobile) return values.xs || values.sm || values.md || values.lg || values.xl;
    if (isTablet) return values.sm || values.md || values.lg || values.xl || values.xs;
    return values.md || values.lg || values.xl || values.sm || values.xs;
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
        touchAction: "pan-y", // Enable vertical scrolling on touch devices
        WebkitTapHighlightColor: "transparent", // Remove tap highlight on iOS
      }}
    >
      {/* Background layer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Background />
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
        }}
      >
        <Navbar />

        {/* SECTION 1: About Skillable - Responsive Layout */}
        <section 
          className="main-section" 
          style={{ 
            minHeight: getResponsiveValue({ xs: "auto", sm: "80vh", md: "80vh" }),
            position: "relative",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: getResponsiveValue({ xs: "20px 16px", sm: "40px 20px", md: "40px 20px" }),
            overflow: "hidden",
          }}
        >
          {/* Responsive Background Images */}
          <img
            src={bgbookgirl}
            alt="Background Book Girl"
            style={{
              position: 'absolute',
              right: getResponsiveValue({ xs: '-400px', sm: '-300px', md: '-250px', lg: '-200px' }),
              bottom: getResponsiveValue({ xs: '-100px', sm: '-50px', md: '-50px' }),
              height: getResponsiveValue({ xs: '550px', sm: '650px', md: '750px', lg: '850px' }),
              objectFit: 'contain',
              zIndex: 0,
              opacity: 0.8,
              pointerEvents: "none",
            }}
          />

          <img
            src={bookgirl}
            alt="Book Girl"
            style={{
              position: 'absolute',
              right: getResponsiveValue({ xs: '-250px', sm: '-200px', md: '-150px', lg: '-100px' }),
              bottom: getResponsiveValue({ xs: '-30px', sm: '-20px', md: '-10px' }),
              height: getResponsiveValue({ xs: '500px', sm: '600px', md: '700px', lg: '800px' }),
              objectFit: 'contain',
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          {/* Decorative abstract shapes - Responsive positioning */}
          <div style={{
            position: 'absolute',
            top: getResponsiveValue({ xs: '5%', sm: '10%', md: '10%' }),
            left: getResponsiveValue({ xs: '2%', sm: '5%', md: '5%' }),
            width: getResponsiveValue({ xs: '100px', sm: '150px', md: '200px' }),
            height: getResponsiveValue({ xs: '100px', sm: '150px', md: '200px' }),
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,89,94,0.1) 0%, transparent 70%)',
            zIndex: 0,
            pointerEvents: "none",
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: getResponsiveValue({ xs: '10%', sm: '15%', md: '20%' }),
            left: getResponsiveValue({ xs: '5%', sm: '10%', md: '15%' }),
            width: getResponsiveValue({ xs: '80px', sm: '120px', md: '150px' }),
            height: getResponsiveValue({ xs: '80px', sm: '120px', md: '150px' }),
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(74,108,247,0.1) 0%, transparent 70%)',
            zIndex: 0,
            pointerEvents: "none",
          }} />

          {/* Center Content */}
          <Container 
            maxWidth="lg" 
            sx={{ 
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Grid 
              container 
              alignItems="center" 
              spacing={getResponsiveValue({ xs: 2, sm: 3, md: 4 })}
              sx={{ 
                minHeight: getResponsiveValue({ xs: 'auto', sm: '500px', md: '600px' })
              }}
            >
              {/* Left Column: Text Content */}
              <Grid item xs={12} md={7}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    textAlign: "left",
                    gap: getResponsiveValue({ xs: "20px", sm: "25px", md: "30px" }),
                    zIndex: 2,
                    position: "relative",
                    marginTop: getResponsiveValue({ xs: "0", sm: "-20px", md: "-20px" }),
                  }}
                >
                  <Typography
                    component="h1"
                    variant="h1"
                    sx={{
                      fontSize: getResponsiveValue({ 
                        xs: "2rem",   // 320px
                        sm: "2.5rem", // 480px
                        md: "3rem",   // 768px
                        lg: "3.5rem"  // 1024px+
                      }),
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "800",
                      color: "#FF595E",
                      lineHeight: 1.2,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    About Skillable
                  </Typography>

                  <Paper
                    elevation={3}
                    sx={{
                      p: getResponsiveValue({ xs: 2, sm: 2.5, md: 3 }),
                      borderRadius: getResponsiveValue({ xs: "16px", sm: "18px", md: "20px" }),
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      maxWidth: getResponsiveValue({ xs: "100%", sm: "100%", md: "600px" }),
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: getResponsiveValue({ 
                          xs: "0.9rem",  // 320px
                          sm: "1rem",    // 480px
                          md: "1.1rem",  // 768px
                          lg: "1.2rem"   // 1024px+
                        }),
                        fontFamily: "Inter, sans-serif",
                        color: "#333",
                        lineHeight: 1.6,
                      }}
                    >
                      We revolutionize special education through technology, empowering SPED students with 
                      Autism Spectrum Disorder (ASD) and Down Syndrome with interactive, gamified learning 
                      experiences that bridge theoretical knowledge and practical application.
                    </Typography>
                  </Paper>

                  {/* Mission and Vision Cards - Responsive Layout */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: getResponsiveValue({ xs: 'column', sm: 'column', md: 'row' }), 
                    gap: getResponsiveValue({ xs: 2, sm: 3, md: 3 }),
                    maxWidth: '600px',
                    mt: getResponsiveValue({ xs: 1, sm: 2, md: 2 })
                  }}>
                    {/* Mission Card */}
                    <Paper
                      elevation={2}
                      sx={{
                        flex: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #FF595E',
                        borderRadius: getResponsiveValue({ xs: "12px", sm: "14px", md: "16px" }),
                        p: getResponsiveValue({ xs: 2, sm: 2.5, md: 3 }),
                        boxShadow: '0 4px 12px rgba(255, 89, 94, 0.1)',
                        minHeight: getResponsiveValue({ xs: "180px", sm: "200px", md: "220px" }),
                        display: 'flex',
                        flexDirection: 'column',
                        touchAction: "manipulation", // Optimize for touch
                        cursor: "pointer",
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:active': {
                          transform: 'scale(0.98)',
                          boxShadow: '0 2px 8px rgba(255, 89, 94, 0.2)',
                        }
                      }}
                      onClick={() => console.log('Mission card clicked')}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: getResponsiveValue({ xs: 32, sm: 36, md: 40 }),
                            height: getResponsiveValue({ xs: 32, sm: 36, md: 40 }),
                            borderRadius: '50%',
                            backgroundColor: '#FF595E',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: getResponsiveValue({ xs: 1.5, sm: 2, md: 2 }),
                          }}
                        >
                          <Typography sx={{ 
                            color: 'white', 
                            fontWeight: 'bold', 
                            fontSize: getResponsiveValue({ xs: "0.9rem", sm: "1rem", md: "1.2rem" })
                          }}>
                            M
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          fontFamily: 'Poppins, sans-serif',
                          color: '#FF595E',
                          fontSize: getResponsiveValue({ xs: "1rem", sm: "1.1rem", md: "1.2rem" })
                        }}>
                          Mission
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#333',
                        lineHeight: 1.6,
                        flex: 1,
                        fontSize: getResponsiveValue({ xs: "0.85rem", sm: "0.9rem", md: "1rem" })
                      }}>
                        Empower SPED learners with ASD and Down Syndrome through innovative, gamified educational technology.
                      </Typography>
                    </Paper>

                    {/* Vision Card */}
                    <Paper
                      elevation={2}
                      sx={{
                        flex: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '2px solid #4a6cf7',
                        borderRadius: getResponsiveValue({ xs: "12px", sm: "14px", md: "16px" }),
                        p: getResponsiveValue({ xs: 2, sm: 2.5, md: 3 }),
                        boxShadow: '0 4px 12px rgba(74, 108, 247, 0.1)',
                        minHeight: getResponsiveValue({ xs: "180px", sm: "200px", md: "220px" }),
                        display: 'flex',
                        flexDirection: 'column',
                        touchAction: "manipulation",
                        cursor: "pointer",
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        '&:active': {
                          transform: 'scale(0.98)',
                          boxShadow: '0 2px 8px rgba(74, 108, 247, 0.2)',
                        }
                      }}
                      onClick={() => console.log('Vision card clicked')}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: getResponsiveValue({ xs: 32, sm: 36, md: 40 }),
                            height: getResponsiveValue({ xs: 32, sm: 36, md: 40 }),
                            borderRadius: '50%',
                            backgroundColor: '#4a6cf7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: getResponsiveValue({ xs: 1.5, sm: 2, md: 2 }),
                          }}
                        >
                          <Typography sx={{ 
                            color: 'white', 
                            fontWeight: 'bold', 
                            fontSize: getResponsiveValue({ xs: "0.9rem", sm: "1rem", md: "1.2rem" })
                          }}>
                            V
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          fontFamily: 'Poppins, sans-serif',
                          color: '#4a6cf7',
                          fontSize: getResponsiveValue({ xs: "1rem", sm: "1.1rem", md: "1.2rem" })
                        }}>
                          Vision
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'Inter, sans-serif',
                        color: '#333',
                        lineHeight: 1.6,
                        flex: 1,
                        fontSize: getResponsiveValue({ xs: "0.85rem", sm: "0.9rem", md: "1rem" })
                      }}>
                        Create an inclusive learning environment that promotes independence and fosters 
                        real-world application of crucial skills for students with diverse cognitive needs.
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Decorative elements */}
                  <Box sx={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '20px',
                    flexWrap: 'wrap',
                  }}>
                    {['#FF595E', '#8AC926', '#4a6cf7', '#6A4C93'].map((color, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: getResponsiveValue({ xs: '12px', sm: '15px', md: '15px' }),
                          height: getResponsiveValue({ xs: '12px', sm: '15px', md: '15px' }),
                          borderRadius: '50%',
                          backgroundColor: color,
                          opacity: 0.7,
                          cursor: "pointer",
                          transition: 'transform 0.2s ease',
                          '&:active': {
                            transform: 'scale(0.9)',
                          }
                        }}
                        onClick={() => console.log(`Color ${index} clicked`)}
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Right Column: Spacer for larger screens */}
              <Grid item xs={12} md={5}>
                {/* This column is intentionally left empty to balance the layout */}
                <Box sx={{ 
                  height: '100%',
                  display: { xs: 'none', md: 'block' }
                }} />
              </Grid>
            </Grid>
          </Container>
        </section>

        {/* Spacer between sections */}
        <Box sx={{ 
          height: getResponsiveValue({ xs: "40px", sm: "60px", md: "100px" }),
          width: "100%",
          background: "transparent"
        }} />

        {/* SECTION 2: Meet Our Team */}
        <section style={{ 
          padding: getResponsiveValue({ 
            xs: "20px 16px", 
            sm: "30px 20px", 
            md: "40px 20px" 
          }), 
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          minHeight: "auto",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: "pan-y",
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(255,89,94,0.05) 0%, rgba(138,201,38,0.05) 100%)',
            zIndex: 0,
            pointerEvents: "none",
          }} />
          
          <div style={{
            position: 'absolute',
            top: '10%',
            right: getResponsiveValue({ xs: '5%', sm: '8%', md: '10%' }),
            width: getResponsiveValue({ xs: '80px', sm: '120px', md: '150px' }),
            height: getResponsiveValue({ xs: '80px', sm: '120px', md: '150px' }),
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,89,94,0.1) 0%, transparent 70%)',
            zIndex: 0,
            pointerEvents: "none",
          }} />

          <Container 
            maxWidth="lg" 
            sx={{ 
              position: 'relative', 
              zIndex: 1,
              py: getResponsiveValue({ xs: 2, sm: 3, md: 4 })
            }}
          >
            {/* Title Section */}
            <Box
              sx={{
                display: "inline-block",
                backgroundColor: "#540d6e",
                borderRadius: getResponsiveValue({ xs: "30px", sm: "35px", md: "40px" }),
                padding: getResponsiveValue({ xs: "6px 20px", sm: "8px 25px", md: "10px 30px" }),
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                mb: getResponsiveValue({ xs: 3, sm: 4, md: 5 }),
                mt: getResponsiveValue({ xs: 1, sm: 2, md: 3 }),
              }}
            >
              <Typography
                component="h2"
                variant="h2"
                sx={{
                  fontSize: getResponsiveValue({ 
                    xs: "1.5rem",   // 320px
                    sm: "1.8rem",   // 480px
                    md: "2rem",     // 768px
                    lg: "2.2rem"    // 1024px+
                  }),
                  fontWeight: "700",
                  fontFamily: "Poppins, sans-serif",
                  color: "white",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Meet Our Team
              </Typography>
            </Box>

            {/* Team Members - Responsive Layout */}
            <Box 
              ref={teamContainerRef}
              sx={{ 
                display: getResponsiveValue({ xs: 'flex', sm: 'flex', md: 'flex' }),
                flexDirection: getResponsiveValue({ xs: 'row', sm: 'row', md: 'row' }),
                flexWrap: getResponsiveValue({ xs: 'nowrap', sm: 'nowrap', md: 'nowrap' }),
                justifyContent: getResponsiveValue({ 
                  xs: 'flex-start', 
                  sm: 'center', 
                  md: 'center' 
                }),
                alignItems: 'center',
                gap: getResponsiveValue({ xs: 3, sm: 4, md: 4 }),
                mb: 4,
                width: '100%',
                overflowX: getResponsiveValue({ xs: 'auto', sm: 'auto', md: 'visible' }),
                overflowY: 'hidden',
                scrollSnapType: getResponsiveValue({ xs: 'x mandatory', sm: 'x mandatory', md: 'none' }),
                WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                scrollbarWidth: 'none', // Firefox
                '&::-webkit-scrollbar': {
                  display: 'none', // Chrome, Safari
                },
                touchAction: getResponsiveValue({ xs: 'pan-x', sm: 'pan-x', md: 'auto' }),
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {teamMembers.map((member, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    flex: getResponsiveValue({ 
                      xs: '0 0 85%',    // Mobile: 85% width for carousel
                      sm: '0 0 45%',    // Tablet: 45% width
                      md: '1'           // Desktop: equal flex
                    }),
                    scrollSnapAlign: getResponsiveValue({ xs: 'center', sm: 'center', md: 'none' }),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'transform 0.3s ease',
                    mb: getResponsiveValue({ xs: 0, sm: 0, md: 0 }),
                    p: getResponsiveValue({ xs: 1, sm: 1, md: 0 }),
                    cursor: "pointer",
                    userSelect: 'none',
                    '&:active': {
                      transform: 'scale(0.98)',
                    }
                  }}
                  onClick={() => console.log(`${member.name} clicked`)}
                >
                  <Paper 
                    elevation={4}
                    sx={{
                      width: getResponsiveValue({ 
                        xs: 100,   // 320px
                        sm: 120,   // 480px
                        md: 140,   // 768px
                        lg: 160    // 1024px+
                      }),
                      height: getResponsiveValue({ 
                        xs: 100, 
                        sm: 120, 
                        md: 140, 
                        lg: 160 
                      }),
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      border: '3px solid #540d6e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: getResponsiveValue({ xs: 1.5, sm: 2, md: 2.5 }),
                      overflow: 'hidden',
                      boxShadow: '0 5px 20px rgba(84, 13, 110, 0.15)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Avatar 
                      src={member.image}
                      alt={member.name}
                      sx={{ 
                        width: '90%', 
                        height: '90%',
                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                  </Paper>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontFamily: 'Poppins, sans-serif',
                      textAlign: 'center',
                      fontSize: getResponsiveValue({ 
                        xs: "0.9rem", 
                        sm: "1rem", 
                        md: "1.1rem",
                        lg: "1.2rem" 
                      }),
                      mb: 0.5,
                      color: '#333',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      px: 1,
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontFamily: 'Inter, sans-serif',
                      textAlign: 'center',
                      fontSize: getResponsiveValue({ 
                        xs: "0.75rem", 
                        sm: "0.8rem", 
                        md: "0.85rem",
                        lg: "0.9rem" 
                      }),
                      px: 1,
                    }}
                  >
                    {member.role}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Carousel Indicators for Mobile/Tablet */}
            {(isMobile || isTablet) && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 1, 
                mt: 2,
                mb: 3
              }}>
                {teamMembers.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: getResponsiveValue({ xs: 8, sm: 10 }),
                      height: getResponsiveValue({ xs: 8, sm: 10 }),
                      borderRadius: '50%',
                      backgroundColor: index === currentSlide ? '#540d6e' : '#ddd',
                      cursor: "pointer",
                      transition: 'all 0.3s ease',
                      '&:active': {
                        transform: 'scale(0.9)',
                      }
                    }}
                    onClick={() => setCurrentSlide(index)}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                  />
                ))}
              </Box>
            )}
          </Container>
        </section>

        {/* Footer */}
        <Box 
          component="footer"
          sx={{
            backgroundColor: '#1a1a2e',
            color: 'white',
            py: getResponsiveValue({ xs: 2, sm: 3, md: 4 }),
            textAlign: 'center',
            touchAction: "manipulation",
          }}
        >
          <Container maxWidth="lg">
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                fontSize: getResponsiveValue({ 
                  xs: "0.8rem", 
                  sm: "0.85rem", 
                  md: "0.9rem" 
                }),
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.6,
              }}
            >
              Skillable © {new Date().getFullYear()} - Empowering Special Education Through Technology
            </Typography>
          </Container>
        </Box>
      </div>
    </div>
  );
}

export default AboutUsPage;