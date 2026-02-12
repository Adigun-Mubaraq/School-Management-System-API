const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    resources: [{
        type: String
    }],
    floor: {
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);
