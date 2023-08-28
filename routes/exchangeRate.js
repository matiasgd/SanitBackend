const express = require("express");
const router = express.Router();
const cron = require("node-cron");

const {
  getCurrentUSDARS,
  createExchangeRateUSDARS,
} = require("../controllers/exchangeRate_controller");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/USDARS", getCurrentUSDARS);

// Crear tipo de cambio en nuestra base de datos
cron.schedule("*/15 * * * *", createExchangeRateUSDARS);

module.exports = router;
