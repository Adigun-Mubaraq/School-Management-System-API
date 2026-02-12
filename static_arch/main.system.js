const layers = {
    school: {
        /** By default, no one has access unless granted */
        _default: { anyoneCan: 'none', ownerCan: 'manage' },
        
        /** Classroom layer inherits from school or has its own rules */
        classroom: {
            _default: { inherit: true },
        },
        
        /** Student layer inherits from school */
        student: {
            _default: { inherit: true },
        }
    }
}

const actions = {
    blocked: -1,
    none: 1,
    read: 2,
    create: 3,
    update: 4,
    delete: 5,
    manage: 6
}

module.exports = {
    layers,
    actions
}
