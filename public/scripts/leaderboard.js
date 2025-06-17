document.addEventListener('DOMContentLoaded', async () => {
    const leaderboardData = await getLeaderboard();
    const leaderboardTable = document.getElementById('leaderboard').querySelector('table');

    while (leaderboardTable.rows.length > 1) 
    {
        leaderboardTable.deleteRow(1);
    }

    if (leaderboardData) 
    {
        for (const user of leaderboardData) 
        {
            const row = document.createElement('tr');
            const rankCell = document.createElement('td');
            const usernameCell = document.createElement('td');
            const levelCell = document.createElement('td');

            rankCell.textContent = leaderboardData.indexOf(user) + 1;
            usernameCell.textContent = user.username;
            levelCell.textContent = user.level;

            row.appendChild(rankCell);
            row.appendChild(usernameCell);
            row.appendChild(levelCell);

            leaderboardTable.appendChild(row);
        }
    }
});

async function getLeaderboard() 
{
    try 
    {
        const response = await fetch('/api/users/leaderboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) 
        {
            const data = await response.json();
            return data;
        } 
        else 
        {
            alert('Error fetching leaderboard. Please try again later.');
            return null;
        }
    } 
    catch (error) 
    {
        console.error('Error fetching leaderboard:', error);
        alert('An error occurred while fetching the leaderboard.');
        return null;
    }
}
