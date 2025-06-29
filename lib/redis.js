require('dotenv').config();
const Redis = require('ioredis');

let redis;

if (!global._redis) {
    redis = new Redis(process.env.UPSTASH_REDIS_URL);
    redis.on('connect', () => {
        console.log('Redis connected successfully');
    });
    redis.on('error', (err) => {
        console.error('Redis connection error:', err.message);
    });
    global._redis = redis;
} else {
    redis = global._redis;
}

module.exports = {
    redis
};
