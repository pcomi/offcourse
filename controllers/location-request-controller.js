const LocationRequest = require('../models/location-request-model');

// Submit a new location request
const submitLocationRequest = async (req, res) => {
    try {
        const { name, latitude, longitude, description, address, submitted_by } = req.body;

        // Check if a request with the same name and coordinates already exists
        const existingRequest = await LocationRequest.findOne({
            name: name,
            latitude: latitude,
            longitude: longitude
        });

        if (existingRequest) {
            return res.status(400).json({ 
                error: 'A request for this location already exists' 
            });
        }

        const newRequest = new LocationRequest({
            name,
            latitude,
            longitude,
            description: description || '',
            address: address || '',
            submitted_by,
            origin: 'user_submission',
            score: 1,
            status: 'pending'
        });

        await newRequest.save();
        
        res.status(201).json({ 
            message: 'Location request submitted successfully! It will be reviewed by an admin.',
            request: newRequest 
        });
    } catch (error) {
        console.error('Error submitting location request:', error);
        res.status(500).json({ error: 'Error submitting location request' });
    }
};

// Get all location requests (for admin use later)
const getLocationRequests = async (req, res) => {
    try {
        const requests = await LocationRequest.find().sort({ created_at: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching location requests:', error);
        res.status(500).json({ error: 'Error fetching location requests' });
    }
};

// Get requests by status
const getRequestsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const requests = await LocationRequest.find({ status }).sort({ created_at: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests by status:', error);
        res.status(500).json({ error: 'Error fetching requests' });
    }
};

module.exports = {
    submitLocationRequest,
    getLocationRequests,
    getRequestsByStatus
};