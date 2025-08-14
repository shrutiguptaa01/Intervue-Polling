const state = require('../store/state');

const teacherLogin = (req, res) => {
  const username = `Teacher_${Date.now()}`;
  res.json({ username });
};

const getPollHistory = (req, res) => {
  res.json(state.pollHistory);
};

const healthCheck = (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
};

module.exports = {
  teacherLogin,
  getPollHistory,
  healthCheck
};


