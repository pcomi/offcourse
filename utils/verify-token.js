const jwt = require('jsonwebtoken');

const getSignatureFromToken = () => 
{
    const token = getCookie('token');

    if (!token) 
    {
        console.error('Token cookie not found');
        return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) 
    {
        console.error('Invalid token format');
        return null;
    }

    const signature = parts[2];
    return signature;
};
