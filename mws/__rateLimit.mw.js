const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');

module.exports = async ({ meta, config, managers }) => {

    // Skip Redis rate limiting in test
    if (process.env.NODE_ENV === 'test') {
        return (req, res, next) => next();
    }

    // Dedicated Redis client for rate limiting
    const rateLimitClient = createClient({
        url: config.dotEnv.CACHE_REDIS
    });

    rateLimitClient.on('error', (err) => {
        console.error('RateLimit Redis Client Error:', err);
    });

    await rateLimitClient.connect();

    return rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (...args) => rateLimitClient.sendCommand(args),
            prefix: 'rl:',
        }),
        handler: (req, res) => {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 429,
                errors: 'Too many requests, please try again later.'
            });
        }
    });
};
