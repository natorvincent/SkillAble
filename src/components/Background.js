import star from '../assets/Star.png';

const Background = () => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#FFBA2C",
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
        }}
      />

      {/* Star 3 - middle right */}
        <img
        src={star}
        alt="star"
        style={{
            position: "absolute",
            top: "30%",
            right: "5%", // moved inside from the edge
            width: "280px",
            height: "280px",
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
        }}
      />
      

      {/* New: Star to the left of center */}
      <img
        src={star}
        alt="star"
        style={{
          position: "absolute",
          top: "38%",
          left: "15%", // left of center but not at the edge
          width: "280px",
          height: "280px",
          opacity: 0.6,
        }}
      />
    </div>
  );
};

export default Background;
