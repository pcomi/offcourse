const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const locationRoutes = require('./routes/location-routes');
const userRoutes = require('./routes/user-routes');
const locationRequestRoutes = require('./routes/location-request-routes');
const explorationRoutes = require('./routes/exploration-routes');
const inviteRoutes = require('./routes/invite-routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

const mongoURI = 'mongodb://localhost:27017/Off-course';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

const checkAuthForUI = (req, res, next) => {
    try 
    {
        const token = req.cookies.token;
        
        if (!token) 
        {
            return res.redirect('/403');
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } 
    catch (error) 
    {
        console.error('UI Auth check failed:', error);
        return res.redirect('/403');
    }
};

const checkAdminForUI = (req, res, next) => {
    try 
    {
        const token = req.cookies.token;
        
        if (!token) 
        {
            return res.redirect('/403');
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        if (decoded.username !== 'admin') 
        {
            return res.redirect('/403');
        }

        req.user = decoded;
        next();
    } 
    catch (error) 
    {
        console.error('UI Admin check failed:', error);
        return res.redirect('/403');
    }
};

app.use('/api', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api', locationRequestRoutes);
app.use('/api', explorationRoutes);
app.use('/api', inviteRoutes);

app.use('/utils', express.static(path.join(__dirname, 'utils')));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about-us.html'));
});

app.get('/403', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '403.html'));
});

app.get('/main', checkAuthForUI, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

app.get('/top', checkAuthForUI, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'top.html'));
});

app.get('/details', checkAuthForUI, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'details.html'));
});

app.get('/admin', checkAdminForUI, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

///redirect root to login if not authenticated, otherwise to main
app.get('/', (req, res) => {
    try 
    {
        const token = req.cookies.token;
        
        if (!token) 
        {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        res.redirect('/main');
    } 
    catch (error) 
    {
        res.redirect('/login');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});