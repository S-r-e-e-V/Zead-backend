const nodemailer = require("nodemailer");

const sendMail = (access_token, mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "oauth2",
      user: "appus1898@gmail.com",
      clientId: process.env.oAuth_client_id,
      clientSecret: process.env.client_secret_id,
      refreshToken: process.env.refresh_token,
      accessToken: access_token,
    },
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
module.exports = sendMail;
