const express = require("express");
const router = express.Router();
const {
  getMyServices,
  createService,
  updateService,
  deleteService,
} = require("../controllers/services");

//-----------RUTAS GENERALES-------------//

// OBTENER OBTENER MIS SERVICIOS
router.get("/:_id", getMyServices);

// CREAR UN NUEVO SERVICO
router.post("/new/:doctorId", createService);

// MODIFICAR SERVICIO EXISTENTE
router.put("/update/:doctorId/:serviceId", updateService);

// BORRAR UN SERVICIO
router.delete("/delete/:doctorId/:serviceId", deleteService)

module.exports = router;
