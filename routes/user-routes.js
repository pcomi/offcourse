const express = require('express');
const UserController = require('../controllers/user-controller');
const router = express.Router();

router.post('/signup', UserController.signup);

router.post('/signin', UserController.signin);

router.get('/leaderboard', UserController.leaderboard);

module.exports = router;
