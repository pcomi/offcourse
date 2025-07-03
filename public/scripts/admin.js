let allRequests = [];
let allExplorations = [];
let allInvites = [];
let currentFilter = 'pending';
let currentView = 'requests';
let selectedRequest = null;
let selectedExploration = null;

function logout() 
{
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = '/login';
}

function formatDate(dateString) 
{
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

///DOM
const filterBtns = document.querySelectorAll('.filter-btn');
const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
const requestsList = document.getElementById('requestsList');
const loadingSpinner = document.getElementById('loadingSpinner');
const noRequests = document.getElementById('noRequests');
const modal = document.getElementById('requestModal');
const closeBtn = document.querySelector('.close');
const approveBtn = document.getElementById('approveBtn');
const rejectBtn = document.getElementById('rejectBtn');
const closeModalBtn = document.getElementById('closeBtn');
const regularFilters = document.getElementById('regularFilters');
const inviteFilters = document.getElementById('inviteFilters');
const createInviteBtn = document.getElementById('createInviteBtn');

document.addEventListener('DOMContentLoaded', () => 
{
    const userData = TokenUtils.getUserDataFromToken();
    if (userData) 
    {
        document.getElementById('username').value = userData.username;
    }
    
    document.getElementById('logoutButton').addEventListener('click', logout);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            updateFilterButtons();
            filterCurrentView();
        });
    });

    viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentView = e.target.dataset.view;
            currentFilter = currentView === 'invites' ? 'unused' : 'pending';
            updateViewButtons();
            updateFilterVisibility();
            loadCurrentView();
        });
    });
    
    createInviteBtn.addEventListener('click', createInvite);
    
    closeBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    approveBtn.addEventListener('click', () => handleAction('approved'));
    rejectBtn.addEventListener('click', () => handleAction('rejected'));
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) 
        {
            closeModal();
        }
    });
    
    loadRequests();
    loadStats();
});

function updateFilterVisibility() 
{
    if (currentView === 'invites') 
    {
        regularFilters.style.display = 'none';
        inviteFilters.style.display = 'flex';
    } 
    else 
    {
        regularFilters.style.display = 'flex';
        inviteFilters.style.display = 'none';
    }
    updateFilterButtons();
}

function updateFilterButtons() 
{
    const activeFilterContainer = currentView === 'invites' ? inviteFilters : regularFilters;
    const buttons = activeFilterContainer.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === currentFilter) 
        {
            btn.classList.add('active');
        }
    });
}

function filterCurrentView() 
{
    if (currentView === 'requests') 
    {
        filterRequests();
    } 
    else if (currentView === 'explorations')
    {
        filterExplorations();
    } 
    else if (currentView === 'invites') 
    {
        filterInvites();
    }
}

function loadCurrentView() 
{
    if (currentView === 'requests') 
    {
        loadRequests();
    } 
    else if (currentView === 'explorations') 
    {
        loadExplorations();
    } 
    else if (currentView === 'invites') 
    {
        loadInvites();
    }
}

function filterInvites() 
{
    let filteredInvites = allInvites;
    
    if (currentFilter === 'unused') 
    {
        filteredInvites = allInvites.filter(invite => !invite.is_used);
    } 
    else if (currentFilter === 'used') 
    {
        filteredInvites = allInvites.filter(invite => invite.is_used);
    }
    
    if (filteredInvites.length === 0) 
    {
        requestsList.style.display = 'none';
        noRequests.style.display = 'block';
        noRequests.textContent = 'No invite codes found.';
        return;
    }
    
    noRequests.style.display = 'none';
    requestsList.style.display = 'block';
    requestsList.innerHTML = '';
    
    filteredInvites.forEach(invite => {
        const inviteCard = createInviteCard(invite);
        requestsList.appendChild(inviteCard);
    });
}

