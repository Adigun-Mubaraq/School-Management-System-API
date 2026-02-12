module.exports = class User { 

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.shark               = managers.shark;
        this.responseDispatcher  = managers.responseDispatcher;
        this.usersCollection     = "users";
        this.httpExposed         = ['post=createUser', 'post=login'];
    }

    async login({ email, password }) {
        const result = await this.validators.user.login({ email, password });
        if (result) {
            return { error: result, code: 400 };
        }

        const user = await this.mongomodels.User.findOne({ email });
        if (!user) {
            return { error: 'Invalid credentials', code: 401 };
        }

        const isMatch = await require('bcrypt').compare(password, user.password);
        if (!isMatch) {
            return { error: 'Invalid credentials', code: 401 };
        }

        const longToken = this.tokenManager.genLongToken({ userId: user._id, userKey: user.key });
        const shortToken = this.tokenManager.genShortToken({ 
            userId: user._id, 
            userKey: user.key,
            sessionId: require('nanoid').nanoid(),
            deviceId: 'initial_login' 
        });

        return {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId
            },
            longToken,
            shortToken
        };
    }

    async createUser({ __token, __rbac, username, email, password, role, schoolId }){
        const result = await this.validators.user.createUser({username, email, password, role, schoolId});
        if (result) {
            return { error: result, code: 400 };
        }

        const hashedPassword = await require('bcrypt').hash(password, 10);
        const user = new this.mongomodels.User({
            username,
            email,
            password: hashedPassword,
            role,
            schoolId
        });

        await user.save();

        /** If school admin, grant access to the school in SharkFin */
        if (role === 'school_admin' && schoolId) {
            await this.shark.addDirectAccess({
                userId: user._id.toString(),
                nodeId: schoolId.toString(),
                action: 'manage'
            });
        }
        
        return {
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId
            }
        };
    }

}
