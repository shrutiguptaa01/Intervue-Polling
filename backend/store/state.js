// Centralized in-memory state for the demo app

const state = {
  activePolls: new Map(),
  connectedUsers: new Map(), // socketId -> { username, role, socketId }
  currentPoll: { value: null },
  pollHistory: []
};

module.exports = state;


