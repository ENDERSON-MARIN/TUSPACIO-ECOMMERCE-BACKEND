const { User, Rol, Product, Order } = require('../../db');
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
 * Controller otimizado para usuários
 * Implementa cache, paginação e consultas otimizadas
 */
class OptimizedUsersController {
  /**
   * GET ALL USERS - Versão otimizada com paginação e filtros
   */
  static getAllUsers = catchAsync(async (req, res) => {
    const options = {
      include: [
        {
          model: Rol,
          attributes: ['id', 'rolName'],
          required: false,
        },
      ],
      attributes: {
        exclude: ['password', 'sid'], // Excluir dados sensíveis
      },
    };

    const result = await QueryOptimizer.findWithCache(User, options, req, {
      ttl: 300,
      keyPrefix: 'users',
    });

    logger.info('Users retrieved', {
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
   * GET ONE USER - Otimizado com cache
   */
  static getOneUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const cacheKey = `user_${id}`;
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const user = await User.findByPk(id, {
      include: [
        {
          model: Rol,
          attributes: ['id', 'rolName'],
          required: false,
        },
      ],
      attributes: {
        exclude: ['password', 'sid'],
      },
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Cache por 5 minutos
    cacheInstance.cache.set(cacheKey, user, 300);

    logger.info('User retrieved', { userId: id });

    res.status(200).json({
      success: true,
      data: user,
      cached: false,
    });
  });

  /**
   * CREATE USER - Otimizado com validação e transação
   */
  static createUser = catchAsync(async (req, res) => {
    const { name, nickname, email, email_verified, picture, sid } = req.body;

    if (!email || !name) {
      throw new ValidationError('Nome e email são obrigatórios');
    }

    const result = await User.sequelize.transaction(async transaction => {
      // Verificar se usuário já existe
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: email.toLowerCase() },
            ...(nickname ? [{ nickname }] : []),
          ],
        },
        transaction,
      });

      if (existingUser) {
        // Se usuário existe, retornar dados existentes
        logger.info('User already exists', {
          userId: existingUser.id,
          email,
        });
        return existingUser;
      }

      // Buscar role padrão
      const defaultRole = await Rol.findOne({
        where: { rolName: 'user' },
        transaction,
      });

      if (!defaultRole) {
        throw new ValidationError('Role padrão não encontrada');
      }

      // Criar novo usuário
      const newUser = await User.create(
        {
          name: name.trim(),
          nickname: nickname?.trim(),
          email: email.toLowerCase().trim(),
          email_verified,
          sid,
          picture,
          rol_id: defaultRole.id,
          status: true,
        },
        { transaction }
      );

      logger.info('User created', {
        userId: newUser.id,
        email: newUser.email,
      });

      return newUser;
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('users');

    res.status(201).json({
      success: true,
      message: result.createdAt
        ? 'Usuário criado com sucesso!'
        : 'Usuário já existe',
      data: result,
    });
  });

  /**
   * UPDATE USER - Otimizado com validação
   */
  static updateUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await User.sequelize.transaction(async transaction => {
      const user = await User.findByPk(id, { transaction });

      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      // Validar email único se estiver sendo alterado
      if (updateData.email && updateData.email !== user.email) {
        const emailExists = await User.findOne({
          where: {
            email: updateData.email.toLowerCase(),
            id: { [Op.ne]: id },
          },
          transaction,
        });

        if (emailExists) {
          throw new ConflictError('Email já está em uso');
        }
      }

      // Validar nickname único se estiver sendo alterado
      if (updateData.nickname && updateData.nickname !== user.nickname) {
        const nicknameExists = await User.findOne({
          where: {
            nickname: updateData.nickname,
            id: { [Op.ne]: id },
          },
          transaction,
        });

        if (nicknameExists) {
          throw new ConflictError('Nickname já está em uso');
        }
      }

      // Preparar dados para atualização
      const cleanUpdateData = { ...updateData };
      if (cleanUpdateData.email) {
        cleanUpdateData.email = cleanUpdateData.email.toLowerCase().trim();
      }
      if (cleanUpdateData.name) {
        cleanUpdateData.name = cleanUpdateData.name.trim();
      }

      await user.update(cleanUpdateData, { transaction });
      return user;
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('users');
    cacheInstance.invalidatePattern(`user_${id}`);

    logger.info('User updated', { userId: id });

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso!',
      data: result,
    });
  });

  /**
   * DELETE USER - Soft delete otimizado
   */
  static deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Soft delete
    await user.update({ status: false });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('users');
    cacheInstance.invalidatePattern(`user_${id}`);

    logger.info('User soft deleted', { userId: id });

    res.status(200).json({
      success: true,
      message: 'Usuário desativado com sucesso!',
    });
  });

  /**
   * ADD FAVORITE - Otimizado
   */
  static addFavorite = catchAsync(async (req, res) => {
    const { idUser, idProduct } = req.params;

    const result = await User.sequelize.transaction(async transaction => {
      const [user, product] = await Promise.all([
        User.findByPk(idUser, { transaction }),
        Product.findByPk(idProduct, { transaction }),
      ]);

      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      if (!product) {
        throw new NotFoundError('Produto não encontrado');
      }

      if (!product.status) {
        throw new ValidationError('Produto não está disponível');
      }

      // Verificar se já é favorito
      const isFavorite = await user.hasProduct(product, { transaction });
      if (isFavorite) {
        throw new ConflictError('Produto já está nos favoritos');
      }

      await user.addProduct(product, { transaction });
      return { user, product };
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern(`user_${idUser}_favorites`);

    logger.info('Favorite added', {
      userId: idUser,
      productId: idProduct,
    });

    res.status(200).json({
      success: true,
      message: 'Favorito adicionado com sucesso!',
    });
  });

  /**
   * DELETE FAVORITE - Otimizado
   */
  static deleteFavorite = catchAsync(async (req, res) => {
    const { idUser, idProduct } = req.params;

    const result = await User.sequelize.transaction(async transaction => {
      const [user, product] = await Promise.all([
        User.findByPk(idUser, { transaction }),
        Product.findByPk(idProduct, { transaction }),
      ]);

      if (!user) {
        throw new NotFoundError('Usuário não encontrado');
      }

      if (!product) {
        throw new NotFoundError('Produto não encontrado');
      }

      // Verificar se é favorito
      const isFavorite = await user.hasProduct(product, { transaction });
      if (!isFavorite) {
        throw new NotFoundError('Produto não está nos favoritos');
      }

      await user.removeProduct(product, { transaction });
      return { user, product };
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern(`user_${idUser}_favorites`);

    logger.info('Favorite removed', {
      userId: idUser,
      productId: idProduct,
    });

    res.status(200).json({
      success: true,
      message: 'Favorito removido com sucesso!',
    });
  });

  /**
   * GET ALL FAVORITES - Otimizado com cache
   */
  static getAllFavorites = catchAsync(async (req, res) => {
    const { idUser } = req.params;

    const cacheKey = `user_${idUser}_favorites`;
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const user = await User.findByPk(idUser);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const favorites = await user.getProducts({
      attributes: ['id', 'name', 'price', 'image_link', 'brand', 'rating'],
      where: { status: true }, // Só produtos ativos
      through: { attributes: [] },
    });

    const favoriteIds = favorites.map(favorite => favorite.id);

    // Cache por 5 minutos
    cacheInstance.cache.set(cacheKey, favoriteIds, 300);

    logger.info('User favorites retrieved', {
      userId: idUser,
      count: favorites.length,
    });

    res.status(200).json({
      success: true,
      data: favoriteIds,
      favorites: favorites, // Dados completos dos produtos
      cached: false,
    });
  });

  /**
   * GET USER STATISTICS - Novo endpoint para estatísticas
   */
  static getUserStatistics = catchAsync(async (req, res) => {
    const cacheKey = 'user_statistics';
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const [totalUsers, activeUsers, inactiveUsers, usersWithOrders] =
      await Promise.all([
        User.count(),
        User.count({ where: { status: true } }),
        User.count({ where: { status: false } }),
        User.count({
          include: [
            {
              model: Order,
              required: true,
            },
          ],
        }),
      ]);

    const statistics = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersWithOrders,
      activationRate:
        totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
    };

    // Cache por 10 minutos
    cacheInstance.cache.set(cacheKey, statistics, 600);

    res.status(200).json({
      success: true,
      data: statistics,
      cached: false,
    });
  });

  /**
   * SEARCH USERS - Novo endpoint para busca
   */
  static searchUsers = catchAsync(async (req, res) => {
    const { q: query, role, status } = req.query;

    if (!query && !role && status === undefined) {
      throw new ValidationError(
        'Pelo menos um parâmetro de busca é obrigatório'
      );
    }

    let whereConditions = {};

    // Busca por texto
    if (query) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { nickname: { [Op.iLike]: `%${query}%` } },
      ];
    }

    // Filtro por status
    if (status !== undefined) {
      whereConditions.status = status === 'true';
    }

    const options = {
      where: whereConditions,
      include: [
        {
          model: Rol,
          attributes: ['id', 'rolName'],
          required: false,
          ...(role && {
            where: { rolName: { [Op.iLike]: `%${role}%` } },
            required: true,
          }),
        },
      ],
      attributes: {
        exclude: ['password', 'sid'],
      },
    };

    const result = await QueryOptimizer.findAndCountAllOptimized(
      User,
      options,
      req
    );

    logger.info('User search completed', {
      query,
      filters: { role, status },
      resultCount: result.data.length,
    });

    res.status(200).json({
      success: true,
      message: 'Busca realizada com sucesso',
      ...result,
    });
  });
}

module.exports = OptimizedUsersController;
