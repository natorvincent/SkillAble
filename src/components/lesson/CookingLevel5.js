import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RotateCcw, CheckCircle, ArrowRight, ChefHat, Target, Clock, Lightbulb, X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import images for Level 5 cooking game
import forkImg from "../../assets/cookingLevel5/fork.png";
import friedEggWithGarnishImg from "../../assets/cookingLevel5/egg with garnish.png";
import spoonImg from "../../assets/cookingLevel5/spoon.png";
import riceImg from "../../assets/cookingLevel5/rice.png";

const CookingLevel5 = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [placedItems, setPlacedItems] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [justPlaced, setJustPlaced] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showOrderError, setShowOrderError] = useState(false);
  const [hoveredIngredient, setHoveredIngredient] = useState(null);
  const [draggingItemPos, setDraggingItemPos] = useState(null);
  const [showDropHint, setShowDropHint] = useState(false);
  const [selectedUtensil, setSelectedUtensil] = useState(null);
  const [showUtensilTip, setShowUtensilTip] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Color Scheme
  const colors = {
    primary: '#10b981', // Green
    accent: '#f59e0b',  // Orange
    neutral: '#6b7280',
    background: '#f8fafc',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    plate: '#e5e7eb',
    text: '#1f2937'
  };

  const foodItems = [
    { 
      id: 'rice', 
      img: riceImg, 
      name: 'Rice', 
      color: '#fef3c7', 
      tipIndex: 0, 
      isEssential: true, 
      scale: 3.5, 
      zIndex: 1, 
      icon: '🍚', 
      label: "Completed",
      quantity: '1 Bowl',
      description: 'Jasmine rice base'
    },
    { 
      id: 'egg', 
      img: friedEggWithGarnishImg, 
      name: 'Fried Egg with Garnish', 
      color: '#fed7aa', 
      tipIndex: 1, 
      isEssential: true, 
      scale: 4.0, 
      zIndex: 2, 
      icon: '🍳', 
      label: "Next Step",
      quantity: '1 Piece',
      description: 'Garnished with spring onions'
    }
  ];

  const toolItems = [
    { 
      id: 'spoon', 
      img: spoonImg, 
      name: 'Spoon', 
      color: '#e5e7eb', 
      tipIndex: 2, 
      isEssential: true, 
      scale: 2.0, 
      zIndex: 4, 
      icon: '🥄',
      tooltip: 'Use spoon to scoop rice'
    },
    { 
      id: 'fork', 
      img: forkImg, 
      name: 'Fork', 
      color: '#e5e7eb', 
      tipIndex: 2, 
      isEssential: true, 
      scale: 2.0, 
      zIndex: 4, 
      icon: '🍴',
      tooltip: 'Use fork for garnish'
    }
  ];

  const allItems = [...foodItems, ...toolItems];
  const allEssentialItems = allItems.filter(item => item.isEssential);

  const tips = [
    { 
      icon: '1️⃣', 
      text: 'Place rice in the center of the plate', 
      relatedItems: ['rice'], 
      step: 0,
      description: 'Start with a solid base'
    },
    { 
      icon: '2️⃣', 
      text: 'Add the fried egg with garnish on top', 
      relatedItems: ['egg'], 
      step: 1,
      description: 'Center the egg over rice'
    },
    { 
      icon: '3️⃣', 
      text: 'Place utensils on the sides', 
      relatedItems: ['spoon', 'fork'], 
      step: 2,
      description: 'Spoon on left, fork on right'
    }
  ];

  // Play sound effects
  const playSound = (type) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (type === 'place') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } else if (type === 'success') {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
        oscillator.frequency.exponentialRampToValueAtTime(523.25, audioContext.currentTime + 0.3); // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } else if (type === 'complete') {
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
          }, index * 100);
        });
      }
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  // Calculate optimal positions for centered plating
  const getOptimalPosition = (itemId, allPlacedItems) => {
    const plateCenter = { x: 50, y: 50 };
    
    if (Object.keys(allPlacedItems).length === 0) {
      return plateCenter;
    }

    if (itemId === 'rice') {
      return plateCenter;
    }

    if (itemId === 'egg' && allPlacedItems.rice) {
      return { x: plateCenter.x, y: plateCenter.y - 10 };
    }

    if (itemId === 'spoon') {
      return { x: 25, y: 70 };
    }
    if (itemId === 'fork') {
      return { x: 75, y: 70 };
    }

    return {
      x: plateCenter.x + (Math.random() - 0.5) * 10,
      y: plateCenter.y + (Math.random() - 0.5) * 10
    };
  };

  // Update current step based on placed items
  useEffect(() => {
    if (placedItems.rice && !placedItems.egg) setCurrentStep(1);
    else if (placedItems.rice && placedItems.egg) setCurrentStep(2);
    else setCurrentStep(0);
  }, [placedItems]);

  // Update completed steps
  useEffect(() => {
    const newCompletedSteps = [];
    if (placedItems.rice) newCompletedSteps.push(0);
    if (placedItems.egg) newCompletedSteps.push(1);
    if (placedItems.spoon && placedItems.fork) newCompletedSteps.push(2);
    setCompletedSteps(newCompletedSteps);
  }, [placedItems]);

  // Track dragging position for glow trail
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (draggedItem) {
        setDraggingItemPos({ x: e.clientX, y: e.clientY });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [draggedItem]);

  const handleDragStart = (e, item) => {
    if (placedItems[item.id]) return;
    
    if (item.id === 'egg' && !placedItems.rice) {
      e.preventDefault();
      setShowOrderError(true);
      setTimeout(() => setShowOrderError(false), 2000);
      return;
    }

    setDraggedItem(item);
    setShowDropHint(true);
    
    // Play drag start sound
    playSound('place');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleUtensilClick = (utensil) => {
    setSelectedUtensil(utensil);
    setShowUtensilTip(true);
    setTimeout(() => setShowUtensilTip(false), 3000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem || placedItems[draggedItem.id]) return;

    if (draggedItem.id === 'egg' && !placedItems.rice) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const optimalPosition = getOptimalPosition(draggedItem.id, placedItems);
    const finalPosition = draggedItem.isEssential ? optimalPosition : { x, y };

    const newPlacedItems = {
      ...placedItems,
      [draggedItem.id]: { 
        x: finalPosition.x, 
        y: finalPosition.y, 
        item: draggedItem 
      }
    };

    setPlacedItems(newPlacedItems);
    setJustPlaced(draggedItem.id);
    setDraggedItem(null);
    setShowDropHint(false);
    
    // Play success sound
    playSound('place');
    
    // Play success animation
    createSparkles(finalPosition.x, finalPosition.y);
    
    // Add bounce animation
    setTimeout(() => {
      createBounceAnimation(finalPosition.x, finalPosition.y);
    }, 100);

    // Check if all essential items (including utensils) are placed
    const allEssentialPlaced = allEssentialItems.every(item => newPlacedItems[item.id]);
    if (allEssentialPlaced) {
      setTimeout(() => {
        triggerConfetti();
        setShowSuccess(true);
        playSound('complete');
      }, 800);
    }
  };

  const createSparkles = (x, y) => {
    const newSparkles = [];
    for (let i = 0; i < 12; i++) {
      newSparkles.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 25,
        y: y + (Math.random() - 0.5) * 25,
        delay: Math.random() * 0.3,
        size: 16 + Math.random() * 16
      });
    }
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1200);
  };

  const createBounceAnimation = (x, y) => {
    const bounceEl = document.querySelector(`[data-item-id="${justPlaced}"]`);
    if (bounceEl) {
      bounceEl.style.animation = 'bounce 0.6s ease';
      setTimeout(() => {
        bounceEl.style.animation = '';
      }, 600);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleStartPlating = () => {
    const allEssentialPlaced = allEssentialItems.every(item => placedItems[item.id]);
    if (allEssentialPlaced) {
      triggerConfetti();
      setShowSuccess(true);
      playSound('complete');
    } else {
      playSound('success');
    }
  };

  const handleReset = () => {
    setPlacedItems({});
    setShowSuccess(false);
    setConfetti([]);
    setSparkles([]);
    setJustPlaced(null);
    setCurrentStep(0);
    setHoveredIngredient(null);
    setSelectedUtensil(null);
    setCompletedSteps([]);
    playSound('place');
  };

  const triggerConfetti = () => {
    const newConfetti = [];
    for (let i = 0; i < 80; i++) {
      newConfetti.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 2,
        rotation: Math.random() * 360,
        emoji: ['✨', '🎉', '⭐', '🎊', '🥳'][Math.floor(Math.random() * 5)]
      });
    }
    setConfetti(newConfetti);
  };

  const isTipCompleted = (tip) => {
    return tip.relatedItems.some(itemId => placedItems[itemId]);
  };

  const isItemAvailable = (item) => {
    if (placedItems[item.id]) return false;
    if (item.id === 'egg' && !placedItems.rice) return false;
    return true;
  };

  const allEssentialPlaced = allEssentialItems.every(item => placedItems[item.id]);
  const hasCompleteDish = placedItems.rice && placedItems.egg && placedItems.spoon && placedItems.fork;
  const areUtensilsEnabled = placedItems.rice && placedItems.egg;

  // Calculate progress percentage
  const progressPercentage = (completedSteps.length / tips.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height: '100vh'
    }}>
      
      {/* Header - Fixed at top */}
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: `2px solid ${colors.primary}20`,
        position: 'sticky',
        top: '20px',
        zIndex: 100,
        flexShrink: 0
      }}>
        {/* Background accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: `linear-gradient(135deg, ${colors.primary}08 0%, transparent 50%)`,
          pointerEvents: 'none'
        }} />
        
        <h2 style={{
          fontSize: 'clamp(20px, 2.5vw, 24px)',
          fontWeight: '900',
          color: colors.text,
          marginBottom: '16px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          letterSpacing: '-0.5px',
          flexWrap: 'wrap'
        }}>
          <ChefHat size={24} color={colors.primary} />
          <span>Level 5: Perfect Plating</span>
          <ChefHat size={24} color={colors.primary} />
        </h2>
        
        {/* Current Instruction */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.accent}, ${colors.warning})`,
          color: 'white',
          padding: '16px 20px',
          borderRadius: '14px',
          textAlign: 'center',
          boxShadow: `0 6px 24px ${colors.accent}40, 0 0 0 2px ${colors.accent}20`,
          position: 'relative',
          overflow: 'hidden',
          animation: 'slowPulse 3s infinite ease-in-out'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            right: '-50%',
            bottom: '-50%',
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%)',
            animation: 'glow 4s infinite alternate'
          }} />
          
          <div style={{ 
            fontSize: 'clamp(16px, 2vw, 20px)', 
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            position: 'relative',
            zIndex: 1,
            textShadow: '0 2px 8px rgba(0,0,0,0.2)',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '24px', animation: 'wiggle 3s infinite' }}>👉</span>
            {currentStep === 0 && "Start by placing the rice on the plate"}
            {currentStep === 1 && "Now add the garnished fried egg on top 👆"}
            {currentStep === 2 && "Add utensils to complete the plating 🍽️"}
            <span style={{ fontSize: '24px', animation: 'wiggle 3s infinite 0.5s' }}>👈</span>
          </div>
        </div>
      </div>

      {/* Main Content Area - Scrollable */}
      <div style={{
        display: 'flex',
        gap: '16px',
        flex: '1',
        minHeight: '0',
        maxWidth: '100%',
        margin: '0 auto',
        width: '100%',
        overflow: 'auto',
        paddingBottom: '20px'
      }}>
        
        {/* Left Panel - Ingredients & Tools */}
        <div style={{
          flex: '0 0 280px',
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: `2px solid ${colors.primary}20`,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minHeight: 'min-content',
          alignSelf: 'flex-start'
        }}>
          
          {/* Food Items */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              <Target size={18} color={colors.primary} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '800',
                color: colors.text,
                textAlign: 'center'
              }}>
                Ingredients
              </h3>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {foodItems.map((item) => {
                const isPlaced = placedItems[item.id];
                const isAvailable = isItemAvailable(item);
                const isCurrentStep = currentStep === foodItems.findIndex(f => f.id === item.id);
                
                return (
                  <div
                    key={item.id}
                    draggable={isAvailable && !isPlaced}
                    onDragStart={(e) => handleDragStart(e, item)}
                    onMouseEnter={() => setHoveredIngredient(item.id)}
                    onMouseLeave={() => setHoveredIngredient(null)}
                    style={{
                      background: isPlaced 
                        ? `linear-gradient(135deg, ${colors.primary}10, ${colors.primary}05)` 
                        : isCurrentStep
                        ? `linear-gradient(135deg, ${item.color}30, ${item.color}15)`
                        : isAvailable
                        ? `linear-gradient(135deg, ${item.color}15, ${item.color}05)`
                        : `linear-gradient(135deg, ${colors.background}, ${colors.background})`,
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: isPlaced ? 'not-allowed' : (isAvailable ? 'grab' : 'not-allowed'),
                      boxShadow: isPlaced 
                        ? `0 6px 20px ${colors.primary}20` 
                        : isCurrentStep
                        ? `0 6px 20px rgba(0, 0, 0, 0.15)`
                        : isAvailable
                        ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                        : '0 2px 6px rgba(0, 0, 0, 0.05)',
                      opacity: isPlaced ? 0.7 : (isAvailable ? 1 : 0.5),
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      userSelect: 'none',
                      border: isPlaced 
                        ? `3px solid ${colors.primary}`
                        : isCurrentStep
                        ? `3px solid ${colors.accent}`
                        : isAvailable
                        ? '2px solid transparent'
                        : `2px dashed ${colors.neutral}30`,
                      position: 'relative',
                      transform: hoveredIngredient === item.id && isAvailable && !isPlaced ? 'translateY(-4px) scale(1.02)' : 'none',
                      filter: isAvailable ? 'none' : 'grayscale(1)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Completed animation */}
                    {isPlaced && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        animation: 'slideIn 0.5s ease-out'
                      }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          background: colors.primary,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${colors.primary}40`
                        }}>
                          <CheckCircle size={16} color="white" />
                        </div>
                      </div>
                    )}

                    {/* Item Icon */}
                    <div style={{
                      width: '64px',
                      height: '64px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      transform: hoveredIngredient === item.id && isAvailable && !isPlaced ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                      border: `2px solid ${colors.primary}20`,
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          objectFit: 'contain',
                          filter: isPlaced ? 'saturate(0.8)' : 'saturate(1.2)'
                        }} 
                      />
                    </div>
                    
                    {/* Item Info */}
                    <div style={{ flex: '1', minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          color: isAvailable ? colors.text : colors.neutral,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.name}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: colors.primary,
                          background: `${colors.primary}15`,
                          padding: '3px 6px',
                          borderRadius: '10px',
                          whiteSpace: 'nowrap'
                        }}>
                          {item.quantity}
                        </span>
                      </div>
                      
                      <div style={{
                        fontSize: '12px',
                        color: colors.neutral,
                        marginBottom: '6px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.description}
                      </div>
                      
                      {!isAvailable && !isPlaced && item.id === 'egg' && (
                        <div style={{
                          fontSize: '11px',
                          color: colors.warning,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: `${colors.warning}10`,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          marginTop: '4px'
                        }}>
                          <Clock size={10} />
                          Place rice first
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Utensils */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '800',
              color: colors.text,
              marginBottom: '12px',
              textAlign: 'center',
              opacity: areUtensilsEnabled ? 1 : 0.7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>🍽️</span>
              Utensils
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: areUtensilsEnabled ? 1 : 0.7,
              transition: 'all 0.3s ease',
              filter: areUtensilsEnabled ? 'none' : 'grayscale(1)'
            }}>
              {toolItems.map((item) => {
                const isPlaced = placedItems[item.id];
                const isSelected = selectedUtensil?.id === item.id;
                
                return (
                  <div
                    key={item.id}
                    draggable={areUtensilsEnabled && !isPlaced}
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => areUtensilsEnabled && handleUtensilClick(item)}
                    style={{
                      background: isPlaced 
                        ? `linear-gradient(135deg, ${colors.primary}10, ${colors.primary}05)`
                        : isSelected
                        ? `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`
                        : areUtensilsEnabled
                        ? `linear-gradient(135deg, ${item.color}20, ${item.color}10)`
                        : `linear-gradient(135deg, ${colors.background}, ${colors.background})`,
                      borderRadius: '14px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: isPlaced ? 'not-allowed' : (areUtensilsEnabled ? 'grab' : 'not-allowed'),
                      boxShadow: isPlaced 
                        ? `0 4px 12px ${colors.primary}20` 
                        : isSelected
                        ? `0 4px 12px ${colors.accent}30`
                        : areUtensilsEnabled
                        ? '0 3px 8px rgba(0, 0, 0, 0.1)'
                        : '0 2px 4px rgba(0, 0, 0, 0.05)',
                      opacity: isPlaced ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                      userSelect: 'none',
                      border: isPlaced 
                        ? `3px solid ${colors.primary}`
                        : isSelected
                        ? `3px solid ${colors.accent}`
                        : areUtensilsEnabled
                        ? '2px solid transparent'
                        : `2px dashed ${colors.neutral}30`,
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '56px',
                      height: '56px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.95)',
                      borderRadius: '10px',
                      boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                      border: `2px solid ${colors.primary}20`,
                      flexShrink: 0
                    }}>
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'contain'
                        }} 
                      />
                    </div>
                    <div style={{ flex: '1', minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: areUtensilsEnabled ? colors.text : colors.neutral,
                        marginBottom: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.name}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: colors.neutral,
                        fontStyle: 'italic',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.tooltip}
                      </div>
                    </div>
                    
                    {isPlaced ? (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: colors.primary,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${colors.primary}40`,
                        flexShrink: 0
                      }}>
                        <CheckCircle size={14} color="white" />
                      </div>
                    ) : !areUtensilsEnabled && !isPlaced && (
                      <div style={{ 
                        fontSize: '10px',
                        color: colors.neutral,
                        textAlign: 'center',
                        background: `${colors.background}`,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        Complete food first
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Panel - Plate Area */}
        <div style={{
          flex: '1',
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: `2px solid ${colors.primary}20`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'min-content',
          alignSelf: 'flex-start',
          minWidth: 0
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              fontSize: '24px',
              animation: 'float 4s infinite ease-in-out'
            }}>🍽️</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '900',
              color: colors.text,
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}>
              YOUR PLATE
            </h3>
            <div style={{ 
              fontSize: '24px',
              animation: 'float 4s infinite ease-in-out 0.5s'
            }}>🍽️</div>
          </div>
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
              border: '6px solid #d6d3d1',
              borderRadius: '50%',
              width: '100%',
              aspectRatio: '1/1',
              maxWidth: '500px',
              margin: '0 auto',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: `
                0 16px 48px rgba(0, 0, 0, 0.15), 
                inset 0 4px 12px rgba(255, 255, 255, 0.8),
                0 0 0 1px rgba(0,0,0,0.05)
              `,
              filter: 'drop-shadow(0 8px 32px rgba(0, 0, 0, 0.1))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f8f8f7 0%, #f0f0ee 100%)';
              e.currentTarget.style.borderColor = '#a8a29e';
              e.currentTarget.style.boxShadow = `
                0 20px 60px rgba(0, 0, 0, 0.2), 
                inset 0 4px 12px rgba(255, 255, 255, 0.8),
                0 0 0 2px ${colors.primary}20
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)';
              e.currentTarget.style.borderColor = '#d6d3d1';
              e.currentTarget.style.boxShadow = `
                0 16px 48px rgba(0, 0, 0, 0.15), 
                inset 0 4px 12px rgba(255, 255, 255, 0.8),
                0 0 0 1px rgba(0,0,0,0.05)
              `;
            }}
          >
            {/* Plate rim with enhanced shadow */}
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              right: '15px',
              bottom: '15px',
              border: '6px solid #a8a29e',
              borderRadius: '50%',
              pointerEvents: 'none',
              boxShadow: `
                inset 0 4px 16px rgba(0,0,0,0.15), 
                0 4px 16px rgba(0,0,0,0.1)
              `
            }} />
            
            {/* Center guide for rice */}
            {!placedItems.rice && showDropHint && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '45%',
                height: '45%',
                border: '4px dashed rgba(245, 158, 11, 0.4)',
                borderRadius: '50%',
                pointerEvents: 'none',
                animation: 'pulse 2s infinite',
                boxShadow: '0 0 0 8px rgba(245, 158, 11, 0.1)'
              }} />
            )}

            {/* Drop hint text */}
            {Object.keys(placedItems).length === 0 && (
              <div style={{
                color: colors.neutral,
                fontSize: '16px',
                fontWeight: '700',
                textAlign: 'center',
                pointerEvents: 'none',
                padding: '20px',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                maxWidth: '70%',
                backdropFilter: 'blur(8px)',
                border: `2px solid ${colors.primary}20`
              }}>
                👇 Drag ingredients here to start plating!
              </div>
            )}

            {/* Placed Items */}
            {Object.values(placedItems).map((placed) => (
              <div
                key={placed.item.id}
                data-item-id={placed.item.id}
                style={{
                  position: 'absolute',
                  left: `${placed.x}%`,
                  top: `${placed.y}%`,
                  transform: `translate(-50%, -50%) scale(${placed.item.scale})`,
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  zIndex: placed.item.zIndex,
                  animation: justPlaced === placed.item.id ? 'popIn 0.8s ease-out' : 'none',
                  filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.4))',
                  pointerEvents: 'none'
                }}
              >
                {placed.item.id === 'rice' ? (
                  <div style={{
                    position: 'relative',
                    filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
                  }}>
                    <div style={{
                      position: 'absolute',
                      bottom: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '65%',
                      height: '8px',
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: '50%',
                      filter: 'blur(6px)'
                    }} />
                    <img 
                      src={placed.item.img} 
                      alt={placed.item.name}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'contain',
                        filter: 'contrast(1.15) brightness(1.1) saturate(1.2)'
                      }}
                    />
                  </div>
                ) : (
                  <img 
                    src={placed.item.img} 
                    alt={placed.item.name}
                    style={{
                      width: '140px',
                      height: '140px',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
                    }}
                  />
                )}
              </div>
            ))}

            {/* Visual guide for complete dish */}
            {hasCompleteDish && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '75%',
                height: '75%',
                border: '4px dashed rgba(16, 185, 129, 0.5)',
                borderRadius: '50%',
                pointerEvents: 'none',
                animation: 'pulse 3s infinite',
                boxShadow: '0 0 0 12px rgba(16, 185, 129, 0.15)'
              }} />
            )}

            {/* Drop target highlight */}
            {showDropHint && draggedItem && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '65%',
                height: '65%',
                background: draggedItem.id === 'egg' 
                  ? `radial-gradient(circle, ${colors.accent}20 0%, transparent 70%)`
                  : `radial-gradient(circle, ${colors.primary}15 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none',
                animation: 'pulse 2s infinite',
                border: `3px dashed ${draggedItem.color}60`
              }} />
            )}

            {/* Sparkles Animation */}
            {sparkles.map((sparkle) => (
              <div
                key={sparkle.id}
                style={{
                  position: 'absolute',
                  left: `${sparkle.x}%`,
                  top: `${sparkle.y}%`,
                  fontSize: `${sparkle.size}px`,
                  animation: `sparkleAnimation 1.5s ease-out ${sparkle.delay}s forwards`,
                  pointerEvents: 'none',
                  zIndex: 10,
                  filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.9))'
                }}
              >
                ✨
              </div>
            ))}
          </div>

          {/* Plate Completion Status */}
          {hasCompleteDish && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`,
              borderRadius: '14px',
              textAlign: 'center',
              border: `3px solid ${colors.primary}`,
              boxShadow: `0 6px 24px ${colors.primary}30`,
              animation: 'bounce 3s infinite'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <CheckCircle size={20} />
                Perfect plating! Ready to serve ✅
                <CheckCircle size={20} />
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tips & Controls */}
        <div style={{
          flex: '0 0 260px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: 'min-content',
          alignSelf: 'flex-start'
        }}>
          
          {/* Tips Panel with Progress Bar */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: `2px solid ${colors.primary}20`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <Lightbulb size={18} color={colors.primary} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '800',
                color: colors.text
              }}>
                Plating Tips
              </h3>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              marginBottom: '20px',
              background: colors.background,
              borderRadius: '10px',
              height: '6px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                borderRadius: '10px',
                transition: 'width 0.6s ease-out',
                boxShadow: `0 0 12px ${colors.primary}40`
              }} />
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px' 
            }}>
              {tips.map((tip, index) => {
                const isCompleted = completedSteps.includes(index);
                const isCurrent = currentStep === tip.step;
                
                return (
                  <div
                    key={index}
                    style={{
                      background: isCompleted 
                        ? `linear-gradient(135deg, ${colors.primary}15, ${colors.primary}05)`
                        : isCurrent
                        ? `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`
                        : `linear-gradient(135deg, ${colors.background}, ${colors.background})`,
                      padding: '16px',
                      borderRadius: '14px',
                      border: isCompleted 
                        ? `3px solid ${colors.primary}`
                        : isCurrent
                        ? `3px solid ${colors.accent}`
                        : `2px solid ${colors.primary}20`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Step indicator */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '28px',
                      height: '28px',
                      background: isCompleted ? colors.primary : (isCurrent ? colors.accent : colors.neutral),
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '800',
                      boxShadow: `0 4px 12px ${isCompleted ? colors.primary + '40' : (isCurrent ? colors.accent + '40' : colors.neutral + '20')}`,
                      animation: isCurrent ? 'pulse 2s infinite' : 'none'
                    }}>
                      {tip.icon}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <div style={{ flex: '1', marginRight: '30px' }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: isCompleted ? colors.primary : (isCurrent ? colors.warning : colors.text),
                          lineHeight: '1.4',
                          display: 'block',
                          marginBottom: '6px'
                        }}>
                          {tip.text}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: colors.neutral,
                          lineHeight: '1.4'
                        }}>
                          {tip.description}
                        </span>
                        
                        {isCompleted && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '8px',
                            animation: 'slideIn 0.5s ease-out'
                          }}>
                            <CheckCircle size={14} color={colors.primary} />
                            <span style={{
                              fontSize: '11px',
                              color: colors.primary,
                              fontWeight: '600'
                            }}>
                              Step completed
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Control Buttons */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: `2px solid ${colors.primary}20`,
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Primary Button */}
              <button
                onClick={handleStartPlating}
                disabled={!allEssentialPlaced || showSuccess}
                style={{
                  background: allEssentialPlaced && !showSuccess 
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.success})` 
                    : `linear-gradient(135deg, ${colors.neutral}30, ${colors.neutral}20)`,
                  color: 'white',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  fontSize: '16px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: allEssentialPlaced && !showSuccess ? 'pointer' : 'not-allowed',
                  boxShadow: allEssentialPlaced && !showSuccess 
                    ? `0 8px 32px ${colors.primary}40, 0 0 0 2px ${colors.primary}20` 
                    : '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  letterSpacing: '0.5px',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (allEssentialPlaced && !showSuccess) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 40px ${colors.primary}50, 0 0 0 3px ${colors.primary}30`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (allEssentialPlaced && !showSuccess) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}40, 0 0 0 2px ${colors.primary}20`;
                  }
                }}
              >
                <Sparkles size={20} />
                {showSuccess ? '🎉 Completed!' : 'FINISH PLATING'}
              </button>

              {showSuccess && (
                <button
                  onClick={() => navigate('/lesson/cooking/level-6')}
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.warning})`,
                    color: 'white',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    fontSize: '16px',
                    fontWeight: '800',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: `0 8px 32px ${colors.accent}40, 0 0 0 2px ${colors.accent}20`,
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    animation: 'pulse 3s infinite',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 12px 40px ${colors.accent}50, 0 0 0 3px ${colors.accent}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = `0 8px 32px ${colors.accent}40, 0 0 0 2px ${colors.accent}20`;
                  }}
                >
                  Next Level
                  <ArrowRight size={20} />
                </button>
              )}

              {/* Secondary Button */}
              <button
                onClick={handleReset}
                style={{
                  background: 'white',
                  color: colors.neutral,
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '800',
                  border: `2px solid ${colors.neutral}30`,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = colors.neutral;
                  e.currentTarget.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = `${colors.neutral}30`;
                  e.currentTarget.style.color = colors.neutral;
                }}
              >
                <RotateCcw size={18} />
                Reset Plate
              </button>

              {/* Tertiary Button */}
              <button
                onClick={() => navigate('/studentdashboard')}
                style={{
                  background: 'white',
                  color: colors.text,
                  padding: '14px 20px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '800',
                  border: `2px solid ${colors.primary}30`,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${colors.primary}20`;
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = `${colors.primary}30`;
                  e.currentTarget.style.color = colors.text;
                }}
              >
                🏠 Return Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dragging Glow Trail */}
      {draggedItem && draggingItemPos && (
        <div style={{
          position: 'fixed',
          left: draggingItemPos.x - 30,
          top: draggingItemPos.y - 30,
          width: '60px',
          height: '60px',
          background: `radial-gradient(circle, ${draggedItem.color}40 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          opacity: 0.6,
          filter: 'blur(12px)',
          animation: 'glowTrail 0.3s ease-out'
        }} />
      )}

      {/* Utensil Tooltip */}
      {showUtensilTip && selectedUtensil && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          background: `linear-gradient(135deg, ${colors.accent}, ${colors.warning})`,
          color: 'white',
          padding: '12px 16px',
          borderRadius: '14px',
          fontSize: '13px',
          fontWeight: '600',
          zIndex: 2000,
          boxShadow: `0 8px 32px ${colors.accent}40`,
          animation: 'slideIn 0.3s ease-out',
          border: `2px solid rgba(255,255,255,0.3)`,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '180px'
        }}>
          <ChefHat size={18} />
          <div>
            {selectedUtensil.tooltip}
            <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px' }}>
              Drag to plate
            </div>
          </div>
        </div>
      )}

      {/* Confetti Animation */}
      {confetti.map((conf) => (
        <div
          key={conf.id}
          style={{
            position: 'fixed',
            top: '-20px',
            left: `${conf.left}%`,
            fontSize: '24px',
            animation: `confettiFall ${conf.duration}s ease-out ${conf.delay}s forwards`,
            zIndex: 1000,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            transform: `rotate(${conf.rotation}deg)`
          }}
        >
          {conf.emoji}
        </div>
      ))}

      {/* Order Error Message */}
      {showOrderError && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `linear-gradient(135deg, ${colors.error}, #dc2626)`,
          color: 'white',
          padding: '20px 24px',
          borderRadius: '16px',
          fontSize: '18px',
          fontWeight: '800',
          zIndex: 2000,
          boxShadow: `0 16px 48px ${colors.error}50`,
          animation: 'bounceIn 0.6s ease-out',
          border: '3px solid rgba(255, 255, 255, 0.3)',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(8px)',
          maxWidth: '90%'
        }}>
          <ChefHat size={24} />
          <div>
            Remember to place the Rice first, chef!
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
              Follow the steps in order 👨‍🍳
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          padding: '20px',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '32px 24px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            border: `4px solid ${colors.primary}`,
            background: `linear-gradient(135deg, ${colors.primary}10, white, ${colors.primary}10)`,
            animation: 'bounceIn 1s ease-out',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              fontSize: '80px', 
              marginBottom: '24px', 
              animation: 'float 4s infinite ease-in-out',
              filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.3))'
            }}>
              🎨
            </div>
            
            <h2 style={{
              fontSize: '32px',
              marginBottom: '16px',
              fontWeight: '900',
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.success})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-1px'
            }}>
              Perfect Plating!
            </h2>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px', 
              fontSize: '36px' 
            }}>
              <span style={{ animation: 'pulse 3s infinite', animationDelay: '0s' }}>⭐</span>
              <span style={{ animation: 'pulse 3s infinite', animationDelay: '0.2s' }}>⭐</span>
              <span style={{ animation: 'pulse 3s infinite', animationDelay: '0.4s' }}>⭐</span>
            </div>
            
            <h3 style={{ 
              fontSize: '24px', 
              color: colors.success, 
              marginBottom: '24px',
              fontWeight: '800'
            }}>
              Presentation Master! 👨‍🍳
            </h3>
            
            <p style={{ 
              color: '#047857', 
              fontSize: '14px', 
              marginBottom: '24px',
              lineHeight: '1.6',
              background: 'rgba(255,255,255,0.9)',
              padding: '16px',
              borderRadius: '12px',
              border: `2px solid ${colors.primary}20`
            }}>
              Outstanding work! You've arranged the dish beautifully with proper plating techniques. Your presentation is restaurant-quality!
            </p>

            <div style={{
              backgroundColor: `${colors.primary}15`,
              padding: '20px',
              borderRadius: '16px',
              marginBottom: '24px',
              border: `3px solid ${colors.primary}`
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '800',
                color: '#065f46',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}>
                <CheckCircle size={20} />
                <span>All Plating Elements Completed:</span>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#047857',
                lineHeight: '1.8',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '12px'
              }}>
                <span style={{ 
                  background: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🍚 Rice Base
                </span>
                <span style={{ 
                  background: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🍳 Garnished Egg
                </span>
                <span style={{ 
                  background: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '20px', 
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🥄 Utensils Set
                </span>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center', 
              flexWrap: 'wrap' 
            }}>
              <button
                onClick={handleReset}
                style={{
                  background: 'white',
                  color: colors.primary,
                  padding: '14px 20px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '800',
                  border: `3px solid ${colors.primary}`,
                  cursor: 'pointer',
                  boxShadow: `0 6px 24px ${colors.primary}30`,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${colors.primary}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 6px 24px ${colors.primary}30`;
                }}
              >
                🔄 Play Again
              </button>

              <button 
                onClick={() => navigate('/studentdashboard')}
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.success})`,
                  color: 'white',
                  padding: '14px 20px',
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: `0 8px 32px ${colors.primary}40`,
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 16px 40px ${colors.primary}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 8px 32px ${colors.primary}40`;
                }}
              >
                🏠 Return Home
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounceIn {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.05); }
          70% { transform: translate(-50%, -50%) scale(0.9); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes slowPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.3); }
          50% { transform: scale(1.02); box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.4); }
        }
        @keyframes glow {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-12deg); }
          75% { transform: rotate(12deg); }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
          70% { transform: translate(-50%, -50%) scale(0.9); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes sparkleAnimation {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.4) rotate(180deg); opacity: 1; }
          100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
          50% { transform: translateY(0); }
          70% { transform: translateY(-4px); }
        }
        @keyframes glowTrail {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.3); }
        }
        @keyframes slideIn {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CookingLevel5;