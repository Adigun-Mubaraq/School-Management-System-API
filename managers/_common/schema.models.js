const emojis = require('../../public/emojis.data.json');

module.exports = {
    id: {
        type: "string",
        length: { min: 1, max: 50 },
    },
    username: {
        type: 'string',
        length: {min: 3, max: 20},
        custom: 'username',
    },
    password: {
        type: 'string',
        length: {min: 8, max: 100},
    },
    email: {
        type: 'string',
        length: {min:3, max: 100},
        regex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    title: {
        type: 'string',
        length: {min: 3, max: 300}
    },
    label: {
        type: 'string',
        length: {min: 3, max: 100}
    },
    shortDesc: {
        type: 'string',
        length: {min:3, max: 300}
    },
    longDesc: {
        type: 'string',
        length: {min:3, max: 2000}
    },
    url: {
        type: 'string',
        length: {min: 9, max: 300},
    },
    emoji: {
        type: 'Array',
        items: {
            type: 'string',
            length: {min: 1, max: 10},
            oneOf: emojis.value,
        }
    },
    price: {
        type: 'number',
    },
    avatar: {
        type: 'string',
        length: {min: 8, max: 100},
    },
    text: {
        type: 'String',
        length: {min: 3, max:15},
    },
    longText: {
        type: 'String',
        length: {min: 3, max:250},
    },
    paragraph: {
        type: 'String',
        length: {min: 3, max:10000},
    },
    phone: {
        type: 'String',
        length: 13,
    },
    number: {
        type: 'Number',
        length: {min: 1, max:6},
    },
    arrayOfStrings: {
        type: 'Array',
        items: {
            type: 'String',
            length: { min: 3, max: 100}
        }
    },
    obj: {
        type: 'Object',
    },
    bool: {
        type: 'Boolean',
    },
}