function createInviteCard(invite) 
{
    const card = document.createElement('div');
    card.className = `request-card ${invite.is_used ? 'used' : 'unused'}`;
    
    card.innerHTML = `
        <div class="request-header">
            <h3 class="request-title">🎫 ${invite.code}</h3>
            <span class="request-status ${invite.is_used ? 'used' : 'unused'}">${invite.is_used ? 'USED' : 'ACTIVE'}</span>
        </div>
        
        <div class="request-info">
            <div class="info-item">
                <strong>Created by:</strong> ${invite.created_by}
            </div>
            <div class="info-item">
                <strong>Created:</strong> ${formatDate(invite.created_at)}
            </div>
            ${invite.is_used ? `
                <div class="info-item">
                    <strong>Used by:</strong> ${invite.used_by}
                </div>
                <div class="info-item">
                    <strong>Used at:</strong> ${formatDate(invite.used_at)}
                </div>
            ` : ''}
        </div>
        
        <div class="request-meta">
            <span>Code: <strong>${invite.code}</strong></span>
            ${!invite.is_used ? `
                <div class="quick-actions">
                    <button class="quick-reject" onclick="deleteInvite('${invite.code}')">Delete</button>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

async function createInvite() 
{
    const userData = TokenUtils.getUserDataFromToken();
    if (!userData) 
    {
        alert('You must be logged in to create invites');
        return;
    }
    
    if (confirm('Create a new invite code?')) 
    {
        try 
        {
            const response = await fetch('/api/admin/invites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    created_by: userData.username
                })
            });
            
            const result = await response.json();
            
            if (response.ok) 
            {
                alert(`Invite code created: ${result.invite.code}`);
                await loadInvites();
                await loadStats();
            } 
            else 
            {
                alert(result.error || 'Error creating invite code');
            }
        } 
        catch (error) 
        {
            console.error('Error creating invite:', error);
            alert('Error creating invite code');
        }
    }
}

