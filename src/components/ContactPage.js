import React from 'react';
import { Box, Typography, Container, TextField, Button } from '@mui/material';
import Navbar from './Navbar';
import Background from './Background';

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

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Navbar />
        <Container maxWidth="md" sx={{ paddingTop: 8, paddingBottom: 8 }}>
          <Box sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h3" component="h1" sx={{ 
              fontWeight: 700,
              color: '#4a6cf7',
              mb: 4,
              textAlign: 'center'
            }}>
              Contact Us
            </Typography>
            
            <Box component="form" sx={{ mt: 4 }}>
              <TextField
                fullWidth
                label="Your Name"
                variant="outlined"
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                type="email"
                required
              />
              
              <TextField
                fullWidth
                label="Subject"
                variant="outlined"
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Message"
                variant="outlined"
                margin="normal"
                multiline
                rows={4}
                required
              />
              
              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 3,
                  backgroundColor: '#4a6cf7',
                  '&:hover': { backgroundColor: '#3a5bd9' },
                  padding: '12px 24px',
                  fontSize: '1rem'
                }}
              >
                Send Message
              </Button>
            </Box>
            
            <Box sx={{ mt: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Our Office
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Address:</strong> Cebu City, Cebu 6000
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> contact@skillable.com
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> (123) 456-7890
              </Typography>
            </Box>
          </Box>
        </Container>
      </div>
    </div>
  );
}

export default ContactPage;