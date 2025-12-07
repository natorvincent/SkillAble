import star from '../assets/Star.png';

const Background = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "linear-gradient(135deg, #FFD166 0%, #FFBA2C 100%)",
      }}
    >
      {/* Star 1 - top right */}
      <img
        src={star}
        alt="star"
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "220px",
          height: "220px",
          filter: "drop-shadow(0 0 15px rgba(255, 186, 44, 0.4))",
        }}
      />

      {/* Star 2 - bottom left */}
      <img
        src={star}
        alt="star"
        style={{
          position: "absolute",
          bottom: "-80px",
          left: "-80px",
          width: "250px",
          height: "250px",
          filter: "drop-shadow(0 0 15px rgba(255, 186, 44, 0.4))",
        }}
      />

      {/* Star 3 - middle right */}
      <img
        src={star}
        alt="star"
        style={{
          position: "absolute",
          top: "30%",
          right: "5%",
          width: "280px",
          height: "280px",
          filter: "drop-shadow(0 0 20px rgba(255, 186, 44, 0.5))",
        }}
      />

      {/* Star 4 - top left */}
      <img
        src={star}
        alt="star"
        style={{
          position: "absolute",
          top: "20px",
          left: "-100px",
          width: "200px",
          height: "200px",
          filter: "drop-shadow(0 0 10px rgba(255, 186, 44, 0.4))",
        }}
      />

      {/* Star 5 - bottom right */}
      <img
        src={star}
        alt="star"
        style={{
          position: "absolute",
          bottom: "-100px",
          right: "-70px",
          width: "240px",
          height: "240px",
          filter: "drop-shadow(0 0 15px rgba(255, 186, 44, 0.4))",
        }}
      />

      {/* Center Stars */}
      <img
        src={star}
        alt="star"
        style={{
          position: "absolute",
          top: "25%",
          left: "45%",
          width: "220px",
          height: "220px",
          opacity: 0.2,
          filter: "blur(2px) drop-shadow(0 0 8px rgba(255, 186, 44, 0.3))",
        }}
      />

      {/* New: Star to the left of center */}
      <img
        src={star}
        alt="star"
        style={{
          position: "absolute",
          top: "38%",
          left: "15%",
          width: "280px",
          height: "280px",
          opacity: 0.6,
          filter: "drop-shadow(0 0 15px rgba(255, 186, 44, 0.4))",
        }}
      />

      {/* Subtle overlay for depth */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default Background;