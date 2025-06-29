import React from 'react';
import { Box, Typography, Container, Avatar } from '@mui/material';
import Navbar from './Navbar';
import Background from './Background';

function AboutUsPage() {
  const teamMembers = [
    { name: "Ezzel Jan Francisco" },
    { name: "Ragelo John C. Gare" },
    { name: "Vincent Nino G. Nator" },
    { name: "Raven King O. Pavo" },
    { name: "Claire Andrea S. Saniel" }
  ];

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
        <Container maxWidth="md" sx={{ 
          paddingTop: 8, 
          paddingBottom: 8,
          color: '#fff',
          textAlign: 'center'
        }}>
          <Typography variant="h3" component="h1" sx={{ 
            fontWeight: 700,
            color: '#FF595E',
            mb: 4,
            textAlign: 'center',
            fontFamily: 'Poppins, sans-serif'
          }}>
            About Skillable
          </Typography>
          
          <Typography variant="h4" component="h2" sx={{ 
            fontWeight: 600,
            color: '#FF595E',
            mb: 3,
            fontFamily: 'Poppins, sans-serif',
            textAlign: 'left'
          }}>
            Our Mission
          </Typography>
          
          <Typography variant="body1" sx={{ 
            mb: 5, 
            lineHeight: 1.8,
            fontSize: '1.1rem',
            textAlign: 'left',
            fontFamily: 'Inter, sans-serif'
          }}>
            At Skillable, we are committed to revolutionizing special education through technology. 
            Our life skills e-learning platform is specifically designed to empower SPED students 
            with Autism Spectrum Disorder (ASD) and Down Syndrome by providing an interactive, 
            gamified learning experience that bridges the gap between theoretical knowledge and 
            practical application.
            <br /><br />
            We address the unique challenges these students face in learning essential daily life 
            skills—such as personal hygiene, cooking, and time management—through a structured, 
            technology-driven approach that incorporates multi-sensory learning techniques. Our 
            platform combines visual guides, interactive tasks, and adaptive learning paths to 
            create an engaging environment that promotes independence and self-sufficiency.
            <br /><br />
            Beyond just education, we aim to build confidence and foster real-world application 
            of these crucial skills, making learning both effective and enjoyable for students 
            with diverse cognitive needs.
          </Typography>
          
          <Typography variant="h4" component="h2" sx={{ 
            fontWeight: 600,
            color: '#FF595E',
            mb: 4,
            fontFamily: 'Poppins, sans-serif'
          }}>
            Our Team
          </Typography>
          
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
            mb: 6
          }}>
            {teamMembers.map((member, index) => (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    bgcolor: '#4a6cf7',
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif'
                }}>
                  {member.name}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            color: '#FF595E',
            mb: 2,
            fontFamily: 'Poppins, sans-serif'
          }}>
            Adviser
          </Typography>
          <Typography variant="body1" sx={{ 
            fontFamily: 'Inter, sans-serif',
            mb: 4
          }}>
            Jensar Joey Z. Sayson
          </Typography>
        </Container>
      </div>
    </div>
  );
}

export default AboutUsPage;