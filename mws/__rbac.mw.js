module.exports = ({ meta, config, managers }) => {
    return async ({ req, res, next, results }) => {
        /** 
         * RBAC Middleware 
         * Expects req.user to be populated by __token middleware
         */
        const user = req.user;
        if (!user) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
        }

        /**
         * The UserServer.manager.js defines routes as /api/:moduleName/:fnName
         */
        const { moduleName, fnName } = req.params;
        
        /** 
         * Mapping module names to layers 
         */
        let layer = moduleName;
        if (moduleName === 'classroom') layer = 'school.classroom';
        if (moduleName === 'student') layer = 'school.student';

        /** 
         * Basic action mapping based on function name prefix 
         */
        let action = 'read';
        const lowerFnName = fnName.toLowerCase();
        if (lowerFnName.startsWith('create')) action = 'create';
        else if (lowerFnName.startsWith('update')) action = 'update';
        else if (lowerFnName.startsWith('delete')) action = 'delete';
        else if (lowerFnName.startsWith('manage')) action = 'manage';

        /** 
         * Check permissions using SharkFin 
         * For school_admin, we check if the schoolId in the request matches their own
         */
        let nodeId = req.body.schoolId || req.query.schoolId;
                if (!nodeId && action !== 'create') nodeId = user.schoolId?.toString();

                const isAuthorized = await managers.shark.isAuthorized({
                    userId: user._id.toString(),
                    layer,
                    action,
                    nodeId
                });

                if (!isAuthorized) {
            /** Special case: if user is superadmin, they have wild access */
            if (user.role === 'superadmin') {
                 return next(true);
            } else {
                return managers.responseDispatcher.dispatch(res, { ok: false, code: 403, errors: 'forbidden' });
            }
        }

        next(isAuthorized);
    }
}
