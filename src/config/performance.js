/**
 * Configurações de performance para a aplicação
 */

const performanceConfig = {
  // Configurações de cache
  cache: {
    // TTL padrão em segundos
    defaultTTL: 300, // 5 minutos

    // TTLs específicos por tipo de dados
    ttl: {
      products: 300, // 5 minutos
      categories: 600, // 10 minutos
      users: 300, // 5 minutos
      orders: 180, // 3 minutos
      dashboard: 120, // 2 minutos
      statistics: 600, // 10 minutos
      search: 240, // 4 minutos
    },

    // Configurações do node-cache
    options: {
      stdTTL: 300,
      checkperiod: 60,
      useClones: false,
      deleteOnExpire: true,
      enableLegacyCallbacks: false,
    },

    // Padrões para invalidação automática
    invalidationPatterns: {
      products: ['products', 'categories', 'dashboard'],
      categories: ['categories', 'products'],
      users: ['users', 'dashboard'],
      orders: ['orders', 'dashboard', 'statistics'],
    },
  },

  // Configurações de paginação
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
    defaultSort: 'id',
    defaultOrder: 'ASC',

    // Campos permitidos para ordenação por modelo
    allowedSortFields: {
      products: ['id', 'name', 'price', 'rating', 'createdAt', 'updatedAt'],
      categories: ['id', 'name', 'createdAt'],
      users: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      orders: ['id', 'number', 'total', 'status', 'createdAt', 'updatedAt'],
    },

    // Campos de busca por modelo
    searchFields: {
      products: ['name', 'description', 'brand'],
      categories: ['name'],
      users: ['name', 'email', 'nickname'],
      orders: ['number'],
    },

    // Campos de filtro por modelo
    filterFields: {
      products: ['brand', 'product_type', 'status', 'price'],
      categories: ['name'],
      users: ['status', 'rol_id'],
      orders: ['status', 'userId'],
    },
  },

  // Configurações de rate limiting
  rateLimit: {
    // Rate limit geral
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 1000, // 1000 requests por janela
    },

    // Rate limit para APIs
    api: {
      windowMs: 15 * 60 * 1000,
      max: 500,
    },

    // Rate limit para autenticação
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 5,
    },

    // Rate limit para busca
    search: {
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 30,
    },

    // Rate limit para upload
    upload: {
      windowMs: 15 * 60 * 1000,
      max: 10,
    },
  },

  // Configurações de compressão
  compression: {
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return true;
    },
  },

  // Configurações de headers de cache
  cacheHeaders: {
    // Cache por tipo de endpoint
    static: 86400, // 24 horas para arquivos estáticos
    api: 300, // 5 minutos para APIs
    dynamic: 60, // 1 minuto para conteúdo dinâmico
    noCache: 0, // Sem cache
  },

  // Configurações de monitoramento
  monitoring: {
    // Threshold para logs de performance (ms)
    slowRequestThreshold: 1000,

    // Threshold para uso de memória (bytes)
    memoryThreshold: 100 * 1024 * 1024, // 100MB

    // Intervalo para limpeza de cache (ms)
    cacheCleanupInterval: 5 * 60 * 1000, // 5 minutos

    // Intervalo para log de estatísticas (ms)
    statsLogInterval: 10 * 60 * 1000, // 10 minutos
  },

  // Configurações de otimização de consultas
  database: {
    // Limites para includes
    maxIncludes: 3,

    // Atributos padrão para excluir
    excludeAttributes: ['createdAt', 'updatedAt'],

    // Configurações de pool de conexões
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000,
    },

    // Timeout para consultas (ms)
    queryTimeout: 10000,
  },

  // Configurações específicas por ambiente
  environments: {
    development: {
      cache: {
        enabled: true,
        logStats: true,
      },
      rateLimit: {
        enabled: false, // Desabilitar em desenvolvimento
      },
      monitoring: {
        slowRequestThreshold: 2000, // Mais tolerante em dev
      },
    },

    production: {
      cache: {
        enabled: true,
        logStats: true,
      },
      rateLimit: {
        enabled: true,
      },
      monitoring: {
        slowRequestThreshold: 500, // Mais rigoroso em produção
      },
    },

    test: {
      cache: {
        enabled: false, // Desabilitar cache em testes
      },
      rateLimit: {
        enabled: false,
      },
    },
  },
};

/**
 * Obter configuração baseada no ambiente atual
 */
function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  const baseConfig = { ...performanceConfig };
  const envConfig = performanceConfig.environments[env] || {};

  // Merge das configurações
  return {
    ...baseConfig,
    ...envConfig,
    cache: { ...baseConfig.cache, ...envConfig.cache },
    rateLimit: { ...baseConfig.rateLimit, ...envConfig.rateLimit },
    monitoring: { ...baseConfig.monitoring, ...envConfig.monitoring },
  };
}

/**
 * Configurações específicas por controller
 */
const controllerConfigs = {
  products: {
    cache: {
      ttl: performanceConfig.cache.ttl.products,
      invalidationPatterns: ['products', 'categories', 'dashboard'],
    },
    pagination: {
      defaultLimit: 12, // Melhor para grids de produtos
      maxLimit: 50,
      allowedSortFields:
        performanceConfig.pagination.allowedSortFields.products,
      searchFields: performanceConfig.pagination.searchFields.products,
      filterFields: performanceConfig.pagination.filterFields.products,
    },
  },

  categories: {
    cache: {
      ttl: performanceConfig.cache.ttl.categories,
      invalidationPatterns: ['categories', 'products'],
    },
    pagination: {
      defaultLimit: 20,
      maxLimit: 100,
      allowedSortFields:
        performanceConfig.pagination.allowedSortFields.categories,
      searchFields: performanceConfig.pagination.searchFields.categories,
      filterFields: performanceConfig.pagination.filterFields.categories,
    },
  },

  users: {
    cache: {
      ttl: performanceConfig.cache.ttl.users,
      invalidationPatterns: ['users', 'dashboard'],
    },
    pagination: {
      defaultLimit: 15,
      maxLimit: 50,
      allowedSortFields: performanceConfig.pagination.allowedSortFields.users,
      searchFields: performanceConfig.pagination.searchFields.users,
      filterFields: performanceConfig.pagination.filterFields.users,
    },
  },

  orders: {
    cache: {
      ttl: performanceConfig.cache.ttl.orders,
      invalidationPatterns: ['orders', 'dashboard', 'statistics'],
    },
    pagination: {
      defaultLimit: 10,
      maxLimit: 100,
      allowedSortFields: performanceConfig.pagination.allowedSortFields.orders,
      searchFields: performanceConfig.pagination.searchFields.orders,
      filterFields: performanceConfig.pagination.filterFields.orders,
    },
  },
};

module.exports = {
  performanceConfig,
  getEnvironmentConfig,
  controllerConfigs,
};
