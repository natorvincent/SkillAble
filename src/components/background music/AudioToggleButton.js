// src/components/AudioToggleButton.js
import React from 'react';
import { Box, Button } from '@mui/material';
import { globalAudioManager } from '../background music/GlobalAudioManager';

const AudioToggleButton = ({ audioPlaying, toggleAudio, top = 100, right = 20, showDebug = false }) => {
  return (
    <Box sx={{ 
      position: 'fixed',
      top: top,
      right: right,
      zIndex: 1000
    }}>
      <Button
        onClick={toggleAudio}
        sx={{
          minWidth: '60px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: audioPlaying 
            ? 'linear-gradient(135deg, #90BE6D 0%, #7BA05B 100%)'
            : 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
          color: 'white',
          fontSize: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
          }
        }}
      >
        {audioPlaying ? '🔊' : '🔇'}
      </Button>
      
      {/* Debug info - only show in development */}
      {showDebug && process.env.NODE_ENV === 'development' && (
        <Box sx={{
          position: 'absolute',
          top: '70px',
          right: '0',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          minWidth: '200px'
        }}>
          <div>Playing: {audioPlaying ? 'Yes' : 'No'}</div>
          <div>Active Pages: {globalAudioManager?.getDebugInfo?.()?.activePagesCount || 0}</div>
        </Box>
      )}
    </Box>
  );
};

export default AudioToggleButton;