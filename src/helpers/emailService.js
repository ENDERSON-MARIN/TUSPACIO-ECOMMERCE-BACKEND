require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * Enhanced Email Service with multiple provider support, retry mechanisms,
 * and comprehensive error handling for the ecommerce modernization project.
 */

class EmailService {
  constructor() {
    this.transporter = null;
    this.maxRetries = parseInt(process.env.EMAIL_MAX_RETRIES) || 3;
    this.retryDelay = parseInt(process.env.EMAIL_RETRY_DELAY) || 1000;
  }

  /**
   * Create email transporter with multiple provider support
   */
  createTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

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
      outlook: {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.OUTLOOK_USER,
          pass: process.env.OUTLOOK_PASS,
        },
        tls: {
          ciphers: 'SSLv3',
        },
      },
    };

    const config = transporterConfigs[emailProvider];
    if (!config) {
      throw new Error(
        `Unsupported email provider: ${emailProvider}. Supported providers: ${Object.keys(transporterConfigs).join(', ')}`
      );
    }

    this.transporter = nodemailer.createTransport(config);
    return this.transporter;
  }

  /**
   * Validate email address format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize user input to prevent XSS
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Enhanced email sending with retry mechanism and exponential backoff
   */
  async sendEmailWithRetry(mailOptions) {
    let lastError;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const transporter = this.createTransporter();
        const info = await transporter.sendMail(mailOptions);

        return {
          success: true,
          messageId: info.messageId,
          attempt,
          provider: process.env.EMAIL_PROVIDER || 'gmail',
        };
      } catch (error) {
        lastError = error;

        // Log attempt failure
        // eslint-disable-next-line no-console
        console.warn(`Email send attempt ${attempt} failed:`, {
          error: error.message,
          recipient: mailOptions.to,
          subject: mailOptions.subject,
        });

        if (attempt < this.maxRetries) {
          // Exponential backoff with jitter
          const delay =
            this.retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    // Enhanced error logging
    const errorDetails = {
      message: lastError.message,
      stack: lastError.stack,
      timestamp: new Date().toISOString(),
      recipient: mailOptions.to,
      subject: mailOptions.subject,
      attempts: this.maxRetries,
      provider: process.env.EMAIL_PROVIDER || 'gmail',
    };

    // eslint-disable-next-line no-console
    console.error('Email sending failed after all retries:', errorDetails);
    throw new Error(
      `Failed to send email after ${this.maxRetries} attempts: ${lastError.message}`
    );
  }

  /**
   * Email template rendering system
   */
  renderTemplate(templateName, data) {
    const templates = {
      orderSuccess: data => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
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
            <p>&copy; ${new Date().getFullYear()} Tu Spacio - Los expertos en belleza</p>
          </div>
        </div>
      `,
      orderFailure: data => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: #fff; padding: 20px; text-align: center; border-radius: 5px;">
            <h1>¡Hola ${data.name}!</h1>
            <p>Hubo un problema con tu método de pago</p>
          </div>
          <div style="padding: 20px;">
            <p>Por favor valida con tu banco si todo está bien.</p>
            <p>Para retomar el pago de tu orden, haz click en el enlace:</p>
            <a href="${data.retryUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Intentar el Pago Nuevamente
            </a>
          </div>
        </div>
      `,
      orderShipped: data => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #48cae4; color: #fff; padding: 20px; text-align: center;">
            <h1>${data.name}, tu pedido ha sido enviado</h1>
          </div>
          <div style="padding: 20px;">
            <p>Tu pedido #${data.orderNumber} ha sido procesado y enviado.</p>
            <p>Número de seguimiento: <strong>${data.trackingNumber}</strong></p>
            <a href="${data.trackingUrl}" style="background-color: #48cae4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Rastrear Mi Envío
            </a>
          </div>
        </div>
      `,
    };

    const template = templates[templateName];
    if (!template) {
      throw new Error(
        `Template not found: ${templateName}. Available templates: ${Object.keys(templates).join(', ')}`
      );
    }

    return template(data);
  }

  /**
   * Send order success email
   */
  async sendOrderSuccessEmail(user, orderData = {}) {
    try {
      if (!user?.email || !this.validateEmail(user.email)) {
        throw new Error('Valid email address is required');
      }

      const sanitizedName = this.sanitizeInput(user.name) || 'Cliente';
      const websiteUrl =
        process.env.WEBSITE_URL || 'https://tuspacio.vercel.app/';

      const htmlContent = this.renderTemplate('orderSuccess', {
        name: sanitizedName,
        website: websiteUrl,
        ...orderData,
      });

      const mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
        to: user.email.trim(),
        subject: `¡Hola ${sanitizedName}! Tu compra se realizó exitosamente`,
        html: htmlContent,
      };

      return await this.sendEmailWithRetry(mailOptions);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send order success email:', error);
      throw error;
    }
  }

  /**
   * Send order failure email
   */
  async sendOrderFailureEmail(user, orderData = {}) {
    try {
      if (!user?.email || !this.validateEmail(user.email)) {
        throw new Error('Valid email address is required');
      }

      const sanitizedName = this.sanitizeInput(user.name) || 'Cliente';
      const retryUrl =
        orderData.retryUrl ||
        `${process.env.WEBSITE_URL || 'https://tuspacio.vercel.app/'}/retry-payment`;

      const htmlContent = this.renderTemplate('orderFailure', {
        name: sanitizedName,
        retryUrl,
        ...orderData,
      });

      const mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
        to: user.email.trim(),
        subject: 'Problema con tu método de pago',
        html: htmlContent,
      };

      return await this.sendEmailWithRetry(mailOptions);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send order failure email:', error);
      throw error;
    }
  }

  /**
   * Send order shipped email
   */
  async sendOrderShippedEmail(user, orderData = {}) {
    try {
      if (!user?.email || !this.validateEmail(user.email)) {
        throw new Error('Valid email address is required');
      }

      const sanitizedName = this.sanitizeInput(user.name) || 'Cliente';
      const trackingUrl =
        orderData.trackingUrl ||
        `${process.env.WEBSITE_URL || 'https://tuspacio.vercel.app/'}/track-order`;

      const htmlContent = this.renderTemplate('orderShipped', {
        name: sanitizedName,
        orderNumber: orderData.orderNumber || 'N/A',
        trackingNumber: orderData.trackingNumber || 'N/A',
        trackingUrl,
        ...orderData,
      });

      const mailOptions = {
        from:
          process.env.EMAIL_FROM ||
          '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
        to: user.email.trim(),
        subject: `${sanitizedName}, tu pedido ha sido enviado`,
        html: htmlContent,
      };

      return await this.sendEmailWithRetry(mailOptions);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send order shipped email:', error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async testConfiguration() {
    try {
      const transporter = this.createTransporter();
      await transporter.verify();
      return {
        success: true,
        message: 'Email configuration is valid',
        provider: process.env.EMAIL_PROVIDER || 'gmail',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        provider: process.env.EMAIL_PROVIDER || 'gmail',
      };
    }
  }

  /**
   * Send test email
   */
  async sendTestEmail(testEmail, emailType = 'orderSuccess') {
    try {
      const testUser = {
        name: 'Test User',
        email: testEmail,
      };

      const testOrderData = {
        orderNumber: 'TEST-123',
        trackingNumber: 'TRACK-456',
        retryUrl: 'https://example.com/retry',
      };

      switch (emailType) {
        case 'orderSuccess':
          return await this.sendOrderSuccessEmail(testUser, testOrderData);
        case 'orderFailure':
          return await this.sendOrderFailureEmail(testUser, testOrderData);
        case 'orderShipped':
          return await this.sendOrderShippedEmail(testUser, testOrderData);
        default:
          throw new Error(`Unknown email type: ${emailType}`);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = {
  EmailService,
  emailService,
  // Backward compatibility exports
  sendEmail: (name, email) =>
    emailService.sendOrderSuccessEmail({ name, email }),
  sendMail: user => emailService.sendOrderShippedEmail(user),
  testEmailConfiguration: () => emailService.testConfiguration(),
  sendTestEmail: (email, type) => emailService.sendTestEmail(email, type),
};
