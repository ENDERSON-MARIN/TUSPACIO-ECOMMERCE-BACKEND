require("dotenv").config();
const nodemailer = require("nodemailer");

// const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

/* TRANSPORTER GMAIL */
//  const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "tuspaciopg@gmail.com",
//     pass: "zbhtcmmcfkokvlpz",
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

/* TRANSPORTER MAILTRAP */
const createTrans = () => {
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "05906f25fea366",
      pass: "8968eefbd7b352",
    },
  });

  return transport;
};

const sendMail = async (user) => {
  const transporter = createTrans();
  const info = await transporter.sendMail({
    from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
    to: `${user.email}`,
    subject: `Hola ${user.name}, Tu compra ha sido realizada exitosamente!`,
    html: "<b>PF tu espacio Henry</b>",
  });

  console.log("Message sent: %s", info.messageId);

  return;
};

exports.sendMail = (user) => sendMail(user);
