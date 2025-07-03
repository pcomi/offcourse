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
                    <div style="text-align: center; min-width: 200px;">
                        <strong style="display: block; margin-bottom: 8px; font-size: 16px;">${locationName}</strong>
                        <small style="display: block; margin-bottom: 10px; color: #666;">Score: ${location.score || 1}</small>
                        <div style="display: flex; gap: 8px; justify-content: center;">
                            <button id="details-${location._id}" style="
                                background-color: #3498db;
                                color: white;
                                border: none;
                                padding: 8px 12px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 13px;
                                transition: background-color 0.3s;
                            ">View Details</button>
                            <button id="explore-${location._id}" style="
                                background-color: #27ae60;
                                color: white;
                                border: none;
                                padding: 8px 12px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 13px;
                                transition: background-color 0.3s;
                            ">Explore (+50 XP)</button>
                        </div>
                    </div>
                `;

                const marker = L.marker([locationLat, locationLng], { icon: locationIcon }).addTo(map);
                marker.bindPopup(popupContent);

                marker.on('popupopen', () => {
                    const detailsBtn = document.getElementById(`details-${location._id}`);
                    if (detailsBtn) {
                        detailsBtn.addEventListener('click', () => {
                            console.log('Navigating to location details:', location._id);
                            window.location.href = `/details?id=${location._id}`;
                        });
                        
                        detailsBtn.addEventListener('mouseenter', () => {///effects
                            detailsBtn.style.backgroundColor = '#2980b9';
                        });
                        detailsBtn.addEventListener('mouseleave', () => {
                            detailsBtn.style.backgroundColor = '#3498db';
                        });
                    }

                    const exploreBtn = document.getElementById(`explore-${location._id}`);
                    if (exploreBtn) 
                    {
                        exploreBtn.addEventListener('click', () => {
                            console.log('Opening exploration modal for:', location._id, locationName);
                            if (typeof openExplorationModal === 'function') {
                                openExplorationModal(location._id, locationName);
                            } 
                            else 
                            {
                                console.error('openExplorationModal function not found');
                                alert('Exploration feature not available. Please refresh the page.');
                            }
                        });
                        exploreBtn.addEventListener('mouseenter', () => {
                            exploreBtn.style.backgroundColor = '#229954';
                        });
                        exploreBtn.addEventListener('mouseleave', () => {
                            exploreBtn.style.backgroundColor = '#27ae60';
                        });
                    }
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