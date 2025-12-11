require('dotenv').config();
const nodemailer = require('nodemailer');

// Email configuration with multiple provider support
const createEmailTransporter = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';

  const transporterConfigs = {
    gmail: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'tuspaciopg@gmail.com',
        pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD,
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

// Email template rendering function
const renderEmailTemplate = (templateName, data) => {
  const templates = {
    orderSuccess: data => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #2b9423; color: #fff; padding: 20px; text-align: center; border-radius: 5px;">
          <h1>¡Hola ${data.name}!</h1>
          <p>Tu compra se ha realizado con éxito</p>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9; margin-top: 10px;">
          <p style="color: #333;">Para más información sobre tu pedido, visita:</p>
          <a href="${data.website}" style="color: #2b9423; text-decoration: none; font-weight: bold;">
            ${data.website}
          </a>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>&copy; Tu Spacio - Los expertos en belleza</p>
        </div>
      </div>
    `,
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template not found: ${templateName}`);
  }

  return template(data);
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

const sendEmail = async (name, email) => {
  try {
    // Enhanced input validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Valid email address is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Invalid email format');
    }

    const sanitizedName =
      name && typeof name === 'string' && name.trim()
        ? name.trim().replace(/[<>]/g, '')
        : 'Cliente';

    const sanitizedEmail = email.trim();
    const webSite = process.env.WEBSITE_URL || 'https://tuspacio.vercel.app/';

    // Use template rendering
    const htmlContent = renderEmailTemplate('orderSuccess', {
      name: sanitizedName,
      website: webSite,
    });

    const mailOptions = {
      from:
        process.env.EMAIL_FROM ||
        '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: sanitizedEmail,
      subject: 'Order Successfully Made! ✔',
      html: htmlContent,
    };

    const result = await sendEmailWithRetry(mailOptions);

    return {
      ok: true,
      msg: 'Email enviado exitosamente!',
      messageId: result.messageId,
      attempt: result.attempt,
    };
  } catch (error) {
    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      recipient: email,
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

const sendTestEmail = async testEmail => {
  try {
    const result = await sendEmail('Test User', testEmail);
    return { success: true, result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  testEmailConfiguration,
  sendTestEmail,
  renderEmailTemplate,
  createEmailTransporter,
};
