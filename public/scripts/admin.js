// Global variables
let allRequests = [];
let currentFilter = 'pending';
let selectedRequest = null;

function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = '/login';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// DOM elements
const filterBtns = document.querySelectorAll('.filter-btn');
const requestsList = document.getElementById('requestsList');
const loadingSpinner = document.getElementById('loadingSpinner');
const noRequests = document.getElementById('noRequests');
const modal = document.getElementById('requestModal');
const closeBtn = document.querySelector('.close');
const approveBtn = document.getElementById('approveBtn');
const rejectBtn = document.getElementById('rejectBtn');
const closeModalBtn = document.getElementById('closeBtn');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const userData = TokenUtils.getUserDataFromToken();
    if (userData) {
        document.getElementById('username').value = userData.username;
    }
    
    // Event listeners
    document.getElementById('logoutButton').addEventListener('click', logout);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            updateFilterButtons();
            filterRequests();
        });
    });
    
    // Modal event listeners
    closeBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    approveBtn.addEventListener('click', () => handleRequestAction('approved'));
    rejectBtn.addEventListener('click', () => handleRequestAction('rejected'));
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Load initial data
    loadRequests();
    loadStats();
});

// Load all requests
async function loadRequests() {
    try {
        loadingSpinner.style.display = 'block';
        requestsList.style.display = 'none';
        noRequests.style.display = 'none';
        
        const response = await fetch('/api/requests');
        if (!response.ok) {
            throw new Error('Failed to load requests');
        }
        
        allRequests = await response.json();
        console.log('Loaded requests:', allRequests);
        
        loadingSpinner.style.display = 'none';
        filterRequests();
        
    } catch (error) {
        console.error('Error loading requests:', error);
        loadingSpinner.style.display = 'none';
        alert('Error loading requests');
    }
}

// Load statistics
async function loadStats() {
    try {
        const pendingResponse = await fetch('/api/requests/status/pending');
        const approvedResponse = await fetch('/api/requests/status/approved');
        const rejectedResponse = await fetch('/api/requests/status/rejected');
        
        const pending = await pendingResponse.json();
        const approved = await approvedResponse.json();
        const rejected = await rejectedResponse.json();
        
        // Filter approved and rejected for today
        const today = new Date().toDateString();
        const approvedToday = approved.filter(req => 
            new Date(req.created_at).toDateString() === today
        );
        const rejectedToday = rejected.filter(req => 
            new Date(req.created_at).toDateString() === today
        );
        
        document.getElementById('pendingCount').textContent = pending.length;
        document.getElementById('approvedCount').textContent = approvedToday.length;
        document.getElementById('rejectedCount').textContent = rejectedToday.length;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Update filter buttons
function updateFilterButtons() {
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        }
    });
}

// Filter and display requests
function filterRequests() {
    let filteredRequests = allRequests;
    
    if (currentFilter !== 'all') {
        filteredRequests = allRequests.filter(req => req.status === currentFilter);
    }
    
    if (filteredRequests.length === 0) {
        requestsList.style.display = 'none';
        noRequests.style.display = 'block';
        return;
    }
    
    noRequests.style.display = 'none';
    requestsList.style.display = 'block';
    requestsList.innerHTML = '';
    
    filteredRequests.forEach(request => {
        const requestCard = createRequestCard(request);
        requestsList.appendChild(requestCard);
    });
}

