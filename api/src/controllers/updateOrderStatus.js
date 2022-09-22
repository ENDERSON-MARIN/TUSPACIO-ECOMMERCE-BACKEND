const { Order } = require("../db");
const sendEmailOrders = require("../helpers/sendEmailOrders");

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!status) {
      res.status(400).send("Status is required");
    } else {
      const dbInfo = await Order.update({ status }, { where: { number: id } });
      if (dbInfo.status == "completed") {
        const user = {
          name: dbInfo.shipping.name,
          email: dbInfo.shipping.email,
        };
        sendEmailOrders.sendMail(user);
        console.log("send email Order Completed!");
      }
      console.log("Order Status Successfully Updated!");
      res.status(200).send(dbInfo);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  updateOrderStatus,
};
