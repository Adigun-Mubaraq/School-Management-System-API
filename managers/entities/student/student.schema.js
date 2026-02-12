module.exports = {
    enrollStudent: [
        {
            path: 'schoolId',
            type: 'string',
            required: true,
        },
        {
            path: 'classroomId',
            type: 'string',
            required: true,
        },
        {
            path: 'firstName',
            type: 'string',
            length: { min: 2, max: 50 },
            required: true,
        },
        {
            path: 'lastName',
            type: 'string',
            length: { min: 2, max: 50 },
            required: true,
        },
        {
            model: 'email',
            path: 'email',
            required: true,
        },
        {
            path: 'gender',
            type: 'string',
            oneOf: ['male', 'female', 'other'],
            required: true,
        }
    ],
    transferStudent: [
        {
            path: 'studentId',
            type: 'string',
            required: true,
        },
        {
            path: 'classroomId',
            type: 'string',
            required: false,
        },
        {
            path: 'schoolId',
            type: 'string',
            required: false,
        }
    ]
}
