const locationIcon = L.icon({
    iconUrl: '/icons/marker.png',
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

async function addLocationsToMap(map) 
{
    const locations = await fetchLocations();
    
    console.log('Locations to add to map:', locations);
    
    locations.forEach(location => {
        L.marker([location.latitude, location.longitude], { icon: locationIcon })
            .addTo(map)
            .bindPopup(location.name);
    });
}

if (typeof module !== 'undefined' && module.exports) 
{
    module.exports = addLocationsToMap;
}
