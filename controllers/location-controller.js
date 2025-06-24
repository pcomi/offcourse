const axios = require('axios');
const Location = require('../models/location-model');
const Upload = require('../models/upload-model');
const { getAllLocationsFromGoogleMaps, gridSearch } = require('../utils/location-utils');

const getLocations = async (req, res) => {
    try {
        const locations = await Location.find();
        console.log('Fetched locations:', locations);
        res.json(locations);
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ error: 'Error fetching locations' });
    }
};

// Get a single location by ID (needed for detail page)
const getLocationById = async (req, res) => {
    try {
        const { id } = req.params;
        const location = await Location.findById(id);
        
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json(location);
    } catch (err) {
        console.error('Error fetching location:', err);
        res.status(500).json({ error: 'Error fetching location' });
    }
};

// Get images for a location
const getLocationImages = async (req, res) => {
    try {
        const { id } = req.params;
        const images = await Upload.find({ location_id: id });
        res.json(images);
    } catch (err) {
        console.error('Error fetching location images:', err);
        res.status(500).json({ error: 'Error fetching location images' });
    }
};

const addAllLocations = async (req, res) => {
    const { lat, long, radius = 150 } = req.body; 

    const apiKey = 'AIzaSyC9S6sNtOMkoSQPR435hofXAqcU0lWYCXM';
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=${radius}&key=${apiKey}`;

    try {
        console.log('Making API request:', apiUrl);
        const response = await axios.get(apiUrl);
        const locations = response.data.results;

        const savedLocations = [];
        for (const location of locations) {
            // Check if location already exists by name and coordinates
            const existingLocation = await Location.findOne({ 
                name: location.name,
                latitude: location.geometry.location.lat,
                longitude: location.geometry.location.lng
            });

            if (!existingLocation) {
                const newLocation = new Location({
                    name: location.name,
                    latitude: location.geometry.location.lat,
                    longitude: location.geometry.location.lng,
                    origin: 'google_api',
                    address: location.vicinity || '',
                    description: '',
                    score: 1
                });

                await newLocation.save();
                savedLocations.push(newLocation);
            }
        }

        res.json({ 
            message: 'Locations added to database', 
            locations: savedLocations,
            total_new: savedLocations.length,
            total_found: locations.length
        });
    } catch (error) {
        console.error('Error fetching locations from Google API:', error);
        res.status(500).json({ error: 'Error adding locations' });
    }
};

// Add a new user-created location
const addUserLocation = async (req, res) => {
    try {
        const { name, latitude, longitude, description, address } = req.body;

        const newLocation = new Location({
            name,
            latitude,
            longitude,
            origin: 'users',
            description: description || '',
            address: address || '',
            score: 1
        });

        await newLocation.save();
        res.status(201).json({ 
            message: 'User location added successfully', 
            location: newLocation 
        });
    } catch (error) {
        console.error('Error adding user location:', error);
        res.status(500).json({ error: 'Error adding user location' });
    }
};

// Update location
const updateLocation = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const location = await Location.findByIdAndUpdate(id, updates, { new: true });

        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json({ message: 'Location updated successfully', location });
    } catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Error updating location' });
    }
};

module.exports = {
    getLocations,
    getLocationById,
    getLocationImages,
    addAllLocations,
    addUserLocation,
    updateLocation
};