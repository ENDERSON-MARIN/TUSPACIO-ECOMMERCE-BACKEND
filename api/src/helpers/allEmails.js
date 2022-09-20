require("dotenv").config();
const nodemailer = require("nodemailer");

// const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

 /* TRANSPORTER GMAIL */
 const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "tuspaciopg@gmail.com", 
    pass: "zbhtcmmcfkokvlpz", 
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* TRANSPORTER MAILTRAP */
// var transporter = nodemailer.createTransport({
//   host: "smtp.mailtrap.io",
//   port: 2525,
//   auth: {
//     user: "05906f25fea366",
//     pass: "8968eefbd7b352",
//   },
// });

const emailOrderSuccess = function (user, order) {
  return {
    from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
    to: user.email,
    subject: "Compra realizada correctamente",
    attachDataUrls: true,
    html: `
    <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
    <ul>
    <h1 style="color: #fff;">Hola ${user.name}, gracias por elegirnos!</h1>
    </ul>
    </div>
    <h2 style="color: #000000">Tu compra se procesó correctamente, a continuación te dejamos los detalles de la misma: </h2>
    <div style="background-color: #fff; color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
    <ul>
    ${order.orderProducts.map(
      (e) => `
    <img src=${e.image_link} width="140" height="180" align="right" >
    <h3 style="color: color: #000000"> - ${e.name}</h3>
    <h4 style="color: color: #000000">Precio unitario: ${e.price}</h4>
    <h4 style="color: color: #000000">Cantidad: ${e.quantity}</h4>
    <h4 style="color: color: #000000">Características: ${e.description}</h4>
    `
    )}
    </ul>
    </div>
    <div style="background-color: #fff; color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
    <ul>
    <h2 style="color: #000000;">Dirección de entrega:</h2>
    <li style="color: #000000;">Estado/Departamento/Provincia: ${
      order.shipping.address?.state ? order.shipping.state : "-"
    }</li>
    <li style="color: #000000;">Ciudad: ${
      order.shipping.address?.city ? order.shipping.city : "-"
    }</li>
    <li style="color: #000000;">Direccion 1: ${
      order.shipping.address?.line1 ? order.shipping.line1 : "-"
    }</li>
    <li style="color: #000000;">Direccion 2: ${
      order.shipping.address?.line2 ? order.shipping.line2 : "-"
    }</li>
    <li style="color: #000000;">Código Postal: ${
      order.shipping.address?.postal_code ? order.shipping.postal_code : "-"
    }</li>
    </ul>
    </div>
    
    <h3 style="color: #000000">El plazo de entrega varía según la modalidad elegida:</h3>
    <li style="color: #000000;">Envío Gratuito: entre 5 y 7 días hábiles. Las entregas se realizan de lunes a viernes, solamente al titular de la compra, presentando DNI y tarjeta con la que se realizó el pedido.</li>
    <li style="color: #000000;">Retiro Rápido: entre 1 y 3 días hábiles.</li>
  
    <h3 style="color: #000000">La compra sólo podrá retirarla el titular de la tarjeta utilizada para la compra presentando la siguiente documentación:</h3>
    <li style="color: #000000;">Factura de compra (impresa o en tu celular).</li>
    <li style="color: #000000;">DNI del titular de la tarjeta con la que se realizó el pago.</li>
    <li style="color: #000000;">Tarjeta de crédito utilizada para realizar la compra.</li>
    <br /><br />
    <p style="color: #000000">Número de Orden: <span style="font-weight: bold; text-decoration: underline;">${
      order.number
    }</span><br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
    `,
  };
};

const emailOrderFailure = function (user, order) {
  return {
    from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
    to: user.email,
    subject: "Tenemos problema con tu metodo de pago",
    attachDataUrls: true,
    html: `
    <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
    <ul>
        <h1 style="color: #fff;">Hola ${user.name}, gracias por elegirnos!</h1>
    </ul>
    </div>
    <h2 style="color: #000000">Se presento un problema con tu metodo de pago: </h2>

    <h3> por favor valida con tu banco si todo esta bien.</h3>
    <h3> para retomar el pago de tu orden, haz click en el enlace</h3>
    <a href="#" >Intentar el Pago Nuevamente</a>
    </div>
    
   </span><br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
    `,
  };
};

const emailOrderPending = function (user, order) {
  return {
    from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
    to: user.email,
    subject: "Debemos esperar que tu banco nos confirme el pago",
    attachDataUrls: true,
    html: `
    <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
    <ul>
    <h1 style="color: #fff;">Hola ${user.name}, gracias por elegirnos!</h1>
    </ul>
    </div>
    <h2>Parace que tu banco aun no aprueba el pago</h2>
    <h3>debemos esperar la confirmacion, mientras pueder seguir comprardo.</h3>
    <h3>puedes validar el estado del pago ingresando a tu cuenta en tu perfil, o tambien puedes darle click en el enlace</h3>
    <a href="https://tuspacio.vercel.app/profile"> ver estado de tus ordenes</a>
    </div>
    
   </span><br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
    `,
  };
};

