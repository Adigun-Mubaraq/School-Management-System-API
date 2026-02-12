const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['superadmin', 'school_admin'],
        required: true
    },
    key: {
        type: String,
        default: () => require('nanoid').nanoid()
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: function() {
            return this.role === 'school_admin';
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
