const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { cacheInstance } = require('./cache');
const { PaginationMiddleware } = require('./pagination');
const logger = require('../utils/logger');

/**
 * Middleware de performance para otimização geral da aplicação
 */
class PerformanceMiddleware {
  /**
   * Configurar compressão de resposta
   */
  static compression() {
    return compression({
      filter: (req, res) => {
        // Não comprimir se o cliente não suporta
        if (req.headers['x-no-compression']) {
          return false;
        }

        // Comprimir tudo por padrão
        return compression.filter(req, res);
      },
      level: 6, // Nível de compressão balanceado
      threshold: 1024, // Só comprimir arquivos > 1KB
    });
  }

  /**
   * Configurar headers de segurança
   */
  static security() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    });
  }

  /**
   * Rate limiting configurável
   */
  static rateLimit(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutos
      max = 100, // máximo 100 requests por janela
      message = 'Muitas requisições, tente novamente mais tarde.',
      standardHeaders = true,
      legacyHeaders = false,
    } = options;

    return rateLimit({
      windowMs,
      max,
      message: {
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      },
      standardHeaders,
      legacyHeaders,
      handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.originalUrl,
        });

        res.status(429).json({
          success: false,
          error: message,
          retryAfter: Math.ceil(windowMs / 1000),
        });
      },
    });
  }

  /**
   * Rate limiting específico para APIs
   */
  static apiRateLimit() {
    return this.rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 1000, // 1000 requests por 15 min para APIs
      message: 'Limite de requisições da API excedido',
    });
  }

  /**
   * Rate limiting para autenticação
   */
  static authRateLimit() {
    return this.rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 5, // Só 5 tentativas de login por 15 min
      message: 'Muitas tentativas de login, tente novamente em 15 minutos',
    });
  }

  /**
   * Middleware para adicionar headers de cache
   */
  static cacheHeaders(maxAge = 300) {
    return (req, res, next) => {
      // Só aplicar cache em métodos GET
      if (req.method === 'GET') {
        res.set({
          'Cache-Control': `public, max-age=${maxAge}`,
          ETag: `"${Date.now()}"`, // ETag simples baseado em timestamp
        });
      }
      next();
    };
  }

  /**
   * Middleware para logs de performance
   */
  static performanceLogger() {
    return (req, res, next) => {
      const startTime = Date.now();

      // Interceptar o fim da resposta
      const originalEnd = res.end;
      res.end = function (...args) {
        const duration = Date.now() - startTime;

        // Log apenas se a requisição demorou mais que 1 segundo
        if (duration > 1000) {
          logger.warn('Slow request detected', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            statusCode: res.statusCode,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
          });
        }

        // Log normal para todas as requisições em debug
        logger.debug('Request completed', {
          method: req.method,
          url: req.originalUrl,
          duration: `${duration}ms`,
          statusCode: res.statusCode,
        });

        originalEnd.apply(this, args);
      };

      next();
    };
  }

  /**
   * Middleware para otimização de consultas
   */
  static queryOptimization() {
    return (req, res, next) => {
      // Adicionar helpers de otimização ao request
      req.optimizations = {
        // Helper para limitar campos retornados
        selectFields: (fields = []) => {
          if (req.query.fields) {
            const requestedFields = req.query.fields.split(',');
            return fields.length > 0
              ? fields.filter(field => requestedFields.includes(field))
              : requestedFields;
          }
          return fields;
        },

        // Helper para includes condicionais
        conditionalInclude: (include, condition = true) => {
          return condition ? include : undefined;
        },

        // Helper para paginação automática
        autoPaginate: (defaultLimit = 10, maxLimit = 100) => {
          const limit = Math.min(
            maxLimit,
            Math.max(1, parseInt(req.query.limit) || defaultLimit)
          );
          const page = Math.max(1, parseInt(req.query.page) || 1);
          const offset = (page - 1) * limit;

          return { limit, offset, page };
        },
      };

      next();
    };
  }

  /**
   * Middleware completo de performance
   */
  static full(options = {}) {
    const middlewares = [];

    // Adicionar middlewares baseado nas opções
    if (options.compression !== false) {
      middlewares.push(this.compression());
    }

    if (options.security !== false) {
      middlewares.push(this.security());
    }

    if (options.rateLimit !== false) {
      middlewares.push(this.apiRateLimit());
    }

    if (options.performanceLog !== false) {
      middlewares.push(this.performanceLogger());
    }

    if (options.queryOptimization !== false) {
      middlewares.push(this.queryOptimization());
    }

    if (options.pagination !== false) {
      middlewares.push(
        PaginationMiddleware.full(options.paginationOptions || {})
      );
    }

    // Retornar middleware combinado
    return (req, res, next) => {
      let index = 0;

      function runNext() {
        if (index >= middlewares.length) {
          return next();
        }

        const middleware = middlewares[index++];
        middleware(req, res, runNext);
      }

      runNext();
    };
  }

  /**
   * Middleware para monitoramento de memória
   */
  static memoryMonitor(threshold = 100 * 1024 * 1024) {
    // 100MB por padrão
    return (req, res, next) => {
      const memUsage = process.memoryUsage();

      if (memUsage.heapUsed > threshold) {
        logger.warn('High memory usage detected', {
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
          url: req.originalUrl,
        });

        // Forçar garbage collection se disponível
        if (global.gc) {
          global.gc();
        }
      }

      next();
    };
  }

  /**
   * Middleware para limpeza automática de cache
   */
  static cacheCleanup(interval = 5 * 60 * 1000) {
    // 5 minutos
    let lastCleanup = Date.now();

    return (req, res, next) => {
      const now = Date.now();

      if (now - lastCleanup > interval) {
        // Executar limpeza em background
        setImmediate(() => {
          const stats = cacheInstance.getStats();
          logger.info('Cache cleanup triggered', stats);

          // Limpar entradas expiradas (o node-cache já faz isso automaticamente)
          // Mas podemos forçar uma verificação
          cacheInstance.cache.keys().forEach(key => {
            cacheInstance.cache.get(key); // Isso força a verificação de expiração
          });
        });

        lastCleanup = now;
      }

      next();
    };
  }
}

module.exports = {
  PerformanceMiddleware,
};
