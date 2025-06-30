// src/utils/GlobalAudioManager.js
class GlobalAudioManager {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.volume = 0.3;
    this.listeners = new Set();
    this.activePagesWithMusic = new Set();
    this.currentMusicFile = null;
    this.stopTimer = null; // Timer for delayed stop
    this.isUserPaused = false; // Track if user manually paused
  }

  initialize(musicFile) {
    if (!this.audio || this.currentMusicFile !== musicFile) {
      // Stop current audio if switching to different music file
      if (this.audio) {
        this.audio.pause();
        this.audio = null;
      }
      
      this.audio = new Audio(musicFile);
      this.currentMusicFile = musicFile;
      this.audio.loop = true;
      this.audio.volume = this.volume;
      
      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.isUserPaused = false;
        this.notifyListeners();
      });
      
      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notifyListeners();
      });
    }
  }

  // Register a page as having music
  registerPage(pageId) {
    this.activePagesWithMusic.add(pageId);
    
    // Cancel any pending stop timer since we have an active page
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    
    console.log(`Page registered: ${pageId}. Active pages: ${this.activePagesWithMusic.size}`);
  }

  // Unregister a page with smooth transition handling
  unregisterPage(pageId) {
    this.activePagesWithMusic.delete(pageId);
    console.log(`Page unregistered: ${pageId}. Active pages: ${this.activePagesWithMusic.size}`);
    
    // Only set timer if no pages are active and music is currently playing
    if (this.activePagesWithMusic.size === 0 && this.isPlaying) {
      // Clear any existing timer
      if (this.stopTimer) {
        clearTimeout(this.stopTimer);
      }
      
      // Set a timer to stop music after a delay
      this.stopTimer = setTimeout(() => {
        // Double-check that no pages registered during the delay
        if (this.activePagesWithMusic.size === 0) {
          this.pause();
          console.log('Music stopped - no active pages with music');
        }
        this.stopTimer = null;
      }, 300); // 300ms delay for smooth transitions
    }
  }

  // Check if any pages with music are currently active
  hasActiveMusicPages() {
    return this.activePagesWithMusic.size > 0;
  }

  play() {
    if (this.audio && !this.isPlaying) {
      this.audio.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  }

  pause() {
    if (this.audio && this.isPlaying) {
      this.audio.pause();
      this.isUserPaused = true; // Mark as user-initiated pause
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      // Reset user paused flag when manually starting
      this.isUserPaused = false;
      this.play();
    }
  }

  // Auto-play logic that respects user preferences
  autoPlay() {
    // Only auto-play if user hasn't manually paused and we have active pages
    if (!this.isUserPaused && !this.isPlaying && this.hasActiveMusicPages()) {
      this.play();
    }
  }

  // Force stop (useful for manual stops or complete shutdown)
  stop() {
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isUserPaused = false;
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.audio) {
      this.audio.volume = volume;
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.isPlaying));
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  // Get debug info
  getDebugInfo() {
    return {
      isPlaying: this.isPlaying,
      isUserPaused: this.isUserPaused,
      activePagesCount: this.activePagesWithMusic.size,
      activePages: Array.from(this.activePagesWithMusic),
      currentMusicFile: this.currentMusicFile,
      hasStopTimer: !!this.stopTimer
    };
  }
}

export const globalAudioManager = new GlobalAudioManager();