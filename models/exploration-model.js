const mongoose = require('mongoose');

const explorationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    location_name: {
        type: String,
        required: true
    },
    exploration_type: {
        type: String,
        enum: ['location_request', 'location_exploration'],
        required: true
    },
    exp_gained: {
        type: Number,
        required: true
    },
    photos: [{
        filename: String,
        path: String,
        original_name: String
    }],
    description: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    admin_notes: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    reviewed_at: {
        type: Date,
        default: null
    },
    reviewed_by: {
        type: String,
        default: null
    }
});

explorationSchema.index({ user_id: 1, location_id: 1, status: 1 });///no duplicates (for active explorations)

const Exploration = mongoose.model('Exploration', explorationSchema, 'explorations');

module.exports = Exploration;