// Modal functionality
const modal = document.getElementById('requestModal');
const requestBtn = document.getElementById('requestLocationBtn');
const closeBtn = document.querySelector('.close');
const form = document.getElementById('locationRequestForm');
const getLocationBtn = document.getElementById('getLocationBtn');
const photoInput = document.getElementById('requestPhotos');
const filePreview = document.getElementById('filePreview');

// Open modal
requestBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Close modal
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    form.reset();
    filePreview.innerHTML = '';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        form.reset();
        filePreview.innerHTML = '';
    }
});

// Handle file selection and preview
photoInput.addEventListener('change', (event) => {
    const files = event.target.files;
    filePreview.innerHTML = '';
    
    if (files.length > 5) {
        alert('Maximum 5 files allowed');
        photoInput.value = '';
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        if (file.size > 5 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum 5MB allowed.`);
            photoInput.value = '';
            filePreview.innerHTML = '';
            return;
        }
        
        if (!file.type.startsWith('image/')) {
            alert(`File ${file.name} is not an image.`);
            photoInput.value = '';
            filePreview.innerHTML = '';
            return;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}">
                <span class="file-name">${file.name}</span>
            `;
            filePreview.appendChild(previewItem);
        };
        reader.readAsDataURL(file);
    });
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

// Submit form with files
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const userData = TokenUtils.getUserDataFromToken();
    if (!userData) {
        alert('You must be logged in to submit a location request.');
        return;
    }
    
    const formData = new FormData(form);
    formData.append('submitted_by', userData.username);
    
    // Validate required fields
    const name = formData.get('name');
    const latitude = parseFloat(formData.get('latitude'));
    const longitude = parseFloat(formData.get('longitude'));
    
    if (!name || !latitude || !longitude) {
        alert('Please fill in all required fields (Name, Latitude, Longitude).');
        return;
    }
    
    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
        alert('Please enter valid numbers for latitude and longitude.');
        return;
    }
    
    if (latitude < -90 || latitude > 90) {
        alert('Latitude must be between -90 and 90.');
        return;
    }
    
    if (longitude < -180 || longitude > 180) {
        alert('Longitude must be between -180 and 180.');
        return;
    }
    
    try {
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        const response = await fetch('/api/requests', {
            method: 'POST',
            body: formData // Don't set Content-Type, let browser set it for multipart
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            modal.style.display = 'none';
            form.reset();
            filePreview.innerHTML = '';
        } else {
            alert(result.error || 'Error submitting request');
        }
    } catch (error) {
        console.error('Error submitting location request:', error);
        alert('Error submitting request. Please try again.');
    } finally {
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.textContent = 'Submit Request';
        submitBtn.disabled = false;
    }
});