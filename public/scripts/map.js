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

    if (marker) 
    {
        marker.setLatLng([lat, long]);
    } 
    else 
    {
        marker = L.marker([lat, long]).addTo(map);
    }

    if (circle) 
    {
        circle.setLatLng([lat, long]);
        circle.setRadius(accuracy);
    } 
    else 
    {
        circle = L.circle([lat, long], { radius: accuracy }).addTo(map);
    }

    if (!zoomed) 
    {
        zoomed = map.fitBounds(circle.getBounds());
    }

    map.setView([lat, long]);
}

function error(err) {
    if (err.code === 1) 
    {
        alert("Enable location to see current locations");
    } 
    else 
    {
        alert("Error getting current location");
    }
}

addLocationsToMap(map); ///getLocations.js

let gridBoxes = [];

const addAllLocations = async (lat, long, radius = 150) => {
    const apiUrl = '/api/locations/new';
    try 
    {
        console.log('Sending request to server:', apiUrl);
        const response = await axios.post(apiUrl, { lat, long, radius });
        const locations = response.data.locations;

        map.eachLayer(layer => {
            if (layer instanceof L.Marker) 
            {
                map.removeLayer(layer);
            }
        });

        locations.forEach(location => {
            const locationLat = location.latitude;
            const locationLng = location.longitude;
            const locationName = location.name;

            L.marker([locationLat, locationLng], { icon: locationIcon })
                .addTo(map)
                .bindPopup(locationName);
        });

        console.log('Fetched locations:', locations);
    } 
    catch (error) 
    {
        console.error('Error adding locations:', error);
    }
};

const searchInGrid = (row, col) => {
    const gridBox = gridBoxes.find(box => box.row === row && box.col === col);
    if (!gridBox) 
    {
        alert(`Grid not found for Row: ${row}, Column: ${col}`);
        return;
    }

    const cellSize = 0.002;
    const lat = gridBox.coords.lat + cellSize * 2;
    const long = gridBox.coords.long + cellSize * 2;

    addAllLocations(lat, long);
    console.log('Found Grid:', gridBox);
};

const gridMap = async () => {
    console.log('Button clicked to grid');

    const maxLatd = 47.1601;
    const maxLong = 27.6007;
    const minLatd = 47.1347;
    const minLong = 27.5342;
    const cellSize = 0.002;

    const latSteps = Math.ceil((maxLatd - minLatd) / cellSize);
    const longSteps = Math.ceil((maxLong - minLong) / cellSize);

    console.log('Grid map:', latSteps, longSteps);

    for (let i = 0; i < latSteps; i++) 
    {
        for (let j = 0; j < longSteps; j++) 
        {
            const lat = minLatd + (i * 2 * cellSize);
            const long = minLong + (j * 2 * cellSize);
            
            gridBoxes.push({
                row: i + 1,
                col: j + 1,
                coords: { lat, long },
                size: cellSize,
            });

            gridBox(lat, long, cellSize, i, j);
        }
    }
};

const gridBox = (lat, lng, size, row, col) => {

    const boxCoords = [
        [lat + size, lng - size],
        [lat + size, lng + size],
        [lat - size, lng + size],
        [lat - size, lng - size],
        [lat + size, lng - size]
    ];

    const boxName = `Box Row ${row} Column ${col}`

    L.polygon(boxCoords, { color: 'red', weight: 2, fillOpacity: 0.5 })
        .addTo(map)
        .bindPopup(boxName);
};

document.addEventListener('DOMContentLoaded', () => {
    const addButton = document.getElementById('addLocationBtn');
    if (addButton) 
    {
        addButton.addEventListener('click', addAllLocations);
    }
    
    const gridButton = document.getElementById('showGridsBtn');
    if(gridButton) 
    {
        gridButton.addEventListener('click', gridMap);
    }

    const addGridButton = document.getElementById('gridBtn');
    if(addGridButton) 
    {
        addGridButton.addEventListener('click', () => {
            const row = document.getElementById('row').value;
            const col = document.getElementById('col').value;

            if(!row || !col)
            {
                alert('Please enter row and column');
                return;
            }

            const rowNum = parseInt(row, 10);
            const colNum = parseInt(col, 10);

            searchInGrid(rowNum, colNum, 0.02);
        });
    }
});