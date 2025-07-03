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

///submit request by user
router.post('/requests', upload.array('photos', 5), submitLocationRequest);

///for admin
router.get('/requests', getLocationRequests);

router.get('/requests/status/:status', getRequestsByStatus);

router.get('/requests/:requestId/images', getRequestImages);

router.post('/requests/:requestId/approved', approveLocationRequest);

router.post('/requests/:requestId/rejected', rejectLocationRequest);

module.exports = router;