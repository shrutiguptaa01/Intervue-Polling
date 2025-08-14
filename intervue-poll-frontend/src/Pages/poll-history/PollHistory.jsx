import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import backIcon from "../../assets/back.svg";
let apiUrl =
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:3000";
const socket = io(apiUrl);

const PollHistoryPage = () => {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const getPolls = async () => {
      try {
        const response = await axios.get(`${apiUrl}/poll-history`);
        setPolls(response.data);
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    getPolls();
  }, []);

  const calculatePercentage = (count, totalVotes) => {
    if (totalVotes === 0) return 0;
    return (count / totalVotes) * 100;
  };
  
  const handleBack = () => {
    navigate("/teacher-home-page");
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mt-5 w-75">
      <div className="mb-4 text-left">
        <img
          src={backIcon}
          alt=""
          width={"25px"}
          style={{ cursor: "pointer" }}
          onClick={handleBack}
        />{" "}
        View <b>Poll History</b>
      </div>
      
      {polls.length > 0 ? (
        polls.map((poll, index) => {
          const totalVotes = poll.totalVotes || 0;

          return (
            <div key={poll._id} className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="question py-2 ps-2 rounded text-white m-0">
                    {poll.question}?
                  </h6>
                  <small className="text-muted">
                    {formatDate(poll.startTime)}
                  </small>
                </div>
                
                <div className="mb-3">
                  <strong>Teacher:</strong> {poll.teacherUsername} | 
                  <strong> Timer:</strong> {poll.timer}s | 
                  <strong> Total Votes:</strong> {totalVotes} |
                  <strong> Participants:</strong> {poll.participants ? poll.participants.length : 0}
                </div>
                
                <div className="list-group mt-3">
                  {poll.options.map((option) => {
                    const votes = poll.finalResults[option.text] || 0;
                    return (
                      <div
                        key={option.id}
                        className="list-group-item rounded m-1"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{option.text}</span>
                          <span>
                            {Math.round(calculatePercentage(votes, totalVotes))}%
                            ({votes} votes)
                          </span>
                        </div>
                        <div className="progress mt-2">
                          <div
                            className="progress-bar progress-bar-bg"
                            role="progressbar"
                            style={{
                              width: `${calculatePercentage(votes, totalVotes)}%`,
                            }}
                            aria-valuenow={votes}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {poll.participants && poll.participants.length > 0 && (
                  <div className="mt-3">
                    <strong>Students who participated:</strong>
                    <div className="mt-2">
                      {poll.participants.map((student, idx) => (
                        <span key={idx} className="badge bg-secondary me-2">
                          {student}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-muted text-center">
          <h5>No polls found</h5>
          <p>Poll history will appear here after polls are completed.</p>
        </div>
      )}
    </div>
  );
};

export default PollHistoryPage;
