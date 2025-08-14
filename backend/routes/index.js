const express = require('express');
const { teacherLogin, getPollHistory, healthCheck } = require('../controllers/pollController');

const router = express.Router();

router.post('/teacher-login', teacherLogin);
router.get('/poll-history', getPollHistory);
router.get('/health', healthCheck);

module.exports = router;


