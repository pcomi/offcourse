const express = require('express');
const router = express.Router();
const { addRandomLocation, getLocations } = require('../controllers/location-controller');

// Route to get all locations
router.get('/locations', getLocations);

// Route to add a random location
router.post('/locations/random', addRandomLocation);

module.exports = router;
