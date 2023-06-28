const nodemailer = require("nodemailer");
const { email, password } = require("../config");
// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: email,
    pass: password,
  },
});

module.exports = transporter;

