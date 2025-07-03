let allMapLocations = [];
let searchMarkers = [];
let allMarkers = [];

const initializeSearch = () => {
    const searchInput = document.querySelector('#searchInput');
    const searchContainer = document.querySelector('.search-container');
    
    console.log('Initializing search with input:', searchInput);
    
    if (searchInput) 
    {
        const searchResults = document.createElement('div');
        searchResults.id = 'searchResults';
        searchResults.className = 'search-results';
        searchResults.style.display = 'none';
        searchContainer.appendChild(searchResults);

        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() && searchResults.children.length > 0) 
            {
                searchResults.style.display = 'block';
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) 
            {
                searchResults.style.display = 'none';
            }
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') 
            {
                e.preventDefault();
                const firstResult = searchResults.querySelector('.search-result-item:not(.no-results)');
                if (firstResult) 
                {
                    firstResult.click();
                }
            }
        });
        
        console.log('Search initialized successfully');
    } 
    else 
    {
        console.error('Search input not found!');
    }
};

const handleSearchInput = (event) => {
    const query = event.target.value.trim().toLowerCase();
    const searchResults = document.getElementById('searchResults');
    
    console.log('Search query:', query, 'Available locations:', allMapLocations.length);
    
    if (query.length === 0) 
    {
        searchResults.style.display = 'none';
        clearSearchHighlights();
        return;
    }

    const filteredLocations = allMapLocations.filter(location => {
        return location.name.toLowerCase().includes(query) ||
               (location.address && location.address.toLowerCase().includes(query)) ||
               (location.description && location.description.toLowerCase().includes(query));
    });

    console.log('Filtered locations:', filteredLocations.length);
    displaySearchResults(filteredLocations, query);
};

const displaySearchResults = (locations, query) => {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';

    if (locations.length === 0) 
    {
        searchResults.innerHTML = '<div class="search-result-item no-results">No locations found</div>';
        searchResults.style.display = 'block';
        return;
    }

    const limitedLocations = locations.slice(0, 10);
    
    limitedLocations.forEach(location => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        const highlightedName = highlightText(location.name, query);
        const address = location.address ? location.address : 'No address';
        
        resultItem.innerHTML = `
            <div class="result-name">${highlightedName}</div>
            <div class="result-address">${address}</div>
            <div class="result-coords">Score: ${location.score || 1}</div>
        `;

        resultItem.addEventListener('click', () => {
            selectSearchResult(location);
            searchResults.style.display = 'none';
        });

        searchResults.appendChild(resultItem);
    });

    searchResults.style.display = 'block';
};

const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
};

const selectSearchResult = (location) => {
    console.log('Selecting search result:', location);
    
    clearSearchHighlights();
    
    if (window.map) 
    {
        console.log('Setting map view to:', location.latitude, location.longitude);
        window.map.setView([location.latitude, location.longitude], 17);
        
        highlightLocationMarker(location);
        
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) 
        {
            searchInput.value = location.name;
        }
        
        const searchResults = document.getElementById('searchResults');
        if (searchResults) 
        {
            searchResults.style.display = 'none';
        }
    } 
    else 
    {
        console.error('Map not found!');
    }
};

const highlightLocationMarker = (location) => {
    const highlightIcon = L.icon({
        iconUrl: '../icons/marker.png',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
        className: 'search-highlight-marker'
    });

    const highlightMarker = L.marker([location.latitude, location.longitude], { 
        icon: highlightIcon 
    }).addTo(window.map);
    
    ///store for cleanup
    searchMarkers.push(highlightMarker);
    
    const popupContent = `
        <div style="text-align: center; min-width: 200px;">
            <strong style="display: block; margin-bottom: 8px; font-size: 16px;">${location.name}</strong>
            <small style="display: block; margin-bottom: 10px; color: #666;">Score: ${location.score || 1}</small>
            <div style="display: flex; gap: 8px; justify-content: center;">
                <button id="details-search-${location._id}" style="
                    background-color: #3498db;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background-color 0.3s;
                ">View Details</button>
                <button id="explore-search-${location._id}" style="
                    background-color: #27ae60;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: background-color 0.3s;
                ">Explore (+50 XP)</button>
            </div>
        </div>
    `;
    
    highlightMarker.bindPopup(popupContent).openPopup();
    
    highlightMarker.on('popupopen', () => {
        const detailsBtn = document.getElementById(`details-search-${location._id}`);
        if (detailsBtn) 
        {
            detailsBtn.addEventListener('click', () => {
                window.location.href = `/details?id=${location._id}`;
            });
        }

        const exploreBtn = document.getElementById(`explore-search-${location._id}`);
        if (exploreBtn) 
        {
            exploreBtn.addEventListener('click', () => {
                if (typeof openExplorationModal === 'function') 
                {
                    openExplorationModal(location._id, location.name);
                } 
                else 
                {
                    alert('Exploration feature not available. Please refresh the page.');
                }
            });
        }
    });
    
    setTimeout(() => {
        clearSearchHighlights();
    }, 5000);
};

const clearSearchHighlights = () => {
    searchMarkers.forEach(marker => {
        if (window.map.hasLayer(marker)) 
        {
            window.map.removeLayer(marker);
        }
    });
    searchMarkers = [];
};

const storeLocationsForSearch = (locations) => {
    allMapLocations = locations;
    console.log(`Stored ${locations.length} locations for search:`, locations);
};

document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
});