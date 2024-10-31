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

//signup
document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const email = document.getElementById('signupEmail').value;

    if (username && password && email) 
    {
        try 
        {
            const response = await fetch('/api/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, email }),
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
            alert('Error signing up. Please try again later.');
        }
    } 
    else 
    {
        alert('Please fill in all fields.');
    }
});

//login
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username && password) {
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
