var map = L.map('map').setView([45.9432, 24.9668], 7);

var normalTiles = L.tileLayer('https://api.maptiler.com/maps/backdrop/{z}/{x}/{y}.png?key=EYzsOICzwnKzN6KnoMqN', {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    maxZoom: 19,
    attribution: '&copy; MapTiler &copy; OpenStreetMap contributors'
});

var satelliteTiles = L.tileLayer('https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EYzsOICzwnKzN6KnoMqN', {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    maxZoom: 19,
    attribution: '&copy; MapTiler &copy; OpenStreetMap contributors'
});

normalTiles.addTo(map);

var baseMaps = {
    "Dark": normalTiles,
    "Satellite": satelliteTiles
};

L.control.layers(baseMaps).addTo(map);

navigator.geolocation.watchPosition(success, error);

let marker, circle, zoomed;

function success(pos) {
    const lat = pos.coords.latitude;
    const long = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;

    if (marker) {
        marker.setLatLng([lat, long]);
    } else {
        marker = L.marker([lat, long]).addTo(map);
    }

    if (circle) {
        circle.setLatLng([lat, long]);
        circle.setRadius(accuracy);
    } else {
        circle = L.circle([lat, long], { radius: accuracy }).addTo(map);
    }

    if (!zoomed) {
        zoomed = map.fitBounds(circle.getBounds());
    }

    map.setView([lat, long]);
}

function error(err) {
    if (err.code === 1) {
        alert("Enable location to see current locations");
    } else {
        alert("Error getting current location");
    }
}

addLocationsToMap(map); ///getLocations.js

const addRandomLocation = async () => {
    try {
        console.log('Button clicked to add a random location');
        const response = await fetch('/api/locations/random', { method: 'POST' });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Response from adding location:', result);

        if (result.location) {
            L.marker([result.location.latitude, result.location.longitude], { icon: locationIcon })
                .addTo(map)
                .bindPopup(result.location.name);
        } else {
            alert('Failed to add location');
        }
    } catch (error) {
        console.error('Error adding location:', error);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addLocationBtn');
    if (addButton) {
        addButton.addEventListener('click', addRandomLocation);
    }
});
