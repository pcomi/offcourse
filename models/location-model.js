const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: String,
    latitude: Number,
    longitude: Number,
    score: {
        type: Number,
        default: 1
    }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;