// src/components/DarkModeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const DarkModeContext = createContext();

// Custom hook to use dark mode context
export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

// Provider component
export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    const savedMode = localStorage.getItem('teacherDarkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Check system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.style.backgroundColor = '#0f0f1a';
    } else {
      document.body.classList.remove('dark-mode');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('teacherDarkMode', newMode.toString());
  };

  // Get colors based on dark mode
  const getColors = () => {
    if (darkMode) {
      return {
        fontColor: "#ffffff",
        sidebarBgColor: "#1a1a2e",
        offWhiteColors: {
          background: "#0f0f1a",
          surface: "#1a1a2e",
          cardBg: "#1e1e34",
          modalBg: "#232340",
          subtleBg: "#161626",
        },
        gradientColors: {
          sidebarHeader: "#1a1a2e",
          cardGradient1: "rgba(30, 30, 52, 0.95)",
          cardGradient2: "rgba(26, 26, 46, 0.9)",
          modalGradient1: "rgba(35, 35, 64, 0.95)",
          modalGradient2: "rgba(26, 26, 46, 0.9)",
        }
      };
    } else {
      return {
        fontColor: "#280b60",
        sidebarBgColor: "#F1F6F9",
        offWhiteColors: {
          background: "#f8fafc",
          surface: "#ffffff",
          cardBg: "#fefefe",
          modalBg: "#fcfcfc",
          subtleBg: "#f9f9f9",
        },
        gradientColors: {
          sidebarHeader: "#F1F6F9",
          cardGradient1: "rgba(254, 254, 254, 0.95)",
          cardGradient2: "rgba(249, 249, 249, 0.9)",
          modalGradient1: "rgba(252, 252, 252, 0.95)",
          modalGradient2: "rgba(248, 250, 252, 0.9)",
        }
      };
    }
  };

  const colors = getColors();

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode, colors }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Export context for direct access if needed
export default DarkModeContext;