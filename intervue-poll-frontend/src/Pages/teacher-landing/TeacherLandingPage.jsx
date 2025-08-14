import React, { useState, useEffect } from "react";
import stars from "../../assets/spark.svg";
import "./TeacherLandingPage.css";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import eyeIcon from "../../assets/eye.svg";
import ChatPopover from "../../components/chat/ChatPopover";
let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "https://intervue-poll-8icq.onrender.com";
const socket = io(apiUrl);

const TeacherLandingPage = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([{ id: 1, text: "", correct: null }]);
  const [timer, setTimer] = useState("60");
  const [error, setError] = useState("");
  const [canAskQuestion, setCanAskQuestion] = useState(true);
  const [currentPoll, setCurrentPoll] = useState(null);
  const navigate = useNavigate();
  const username = sessionStorage.getItem("username");
  const role = sessionStorage.getItem("role");

  useEffect(() => {
    // Join the session
    if (username && role) {
      socket.emit('joinSession', { username, role });
    }

    // Listen for poll state updates
    socket.on('pollCreated', (pollData) => {
      setCurrentPoll(pollData);
      setCanAskQuestion(false);
    });

    socket.on('pollEnded', (data) => {
      setCurrentPoll(null);
      setCanAskQuestion(true);
      setQuestion("");
      setOptions([{ id: 1, text: "", correct: null }]);
    });

    socket.on('pollError', (error) => {
      alert(error.message);
    });

    return () => {
      socket.off('pollCreated');
      socket.off('pollEnded');
      socket.off('pollError');
    };
  }, [username, role]);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleTimerChange = (e) => {
    setTimer(e.target.value);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index].text = value;
    setOptions(updatedOptions);
  };

  const handleCorrectToggle = (index, isCorrect) => {
    const updatedOptions = [...options];
    updatedOptions[index].correct = isCorrect;
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([
      ...options,
      { id: options.length + 1, text: "", correct: null },
    ]);
  };

  const validateForm = () => {
    if (question.trim() === "") {
      setError("Question cannot be empty");
      return false;
    }

    if (options.length < 2) {
      setError("At least two options are required");
      return false;
    }

    const optionTexts = options.map((option) => option.text.trim());
    if (optionTexts.some((text) => text === "")) {
      setError("All options must have text");
      return false;
    }

    const correctOptionExists = options.some(
      (option) => option.correct === true
    );
    if (!correctOptionExists) {
      setError("At least one correct option must be selected");
      return false;
    }

    setError("");
    return true;
  };

  const askQuestion = () => {
    if (!canAskQuestion) {
      alert("Please wait for the current poll to complete before asking a new question.");
      return;
    }

    if (validateForm()) {
      let teacherUsername = sessionStorage.getItem("username");
      let pollData = { 
        question, 
        options, 
        timer, 
        teacherUsername
      };
      socket.emit("createPoll", pollData);
    }
  };

  const handleViewPollHistory = () => {
    navigate("/teacher-poll-history");
  };

  const handleViewCurrentPoll = () => {
    if (currentPoll) {
      navigate("/teacher-poll");
    }
  };

  return (
    <>
      <button
        className="btn rounded-pill ask-question px-4 m-2"
        onClick={handleViewPollHistory}
      >
        <img src={eyeIcon} alt="" />
        View Poll history
      </button>
      
      {currentPoll && (
        <button
          className="btn rounded-pill ask-question px-4 m-2"
          onClick={handleViewCurrentPoll}
        >
          View Current Poll
        </button>
      )}

      <div className="container my-4 w-75 ms-5">
        <button className="btn btn-sm intervue-btn mb-3">
          <img src={stars} alt="Poll Icon" /> Intervue Poll
        </button>

        <h2 className="fw-bold">
          Let's <strong>Get Started</strong>
        </h2>
        <p>
          <b>Teacher: </b>
          {username}
        </p>
        <p className="text-muted">
          You'll have the ability to create and manage polls, ask questions, and
          monitor your students' responses in real-time.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {currentPoll && (
          <div className="alert alert-info">
            <strong>Active Poll:</strong> {currentPoll.question}
            <br />
            <small>Timer: {currentPoll.timer} seconds | Students answered: {currentPoll.studentAnswers ? currentPoll.studentAnswers.size : 0}</small>
          </div>
        )}

        {canAskQuestion ? (
          <>
            <div className="mb-4">
              <div className="d-flex justify-content-between pb-3">
                <label htmlFor="question" className="form-label">
                  Enter your question
                </label>
                <select
                  className="form-select w-auto ms-3"
                  value={timer}
                  onChange={handleTimerChange}
                >
                  <option value="30">30 seconds</option>
                  <option value="60">60 seconds</option>
                  <option value="90">90 seconds</option>
                </select>
              </div>
              <input
                type="text"
                id="question"
                className="form-control"
                onChange={handleQuestionChange}
                rows="3"
                maxLength="100"
                placeholder="Type your question..."
              ></input>
              <div className="text-end text-muted mt-1">{question.length}/100</div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between pb-3">
                <label className="form-label">Edit Options</label>
                <label className="form-label">Is it correct?</label>
              </div>
              {options.map((option, index) => (
                <div key={option.id} className="d-flex align-items-center mb-2">
                  <span className="me-3 sNo">{index + 1}</span>
                  <input
                    type="text"
                    className="form-control me-3 option-input"
                    placeholder="Option text..."
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.correct === true}
                      onChange={() => handleCorrectToggle(index, true)}
                      required="required"
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`correct-${index}`}
                      checked={option.correct === false}
                      onChange={() => handleCorrectToggle(index, false)}
                      required="required"
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn add-options" onClick={addOption}>
              + Add More option
            </button>
          </>
        ) : (
          <div className="alert alert-warning">
            <strong>Poll in Progress:</strong> Please wait for the current poll to complete before asking a new question.
          </div>
        )}
      </div>
      
      {canAskQuestion && (
        <>
          <hr />
          <button
            className="btn rounded-pill ask-question px-4 m-2"
            onClick={askQuestion}
          >
            Ask Question
          </button>
        </>
      )}
              <ChatPopover socket={socket} />
    </>
  );
};

export default TeacherLandingPage;
