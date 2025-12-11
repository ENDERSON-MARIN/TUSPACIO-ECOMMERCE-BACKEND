const NodeCache = require('node-cache');
const logger = require('../utils/logger');

/**
 * Cache middleware para otimização de performance
 * Implementa cache em memória com TTL configurável
 */
class CacheMiddleware {
  constructor(options = {}) {
    this.cache = new NodeCache({
      stdTTL: options.defaultTTL || 300, // 5 minutos por padrão
      checkperiod: options.checkPeriod || 60, // Verifica expiração a cada 60s
      useClones: false, // Melhor performance, mas cuidado com mutações
      deleteOnExpire: true,
      enableLegacyCallbacks: false,
    });

    // Estatísticas de cache
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };

    // Log estatísticas periodicamente
    if (options.logStats) {
      setInterval(() => {
        this.logStats();
      }, options.statsInterval || 300000); // 5 minutos
    }
  }

  /**
   * Middleware de cache para rotas
   * @param {number} ttl - Time to live em segundos
   * @param {Function} keyGenerator - Função para gerar chave do cache
   * @returns {Function} Express middleware
   */
  middleware(ttl = 300, keyGenerator = null) {
    return (req, res, next) => {
      // Gerar chave do cache
      const cacheKey = keyGenerator ? keyGenerator(req) : this.generateKey(req);

      // Tentar buscar no cache
      const cachedData = this.cache.get(cacheKey);

      if (cachedData) {
        this.stats.hits++;
        logger.info('Cache hit', {
          key: cacheKey,
          url: req.originalUrl,
          method: req.method,
        });

        return res.status(200).json(cachedData);
      }

      this.stats.misses++;
      logger.info('Cache miss', {
        key: cacheKey,
        url: req.originalUrl,
        method: req.method,
      });

      // Interceptar res.json para cachear a resposta
      const originalJson = res.json;
      res.json = data => {
        // Só cachear respostas de sucesso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.cache.set(cacheKey, data, ttl);
          this.stats.sets++;

          logger.info('Data cached', {
            key: cacheKey,
            ttl,
            dataSize: JSON.stringify(data).length,
          });
        }

        return originalJson.call(res, data);
      };

      next();
    };
  }

  /**
   * Gerar chave de cache baseada na requisição
   * @param {Object} req - Express request object
   * @returns {string} Cache key
   */
  generateKey(req) {
    const { method, originalUrl, query, params } = req;
    const userId = req.user?.id || 'anonymous';

    // Criar chave única baseada na URL, método, parâmetros e usuário
    const keyParts = [
      method,
      originalUrl,
      JSON.stringify(query),
      JSON.stringify(params),
      userId,
    ];

    return keyParts.join(':');
  }

  /**
   * Invalidar cache por padrão
   * @param {string} pattern - Padrão para invalidação
   */
  invalidatePattern(pattern) {
    const keys = this.cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));

    keysToDelete.forEach(key => {
      this.cache.del(key);
      this.stats.deletes++;
    });

    logger.info('Cache invalidated', {
      pattern,
      deletedKeys: keysToDelete.length,
    });
  }

  /**
   * Invalidar cache específico
   * @param {string} key - Chave específica
   */
  invalidate(key) {
    const deleted = this.cache.del(key);
    if (deleted) {
      this.stats.deletes++;
      logger.info('Cache key invalidated', { key });
    }
    return deleted;
  }

  /**
   * Limpar todo o cache
   */
  clear() {
    const keyCount = this.cache.keys().length;
    this.cache.flushAll();
    this.stats.deletes += keyCount;

    logger.info('Cache cleared', { deletedKeys: keyCount });
  }

  /**
   * Obter estatísticas do cache
   * @returns {Object} Estatísticas
   */
  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? (
            (this.stats.hits / (this.stats.hits + this.stats.misses)) *
            100
          ).toFixed(2)
        : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      cacheSize: this.cache.keys().length,
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Log das estatísticas
   */
  logStats() {
    const stats = this.getStats();
    logger.info('Cache statistics', stats);
  }

  /**
   * Middleware para invalidação automática em operações de escrita
   * @param {string|Array} patterns - Padrões para invalidar
   * @returns {Function} Express middleware
   */
  invalidateOnWrite(patterns = []) {
    return (req, res, next) => {
      const originalJson = res.json;

      res.json = data => {
        // Invalidar cache após operações de escrita bem-sucedidas
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

          patternsArray.forEach(pattern => {
            this.invalidatePattern(pattern);
          });
        }

        return originalJson.call(res, data);
      };

      next();
    };
  }
}

// Instância global do cache
const cacheInstance = new CacheMiddleware({
  defaultTTL: 300, // 5 minutos
  logStats: true,
  statsInterval: 300000, // Log stats a cada 5 minutos
});

/**
 * Middlewares pré-configurados para casos comuns
 */
const CachePresets = {
  // Cache curto para dados que mudam frequentemente
  short: cacheInstance.middleware(60), // 1 minuto

  // Cache médio para dados moderadamente dinâmicos
  medium: cacheInstance.middleware(300), // 5 minutos

  // Cache longo para dados relativamente estáticos
  long: cacheInstance.middleware(1800), // 30 minutos

  // Cache muito longo para dados raramente alterados
  veryLong: cacheInstance.middleware(3600), // 1 hora

  // Cache para listas paginadas
  paginated: (ttl = 300) =>
    cacheInstance.middleware(ttl, req => {
      const { page = 1, limit = 10, sort, sortBy, ...filters } = req.query;
      return `paginated:${req.originalUrl}:${page}:${limit}:${sort}:${sortBy}:${JSON.stringify(filters)}`;
    }),

  // Cache para dados específicos do usuário
  userSpecific: (ttl = 300) =>
    cacheInstance.middleware(ttl, req => {
      const userId = req.user?.id || req.params.userId || 'anonymous';
      return `user:${userId}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    }),
};

module.exports = {
  CacheMiddleware,
  cacheInstance,
  CachePresets,
};
