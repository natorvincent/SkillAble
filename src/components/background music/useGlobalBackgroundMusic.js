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
    
    globalAudioManager.registerPage(currentPageId);
    
    setAudioPlaying(globalAudioManager.getIsPlaying());

    const unsubscribe = globalAudioManager.subscribe((isPlaying) => {
      setAudioPlaying(isPlaying);
    });
    if (!hasInitialized.current && !globalAudioManager.getIsPlaying()) {
      const timer = setTimeout(() => {
        globalAudioManager.autoPlay();
      }, 1000);
      
      hasInitialized.current = true;
      
      return () => {
        clearTimeout(timer);
        unsubscribe();
        globalAudioManager.unregisterPage(currentPageId);
      };
    }

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