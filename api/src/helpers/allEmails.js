
const nodemailer = require("nodemailer");

const sendEmail = async (req, res, next) => {
  try {

    const webSite = "https://tuspacio.vercel.app/";

    const contentHTML = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
>
  <head>
    <meta charset="UTF-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta content="telephone=no" name="format-detection" />
    <title>Order Template</title>
    <!--[if (mso 16)]>
      <style type="text/css">
        a {
          text-decoration: none;
        }
      </style>
    <![endif]-->
    <!--[if gte mso 9
      ]><style>
        sup {
          font-size: 100% !important;
        }
      </style><!
    [endif]-->
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG></o:AllowPNG>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if !mso]><!-- -->
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins&display=swap"
      rel="stylesheet"
    />
    <!--<![endif]-->
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
      .es-button {
        mso-style-priority: 100 !important;
        text-decoration: none !important;
      }
      a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
      }
      .es-desk-hidden {
        display: none;
        float: left;
        overflow: hidden;
        width: 0;
        max-height: 0;
        line-height: 0;
        mso-hide: all;
      }
      [data-ogsb] .es-button {
        border-width: 0 !important;
        padding: 10px 20px 10px 20px !important;
      }
      @media only screen and (max-width: 600px) {
        p,
        ul li,
        ol li,
        a {
          line-height: 150% !important;
        }
        h1,
        h2,
        h3,
        h1 a,
        h2 a,
        h3 a {
          line-height: 120%;
        }
        h1 {
          font-size: 50px !important;
          text-align: left;
        }
        h2 {
          font-size: 28px !important;
          text-align: left;
        }
        h3 {
          font-size: 20px !important;
          text-align: left;
        }
        .es-header-body h1 a,
        .es-content-body h1 a,
        .es-footer-body h1 a {
          font-size: 50px !important;
          text-align: left;
        }
        .es-header-body h2 a,
        .es-content-body h2 a,
        .es-footer-body h2 a {
          font-size: 28px !important;
          text-align: left;
        }
        .es-header-body h3 a,
        .es-content-body h3 a,
        .es-footer-body h3 a {
          font-size: 20px !important;
          text-align: left;
        }
        .es-menu td a {
          font-size: 14px !important;
        }
        .es-header-body p,
        .es-header-body ul li,
        .es-header-body ol li,
        .es-header-body a {
          font-size: 14px !important;
        }
        .es-content-body p,
        .es-content-body ul li,
        .es-content-body ol li,
        .es-content-body a {
          font-size: 14px !important;
        }
        .es-footer-body p,
        .es-footer-body ul li,
        .es-footer-body ol li,
        .es-footer-body a {
          font-size: 14px !important;
        }
        .es-infoblock p,
        .es-infoblock ul li,
        .es-infoblock ol li,
        .es-infoblock a {
          font-size: 12px !important;
        }
        *[class="gmail-fix"] {
          display: none !important;
        }
        .es-m-txt-c,
        .es-m-txt-c h1,
        .es-m-txt-c h2,
        .es-m-txt-c h3 {
          text-align: center !important;
        }
        .es-m-txt-r,
        .es-m-txt-r h1,
        .es-m-txt-r h2,
        .es-m-txt-r h3 {
          text-align: right !important;
        }
        .es-m-txt-l,
        .es-m-txt-l h1,
        .es-m-txt-l h2,
        .es-m-txt-l h3 {
          text-align: left !important;
        }
        .es-m-txt-r img,
        .es-m-txt-c img,
        .es-m-txt-l img {
          display: inline !important;
        }
        .es-button-border {
          display: inline-block !important;
        }
        a.es-button,
        button.es-button {
          font-size: 18px !important;
          display: inline-block !important;
        }
        .es-adaptive table,
        .es-left,
        .es-right {
          width: 100% !important;
        }
        .es-content table,
        .es-header table,
        .es-footer table,
        .es-content,
        .es-footer,
        .es-header {
          width: 100% !important;
          max-width: 600px !important;
        }
        .es-adapt-td {
          display: block !important;
          width: 100% !important;
        }
        .adapt-img {
          width: 100% !important;
          height: auto !important;
        }
        .es-m-p0 {
          padding: 0 !important;
        }
        .es-m-p0r {
          padding-right: 0 !important;
        }
        .es-m-p0l {
          padding-left: 0 !important;
        }
        .es-m-p0t {
          padding-top: 0 !important;
        }
        .es-m-p0b {
          padding-bottom: 0 !important;
        }
        .es-m-p20b {
          padding-bottom: 20px !important;
        }
        .es-mobile-hidden,
        .es-hidden {
          display: none !important;
        }
        tr.es-desk-hidden,
        td.es-desk-hidden,
        table.es-desk-hidden {
          width: auto !important;
          overflow: visible !important;
          float: none !important;
          max-height: inherit !important;
          line-height: inherit !important;
        }
        tr.es-desk-hidden {
          display: table-row !important;
        }
        table.es-desk-hidden {
          display: table !important;
        }
        td.es-desk-menu-hidden {
          display: table-cell !important;
        }
        .es-menu td {
          width: 1% !important;
        }
        table.es-table-not-adapt,
        .esd-block-html table {
          width: auto !important;
        }
        table.es-social {
          display: inline-block !important;
        }
        table.es-social td {
          display: inline-block !important;
        }
        .es-m-p5 {
          padding: 5px !important;
        }
        .es-m-p5t {
          padding-top: 5px !important;
        }
        .es-m-p5b {
          padding-bottom: 5px !important;
        }
        .es-m-p5r {
          padding-right: 5px !important;
        }
        .es-m-p5l {
          padding-left: 5px !important;
        }
        .es-m-p10 {
          padding: 10px !important;
        }
        .es-m-p10t {
          padding-top: 10px !important;
        }
        .es-m-p10b {
          padding-bottom: 10px !important;
        }
        .es-m-p10r {
          padding-right: 10px !important;
        }
        .es-m-p10l {
          padding-left: 10px !important;
        }
        .es-m-p15 {
          padding: 15px !important;
        }
        .es-m-p15t {
          padding-top: 15px !important;
        }
        .es-m-p15b {
          padding-bottom: 15px !important;
        }
        .es-m-p15r {
          padding-right: 15px !important;
        }
        .es-m-p15l {
          padding-left: 15px !important;
        }
        .es-m-p20 {
          padding: 20px !important;
        }
        .es-m-p20t {
          padding-top: 20px !important;
        }
        .es-m-p20r {
          padding-right: 20px !important;
        }
        .es-m-p20l {
          padding-left: 20px !important;
        }
        .es-m-p25 {
          padding: 25px !important;
        }
        .es-m-p25t {
          padding-top: 25px !important;
        }
        .es-m-p25b {
          padding-bottom: 25px !important;
        }
        .es-m-p25r {
          padding-right: 25px !important;
        }
        .es-m-p25l {
          padding-left: 25px !important;
        }
        .es-m-p30 {
          padding: 30px !important;
        }
        .es-m-p30t {
          padding-top: 30px !important;
        }
        .es-m-p30b {
          padding-bottom: 30px !important;
        }
        .es-m-p30r {
          padding-right: 30px !important;
        }
        .es-m-p30l {
          padding-left: 30px !important;
        }
        .es-m-p35 {
          padding: 35px !important;
        }
        .es-m-p35t {
          padding-top: 35px !important;
        }
        .es-m-p35b {
          padding-bottom: 35px !important;
        }
        .es-m-p35r {
          padding-right: 35px !important;
        }
        .es-m-p35l {
          padding-left: 35px !important;
        }
        .es-m-p40 {
          padding: 40px !important;
        }
        .es-m-p40t {
          padding-top: 40px !important;
        }
        .es-m-p40b {
          padding-bottom: 40px !important;
        }
        .es-m-p40r {
          padding-right: 40px !important;
        }
        .es-m-p40l {
          padding-left: 40px !important;
        }
      }
    </style>
  </head>
  <body
    style="
      width: 100%;
      font-family: Poppins, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      padding: 0;
      margin: 0;
    "
  >
    <div class="es-wrapper-color" style="background-color: #48cae4">
      <!--[if gte mso 9]>
        <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
          <v:fill type="tile" color="#48cae4"></v:fill>
        </v:background>
      <![endif]-->
      <table
        class="es-wrapper"
        width="100%"
        cellspacing="0"
        cellpadding="0"
        style="
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          border-collapse: collapse;
          border-spacing: 0px;
          padding: 0;
          margin: 0;
          width: 100%;
          height: 100%;
          background-repeat: repeat;
          background-position: center top;
          background-color: #48cae4;
        "
      >
        <tr>
          <td valign="top" style="padding: 0; margin: 0">
            <table
              cellpadding="0"
              cellspacing="0"
              class="es-header"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              "
            >
              <tr>
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    bgcolor="#ffffff"
                    class="es-header-body"
                    align="center"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #48cae4;
                      width: 600px;
                    "
                  >
                    <tr>
                      <td
                        class="es-m-p20r es-m-p20l"
                        align="left"
                        style="
                          padding: 0;
                          margin: 0;
                          padding-top: 30px;
                          padding-bottom: 30px;
                        "
                      >
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr>
                            <td
                              class="es-m-p0r"
                              valign="top"
                              align="center"
                              style="padding: 0; margin: 0; width: 600px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    style="padding: 0; margin: 0; display: none"
                                  ></td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              class="es-content es-visible-simple-html-only"
              cellspacing="0"
              cellpadding="0"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
              "
            >
              <tr>
                <td
                  class="es-stripe-html"
                  align="center"
                  style="padding: 0; margin: 0"
                >
                  <table
                    class="es-content-body"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #ffffff;
                      width: 600px;
                    "
                    cellspacing="0"
                    cellpadding="0"
                    bgcolor="#ffffff"
                    align="center"
                  >
                    <tr>
                      <td
                        align="left"
                        style="
                          margin: 0;
                          padding-bottom: 20px;
                          padding-left: 20px;
                          padding-right: 20px;
                          padding-top: 40px;
                        "
                      >
                        <table
                          cellspacing="0"
                          cellpadding="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr>
                            <td
                              class="es-m-p0r"
                              valign="top"
                              align="center"
                              style="padding: 0; margin: 0; width: 560px"
                            >
                              <table
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 10px;
                                      font-size: 0px;
                                    "
                                  >
                                    <a
                                      target="_blank"
                                      href="https://viewstripo.email"
                                      style="
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        text-decoration: none;
                                        color: #0077b6;
                                        font-size: 16px;
                                      "
                                      ><img
                                        src="https://mueblescuevastorres.com/wp-content/uploads/2020/08/pago-exitoso.jpg"
                                        alt
                                        style="
                                          display: block;
                                          border: 0;
                                          outline: none;
                                          text-decoration: none;
                                          -ms-interpolation-mode: bicubic;
                                        "
                                        height="100"
                                    /></a>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="padding: 0; margin: 0"
                                  >
                                    <h1
                                      style="
                                        margin: 0;
                                        line-height: 72px;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        font-size: 60px;
                                        font-style: normal;
                                        font-weight: bold;
                                        color: #333333;
                                      "
                                    >
                                      Client, your
                                      <a
                                        target="_blank"
                                        href="https://viewstripo.email"
                                        style="
                                          -webkit-text-size-adjust: none;
                                          -ms-text-size-adjust: none;
                                          mso-line-height-rule: exactly;
                                          text-decoration: none;
                                          color: #0077b6;
                                          font-size: 60px;
                                        "
                                        >order</a
                                      >
                                      has shipped
                                    </h1>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="left"
                        style="
                          padding: 0;
                          margin: 0;
                          padding-left: 20px;
                          padding-right: 20px;
                          padding-bottom: 30px;
                        "
                      >
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr>
                            <td
                              align="center"
                              valign="top"
                              style="padding: 0; margin: 0; width: 560px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      font-size: 0px;
                                    "
                                  >
                                    <img
                                      src="https://wgojfv.stripocdn.email/content/guids/CABINET_6ae2c16ffe706792a6e130219e94d234/images/group_108_Fle.png"
                                      alt
                                      style="
                                        display: block;
                                        border: 0;
                                        outline: none;
                                        text-decoration: none;
                                        -ms-interpolation-mode: bicubic;
                                      "
                                      height="7"
                                      class="adapt-img"
                                    />
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="padding: 20px; margin: 0">
                        <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:194px" valign="top"><![endif]-->
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          align="left"
                          class="es-left"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: left;
                          "
                        >
                          <tr>
                            <td
                              class="es-m-p20b"
                              align="center"
                              valign="top"
                              style="padding: 0; margin: 0; width: 174px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="left"
                                    style="padding: 0; margin: 0"
                                  >
                                    <h3
                                      style="
                                        margin: 0;
                                        line-height: 24px;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        font-size: 20px;
                                        font-style: normal;
                                        font-weight: bold;
                                        color: #333333;
                                      "
                                    >
                                      Shipping Address
                                    </h3>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="left"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 15px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 24px;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    >
                                      Jayson Mills<br />600 Montgomery St<br />San
                                      Francisco,&nbsp;94111
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td
                              class="es-hidden"
                              style="padding: 0; margin: 0; width: 20px"
                            ></td>
                          </tr>
                        </table>
                        <!--[if mso]></td><td style="width:173px" valign="top"><![endif]-->
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          class="es-left"
                          align="left"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: left;
                          "
                        >
                          <tr>
                            <td
                              align="left"
                              class="es-m-p20b"
                              style="padding: 0; margin: 0; width: 173px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="left"
                                    style="padding: 0; margin: 0"
                                  >
                                    <h3
                                      style="
                                        margin: 0;
                                        line-height: 24px;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        font-size: 20px;
                                        font-style: normal;
                                        font-weight: bold;
                                        color: #333333;
                                      "
                                    >
                                      Shipping <br />Method
                                    </h3>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="left"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 15px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 24px;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    >
                                      FedEx SmartPost<br />Standard Shipping<br /><a
                                        href="https://parcel.io/playground?theme=rge#"
                                        style="
                                          -webkit-text-size-adjust: none;
                                          -ms-text-size-adjust: none;
                                          mso-line-height-rule: exactly;
                                          text-decoration: none;
                                          color: #0077b6;
                                          font-size: 16px;
                                        "
                                        >5942806799248</a
                                      >
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td><td style="width:20px"></td><td style="width:173px" valign="top"><![endif]-->
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          class="es-right"
                          align="right"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: right;
                          "
                        >
                          <tr>
                            <td
                              align="left"
                              style="padding: 0; margin: 0; width: 173px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="left"
                                    style="padding: 0; margin: 0"
                                  >
                                    <h3
                                      style="
                                        margin: 0;
                                        line-height: 24px;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        font-size: 20px;
                                        font-style: normal;
                                        font-weight: bold;
                                        color: #333333;
                                      "
                                    >
                                      Date Ordered
                                    </h3>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="left"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 15px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 24px;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    >
                                      April 10, 2022
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td
                              align="left"
                              style="padding: 0; margin: 0; width: 173px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="left"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 10px;
                                    "
                                  >
                                    <h3
                                      style="
                                        margin: 0;
                                        line-height: 24px;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        font-size: 20px;
                                        font-style: normal;
                                        font-weight: bold;
                                        color: #333333;
                                      "
                                    >
                                      Order No.
                                    </h3>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="left"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 15px;
                                    "
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 24px;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    >
                                      593699
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                    <tr>
                      <td
                        align="left"
                        style="
                          margin: 0;
                          padding-top: 20px;
                          padding-left: 20px;
                          padding-right: 20px;
                          padding-bottom: 30px;
                        "
                      >
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr>
                            <td
                              align="center"
                              valign="top"
                              style="padding: 0; margin: 0; width: 560px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 30px;
                                    "
                                  >
                                    <span
                                      class="es-button-border"
                                      style="
                                        border-style: solid;
                                        border-color: #2cb543;
                                        background: #48cae4;
                                        border-width: 0px;
                                        display: inline-block;
                                        border-radius: 30px;
                                        width: auto;
                                      "
                                      ><a
                                        href="https://viewstripo.email"
                                        class="es-button"
                                        target="_blank"
                                        style="
                                          mso-style-priority: 100 !important;
                                          text-decoration: none;
                                          -webkit-text-size-adjust: none;
                                          -ms-text-size-adjust: none;
                                          mso-line-height-rule: exactly;
                                          color: #ffffff;
                                          font-size: 18px;
                                          border-style: solid;
                                          border-color: #48cae4;
                                          border-width: 10px 20px 10px 20px;
                                          display: inline-block;
                                          background: #48cae4;
                                          border-radius: 30px;
                                          font-family: Poppins, sans-serif;
                                          font-weight: bold;
                                          font-style: normal;
                                          line-height: 22px;
                                          width: auto;
                                          text-align: center;
                                        "
                                        >Track My Shipment</a
                                      ></span
                                    >
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      font-size: 0px;
                                    "
                                  >
                                    <img
                                      src="https://wgojfv.stripocdn.email/content/guids/CABINET_6ae2c16ffe706792a6e130219e94d234/images/group_108_Fle.png"
                                      alt
                                      style="
                                        display: block;
                                        border: 0;
                                        outline: none;
                                        text-decoration: none;
                                        -ms-interpolation-mode: bicubic;
                                      "
                                      height="7"
                                      class="adapt-img"
                                    />
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              cellpadding="0"
              cellspacing="0"
              class="es-content"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
              "
            >
              <tr>
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    bgcolor="#ffffff"
                    class="es-content-body"
                    align="center"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: #ffffff;
                      width: 600px;
                    "
                  >
                    <tr>
                      <td
                        align="left"
                        style="
                          margin: 0;
                          padding-top: 20px;
                          padding-left: 20px;
                          padding-right: 20px;
                          padding-bottom: 40px;
                        "
                      >
                        <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:367px" valign="top"><![endif]-->
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          class="es-left"
                          align="left"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: left;
                          "
                        >
                          <tr>
                            <td
                              class="es-m-p20b"
                              align="left"
                              style="padding: 0; margin: 0; width: 367px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="left"
                                    style="padding: 0; margin: 0"
                                  >
                                    <h3
                                      style="
                                        margin: 0;
                                        line-height: 24px;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        font-size: 20px;
                                        font-style: normal;
                                        font-weight: bold;
                                        color: #333333;
                                      "
                                    >
                                      Shipped Items
                                    </h3>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 0; margin: 0">
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 24px;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    ></p>
                                    <table
                                      width="367px"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr>
                                        <td
                                          width="173px"
                                          align="center"
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 0px;
                                          "
                                        >
                                          <img
                                            class="adapt-img p_image"
                                            src="https://wgojfv.stripocdn.email/content/guids/CABINET_6ae2c16ffe706792a6e130219e94d234/images/adamniesciorukroqz4ee2kzsunsplash.jpg"
                                            alt
                                            style="
                                              display: block;
                                              border: 0;
                                              outline: none;
                                              text-decoration: none;
                                              -ms-interpolation-mode: bicubic;
                                            "
                                            width="130"
                                          />
                                        </td>
                                        <td
                                          align="left"
                                          style="padding: 0; margin: 0"
                                        ></td>
                                        <td
                                          align="left"
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            padding-left: 20px;
                                          "
                                        >
                                          <p
                                            class="p_name"
                                            style="
                                              margin: 0;
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              font-family: Poppins, sans-serif;
                                              line-height: 24px;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                          >
                                            <strong>Vitamins for Men #1</strong>
                                          </p>
                                          <p
                                            style="
                                              margin: 0;
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              font-family: Poppins, sans-serif;
                                              line-height: 24px;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                          >
                                            QTY: <strong>1</strong>
                                          </p>
                                          <p
                                            style="
                                              margin: 0;
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              font-family: Poppins, sans-serif;
                                              line-height: 24px;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                          >
                                            Price: <strong>$35,00</strong>
                                          </p>
                                        </td>
                                      </tr>
                                    </table>
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 24px;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    ></p>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 5px;
                                      padding-bottom: 5px;
                                      font-size: 0;
                                    "
                                  >
                                    <table
                                      border="0"
                                      width="100%"
                                      height="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            border-bottom: 2px solid #48cae4;
                                            background: unset;
                                            height: 1px;
                                            width: 100%;
                                            margin: 0px;
                                          "
                                        ></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                              <p
                                style="
                                  margin: 0;
                                  -webkit-text-size-adjust: none;
                                  -ms-text-size-adjust: none;
                                  mso-line-height-rule: exactly;
                                  font-family: Poppins, sans-serif;
                                  line-height: 24px;
                                  color: #333333;
                                  font-size: 16px;
                                "
                              ></p>
                            </td>
                          </tr>
                          <tr>
                            <td
                              class="es-m-p20b"
                              align="left"
                              style="padding: 0; margin: 0; width: 367px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td style="padding: 0; margin: 0">
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 24px;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    ></p>
                                    <table
                                      width="367px"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr>
                                        <td
                                          width="173px"
                                          align="center"
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            font-size: 0px;
                                          "
                                        >
                                          <img
                                            class="adapt-img p_image"
                                            src="https://wgojfv.stripocdn.email/content/guids/CABINET_6ae2c16ffe706792a6e130219e94d234/images/adamniesciorukroqz4ee2kzsunsplash.jpg"
                                            alt
                                            style="
                                              display: block;
                                              border: 0;
                                              outline: none;
                                              text-decoration: none;
                                              -ms-interpolation-mode: bicubic;
                                            "
                                            width="130"
                                          />
                                        </td>
                                        <td
                                          align="left"
                                          style="padding: 0; margin: 0"
                                        ></td>
                                        <td
                                          align="left"
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            padding-left: 20px;
                                          "
                                        >
                                          <p
                                            class="p_name"
                                            style="
                                              margin: 0;
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              font-family: Poppins, sans-serif;
                                              line-height: 24px;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                          >
                                            <strong>Vitamins for Men #2</strong>
                                          </p>
                                          <p
                                            style="
                                              margin: 0;
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              font-family: Poppins, sans-serif;
                                              line-height: 24px;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                          >
                                            QTY: <strong>1</strong>
                                          </p>
                                          <p
                                            style="
                                              margin: 0;
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              font-family: Poppins, sans-serif;
                                              line-height: 24px;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                          >
                                            Price: <strong>$35,00</strong>
                                          </p>
                                        </td>
                                      </tr>
                                    </table>
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 24px;
                                        color: #333333;
                                        font-size: 16px;
                                      "
                                    ></p>
                                  </td>
                                </tr>
                              </table>
                              <p
                                style="
                                  margin: 0;
                                  -webkit-text-size-adjust: none;
                                  -ms-text-size-adjust: none;
                                  mso-line-height-rule: exactly;
                                  font-family: Poppins, sans-serif;
                                  line-height: 24px;
                                  color: #333333;
                                  font-size: 16px;
                                "
                              ></p>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td><td style="width:20px"></td><td style="width:173px" valign="top"><![endif]-->
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          class="es-right"
                          align="right"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: right;
                          "
                        >
                          <tr>
                            <td
                              align="left"
                              style="padding: 0; margin: 0; width: 173px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                bgcolor="#caf0f8"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: separate;
                                  border-spacing: 0px;
                                  background-color: #caf0f8;
                                  border-radius: 5px;
                                "
                                role="presentation"
                              >
                                <tr>
                                  <td
                                    align="center"
                                    style="padding: 10px; margin: 0"
                                  >
                                    <h3
                                      style="
                                        margin: 0;
                                        line-height: 24px;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        font-size: 20px;
                                        font-style: normal;
                                        font-weight: bold;
                                        color: #333333;
                                      "
                                    >
                                      Order Summary
                                    </h3>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 10px;
                                      padding-bottom: 10px;
                                      font-size: 0;
                                    "
                                  >
                                    <table
                                      border="0"
                                      width="100%"
                                      height="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            border-bottom: 2px solid #48cae4;
                                            background: unset;
                                            height: 1px;
                                            width: 100%;
                                            margin: 0px;
                                          "
                                        ></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 0; margin: 0">
                                    <table
                                      cellpadding="0"
                                      cellspacing="0"
                                      width="100%"
                                      class="es-menu"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr class="links">
                                        <td
                                          align="left"
                                          valign="top"
                                          width="50%"
                                          style="
                                            margin: 0;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            border: 0;
                                          "
                                          id="esd-menu-id-0"
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                            >Subtotal</a
                                          >
                                        </td>
                                        <td
                                          align="right"
                                          valign="top"
                                          width="50%"
                                          style="
                                            margin: 0;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            border: 0;
                                          "
                                          id="esd-menu-id-1"
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                            >$90,00</a
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 5px;
                                      padding-bottom: 5px;
                                      font-size: 0;
                                    "
                                  >
                                    <table
                                      border="0"
                                      width="100%"
                                      height="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            border-bottom: 2px solid #48cae4;
                                            background: unset;
                                            height: 1px;
                                            width: 100%;
                                            margin: 0px;
                                          "
                                        ></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 0; margin: 0">
                                    <table
                                      cellpadding="0"
                                      cellspacing="0"
                                      width="100%"
                                      class="es-menu"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr class="links">
                                        <td
                                          align="left"
                                          valign="top"
                                          width="50%"
                                          style="
                                            margin: 0;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            border: 0;
                                          "
                                          id="esd-menu-id-0"
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                            >Discount</a
                                          >
                                        </td>
                                        <td
                                          align="right"
                                          valign="top"
                                          width="50%"
                                          style="
                                            margin: 0;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            border: 0;
                                          "
                                          id="esd-menu-id-1"
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                            >-$20,00</a
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 5px;
                                      padding-bottom: 5px;
                                      font-size: 0;
                                    "
                                  >
                                    <table
                                      border="0"
                                      width="100%"
                                      height="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            border-bottom: 2px solid #48cae4;
                                            background: unset;
                                            height: 1px;
                                            width: 100%;
                                            margin: 0px;
                                          "
                                        ></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 0; margin: 0">
                                    <table
                                      cellpadding="0"
                                      cellspacing="0"
                                      width="100%"
                                      class="es-menu"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr class="links">
                                        <td
                                          align="left"
                                          valign="top"
                                          width="50%"
                                          style="
                                            margin: 0;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            border: 0;
                                          "
                                          id="esd-menu-id-0"
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                            >Shipping</a
                                          >
                                        </td>
                                        <td
                                          align="right"
                                          valign="top"
                                          width="50%"
                                          style="
                                            margin: 0;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            border: 0;
                                          "
                                          id="esd-menu-id-1"
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                            >$00,00</a
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-top: 5px;
                                      padding-bottom: 5px;
                                      font-size: 0;
                                    "
                                  >
                                    <table
                                      border="0"
                                      width="100%"
                                      height="100%"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr>
                                        <td
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            border-bottom: 2px solid #48cae4;
                                            background: unset;
                                            height: 1px;
                                            width: 100%;
                                            margin: 0px;
                                          "
                                        ></td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 0; margin: 0">
                                    <table
                                      cellpadding="0"
                                      cellspacing="0"
                                      width="100%"
                                      class="es-menu"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr class="links">
                                        <td
                                          align="left"
                                          valign="top"
                                          width="50%"
                                          style="
                                            margin: 0;
                                            padding-top: 5px;
                                            padding-bottom: 10px;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            border: 0;
                                          "
                                          id="esd-menu-id-0"
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                            >Total</a
                                          >
                                        </td>
                                        <td
                                          align="right"
                                          valign="top"
                                          width="50%"
                                          style="
                                            margin: 0;
                                            padding-top: 5px;
                                            padding-bottom: 10px;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            border: 0;
                                          "
                                          id="esd-menu-id-1"
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 16px;
                                            "
                                            >$70,00</a
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              cellpadding="0"
              cellspacing="0"
              class="es-content"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
              "
            >
              <tr>
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    class="es-content-body"
                    align="center"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: transparent;
                      width: 600px;
                    "
                  >
                    <tr>
                      <td align="left" style="padding: 0; margin: 0">
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr>
                            <td
                              align="center"
                              valign="top"
                              style="padding: 0; margin: 0; width: 600px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      font-size: 0px;
                                    "
                                  >
                                    <img
                                      class="adapt-img"
                                      src="https://wgojfv.stripocdn.email/content/guids/CABINET_6ae2c16ffe706792a6e130219e94d234/images/subtract_3zG.png"
                                      alt
                                      style="
                                        display: block;
                                        border: 0;
                                        outline: none;
                                        text-decoration: none;
                                        -ms-interpolation-mode: bicubic;
                                      "
                                      width="600"
                                    />
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              cellpadding="0"
              cellspacing="0"
              class="es-footer"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              "
            >
              <tr>
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    class="es-footer-body"
                    align="center"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: transparent;
                      width: 600px;
                    "
                  >
                    <tr>
                      <td
                        class="es-m-p20r es-m-p20l"
                        align="left"
                        style="
                          padding: 0;
                          margin: 0;
                          padding-bottom: 20px;
                          padding-top: 30px;
                        "
                      >
                        <!--[if mso]><table style="width:600px" cellpadding="0" cellspacing="0"><tr><td style="width:419px" valign="top"><![endif]-->
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          align="left"
                          class="es-left"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: left;
                          "
                        >
                          <tr>
                            <td
                              class="es-m-p20b"
                              align="left"
                              style="padding: 0; margin: 0; width: 419px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="left"
                                    class="es-m-txt-c"
                                    style="padding: 0; margin: 0"
                                  >
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      WELLNESS&nbsp;© 2021 Style Casual, Inc.
                                      All Rights Reserved.
                                    </p>
                                    <p
                                      style="
                                        margin: 0;
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        font-family: Poppins, sans-serif;
                                        line-height: 21px;
                                        color: #333333;
                                        font-size: 14px;
                                      "
                                    >
                                      Hazy Panda Limits, Chair Crossing,
                                      Kentucky, US, 607898
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td><td style="width:20px"></td><td style="width:161px" valign="top"><![endif]-->
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          class="es-right"
                          align="right"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                            float: right;
                          "
                        >
                          <tr>
                            <td
                              align="left"
                              style="padding: 0; margin: 0; width: 161px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="right"
                                    class="es-m-txt-c"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      padding-bottom: 5px;
                                      padding-top: 10px;
                                      font-size: 0;
                                    "
                                  >
                                    <table
                                      cellpadding="0"
                                      cellspacing="0"
                                      class="es-table-not-adapt es-social"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr>
                                        <td
                                          align="center"
                                          valign="top"
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            padding-right: 10px;
                                          "
                                        >
                                          <a
                                            target="_blank"
                                            href="https://viewstripo.email"
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              color: #333333;
                                              font-size: 14px;
                                            "
                                            ><img
                                              title="Facebook"
                                              src="https://wgojfv.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png"
                                              alt="Fb"
                                              height="24"
                                              style="
                                                display: block;
                                                border: 0;
                                                outline: none;
                                                text-decoration: none;
                                                -ms-interpolation-mode: bicubic;
                                              "
                                          /></a>
                                        </td>
                                        <td
                                          align="center"
                                          valign="top"
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            padding-right: 10px;
                                          "
                                        >
                                          <a
                                            target="_blank"
                                            href="https://viewstripo.email"
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              color: #333333;
                                              font-size: 14px;
                                            "
                                            ><img
                                              title="Twitter"
                                              src="https://wgojfv.stripocdn.email/content/assets/img/social-icons/logo-black/twitter-logo-black.png"
                                              alt="Tw"
                                              height="24"
                                              style="
                                                display: block;
                                                border: 0;
                                                outline: none;
                                                text-decoration: none;
                                                -ms-interpolation-mode: bicubic;
                                              "
                                          /></a>
                                        </td>
                                        <td
                                          align="center"
                                          valign="top"
                                          style="
                                            padding: 0;
                                            margin: 0;
                                            padding-right: 10px;
                                          "
                                        >
                                          <a
                                            target="_blank"
                                            href="https://viewstripo.email"
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              color: #333333;
                                              font-size: 14px;
                                            "
                                            ><img
                                              title="Instagram"
                                              src="https://wgojfv.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png"
                                              alt="Inst"
                                              height="24"
                                              style="
                                                display: block;
                                                border: 0;
                                                outline: none;
                                                text-decoration: none;
                                                -ms-interpolation-mode: bicubic;
                                              "
                                          /></a>
                                        </td>
                                        <td
                                          align="center"
                                          valign="top"
                                          style="padding: 0; margin: 0"
                                        >
                                          <a
                                            target="_blank"
                                            href="https://viewstripo.email"
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              color: #333333;
                                              font-size: 14px;
                                            "
                                            ><img
                                              title="Youtube"
                                              src="https://wgojfv.stripocdn.email/content/assets/img/social-icons/logo-black/youtube-logo-black.png"
                                              alt="Yt"
                                              height="24"
                                              style="
                                                display: block;
                                                border: 0;
                                                outline: none;
                                                text-decoration: none;
                                                -ms-interpolation-mode: bicubic;
                                              "
                                          /></a>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if mso]></td></tr></table><![endif]-->
                      </td>
                    </tr>
                    <tr>
                      <td
                        class="es-m-p20r es-m-p20l"
                        align="left"
                        style="padding: 0; margin: 0; padding-bottom: 30px"
                      >
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr>
                            <td
                              align="center"
                              valign="top"
                              style="padding: 0; margin: 0; width: 600px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td style="padding: 0; margin: 0">
                                    <table
                                      cellpadding="0"
                                      cellspacing="0"
                                      width="100%"
                                      class="es-menu"
                                      role="presentation"
                                      style="
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                        border-collapse: collapse;
                                        border-spacing: 0px;
                                      "
                                    >
                                      <tr class="links">
                                        <td
                                          align="left"
                                          valign="top"
                                          width="33.33%"
                                          style="
                                            margin: 0;
                                            padding-left: 5px;
                                            padding-right: 5px;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            border: 0;
                                          "
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 14px;
                                            "
                                            >Visit Us
                                          </a>
                                        </td>
                                        <td
                                          align="center"
                                          valign="top"
                                          width="33.33%"
                                          style="
                                            margin: 0;
                                            padding-left: 5px;
                                            padding-right: 5px;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            border: 0;
                                          "
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 14px;
                                            "
                                            >Privacy Policy</a
                                          >
                                        </td>
                                        <td
                                          align="right"
                                          valign="top"
                                          width="33.33%"
                                          style="
                                            margin: 0;
                                            padding-left: 5px;
                                            padding-right: 5px;
                                            padding-top: 5px;
                                            padding-bottom: 5px;
                                            border: 0;
                                          "
                                        >
                                          <a
                                            target="_blank"
                                            href=""
                                            style="
                                              -webkit-text-size-adjust: none;
                                              -ms-text-size-adjust: none;
                                              mso-line-height-rule: exactly;
                                              text-decoration: none;
                                              display: block;
                                              font-family: Poppins, sans-serif;
                                              color: #333333;
                                              font-size: 14px;
                                            "
                                            >Terms of Use</a
                                          >
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            <table
              cellpadding="0"
              cellspacing="0"
              class="es-footer"
              align="center"
              style="
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
                border-collapse: collapse;
                border-spacing: 0px;
                table-layout: fixed !important;
                width: 100%;
                background-color: transparent;
                background-repeat: repeat;
                background-position: center top;
              "
            >
              <tr>
                <td align="center" style="padding: 0; margin: 0">
                  <table
                    bgcolor="#ffffff"
                    class="es-footer-body"
                    align="center"
                    cellpadding="0"
                    cellspacing="0"
                    style="
                      mso-table-lspace: 0pt;
                      mso-table-rspace: 0pt;
                      border-collapse: collapse;
                      border-spacing: 0px;
                      background-color: transparent;
                      width: 600px;
                    "
                  >
                    <tr>
                      <td
                        align="left"
                        style="
                          margin: 0;
                          padding-top: 20px;
                          padding-bottom: 20px;
                          padding-left: 20px;
                          padding-right: 20px;
                        "
                      >
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          width="100%"
                          style="
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                            border-collapse: collapse;
                            border-spacing: 0px;
                          "
                        >
                          <tr>
                            <td
                              align="left"
                              style="padding: 0; margin: 0; width: 560px"
                            >
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                width="100%"
                                role="presentation"
                                style="
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  border-collapse: collapse;
                                  border-spacing: 0px;
                                "
                              >
                                <tr>
                                  <td
                                    align="center"
                                    class="es-infoblock made_with"
                                    style="
                                      padding: 0;
                                      margin: 0;
                                      line-height: 120%;
                                      font-size: 0;
                                      color: #cccccc;
                                    "
                                  >
                                    <a
                                      target="_blank"
                                      href="https://viewstripo.email/?utm_source=templates&utm_medium=email&utm_campaign=fashion_8&utm_content=hot_prices"
                                      style="
                                        -webkit-text-size-adjust: none;
                                        -ms-text-size-adjust: none;
                                        mso-line-height-rule: exactly;
                                        text-decoration: none;
                                        color: #cccccc;
                                        font-size: 12px;
                                      "
                                      ><img
                                        src="https://wgojfv.stripocdn.email/content/guids/CABINET_09023af45624943febfa123c229a060b/images/7911561025989373.png"
                                        alt
                                        width="125"
                                        style="
                                          display: block;
                                          border: 0;
                                          outline: none;
                                          text-decoration: none;
                                          -ms-interpolation-mode: bicubic;
                                        "
                                    /></a>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
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
    var transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "05906f25fea366",
        pass: "8968eefbd7b352",
      },
    });

    const info = await transport.sendMail({
      from: '"Tu spacio, los expertos en belleza! 🛒🎁" <tuspaciopg@gmail.com>',
      to: ["tuspaciopg@gmail.com", "marinenderson1@gmail.com"],
      subject: "Order Successfully Made! ✔",
      html: contentHTML,
    });

    console.log("Email Send", info);

    res.status(200).json({
      ok: true,
      msg: "Email enviado exitosamente!",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { sendEmail };