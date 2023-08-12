const express = require("express");
const router = express.Router();
const {
  getMyServices,
  findOneService,
  createService,
  updateService,
  updateServicePrice,
  deleteService,
} = require("../controllers/service_controller.js");

//-----------RUTAS GENERALES-------------//

// OBTENER UN SERVICIO ESPECIFICO
router.get("/:serviceId", findOneService);

// OBTENER OBTENER MIS SERVICIOS
router.get("/user/:_id", getMyServices);

// CREAR UN NUEVO SERVICO
router.post("/new/:doctorId", createService);

// MODIFICAR SERVICIO EXISTENTE
router.put("/:serviceId/doctor/:doctorId", updateService);

// MODIFICAR EL PRECIO DE UN SERVICIO
router.put("/:serviceId/doctor/:doctorId/price",updateServicePrice);

// BORRAR UN SERVICIO
router.delete("/delete/:doctorId/:serviceId", deleteService);

module.exports = router;
