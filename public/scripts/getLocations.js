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
                const locationLat = location.latitude;
                const locationLng = location.longitude;
                const locationName = location.name;

                const popupContent = `
                    <span>
                        ${locationName}<br>
                        <span id="explore-${location.id}" style="cursor: pointer; color: blue; text-decoration: underline;">
                            Explore
                        </span>
                    </span>
                `;

                const marker = L.marker([locationLat, locationLng], { icon: locationIcon }).addTo(map);
                marker.bindPopup(popupContent);

                marker.on('popupopen', () => {
                    document.getElementById(`explore-${location.id}`).addEventListener('click', () => {
                        console.log(`Exploring location: ${locationName}`);///JUST TESTING FOR NOW
                    });
                });
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