// Create request card element
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = `request-card ${request.status}`;
    card.onclick = () => openRequestModal(request);
    
    card.innerHTML = `
        <div class="request-header">
            <h3 class="request-title">${request.name}</h3>
            <span class="request-status ${request.status}">${request.status.toUpperCase()}</span>
        </div>
        
        <div class="request-info">
            <div class="info-item">
                <strong>Address:</strong> ${request.address || 'Not provided'}
            </div>
            <div class="info-item">
                <strong>Coordinates:</strong> ${request.latitude.toFixed(6)}, ${request.longitude.toFixed(6)}
            </div>
            <div class="info-item">
                <strong>Submitted by:</strong> ${request.submitted_by}
            </div>
            <div class="info-item">
                <strong>Origin:</strong> ${request.origin}
            </div>
        </div>
        
        ${request.description ? `<div class="request-description">${request.description}</div>` : ''}
        
        <div class="request-meta">
            <span>Submitted: ${formatDate(request.created_at)}</span>
            ${request.status === 'pending' ? `
                <div class="quick-actions">
                    <button class="quick-approve" onclick="event.stopPropagation(); quickAction('${request._id}', 'approved')">Approve</button>
                    <button class="quick-reject" onclick="event.stopPropagation(); quickAction('${request._id}', 'rejected')">Reject</button>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

// Quick action from request card
async function quickAction(requestId, action) {
    if (confirm(`Are you sure you want to ${action} this request?`)) {
        await updateRequestStatus(requestId, action);
    }
}

// Open request modal
async function openRequestModal(request) {
    selectedRequest = request;
    
    // Load request images
    const images = await loadRequestImages(request._id);
    
    const requestDetails = document.getElementById('requestDetails');
    requestDetails.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <strong>Name</strong>
                <span>${request.name}</span>
            </div>
            <div class="detail-item">
                <strong>Address</strong>
                <span>${request.address || 'Not provided'}</span>
            </div>
            <div class="detail-item">
                <strong>Latitude</strong>
                <span>${request.latitude}</span>
            </div>
            <div class="detail-item">
                <strong>Longitude</strong>
                <span>${request.longitude}</span>
            </div>
            <div class="detail-item">
                <strong>Score</strong>
                <span>${request.score}</span>
            </div>
            <div class="detail-item">
                <strong>Origin</strong>
                <span>${request.origin}</span>
            </div>
            <div class="detail-item">
                <strong>Submitted by</strong>
                <span>${request.submitted_by}</span>
            </div>
            <div class="detail-item">
                <strong>Status</strong>
                <span class="request-status ${request.status}">${request.status.toUpperCase()}</span>
            </div>
            <div class="detail-item">
                <strong>Submitted</strong>
                <span>${formatDate(request.created_at)}</span>
            </div>
        </div>
        
        ${request.description ? `
            <div class="detail-item" style="grid-column: 1 / -1;">
                <strong>Description</strong>
                <span>${request.description}</span>
            </div>
        ` : ''}
    `;
    
    // Display images
    const requestImages = document.getElementById('requestImages');
    if (images.length > 0) {
        requestImages.innerHTML = `
            <h3>Images (${images.length})</h3>
            <div class="images-grid">
                ${images.map(img => `
                    <div class="image-item">
                        <img src="${img.path}" alt="${img.original_name}" onclick="window.open('${img.path}', '_blank')">
                        <div class="image-name">${img.original_name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        requestImages.innerHTML = '<h3>No images uploaded</h3>';
    }
    
    // Show/hide action buttons based on status
    if (request.status === 'pending') {
        approveBtn.style.display = 'block';
        rejectBtn.style.display = 'block';
    } else {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Load images for a request
async function loadRequestImages(requestId) {
    try {
        const response = await fetch(`/api/requests/${requestId}/images`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error loading request images:', error);
        return [];
    }
}

// Handle approve/reject actions
async function handleRequestAction(action) {
    if (!selectedRequest) return;
    
    if (confirm(`Are you sure you want to ${action} this request?`)) {
        await updateRequestStatus(selectedRequest._id, action);
        closeModal();
    }
}

// Update request status
async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetch(`/api/requests/${requestId}/${status}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(result.message);
            // Reload data
            await loadRequests();
            await loadStats();
        } else {
            alert(result.error || `Error ${status}ing request`);
        }
        
    } catch (error) {
        console.error(`Error ${status}ing request:`, error);
        alert(`Error ${status}ing request`);
    }
}

// Close modal
function closeModal() {
    modal.style.display = 'none';
    selectedRequest = null;
}