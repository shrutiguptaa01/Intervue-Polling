import React, { useState, useEffect } from "react";
import stars from "../../assets/spark.svg";
import { useNavigate } from "react-router-dom";
import "./StudentLandingPage.css";
import io from "socket.io-client";
import ChatPopover from "../../components/chat/ChatPopover";

let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:3000";
const socket = io(apiUrl);

const StudentLandingPage = () => {
  let navigate = useNavigate();
  const [name, setName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [kickedOut, setKickedOut] = useState(false);

  const handleStudentLogin = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    try {
      // Store student info
      sessionStorage.setItem("username", name);
      
      // Join the session
      socket.emit('joinSession', { 
        username: name, 
        role: 'student'
      });

      // Wait for connection confirmation
      socket.once('joinedSession', (data) => {
        if (data.success) {
          setIsConnected(true);
          navigate("/poll-question");
        }
      });

    } catch (error) {
      console.error("Error logging in student:", error);
      alert("Error connecting to the server. Please try again.");
    }
  };

  // Listen for kick out event
  useEffect(() => {
    socket.on('kickedOut', () => {
      setKickedOut(true);
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('role');
    });

    return () => {
      socket.off('kickedOut');
    };
  }, []);

  return (
    <>
      {kickedOut ? (
        <div className="d-flex justify-content-center align-items-center vh-100 w-75 mx-auto">
          <div className="student-landing-container text-center">
            <button className="btn btn-sm intervue-btn mb-5">
              <img src={stars} className="px-1" alt="" />
              Intervue Poll
            </button>
            <h3 className="landing-title text-danger">
              <b>You have been kicked out by the teacher</b>
            </h3>
            <p className="text-muted">
              You are no longer allowed to participate in this session.
            </p>
            <button 
              className="btn continue-btn my-3"
              onClick={() => navigate("/")}
            >
              Return to Login
            </button>
          </div>
        </div>
      ) : (
        <div className="d-flex justify-content-center align-items-center vh-100 w-50  mx-auto">
          <div className="student-landing-container text-center">
        <button className="btn btn-sm intervue-btn mb-5">
          <img src={stars} className="px-1" alt="" />
          Intervue Poll
        </button>
        <h3 className="landing-title">
          Let's <b>Get Started</b>
        </h3>
        <p className="landing-description">
          If you're a student, you'll be able to{" "}
          <b style={{ color: "black" }}>submit your answers</b>, participate in
          live polls, and see how your responses compare with your classmates
        </p>
        <form onSubmit={handleStudentLogin}>
          <div className="w-50 mx-auto my-4">
            <p className="name-label">Enter your Name</p>
            <input
              type="text"
              className="form-control name-input"
              required="required"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" className="btn continue-btn my-3">
              Continue
            </button>
          </div>
        </form>
      </div>
              <ChatPopover socket={socket} />
        </div>
      )}
    </>
  );
};

export default StudentLandingPage;
