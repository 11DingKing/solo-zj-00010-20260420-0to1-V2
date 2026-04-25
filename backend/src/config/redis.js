const redis = require('redis');
require('dotenv').config();

let client = null;

async function connectRedis() {
  if (client) return client;

  client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    },
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  client.on('connect', () => {
    console.log('Redis connected successfully');
  });

  await client.connect();
  return client;
}

async function getRedisClient() {
  if (!client) {
    await connectRedis();
  }
  return client;
}

async function setCache(key, value, ttl = 600) {
  const redisClient = await getRedisClient();
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  await redisClient.set(key, valueStr, { EX: ttl });
}

async function getCache(key) {
  const redisClient = await getRedisClient();
  const value = await redisClient.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function deleteCache(key) {
  const redisClient = await getRedisClient();
  await redisClient.del(key);
}

async function deleteCacheByPattern(pattern) {
  const redisClient = await getRedisClient();
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
}

module.exports = {
  connectRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  deleteCacheByPattern,
};
