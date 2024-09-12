const Location = require('../models/location-model');

const getLocations = async (req, res) => 
{
    try {
        const locations = await Location.find();
        console.log('Fetched locations:', locations);
        res.json(locations);
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ error: 'Error fetching locations' });
    }
};

module.exports = 
{
    getLocations
};
