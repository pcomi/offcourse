const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const { 
    submitLocationRequest, 
    approveLocationRequest,
    rejectLocationRequest,
    getLocationRequests, 
    getRequestsByStatus,
    getRequestImages
} = require('../controllers/location-request-controller');

// Submit a new location request with images
router.post('/requests', upload.array('photos', 5), submitLocationRequest);

// Get all location requests (for admin)
router.get('/requests', getLocationRequests);

// Get requests by status
router.get('/requests/status/:status', getRequestsByStatus);

// Get images for a specific location request
router.get('/requests/:requestId/images', getRequestImages);

// Approve a location request
router.post('/requests/:requestId/approved', approveLocationRequest);

// Reject a location request
router.post('/requests/:requestId/rejected', rejectLocationRequest);

module.exports = router;