async function deleteInvite(code) 
{
    if (confirm(`Delete invite code ${code}?`)) 
    {
        try
        {
            const response = await fetch(`/api/admin/invites/${code}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (response.ok) 
            {
                alert(result.message);
                await loadInvites();
                await loadStats();
            } 
            else 
            {
                alert(result.error || 'Error deleting invite code');
            }
        } 
        catch (error) 
        {
            console.error('Error deleting invite:', error);
            alert('Error deleting invite code');
        }
    }
}

async function loadInvites() 
{
    try 
    {
        loadingSpinner.style.display = 'block';
        requestsList.style.display = 'none';
        noRequests.style.display = 'none';
        
        const response = await fetch('/api/admin/invites');
        if (!response.ok) 
        {
            throw new Error('Failed to load invites');
        }
        
        allInvites = await response.json();
        console.log('Loaded invites:', allInvites);
        
        loadingSpinner.style.display = 'none';
        filterInvites();
        
    } 
    catch (error) 
    {
        console.error('Error loading invites:', error);
        loadingSpinner.style.display = 'none';
        alert('Error loading invites');
    }
}

function filterRequests() 
{
    let filteredRequests = allRequests;
    
    if (currentFilter !== 'all') 
    {
        filteredRequests = allRequests.filter(req => req.status === currentFilter);
    }
    
    if (filteredRequests.length === 0) 
    {
        requestsList.style.display = 'none';
        noRequests.style.display = 'block';
        noRequests.textContent = 'No requests found.';
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

function filterExplorations() 
{
    let filteredExplorations = allExplorations;
    
    if (currentFilter !== 'all') 
    {
        filteredExplorations = allExplorations.filter(exp => exp.status === currentFilter);
    }
    
    if (filteredExplorations.length === 0) 
    {
        requestsList.style.display = 'none';
        noRequests.style.display = 'block';
        noRequests.textContent = 'No explorations found.';
        return;
    }
    
    noRequests.style.display = 'none';
    requestsList.style.display = 'block';
    requestsList.innerHTML = '';
    
    filteredExplorations.forEach(exploration => {
        const explorationCard = createExplorationCard(exploration);
        requestsList.appendChild(explorationCard);
    });
}

function createRequestCard(request) 
{
    const card = document.createElement('div');
    card.className = `request-card ${request.status}`;
    card.onclick = () => openRequestModal(request);
    
    card.innerHTML = `
        <div class="request-header">
            <h3 class="request-title">📍 ${request.name}</h3>
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
                <strong>Type:</strong> Location Request (+100 XP)
            </div>
        </div>
        
        ${request.description ? `<div class="request-description">${request.description}</div>` : ''}
        
        <div class="request-meta">
            <span>Submitted: ${formatDate(request.created_at)}</span>
            ${request.status === 'pending' ? `
                <div class="quick-actions">
                    <button class="quick-approve" onclick="event.stopPropagation(); quickAction('${request._id}', 'approved', 'request')">Approve</button>
                    <button class="quick-reject" onclick="event.stopPropagation(); quickAction('${request._id}', 'rejected', 'request')">Reject</button>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

function createExplorationCard(exploration) 
{
    const card = document.createElement('div');
    card.className = `request-card ${exploration.status}`;
    card.onclick = () => openExplorationModal(exploration);
    
    const ratingDisplay = exploration.rating ? 
        `⭐`.repeat(exploration.rating) + ` (${exploration.rating}/5)` : 
        'No rating';
    
    card.innerHTML = `
        <div class="request-header">
            <h3 class="request-title">🏚️ ${exploration.location_name}</h3>
            <span class="request-status ${exploration.status}">${exploration.status.toUpperCase()}</span>
        </div>
        
        <div class="request-info">
            <div class="info-item">
                <strong>Explorer:</strong> ${exploration.username}
            </div>
            <div class="info-item">
                <strong>Rating:</strong> ${ratingDisplay}
            </div>
            <div class="info-item">
                <strong>Photos:</strong> ${exploration.photos.length} uploaded
            </div>
            <div class="info-item">
                <strong>Type:</strong> Location Exploration (+50 XP)
            </div>
        </div>
        
        ${exploration.description ? `<div class="request-description">${exploration.description}</div>` : ''}
        
        <div class="request-meta">
            <span>Submitted: ${formatDate(exploration.created_at)}</span>
            ${exploration.status === 'pending' ? `
                <div class="quick-actions">
                    <button class="quick-approve" onclick="event.stopPropagation(); quickAction('${exploration._id}', 'approved', 'exploration')">Approve</button>
                    <button class="quick-reject" onclick="event.stopPropagation(); quickAction('${exploration._id}', 'rejected', 'exploration')">Reject</button>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

async function quickAction(id, action, type) 
{
    if (confirm(`Are you sure you want to ${action} this ${type}?`)) 
        {
        if (type === 'request') {
            await updateRequestStatus(id, action);
        } else {
            await updateExplorationStatus(id, action);
        }
    }
}

async function openRequestModal(request) 
{
    selectedRequest = request;
    selectedExploration = null;
    
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
            <div class="detail-item">
                <strong>Experience Reward</strong>
                <span>+100 XP</span>
            </div>
        </div>
        
        ${request.description ? `
            <div class="detail-item" style="grid-column: 1 / -1;">
                <strong>Description</strong>
                <span>${request.description}</span>
            </div>
        ` : ''}
    `;
    
    displayImages(images);
    
    updateModalButtons(request.status);
    
    modal.style.display = 'block';
}

async function openExplorationModal(exploration) 
{
    selectedExploration = exploration;
    selectedRequest = null;
    
    const images = await loadExplorationImages(exploration._id);
    
    const requestDetails = document.getElementById('requestDetails');
    const ratingDisplay = exploration.rating ? 
        `⭐`.repeat(exploration.rating) + ` (${exploration.rating}/5)` : 
        'No rating provided';
    
    requestDetails.innerHTML = `
        <div class="detail-grid">
            <div class="detail-item">
                <strong>Location</strong>
                <span>${exploration.location_name}</span>
            </div>
            <div class="detail-item">
                <strong>Explorer</strong>
                <span>${exploration.username}</span>
            </div>
            <div class="detail-item">
                <strong>Rating</strong>
                <span>${ratingDisplay}</span>
            </div>
            <div class="detail-item">
                <strong>Photos</strong>
                <span>${exploration.photos.length} uploaded</span>
            </div>
            <div class="detail-item">
                <strong>Type</strong>
                <span>${exploration.exploration_type}</span>
            </div>
            <div class="detail-item">
                <strong>Status</strong>
                <span class="request-status ${exploration.status}">${exploration.status.toUpperCase()}</span>
            </div>
            <div class="detail-item">
                <strong>Submitted</strong>
                <span>${formatDate(exploration.created_at)}</span>
            </div>
            <div class="detail-item">
                <strong>Experience Reward</strong>
                <span>+${exploration.exp_gained} XP</span>
            </div>
            ${exploration.reviewed_at ? `
                <div class="detail-item">
                    <strong>Reviewed</strong>
                    <span>${formatDate(exploration.reviewed_at)}</span>
                </div>
            ` : ''}
        </div>
        
        ${exploration.description ? `
            <div class="detail-item" style="grid-column: 1 / -1;">
                <strong>Description</strong>
                <span>${exploration.description}</span>
            </div>
        ` : ''}
        
        ${exploration.admin_notes ? `
            <div class="detail-item" style="grid-column: 1 / -1;">
                <strong>Admin Notes</strong>
                <span>${exploration.admin_notes}</span>
            </div>
        ` : ''}
    `;
    
    displayImages(images);
    
    updateModalButtons(exploration.status);
    
    modal.style.display = 'block';
}

function displayImages(images) 
{
    const requestImages = document.getElementById('requestImages');
    if (images.length > 0) 
    {
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
    } 
    else 
    {
        requestImages.innerHTML = '<h3>No images uploaded</h3>';
    }
}

function updateModalButtons(status) 
{
    if (status === 'pending') 
    {
        approveBtn.style.display = 'block';
        rejectBtn.style.display = 'block';
    } 
    else 
    {
        approveBtn.style.display = 'none';
        rejectBtn.style.display = 'none';
    }
}

async function loadRequestImages(requestId) 
{
    try
    {
        const response = await fetch(`/api/requests/${requestId}/images`);
        if (response.ok) 
        {
            return await response.json();
        }
        return [];
    } 
    catch (error) 
    {
        console.error('Error loading request images:', error);
        return [];
    }
}

async function loadExplorationImages(explorationId) 
{
    try 
    {
        const response = await fetch(`/api/admin/explorations/${explorationId}/images`);
        if (response.ok)
        {
            return await response.json();
        }
        return [];
    } 
    catch (error) 
    {
        console.error('Error loading exploration images:', error);
        return [];
    }
}

async function handleAction(action) 
{
    if (selectedRequest) 
    {
        if (confirm(`Are you sure you want to ${action} this request?`)) 
        {
            await updateRequestStatus(selectedRequest._id, action);
            closeModal();
        }
    } 
    else if (selectedExploration) 
    {
        if (confirm(`Are you sure you want to ${action} this exploration?`)) 
        {
            await updateExplorationStatus(selectedExploration._id, action);
            closeModal();
        }
    }
}

async function updateRequestStatus(requestId, status) 
{
    try 
    {
        const response = await fetch(`/api/requests/${requestId}/${status}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) 
        {
            alert(result.message);
            await loadRequests();
            await loadStats();
        } 
        else 
        {
            alert(result.error || `Error ${status}ing request`);
        }
        
    } 
    catch (error) 
    {
        console.error(`Error ${status}ing request:`, error);
        alert(`Error ${status}ing request`);
    }
}

async function updateExplorationStatus(explorationId, status) 
{
    try 
    {
        const endpoint = status === 'approved' ? 'approve' : 'reject';
        const response = await fetch(`/api/admin/explorations/${explorationId}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) 
        {
            alert(result.message);
            await loadExplorations();
            await loadStats();
        } 
        else 
        {
            alert(result.error || `Error ${status}ing exploration`);
        }
        
    } 
    catch (error) 
    {
        console.error(`Error ${status}ing exploration:`, error);
        alert(`Error ${status}ing exploration`);
    }
}

function closeModal() 
{
    modal.style.display = 'none';
    selectedRequest = null;
    selectedExploration = null;
}

function updateViewButtons() 
{
    viewToggleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === currentView) 
        {
            btn.classList.add('active');
        }
    });
    
    const sectionTitle = document.querySelector('.filter-section h2');
    if (sectionTitle)
    {
        if (currentView === 'requests') 
        {
            sectionTitle.textContent = 'Location Requests';
        } 
        else if (currentView === 'explorations') 
        {
            sectionTitle.textContent = 'Location Explorations';
        } 
        else if (currentView === 'invites') 
        {
            sectionTitle.textContent = 'Invite Codes';
        }
    }
}

async function loadRequests() 
{
    try 
    {
        loadingSpinner.style.display = 'block';
        requestsList.style.display = 'none';
        noRequests.style.display = 'none';
        
        const response = await fetch('/api/requests');
        if (!response.ok) 
        {
            throw new Error('Failed to load requests');
        }
        
        allRequests = await response.json();
        console.log('Loaded requests:', allRequests);
        
        loadingSpinner.style.display = 'none';
        filterRequests();
        
    } 
    catch (error) 
    {
        console.error('Error loading requests:', error);
        loadingSpinner.style.display = 'none';
        alert('Error loading requests');
    }
}

async function loadExplorations() 
{
    try
    {
        loadingSpinner.style.display = 'block';
        requestsList.style.display = 'none';
        noRequests.style.display = 'none';
        
        const response = await fetch('/api/admin/explorations');
        if (!response.ok) 
        {
            throw new Error('Failed to load explorations');
        }
        
        allExplorations = await response.json();
        console.log('Loaded explorations:', allExplorations);
        
        loadingSpinner.style.display = 'none';
        filterExplorations();
        
    } 
    catch (error) 
    {
        console.error('Error loading explorations:', error);
        loadingSpinner.style.display = 'none';
        alert('Error loading explorations');
    }
}

async function loadStats() 
{
    try 
    {
        const pendingResponse = await fetch('/api/requests/status/pending');
        const approvedResponse = await fetch('/api/requests/status/approved');
        const rejectedResponse = await fetch('/api/requests/status/rejected');
        
        const pending = await pendingResponse.json();
        const approved = await approvedResponse.json();
        const rejected = await rejectedResponse.json();

        const pendingExpResponse = await fetch('/api/admin/explorations/status/pending');
        const approvedExpResponse = await fetch('/api/admin/explorations/status/approved');
        const rejectedExpResponse = await fetch('/api/admin/explorations/status/rejected');
        
        const pendingExp = await pendingExpResponse.json();
        const approvedExp = await approvedExpResponse.json();
        const rejectedExp = await rejectedExpResponse.json();

        const invitesResponse = await fetch('/api/admin/invites');
        const invites = await invitesResponse.json();
        const activeInvites = invites.filter(invite => !invite.is_used);
        
        ///today filter
        const today = new Date().toDateString();
        const approvedToday = approved.filter(req => 
            new Date(req.created_at).toDateString() === today
        );
        const rejectedToday = rejected.filter(req => 
            new Date(req.created_at).toDateString() === today
        );
        const approvedExpToday = approvedExp.filter(exp => 
            new Date(exp.reviewed_at).toDateString() === today
        );
        const rejectedExpToday = rejectedExp.filter(exp => 
            new Date(exp.reviewed_at).toDateString() === today
        );
        
        document.getElementById('pendingCount').textContent = pending.length + pendingExp.length;
        document.getElementById('approvedCount').textContent = approvedToday.length + approvedExpToday.length;
        document.getElementById('rejectedCount').textContent = rejectedToday.length + rejectedExpToday.length;
        document.getElementById('inviteCount').textContent = activeInvites.length;
        
    } 
    catch (error) 
    {
        console.error('Error loading stats:', error);
    }
}