const nodemailer = require("nodemailer");

const sendEmail = async (name, email) => {
  try {
    const webSite = "https://tuspacio.vercel.app/";

    const contentHTML = `
     <h1>Purchase Order</h1>
     <p>HOLA ${name}<p>
     <p style= "color: red"> Tu compra se ha realizado con exito!! Para mas información clickea aqui 👇: </p>
     <a href="${webSite}"> ${webSite}</a>
    `;
    /* TRANSPORTER GMAIL */
    //   const transporter = nodemailer.createTransport({
    //     host: "smtp.gmail.com",
    //     port: 465,
    //     secure: true, // true for 465, false for other ports
    //     auth: {
    //       user: "tuspaciopg@gmail.com", //
    //       pass: "tuSpacio2022", //
    //     },
    //   });

    /* TRANSPORTER MAILTRAP */
    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "05906f25fea366",
        pass: "8968eefbd7b352",
      },
    });

    const info = await transport.sendMail({
      from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: `${email}`,
      subject: "Order Successfully Made! ✔",
      html: contentHTML,
    });

    //console.log("Email Send", info);

    res.status(200).json({
      ok: true,
      msg: "Email enviado exitosamente!",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendEmail };
