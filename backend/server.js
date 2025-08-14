const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { PORT, CLIENT_ORIGIN } = require('./config/env');
const routes = require('./routes');
const state = require('./store/state');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory state (simple demo store)
// state is imported from ./store/state

// Utilities
function broadcastParticipants() {
  const participants = Array.from(new Set(Array.from(state.connectedUsers.values()).map(u => u.username)));
  io.emit('participantsUpdate', participants);
}

function endPoll(pollId) {
  const poll = state.activePolls.get(pollId);
  if (poll) {
    poll.isActive = false;
    const historyEntry = {
      _id: poll._id,
      question: poll.question,
      options: poll.options,
      timer: poll.timer,
      teacherUsername: poll.teacherUsername,
      finalResults: poll.votes,
      participants: poll.participants,
      totalVotes: Object.values(poll.votes).reduce((a, b) => a + b, 0),
      startTime: poll.startTime,
      endTime: Date.now()
    };
    state.pollHistory.push(historyEntry);
    if (state.pollHistory.length > 50) {
      state.pollHistory = state.pollHistory.slice(-50);
    }
    state.currentPoll.value = null;
    io.emit('pollEnded', { pollId, finalResults: poll.votes, historyEntry });
  }
}

// Routes
app.use('/', routes);

// Socket events
io.on('connection', (socket) => {
  // Chat join just for chat panel; reply with current participants
  socket.on('joinChat', (data) => {
    const participants = Array.from(new Set(Array.from(state.connectedUsers.values()).map(u => u.username)));
    socket.emit('participantsUpdate', participants);
  });

  // Relay chat messages
  socket.on('chatMessage', (message) => {
    if (message && typeof message.text === 'string' && typeof message.user === 'string') {
      // Broadcast chat message to all connected users
      io.emit('chatMessage', message);
    }
  });

  // Session join (teacher or student)
  socket.on('joinSession', (data) => {
    const { username, role } = data || {};
    if (!username || !role) {
      socket.emit('joinedSession', { success: false, message: 'Invalid join payload' });
      return;
    }
    state.connectedUsers.set(socket.id, { username, role, socketId: socket.id });
    socket.emit('joinedSession', { success: true, message: `${role} joined the session` });

    // Send running poll state to newly joined student
    if (role === 'student' && state.currentPoll.value) {
      socket.emit('pollCreated', state.currentPoll.value);
      if (state.currentPoll.value.votes) {
        socket.emit('pollResults', state.currentPoll.value.votes);
      }
    }

    broadcastParticipants();
  });

  // Create poll (teacher)
  socket.on('createPoll', (pollData) => {
    if (state.currentPoll.value) {
      socket.emit('pollError', { message: 'A poll is already active. Please wait for it to complete.' });
      return;
    }
    const { question, options, timer, teacherUsername } = pollData || {};
    const pollId = Date.now().toString();
    const poll = {
      _id: pollId,
      question,
      options,
      timer: parseInt(timer),
      teacherUsername,
      votes: {},
      startTime: Date.now(),
      endTime: Date.now() + (parseInt(timer) * 1000),
      studentAnswers: new Set(),
      isActive: true,
      participants: []
    };
    state.activePolls.set(pollId, poll);
    state.currentPoll.value = poll;
    io.emit('pollCreated', poll);
    setTimeout(() => {
      endPoll(pollId);
    }, parseInt(timer) * 1000);
  });

  // Submit vote (student)
  socket.on('submitAnswer', (data) => {
    const { username, option, pollId } = data || {};
    const poll = state.activePolls.get(pollId);
    if (!poll || !poll.isActive) {
      return;
    }

    // Reject if user is not currently connected (e.g., kicked)
    const userConnected = Array.from(state.connectedUsers.values()).some(u => u.username === username);
    if (!userConnected) {
      socket.emit('answerError', { message: 'You are not allowed to vote.' });
      return;
    }

    // Idempotent voting per username per poll
    if (poll.studentAnswers.has(username)) {
      socket.emit('answerError', { message: 'You have already submitted an answer for this poll.' });
      return;
    }
    poll.studentAnswers.add(username);

    if (!poll.participants.includes(username)) {
      poll.participants.push(username);
    }

    if (!poll.votes[option]) {
      poll.votes[option] = 0;
    }
    poll.votes[option] += 1;

    io.emit('pollResults', poll.votes);
    io.emit('studentParticipated', { username, option, pollId });
  });

  // Kick out student (teacher only)
  socket.on('kickOut', (targetUsername) => {
    const requester = state.connectedUsers.get(socket.id);
    if (!requester || requester.role !== 'teacher') {
      return;
    }
    
    // Remove kicked student from all active polls
    state.activePolls.forEach((poll) => {
      if (poll.isActive && poll.studentAnswers.has(targetUsername)) {
        poll.studentAnswers.delete(targetUsername);
        poll.participants = poll.participants.filter(p => p !== targetUsername);
      }
    });
    
    // Find all sockets for that username (could be multiple tabs)
    const targets = Array.from(state.connectedUsers.values()).filter(u => u.username === targetUsername);
    targets.forEach((u) => {
      const targetSocket = io.sockets.sockets.get(u.socketId);
      if (targetSocket) {
        targetSocket.emit('kickedOut');
        targetSocket.disconnect(true);
      }
      state.connectedUsers.delete(u.socketId);
    });
    
    // Broadcast updated participants list
    broadcastParticipants();
    
    // If there's an active poll, also broadcast updated results
    if (state.currentPoll.value) {
      io.emit('pollResults', state.currentPoll.value.votes);
    }
  });

  socket.on('disconnect', () => {
    state.connectedUsers.delete(socket.id);
    broadcastParticipants();
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend should be running on ${CLIENT_ORIGIN}`);
});


