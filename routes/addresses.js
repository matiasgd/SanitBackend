const express = require("express");
const router = express.Router();
const { 
getMyAddresses, 
createAddress,
deleteAddress,
} = require("../controllers/addresses_controller");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/doctor/:doctorId", getMyAddresses);

// CREAR UN NUEVO SERVICO
router.post("/new/doctor/:doctorId", createAddress);

// BORRAR DIRECCION
router.delete("/:addressId", deleteAddress);

module.exports = router;
