const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
const locationRoutes = require('./routes/location-routes');
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

app.use('/api', locationRoutes);

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
