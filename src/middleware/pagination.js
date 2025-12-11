/* eslint-disable prefer-const */
const { Op } = require('sequelize');
const { ValidationError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Middleware de paginação para otimizar consultas de listas grandes
 */
class PaginationMiddleware {
  /**
   * Middleware para processar parâmetros de paginação
   * @param {Object} options - Opções de configuração
   * @returns {Function} Express middleware
   */
  static paginate(options = {}) {
    const {
      defaultLimit = 10,
      maxLimit = 100,
      defaultSort = 'id',
      defaultOrder = 'ASC',
      allowedSortFields = [],
    } = options;

    return (req, res, next) => {
      try {
        // Processar parâmetros de paginação
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(
          maxLimit,
          Math.max(1, parseInt(req.query.limit) || defaultLimit)
        );
        const offset = (page - 1) * limit;

        // Processar ordenação
        let sortBy = req.query.sortBy || defaultSort;
        let order = (req.query.order || defaultOrder).toUpperCase();

        // Validar campo de ordenação se especificado
        if (
          allowedSortFields.length > 0 &&
          !allowedSortFields.includes(sortBy)
        ) {
          throw new ValidationError(
            `Invalid sort field. Allowed fields: ${allowedSortFields.join(', ')}`
          );
        }

        // Validar ordem
        if (!['ASC', 'DESC'].includes(order)) {
          order = defaultOrder;
        }

        // Adicionar informações de paginação ao request
        req.pagination = {
          page,
          limit,
          offset,
          sortBy,
          order,
        };

        // Função helper para aplicar paginação em consultas Sequelize
        req.applyPagination = (queryOptions = {}) => {
          return {
            ...queryOptions,
            limit,
            offset,
            order: [[sortBy, order]],
          };
        };

        // Função helper para criar resposta paginada
        req.createPaginatedResponse = (data, totalCount) => {
          const totalPages = Math.ceil(totalCount / limit);
          const hasNextPage = page < totalPages;
          const hasPrevPage = page > 1;

          return {
            data,
            pagination: {
              currentPage: page,
              totalPages,
              totalItems: totalCount,
              itemsPerPage: limit,
              hasNextPage,
              hasPrevPage,
              nextPage: hasNextPage ? page + 1 : null,
              prevPage: hasPrevPage ? page - 1 : null,
            },
          };
        };

        logger.debug('Pagination applied', {
          page,
          limit,
          offset,
          sortBy,
          order,
          url: req.originalUrl,
        });

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Middleware para busca e filtros
   * @param {Object} options - Opções de configuração
   * @returns {Function} Express middleware
   */
  static search(options = {}) {
    const {
      searchFields = [],
      filterFields = [],
      defaultSearchOperator = 'iLike', // Para PostgreSQL
    } = options;

    return (req, res, next) => {
      try {
        const { search, ...filters } = req.query;

        // Processar busca
        let searchConditions = {};
        if (search && searchFields.length > 0) {
          const searchValue = `%${search}%`;
          searchConditions = {
            [Op.or]: searchFields.map(field => ({
              [field]: {
                [Op[defaultSearchOperator]]: searchValue,
              },
            })),
          };
        }

        // Processar filtros
        let filterConditions = {};
        Object.keys(filters).forEach(key => {
          if (filterFields.includes(key) && filters[key]) {
            // Suporte para diferentes tipos de filtros
            if (filters[key].includes(',')) {
              // Múltiplos valores (IN)
              filterConditions[key] = {
                [Op.in]: filters[key].split(','),
              };
            } else if (filters[key].includes('..')) {
              // Range (BETWEEN)
              const [min, max] = filters[key].split('..');
              filterConditions[key] = {
                [Op.between]: [min, max],
              };
            } else {
              // Valor único
              filterConditions[key] = filters[key];
            }
          }
        });

        // Combinar condições
        const whereConditions = {
          ...searchConditions,
          ...filterConditions,
        };

        // Adicionar ao request
        req.searchFilters = {
          search,
          filters,
          whereConditions,
          hasSearch: !!search,
          hasFilters: Object.keys(filterConditions).length > 0,
        };

        logger.debug('Search and filters applied', {
          search,
          filters,
          whereConditions,
          url: req.originalUrl,
        });

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Middleware combinado para paginação, busca e filtros
   * @param {Object} options - Opções de configuração
   * @returns {Function} Express middleware
   */
  static full(options = {}) {
    const paginationMiddleware = this.paginate(options);
    const searchMiddleware = this.search(options);

    return (req, res, next) => {
      paginationMiddleware(req, res, err => {
        if (err) {
          return next(err);
        }

        searchMiddleware(req, res, next);
      });
    };
  }
}

/**
 * Helper para criar consultas otimizadas com paginação
 */
class QueryOptimizer {
  /**
   * Otimizar consulta com paginação e includes
   * @param {Object} model - Modelo Sequelize
   * @param {Object} options - Opções da consulta
   * @param {Object} req - Request object com paginação
   * @returns {Promise} Resultado da consulta
   */
  static async findAndCountAllOptimized(model, options = {}, req) {
    const {
      include = [],
      attributes,
      where = {},
      distinct = false,
      ...otherOptions
    } = options;

    // Aplicar paginação
    const paginatedOptions = req.applyPagination({
      where: {
        ...where,
        ...req.searchFilters?.whereConditions,
      },
      include,
      attributes,
      distinct,
      ...otherOptions,
    });

    // Executar consulta otimizada
    const result = await model.findAndCountAll(paginatedOptions);

    // Retornar resposta paginada
    return req.createPaginatedResponse(result.rows, result.count);
  }

  /**
   * Otimizar includes para evitar consultas N+1
   * @param {Array} includes - Array de includes
   * @returns {Array} Includes otimizados
   */
  static optimizeIncludes(includes = []) {
    return includes.map(include => ({
      ...include,
      // Sempre usar LEFT JOIN para melhor performance
      required: include.required || false,
      // Limitar atributos para reduzir transferência de dados
      attributes: include.attributes || { exclude: ['createdAt', 'updatedAt'] },
      // Evitar includes aninhados desnecessários
      separate: include.separate || false,
    }));
  }

  /**
   * Criar consulta com cache inteligente
   * @param {Object} model - Modelo Sequelize
   * @param {Object} options - Opções da consulta
   * @param {Object} req - Request object
   * @param {Object} cacheOptions - Opções de cache
   * @returns {Promise} Resultado da consulta
   */
  static async findWithCache(model, options = {}, req, cacheOptions = {}) {
    const { ttl = 300, keyPrefix = model.name } = cacheOptions;

    // Gerar chave de cache baseada nos parâmetros da consulta
    const cacheKey = `${keyPrefix}:${JSON.stringify({
      ...options,
      pagination: req.pagination,
      filters: req.searchFilters,
    })}`;

    // Tentar buscar no cache primeiro
    const cached = req.cache?.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Executar consulta
    const result = await this.findAndCountAllOptimized(model, options, req);

    // Cachear resultado
    if (req.cache) {
      req.cache.set(cacheKey, result, ttl);
    }

    return result;
  }
}

module.exports = {
  PaginationMiddleware,
  QueryOptimizer,
};
