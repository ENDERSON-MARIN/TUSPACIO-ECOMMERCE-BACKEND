const { Categorie, Product } = require('../../db');
const { Op } = require('sequelize');
const {
  catchAsync,
  NotFoundError,
  ValidationError,
  ConflictError,
} = require('../../middleware/errorHandler');
const { QueryOptimizer } = require('../../middleware/pagination');
const { cacheInstance } = require('../../middleware/cache');
const logger = require('../../utils/logger');

/**
 * Controller otimizado para categorias
 * Implementa cache, paginação e consultas otimizadas
 */
class OptimizedCategoriesController {
  /**
   * GET ALL CATEGORIES - Versão otimizada com cache e paginação
   */
  static getAllCategories = catchAsync(async (req, res) => {
    const { brand, includeProducts = 'false' } = req.query;

    const options = {
      attributes: ['id', 'name'],
      ...(includeProducts === 'true' && {
        include: {
          model: Product,
          attributes: ['id', 'name', 'brand', 'status', 'price'],
          required: false,
          where: {
            status: true,
            ...(brand && { brand: { [Op.iLike]: `%${brand}%` } }),
          },
        },
      }),
    };

    const cacheKeyPrefix = `categories${includeProducts === 'true' ? '_with_products' : ''}${brand ? `_brand_${brand}` : ''}`;

    const result = await QueryOptimizer.findWithCache(
      Categorie,
      options,
      req,
      { ttl: 600, keyPrefix: cacheKeyPrefix } // Cache mais longo para categorias
    );

    // Filtrar categorias por marca se necessário (para compatibilidade)
    let filteredData = result.data;
    if (brand && includeProducts === 'true') {
      filteredData = result.data.filter(
        category => category.products && category.products.length > 0
      );
    }

    logger.info('Categories retrieved', {
      count: filteredData.length,
      brand,
      includeProducts,
      page: req.pagination.page,
    });

    res.status(200).json({
      status: 'success',
      data: {
        categories: filteredData,
        pagination: {
          ...result.pagination,
          total: filteredData.length,
        },
      },
    });
  });

  /**
   * GET CATEGORY BY ID - Otimizado com cache
   */
  static getCategoryById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { includeProducts = 'false' } = req.query;

