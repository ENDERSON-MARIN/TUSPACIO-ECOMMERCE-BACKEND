const { Product, Order, User } = require('../../db');
const { Op } = require('sequelize');
const {
  catchAsync,
  NotFoundError,
  ValidationError,
} = require('../../middleware/errorHandler');
const { QueryOptimizer } = require('../../middleware/pagination');
const { cacheInstance } = require('../../middleware/cache');
const logger = require('../../utils/logger');
const sendEmailUsers = require('../../helpers/sendEmailUsers');

/**
 * Controller otimizado para pedidos
 * Implementa cache, paginação e consultas otimizadas
 */
class OptimizedOrdersController {
  /**
   * GET ALL ORDERS - Versão otimizada com paginação
   */
  static getAllOrders = catchAsync(async (req, res) => {
    const options = {
      where: {
        number: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
      attributes: {
        exclude: ['createdAt'], // Manter updatedAt para ordenação
      },
      order: [['updatedAt', 'DESC']],
    };

    const result = await QueryOptimizer.findWithCache(
      Order,
      options,
      req,
      { ttl: 180, keyPrefix: 'orders' } // Cache mais curto para dados dinâmicos
    );

    logger.info('Orders retrieved', {
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
   * GET ONE ORDER - Otimizado com cache
   */
  static getOneOrder = catchAsync(async (req, res) => {
    const { id } = req.params;

    const cacheKey = `order_${id}`;
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const order = await Order.findOne({
      where: { number: id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          required: false,
        },
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'image_link'],
          through: { attributes: ['quantity'] },
          required: false,
        },
      ],
    });

    if (!order) {
      throw new NotFoundError('Pedido não encontrado');
    }

    // Cache por 5 minutos
    cacheInstance.cache.set(cacheKey, order, 300);

    logger.info('Order retrieved', { orderId: id });

    res.status(200).json({
      success: true,
      data: order,
      cached: false,
    });
  });

  /**
   * GET ORDERS BY STATUS - Otimizado
   */
  static getOrdersByStatus = catchAsync(async (req, res) => {
    const { status } = req.params;

    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`
      );
    }

    const options = {
      where: { status },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price'],
          through: { attributes: ['quantity'] },
          required: false,
        },
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
      order: [['updatedAt', 'DESC']],
    };

    const result = await QueryOptimizer.findWithCache(Order, options, req, {
      ttl: 240,
      keyPrefix: `orders_status_${status}`,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET ORDERS BY USER ID - Otimizado
   */
  static getOrdersByUserId = catchAsync(async (req, res) => {
    const { id: userId } = req.params;

    const options = {
      where: { userId },
      attributes: [
        'id',
        'number',
        'userId',
        'orderProducts',
        'total',
        'status',
        'updatedAt',
      ],
      order: [['updatedAt', 'DESC']],
    };

    const result = await QueryOptimizer.findWithCache(Order, options, req, {
      ttl: 300,
      keyPrefix: `orders_user_${userId}`,
    });

    logger.info('User orders retrieved', {
      userId,
      count: result.data.length,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * GET DASHBOARD ORDERS - Otimizado para dashboard
   */
  static getDashboardOrders = catchAsync(async (req, res) => {
    const cacheKey = 'dashboard_orders';
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const orders = await Order.findAll({
      attributes: ['number', 'status', 'shipping', 'total', 'updatedAt'],
      where: {
        number: {
          [Op.ne]: null,
        },
      },
      limit: 10,
      include: {
        model: User,
        attributes: ['name', 'id'],
        required: false,
      },
      order: [['updatedAt', 'DESC']],
    });

    const formattedOrders = orders.map(order => ({
      number: order.number,
      status: order.status,
      total: order.total,
      date: order.updatedAt,
      shipping: order.shipping,
      userName: order.user?.name || 'N/A',
    }));

    // Cache por 2 minutos para dashboard
    cacheInstance.cache.set(cacheKey, formattedOrders, 120);

    logger.info('Dashboard orders retrieved', {
      count: formattedOrders.length,
    });

    res.status(200).json({
      success: true,
      data: formattedOrders,
      cached: false,
    });
  });

  /**
   * CREATE ORDER - Otimizado com validação
   */
  static createOrder = catchAsync(async (req, res) => {
    const { user: userId, cart } = req.body;

    if (!userId || !cart || !Array.isArray(cart) || cart.length === 0) {
      throw new ValidationError('ID do usuário e carrinho são obrigatórios');
    }

    // Validar se o usuário existe
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Validar produtos do carrinho
    const productIds = cart.map(item => item.id || item.productId);
    const products = await Product.findAll({
      where: {
        id: { [Op.in]: productIds },
        status: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new ValidationError('Um ou mais produtos não estão disponíveis');
    }

    const newOrder = await Order.create({
      userId,
      orderProducts: cart,
      status: 'pending',
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('orders');
    cacheInstance.invalidatePattern(`orders_user_${userId}`);
    cacheInstance.invalidatePattern('dashboard_orders');

    logger.info('Order created', {
      orderId: newOrder.id,
      userId,
      itemCount: cart.length,
    });

    res.status(201).json({
      success: true,
      message: 'Pedido temporário criado',
      data: newOrder,
    });
  });

  /**
   * UPDATE ORDER - Otimizado com transação
   */
  static updateOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const result = await Order.sequelize.transaction(async transaction => {
      const order = await Order.findByPk(id, { transaction });

      if (!order) {
        throw new NotFoundError('Pedido não encontrado');
      }

      // Validar mudança de status se aplicável
      if (updateData.status) {
        const validStatuses = [
          'pending',
          'processing',
          'shipped',
          'delivered',
          'cancelled',
        ];
        if (!validStatuses.includes(updateData.status)) {
          throw new ValidationError('Status inválido');
        }
      }

      await order.update(updateData, { transaction });
      return order;
    });

    // Invalidar cache relacionado
    cacheInstance.invalidatePattern('orders');
    cacheInstance.invalidatePattern(`order_${id}`);
    cacheInstance.invalidatePattern(`orders_user_${result.userId}`);
    cacheInstance.invalidatePattern('dashboard_orders');

    logger.info('Order updated', {
      orderId: id,
      status: result.status,
    });

    res.status(200).json({
      success: true,
      message: 'Pedido atualizado com sucesso!',
      data: result,
    });
  });

  /**
   * UPDATE ORDER STATUS - Otimizado
   */
  static updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        `Status inválido. Valores permitidos: ${validStatuses.join(', ')}`
      );
    }

    const [affectedRows, [updatedOrder]] = await Order.update(
      { status },
      {
        where: { id },
        returning: true,
      }
    );

    if (affectedRows === 0) {
      throw new NotFoundError('Pedido não encontrado');
    }

    // Enviar email se o pedido foi entregue
    if (status === 'delivered' && updatedOrder) {
      try {
        const user = await User.findByPk(updatedOrder.userId);
        if (user && user.email) {
          await sendEmailUsers.sendMail({
            name: user.name,
            email: user.email,
            subject: 'Pedido Entregue',
            template: 'order-delivered',
          });
        }
      } catch (emailError) {
        logger.error('Failed to send delivery email', {
          orderId: id,
          error: emailError.message,
        });
        // Não falhar a operação por causa do email
      }
    }

    // Invalidar cache
    cacheInstance.invalidatePattern('orders');
    cacheInstance.invalidatePattern(`order_${id}`);
    cacheInstance.invalidatePattern('dashboard_orders');

    logger.info('Order status updated', {
      orderId: id,
      newStatus: status,
    });

    res.status(200).json({
      success: true,
      message: `Status do pedido atualizado para ${status}`,
      data: updatedOrder,
    });
  });

  /**
   * DELETE ORDER - Soft delete otimizado
   */
  static deleteOrder = catchAsync(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      throw new NotFoundError('Pedido não encontrado');
    }

    // Soft delete - marcar como cancelado ao invés de deletar
    await order.update({ status: 'cancelled' });

    // Invalidar cache
    cacheInstance.invalidatePattern('orders');
    cacheInstance.invalidatePattern(`order_${id}`);
    cacheInstance.invalidatePattern(`orders_user_${order.userId}`);
    cacheInstance.invalidatePattern('dashboard_orders');

    logger.info('Order cancelled', { orderId: id });

    res.status(200).json({
      success: true,
      message: 'Pedido cancelado com sucesso!',
    });
  });

  /**
   * GET ORDER STATISTICS - Novo endpoint para estatísticas
   */
  static getOrderStatistics = catchAsync(async (req, res) => {
    const cacheKey = 'order_statistics';
    const cached = cacheInstance.cache.get(cacheKey);

    if (cached) {
      return res.status(200).json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    const [totalOrders, pendingOrders, completedOrders, totalRevenue] =
      await Promise.all([
        Order.count({ where: { number: { [Op.ne]: null } } }),
        Order.count({ where: { status: 'pending' } }),
        Order.count({ where: { status: 'delivered' } }),
        Order.sum('total', { where: { status: 'delivered' } }),
      ]);

    const statistics = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue || 0,
      completionRate:
        totalOrders > 0
          ? ((completedOrders / totalOrders) * 100).toFixed(2)
          : 0,
    };

    // Cache por 10 minutos
    cacheInstance.cache.set(cacheKey, statistics, 600);

    res.status(200).json({
      success: true,
      data: statistics,
      cached: false,
    });
  });
}

module.exports = OptimizedOrdersController;
