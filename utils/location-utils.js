const axios = require('axios');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const LOCATION_RADIUS = 1000;

const getRandomLocationFromGoogleMaps = async () => {
    try 
    {
        const centerLat = 47.15661;
        const centerLng = 27.58937;

        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${centerLat},${centerLng}&radius=${LOCATION_RADIUS}&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('Fetching location from Google Maps API:', url);
        
        const response = await axios.get(url);
        
        if (response.data.results.length === 0) 
        {
            console.log('No locations found');
            return null;
        }

        const randomIndex = Math.floor(Math.random() * response.data.results.length);
        const randomLocation = response.data.results[randomIndex];

        console.log('Random location selected:', randomLocation.name);

        return {
            name: randomLocation.name,
            latitude: randomLocation.geometry.location.lat,
            longitude: randomLocation.geometry.location.lng
        };
    } 
    catch (error) 
    {
        console.error('Error fetching location from Google Maps API:', error);
        throw error;
    }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance * 1000;
};

module.exports = {
    getRandomLocationFromGoogleMaps
};
