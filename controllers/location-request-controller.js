const LocationRequest = require('../models/location-request-model');
const Upload = require('../models/upload-model');
const Location = require('../models/location-model');

// Submit a new location request with images
const submitLocationRequest = async (req, res) => {
    try {
        const { name, latitude, longitude, description, address, submitted_by } = req.body;

        console.log('Request data:', { name, latitude, longitude, description, address, submitted_by });
        console.log('Uploaded files:', req.files);

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

        // Create the location request
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

        const savedRequest = await newRequest.save();
        console.log('Location request saved:', savedRequest._id);

        // Save uploaded images to uploads table
        const uploadedFiles = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const upload = new Upload({
                    filename: file.filename,
                    original_name: file.originalname,
                    path: `/uploads/${file.filename}`,
                    size: file.size,
                    mimetype: file.mimetype,
                    uploaded_by: submitted_by,
                    location_request_id: savedRequest._id
                });

                const savedUpload = await upload.save();
                uploadedFiles.push(savedUpload);
                console.log('Image saved:', savedUpload._id);
            }
        }

        res.status(201).json({ 
            message: `Location request submitted successfully with ${uploadedFiles.length} images! It will be reviewed by an admin.`,
            request: savedRequest,
            uploads: uploadedFiles
        });
    } catch (error) {
        console.error('Error submitting location request:', error);
        res.status(500).json({ error: 'Error submitting location request: ' + error.message });
    }
};

// Approve a location request
const approveLocationRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        // Find the request
        const request = await LocationRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request is not pending' });
        }
        
        // Create new location
        const newLocation = new Location({
            name: request.name,
            latitude: request.latitude,
            longitude: request.longitude,
            score: request.score,
            origin: 'users', // Changed from 'user_submission' to 'users'
            description: request.description,
            address: request.address
        });
        
        const savedLocation = await newLocation.save();
        console.log('New location created:', savedLocation._id);
        
        // Update uploads to reference the new location
        await Upload.updateMany(
            { location_request_id: requestId },
            { location_id: savedLocation._id }
        );
        
        // Update request status
        request.status = 'approved';
        await request.save();
        
        res.json({ 
            message: 'Location request approved and added to the map!',
            location: savedLocation
        });
        
    } catch (error) {
        console.error('Error approving request:', error);
        res.status(500).json({ error: 'Error approving request' });
    }
};

// Reject a location request
const rejectLocationRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        // Find the request
        const request = await LocationRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request is not pending' });
        }
        
        // Delete associated images from uploads table
        const uploads = await Upload.find({ location_request_id: requestId });
        if (uploads.length > 0) {
            await Upload.deleteMany({ location_request_id: requestId });
            console.log(`Deleted ${uploads.length} associated images`);
        }
        
        // Delete the request
        await LocationRequest.findByIdAndDelete(requestId);
        
        res.json({ 
            message: 'Location request has been rejected and removed.'
        });
        
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ error: 'Error rejecting request' });
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

// Get images for a location request
const getRequestImages = async (req, res) => {
    try {
        const { requestId } = req.params;
        const images = await Upload.find({ location_request_id: requestId });
        res.json(images);
    } catch (error) {
        console.error('Error fetching request images:', error);
        res.status(500).json({ error: 'Error fetching images' });
    }
};

module.exports = {
    submitLocationRequest,
    approveLocationRequest,
    rejectLocationRequest,
    getLocationRequests,
    getRequestsByStatus,
    getRequestImages
};