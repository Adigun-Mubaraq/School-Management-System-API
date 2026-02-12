const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');

module.exports = ({ meta, config, managers }) => {
    // Return a dummy middleware for testing if cache is not available
    if (process.env.NODE_ENV === 'test' && (!managers.cache || !managers.cache.client)) {
        return (req, res, next) => next();
    }

    /** 
     * Rate Limiting Middleware using Redis
     * Standard limit: 100 requests per 15 minutes per IP
     */
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `window`
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        store: new RedisStore({
            sendCommand: (...args) => {
                if (managers.cache && managers.cache.client && managers.cache.client.sendCommand) {
                    return managers.cache.client.sendCommand(args);
                }
                // Fallback for testing: return a single number that RedisStore expects for hit count
                return Promise.resolve(1);
            },
            prefix: 'rl:', // Prefix for redis keys
        }),
        handler: (req, res, next, options) => {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 429,
                errors: 'Too many requests, please try again later.'
            });
        }
    });
}
