let currentLocationId = null;

function setupExplorationModalEvents()///event listeners
{
    const modal = document.getElementById('explorationModal');
    const closeBtn = document.getElementById('explorationClose');
    const cancelBtn = document.getElementById('cancelExploration');
    const closeExplorationDone = document.getElementById('closeExplorationDone');
    const closeExplorationPending = document.getElementById('closeExplorationPending');
    const form = document.getElementById('explorationForm');
    const photoInput = document.getElementById('explorationPhotos');
    const preview = document.getElementById('explorationPreview');

    [closeBtn, cancelBtn, closeExplorationDone, closeExplorationPending].forEach(btn => {
        if (btn) 
        {
            btn.addEventListener('click', closeExplorationModal);
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeExplorationModal();///when you click outside
        }
    });

    if (photoInput) 
    {
        photoInput.addEventListener('change', (event) => {
            const files = event.target.files;
            preview.innerHTML = '';
            
            if (files.length > 5) 
            {
                alert('Maximum 5 files allowed');
                photoInput.value = '';
                return;
            }
            
            Array.from(files).forEach((file, index) => {
                if (file.size > 5 * 1024 * 1024) 
                {
                    alert(`File ${file.name} is too large. Maximum 5MB allowed.`);
                    photoInput.value = '';
                    preview.innerHTML = '';
                    return;
                }
                
                if (!file.type.startsWith('image/')) 
                {
                    alert(`File ${file.name} is not an image.`);
                    photoInput.value = '';
                    preview.innerHTML = '';
                    return;
                }
                
                const reader = new FileReader();///preview
                reader.onload = (e) => {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview ${index + 1}">
                        <span class="file-name">${file.name}</span>
                    `;
                    preview.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    if (form) 
    {
        form.addEventListener('submit', submitExploration);
    }
}

async function openExplorationModal(locationId, locationName) 
{
    currentLocationId = locationId;
    const modal = document.getElementById('explorationModal');
    const locationNameEl = document.getElementById('explorationLocationName');
    const content = document.getElementById('explorationContent');
    const alreadyDone = document.getElementById('explorationAlreadyDone');
    const pending = document.getElementById('explorationPending');
    const loading = document.getElementById('explorationLoading');

    if (locationNameEl) 
    {
        locationNameEl.textContent = locationName;
    }

    content.style.display = 'none';
    alreadyDone.style.display = 'none';
    pending.style.display = 'none';
    loading.style.display = 'block';
    modal.style.display = 'block';

    try 
    {
        const response = await fetch(`/api/locations/${locationId}/exploration-status`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        loading.style.display = 'none';

        if (result.status === 'can_explore') 
        {
            content.style.display = 'block';
            alreadyDone.style.display = 'none';
            pending.style.display = 'none';
        } 
        else if (result.status === 'already_explored')
        {
            content.style.display = 'none';
            alreadyDone.style.display = 'block';
            pending.style.display = 'none';
        } 
        else if (result.status === 'pending_approval') 
        {
            content.style.display = 'none';
            alreadyDone.style.display = 'none';
            pending.style.display = 'block';
        }

    } 
    catch (error) 
    {
        console.error('Error checking exploration status:', error);
        loading.style.display = 'none';
        alert('Error checking exploration status. Please try again.');
        closeExplorationModal();
    }
}

function closeExplorationModal() 
{
    const modal = document.getElementById('explorationModal');
    const form = document.getElementById('explorationForm');
    const preview = document.getElementById('explorationPreview');
    
    if (modal) 
    {
        modal.style.display = 'none';
    }
    if (form) 
    {
        form.reset();
    }
    if (preview) 
    {
        preview.innerHTML = '';
    }
    
    currentLocationId = null;
}

async function submitExploration(event) 
{
    event.preventDefault();
    
    if (!currentLocationId) 
    {
        alert('No location selected');
        return;
    }

    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('.submit-btn, .exploration-submit');
    
    const photoInput = document.getElementById('explorationPhotos');
    if (!photoInput.files || photoInput.files.length === 0) 
    {
        alert('Please select at least one photo to upload.');
        return;
    }

    try 
    {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        const response = await fetch(`/api/locations/${currentLocationId}/explore`, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) 
        {
            alert(result.message);
            closeExplorationModal();
            
            if (typeof updateUserLevelDisplay === 'function')///refresh
            {
                updateUserLevelDisplay();
            }
            
        } 
        else 
        {
            alert(result.error || 'Error submitting exploration');
        }

    } 
    catch (error) 
    {
        console.error('Error submitting exploration:', error);
        alert('Error submitting exploration. Please try again.');
    } 
    finally 
    {
        const submitBtn = form.querySelector('.submit-btn, .exploration-submit');
        if (submitBtn) 
        {
            submitBtn.textContent = 'Submit Exploration';
            submitBtn.disabled = false;
        }
    }
}

async function updateUserLevelDisplay() 
{
    try 
    {
        const response = await fetch('/api/level-info');
        if (response.ok) 
        {
            const levelInfo = await response.json();
            console.log('Current user level info:', levelInfo);
        }
    } 
    catch (error) 
    {
        console.error('Error fetching user level info:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupExplorationModalEvents();
});