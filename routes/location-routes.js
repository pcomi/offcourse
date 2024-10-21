const express = require('express');
const router = express.Router();
const { addAllLocations, getLocations } = require('../controllers/location-controller');

router.get('/locations', getLocations);

router.post('/locations/new', addAllLocations);

module.exports = router;
