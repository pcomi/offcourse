const axios = require('axios');
const Location = require('../models/location-model');
const { getAllLocationsFromGoogleMaps, gridSearch } = require('../utils/location-utils');

const getLocations = async (req, res) => {
    try 
    {
        const locations = await Location.find();
        console.log('Fetched locations:', locations);
        res.json(locations);
    } 
    catch (err) 
    {
        console.error('Error fetching locations:', err);
        res.status(500).json({ error: 'Error fetching locations' });
    }
};

const addAllLocations = async (req, res) => {
    const { lat, long, radius = 150 } = req.body; 

    const apiKey = 'AIzaSyC9S6sNtOMkoSQPR435hofXAqcU0lWYCXM';
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${long}&radius=${radius}&key=${apiKey}`;

    try 
    {
        console.log('Making API request:', apiUrl);
        const response = await axios.get(apiUrl);
        const locations = response.data.results;

        const savedLocations = [];
        for (const location of locations) 
        {
            const newLocation = new Location({
                name: location.name,
                latitude: location.geometry.location.lat,
                longitude: location.geometry.location.lng,
            });

            await newLocation.save();
            savedLocations.push(newLocation);
        }

        res.json({ message: 'Locations added to database', locations: savedLocations });
    } 
    catch (error) 
    {
        console.error('Error fetching locations from Google API:', error);
        res.status(500).json({ error: 'Error adding locations' });
    }
};

module.exports = {
    getLocations,
    addAllLocations
};