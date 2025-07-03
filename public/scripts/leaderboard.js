const populateUsernameField = () => {
    const usernameField = document.getElementById('username');
    const userData = TokenUtils.getUserDataFromToken();
    if (userData && usernameField) 
    {
        usernameField.value = userData.username;
    }
};

function logout() 
{
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Loading leaderboards...');
    
    populateUsernameField();
    
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton)
    {
        logoutButton.addEventListener('click', logout);
    }
    
    await Promise.all([
        loadTopUsers(),
        loadTopLocations()
    ]);
});

async function loadTopUsers() 
{
    try 
    {
        console.log('Fetching top users...');
        const response = await fetch('/api/users/leaderboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) 
        {
            const topUsers = await response.json();
            console.log('Top users received:', topUsers);
            displayTopUsers(topUsers);
        } 
        else 
        {
            console.error('Error fetching top users:', response.status);
            showError('userLeaderboard', 'Error loading user leaderboard');
        }
    } 
    catch (error) 
    {
        console.error('Error fetching top users:', error);
        showError('userLeaderboard', 'Network error loading user leaderboard');
    }
}

async function loadTopLocations() 
{
    try 
    {
        console.log('Fetching top locations...');
        const response = await fetch('/api/users/locations/top', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) 
        {
            const topLocations = await response.json();
            console.log('Top locations received:', topLocations);
            displayTopLocations(topLocations);
        } 
        else 
        {
            console.error('Error fetching top locations:', response.status);
            showError('locationLeaderboard', 'Error loading location leaderboard');
        }
    } 
    catch (error) 
    {
        console.error('Error fetching top locations:', error);
        showError('locationLeaderboard', 'Network error loading location leaderboard');
    }
}

function displayTopUsers(users) 
{
    const leaderboardTable = document.getElementById('leaderboard').querySelector('table');
    
    ///clear existing rows except header
    while (leaderboardTable.rows.length > 1) 
    {
        leaderboardTable.deleteRow(1);
    }

    if (!users || users.length === 0) 
    {
        const row = leaderboardTable.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 3;
        cell.textContent = 'No users found';
        cell.style.textAlign = 'center';
        cell.style.fontStyle = 'italic';
        cell.style.color = '#888';
        return;
    }

    users.forEach((user, index) => {
        const row = leaderboardTable.insertRow();
        const rankCell = row.insertCell();
        const usernameCell = row.insertCell();
        const levelCell = row.insertCell();

        rankCell.textContent = index + 1;
        usernameCell.textContent = user.username;
        levelCell.textContent = `Level ${user.level} (${user.experience} XP)`;

        ///special styling
        if (index === 0) 
        {
            row.classList.add('first-place');
            rankCell.innerHTML = '🥇 1';
        } 
        else if (index === 1) 
        {
            row.classList.add('second-place');
            rankCell.innerHTML = '🥈 2';
        } 
        else if (index === 2) 
        {
            row.classList.add('third-place');
            rankCell.innerHTML = '🥉 3';
        }
    });

    console.log(`Displayed ${users.length} users in leaderboard`);
}

function displayTopLocations(locations) 
{
    const locationTable = document.querySelector('.sidebar .location-table');
    
    while (locationTable.rows.length > 1) 
    {
        locationTable.deleteRow(1);
    }

    if (!locations || locations.length === 0) 
    {
        const row = locationTable.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = 'No locations found';
        cell.style.textAlign = 'center';
        cell.style.fontStyle = 'italic';
        cell.style.color = '#888';
        return;
    }

    locations.forEach((location, index) => {
        const row = locationTable.insertRow();
        const nameCell = row.insertCell();
        const scoreCell = row.insertCell();

        const locationName = location.name.length > 25 
            ? location.name.substring(0, 25) + '...' 
            : location.name;
        
        nameCell.textContent = locationName;
        nameCell.title = location.name;
        
        scoreCell.textContent = location.score;

        ///special styling
        if (index === 0) 
        {
            row.classList.add('first-place');
            nameCell.innerHTML = `🏆 ${locationName}`;
        } 
        else if (index === 1) 
        {
            row.classList.add('second-place');
            nameCell.innerHTML = `🥈 ${locationName}`;
        } 
        else if (index === 2) 
        {
            row.classList.add('third-place');
            nameCell.innerHTML = `🥉 ${locationName}`;
        }

        ///origin indicator
        if (location.origin === 'users') 
        {
            const originSpan = document.createElement('span');
            originSpan.textContent = ' 👤';
            originSpan.title = 'User submitted location';
            originSpan.style.fontSize = '12px';
            nameCell.appendChild(originSpan);
        }
    });

    console.log(`Displayed ${locations.length} locations in leaderboard`);
}

function showError(containerId, message) 
{
    const container = document.getElementById(containerId);
    if (container) 
    {
        const table = container.querySelector('table');
        if (table && table.rows.length > 1) 
        {
            ///clear existing rows except header
            while (table.rows.length > 1) 
            {
                table.deleteRow(1);
            }
        }
        
        const row = table.insertRow();
        const cell = row.insertCell();
        cell.colSpan = table.rows[0].cells.length;
        cell.textContent = message;
        cell.style.textAlign = 'center';
        cell.style.color = '#e74c3c';
        cell.style.fontStyle = 'italic';
        cell.style.padding = '20px';
    }
}