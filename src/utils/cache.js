const logger = require('./logger');

/**
 * Simple in-memory cache with TTL (Time To Live) support
 */
class Cache {
  constructor(options = {}) {
    this.cache = new Map();
    this.timers = new Map();
    this.defaultTTL = options.defaultTTL || 300000; // 5 minutes default
    this.maxSize = options.maxSize || 1000; // Maximum number of entries
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
    };

    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Set a value in the cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   */
  set(key, value, ttl = this.defaultTTL) {
    // Check if we need to evict entries due to size limit
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Clear existing timer if key already exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
    });

    // Set expiration timer
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }

    this.stats.sets++;

    logger.debug('Cache set', { key, ttl, cacheSize: this.cache.size });
  }

  /**
   * Get a value from the cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or undefined if not found/expired
   */
  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      logger.debug('Cache miss', { key });
      return undefined;
    }

    // Check if entry has expired
    if (entry.ttl > 0 && Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      logger.debug('Cache expired', { key });
      return undefined;
    }

    // Update access count and timestamp for LRU
    entry.accessCount++;
    entry.lastAccess = Date.now();

    this.stats.hits++;
    logger.debug('Cache hit', { key, accessCount: entry.accessCount });

    return entry.value;
  }

  /**
   * Check if a key exists in the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists and is not expired
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Delete a value from the cache
   * @param {string} key - Cache key
   * @returns {boolean} True if the key was deleted
   */
  delete(key) {
    const existed = this.cache.delete(key);

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    if (existed) {
      this.stats.deletes++;
      logger.debug('Cache delete', { key, cacheSize: this.cache.size });
    }

    return existed;
  }

  /**
   * Clear all entries from the cache
   */
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.cache.clear();
    this.timers.clear();

    logger.info('Cache cleared', { previousSize: this.cache.size });
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
        : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  /**
   * Get approximate memory usage of the cache
   * @returns {Object} Memory usage information
   */
  getMemoryUsage() {
    let totalSize = 0;
    let entryCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation of memory usage
      totalSize += key.length * 2; // String characters are 2 bytes each
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 100; // Overhead for entry metadata
      entryCount++;
    }

    return {
      estimatedBytes: totalSize,
      estimatedMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
      entries: entryCount,
    };
  }

  /**
   * Evict least recently used entry
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const lastAccess = entry.lastAccess || entry.timestamp;
      if (lastAccess < oldestTime) {
        oldestTime = lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
      logger.debug('Cache LRU eviction', { evictedKey: oldestKey });
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl > 0 && now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.delete(key);
    }

    if (expiredKeys.length > 0) {
      logger.debug('Cache cleanup', { expiredCount: expiredKeys.length });
    }
  }

  /**
   * Get or set a value using a function
   * @param {string} key - Cache key
   * @param {Function} fn - Function to call if cache miss
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {*} Cached or computed value
   */
  async getOrSet(key, fn, ttl = this.defaultTTL) {
    let value = this.get(key);

    if (value === undefined) {
      try {
        value = await fn();
        this.set(key, value, ttl);
      } catch (error) {
        logger.error('Cache getOrSet function failed', {
          key,
          error: error.message,
        });
        throw error;
      }
    }

    return value;
  }

  /**
   * Create Express middleware for caching responses
   * @param {Object} options - Middleware options
   * @returns {Function} Express middleware
   */
  createMiddleware(options = {}) {
    const {
      ttl = this.defaultTTL,
      keyGenerator = req => `${req.method}:${req.originalUrl}`,
      shouldCache = (req, res) =>
        req.method === 'GET' && res.statusCode === 200,
    } = options;

    return (req, res, next) => {
      const key = keyGenerator(req);

      // Try to get cached response
      const cached = this.get(key);
      if (cached) {
        res.set(cached.headers);
        res.status(cached.statusCode).send(cached.body);
        return;
      }

      // Capture response
      const originalSend = res.send;
      const originalJson = res.json;

      res.send = function (body) {
        if (shouldCache(req, res)) {
          cache.set(
            key,
            {
              statusCode: res.statusCode,
              headers: res.getHeaders(),
              body,
            },
            ttl
          );
        }
        originalSend.call(this, body);
      };

      res.json = function (obj) {
        if (shouldCache(req, res)) {
          cache.set(
            key,
            {
              statusCode: res.statusCode,
              headers: res.getHeaders(),
              body: obj,
            },
            ttl
          );
        }
        originalJson.call(this, obj);
      };

      next();
    };
  }

  /**
   * Destroy the cache and cleanup resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Create default cache instance
const cache = new Cache({
  defaultTTL: 300000, // 5 minutes
  maxSize: 1000,
});

module.exports = {
  Cache,
  cache,
};
