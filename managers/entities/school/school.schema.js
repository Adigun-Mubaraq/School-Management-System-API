module.exports = {
    createSchool: [
        {
            path: 'name',
            type: 'string',
            length: { min: 3, max: 100 },
            required: true,
        },
        {
            path: 'address',
            type: 'string',
            length: { min: 5, max: 200 },
            required: true,
        },
        {
            model: 'email',
            path: 'contactEmail',
            required: true,
        },
        {
            path: 'phoneNumber',
            type: 'string',
            length: { min: 10, max: 15 },
            required: true,
        }
    ],
    updateSchool: [
        {
            path: 'schoolId',
            type: 'string',
            required: true,
        },
        {
            path: 'name',
            type: 'string',
            length: { min: 3, max: 100 },
            required: false,
        },
        {
            path: 'address',
            type: 'string',
            length: { min: 5, max: 200 },
            required: false,
        },
        {
            model: 'email',
            path: 'contactEmail',
            required: false,
        },
        {
            path: 'phoneNumber',
            type: 'string',
            length: { min: 10, max: 15 },
            required: false,
        }
    ]
}
