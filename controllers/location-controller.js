const getRandomLocationFromGoogleMaps = require('../utils/location-utils').getRandomLocationFromGoogleMaps;
const Location = require('../models/location-model');

const getLocations = async (req, res) => {
    try {
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

const addRandomLocation = async (req, res) => {
    try {
        const location = await getRandomLocationFromGoogleMaps();
        
        if (!location) 
        {
            return res.status(500).json({ error: 'Failed to fetch location' });
        }

        const newLocation = new Location({
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude
        });
        
        await newLocation.save();
        res.json({ message: 'Location added to database', location: newLocation });
    } 
    catch (err) 
    {
        console.error('Error adding location:', err);
        res.status(500).json({ error: 'Error adding location' });
    }
};

module.exports = {
    getLocations,
    addRandomLocation
};
