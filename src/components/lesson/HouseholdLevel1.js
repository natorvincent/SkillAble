import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import all images
import whiteShirtImg from '../../assets/householdLevel1/WhiteShirt.png';
import bluePajamasImg from '../../assets/householdLevel1/BluePajamas.png';
import redPantsImg from '../../assets/householdLevel1/RedPants.png';
import whiteSocksImg from '../../assets/householdLevel1/WhiteSocks.png';
import greenJacketImg from '../../assets/householdLevel1/GreenJacket.png';
import whitePantsImg from '../../assets/householdLevel1/WhitePants.png';
import greenClothesImg from '../../assets/householdLevel1/GreenClothes.png';
import whiteJacketImg from '../../assets/householdLevel1/WhiteJacket.png';
import blueTshirtImg from '../../assets/householdLevel1/BlueTshirt.png';
import redSocksImg from '../../assets/householdLevel1/RedSocks.png';
import blackPantsImg from '../../assets/householdLevel1/BlackPants.png';
import whiteShortsImg from '../../assets/householdLevel1/WhiteShort.png';
import washingMachine1Img from '../../assets/householdLevel1/WashingMachine1.png';
import washingMachine2Img from '../../assets/householdLevel1/WashingMachine2.png';
import wonderingImg from '../../assets/householdLevel1/Wondering.png';
import happyImg from '../../assets/householdLevel1/Happy.png';
import basketImg from '../../assets/householdLevel1/Basket.png';
import laundryBgImg from '../../assets/householdLevel1/BackgroundLaundry.png';

