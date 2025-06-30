// src/hooks/useGlobalBackgroundMusic.js
import { useState, useEffect, useRef } from 'react';
import { globalAudioManager } from '../background music/GlobalAudioManager';

export const useGlobalBackgroundMusic = (musicFile, pageId = null) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const pageIdRef = useRef(pageId || `page-${Date.now()}-${Math.random()}`);
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    const currentPageId = pageIdRef.current;
    
    // Initialize audio
    globalAudioManager.initialize(musicFile);
    
    // Register this page immediately
    globalAudioManager.registerPage(currentPageId);
    
    // Set initial state
    setAudioPlaying(globalAudioManager.getIsPlaying());

    // Subscribe to audio state changes
    const unsubscribe = globalAudioManager.subscribe((isPlaying) => {
      setAudioPlaying(isPlaying);
    });

    // Only attempt to start music if this is the first initialization
    // and music isn't already playing
    if (!hasInitialized.current && !globalAudioManager.getIsPlaying()) {
      const timer = setTimeout(() => {
        globalAudioManager.autoPlay();
      }, 1000);
      
      hasInitialized.current = true;
      
      // Clean up timer on unmount
      return () => {
        clearTimeout(timer);
        unsubscribe();
        globalAudioManager.unregisterPage(currentPageId);
      };
    }

    // Cleanup function for subsequent runs (no music start attempt)
    return () => {
      unsubscribe();
      globalAudioManager.unregisterPage(currentPageId);
    };
  }, [musicFile]);

  const toggleAudio = () => {
    globalAudioManager.toggle();
  };

  return { audioPlaying, toggleAudio };
};