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
router.post("/new", createService);

router.put("/update/:doctorId/:serviceId", updateService);

router.delete("/delete/:doctorId/:serviceId", deleteService)

module.exports = router;
