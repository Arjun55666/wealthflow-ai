let redis = null;

if (process.env.REDIS_URL) {
  try {
    const Redis = require("ioredis");
    redis = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });
    redis.on("connect", () => console.log("Redis connected!"));
    redis.on("error", (err) => console.error("Redis error:", err.message));
  } catch (err) {
    console.warn("Redis not available, caching disabled:", err.message);
    redis = null;
  }
} else {
  console.log("REDIS_URL not set, caching disabled");
}

module.exports = redis;
