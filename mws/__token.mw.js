module.exports = ({ meta, config, managers, mongomodels }) => {
    return async ({ req, res, next }) => {
        if (!req.headers.token) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
        }

        let decoded = null;
        try {
            decoded = managers.token.verifyShortToken({ token: req.headers.token });
            if (!decoded) {
                return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
            }

            /** 
             * Attach user to req object for downstream access
             * Also fetch full user from DB to ensure they still exist and roles are fresh
             */
            const user = await mongomodels.User.findById(decoded.userId);
            if (!user) {
                return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
            }

            req.user = user;
            next(user);
        } catch (err) {
            return managers.responseDispatcher.dispatch(res, { ok: false, code: 401, errors: 'unauthorized' });
        }
    }
}