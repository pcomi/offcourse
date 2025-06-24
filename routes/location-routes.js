const express = require('express');
const router = express.Router();
const { 
    addAllLocations, 
    getLocations, 
    getLocationById,
    getLocationImages,
    addUserLocation, 
    updateLocation 
} = require('../controllers/location-controller');

// Get all locations
router.get('/locations', getLocations);

// Get a single location by ID
router.get('/locations/:id', getLocationById);

// Get images for a location
router.get('/locations/:id/images', getLocationImages);

// Add locations from Google API
router.post('/locations/new', addAllLocations);

// Add user-created location
router.post('/locations/user', addUserLocation);

// Update location
router.put('/locations/:id', updateLocation);

module.exports = router;