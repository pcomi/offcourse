const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    original_name: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    uploaded_by: {
        type: String,
        required: true
    },
    location_request_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LocationRequest',
        default: null
    },
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Upload = mongoose.model('Upload', uploadSchema, 'uploads');

module.exports = Upload;