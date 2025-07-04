const jwt = require('jsonwebtoken');

///user authentification
const verifyAuth = (req, res, next) => {
    try 
    {
        const token = req.cookies.token;
        
        if (!token) 
        {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } 
    catch (error) 
    {
        console.error('Auth verification failed:', error);
        return res.status(401).json({ error: 'Access denied. Invalid token.' });
    }
};

///middleware to verify admin access
const verifyAdmin = (req, res, next) => {
    try 
    {
        const token = req.cookies.token;
        
        if (!token) 
        {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        if (decoded.username !== 'admin') 
        {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        req.user = decoded;
        next();
    } 
    catch (error) 
    {
        console.error('Admin verification failed:', error);
        return res.status(401).json({ error: 'Access denied. Invalid token.' });
    }
};

module.exports = {
    verifyAuth,
    verifyAdmin
};