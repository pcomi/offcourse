// Get location ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const locationId = urlParams.get('id');

let detailMap;

// Utility functions
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, ...cookieParts] = cookie.split('=');
        const trimmedCookieName = cookieName.trim();
        if (trimmedCookieName === name) {
            return decodeURIComponent(cookieParts.join('='));
        }
    }
    return null;
}

const getUsernameFromToken = () => {
    const token = getCookie('token');
    if (!token) {
        console.error('Token cookie not found');
        return null;
    }
    try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        return decodedToken.username || null;
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
};

const populateUsernameField = () => {
    const usernameField = document.getElementById('username');
    const username = getUsernameFromToken();
    if (username) {
        usernameField.value = username;
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

///initialise page
document.addEventListener('DOMContentLoaded', () => {
    populateUsernameField();
    loadLocationData();
    
    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});

function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = '/login';
}

// Format date function
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Create stars display
function createStars(rating, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.className = i <= rating ? 'star' : 'star empty';
        star.innerHTML = '★';
        container.appendChild(star);
    }
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

// Format price level
function formatPriceLevel(level) {
    if (!level && level !== 0) return '-';
    return '$'.repeat(level + 1);
}

// Format phone number
function formatPhoneNumber(phone) {
    if (!phone) return '-';
    return phone;
}

// Format website
function formatWebsite(website) {
    if (!website) return '-';
    if (website.startsWith('http')) {
        return `<a href="${website}" target="_blank">${website}</a>`;
    }
    return `<a href="https://${website}" target="_blank">${website}</a>`;
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