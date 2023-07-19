const nodemailer = require("nodemailer");
const { sanitEmail, sanitPassword } = require("../config");
// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: sanitEmail,
    pass: sanitPassword,
  },
});

module.exports = transporter;
