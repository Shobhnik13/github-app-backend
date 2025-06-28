require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis(process.env.UPSTASH_REDIS_URL);

async function testConnection() {
    try {
        await redis.set('connection_test', 'connected!');
        const result = await redis.get('connection_test');
        console.log('✅ Redis is connected. Value:', result);
        redis.disconnect();
    } catch (err) {
        console.error('❌ Redis connection failed:', err.message);
    }
}

testConnection()
