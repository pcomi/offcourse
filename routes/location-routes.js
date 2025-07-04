const express = require('express');
const router = express.Router();
const { verifyAuth } = require('../utils/auth-middleware');
const { 
    addAllLocations, 
    getLocations, 
    getLocationById,
    getLocationImages,
    addUserLocation, 
    updateLocation 
} = require('../controllers/location-controller');

///all location routes require authentication
router.get('/locations', verifyAuth, getLocations);
router.get('/locations/:id', verifyAuth, getLocationById);
router.get('/locations/:id/images', verifyAuth, getLocationImages);
router.post('/locations/new', verifyAuth, addAllLocations);
router.post('/locations/user', verifyAuth, addUserLocation);
router.put('/locations/:id', verifyAuth, updateLocation);

module.exports = router;