const express = require("express");
const router = express.Router();
const cron = require("node-cron");

const {
  createExchangeRateUSDARS,
} = require("../controllers/exchangeRate_controller");

// Crear tipo de cambio en nuestra base de datos
cron.schedule("*/15 * * * *", createExchangeRateUSDARS);

module.exports = router;
