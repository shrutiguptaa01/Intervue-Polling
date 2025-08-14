import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";
import "./StudentPollPage.css";
import stopwatch from "../../assets/stopwatch.svg";
import ChatPopover from "../../components/chat/ChatPopover";
import { useNavigate } from "react-router-dom";
import stars from "../../assets/spark.svg";

let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:3000";
const socket = io(apiUrl);

const StudentPollPage = () => {
  const [votes, setVotes] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState([]);
  const [pollId, setPollId] = useState("");
  const [kickedOut, setKickedOut] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  
  const username = sessionStorage.getItem("username");
  const role = sessionStorage.getItem("role");

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  useEffect(() => {
    // Check if user is properly authenticated
    if (!username || !role) {
      navigate("/");
      return;
    }

    // Join the session
    socket.emit('joinSession', { username, role });

    // Listen for session confirmation
    socket.on('joinedSession', (data) => {
      if (data.success) {
        setIsConnected(true);
      }
    });

    // Listen for poll creation
    socket.on('pollCreated', (pollData) => {
      setPollQuestion(pollData.question);
      setPollOptions(pollData.options);
      setVotes({});
      setSubmitted(false);
      setSelectedOption(null);
      setTimeLeft(pollData.timer);
      setPollId(pollData._id);
    });

    // Listen for poll results updates
    socket.on('pollResults', (updatedVotes) => {
      setVotes(updatedVotes);
    });

    // Listen for poll end
    socket.on('pollEnded', (data) => {
      setTimeLeft(0);
      setSubmitted(true);
      // Show final results
      if (data.finalResults) {
        setVotes(data.finalResults);
      }
    });

    // Listen for answer errors
    socket.on('answerError', (error) => {
      alert(error.message);
    });

    // Handle being kicked by teacher
    socket.on('kickedOut', () => {
      setKickedOut(true);
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('role');
    });

    return () => {
      socket.off('joinedSession');
      socket.off('pollCreated');
      socket.off('pollResults');
      socket.off('pollEnded');
      socket.off('answerError');
      socket.off('kickedOut');
    };
  }, [username, role, navigate]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setSubmitted(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft, submitted]);

  const handleOptionSelect = (option) => {
    if (!submitted && timeLeft > 0) {
      // Only allow one option selection - replace previous selection
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (selectedOption && !submitted && timeLeft > 0) {
      const username = sessionStorage.getItem("username");
      
      if (username) {
        socket.emit("submitAnswer", {
          username: username,
          option: selectedOption,
          pollId: pollId
        });
        setSubmitted(true);
      } else {
        console.error("No username found in session storage!");
      }
    }
  };

  const calculatePercentage = (count) => {
    if (totalVotes === 0) return 0;
    return (count / totalVotes) * 100;
  };

  return (
    <>
      <ChatPopover socket={socket} />
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
        <>
          {pollQuestion === "" && timeLeft === 0 && (
            <div className="d-flex justify-content-center align-items-center vh-100 w-75  mx-auto">
              <div className="student-landing-container text-center">
                <button className="btn btn-sm intervue-btn mb-5">
                  <img src={stars} className="px-1" alt="" />
                  Intervue Poll
                </button>
                <br />
                <div
                  className="spinner-border text-center spinner"
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h3 className="landing-title">
                  <b>Wait for the teacher to ask questions..</b>
                </h3>
                <p className="text-muted">
                  Student: {username}
                </p>
              </div>
            </div>
          )}
          
          {pollQuestion !== "" && (
            <div className="container mt-5 w-50">
              <div className="d-flex align-items-center mb-4">
                <h5 className="m-0 pe-5">Question</h5>
                <img
                  src={stopwatch}
                  width="15px"
                  height="auto"
                  alt="Stopwatch"
                />
                <span className="ps-2 ml-2 text-danger">{timeLeft}s</span>
              </div>
              <div className="card">
                <div className="card-body">
                  <h6 className="question py-2 ps-2 float-left rounded text-white">
                    {pollQuestion}?
                  </h6>
                  <p className="text-muted small mt-2 mb-3">
                    <strong>Note:</strong> You can only select one option. Click on an option to select it, then click Submit.
                  </p>
                  <div className="list-group mt-4">
                    {pollOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`list-group-item rounded m-1 ${
                          selectedOption === option.text
                            ? "border option-border bg-primary text-white"
                            : ""
                        }`}
                        style={{
                          padding: "10px",
                          cursor:
                            submitted || timeLeft === 0
                              ? "not-allowed"
                              : "pointer",
                        }}
                        onClick={() => handleOptionSelect(option.text)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span
                            className={`ml-2 text-left ${
                              submitted ? "font-weight-bold" : ""
                            }`}
                          >
                            {option.text}
                          </span>
                          {submitted && (
                            <span className="text-right">
                              {Math.round(
                                calculatePercentage(votes[option.text] || 0)
                              )}
                              %
                            </span>
                          )}
                        </div>
                        {submitted && (
                          <div className="progress mt-2">
                            <div
                              className="progress-bar progress-bar-bg"
                              role="progressbar"
                              style={{
                                width: `${calculatePercentage(
                                  votes[option.text] || 0
                                )}%`,
                              }}
                              aria-valuenow={votes[option.text] || 0}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {!submitted && selectedOption && timeLeft > 0 && (
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-success">
                    <strong>Selected:</strong> {selectedOption}
                  </div>
                  <button
                    type="submit"
                    className="btn continue-btn my-3 w-25"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              )}

              {submitted && (
                <div className="mt-5">
                  <h6 className="text-center">
                    {timeLeft === 0 ? 'Poll has ended. Final results:' : 'Wait for the teacher to ask a new question...'}
                  </h6>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default StudentPollPage;
