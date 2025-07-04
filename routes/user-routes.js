const express = require('express');
const UserController = require('../controllers/user-controller');
const { verifyAuth } = require('../utils/auth-middleware');
const router = express.Router();

///public routes (no auth required)
router.post('/signup', UserController.signup);
router.post('/signin', UserController.signin);

///protected routes (auth required)
router.get('/leaderboard', verifyAuth, UserController.getTopUsers);
router.get('/locations/top', verifyAuth, UserController.getTopLocations);

module.exports = router;