const emailOrderCancelled = function (user, order) {
  return {
    from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
    to: user.email,
    subject: "Hemos cancelado tu orden :(",
    attachDataUrls: true,
    html: `
      <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      <h1 style="color: #fff;">Hola ${user.name}, gracias por elegirnos!</h1>
      <h2> En breve nos estaremos comunicando contigo para brindarte una solucion</h2>
      </ul>
      </div>
      <br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
      `,
  };
};

const emailAdminNotification = function (user, order) {
  return {
    from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
    to: user.email,
    subject: "Compra realizada correctamente",
    attachDataUrls: true,
    html: `
      <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      <h1 style="color: #fff;">Cliente ${user.name}</h1>
      </ul>
      </div>
      <h2 style="color: #000000">La compra se procesó correctamente, a continuación te dejamos los detalles de la misma: </h2>
      <div style="background-color: #fff; color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      ${order.orderProducts.map(
        (e) => `
      <img src=${e.image_link} width="140" height="180" align="right" >
      <h3 style="color: color: #000000"> - ${e.name}</h3>
      <h4 style="color: color: #000000">Precio unitario: ${e.price}</h4>
      <h4 style="color: color: #000000">Cantidad: ${e.quantity}</h4>
      <h4 style="color: color: #000000">Características: ${e.description}</h4>
      `
      )}
      </ul>
      </div>
      <div style="background-color: #fff; color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      <h2 style="color: #000000;">Dirección de entrega:</h2>
      <li style="color: #000000;">Estado/Departamento/Provincia: ${
        order.shipping.address?.state ? order.shipping.state : "-"
      }</li>
      <li style="color: #000000;">Ciudad: ${
        order.shipping.address?.city ? order.shipping.city : "-"
      }</li>
      <li style="color: #000000;">Direccion 1: ${
        order.shipping.address?.line1 ? order.shipping.line1 : "-"
      }</li>
      <li style="color: #000000;">Direccion 2: ${
        order.shipping.address?.line2 ? order.shipping.line2 : "-"
      }</li>
      <li style="color: #000000;">Código Postal: ${
        order.shipping.address?.postal_code ? order.shipping.postal_code : "-"
      }</li>
      </ul>
      </div>
      
      <h3 style="color: #000000">El plazo de entrega varía según la modalidad elegida:</h3>
      <li style="color: #000000;">Envío Gratuito: entre 5 y 7 días hábiles. Las entregas se realizan de lunes a viernes, solamente al titular de la compra, presentando DNI y tarjeta con la que se realizó el pedido.</li>
      <li style="color: #000000;">Retiro Rápido: entre 1 y 3 días hábiles.</li>
    
      <h3 style="color: #000000">La compra sólo podrá retirarla el titular de la tarjeta utilizada para la compra presentando la siguiente documentación:</h3>
      <li style="color: #000000;">Factura de compra (impresa o en tu celular).</li>
      <li style="color: #000000;">DNI del titular de la tarjeta con la que se realizó el pago.</li>
      <li style="color: #000000;">Tarjeta de crédito utilizada para realizar la compra.</li>
      <br /><br />
      <p style="color: #000000">Número de Orden: <span style="font-weight: bold; text-decoration: underline;">${
        order.number
      }</span><br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
      `,
  };
};

const emailShippingNotification = function (user, order) {
  return {
    from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
    to: user.email,
    subject: "Tu Compra va en Camino",
    attachDataUrls: true,
    html: `
    <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
    <ul>
    <h1 style="color: #fff;">Cliente ${user.name}, gracias por elegirnos!</h1>
    </ul>
    </div>
    
    <h3 style="color: #000000">El plazo de entrega varía según la modalidad elegida:</h3>
    <li style="color: #000000;">Envío Gratuito: entre 5 y 7 días hábiles. Las entregas se realizan de lunes a viernes, solamente al titular de la compra, presentando DNI y tarjeta con la que se realizó el pedido.</li>
    <li style="color: #000000;">Retiro Rápido: entre 1 y 3 días hábiles.</li>
  
    <h3 style="color: #000000">La compra sólo podrá retirarla el titular de la tarjeta utilizada para la compra presentando la siguiente documentación:</h3>
    <li style="color: #000000;">Factura de compra (impresa o en tu celular).</li>
    <li style="color: #000000;">DNI del titular de la tarjeta con la que se realizó el pago.</li>
    <li style="color: #000000;">Tarjeta de crédito utilizada para realizar la compra.</li>
    <br /><br />
    <p style="color: #000000">Número de Orden: <span style="font-weight: bold; text-decoration: underline;">${order.number}</span><br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
    `,
  };
};

module.exports = {
  transporter,
  emailOrderSuccess,
  emailOrderFailure,
  emailOrderPending,
  emailOrderCancelled,
  emailAdminNotification,
  emailShippingNotification,
};
