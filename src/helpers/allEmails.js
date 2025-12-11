require('dotenv').config();
const nodemailer = require('nodemailer');

// const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

/* TRANSPORTER GMAIL */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'tuspaciopg@gmail.com',
    pass: 'zbhtcmmcfkokvlpz',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* TRANSPORTER MAILTRAP */
// const createTrans = () => {
//   const transport = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "05906f25fea366",
//       pass: "8968eefbd7b352",
//     },
//   });
// };

// Helper function to sanitize and validate email data
const sanitizeEmailData = (user, order = null) => {
  if (!user || typeof user !== 'object') {
    throw new Error('User object is required for email generation');
  }

  const sanitizedUser = {
    name:
      user.name && typeof user.name === 'string' && user.name.trim()
        ? user.name.trim().replace(/[<>]/g, '') // Remove potential HTML injection
        : 'Cliente',
    email:
      user.email && typeof user.email === 'string' && user.email.trim()
        ? user.email.trim()
        : null,
  };

  if (!sanitizedUser.email || !sanitizedUser.email.includes('@')) {
    throw new Error('Valid email address is required');
  }

  const sanitizedOrder = order
    ? {
        orderProducts: Array.isArray(order.orderProducts)
          ? order.orderProducts
          : [],
        shipping: order.shipping || { address: {} },
        number:
          order.number &&
          typeof order.number === 'string' &&
          order.number.trim()
            ? order.number.trim()
            : 'N/A',
      }
    : null;

  return { user: sanitizedUser, order: sanitizedOrder };
};

const emailOrderSuccess = function (user, order) {
  try {
    const { user: sanitizedUser, order: sanitizedOrder } = sanitizeEmailData(
      user,
      order
    );

    return {
      from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: sanitizedUser.email,
      subject: 'Compra realizada correctamente',
      attachDataUrls: true,
      html: `
      <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      <h1 style="color: #fff;">Hola ${sanitizedUser.name}, gracias por elegirnos!</h1>
      </ul>
      </div>
      <h2 style="color: #000000">Tu compra se procesó correctamente, a continuación te dejamos los detalles de la misma: </h2>
      <div style="background-color: #fff; color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      ${sanitizedOrder.orderProducts
        .map(
          e => `
      <img src="${e.image_link || ''}" width="140" height="180" align="right" >
      <h3 style="color: #000000"> - ${(e.name || 'Producto').replace(/[<>]/g, '')}</h3>
      <h style="color: #000000">Precio unitario: ${e.price || '0'}</h4>
      <h4 style="color: #000000">Cantidad: ${e.quantity || '1'}</h4>
      <h4 style="color: #000000">Características: ${(e.description || 'Sin descripción').replace(/[<>]/g, '')}</h4>
      `
        )
        .join('')}
      </ul>
      </div>
      <div style="background-color: #fff; color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      <h2 style="color: #000000;">Dirección de entrega:</h2>
      <li style="color: #000000;">Estado/Departamento/Provincia: ${
        sanitizedOrder.shipping.address?.state || '-'
      }</li>
      <li style="color: #000000;">Ciudad: ${
        sanitizedOrder.shipping.address?.city || '-'
      }</li>
      <li style="color: #000000;">Direccion 1: ${
        sanitizedOrder.shipping.address?.line1 || '-'
      }</li>
      <li style="color: #000000;">Direccion 2: ${
        sanitizedOrder.shipping.address?.line2 || '-'
      }</li>
      <li style="color: #000000;">Código Postal: ${
        sanitizedOrder.shipping.address?.postal_code || '-'
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
        sanitizedOrder.number
      }</span><br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
      `,
    };
  } catch (error) {
    throw new Error(`Failed to generate order success email: ${error.message}`);
  }
};

const emailOrderFailure = function (user, _order) {
  try {
    const { user: sanitizedUser } = sanitizeEmailData(user);

    return {
      from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: sanitizedUser.email,
      subject: 'Tenemos problema con tu metodo de pago',
      attachDataUrls: true,
      html: `
      <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
          <h1 style="color: #fff;">Hola ${sanitizedUser.name}, gracias por elegirnos!</h1>
      </ul>
      </div>
      <h2 style="color: #000000">Se presento un problema con tu metodo de pago: </h2>

      <h3> por favor valida con tu banco si todo esta bien.</h3>
      <h3> para retomar el pago de tu orden, haz click en el enlace</h3>
      <a href="#" >Intentar el Pago Nuevamente</a>
      
      <br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
      `,
    };
  } catch (error) {
    throw new Error(`Failed to generate order failure email: ${error.message}`);
  }
};

const emailOrderPending = function (user, _order) {
  try {
    const { user: sanitizedUser } = sanitizeEmailData(user);

    return {
      from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: sanitizedUser.email,
      subject: 'Debemos esperar que tu banco nos confirme el pago',
      attachDataUrls: true,
      html: `
      <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      <h1 style="color: #fff;">Hola ${sanitizedUser.name}, gracias por elegirnos!</h1>
      </ul>
      </div>
      <h2>Parace que tu banco aun no aprueba el pago</h2>
      <h3>debemos esperar la confirmacion, mientras pueder seguir comprardo.</h3>
      <h3>puedes validar el estado del pago ingresando a tu cuenta en tu perfil, o tambien puedes darle click en el enlace</h3>
      <a href="https://tuspacio.vercel.app/profile"> ver estado de tus ordenes</a>
      
      <br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
      `,
    };
  } catch (error) {
    throw new Error(`Failed to generate order pending email: ${error.message}`);
  }
};

