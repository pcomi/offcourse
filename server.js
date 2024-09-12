const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { getLocations } = require('./controllers/location-controller');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8001;

console.log('SECRET_KEY:', process.env.SECRET_KEY);///debug

const mongoURI = 'mongodb://localhost:27017/Off-course';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/locations', getLocations);

app.get('/', (req, res) => 
{
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

app.get('/main', (req, res) =>
{
    res.sendFile(path.join(__dirname, 'views', 'main.html'));
});

app.listen(PORT, () => 
{
    console.log(`Server is running on http://localhost:${PORT}`);
});
