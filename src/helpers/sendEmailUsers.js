require('dotenv').config();
const nodemailer = require('nodemailer');

// Enhanced email configuration with multiple provider support
const createEmailTransporter = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';

  const transporterConfigs = {
    gmail: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'tuspaciopg@gmail.com',
        pass:
          process.env.EMAIL_PASS ||
          process.env.GMAIL_APP_PASSWORD ||
          'zbhtcmmcfkokvlpz',
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
    mailtrap: {
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER || '05906f25fea366',
        pass: process.env.MAILTRAP_PASS || '8968eefbd7b352',
      },
    },
    sendgrid: {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    },
  };

  const config = transporterConfigs[emailProvider];
  if (!config) {
    throw new Error(`Unsupported email provider: ${emailProvider}`);
  }

  return nodemailer.createTransport(config);
};

// Enhanced email template rendering with proper HTML structure
const renderOrderShippedTemplate = userData => {
  const sanitizedName = userData.name || 'Cliente';
  const websiteUrl = process.env.WEBSITE_URL || 'https://tuspacio.vercel.app/';

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="UTF-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta content="telephone=no" name="format-detection" />
        <title>Order Shipped - Tu Spacio</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet" />
        <style type="text/css">
          body { 
            width: 100%; 
            font-family: Poppins, sans-serif; 
            -webkit-text-size-adjust: 100%; 
            -ms-text-size-adjust: 100%; 
            padding: 0; 
            margin: 0; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff; 
          }
          .header { 
            background-color: #48cae4; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .content { 
            padding: 40px 20px; 
          }
          .success-image { 
            text-align: center; 
            margin-bottom: 20px; 
          }
          .success-image img { 
            max-width: 100px; 
            height: auto; 
          }
          .title { 
            font-size: 48px; 
            font-weight: bold; 
            color: #333333; 
            text-align: center; 
            margin: 20px 0; 
            line-height: 1.2; 
          }
          .order-link { 
            color: #0077b6; 
            text-decoration: none; 
          }
          .shipping-info { 
            background-color: #f8f9fa; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
          }
          .info-section { 
            margin: 15px 0; 
          }
          .info-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #333333; 
            margin-bottom: 10px; 
          }
          .info-text { 
            font-size: 14px; 
            color: #666666; 
            line-height: 1.5; 
          }
          .track-button { 
            text-align: center; 
            margin: 30px 0; 
          }
          .track-button a { 
            background-color: #48cae4; 
            color: #ffffff; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 25px; 
            font-weight: bold; 
            display: inline-block; 
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #666666; 
            font-size: 12px; 
          }
          @media only screen and (max-width: 600px) {
            .title { font-size: 32px; }
            .content { padding: 20px 15px; }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header"></div>
          
          <div class="content">
            <div class="success-image">
              <img src="https://mueblescuevastorres.com/wp-content/uploads/2020/08/pago-exitoso.jpg" alt="Order Success" />
            </div>
            
            <h1 class="title">
              ${sanitizedName}, tu <a href="${websiteUrl}" class="order-link">pedido</a> ha sido enviado
            </h1>
            
            <div class="shipping-info">
              <div class="info-section">
                <div class="info-title">Información de Envío</div>
                <div class="info-text">
                  Tu pedido ha sido procesado y enviado. Recibirás un número de seguimiento por separado.
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-title">Método de Envío</div>
                <div class="info-text">
                  Envío Estándar<br />
                  Tiempo estimado: 3-5 días hábiles
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-title">Fecha de Pedido</div>
                <div class="info-text">${new Date().toLocaleDateString('es-ES')}</div>
              </div>
            </div>
            
            <div class="track-button">
              <a href="${websiteUrl}">Rastrear Mi Envío</a>
            </div>
          </div>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Tu Spacio - Los expertos en belleza</p>
            <p>Todos los derechos reservados</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Enhanced email sending with retry mechanism
const sendEmailWithRetry = async (mailOptions, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const transporter = createEmailTransporter();
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

const sendMail = async user => {
  try {
    // Enhanced input validation
    if (!user || typeof user !== 'object') {
      throw new Error('User object is required');
    }

    if (
      !user.email ||
      typeof user.email !== 'string' ||
      !user.email.includes('@')
    ) {
      throw new Error('Valid email address is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email.trim())) {
      throw new Error('Invalid email format');
    }

    const sanitizedUser = {
      name:
        user.name && typeof user.name === 'string' && user.name.trim()
          ? user.name.trim().replace(/[<>]/g, '')
          : 'Cliente',
      email: user.email.trim(),
    };

    // Use enhanced template rendering
    const htmlContent = renderOrderShippedTemplate(sanitizedUser);

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: sanitizedUser.email,
      subject: `Hola ${sanitizedUser.name}, Tu compra ha sido realizada exitosamente!`,
      html: htmlContent,
    };

    const result = await sendEmailWithRetry(mailOptions);

    console.log('Message sent: %s', result.messageId);

    return {
      messageId: result.messageId,
      success: true,
      attempt: result.attempt,
    };
  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      user: user?.email || 'unknown',
    };

    console.error('Email sending failed:', errorDetails);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Email testing utilities
const testEmailConfiguration = async () => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

const sendTestEmail = async testUser => {
  try {
    const result = await sendMail(testUser);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendMail: user => sendMail(user),
  testEmailConfiguration,
  sendTestEmail,
  renderOrderShippedTemplate,
  createEmailTransporter,
};
