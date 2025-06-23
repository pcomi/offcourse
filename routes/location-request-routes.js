const express = require('express');
const router = express.Router();
const { 
    submitLocationRequest, 
    getLocationRequests, 
    getRequestsByStatus 
} = require('../controllers/location-request-controller');

// Submit a new location request
router.post('/requests', submitLocationRequest);

// Get all location requests (for admin)
router.get('/requests', getLocationRequests);

// Get requests by status
router.get('/requests/:status', getRequestsByStatus);

module.exports = router;