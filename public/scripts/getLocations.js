const locationIcon = L.icon({
    iconUrl: '../icons/marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

async function fetchLocations() 
{
    try 
    {
        const response = await fetch('/api/locations');
        if (!response.ok) 
        {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } 
    catch (error) 
    {
        console.error('There was a problem with the fetch operation:', error);
        return [];
    }
}

const addLocationsToMap = async (map) => {
    try 
    {
        const response = await fetch('/api/locations');
        const locations = await response.json();
        
        console.log('Fetched locations:', locations);

        locations.forEach(location => {
            if (location.latitude != null && location.longitude != null) 
            {
                L.marker([location.latitude, location.longitude], { icon: locationIcon })
                    .addTo(map)
                    .bindPopup(location.name);
            } 
            else 
            {
                console.error('Invalid location data:', location);
            }
        });
    } 
    catch (error) 
    {
        console.error('Error fetching locations:', error);
    }
};

if (typeof module !== 'undefined' && module.exports) 
{
    module.exports = addLocationsToMap;
}
