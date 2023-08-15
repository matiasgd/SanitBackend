const express = require("express");
const router = express.Router();

const {
  getAllAddresses,
  getMyAddresses,
  schedule,
  createAddress,
  deleteAddress,
} = require("../controllers/addresses_controller");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS CONSULTORIOS
router.get("/", getAllAddresses);

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/doctor/:doctorId", getMyAddresses);

// OBTENER LOS HORARIOS DISPONIBLES DE UN DOCTOR
router.get("/:addressId/:type", schedule);

// CREAR UN NUEVO CONSULTORIO
router.post("/new/doctor/:doctorId", createAddress);

// BORRAR DIRECCION
router.delete("/:addressId", deleteAddress);

module.exports = router;
