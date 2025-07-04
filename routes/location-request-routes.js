const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const { verifyAuth, verifyAdmin } = require('../utils/auth-middleware');
const { 
    submitLocationRequest, 
    approveLocationRequest,
    rejectLocationRequest,
    getLocationRequests, 
    getRequestsByStatus,
    getRequestImages
} = require('../controllers/location-request-controller');

///user routes
router.post('/requests', verifyAuth, upload.array('photos', 5), submitLocationRequest);

///admin routes
router.get('/requests', verifyAdmin, getLocationRequests);
router.get('/requests/status/:status', verifyAdmin, getRequestsByStatus);
router.get('/requests/:requestId/images', verifyAdmin, getRequestImages);
router.post('/requests/:requestId/approved', verifyAdmin, approveLocationRequest);
router.post('/requests/:requestId/rejected', verifyAdmin, rejectLocationRequest);

module.exports = router;