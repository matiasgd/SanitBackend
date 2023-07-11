const express = require("express");
const router = express.Router();

const {
  getMyAddresses,
  createAddress,
  deleteAddress,
} = require("../controllers/addresses_controller");

const {
  createExchangeRateUSDARS,
} = require("../controllers/exchangeRate_controller");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/doctor/:doctorId", getMyAddresses);

// CREAR UN NUEVO SERVICO
router.post("/new/doctor/:doctorId", createAddress);

router.post("/createfx", createExchangeRateUSDARS);

// BORRAR DIRECCION
router.delete("/:addressId", deleteAddress);

module.exports = router;
