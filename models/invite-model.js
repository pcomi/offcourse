const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    created_by: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    used_by: {
        type: String,
        default: null
    },
    used_at: {
        type: Date,
        default: null
    },
    is_used: {
        type: Boolean,
        default: false
    }
});

const Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;