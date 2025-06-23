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
                    <div style="text-align: center;">
                        <strong>${locationName}</strong><br>
                        <small>Score: ${location.score || 1}</small><br>
                        <button id="explore-${location._id}" style="
                            background-color: #3498db;
                            color: white;
                            border: none;
                            padding: 8px 15px;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-top: 5px;
                            font-size: 14px;
                        ">View Details</button>
                    </div>
                `;

                const marker = L.marker([locationLat, locationLng], { icon: locationIcon }).addTo(map);
                marker.bindPopup(popupContent);

                marker.on('popupopen', () => {
                    document.getElementById(`explore-${location._id}`).addEventListener('click', () => {
                        console.log('Navigating to location:', location._id); // Debug log
                        window.location.href = `/details?id=${location._id}`;
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