import Background from "./Background";
import Navbar from "./Navbar";
import "./login-register/Login.css";
import Typography from "@mui/material/Typography";
import bg from "../assets/bg 1.png";
import boy from '../assets/boy.png';
import girl from '../assets/girl.png';
import blue from '../assets/blu.png';
import pink from '../assets/pink.png';
import purple from '../assets/purple.png';
import yellow from '../assets/yellow.png';
import kids from '../assets/last.png';
import sparkle from '../assets/sparkle.png';
import './LandingPage.css';
import { useNavigate } from "react-router-dom";


function LandingPage() {
  const navigate = useNavigate();

  
  return (
    <div
      className="login-page"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      {/* Background layer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <Background />
      </div>

      {/* Image in front of Background */}
      <img
        src={bg}
        alt="Banner bg"
        style={{
          position: "absolute",
          top: "17%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "1300px",
          height: "auto",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <Navbar />

        {/* Main Section */}
        <section className="main-section" style={{ minHeight: "70vh", position: "relative" }}>
          <img
            src={girl}
            alt="Girl Illustration"
            style={{
              position: "absolute",
              bottom: "-250px",
              left: 0,
              height: "840px",
              objectFit: "contain",
              zIndex: 0,
            }}
          />

          {/* Boy Image - Lower Right */}
          <img
            src={boy}
            alt="Boy Illustration"
            style={{
              position: "absolute",
              bottom: "-290px",
              right: 0,
              height: "860px",
              objectFit: "contain",
              zIndex: 0,
            }}
          />

          {/* Center Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              textAlign: "center",
              gap: "20px",
              zIndex: 2,
              position: "relative",
              marginTop: "160px",
            }}
          >
            <Typography
              component="h1"
              variant="h3"
              sx={{
                fontSize: "60px",
                fontFamily: "Poppins, sans-serif",
                fontWeight: "700",
                color: "#FF595E",
                lineHeight: 1.2,
              }}
            >
              Empowering Independence
              <br />
              Through Life Skills
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "18px",
                fontFamily: "Inter, sans-serif",
                color: "#5A5A5A",
                maxWidth: "500px",
                marginTop: "10px",
              }}
            >
              Learning everyday tasks can be a challenge — we’re here to make it easier and more fun.
            </Typography>

            <button 
              className="landingbutton" 
              style={{ marginTop: "20px" }}
              onClick={() => navigate("/register")}
            >
                Start learning today
            </button>
          </div>
        </section>

        {/* Why Section */}
        <section 
          className="why" 
          style={{ 
            padding: "50px 20px", 
            backgroundColor: "#90be6d", 
            textAlign: "center",
            position: "relative", // <--- important!
            overflow: "hidden",
            }} 
          >
            <img src={sparkle} alt="sparkle" style={{
              position: "absolute",
              top: "20%",
              left: "10%",
              width: "60px",
              transform: "rotate(10deg)",
              zIndex: 0,
              opacity: 0.6,
            }} />
            <img src={sparkle} alt="sparkle" style={{
              position: "absolute",
              top: "60%",
              right: "5%",
              width: "80px",
              transform: "rotate(-15deg)",
              zIndex: 0,
              opacity: 0.5,
            }} />
            <img src={sparkle} alt="sparkle" style={{
              position: "absolute",
              top: "75%",
              left: "20%",
              width: "50px",
              transform: "rotate(25deg)",
              zIndex: 0,
              opacity: 0.7,
            }} />
            <img src={sparkle} alt="sparkle" style={{
              position: "absolute",
              top: "30%",
              left: "80%",
              width: "70px",
              transform: "rotate(-30deg)",
              zIndex: 0,
              opacity: 0.6,
            }} />
            <img src={sparkle} alt="sparkle" style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              width: "40px",
              transform: "rotate(45deg)",
              zIndex: 0,
              opacity: 0.5,
            }} />

          {/* Decorative Blobs */}
          <img src={blue} alt="blue" style={{
            position: "absolute",
            top: "-10px",
            left: "-5%",
            width: "500px",
            zIndex: 0,
          }} />
          <img src={pink} alt="pink" style={{
            position: "absolute",
            top: "-50px",
            right: "-10%",
            width: "500px",
            zIndex: 0,
          }} />
          <img src={purple} alt="purple" style={{
            position: "absolute",
            bottom: "30px",
            left: "-10%",
            width: "500px",
            zIndex: 0,
          }} />
          <img src={yellow} alt="yellow" style={{
            position: "absolute",
            bottom: "-10px",
            right: "-5%",
            width: "500px",
            zIndex: 0,
          }} />

          {/* Box around the title */}
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#540d6e",
              borderRadius: "40px",
              padding: "7px 20px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              marginBottom: "40px",
            }}
          >
            <Typography
              component="h3"
              variant="h5"
              sx={{
                fontSize: "30px",
                fontWeight: "600",
                fontFamily: "Poppins, sans-serif",
                color: "white",
                margin: 0,
              }}
            >
              Why SkillAble?
            </Typography>
          </div>
          <Typography
              variant="subtitle1"
              sx={{
                fontSize: "20px",
                fontFamily: "Inter, sans-serif",
                color: "#280b60",
                maxWidth: "800px",
                marginTop: "0px",
                marginLeft: "auto",
                marginRight: "auto",
                textAlign: "center",
                marginBottom: "30px",
              }}
            >
              Students with ASD and Down Syndrome often face challenges with traditional learning methods. SkillAble bridges this gap by offering a safe, supportive, and enjoyable environment that encourages hands-on practice of real-world skills — all from the comfort of a tablet or computer.
            </Typography>

          {/* Container to align cards horizontally */}
          <div style={{ display: "flex", justifyContent: "center", gap: "50px" }}>
            <div className="card">
              <div className="card-details">
                <p className="text-title">Personalized Learning Paths</p>
                <p className="text-body">Tailored to individual strengths and challenges.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-details">
                <p className="text-title">Designed for Neurodiverse Learners</p>
                <p className="text-body">Adapted for different cognitive and sensory needs.</p>
              </div>
            </div>
            <div className="card">
              <div className="card-details">
                <p className="text-title">Interactive & Gamified Learning</p>
                <p className="text-body">Engaging activities with rewards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Last Section */}
      <section className="last" style={{ position: "relative", padding: "100px 150px", backgroundColor: "#1982c4", minHeight: "500px", overflow: "hidden" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          zIndex: 2,
          position: "relative",
        }}>
          {/* Left Text Content */}
          <div style={{ maxWidth: "600px" }}>
            <Typography
              component="h3"
              variant="h5"
              sx={{
                fontSize: "40px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#ffca3a",
                fontFamily: "Poppins, sans-serif"
              }}
            >
              Start your journey today!
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "20px",
                fontFamily: "Inter, sans-serif",
                color: "white",
                marginTop: "40px",
              }}
            >
              Help your students build the confidence they need to take on everyday challenges and develop the life skills that foster true independence. Join us in creating a supportive, empowering environment where SPED students can thrive—at their own pace, in their own way.
            </Typography>
            <button 
              className="landingbutton" 
              style={{ marginTop: "40px" }}
              onClick={() => navigate("/register")}
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Kids Image - Right Side, Touching Bottom */}
        <img
          src={kids}
          alt="Kids Illustration"
          style={{
            position: "absolute",
            right: "-70px",
            bottom: "0",
            height: "100%",
            maxHeight: "600px",
            zIndex: 1,
          }}
        />
      </section>
      </div>
    </div>
  );
}

export default LandingPage;
