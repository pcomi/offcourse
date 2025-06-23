const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const locationRoutes = require('./routes/location-routes');
const userRoutes = require('./routes/user-routes');
const locationRequestRoutes = require('./routes/location-request-routes');
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

app.use('/api', locationRoutes);

app.use('/api/users', userRoutes);

app.use('/api', locationRequestRoutes);

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about-us.html'));
});

app.get('/top', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'top.html'));
});

app.get('/403', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', '403.html'));
});

app.get('/details', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'details.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
