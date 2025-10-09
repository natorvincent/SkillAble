import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography, Tooltip } from '@mui/material';
import { Volume2, VolumeX, RotateCcw, Star, Home, Sparkles } from 'lucide-react';
import Navbar from '../Navbar';

// Import kitchen background
import kitchenBg from "../../assets/sortingLevel1/kitchen.jpg";

// Import kitchen item images
import cookingPotImg from "../../assets/cookingLevel4/cooking pot.png";
import plateImg from "../../assets/cookingLevel4/plate.png";
import riceCookerImg from "../../assets/cookingLevel4/rice cooker.png";
import shelfImg from "../../assets/cookingLevel4/shelf.png";
import sinkImg from "../../assets/cookingLevel4/sink.png";

// Progress service imports
import { 
  getStudentLessonProgress, 
  saveStudentLessonProgress,
  updateModuleProgress
} from '../../services/progressService';

export default function RiceCookingGame() {
  const navigate = useNavigate();
  const { moduleId, lessonId } = useParams();
  
  const [step, setStep] = useState(0);
  const [hasPot, setHasPot] = useState(false);
  const [hasRiceInPot, setHasRiceInPot] = useState(false);
  const [riceWashed, setRiceWashed] = useState(false);
  const [riceInCooker, setRiceInCooker] = useState(false);
  const [cookerPlugged, setCookerPlugged] = useState(false);
  const [cooking, setCooking] = useState(false);
  const [riceCooked, setRiceCooked] = useState(false);
  const [riceOnPlate, setRiceOnPlate] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showWater, setShowWater] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showSteam, setShowSteam] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cookingProgress, setCookingProgress] = useState(0);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const panRef = useRef(null);

  const steps = [
    { id: 0, icon: "🍳", title: "Get the Pot", description: "Drag the cooking pot from the shelf to the counter." },
    { id: 1, icon: "🌾", title: "Add Rice", description: "Drag rice container to add rice into the pot." },
    { id: 2, icon: "💧", title: "Wash Rice", description: "Drag pot with rice to the sink to wash it." },
    { id: 3, icon: "⚡", title: "Transfer to Cooker", description: "Drag washed rice to the rice cooker." },
    { id: 4, icon: "🔌", title: "Plug In", description: "Connect the plug to the power outlet." },
    { id: 5, icon: "▶️", title: "Start Cooking", description: "Click START button to begin cooking." },
    { id: 6, icon: "🍽️", title: "Serve Rice", description: "Drag cooked rice to the serving plate." }
  ];

  useEffect(() => {
    let interval;
    if (cooking) {
      interval = setInterval(() => {
        setCookingProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 2.5;
        });
      }, 100);
    } else {
      setCookingProgress(0);
    }
    return () => clearInterval(interval);
  }, [cooking]);

  const saveProgress = async () => {
    if (progressSaving || progressSaved) return;
    setProgressSaving(true);
    setTimeout(() => {
      setProgressSaved(true);
      setProgressSaving(false);
    }, 1000);
  };

  const playDingSound = () => {
    if (soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      } catch (e) {
        console.log('Audio not available');
      }
    }
  };

  const triggerFeedback = () => {
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 800);
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, zone) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredZone(zone);
  };

  const handleDragLeave = () => {
    setHoveredZone(null);
  };

  const handleDrop = (e, target) => {
    e.preventDefault();
    setHoveredZone(null);
    
    if (step === 0 && draggedItem === 'empty-pot' && target === 'counter') {
      setHasPot(true);
      setStep(1);
      playDingSound();
      triggerFeedback();
    }
    else if (step === 1 && draggedItem === 'rice-container' && target === 'pot') {
      setHasRiceInPot(true);
      setStep(2);
      playDingSound();
      triggerFeedback();
    }
    else if (step === 2 && draggedItem === 'pot-with-rice' && target === 'sink') {
      setShowWater(true);
      playDingSound();
      triggerFeedback();
      setTimeout(() => setShowSparkles(true), 1000);
      setTimeout(() => {
        setRiceWashed(true);
        setShowWater(false);
        setShowSparkles(false);
        setStep(3);
        playDingSound();
        triggerFeedback();
      }, 3000);
    }
    else if (step === 3 && draggedItem === 'washed-rice' && target === 'rice-cooker') {
      setRiceInCooker(true);
      setStep(4);
      playDingSound();
      triggerFeedback();
    }
    else if (step === 4 && draggedItem === 'plug' && target === 'outlet') {
      setCookerPlugged(true);
      setStep(5);
      playDingSound();
      triggerFeedback();
    }
    else if (step === 6 && draggedItem === 'cooked-rice' && target === 'plate') {
      setRiceOnPlate(true);
      playDingSound();
      triggerFeedback();
      setTimeout(() => {
        setShowSuccess(true);
        saveProgress();
      }, 500);
    }
    
    setDraggedItem(null);
  };

  const handleCookButtonClick = () => {
    if (step === 5) {
      setCooking(true);
      setShowSteam(true);
      playDingSound();
      triggerFeedback();
      
      setTimeout(() => {
        setRiceCooked(true);
        setCooking(false);
        setShowSteam(false);
        setStep(6);
        playDingSound();
        triggerFeedback();
      }, 4000);
    }
  };

  const resetGame = () => {
    setStep(0);
    setHasPot(false);
    setHasRiceInPot(false);
    setRiceWashed(false);
    setRiceInCooker(false);
    setCookerPlugged(false);
    setCooking(false);
    setRiceCooked(false);
    setRiceOnPlate(false);
    setShowWater(false);
    setShowSparkles(false);
    setShowSteam(false);
    setShowSuccess(false);
    setCookingProgress(0);
    setProgressSaved(false);
    setHoveredZone(null);
    setShowFeedback(false);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: kitchenBg ? `url(${kitchenBg})` : 'linear-gradient(135deg, #FAF8F5 0%, #FFFEF9 50%, #F5F3EE 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <Box sx={{ 
        position: 'relative', 
        zIndex: 2,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Navbar />
        
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px',
          paddingBottom: '80px'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            fontFamily: "'Arial', sans-serif"
          }}>
            <style>{`
              @keyframes gentleFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
              }
              @keyframes softPulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.08); opacity: 0.95; }
              }
              @keyframes waterDrip {
                0% { transform: translateY(0); opacity: 0.8; }
                100% { transform: translateY(40px); opacity: 0; }
              }
              @keyframes steamFloat {
                0% { transform: translateY(0) scale(0.9); opacity: 0.6; }
                100% { transform: translateY(-50px) scale(1.2); opacity: 0; }
              }
              @keyframes sparkleShine {
                0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
              }
              @keyframes activeGlow {
                0%, 100% { box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3); }
                50% { box-shadow: 0 0 0 6px rgba(76, 175, 80, 0.6); }
              }
              @keyframes successBounce {
                0% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.15); }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes feedbackSparkle {
                0% { transform: scale(0) rotate(0deg); opacity: 0; }
                50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
                100% { transform: scale(0) rotate(360deg); opacity: 0; }
              }
              .draggable-item {
                cursor: grab;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }
              .draggable-item:hover {
                transform: translateY(-10px) scale(1.1);
                filter: drop-shadow(0 12px 24px rgba(0,0,0,0.2));
              }
              .draggable-item:active {
                cursor: grabbing;
                transform: scale(0.95);
              }
            `}</style>

            {/* Header with Progress */}
            <div style={{
              textAlign: 'center',
              marginBottom: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '16px 24px',
              borderRadius: '20px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(10px)'
            }}>
              <h1 style={{
                fontSize: 'clamp(24px, 3.5vw, 36px)', 
                fontWeight: '700', 
                color: '#2C3E50',
                margin: '0 0 12px 0',
                letterSpacing: '-0.5px'
              }}>
                🍚 Rice Cooking Game
              </h1>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                marginTop: '12px'
              }}>
                {[...Array(7)].map((_, i) => (
                  <div key={i} style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: i <= step ? '#4CAF50' : '#E0E0E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      boxShadow: i === step ? '0 0 0 4px rgba(76, 175, 80, 0.2)' : 'none'
                    }}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    {i < 6 && (
                      <div style={{
                        position: 'absolute',
                        left: '100%',
                        top: '50%',
                        width: '20px',
                        height: '3px',
                        backgroundColor: i < step ? '#4CAF50' : '#E0E0E0',
                        transform: 'translateY(-50%)',
                        transition: 'all 0.3s ease'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr 260px',
              gap: '16px',
              alignItems: 'start'
            }}>
              
              {/* LEFT: Instructions Panel */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                position: 'sticky',
                top: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#2C3E50',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={22} color="#FF8C42" />
                  Instructions
                </h3>
                
                {steps.map((s, idx) => (
                  <div key={s.id} style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '12px',
                    backgroundColor: step === idx ? '#E8F5E9' : step > idx ? '#F5F5F5' : 'white',
                    border: step === idx ? '3px solid #4CAF50' : '2px solid #E0E0E0',
                    transition: 'all 0.3s ease',
                    transform: step === idx ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: step === idx ? '0 4px 12px rgba(76, 175, 80, 0.2)' : 'none'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: step === idx ? '6px' : '0'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        filter: step > idx ? 'grayscale(100%)' : 'none',
                        opacity: step > idx ? 0.5 : 1
                      }}>
                        {step > idx ? '✅' : s.icon}
                      </div>
                      <div style={{
                        flex: 1,
                        fontSize: '13px',
                        fontWeight: '700',
                        color: step === idx ? '#2E7D32' : step > idx ? '#9E9E9E' : '#333'
                      }}>
                        {s.title}
                      </div>
                    </div>
                    {step === idx && (
                      <div style={{
                        fontSize: '11px',
                        color: '#666',
                        lineHeight: 1.4,
                        paddingLeft: '34px'
                      }}>
                        {s.description}
                      </div>
                    )}
                  </div>
                ))}

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #E0E0E0' }}>
                  <button onClick={() => setSoundEnabled(!soundEnabled)} style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: soundEnabled ? '#4CAF50' : '#9E9E9E',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    Sound {soundEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>

              {/* CENTER: Main Activity Area */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.92)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                minHeight: '560px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}>
                {/* Kitchen Items Display */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  marginBottom: '30px'
                }}>
                  {/* POWER OUTLET */}
                  <div 
                    onDragOver={(e) => handleDragOver(e, 'outlet')} 
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'outlet')}
                    style={{
                      width: '140px',
                      height: '190px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      backgroundColor: hoveredZone === 'outlet' || step === 4 ? 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)' : 'white',
                      background: hoveredZone === 'outlet' || step === 4 ? 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      animation: step === 4 ? 'activeGlow 2s infinite' : 'none',
                      border: step === 4 ? '3px solid #4CAF50' : '2px solid rgba(0,0,0,0.08)',
                      boxShadow: step === 4 ? '0 8px 24px rgba(76, 175, 80, 0.3), inset 0 2px 4px rgba(255,255,255,0.5)' : '0 4px 12px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.5)',
                      position: 'relative'
                    }}
                  >
                    {showFeedback && step === 4 && (
                      <Sparkles style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: '#FFD700',
                        animation: 'feedbackSparkle 0.8s ease-out'
                      }} />
                    )}
                    <svg width="70" height="90" viewBox="0 0 80 100">
                      <rect x="10" y="20" width="60" height="70" fill="#F5F5F5" rx="4"/>
                      <rect x="10" y="20" width="60" height="70" fill="none" stroke="#E0E0E0" strokeWidth="2" rx="4"/>
                      <rect x="30" y="45" width="8" height="15" fill="#4A4A4A" rx="2"/>
                      <rect x="42" y="45" width="8" height="15" fill="#4A4A4A" rx="2"/>
                      <circle cx="40" cy="68" r="4" fill="#4A4A4A"/>
                    </svg>

                    {step >= 4 && !cookerPlugged && (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'plug')}
                        className="draggable-item"
                        style={{
                          animation: step === 4 ? 'gentleFloat 2s infinite ease-in-out' : 'none'
                        }}
                      >
                        <svg width="60" height="40" viewBox="0 0 70 50">
                          <path d="M 35 0 Q 35 10, 35 15" stroke="#2A2A2A" strokeWidth="4" fill="none" strokeLinecap="round"/>
                          <rect x="15" y="15" width="40" height="30" fill="#2A2A2A" rx="5"/>
                          <rect x="28" y="40" width="6" height="10" fill="#404040" rx="1"/>
                          <rect x="36" y="40" width="6" height="10" fill="#404040" rx="1"/>
                        </svg>
                      </div>
                    )}

                    {cookerPlugged && (
                      <div style={{
                        fontSize: '13px',
                        color: '#4CAF50',
                        fontWeight: '700'
                      }}>
                        ✓ Connected
                      </div>
                    )}
                  </div>

                  {/* RICE COOKER */}
                  <div
                    onDragOver={(e) => handleDragOver(e, 'rice-cooker')} 
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'rice-cooker')}
                    style={{
                      width: '180px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: hoveredZone === 'rice-cooker' || step === 3 || step === 5 ? '#FFF3E0' : 'white',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      animation: (step === 3 || step === 5) ? 'activeGlow 2s infinite' : 'none',
                      border: (step === 3 || step === 5) ? '3px solid #4CAF50' : '2px solid #E0E0E0',
                      boxShadow: (step === 3 || step === 5) ? '0 8px 24px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    {showFeedback && (step === 3 || step === 5) && (
                      <Sparkles style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: '#FFD700',
                        animation: 'feedbackSparkle 0.8s ease-out'
                      }} />
                    )}
                    <img 
                      src={riceCookerImg} 
                      alt="Rice Cooker" 
                      style={{
                        width: '130px',
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                      }}
                    />

                    {riceInCooker && !riceCooked && (
                      <div style={{
                        position: 'absolute',
                        top: '45px',
                        fontSize: '28px',
                        animation: showFeedback ? 'successBounce 0.5s ease-out' : 'none'
                      }}>🌾</div>
                    )}

                    {riceCooked && !riceOnPlate && (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'cooked-rice')}
                        className="draggable-item"
                        style={{
                          position: 'absolute',
                          top: '45px',
                          fontSize: '32px',
                          animation: step === 6 ? 'gentleFloat 2s infinite ease-in-out' : 'none'
                        }}
                      >
                        🍚
                      </div>
                    )}

                    {showSteam && (
                      <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)' }}>
                        {[...Array(3)].map((_, i) => (
                          <span key={i} style={{
                            position: 'absolute',
                            left: `${i * 20 - 20}px`,
                            fontSize: '24px',
                            animation: `steamFloat 2s infinite ${i * 0.4}s`
                          }}>💨</span>
                        ))}
                      </div>
                    )}

                    {cookerPlugged && step === 5 && (
                      <button
                        onClick={handleCookButtonClick}
                        style={{
                          position: 'absolute',
                          bottom: '15px',
                          padding: '10px 24px',
                          fontSize: '14px',
                          fontWeight: '700',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '24px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(76,175,80,0.4)',
                          animation: 'softPulse 1.5s infinite',
                          transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        START COOKING
                      </button>
                    )}

                    {cooking && (
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '20%',
                        width: '60%',
                        height: '6px',
                        backgroundColor: '#E0E0E0',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${cookingProgress}%`,
                          height: '100%',
                          backgroundColor: '#4CAF50',
                          transition: 'width 0.1s'
                        }} />
                      </div>
                    )}
                  </div>

                  {/* SINK */}
                  <div
                    onDragOver={(e) => handleDragOver(e, 'sink')} 
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'sink')}
                    style={{
                      width: '190px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: hoveredZone === 'sink' || step === 2 ? '#FFF3E0' : 'white',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      animation: step === 2 ? 'activeGlow 2s infinite' : 'none',
                      border: step === 2 ? '3px solid #4CAF50' : '2px solid #E0E0E0',
                      boxShadow: step === 2 ? '0 8px 24px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    {showFeedback && step === 2 && (
                      <Sparkles style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: '#FFD700',
                        animation: 'feedbackSparkle 0.8s ease-out'
                      }} />
                    )}
                    <img 
                      src={sinkImg} 
                      alt="Sink" 
                      style={{
                        width: '170px',
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
                      }}
                    />

                    {showWater && (
                      <div style={{ position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)' }}>
                        {[...Array(5)].map((_, i) => (
                          <div key={i} style={{
                            position: 'absolute',
                            left: `${i * 6 - 12}px`,
                            width: '4px',
                            height: '30px',
                            backgroundColor: '#81D4FA',
                            borderRadius: '2px',
                            animation: `waterDrip 0.7s infinite ${i * 0.1}s`,
                            opacity: 0.9
                          }} />
                        ))}
                      </div>
                    )}

                    {showSparkles && (
                      <div style={{
                        position: 'absolute',
                        bottom: '50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '10px'
                      }}>
                        {[...Array(3)].map((_, i) => (
                          <span key={i} style={{
                            fontSize: '22px',
                            animation: `sparkleShine 1s infinite ${i * 0.2}s`
                          }}>✨</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* COUNTER WORKSPACE */}
                  <div
                    onDragOver={(e) => handleDragOver(e, step === 0 ? 'counter' : 'pot')} 
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, step === 0 ? 'counter' : 'pot')}
                    style={{
                      width: '160px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: hoveredZone === 'counter' || hoveredZone === 'pot' || step === 0 || step === 1 ? '#FFF3E0' : 'white',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      animation: (step === 0 || step === 1) ? 'activeGlow 2s infinite' : 'none',
                      border: (step === 0 || step === 1) ? '3px solid #4CAF50' : '2px solid #E0E0E0',
                      boxShadow: (step === 0 || step === 1) ? '0 8px 24px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    {showFeedback && (step === 0 || step === 1) && (
                      <Sparkles style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: '#FFD700',
                        animation: 'feedbackSparkle 0.8s ease-out'
                      }} />
                    )}
                    
                    <svg width="130" height="150" viewBox="0 0 140 160">
                      <rect x="10" y="100" width="120" height="60" fill="#F8F6F3" rx="4"/>
                      <rect x="10" y="100" width="120" height="8" fill="#E8E5E0" rx="2"/>
                    </svg>

                    {!hasPot && step === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        animation: 'softPulse 1.5s infinite'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '8px', animation: 'gentleFloat 2s infinite ease-in-out' }}>⬇</div>
                        <div style={{ fontSize: '12px', color: '#4CAF50', fontWeight: '700' }}>
                          Drop pot here
                        </div>
                      </div>
                    )}

                    {hasPot && !hasRiceInPot && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        animation: showFeedback ? 'successBounce 0.5s ease-out' : 'none',
                        width: '70px'
                      }}>
                        <img 
                          src={cookingPotImg} 
                          alt="Cooking Pot" 
                          style={{
                            width: '100%',
                            height: 'auto',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
                          }}
                        />
                      </div>
                    )}

                    {hasRiceInPot && !riceWashed && (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'pot-with-rice')}
                        className="draggable-item"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          animation: step === 2 ? 'gentleFloat 2s infinite ease-in-out' : 'none',
                          width: '70px'
                        }}
                      >
                        <img 
                          src={cookingPotImg} 
                          alt="Pot with Rice" 
                          style={{
                            width: '100%',
                            height: 'auto',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '28px'
                        }}>🌾</div>
                      </div>
                    )}

                    {riceWashed && step === 3 && (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'washed-rice')}
                        className="draggable-item"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          animation: 'gentleFloat 2s infinite ease-in-out',
                          width: '70px'
                        }}
                      >
                        <img 
                          src={cookingPotImg} 
                          alt="Washed Rice" 
                          style={{
                            width: '100%',
                            height: 'auto',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '28px'
                        }}>🌾✨</div>
                      </div>
                    )}
                  </div>

                  {/* SERVING PLATE */}
                  <div
                    onDragOver={(e) => handleDragOver(e, 'plate')} 
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'plate')}
                    style={{
                      width: '140px',
                      height: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: hoveredZone === 'plate' || step === 6 ? '#FFF3E0' : 'white',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      animation: step === 6 ? 'activeGlow 2s infinite' : 'none',
                      border: step === 6 ? '3px solid #4CAF50' : '2px solid #E0E0E0',
                      boxShadow: step === 6 ? '0 8px 24px rgba(76, 175, 80, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    {showFeedback && step === 6 && (
                      <Sparkles style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: '#FFD700',
                        animation: 'feedbackSparkle 0.8s ease-out'
                      }} />
                    )}
                    <img 
                      src={plateImg} 
                      alt="Plate" 
                      style={{
                        width: '110px',
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                      }}
                    />

                    {!riceOnPlate && step === 6 && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        animation: 'softPulse 1.5s infinite'
                      }}>
                        <div style={{ fontSize: '42px', marginBottom: '5px', animation: 'gentleFloat 2s infinite ease-in-out' }}>⬇</div>
                        <div style={{ fontSize: '11px', color: '#4CAF50', fontWeight: '700' }}>
                          Serve here
                        </div>
                      </div>
                    )}

                    {riceOnPlate && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '52px',
                        animation: 'successBounce 0.5s ease-out'
                      }}>
                        🍚
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT: Available Items Panel */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                position: 'sticky',
                top: '20px',
                backdropFilter: 'blur(10px)'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#2C3E50',
                  margin: '0 0 16px 0'
                }}>
                  🛠️ Available Items
                </h3>

                {/* Shelf with Items */}
                <div style={{
                  background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '14px',
                  border: '2px dashed #B0BEC5',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#666'
                  }}>
                    Shelf
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    minHeight: '140px'
                  }}>
                    <img 
                      src={shelfImg} 
                      alt="Shelf" 
                      style={{
                        width: '100%',
                        maxWidth: '120px',
                        height: 'auto',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
                      }}
                    />
                    
                    {!hasPot && (
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'empty-pot')}
                        className="draggable-item"
                        style={{
                          position: 'absolute',
                          top: '70px',
                          animation: step === 0 ? 'gentleFloat 2s infinite ease-in-out' : 'none',
                          width: '60px'
                        }}
                      >
                        <img 
                          src={cookingPotImg} 
                          alt="Cooking Pot" 
                          style={{
                            width: '100%',
                            height: 'auto',
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                          }}
                        />
                      </div>
                    )}
                    
                    {step >= 1 && !hasRiceInPot && (
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'rice-container')}
                        className="draggable-item"
                        style={{
                          position: 'absolute',
                          top: '20px',
                          animation: step === 1 ? 'gentleFloat 2s infinite ease-in-out' : 'none'
                        }}
                      >
                        <svg width="45" height="50" viewBox="0 0 50 55">
                          <rect x="5" y="8" width="40" height="45" fill="#C4A574" rx="3"/>
                          <rect x="5" y="8" width="40" height="6" fill="#D4B584" rx="2"/>
                          <rect x="10" y="18" width="30" height="22" fill="#F5E6D3" rx="2"/>
                          <text x="25" y="32" textAnchor="middle" fill="#8B7355" fontSize="10" fontWeight="bold" fontFamily="Arial">RICE</text>
                          <circle cx="15" cy="24" r="1.5" fill="#F0F0F0"/>
                          <circle cx="20" cy="26" r="1.5" fill="#F0F0F0"/>
                          <circle cx="18" cy="22" r="1.5" fill="#F0F0F0"/>
                          <circle cx="30" cy="24" r="1.5" fill="#F0F0F0"/>
                          <circle cx="35" cy="26" r="1.5" fill="#F0F0F0"/>
                          <circle cx="32" cy="22" r="1.5" fill="#F0F0F0"/>
                          <path d="M 5 8 L 5 3 Q 25 0, 45 3 L 45 8" fill="#B49464"/>
                          <ellipse cx="25" cy="3" rx="20" ry="3" fill="#A08454"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Tips */}
                <div style={{
                  backgroundColor: '#E3F2FD',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '13px',
                  color: '#1565C0',
                  lineHeight: 1.6
                }}>
                  <div style={{ fontWeight: '700', marginBottom: '8px' }}>💡 Tip:</div>
                  <div>Drag and drop items to the highlighted areas. Follow the instructions on the left to complete each step!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Action Bar */}
          <Box sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            borderTop: '2px solid #E0E0E0',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
            zIndex: 50
          }}>
            <Button
              onClick={resetGame}
              variant="contained"
              startIcon={<RotateCcw size={20} />}
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '12px',
                fontSize: '15px',
                padding: '12px 28px',
                textTransform: 'none',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                '&:hover': { 
                  backgroundColor: '#45A049',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Reset Game
            </Button>
            
            <Button
              onClick={() => navigate('/homepage')}
              variant="contained"
              startIcon={<Home size={20} />}
              sx={{
                backgroundColor: '#F44336',
                color: 'white',
                borderRadius: '12px',
                fontSize: '15px',
                padding: '12px 28px',
                textTransform: 'none',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                '&:hover': { 
                  backgroundColor: '#E53935',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Exit to Home
            </Button>

            {riceOnPlate && (
              <Button
                onClick={() => navigate('/lesson/cooking/level-5')}
                variant="contained"
                sx={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '15px',
                  padding: '12px 28px',
                  textTransform: 'none',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  '&:hover': { 
                    backgroundColor: '#1E88E5',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Next Level →
              </Button>
            )}
          </Box>

          {/* Success Modal */}
          {showSuccess && (
            <div style={{
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.6)', 
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'center', 
              zIndex: 1000,
              backdropFilter: 'blur(5px)'
            }}>
              <div style={{
                backgroundColor: '#FFFFFF', 
                borderRadius: '24px', 
                padding: '48px',
                maxWidth: '480px', 
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                animation: 'successBounce 0.6s ease-out'
              }}>
                <div style={{ 
                  fontSize: '96px', 
                  marginBottom: '20px',
                  animation: 'gentleFloat 2s infinite ease-in-out'
                }}>
                  🏆
                </div>
                
                <h2 style={{
                  color: '#2C3E50', 
                  fontSize: '36px', 
                  margin: '0 0 16px 0',
                  fontWeight: '700'
                }}>Congratulations!</h2>
                
                <div style={{
                  display: 'flex', 
                  justifyContent: 'center', 
                  marginBottom: '24px', 
                  gap: '8px'
                }}>
                  {[...Array(3)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={40} 
                      fill="#FFD54F" 
                      color="#FFC107"
                      style={{
                        animation: `successBounce 0.6s ease-out ${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
                
                <p style={{
                  fontSize: '20px', 
                  color: '#666', 
                  lineHeight: 1.6,
                  marginBottom: '32px'
                }}>
                  You successfully cooked delicious rice!<br/>
                  Perfect job following all the steps! 🍚
                </p>

                {progressSaving && (
                  <Box sx={{ mb: 3, color: '#2196F3' }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body1" component="span" fontWeight="600">Saving progress...</Typography>
                  </Box>
                )}
                
                {progressSaved && (
                  <Box sx={{ mb: 3, color: '#4CAF50' }}>
                    <Typography variant="body1" fontWeight="600">✓ Progress saved successfully!</Typography>
                  </Box>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Button 
                    onClick={() => navigate('/lesson/cooking/level-5')}
                    variant="contained"
                    sx={{ 
                      backgroundColor: '#4CAF50',
                      borderRadius: '12px',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                      '&:hover': { 
                        backgroundColor: '#45A049',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)'
                      }
                    }}
                  >
                    Next Level
                  </Button>
                  
                  <Button
                    onClick={resetGame}
                    variant="outlined"
                    sx={{ 
                      borderColor: '#4CAF50',
                      color: '#4CAF50',
                      borderWidth: '2px',
                      borderRadius: '12px',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: '700',
                      '&:hover': {
                        borderWidth: '2px',
                        borderColor: '#45A049',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Play Again
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Box>
      </Box>
    </div>
  );
}