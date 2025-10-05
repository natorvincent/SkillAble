// src/hooks/useGlobalBackgroundMusic.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { globalAudioManager } from '../background music/GlobalAudioManager';

export const useGlobalBackgroundMusic = (musicFile, pageId = null) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const pageIdRef = useRef(pageId || `page-${Date.now()}-${Math.random()}`);
  const hasInitialized = useRef(false);
  
  // Use useCallback to stabilize the toggle function
  const toggleAudio = useCallback(() => {
    globalAudioManager.toggle();
  }, []);

  useEffect(() => {
    const currentPageId = pageIdRef.current;
    
    console.log(`Initializing audio for page: ${currentPageId}`);
    
    // Initialize audio
    globalAudioManager.initialize(musicFile);
    globalAudioManager.registerPage(currentPageId);
    
    // Set initial audio state
    setAudioPlaying(globalAudioManager.getIsPlaying());

    // Subscribe to audio state changes
    const unsubscribe = globalAudioManager.subscribe((isPlaying) => {
      setAudioPlaying(isPlaying);
    });

    // Auto-play logic - only run once
    if (!hasInitialized.current && !globalAudioManager.getIsPlaying()) {
      const timer = setTimeout(() => {
        console.log(`Auto-playing audio for page: ${currentPageId}`);
        globalAudioManager.autoPlay();
      }, 1000);
      
      hasInitialized.current = true;
      
      return () => {
        console.log(`Cleaning up auto-play for page: ${currentPageId}`);
        clearTimeout(timer);
        unsubscribe();
        globalAudioManager.unregisterPage(currentPageId);
      };
    }

    // Cleanup function
    return () => {
      console.log(`Unregistering page: ${currentPageId}`);
      unsubscribe();
      globalAudioManager.unregisterPage(currentPageId);
    };
  }, [musicFile]); // Only depend on musicFile, remove other dependencies

  return { audioPlaying, toggleAudio };
};