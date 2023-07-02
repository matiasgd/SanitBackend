const express = require("express");
const router = express.Router();
const { 
findMonthlyMetrics, 
findDailyMetrics,
} = require("../controllers/metrics_controller");

//-----------RUTAS GENERALES-------------//

// OBTENER METRICAS MENSUALES
router.get("/monthly/doctor/:doctorId/address/:addressId", findMonthlyMetrics);

// OBTENER METRICAS MENSUALES
router.get("/daily/doctor/:doctorId/address/:addressId", findDailyMetrics);

module.exports = router;