const emailOrderCancelled = function (user, _order) {
  try {
    const { user: sanitizedUser } = sanitizeEmailData(user);

    return {
      from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: sanitizedUser.email,
      subject: 'Hemos cancelado tu orden :(',
      attachDataUrls: true,
      html: `
        <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
        <ul>
        <h1 style="color: #fff;">Hola ${sanitizedUser.name}, gracias por elegirnos!</h1>
        <h2> En breve nos estaremos comunicando contigo para brindarte una solucion</h2>
        </ul>
        </div>
        <br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
        `,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate order cancelled email: ${error.message}`
    );
  }
};

const emailAdminNotification = function (user, order) {
  try {
    const { user: sanitizedUser, order: sanitizedOrder } = sanitizeEmailData(
      user,
      order
    );

    return {
      from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: sanitizedUser.email,
      subject: 'Compra realizada correctamente',
      attachDataUrls: true,
      html: `
        <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
        <ul>
        <h1 style="color: #fff;">Cliente ${sanitizedUser.name}</h1>
        </ul>
        </div>
        <h2 style="color: #000000">La compra se procesó correctamente, a continuación te dejamos los detalles de la misma: </h2>
        <div style="background-color: #fff; color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
        <ul>
        ${sanitizedOrder.orderProducts
          .map(
            e => `
        <img src="${e.image_link || ''}" width="140" height="180" align="right" >
        <h3 style="color: #000000"> - ${(e.name || 'Producto').replace(/[<>]/g, '')}</h3>
        <h4 style="color: #000000">Precio unitario: ${e.price || '0'}</h4>
        <h4 style="color: #000000">Cantidad: ${e.quantity || '1'}</h4>
        <h4 style="color: #000000">Características: ${(e.description || 'Sin descripción').replace(/[<>]/g, '')}</h4>
        `
          )
          .join('')}
        </ul>
        </div>
        <div style="background-color: #fff; color: #000000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
        <ul>
        <h2 style="color: #000000;">Dirección de entrega:</h2>
        <li style="color: #000000;">Estado/Departamento/Provincia: ${
          sanitizedOrder.shipping.address?.state || '-'
        }</li>
        <li style="color: #000000;">Ciudad: ${
          sanitizedOrder.shipping.address?.city || '-'
        }</li>
        <li style="color: #000000;">Direccion 1: ${
          sanitizedOrder.shipping.address?.line1 || '-'
        }</li>
        <li style="color: #000000;">Direccion 2: ${
          sanitizedOrder.shipping.address?.line2 || '-'
        }</li>
        <li style="color: #000000;">Código Postal: ${
          sanitizedOrder.shipping.address?.postal_code || '-'
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
          sanitizedOrder.number
        }</span><br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
        `,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate admin notification email: ${error.message}`
    );
  }
};

const emailShippingNotification = function (user, order) {
  try {
    const { user: sanitizedUser, order: sanitizedOrder } = sanitizeEmailData(
      user,
      order
    );

    return {
      from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: sanitizedUser.email,
      subject: 'Tu Compra va en Camino',
      attachDataUrls: true,
      html: `
      <div style="background-color: #2b9423; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3px 10px; font-weight: bold; border-radius: 5px;">
      <ul>
      <h1 style="color: #fff;">Cliente ${sanitizedUser.name}, gracias por elegirnos!</h1>
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
      <p style="color: #000000">Número de Orden: <span style="font-weight: bold; text-decoration: underline;">${sanitizedOrder.number}</span><br /><br />All rights reserved by &copy; <a href="https://tuspacio.vercel.app/">Tu Spacio</a></p>
      `,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate shipping notification email: ${error.message}`
    );
  }
};

// Enhanced email sending with retry mechanism
const sendEmailWithRetry = async (
  emailFunction,
  user,
  order,
  maxRetries = 3
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const mailOptions = emailFunction(user, order);
      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        attempt,
      };
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw new Error(
    `Failed to send email after ${maxRetries} attempts: ${lastError.message}`
  );
};

// Email testing utilities
const testEmailConfiguration = async () => {
  try {
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const sendTestEmail = async (testUser, emailType = 'success') => {
  try {
    const emailFunctions = {
      success: emailOrderSuccess,
      failure: emailOrderFailure,
      pending: emailOrderPending,
      cancelled: emailOrderCancelled,
      admin: emailAdminNotification,
      shipping: emailShippingNotification,
    };

    const emailFunction = emailFunctions[emailType];
    if (!emailFunction) {
      throw new Error(`Unknown email type: ${emailType}`);
    }

    const mockOrder = {
      orderProducts: [
        {
          name: 'Test Product',
          price: '$99.99',
          quantity: 1,
          description: 'Test product description',
          image_link: 'https://via.placeholder.com/150',
        },
      ],
      shipping: {
        address: {
          state: 'Test State',
          city: 'Test City',
          line1: 'Test Address Line 1',
          line2: 'Test Address Line 2',
          postal_code: '12345',
        },
      },
      number: 'TEST-ORDER-123',
    };

    const result = await sendEmailWithRetry(emailFunction, testUser, mockOrder);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  emailOrderSuccess,
  emailOrderFailure,
  emailOrderPending,
  emailOrderCancelled,
  emailAdminNotification,
  emailShippingNotification,
  sendEmailWithRetry,
  testEmailConfiguration,
  sendTestEmail,
};
