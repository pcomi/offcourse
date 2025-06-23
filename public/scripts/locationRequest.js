// Get username from token (same function as in other files)
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

// Modal functionality
const modal = document.getElementById('requestModal');
const requestBtn = document.getElementById('requestLocationBtn');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('locationRequestForm');
const getLocationBtn = document.getElementById('getLocationBtn');

// Open modal
requestBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        form.reset();
    }
});

// Get user's current location
getLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        getLocationBtn.textContent = 'Getting location...';
        getLocationBtn.disabled = true;
        
        navigator.geolocation.getCurrentPosition((position) => {
            document.getElementById('requestLatitude').value = position.coords.latitude.toFixed(6);
            document.getElementById('requestLongitude').value = position.coords.longitude.toFixed(6);
            
            getLocationBtn.textContent = 'Get My Location';
            getLocationBtn.disabled = false;
        }, (error) => {
            alert('Error getting location: ' + error.message);
            getLocationBtn.textContent = 'Get My Location';
            getLocationBtn.disabled = false;
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
});

// Submit form
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const username = getUsernameFromToken();
    if (!username) {
        alert('You must be logged in to submit a location request.');
        return;
    }
    
    const formData = new FormData(form);
    const requestData = {
        name: formData.get('name'),
        address: formData.get('address'),
        latitude: parseFloat(formData.get('latitude')),
        longitude: parseFloat(formData.get('longitude')),
        description: formData.get('description'),
        submitted_by: username
    };
    
    // Validate required fields
    if (!requestData.name || !requestData.latitude || !requestData.longitude) {
        alert('Please fill in all required fields (Name, Latitude, Longitude).');
        return;
    }
    
    // Validate coordinates
    if (isNaN(requestData.latitude) || isNaN(requestData.longitude)) {
        alert('Please enter valid numbers for latitude and longitude.');
        return;
    }
    
    if (requestData.latitude < -90 || requestData.latitude > 90) {
        alert('Latitude must be between -90 and 90.');
        return;
    }
    
    if (requestData.longitude < -180 || requestData.longitude > 180) {
        alert('Longitude must be between -180 and 180.');
        return;
    }
    
    try {
        const response = await fetch('/api/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            modal.style.display = 'none';
            form.reset();
        } else {
            alert(result.error || 'Error submitting request');
        }
    } catch (error) {
        console.error('Error submitting location request:', error);
        alert('Error submitting request. Please try again.');
    }
});