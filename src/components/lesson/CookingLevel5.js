import React, { useState } from 'react';
import { Sparkles, RotateCcw, Home, CheckCircle } from 'lucide-react';

// Import images for Level 5 cooking game
import forkImg from "../../assets/cookingLevel5/fork.png";
import friedEggImg from "../../assets/cookingLevel5/fried-egg.png";
import plateImg from "../../assets/cookingLevel5/plate.png";
import spoonImg from "../../assets/cookingLevel5/spoon.png";
import springOnionChoppedImg from "../../assets/cookingLevel5/spring-onion-chopped.png";

const PlatingGame = () => {
  const [placedItems, setPlacedItems] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [justPlaced, setJustPlaced] = useState(null);

  const availableItems = [
    { id: 'rice', emoji: '🍚', name: 'Rice', color: '#fef3c7', tipIndex: 0 },
    { id: 'egg', img: friedEggImg, name: 'Fried Egg', color: '#fed7aa', tipIndex: 1 },
    { id: 'spoon', img: spoonImg, name: 'Spoon', color: '#e5e7eb', tipIndex: 3 },
    { id: 'fork', img: forkImg, name: 'Fork', color: '#e5e7eb', tipIndex: 3 },
    { id: 'garnish', img: springOnionChoppedImg, name: 'Garnish', color: '#d1fae5', tipIndex: 2 }
  ];

  const tips = [
    { icon: '🍚', text: 'Place rice in the center of the plate', relatedItems: ['rice'] },
    { icon: '🍳', text: 'Add the fried egg on top of the rice', relatedItems: ['egg'] },
    { icon: '🌿', text: 'Garnish adds color and freshness', relatedItems: ['garnish'] },
    { icon: '🥄', text: 'Don\'t forget utensils on the side!', relatedItems: ['spoon', 'fork'] }
  ];

  const handleDragStart = (e, item) => {
    if (placedItems[item.id]) return;
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedItem || placedItems[draggedItem.id]) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPlacedItems = {
      ...placedItems,
      [draggedItem.id]: { x, y, item: draggedItem }
    };

    setPlacedItems(newPlacedItems);

    setJustPlaced(draggedItem.id);
    setTimeout(() => setJustPlaced(null), 1000);

    createSparkles(x, y);
    setDraggedItem(null);

    // Check if all 5 items are now placed
    if (Object.keys(newPlacedItems).length === availableItems.length) {
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
    if (Object.keys(placedItems).length === availableItems.length) {
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

  const allItemsPlaced = Object.keys(placedItems).length === availableItems.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f3ef 0%, #e8dcc4 50%, #f5f3ef 100%)',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
        border: '2px solid #e8dcc4'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '800',
          color: '#4a5568',
          marginBottom: '20px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '28px' }}>🎨</span>
          Drag Items to Your Plate
          <span style={{ fontSize: '28px' }}>🎨</span>
        </h2>
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {availableItems.map((item) => {
            const isPlaced = placedItems[item.id];
            return (
              <div
                key={item.id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStart(e, item)}
                style={{
                  background: isPlaced 
                    ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' 
                    : `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                  borderRadius: '16px',
                  padding: '20px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: isPlaced ? 'not-allowed' : 'grab',
                  boxShadow: isPlaced 
                    ? '0 2px 8px rgba(0, 0, 0, 0.08)' 
                    : '0 6px 16px rgba(0, 0, 0, 0.15)',
                  opacity: isPlaced ? 0.5 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: '110px',
                  userSelect: 'none',
                  border: isPlaced ? '3px solid #10b981' : '3px solid transparent',
                  transform: isPlaced ? 'scale(0.95)' : 'scale(1)',
                  position: 'relative',
                  overflow: 'visible'
                }}
                onMouseEnter={(e) => {
                  if (!isPlaced) {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPlaced) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.15)';
                  }
                }}
              >
                {item.img ? (
                  <img 
                    src={item.img} 
                    alt={item.name} 
                    style={{ 
                      width: '70px', 
                      height: '70px', 
                      objectFit: 'contain',
                      marginBottom: '4px'
                    }} 
                  />
                ) : (
                  <div style={{ fontSize: '56px', marginBottom: '4px' }}>{item.emoji}</div>
                )}
                <span style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#374151'
                }}>
                  {item.name}
                </span>
                {isPlaced && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    animation: 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                  }}>
                    <CheckCircle size={20} color="white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
          height: 'fit-content',
          border: '3px solid #fbbf24'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '900',
              color: '#d97706',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <Sparkles size={22} />
              TIPS
              <Sparkles size={22} />
            </h3>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {tips.map((tip, index) => {
              const isCompleted = isTipCompleted(tip);
              return (
                <div
                  key={index}
                  style={{
                    background: index % 2 === 0 
                      ? 'linear-gradient(135deg, #ffffff 0%, #fefcf8 100%)'
                      : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                    border: isCompleted ? '2px solid #10b981' : '2px solid #fef3c7',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      animation: 'popIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                    }}>
                      <CheckCircle size={16} color="white" />
                    </div>
                  )}
                  <div style={{
                    fontSize: '36px',
                    flexShrink: 0,
                    filter: isCompleted ? 'grayscale(0)' : 'grayscale(30%)',
                    transition: 'filter 0.3s ease'
                  }}>
                    {tip.icon}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isCompleted ? '#065f46' : '#4b5563',
                    margin: 0,
                    lineHeight: '1.6',
                    flex: 1,
                    paddingRight: isCompleted ? '24px' : '0'
                  }}>
                    {tip.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div style={{
            marginTop: '20px',
            background: 'white',
            borderRadius: '14px',
            padding: '18px',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
            border: '2px solid #fef3c7'
          }}>
            <div style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#6b7280',
              marginBottom: '10px'
            }}>
              Progress
            </div>
            <div style={{
              fontSize: '38px',
              fontWeight: '900',
              color: allItemsPlaced ? '#10b981' : '#f59e0b',
              transition: 'all 0.3s ease'
            }}>
              {Object.keys(placedItems).length} / {availableItems.length}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#6b7280',
              marginTop: '6px',
              fontWeight: '600'
            }}>
              {allItemsPlaced ? '✨ All items placed! ✨' : '🎯 Keep going!'}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          
          <div style={{
            background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #8b4513 100%)',
            borderRadius: '20px',
            padding: '48px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
            border: '4px solid #654321',
            position: 'relative'
          }}>
            
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              fontSize: '36px',
              opacity: 0.5,
              animation: 'float 3s ease-in-out infinite'
            }}>
              🌸
            </div>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              fontSize: '36px',
              opacity: 0.5,
              animation: 'float 3s ease-in-out infinite 1s'
            }}>
              🌸
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              style={{
                width: '100%',
                maxWidth: '600px',
                aspectRatio: '1',
                margin: '0 auto',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #fdfbf7 0%, #f5f0e8 40%, #e8dcc4 100%)',
                boxShadow: draggedItem 
                  ? 'inset 0 4px 20px rgba(0, 0, 0, 0.15), 0 12px 40px rgba(0, 0, 0, 0.25), 0 0 40px rgba(251, 191, 36, 0.6), 0 0 80px rgba(251, 191, 36, 0.3)'
                  : 'inset 0 4px 20px rgba(0, 0, 0, 0.15), 0 12px 40px rgba(0, 0, 0, 0.25)',
                border: draggedItem ? '14px solid #fbbf24' : '12px solid #d4c4a8',
                position: 'relative',
                cursor: 'copy',
                transition: 'all 0.3s ease',
                animation: draggedItem ? 'plateGlow 2s ease-in-out infinite' : 'none'
              }}
            >
              <div style={{
                position: 'absolute',
                inset: '20px',
                borderRadius: '50%',
                border: '3px solid #e8dcc4',
                opacity: 0.6
              }}></div>
              
              <div style={{
                position: 'absolute',
                inset: '40px',
                borderRadius: '50%',
                border: '2px solid #f5f0e8',
                opacity: 0.4
              }}></div>

              {Object.keys(placedItems).length === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{
                    fontSize: '64px',
                    marginBottom: '12px',
                    opacity: 0.5,
                    animation: 'bounce 2s ease-in-out infinite'
                  }}>
                    🍽️
                  </div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#9ca3af',
                    animation: 'pulse 2s infinite',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    Drop items here
                  </div>
                </div>
              )}

              {Object.entries(placedItems).map(([itemId, position]) => (
                <div
                  key={itemId}
                  style={{
                    position: 'absolute',
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3))',
                    animation: justPlaced === itemId 
                      ? 'placeItemBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
                      : 'none',
                    cursor: 'move'
                  }}
                >
                  {position.item.img ? (
                    <img 
                      src={position.item.img} 
                      alt={position.item.name} 
                      style={{ 
                        width: '140px', 
                        height: '140px', 
                        objectFit: 'contain'
                      }} 
                    />
                  ) : (
                    <div style={{ fontSize: '120px' }}>{position.item.emoji}</div>
                  )}
                </div>
              ))}

              {sparkles.map((sparkle) => (
                <Sparkles
                  key={sparkle.id}
                  style={{
                    position: 'absolute',
                    left: `${sparkle.x}%`,
                    top: `${sparkle.y}%`,
                    color: '#fbbf24',
                    animation: `sparkleFloat 0.8s ease-out ${sparkle.delay}s forwards`,
                    pointerEvents: 'none'
                  }}
                  size={24}
                />
              ))}

              {confetti.map((conf) => (
                <div
                  key={conf.id}
                  style={{
                    position: 'absolute',
                    left: `${conf.left}%`,
                    top: '-10%',
                    width: '12px',
                    height: '12px',
                    background: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][conf.id % 5],
                    borderRadius: '50%',
                    animation: `fall ${conf.duration}s linear ${conf.delay}s forwards`,
                    transform: `rotate(${conf.rotation}deg)`,
                    opacity: 0
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleStartPlating}
              disabled={!allItemsPlaced || showSuccess}
              style={{
                background: allItemsPlaced && !showSuccess 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
                color: 'white',
                padding: '18px 52px',
                borderRadius: '16px',
                fontSize: '19px',
                fontWeight: '800',
                border: 'none',
                cursor: allItemsPlaced && !showSuccess ? 'pointer' : 'not-allowed',
                boxShadow: allItemsPlaced && !showSuccess 
                  ? '0 6px 16px rgba(16, 185, 129, 0.4)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (allItemsPlaced && !showSuccess) {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(16, 185, 129, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (allItemsPlaced && !showSuccess) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }
              }}
            >
              <Sparkles size={22} />
              {showSuccess ? 'Completed!' : 'Complete Plating'}
            </button>

            <button
              onClick={handleReset}
              style={{
                background: 'white',
                color: '#6b7280',
                padding: '18px 48px',
                borderRadius: '16px',
                fontSize: '19px',
                fontWeight: '800',
                border: '3px solid #e5e7eb',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = '#9ca3af';
                e.currentTarget.style.color = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>

          {showSuccess && (
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '20px',
              padding: '36px',
              textAlign: 'center',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
              border: '4px solid #fbbf24',
              animation: 'slideUp 0.5s ease-out'
            }}>
              <div style={{ fontSize: '72px', marginBottom: '20px', animation: 'bounce 1s ease-in-out' }}>🎉</div>
              <h2 style={{
                fontSize: '40px',
                fontWeight: '900',
                color: '#d97706',
                margin: '0 0 12px 0'
              }}>
                Nice presentation, Chef!
              </h2>
              <p style={{
                fontSize: '20px',
                color: '#92400e',
                fontWeight: '700',
                margin: 0
              }}>
                Your dish looks absolutely delicious! 🌟
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes placeItemBounce {
          0% { transform: translate(-50%, -50%) scale(0) rotate(-180deg); }
          50% { transform: translate(-50%, -50%) scale(1.3) rotate(10deg); }
          70% { transform: translate(-50%, -50%) scale(0.9) rotate(-5deg); }
          100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes sparkleFloat {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) translateY(-30px) scale(0); opacity: 0; }
        }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(700px) rotate(720deg); opacity: 0; }
        }
        @keyframes slideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes plateGlow {
          0%, 100% { 
            box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.15), 
                        0 12px 40px rgba(0, 0, 0, 0.25), 
                        0 0 40px rgba(251, 191, 36, 0.6), 
                        0 0 80px rgba(251, 191, 36, 0.3); 
          }
          50% { 
            box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.15), 
                        0 12px 40px rgba(0, 0, 0, 0.25), 
                        0 0 60px rgba(251, 191, 36, 0.8), 
                        0 0 120px rgba(251, 191, 36, 0.4); 
          }
        }
      `}</style>
    </div>
  );
};

export default PlatingGame;