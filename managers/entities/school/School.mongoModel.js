const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    metadata: {
        type: Map,
        of: String
    }
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);
