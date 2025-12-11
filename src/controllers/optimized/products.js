const { Product, Categorie, Ofert } = require('../../db');
const { Op } = require('sequelize');
const {
  catchAsync,
  NotFoundError,
  ValidationError,
} = require('../../middleware/errorHandler');
const { QueryOptimizer } = require('../../middleware/pagination');
const { cacheInstance } = require('../../middleware/cache');
const logger = require('../../utils/logger');

/**
 * Controller otimizado para produtos
 * Implementa cache, paginação e consultas otimizadas
 */
class OptimizedProductsController {
  /**
   * GET ALL PRODUCTS - Versão otimizada com paginação e cache
   */
  static getAllProducts = catchAsync(async (req, res) => {
    const options = {
      where: { status: true },
      include: [
        {
          model: Categorie,
          attributes: ['id', 'name'],
          through: { attributes: [] },
          required: false, // LEFT JOIN para melhor performance
        },
        {
          model: Ofert,
          attributes: ['id', 'discountPercent'],
          through: { attributes: [] },
          required: false,
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt'], // Reduzir dados transferidos
      },
      distinct: true, // Evitar duplicatas com includes
    };

    // Usar query optimizer com cache
    const result = await QueryOptimizer.findWithCache(Product, options, req, {
      ttl: 300,
      keyPrefix: 'products',
    });

    // Processar desconto de forma otimizada
    if (result.data && result.data.length > 0) {
      result.data = result.data.map(product => {
        const productData = product.toJSON();
        const discount = productData.oferts?.[0]?.discountPercent || 0;

        return {
          ...productData,
          discountPrice:
            discount > 0
              ? productData.price - (productData.price * discount) / 100
              : productData.price,
        };
      });
    }

    logger.info('Products retrieved', {
      count: result.data.length,
      page: req.pagination.page,
      totalItems: result.pagination.totalItems,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET PRODUCTS BY CATEGORY - Otimizado
   */
  static getProductsByCategory = catchAsync(async (req, res) => {
    const { categoryId } = req.params;

    const options = {
      where: { status: true },
      include: [
        {
          model: Categorie,
          where: { id: categoryId },
          attributes: ['id', 'name'],
          through: { attributes: [] },
          required: true, // INNER JOIN pois precisamos da categoria
        },
        {
          model: Ofert,
          attributes: ['id', 'discountPercent'],
          through: { attributes: [] },
          required: false,
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    };

    const result = await QueryOptimizer.findWithCache(Product, options, req, {
      ttl: 600,
      keyPrefix: `products_category_${categoryId}`,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * CREATE PRODUCT - Otimizado com transação
   */
  static createProduct = catchAsync(async (req, res) => {
    const {
      brand,
      name,
      price,
      price_sign,
      currency,
      image_link,
      description,
      rating,
      product_type,
      stock,
      tag_list,
      product_colors,
      status,
      categories,
    } = req.body;

    // Usar transação para garantir consistência
    const result = await Product.sequelize.transaction(async transaction => {
      // Criar produto
      const newProduct = await Product.create(
        {
          brand,
          name,
          price,
          price_sign,
          currency,
          image_link,
          description,
          rating,
          product_type,
          stock,
          tag_list,
          product_colors,
          status,
        },
        { transaction }
      );

      // Associar categorias se fornecidas
      if (categories && categories.length > 0) {
        const categoriesDb = await Categorie.findAll({
          where: { name: { [Op.in]: categories } },
          transaction,
        });

        if (categoriesDb.length !== categories.length) {
          throw new ValidationError(
            'Uma ou mais categorias não foram encontradas'
          );
        }

        await newProduct.addCategorie(categoriesDb, { transaction });
      }

      return newProduct;
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('products');
    cacheInstance.invalidatePattern('categories');

    logger.info('Product created', {
      productId: result.id,
      name: result.name,
    });

    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso!',
      data: result,
    });
  });

  /**
   * UPDATE PRODUCT - Otimizado
   */
  static updateProduct = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await Product.sequelize.transaction(async transaction => {
      // Buscar produto
      const product = await Product.findByPk(id, { transaction });

      if (!product) {
        throw new NotFoundError('Produto não encontrado');
      }

      // Atualizar dados básicos
      const { categories, ...productData } = updateData;
      await product.update(productData, { transaction });

      // Atualizar categorias se fornecidas
      if (categories) {
        const categoriesDb = await Categorie.findAll({
          where: { name: { [Op.in]: categories } },
          transaction,
        });

        // Remover categorias antigas
        await product.setCategorie(categoriesDb, { transaction });
      }

      return product;
    });

    // Invalidar cache
    cacheInstance.invalidatePattern('products');
    cacheInstance.invalidatePattern(`product_${id}`);

    logger.info('Product updated', {
      productId: id,
      name: result.name,
    });

    res.status(200).json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: result,
    });
  });

  /**
   * TOGGLE PRODUCT STATUS - Otimizado
   */
  static toggleProductStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.query;

    if (!['on', 'off'].includes(status)) {
      throw new ValidationError('Status deve ser "on" ou "off"');
    }

    const newStatus = status === 'on';

    const [affectedRows] = await Product.update(
      { status: newStatus },
      {
        where: { id },
        returning: true, // Para PostgreSQL
      }
    );

    if (affectedRows === 0) {
      throw new NotFoundError('Produto não encontrado');
    }

    // Invalidar cache
    cacheInstance.invalidatePattern('products');
    cacheInstance.invalidatePattern(`product_${id}`);

    logger.info('Product status updated', {
      productId: id,
      status: newStatus,
    });

    res.status(200).json({
      success: true,
      message: `Produto ${newStatus ? 'ativado' : 'desativado'} com sucesso!`,
    });
  });

  /**
   * GET DASHBOARD DATA - Otimizado
   */
  static getDashboard = catchAsync(async (req, res) => {
    // Cache mais longo para dashboard
    const cacheKey = 'dashboard_products';
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const data = await Product.findAll({
      attributes: ['id', 'name', 'stock', 'description', 'price', 'status'],
      order: [
        ['status', 'DESC'],
        ['updatedAt', 'DESC'],
      ],
      limit: 50, // Limitar para dashboard
    });

    // Cache por 10 minutos
    cacheInstance.cache.set(cacheKey, data, 600);

    logger.info('Dashboard data retrieved', {
      count: data.length,
    });

    res.status(200).json({
      success: true,
      data,
      cached: false,
    });
  });

  /**
   * GET PRODUCT TYPES - Otimizado com cache longo
   */
  static getProductTypes = catchAsync(async (req, res) => {
    const cacheKey = 'product_types';
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const results = await Product.sequelize.query(
      'SELECT DISTINCT product_type FROM products WHERE product_type IS NOT NULL ORDER BY product_type',
      { type: Product.sequelize.QueryTypes.SELECT }
    );

    // Cache por 1 hora (dados raramente mudam)
    cacheInstance.cache.set(cacheKey, results, 3600);

    logger.info('Product types retrieved', {
      count: results.length,
    });

    res.status(200).json({
      success: true,
      data: results,
      cached: false,
    });
  });

  /**
   * SEARCH PRODUCTS - Otimizado
   */
  static searchProducts = catchAsync(async (req, res) => {
    const { q: query, category, brand, minPrice, maxPrice } = req.query;

    if (!query && !category && !brand) {
      throw new ValidationError(
        'Pelo menos um parâmetro de busca é obrigatório'
      );
    }

    const whereConditions = { status: true };

    // Busca por texto
    if (query) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { brand: { [Op.iLike]: `%${query}%` } },
      ];
    }

    // Filtros adicionais
    if (brand) {
      whereConditions.brand = { [Op.iLike]: `%${brand}%` };
    }

    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) {
        whereConditions.price[Op.gte] = parseFloat(minPrice);
      }
      if (maxPrice) {
        whereConditions.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    const options = {
      where: whereConditions,
      include: [
        {
          model: Categorie,
          attributes: ['id', 'name'],
          through: { attributes: [] },
          required: false,
          ...(category && {
            where: { name: { [Op.iLike]: `%${category}%` } },
            required: true,
          }),
        },
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
    };

    const result = await QueryOptimizer.findAndCountAllOptimized(
      Product,
      options,
      req
    );

    logger.info('Product search completed', {
      query,
      filters: { category, brand, minPrice, maxPrice },
      resultCount: result.data.length,
    });

    res.status(200).json({
      success: true,
      message: 'Busca realizada com sucesso',
      ...result,
    });
  });
}

module.exports = OptimizedProductsController;
