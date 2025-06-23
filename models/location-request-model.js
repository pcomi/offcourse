const mongoose = require('mongoose');

const locationRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    score: {
        type: Number,
        default: 1
    },
    origin: {
        type: String,
        default: 'user_submission'
    },
    description: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    submitted_by: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    admin_notes: {
        type: String,
        default: ''
    }
});

const LocationRequest = mongoose.model('LocationRequest', locationRequestSchema, 'requests');

module.exports = LocationRequest;