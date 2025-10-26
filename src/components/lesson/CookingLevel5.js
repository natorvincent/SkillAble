import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import images for Level 5 cooking game
import forkImg from "../../assets/cookingLevel5/fork.png";
import friedEggImg from "../../assets/cookingLevel5/fried-egg.png";
import springOnionChoppedImg from "../../assets/cookingLevel5/spring-onion-chopped.png";
import spoonImg from "../../assets/cookingLevel5/spoon.png";

const CookingLevel5 = () => {
  const navigate = useNavigate();
  const [placedItems, setPlacedItems] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [justPlaced, setJustPlaced] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showOrderError, setShowOrderError] = useState(false);

  const foodItems = [
    { id: 'rice', emoji: '🍚', name: 'Rice', color: '#fef3c7', tipIndex: 0, isEssential: true, scale: 2.5, zIndex: 1 },
    { id: 'egg', img: friedEggImg, name: 'Fried Egg', color: '#fed7aa', tipIndex: 1, isEssential: true, scale: 3.0, zIndex: 2 },
    { id: 'garnish', img: springOnionChoppedImg, name: 'Garnish', color: '#d1fae5', tipIndex: 2, isEssential: true, scale: 2.0, zIndex: 3 }
  ];

  const toolItems = [
    { id: 'spoon', img: spoonImg, name: 'Spoon', color: '#e5e7eb', tipIndex: 3, isEssential: false, scale: 1.5, zIndex: 4 },
    { id: 'fork', img: forkImg, name: 'Fork', color: '#e5e7eb', tipIndex: 3, isEssential: false, scale: 1.5, zIndex: 4 }
  ];

  const allItems = [...foodItems, ...toolItems];

  const tips = [
    { icon: '🍚', text: 'Place rice in the center of the plate', relatedItems: ['rice'], step: 0 },
    { icon: '🍳', text: 'Add the fried egg on top of the rice', relatedItems: ['egg'], step: 1 },
    { icon: '🌿', text: 'Garnish adds color and freshness', relatedItems: ['garnish'], step: 2 },
    { icon: '🥄', text: 'Don\'t forget utensils on the side!', relatedItems: ['spoon', 'fork'], step: 3 }
  ];

  // Calculate optimal positions for centered plating
  const getOptimalPosition = (itemId, allPlacedItems) => {
    const plateCenter = { x: 50, y: 50 };
    
    // If no items placed yet, center the first item
    if (Object.keys(allPlacedItems).length === 0) {
      return plateCenter;
    }

    // For rice - always center
    if (itemId === 'rice') {
      return plateCenter;
    }

    // For egg - center on top of rice
    if (itemId === 'egg' && allPlacedItems.rice) {
      return { x: plateCenter.x, y: plateCenter.y - 5 };
    }

    // For garnish - position above the egg/rice combo
    if (itemId === 'garnish' && allPlacedItems.rice) {
      return { x: plateCenter.x, y: plateCenter.y - 15 };
    }

    // For utensils - position on sides
    if (itemId === 'spoon') {
      return { x: 25, y: 70 };
    }
    if (itemId === 'fork') {
      return { x: 75, y: 70 };
    }

    // Default fallback - slight random offset from center
    return {
      x: plateCenter.x + (Math.random() - 0.5) * 10,
      y: plateCenter.y + (Math.random() - 0.5) * 10
    };
  };

  // Update current step based on placed items
  useEffect(() => {
    if (placedItems.rice && !placedItems.egg) setCurrentStep(1);
    else if (placedItems.rice && placedItems.egg && !placedItems.garnish) setCurrentStep(2);
    else if (placedItems.rice && placedItems.egg && placedItems.garnish) setCurrentStep(3);
    else setCurrentStep(0);
  }, [placedItems]);

  const handleDragStart = (e, item) => {
    if (placedItems[item.id]) return;
    
    // Check if item can be placed based on order
    if (item.id === 'egg' && !placedItems.rice) {
      e.preventDefault();
      setShowOrderError(true);
      setTimeout(() => setShowOrderError(false), 2000);
      return;
    }
    if (item.id === 'garnish' && (!placedItems.rice || !placedItems.egg)) {
      e.preventDefault();
      setShowOrderError(true);
      setTimeout(() => setShowOrderError(false), 2000);
      return;
    }

    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem || placedItems[draggedItem.id]) return;

    // Final order check
    if (draggedItem.id === 'egg' && !placedItems.rice) return;
    if (draggedItem.id === 'garnish' && (!placedItems.rice || !placedItems.egg)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Use optimal position for better visual arrangement
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
    setTimeout(() => setJustPlaced(null), 1000);
    createSparkles(finalPosition.x, finalPosition.y);
    setDraggedItem(null);

    // Check if all essential items are placed
    const essentialItemsPlaced = foodItems.every(item => newPlacedItems[item.id]);
    if (essentialItemsPlaced) {
      setTimeout(() => {
        triggerConfetti();
        setShowSuccess(true);
      }, 800);
    }
  };

  const createSparkles = (x, y) => {
    const newSparkles = [];
    for (let i = 0; i < 8; i++) {
      newSparkles.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        delay: Math.random() * 0.2
      });
    }
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleStartPlating = () => {
    const essentialItemsPlaced = foodItems.every(item => placedItems[item.id]);
    if (essentialItemsPlaced) {
      triggerConfetti();
      setShowSuccess(true);
    }
  };

  const handleReset = () => {
    setPlacedItems({});
    setShowSuccess(false);
    setConfetti([]);
    setSparkles([]);
    setJustPlaced(null);
    setCurrentStep(0);
  };

  const triggerConfetti = () => {
    const newConfetti = [];
    for (let i = 0; i < 50; i++) {
      newConfetti.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1 + Math.random() * 2,
        rotation: Math.random() * 360
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
    if (item.id === 'garnish' && (!placedItems.rice || !placedItems.egg)) return false;
    return true;
  };

  const essentialItemsPlaced = foodItems.every(item => placedItems[item.id]);
  const allItemsPlaced = allItems.every(item => placedItems[item.id]);

  // Check if we have a complete dish for special centering
  const hasCompleteDish = placedItems.rice && placedItems.egg && placedItems.garnish;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f3ef 0%, #e8dcc4 50%, #f5f3ef 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Header - Compact */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '2px solid #e8dcc4',
        flexShrink: 0
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '800',
          color: '#4a5568',
          marginBottom: '16px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '24px' }}>🎨</span>
          Level 5: Perfect Plating
          <span style={{ fontSize: '24px' }}>🎨</span>
        </h2>
        
        {/* Current Instruction */}
        <div style={{
          background: 'linear-gradient(135deg, #FF9800, #F57C00)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '16px',
          boxShadow: '0 3px 8px rgba(255, 152, 0, 0.4)',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>👉</span>
            {currentStep === 0 && "Start by placing the rice on the plate"}
            {currentStep === 1 && "Now add the fried egg on top"}
            {currentStep === 2 && "Garnish with spring onions"}
            {currentStep === 3 && "Add utensils to complete the plating"}
            <span style={{ fontSize: '20px' }}>👈</span>
          </div>
        </div>
      </div>

      {/* Main Content Area - Horizontal Layout */}
      <div style={{
        display: 'flex',
        gap: '20px',
        flex: '1',
        minHeight: '0'
      }}>
        
        {/* Left Panel - Ingredients & Tools */}
        <div style={{
          flex: '0 0 300px',
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e8dcc4',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Food Items */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#4a5568',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              🍽️ Ingredients
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {foodItems.map((item) => {
                const isPlaced = placedItems[item.id];
                const isAvailable = isItemAvailable(item);
                
                return (
                  <div
                    key={item.id}
                    draggable={isAvailable && !isPlaced}
                    onDragStart={(e) => handleDragStart(e, item)}
                    style={{
                      background: isPlaced 
                        ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' 
                        : isAvailable
                        ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`
                        : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: isPlaced ? 'not-allowed' : (isAvailable ? 'grab' : 'not-allowed'),
                      boxShadow: isPlaced 
                        ? '0 1px 4px rgba(0, 0, 0, 0.08)' 
                        : isAvailable
                        ? '0 3px 8px rgba(0, 0, 0, 0.15)'
                        : '0 1px 4px rgba(0, 0, 0, 0.08)',
                      opacity: isPlaced ? 0.5 : (isAvailable ? 1 : 0.4),
                      transition: 'all 0.3s ease',
                      userSelect: 'none',
                      border: isPlaced ? '2px solid #10b981' : (isAvailable ? '2px solid transparent' : '2px dashed #9ca3af'),
                      position: 'relative',
                      filter: isAvailable ? 'none' : 'grayscale(0.8)'
                    }}
                    onMouseEnter={(e) => {
                      if (isAvailable && !isPlaced) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAvailable && !isPlaced) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.15)';
                      }
                    }}
                  >
                    {item.img ? (
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          objectFit: 'contain'
                        }} 
                      />
                    ) : (
                      <div style={{ fontSize: '32px' }}>{item.emoji}</div>
                    )}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: isAvailable ? '#374151' : '#9ca3af',
                      flex: '1'
                    }}>
                      {item.name}
                    </span>
                    {isPlaced && (
                      <CheckCircle size={16} color="#10b981" />
                    )}
                    {!isAvailable && !isPlaced && (
                      <span style={{ color: '#6b7280', fontSize: '12px' }}>⏳</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tool Items */}
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#4a5568',
              marginBottom: '12px',
              textAlign: 'center',
              opacity: essentialItemsPlaced ? 1 : 0.6
            }}>
              🥄 Utensils
            </h3>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              opacity: essentialItemsPlaced ? 1 : 0.6,
              transition: 'all 0.3s ease',
              filter: essentialItemsPlaced ? 'none' : 'grayscale(0.7)'
            }}>
              {toolItems.map((item) => {
                const isPlaced = placedItems[item.id];
                
                return (
                  <div
                    key={item.id}
                    draggable={essentialItemsPlaced && !isPlaced}
                    onDragStart={(e) => handleDragStart(e, item)}
                    style={{
                      background: isPlaced 
                        ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' 
                        : essentialItemsPlaced
                        ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`
                        : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: isPlaced ? 'not-allowed' : (essentialItemsPlaced ? 'grab' : 'not-allowed'),
                      boxShadow: isPlaced 
                        ? '0 1px 4px rgba(0, 0, 0, 0.08)' 
                        : essentialItemsPlaced
                        ? '0 3px 8px rgba(0, 0, 0, 0.15)'
                        : '0 1px 4px rgba(0, 0, 0, 0.08)',
                      opacity: isPlaced ? 0.5 : (essentialItemsPlaced ? 1 : 0.4),
                      transition: 'all 0.3s ease',
                      userSelect: 'none',
                      border: isPlaced ? '2px solid #10b981' : (essentialItemsPlaced ? '2px solid transparent' : '2px dashed #9ca3af'),
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (essentialItemsPlaced && !isPlaced) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (essentialItemsPlaced && !isPlaced) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 3px 8px rgba(0, 0, 0, 0.15)';
                      }
                    }}
                  >
                    <img 
                      src={item.img} 
                      alt={item.name} 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        objectFit: 'contain'
                      }} 
                    />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: essentialItemsPlaced ? '#374151' : '#9ca3af',
                      flex: '1'
                    }}>
                      {item.name}
                    </span>
                    {isPlaced && (
                      <CheckCircle size={16} color="#10b981" />
                    )}
                    {!essentialItemsPlaced && !isPlaced && (
                      <span style={{ 
                        color: '#6b7280', 
                        fontSize: '10px',
                        textAlign: 'center',
                        lineHeight: '1.2'
                      }}>
                        Complete food first
                      </span>
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
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e8dcc4',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#4a5568',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            🍽️ Your Plate
          </h3>
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #f8f4e9 0%, #e8dfc8 100%)',
              border: '3px dashed #d4c29e',
              borderRadius: '50%',
              width: '100%',
              height: '100%',
              minHeight: '400px',
              maxHeight: '500px',
              margin: '0 auto',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flex: '1'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f5f0e1 0%, #e0d6bb 100%)';
              e.currentTarget.style.borderColor = '#c4b08a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #f8f4e9 0%, #e8dfc8 100%)';
              e.currentTarget.style.borderColor = '#d4c29e';
            }}
          >
            {/* Plate rim */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              border: '3px solid #c4b08a',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
            
            {/* Drop hint text */}
            {Object.keys(placedItems).length === 0 && (
              <div style={{
                color: '#9ca3af',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
                pointerEvents: 'none',
                padding: '20px'
              }}>
                Drag ingredients here to start plating!
              </div>
            )}

            {/* Placed Items with Enhanced Scaling */}
            {Object.values(placedItems).map((placed) => (
              <div
                key={placed.item.id}
                style={{
                  position: 'absolute',
                  left: `${placed.x}%`,
                  top: `${placed.y}%`,
                  transform: `translate(-50%, -50%) scale(${placed.item.scale})`,
                  transition: 'all 0.3s ease',
                  zIndex: placed.item.zIndex,
                  animation: justPlaced === placed.item.id ? 'popIn 0.5s ease-out' : 'none',
                  filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))'
                }}
              >
                {placed.item.emoji ? (
                  <div style={{ 
                    fontSize: '64px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {placed.item.emoji}
                  </div>
                ) : (
                  <img 
                    src={placed.item.img} 
                    alt={placed.item.name}
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain'
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
                width: '60%',
                height: '60%',
                border: '2px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: '50%',
                pointerEvents: 'none',
                animation: 'pulse 2s infinite'
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
                  fontSize: '24px',
                  animation: `sparkleAnimation 1s ease-out ${sparkle.delay}s forwards`,
                  pointerEvents: 'none',
                  zIndex: 10
                }}
              >
                ✨
              </div>
            ))}
          </div>

          {/* Plate Completion Status */}
          {hasCompleteDish && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
              borderRadius: '10px',
              textAlign: 'center',
              border: '2px solid #10b981'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#065f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} />
                Perfect plating! Ready to serve ✅
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Tips & Controls */}
        <div style={{
          flex: '0 0 280px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Tips Panel */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e8dcc4',
            flex: '1'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#4a5568',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              💡 Plating Tips
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tips.map((tip, index) => {
                const isCompleted = isTipCompleted(tip);
                const isCurrent = currentStep === tip.step;
                
                return (
                  <div
                    key={index}
                    style={{
                      background: isCompleted 
                        ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                        : isCurrent
                        ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                        : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                      padding: '12px',
                      borderRadius: '10px',
                      border: isCompleted 
                        ? '2px solid #10b981'
                        : isCurrent
                        ? '2px solid #f59e0b'
                        : '2px solid #e5e7eb',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{ fontSize: '18px' }}>{tip.icon}</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isCompleted ? '#065f46' : (isCurrent ? '#92400e' : '#4b5563'),
                        lineHeight: '1.3'
                      }}>
                        {tip.text}
                      </span>
                      {isCompleted && (
                        <CheckCircle size={14} color="#10b981" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Control Buttons */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e8dcc4',
            flexShrink: 0
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <button
                onClick={handleStartPlating}
                disabled={!essentialItemsPlaced || showSuccess}
                style={{
                  background: essentialItemsPlaced && !showSuccess 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
                  color: 'white',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  border: 'none',
                  cursor: essentialItemsPlaced && !showSuccess ? 'pointer' : 'not-allowed',
                  boxShadow: essentialItemsPlaced && !showSuccess 
                    ? '0 4px 12px rgba(16, 185, 129, 0.4)' 
                    : '0 2px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (essentialItemsPlaced && !showSuccess) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (essentialItemsPlaced && !showSuccess) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }
                }}
              >
                <Sparkles size={18} />
                {showSuccess ? 'Completed!' : 'FINISH PLATING'}
              </button>

              {showSuccess && (
                <button
                  onClick={() => navigate('/lesson/cooking/level-6')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    animation: 'pulse 2s infinite'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  Next Level
                  <ArrowRight size={18} />
                </button>
              )}

              <button
                onClick={handleReset}
                style={{
                  background: 'white',
                  color: '#6b7280',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '2px solid #e5e7eb',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = '#9ca3af';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Animation */}
      {confetti.map((conf) => (
        <div
          key={conf.id}
          style={{
            position: 'fixed',
            top: '-20px',
            left: `${conf.left}%`,
            fontSize: '20px',
            animation: `confettiFall ${conf.duration}s ease-out ${conf.delay}s forwards`,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          🎉
        </div>
      ))}

      {/* Order Error Message */}
      {showOrderError && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '700',
          zIndex: 2000,
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.5)',
          animation: 'bounceIn 0.4s ease-out',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          textAlign: 'center'
        }}>
          🧑‍🍳 Remember to place the Rice first, chef!
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
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes sparkleAnimation {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CookingLevel5;