const HouseholdLevel1 = () => {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [avatar, setAvatar] = useState('wonder');
  const [gameWon, setGameWon] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverMachine, setDragOverMachine] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [wrongDrop, setWrongDrop] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });

  const clothingItems = [
    { id: 1, name: 'White T-Shirt', type: 'whites', image: whiteShirtImg },
    { id: 2, name: 'Blue Pajamas', type: 'colors', image: bluePajamasImg },
    { id: 3, name: 'Red Pants', type: 'colors', image: redPantsImg },
    { id: 4, name: 'White Socks', type: 'whites', image: whiteSocksImg },
    { id: 5, name: 'Green Jacket', type: 'colors', image: greenJacketImg },
    { id: 6, name: 'White Pants', type: 'whites', image: whitePantsImg },
    { id: 7, name: 'Green Clothes', type: 'colors', image: greenClothesImg },
    { id: 8, name: 'White Jacket', type: 'whites', image: whiteJacketImg },
    { id: 9, name: 'Blue T-Shirt', type: 'colors', image: blueTshirtImg },
    { id: 10, name: 'Red Socks', type: 'colors', image: redSocksImg },
    { id: 11, name: 'Black Pants', type: 'colors', image: blackPantsImg },
    { id: 12, name: 'White Shorts', type: 'whites', image: whiteShortsImg },
  ];

  const currentItem = clothingItems[currentItemIndex];

  useEffect(() => {
    if (currentItemIndex >= clothingItems.length) {
      setGameWon(true);
      setAvatar('happy');
    }
  }, [currentItemIndex]);

  const handleStartGame = () => {
    setShowStartScreen(false);
  };

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e, machineType) => {
    e.preventDefault();
    setDragOverMachine(machineType);
  };

  const handleDragLeave = () => {
    setDragOverMachine(null);
  };

  const handleDrop = (e, machineType) => {
    e.preventDefault();
    setDragOverMachine(null);
    
    if (!draggedItem) return;

    const isCorrect = draggedItem.type === machineType;

    if (isCorrect) {
      setAvatar('happy');
      
      // Get the position of the clothing item for confetti
      const clothingItemRect = e.currentTarget.getBoundingClientRect();
      setConfettiPosition({
        x: clothingItemRect.left + clothingItemRect.width / 2,
        y: clothingItemRect.top + clothingItemRect.height / 2
      });
      
      setShowConfetti(true);
      
      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 2000);
      
      // Move to next item after animation
      setTimeout(() => {
        setCurrentItemIndex(prev => prev + 1);
        setAvatar('wonder');
      }, 1000);
      
    } else {
      // Wrong drop - shake animation
      setWrongDrop(true);
      setTimeout(() => setWrongDrop(false), 600);
    }
    
    setDraggedItem(null);
  };

  const resetGame = () => {
    setCurrentItemIndex(0);
    setGameWon(false);
    setAvatar('wonder');
    setShowStartScreen(true);
  };

  const handleGoHome = () => {
    window.location.href = '/homepage';
  };

  const avatarImages = {
    wonder: wonderingImg,
    happy: happyImg
  };

  // Start screen
  if (showStartScreen) {
    return (
      <div style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${laundryBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(144, 190, 109, 0.8) 0%, rgba(25, 130, 196, 0.8) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 1
        }}>
          <h1 style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '5rem',
            textShadow: '3px 3px 6px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            Laundry Sorting
          </h1>
          
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.95)', 
            marginBottom: '3rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1.5rem',
            lineHeight: 1.5,
            textAlign: 'center',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            maxWidth: '600px',
            padding: '0 1rem'
          }}>
            Learn how to sort laundry by color! Separate whites from colors to keep your clothes looking their best.
          </p>
          
          <button 
            onClick={handleStartGame}
            style={{ 
              background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
              color: 'white',
              padding: '1rem 4rem',
              borderRadius: '25px',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: '700',
              fontSize: '1.5rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Start Sorting!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100vh",
      width: "100%",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    }}>
      {/* Blurred Background */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${laundryBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        filter: "blur(3px)",
        zIndex: 0
      }} />

      {/* Confetti Effect - Positioned on the clothing item */}
      <AnimatePresence>
        {showConfetti && (
          <div style={{
            position: "absolute",
            left: confettiPosition.x,
            top: confettiPosition.y,
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
            pointerEvents: "none"
          }}>
            {[...Array(25)].map((_, i) => {
              const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9', '#FF7979', '#6C5CE7', '#A29BFE'];
              const randomColor = colors[Math.floor(Math.random() * colors.length)];
              const randomAngle = Math.random() * Math.PI * 2;
              const randomDistance = 50 + Math.random() * 100;
              const randomDelay = Math.random() * 0.3;
              const randomDuration = 1 + Math.random() * 0.5;
              const randomSize = 8 + Math.random() * 12;
              
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    rotate: 0
                  }}
                  animate={{ 
                    x: Math.cos(randomAngle) * randomDistance,
                    y: Math.sin(randomAngle) * randomDistance - 50, // Slight upward bias
                    opacity: 0,
                    scale: 0.3,
                    rotate: Math.random() * 360
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: randomDuration,
                    delay: randomDelay,
                    ease: "easeOut"
                  }}
                  style={{
                    position: "absolute",
                    width: `${randomSize}px`,
                    height: `${randomSize}px`,
                    backgroundColor: randomColor,
                    borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <div style={{
        width: "100%",
        height: "100%",
        maxWidth: "1600px",
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        gap: "2rem"
      }}>
        {/* LEFT SIDE - Character and Basket */}
        {!gameWon && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem"
          }}>
            {/* LARGE Character */}
            <motion.img 
              src={avatarImages[avatar]} 
              alt={avatar === 'wonder' ? 'Wondering' : 'Happy'}
              animate={{ scale: avatar === 'happy' ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5 }}
              style={{
                width: "280px",
                height: "280px",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))"
              }}
            />

            {/* Laundry Basket with Single Item Above */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              {/* Single Clothing Item Above Basket - MUCH LARGER */}
              <div style={{
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.5rem"
              }}>
                <AnimatePresence mode="wait">
                  {currentItem && (
                    <motion.div
                      key={currentItem.id}
                      initial={{ opacity: 0, scale: 0, y: -50 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        x: wrongDrop ? [-20, 20, -20, 20, 0] : 0
                      }}
                      exit={{ opacity: 0, scale: 0, y: 50 }}
                      transition={{ 
                        duration: 0.5,
                        type: "spring",
                        x: { duration: 0.6 }
                      }}
                      draggable
                      onDragStart={() => handleDragStart(currentItem)}
                      onDragEnd={(e) => {
                        e.target.style.opacity = '1';
                      }}
                      style={{
                        width: "200px", // Increased from 140px
                        height: "200px", // Increased from 140px
                        cursor: "grab",
                        transition: "all 0.2s ease",
                        filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.3))", // Enhanced shadow
                        position: "relative"
                      }}
                      whileHover={{
                        scale: 1.2, // Slightly larger hover effect
                        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))"
                      }}
                    >
                      <img 
                        src={currentItem.image} 
                        alt={currentItem.name}
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          pointerEvents: "none"
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Laundry Basket */}
              <img 
                src={basketImg}
                alt="Laundry Basket"
                style={{
                  width: "260px", // Slightly larger basket to match larger clothes
                  height: "auto",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.3))"
                }}
              />

              {/* Progress Indicator */}
              <div style={{
                marginTop: "1rem",
                fontSize: "1.3rem",
                fontWeight: "bold",
                color: "white",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                fontFamily: 'Poppins, sans-serif'
              }}>
                {currentItemIndex + 1} / {clothingItems.length}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT SIDE - Two Washing Machines */}
        {!gameWon && (
          <div style={{
            display: "flex",
            gap: "2rem", // Reduced gap between machines
            alignItems: "center"
          }}>
            {/* WHITE Machine */}
            <div
              onDragOver={(e) => handleDragOver(e, 'whites')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'whites')}
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.3s ease",
                transform: dragOverMachine === 'whites' ? 'scale(1.08)' : 'scale(1)',
                filter: dragOverMachine === 'whites' 
                  ? 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.9))' 
                  : 'drop-shadow(0 6px 15px rgba(0,0,0,0.25))'
              }}
            >
              <img 
                src={washingMachine2Img} 
                alt="White Washing Machine"
                style={{
                  width: "300px", // Slightly larger machines
                  height: "300px",
                  objectFit: "contain",
                  marginBottom: "0.5rem"
                }}
              />
              <h2 style={{
                fontSize: "2.8rem",
                fontWeight: "bold",
                margin: "0",
                color: "#7F8C8D",
                fontFamily: 'Poppins, sans-serif',
                textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
                letterSpacing: "2px"
              }}>
                WHITE
              </h2>
            </div>

            {/* COLOUR Machine */}
            <div
              onDragOver={(e) => handleDragOver(e, 'colors')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'colors')}
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "all 0.3s ease",
                transform: dragOverMachine === 'colors' ? 'scale(1.08)' : 'scale(1)',
                filter: dragOverMachine === 'colors' 
                  ? 'drop-shadow(0 0 30px rgba(156, 39, 176, 0.9))' 
                  : 'drop-shadow(0 6px 15px rgba(0,0,0,0.25))'
              }}
            >
              <img 
                src={washingMachine1Img} 
                alt="Colour Washing Machine"
                style={{
                  width: "300px", // Slightly larger machines
                  height: "300px",
                  objectFit: "contain",
                  marginBottom: "0.5rem"
                }}
              />
              <h2 style={{
                fontSize: "2.8rem",
                fontWeight: "bold",
                margin: "0",
                fontFamily: 'Poppins, sans-serif',
                textShadow: "3px 3px 6px rgba(0,0,0,0.2)",
                letterSpacing: "2px",
                background: "linear-gradient(90deg, #E74C3C, #F39C12, #27AE60, #3498DB, #9B59B6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                COLOUR
              </h2>
            </div>
          </div>
        )}

        {/* Game Won Screen */}
        {gameWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: "linear-gradient(135deg, #FFD54F 0%, #66BB6A 100%)",
              padding: "3rem 4rem",
              borderRadius: "30px",
              textAlign: "center",
              boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
              maxWidth: "600px",
              margin: "0 auto"
            }}
          >
            <img 
              src={avatarImages.happy} 
              alt="Happy"
              style={{
                width: "200px",
                height: "200px",
                objectFit: "contain",
                marginBottom: "1rem",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
              }}
            />
            <h2 style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              color: "white",
              textShadow: "3px 3px 6px rgba(0,0,0,0.3)",
              marginBottom: "1rem",
              fontFamily: 'Poppins, sans-serif'
            }}>
              Great Job!
            </h2>
            <p style={{
              fontSize: "1.8rem",
              color: "white",
              marginBottom: "2rem",
              fontFamily: 'Inter, sans-serif'
            }}>
              All laundry sorted correctly!
            </p>
            
            <div style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center"
            }}>
              <button
                onClick={resetGame}
                style={{
                  background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                  color: 'white',
                  padding: '1rem 3rem',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.3rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(255, 89, 94, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px rgba(255, 89, 94, 0.5)';
                }}
              >
                Start Over
              </button>
              
              <button
                onClick={handleGoHome}
                style={{
                  background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                  color: 'white',
                  padding: '1rem 3rem',
                  borderRadius: '25px',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: '700',
                  fontSize: '1.3rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(25, 130, 196, 0.5)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(25, 130, 196, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 25px rgba(25, 130, 196, 0.5)';
                }}
              >
                Go Home
              </button>
            </div>
          </motion.div>
        )}

        {/* Bottom Buttons */}
        {!gameWon && (
          <div style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center"
          }}>
            <button
              onClick={resetGame}
              style={{
                background: 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)',
                color: 'white',
                padding: '0.875rem 2.5rem',
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.125rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(255, 89, 94, 0.5)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #FF7B7E 0%, #FF595E 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 30px rgba(255, 89, 94, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #FF595E 0%, #E04549 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px rgba(255, 89, 94, 0.5)';
              }}
            >
              Start Over
            </button>
            
            <button
              onClick={handleGoHome}
              style={{
                background: 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)',
                color: 'white',
                padding: '0.875rem 2.5rem',
                borderRadius: '25px',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: '700',
                fontSize: '1.125rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(25, 130, 196, 0.5)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #42A5F5 0%, #1982C4 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 30px rgba(25, 130, 196, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #1982C4 0%, #1568A0 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px rgba(25, 130, 196, 0.5)';
              }}
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseholdLevel1;