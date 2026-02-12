module.exports = {
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/school-api-dev",
    JWT_SECRET: process.env.LONG_TOKEN_SECRET || "dev_secret",
    CACHE_REDIS: process.env.CACHE_REDIS || "redis://127.0.0.1:6379",
}
