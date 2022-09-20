const { updateOrder } = require("./orders");
//Checkout
const stripe = require("stripe")(
  "sk_test_51Les4YKH7XmQskrVxo1Th9dZWzcjEynmqRUGSXByXhtBh7JbT3Zhvg4JATIIJAKP0XxhPkT1dLO9UdHDhoEiQKm100gdCLwxqr"
);
const CLIENT = "https://tuspacio.vercel.app" || "http://localhost:3000";

const Checkout = async (req, res) => {
  const { id, cartProducts } = req.body;

  const customer = await stripe.customers.create({
    metadata: {
      id: id,
    },
  });

  const line_items = cartProducts?.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.image_link],
          description: item.description,
          metadata: {
            id: item.id,
            brand: item.brand,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: [
        "US",
        "CA",
        "MX",
        "AR",
        "BR",
        "CL",
        "CO",
        "PE",
        "UY",
        "VE",
      ],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "usd",
          },
          display_name: "Free shipping",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 5,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 2500,
            currency: "usd",
          },
          display_name: "Fast shipping",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 1,
            },
            maximum: {
              unit: "business_day",
              value: 3,
            },
          },
        },
      },
    ],
    customer: customer.id,
    line_items,
    mode: "payment",
    success_url: `${CLIENT}/checkout/success`,
    cancel_url: `${CLIENT}/cart`,
  });
  res.send({ url: session.url });
};
//

//Webhook
// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
//endpointSecret =
//"whsec_c1603c5e845cc217f03d1376c36d30dda8ca6c731bfcae6c8f209a9f7a2fa129";

const webhook = (req, res) => {
  const sig = req.headers["stripe-signature"];
  let eventType;
  let data;

  if (endpointSecret) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log("webhook verified");
    } catch (err) {
      console.log("webhook error");
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    data = event.data.object;
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }
  // Handle the event
  if (eventType === "checkout.session.completed") {
    stripe.customers
      .retrieve(data.customer)
      .then((customer) => {
        stripe.checkout.sessions.listLineItems(
          data.id,
          {},
          function (err, lineItems) {
            updateOrder(customer, data, lineItems);

          }
        );
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
  // Return a 200 response to acknowledge receipt of the event
  res.send().end();
};
//
module.exports = {
  Checkout,
  webhook,
};
