// Get location ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const locationId = urlParams.get('id');

let detailMap;

const populateUsernameField = () => {
    const usernameField = document.getElementById('username');
    const userData = TokenUtils.getUserDataFromToken();
    if (userData && usernameField) {
        usernameField.value = userData.username;
    }
};

function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = '/login';
}

// Initialize map
function initializeMap(lat, lng, name) {
    if (detailMap) {
        detailMap.remove();
    }
    
    detailMap = L.map('detailMap').setView([lat, lng], 15);
    
    L.tileLayer('https://api.maptiler.com/maps/backdrop/{z}/{x}/{y}.png?key=EYzsOICzwnKzN6KnoMqN', {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        maxZoom: 19,
        attribution: '&copy; MapTiler &copy; OpenStreetMap contributors'
    }).addTo(detailMap);
    
    const locationIcon = L.icon({
        iconUrl: '../icons/marker.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    
    L.marker([lat, lng], { icon: locationIcon })
        .addTo(detailMap)
        .bindPopup(name)
        .openPopup();
}

// Display location data
function displayLocationData(location) {
    // Basic information
    document.getElementById('locationName').textContent = location.name;
    document.getElementById('locationAddress').textContent = location.address || 'Not available';
    document.getElementById('locationCoords').textContent = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    document.getElementById('locationScore').textContent = location.score || 1;
    document.getElementById('locationDescription').textContent = location.description || 'No description available.';
    
    // Origin badge
    const originBadge = document.getElementById('locationOrigin');
    originBadge.textContent = location.origin === 'users' ? 'User Submitted' : 'Google API';
    originBadge.className = `origin-badge ${location.origin}`;
    
    // Initialize map
    initializeMap(location.latitude, location.longitude, location.name);
    
    // Load and display photos
    loadLocationPhotos(location._id);
}

// Load photos for the location
async function loadLocationPhotos(locationId) {
    try {
        const photoGallery = document.getElementById('photoGallery');
        photoGallery.innerHTML = '<div class="no-photos">Loading photos...</div>';
        
        const response = await fetch(`/api/locations/${locationId}/images`);
        if (!response.ok) {
            throw new Error('Failed to load photos');
        }
        
        const images = await response.json();
        
        if (images.length === 0) {
            photoGallery.innerHTML = '<div class="no-photos">No photos available for this location</div>';
            return;
        }
        
        // Clear loading message and display photos
        photoGallery.innerHTML = '';
        
        images.forEach(image => {
            const imgElement = document.createElement('img');
            imgElement.src = image.path;
            imgElement.alt = image.original_name;
            imgElement.title = image.original_name;
            
            // Add click handler to open image in new tab
            imgElement.addEventListener('click', () => {
                window.open(image.path, '_blank');
            });
            
            photoGallery.appendChild(imgElement);
        });
        
    } catch (error) {
        console.error('Error loading photos:', error);
        document.getElementById('photoGallery').innerHTML = '<div class="no-photos">Error loading photos</div>';
    }
}

// Load and display location data
async function loadLocationData() {
    if (!locationId) {
        alert('No location ID provided');
        window.location.href = '/main';
        return;
    }
    
    try {
        const response = await fetch(`/api/locations/${locationId}`);
        if (!response.ok) {
            throw new Error('Location not found');
        }
        
        const location = await response.json();
        displayLocationData(location);
        
    } catch (error) {
        console.error('Error loading location:', error);
        alert('Error loading location details');
        window.location.href = '/main';
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    populateUsernameField();
    loadLocationData();
    
    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});