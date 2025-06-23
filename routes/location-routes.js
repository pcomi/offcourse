const express = require('express');
const router = express.Router();
const { addAllLocations, getLocations, getLocationById } = require('../controllers/location-controller');

router.get('/locations', getLocations);

router.post('/locations/new', addAllLocations);

router.get('/locations/:id', getLocationById);

module.exports = router;
