import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  TextField, 
  Button
} from '@mui/material';
import Navbar from './Navbar';
import Background from './Background';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';

function ContactPage() {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
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
        }}
      >
        <Background />
      </div>

      {/* Main content - Fully responsive */}
      <div style={{ 
        position: "relative", 
        zIndex: 1, 
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden"
      }}>
        <Navbar />
        
        {/* Main Container - Centered with responsive padding */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            py: { xs: 2, sm: 3, md: 4 },
            px: { 
              xs: 1.5,
              sm: 2.5,
              md: 3,
              lg: 4
            },
            overflow: 'hidden'
          }}
        >
          {/* TWO COLUMNS LAYOUT - Fully responsive */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, sm: 3, md: 4 },
            flex: 1,
            overflow: 'hidden',
            alignItems: 'stretch',
            minHeight: { xs: 'auto', sm: '500px' }
          }}>
            
            {/* =================== LEFT COLUMN =================== */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: '400px', md: 'auto' }
            }}>
              <Paper
                elevation={3}
                sx={{
                  flex: 1,
                  p: { 
                    xs: 2,
                    sm: 2.5,
                    md: 3
                  },
                  borderRadius: { xs: '10px', sm: '12px', md: '16px' },
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(74, 108, 247, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* LEFT COLUMN HEADER */}
                <Box sx={{ 
                  mb: { xs: 2, sm: 3 }, 
                  flexShrink: 0 
                }}>
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      color: '#4a6cf7',
                      fontFamily: 'Poppins, sans-serif',
                      textAlign: 'center',
                      fontSize: { 
                        xs: '1.1rem', 
                        sm: '1.2rem', 
                        md: '1.3rem' 
                      }
                    }}
                  >
                    Get In Touch With Us Now!
                  </Typography>
                </Box>

                {/* LEFT COLUMN CONTENT - Responsive 2×2 Grid */}
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 1.5, sm: 2 }
                }}>
                  {/* TOP ROW */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1.5, sm: 2 },
                    flex: 1
                  }}>
                    {/* Phone Card */}
                    <Paper
                      elevation={1}
                      sx={{
                        flex: 1,
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: '6px', sm: '8px' },
                        backgroundColor: 'white',
                        border: '2px solid rgba(74, 108, 247, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '90px', sm: '120px' }
                      }}
                    >
                      <Box sx={{ 
                        width: { xs: 35, sm: 40, md: 45 }, 
                        height: { xs: 35, sm: 40, md: 45 }, 
                        borderRadius: '50%',
                        backgroundColor: 'rgba(74, 108, 247, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: { xs: 1, sm: 1.5 },
                        color: '#4a6cf7'
                      }}>
                        <PhoneIcon fontSize="small" />
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          fontFamily: 'Poppins, sans-serif',
                          mb: 0.5,
                          color: '#333',
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                        }}
                      >
                        Phone Number
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}
                      >
                        (032) 123-4567
                      </Typography>
                    </Paper>

                    {/* Email Card */}
                    <Paper
                      elevation={1}
                      sx={{
                        flex: 1,
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: '6px', sm: '8px' },
                        backgroundColor: 'white',
                        border: '2px solid rgba(255, 89, 94, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '90px', sm: '120px' }
                      }}
                    >
                      <Box sx={{ 
                        width: { xs: 35, sm: 40, md: 45 }, 
                        height: { xs: 35, sm: 40, md: 45 }, 
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 89, 94, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: { xs: 1, sm: 1.5 },
                        color: '#FF595E'
                      }}>
                        <EmailIcon fontSize="small" />
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          fontFamily: 'Poppins, sans-serif',
                          mb: 0.5,
                          color: '#333',
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                        }}
                      >
                        Email
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}
                      >
                        contact@skillable.com
                      </Typography>
                    </Paper>
                  </Box>

                  {/* BOTTOM ROW */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1.5, sm: 2 },
                    flex: 1
                  }}>
                    {/* Location Card */}
                    <Paper
                      elevation={1}
                      sx={{
                        flex: 1,
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: '6px', sm: '8px' },
                        backgroundColor: 'white',
                        border: '2px solid rgba(138, 201, 38, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '90px', sm: '120px' }
                      }}
                    >
                      <Box sx={{ 
                        width: { xs: 35, sm: 40, md: 45 }, 
                        height: { xs: 35, sm: 40, md: 45 }, 
                        borderRadius: '50%',
                        backgroundColor: 'rgba(138, 201, 38, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: { xs: 1, sm: 1.5 },
                        color: '#8AC926'
                      }}>
                        <LocationOnIcon fontSize="small" />
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          fontFamily: 'Poppins, sans-serif',
                          mb: 0.5,
                          color: '#333',
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                        }}
                      >
                        Location
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}
                      >
                        Cebu City, PH
                      </Typography>
                    </Paper>

                    {/* Hours Card */}
                    <Paper
                      elevation={1}
                      sx={{
                        flex: 1,
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: '6px', sm: '8px' },
                        backgroundColor: 'white',
                        border: '2px solid rgba(106, 76, 147, 0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        justifyContent: 'center',
                        minHeight: { xs: '90px', sm: '120px' }
                      }}
                    >
                      <Box sx={{ 
                        width: { xs: 35, sm: 40, md: 45 }, 
                        height: { xs: 35, sm: 40, md: 45 }, 
                        borderRadius: '50%',
                        backgroundColor: 'rgba(106, 76, 147, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: { xs: 1, sm: 1.5 },
                        color: '#6A4C93'
                      }}>
                        <AccessTimeIcon fontSize="small" />
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          fontFamily: 'Poppins, sans-serif',
                          mb: 0.5,
                          color: '#333',
                          fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                        }}
                      >
                        Working Hours
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          lineHeight: 1.2
                        }}
                      >
                        Mon-Fri: 9AM-6PM
                      </Typography>
                    </Paper>
                  </Box>
                </Box>

                {/* LEFT COLUMN FOOTER */}
                <Box sx={{ 
                  mt: { xs: 1.5, sm: 2 }, 
                  pt: { xs: 1.5, sm: 2 }, 
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    Response within 24 hours on business days
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* =================== RIGHT COLUMN =================== */}
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: { xs: '500px', md: 'auto' }
            }}>
              <Paper
                elevation={3}
                sx={{
                  flex: 1,
                  borderRadius: { xs: '10px', sm: '12px', md: '16px' },
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(74, 108, 247, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(74, 108, 247, 0.12)',
                }}
              >
                {/* ENHANCED HEADER */}
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #4a6cf7 0%, #3a5bd9 100%)',
                    py: { xs: 2, sm: 2.5 },
                    px: { xs: 2, sm: 3 },
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Typography 
                    variant="h5" 
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      color: 'white',
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: { 
                        xs: '1.2rem', 
                        sm: '1.3rem', 
                        md: '1.4rem' 
                      },
                      position: 'relative',
                      zIndex: 1,
                      textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      letterSpacing: '0.3px'
                    }}
                  >
                    Contact Us
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontFamily: 'Inter, sans-serif',
                      position: 'relative',
                      zIndex: 1,
                      display: 'block',
                      mt: 0.5,
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }
                    }}
                  >
                    Fill out the form below to get in touch
                  </Typography>
                </Box>

                {/* CONTACT FORM CONTENT */}
                <Box 
                  component="form" 
                  sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: { xs: 2, sm: 2.5, md: 3 }
                  }}
                >
                  {/* Clean vertical form flow */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Top row - First & Last Name */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2 
                    }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        variant="outlined"
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            fontSize: '0.9rem',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.9rem',
                            color: '#666',
                          }
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Last Name"
                        variant="outlined"
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            fontSize: '0.9rem',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.9rem',
                            color: '#666',
                          }
                        }}
                      />
                    </Box>

                    {/* Middle row - Mobile & Email */}
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2 
                    }}>
                      <TextField
                        fullWidth
                        label="Mobile Number"
                        variant="outlined"
                        type="tel"
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            fontSize: '0.9rem',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.9rem',
                            color: '#666',
                          }
                        }}
                      />
                      
                      <TextField
                        fullWidth
                        label="Email Address"
                        variant="outlined"
                        type="email"
                        required
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            fontSize: '0.9rem',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.9rem',
                            color: '#666',
                          }
                        }}
                      />
                    </Box>

                    {/* Message Field - Horizontal (shorter height) */}
                    <Box sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        label="Your Message"
                        variant="outlined"
                        multiline
                        rows={3}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            width: '100%',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            minHeight: '100px',
                            '& textarea': {
                              width: '100%',
                              resize: 'vertical',
                              fontSize: '0.9rem',
                              minHeight: '60px',
                              maxHeight: '150px'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#4a6cf7',
                              borderWidth: '2px'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.9rem',
                            color: '#666',
                            '&.Mui-focused': {
                              color: '#4a6cf7'
                            }
                          }
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.5,
                          color: '#888',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.75rem'
                        }}
                      >
                        0/500
                      </Typography>
                    </Box>

                    {/* Submit Button - Positioned right below message field */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 1 
                    }}>
                      <Button
                        type="submit"
                        variant="contained"
                        endIcon={<SendIcon/>}
                        sx={{
                          px: 5,
                          py: 1.5,
                          fontSize: '1rem',
                          textTransform: 'none',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #4a6cf7, #3a5bd9)',
                          boxShadow: '0 4px 12px rgba(74,108,247,0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #3a5bd9, #2a4bb9)',
                          }
                        }}
                      >
                        Send Message
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>

        {/* Footer - Responsive */}
        <Box
          sx={{
            backgroundColor: 'rgba(26, 26, 46, 0.95)',
            color: 'white',
            py: { xs: 1, sm: 1.5 },
            textAlign: 'center',
            zIndex: 2,
            flexShrink: 0,
            mt: 'auto'
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="caption" sx={{ 
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: { xs: '0.7rem', sm: '0.75rem' }
            }}>
              © {new Date().getFullYear()} Skillable. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </div>
    </div>
  );
}

export default ContactPage;