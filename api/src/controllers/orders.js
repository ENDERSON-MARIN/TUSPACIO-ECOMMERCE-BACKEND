const { Product, Order, User } = require("../db");
const axios = require("axios");
const { Op } = require("sequelize");

const { sendMail } = require("../helpers/sendMail");

/* GET ALL ORDERS FROM DB */

const getAllOrders = async (req, res) => {
  try {
    const dbInfo = await Order.findAll({
      /*include: {
        model: Product,
        attributes: ["id", "name", "price" ],
           through: { attributes: [] },
      },*/
    });
    res.send(dbInfo);
  } catch (error) {
    console.log(error);
  }
};

/* GET ONE ORDER FROM DB */
const getOneOrder = async (req, res, next) => {
  const { id } = req.params;
  try {
    const dbInfo = await Order.findOne({
      where: { number: id },
    });
    res.send(dbInfo);
  } catch (error) {
    console.log(error);
  }
};

/* GET ORDERS BY STATUS */
const getOrdersByStatus = async (req, res, next) => {
  const { status } = req.params;
  try {
    const dbInfo = await Order.findAll({
      where: { status },
      include: {
        model: Product,
        attributes: ["id", "name", "price"],
        through: { attributes: [] },
      },
    });
    res.send(dbInfo);
  } catch (error) {
    console.log(error);
  }
};

/* GET ORDERS BY USER ID */

const getOrdersByUserId = async (req, res, next) =>
{
  const { id } = req.params;
  try {
    const dbInfo = await Order.findAll({
      attributes: ["number", "userId", "orderProducts", "total", "updatedAt","status"],
      where: { 
        userId: id ,
        number: {
          [Op.ne]: null
      }
    },
    });
    res.send(dbInfo);
  } catch (error) {
    console.log(error);
  }
};

/* GET LIMIT ORDERS DASHBOARD*/
const getLimitOrders = async (req, res, next) => {
  try {
    const dbInfo = await Order.findAll({
      attributes: [
        "number",
        "status",
        "shipping",
        "orderProducts",
        "total",
        "updatedAt",
      ],
      where: {
        number: {
          [Op.ne]: null,
        },
      },
      limit: 10,
      include: {
        model: User,
        attributes: ["name", "id"],
      },
      order: [["updatedAt", "DESC"]],
    });
    const dbLastOrders = dbInfo.map((e) => {
      return {
        number: e.number,
        status: e.status,
        address: e.shipping.address.country,
        products: e.orderProducts.id,
        total: e.total,
        date: e.updatedAt,
      };
    });

    res.send(dbLastOrders);
  } catch (error) {
    res.send({ message: error.message });
  }
};

/* CREATE NEW ORDER IN THE DATABASE WTIH STRIPE INFORMATION*/
//Create Order
const createOrder = async (req, res) => {
  try {
    const newOrder = await Order.create({
      userId: req.body.user,
      orderProducts: req.body.cart,
    });
    res.status(200).json({
      msg: "Temporary Order Created",
      newOrder,
    });
  } catch (error) {
    console.log(error);
  }
};
//
// UPDATE ONE ORDER IN THE DATABASE FROM STRIPE //
const updateOrder = async (customer, data, lineItems) => {
  console.log(customer, data, lineItems);
  try {
    let temp = await Order.findOne({
      order: [["createdAt", "DESC"]],
    });
    const updatedOrder = await Order.update(
      {
        number: customer.invoice_prefix,
        status: "created",
        subtotal: data.amount_subtotal,
        shipping: data.customer_details,
        total: data.amount_total,
      },
      {
        where: {
          id: temp.id,
        },
      }
    );
    sendMail(name="Enderson Marín", email="marinenderson1@gmail.com")
    console.log("Successfully updated!");
  } catch (error) {
    console.log(error);
  }
};

/* DELETE ONE ORDER IN THE DATABASE */
const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    /* BUSCO LA ORDER EN LA BD POR EL ID */
    let orderDB = await Order.findOne({
      where: { id: id },
    });
    /* ELIMINO LA ORDER */
    await orderDB.destroy();
    res.status(200).send({ succMsg: "Order Deleted Successfully!" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getLimitOrders,
  getOneOrder,
  getOrdersByStatus,
  getOrdersByUserId,
  createOrder,
  updateOrder,
  deleteOrder,
};
