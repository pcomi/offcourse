const locations = [
    {
        lat: 45.439553282265386,
        lng: 28.055940792900913,
        name: "Test"
    }
];

const locationIcon = L.icon({
    iconUrl: '../public/icons/marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

function addLocationsToMap(map) 
{
    locations.forEach(location => 
        {
            L.marker([location.lat, location.lng], { icon: locationIcon })
            .addTo(map)
            .bindPopup(location.name);
    });
}

if (typeof module !== 'undefined' && module.exports) 
{
    module.exports = addLocationsToMap;
}