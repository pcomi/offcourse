const axios = require('axios');
require('dotenv').config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const LOCATION_RADIUS = 20;

let step = 0;
const stepIncrement = 0.01; 
const LAT_METER_TO_DEGREE = 40 / 111139;
const LNG_METER_TO_DEGREE = 40 / 111319;
///starting point
let centerLat = 47.15661;
let centerLng = 27.58937;


const getAllLocationsFromGoogleMaps = async () => {
    try 
    {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${centerLat},${centerLng}&radius=${LOCATION_RADIUS}&key=${GOOGLE_MAPS_API_KEY}`;
        console.log('Fetching locations from Google Maps API:', url);
        
        const response = await axios.get(url);
        
        if (response.data.results.length === 0) 
        {
            console.log('No locations found');
            return [];
        }

        const locations = response.data.results.map(location => ({
            name: location.name,
            latitude: location.geometry.location.lat,
            longitude: location.geometry.location.lng
        }));

        console.log('Locations fetched:', locations);
        return locations;
    } 
    catch (error) 
    {
        console.error('Error fetching locations from Google Maps API:', error);
        throw error;
    }
};

const gridSearch = async () => {
    const allLocations = [];
    
    let currentLat = centerLat;
    let currentLng = centerLng;

    for (let i = 0; i <= 3; i++) 
    {
        console.log(`Step ${i + 1}:`);
        
        const locations = await getAllLocationsFromGoogleMaps(currentLat, currentLng);
        allLocations.push(...locations);

        currentLat += LAT_METER_TO_DEGREE;
        currentLng += LNG_METER_TO_DEGREE;
    }

    return allLocations;
};

module.exports = {
    getAllLocationsFromGoogleMaps,
    gridSearch
};
