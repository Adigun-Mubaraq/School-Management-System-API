module.exports = {
    createUser: [
        {
            model: 'username',
            path: 'username',
            required: true,
        },
        {
            model: 'email',
            path: 'email',
            required: true,
        },
        {
            model: 'password',
            path: 'password',
            required: true,
        },
        {
            path: 'role',
            type: 'string',
            oneOf: ['superadmin', 'school_admin', 'staff'],
            required: true,
        },
        {
            path: 'schoolId',
            type: 'string',
            required: false,
        }
    ],
    login: [
        {
            model: 'email',
            path: 'email',
            required: true,
        },
        {
            model: 'password',
            path: 'password',
            required: true,
        }
    ]
}
