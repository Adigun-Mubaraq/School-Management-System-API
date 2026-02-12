module.exports = {
    createClassroom: [
        {
            path: 'schoolId',
            type: 'string',
            required: true,
        },
        {
            path: 'name',
            type: 'string',
            length: { min: 2, max: 50 },
            required: true,
        },
        {
            path: 'capacity',
            type: 'number',
            required: true,
        }
    ],
    updateClassroom: [
        {
            path: 'classroomId',
            type: 'string',
            required: true,
        },
        {
            path: 'name',
            type: 'string',
            length: { min: 2, max: 50 },
            required: false,
        },
        {
            path: 'capacity',
            type: 'number',
            required: false,
        }
    ]
}
