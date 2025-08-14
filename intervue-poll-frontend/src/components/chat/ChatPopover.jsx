import React, { useState, useEffect, useRef } from "react";
import { Button, Popover, OverlayTrigger, Tab, Nav } from "react-bootstrap";
import Chat from "./Chat";
import "./Chat.css";
import chatIcon from "../../assets/chat.svg";

const ChatPopover = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState([]);
  const [pollActivity, setPollActivity] = useState([]);
  const chatWindowRef = useRef(null);
  
  useEffect(() => {
    if (!socket) return;
    
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
    const username = sessionStorage.getItem("username");
    socket.emit("joinChat", { username });

    socket.on("chatMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    socket.on("participantsUpdate", (participantsList) => {
      setParticipants(participantsList);
    });
    
    // Listen for student participation in polls
    socket.on("studentParticipated", (data) => {
      const activity = {
        type: "vote",
        username: data.username,
        option: data.option,
        timestamp: new Date().toLocaleTimeString()
      };
      setPollActivity(prev => [...prev, activity]);
    });
    
    // Listen for poll creation
    socket.on("pollCreated", (pollData) => {
      const activity = {
        type: "poll_created",
        question: pollData.question,
        teacher: pollData.teacherUsername,
        timestamp: new Date().toLocaleTimeString()
      };
      setPollActivity(prev => [...prev, activity]);
    });
    
    // Listen for poll end
    socket.on("pollEnded", (data) => {
      const activity = {
        type: "poll_ended",
        timestamp: new Date().toLocaleTimeString()
      };
      setPollActivity(prev => [...prev, activity]);
    });
    
    return () => {
      socket.off("participantsUpdate");
      socket.off("chatMessage");
      socket.off("studentParticipated");
      socket.off("pollCreated");
      socket.off("pollEnded");
    };
  }, [socket]);
  
  const username = sessionStorage.getItem("username");

  const handleSendMessage = () => {
    if (!socket || !newMessage.trim()) return;
    
    const message = { user: username, text: newMessage };
    socket.emit("chatMessage", message);
    setNewMessage("");
  };
  
  const handleKickOut = (participant, index) => {
    if (!socket) return;
    
    socket.emit("kickOut", participant);
  };

  const participantsTab = (
    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
      {participants.length === 0 ? (
        <div>No participants connected</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              {username && username.startsWith("Teacher") ? <th>Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <tr key={index}>
                <td>{participant}</td>
                {username && username.startsWith("Teacher") ? (
                  <td>
                    <button
                      style={{ fontSize: "10px" }}
                      onClick={() => handleKickOut(participant)}
                      className="btn btn-link"
                    >
                      Kick Out
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const pollActivityTab = (
    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
      {pollActivity.length === 0 ? (
        <div>No poll activity yet</div>
      ) : (
        <div>
          {pollActivity.slice(-10).reverse().map((activity, index) => (
            <div key={index} className="mb-2 p-2 border rounded">
              {activity.type === "vote" && (
                <div>
                  <strong>{activity.username}</strong> voted for <strong>{activity.option}</strong>
                  <small className="text-muted d-block">{activity.timestamp}</small>
                </div>
              )}
              {activity.type === "poll_created" && (
                <div>
                  <strong>{activity.teacher}</strong> created a new poll: "{activity.question}"
                  <small className="text-muted d-block">{activity.timestamp}</small>
                </div>
              )}
              {activity.type === "poll_ended" && (
                <div>
                  <strong>Poll ended</strong>
                  <small className="text-muted d-block">{activity.timestamp}</small>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const popover = (
    <Popover
      id="chat-popover"
      style={{ width: "400px", height: "400px", fontSize: "12px" }}
    >
      <Popover.Body style={{ height: "100%" }}>
        <Tab.Container defaultActiveKey="chat">
          <Nav variant="underline">
            <Nav.Item>
              <Nav.Link className="tab-item message-form" eventKey="chat">
                Chat
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className="tab-item" eventKey="participants">
                Participants
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className="tab-item" eventKey="activity">
                Poll Activity
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="mt-3">
            <Tab.Pane eventKey="chat">
              <Chat
                messages={messages}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="participants">{participantsTab}</Tab.Pane>
            <Tab.Pane eventKey="activity">{pollActivityTab}</Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger="click"
      placement="left"
      overlay={popover}
      rootClose
    >
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          padding: "10px",
          background: "rgba(90, 102, 209, 1)",
          borderRadius: "100%",
          cursor: "pointer",
        }}
      >
        <img
          style={{ width: "30px", height: "30px" }}
          src={chatIcon}
          alt="chat icon"
        />
      </div>
    </OverlayTrigger>
  );
};

export default ChatPopover;
