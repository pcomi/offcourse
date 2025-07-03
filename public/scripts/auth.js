document.getElementById('toggleLogin').addEventListener('click', function() 
{
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    this.classList.add('active');
    document.getElementById('toggleSignup').classList.remove('active');
});

document.getElementById('toggleSignup').addEventListener('click', function() 
{
    document.getElementById('signupForm').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    this.classList.add('active');
    document.getElementById('toggleLogin').classList.remove('active');
});

document.getElementById('signupInviteCode').addEventListener('input', function(e) {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');///uppercase and 8 characters max
    if (value.length > 8) 
    {
        value = value.substring(0, 8);
    }
    e.target.value = value;
});

document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const email = document.getElementById('signupEmail').value;
    const inviteCode = document.getElementById('signupInviteCode').value;

    if (username && password && email && inviteCode) 
    {
        if (inviteCode.length !== 8) 
        {
            alert('Invite code must be exactly 8 characters long.');
            return;
        }

        try 
        {
            const response = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email, inviteCode }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                window.location.href = '/main';
            } 
            else 
            {
                alert(data.message);
            }
        } 
        catch (error) 
        {
            console.error('Signup error:', error);
            alert('Error signing up. Please try again later.');
        }
    } 
    else 
    {
        alert('Please fill in all fields, including the invite code.');
    }
});

//login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username && password) 
    {
        try 
        {
            const response = await fetch('/api/users/signin', 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) 
            {
                alert(data.message);
                window.location.href = '/main';
            } 
            else 
            {
                alert(data.message);
            }
        } 
        catch (error) 
        {
            alert('Error logging in. Please try again later.');
        }
    } 
    else 
    {
        alert('Please fill in all fields.');
    }
});