    const cacheKey = `category_${id}${includeProducts === 'true' ? '_with_products' : ''}`;
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: { category: cached },
        cached: true,
      });
    }

    const category = await Categorie.findByPk(id, {
      attributes: ['id', 'name'],
      ...(includeProducts === 'true' && {
        include: {
          model: Product,
          attributes: ['id', 'name', 'brand', 'status', 'price', 'image_link'],
          where: { status: true },
          required: false,
        },
      }),
    });

    if (!category) {
      throw new NotFoundError(`Categoria com ID '${id}' não encontrada`);
    }

    // Cache por 10 minutos
    cacheInstance.cache.set(cacheKey, category, 600);

    logger.info('Category retrieved', { categoryId: id });

    res.status(200).json({
      status: 'success',
      data: { category },
      cached: false,
    });
  });

  /**
   * CREATE CATEGORY - Otimizado com validação
   */
  static createCategory = catchAsync(async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
      throw new ValidationError('Nome da categoria é obrigatório');
    }

    const normalizedName = name.toLowerCase().trim();

    // Verificar se categoria já existe
    const existingCategory = await Categorie.findOne({
      where: { name: normalizedName },
    });

    if (existingCategory) {
      throw new ConflictError(`Categoria '${normalizedName}' já existe`);
    }

    const newCategory = await Categorie.create({
      name: normalizedName,
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('categories');

    logger.info('Category created', {
      id: newCategory.id,
      name: newCategory.name,
    });

    res.status(201).json({
      status: 'success',
      data: {
        category: {
          id: newCategory.id,
          name: newCategory.name,
        },
      },
      message: 'Categoria criada com sucesso',
    });
  });

  /**
   * UPDATE CATEGORY - Otimizado
   */
  static updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      throw new ValidationError('Nome da categoria é obrigatório');
    }

    const result = await Categorie.sequelize.transaction(async transaction => {
      const category = await Categorie.findByPk(id, { transaction });

      if (!category) {
        throw new NotFoundError(`Categoria com ID '${id}' não encontrada`);
      }

      const normalizedName = name.toLowerCase().trim();

      // Verificar se o novo nome já existe (excluindo a categoria atual)
      const existingCategory = await Categorie.findOne({
        where: {
          name: normalizedName,
          id: { [Op.ne]: id },
        },
        transaction,
      });

      if (existingCategory) {
        throw new ConflictError(`Categoria '${normalizedName}' já existe`);
      }

      await category.update({ name: normalizedName }, { transaction });
      return category;
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('categories');
    cacheInstance.invalidatePattern(`category_${id}`);

    logger.info('Category updated', {
      id,
      newName: result.name,
    });

    res.status(200).json({
      status: 'success',
      data: {
        category: {
          id: result.id,
          name: result.name,
        },
      },
      message: 'Categoria atualizada com sucesso',
    });
  });

  /**
   * DELETE CATEGORY - Otimizado com verificação de dependências
   */
  static deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { force = 'false' } = req.query;

    const result = await Categorie.sequelize.transaction(async transaction => {
      const category = await Categorie.findByPk(id, { transaction });

      if (!category) {
        throw new NotFoundError(`Categoria com ID '${id}' não encontrada`);
      }

      // Verificar se há produtos associados
      const productCount = await category.countProducts({ transaction });

      if (productCount > 0 && force !== 'true') {
        throw new ValidationError(
          `Não é possível deletar a categoria. Existem ${productCount} produto(s) associado(s). Use force=true para forçar a remoção.`
        );
      }

      // Se force=true, remover associações primeiro
      if (productCount > 0 && force === 'true') {
        const products = await category.getProducts({ transaction });
        await category.removeProducts(products, { transaction });

        logger.warn('Category associations removed', {
          categoryId: id,
          removedProducts: productCount,
        });
      }

      await category.destroy({ transaction });
      return { category, removedProducts: productCount };
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('categories');
    cacheInstance.invalidatePattern(`category_${id}`);
    cacheInstance.invalidatePattern('products'); // Produtos podem ter sido afetados

    logger.info('Category deleted', {
      id,
      name: result.category.name,
      removedProducts: result.removedProducts,
    });

    res.status(200).json({
      status: 'success',
      message: 'Categoria deletada com sucesso',
      data: {
        removedProducts: result.removedProducts,
      },
    });
  });

  /**
   * GET CATEGORY STATISTICS - Novo endpoint para estatísticas
   */
  static getCategoryStatistics = catchAsync(async (req, res) => {
    const cacheKey = 'category_statistics';
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        status: 'success',
        data: cached,
        cached: true,
      });
    }

    // Buscar estatísticas usando consulta otimizada
    const categoriesWithCounts = await Categorie.findAll({
      attributes: [
        'id',
        'name',
        [
          Categorie.sequelize.fn(
            'COUNT',
            Categorie.sequelize.col('products.id')
          ),
          'productCount',
        ],
      ],
      include: [
        {
          model: Product,
          attributes: [],
          where: { status: true },
          required: false,
        },
      ],
      group: ['Categorie.id', 'Categorie.name'],
      order: [[Categorie.sequelize.literal('productCount'), 'DESC']],
    });

    const totalCategories = categoriesWithCounts.length;
    const categoriesWithProducts = categoriesWithCounts.filter(
      cat => parseInt(cat.dataValues.productCount) > 0
    ).length;
    const emptyCategories = totalCategories - categoriesWithProducts;

    const statistics = {
      totalCategories,
      categoriesWithProducts,
      emptyCategories,
      utilizationRate:
        totalCategories > 0
          ? ((categoriesWithProducts / totalCategories) * 100).toFixed(2)
          : 0,
      topCategories: categoriesWithCounts.slice(0, 5).map(cat => ({
        id: cat.id,
        name: cat.name,
        productCount: parseInt(cat.dataValues.productCount),
      })),
    };

    // Cache por 15 minutos
    cacheInstance.cache.set(cacheKey, statistics, 900);

    logger.info('Category statistics retrieved', statistics);

    res.status(200).json({
      status: 'success',
      data: statistics,
      cached: false,
    });
  });

  /**
   * SEARCH CATEGORIES - Novo endpoint para busca
   */
  static searchCategories = catchAsync(async (req, res) => {
    const { q: query, hasProducts = 'all' } = req.query;

    if (!query) {
      throw new ValidationError('Parâmetro de busca é obrigatório');
    }

    let whereConditions = {
      name: { [Op.iLike]: `%${query}%` },
    };

    const options = {
      where: whereConditions,
      attributes: ['id', 'name'],
      include: [
        {
          model: Product,
          attributes: ['id'],
          where: { status: true },
          required: hasProducts === 'true', // Se true, só categorias com produtos
        },
      ],
    };

    // Se hasProducts é 'false', buscar só categorias vazias
    if (hasProducts === 'false') {
      options.include[0].required = false;
      // Adicionar condição para categorias sem produtos seria mais complexo
      // Por simplicidade, vamos filtrar no resultado
    }

    const result = await QueryOptimizer.findAndCountAllOptimized(
      Categorie,
      options,
      req
    );

    // Filtrar categorias vazias se necessário
    if (hasProducts === 'false') {
      result.data = result.data.filter(
        cat => !cat.products || cat.products.length === 0
      );
      result.pagination.totalItems = result.data.length;
    }

    logger.info('Category search completed', {
      query,
      hasProducts,
      resultCount: result.data.length,
    });

    res.status(200).json({
      status: 'success',
      message: 'Busca realizada com sucesso',
      data: {
        categories: result.data,
        pagination: result.pagination,
      },
    });
  });
}

module.exports = OptimizedCategoriesController;
