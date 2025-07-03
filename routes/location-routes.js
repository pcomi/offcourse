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

router.get('/locations', getLocations);

router.get('/locations/:id', getLocationById);

router.get('/locations/:id/images', getLocationImages);

router.post('/locations/new', addAllLocations);

router.post('/locations/user', addUserLocation);

router.put('/locations/:id', updateLocation);

module.exports = router;