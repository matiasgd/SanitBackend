const express = require("express");
const router = express.Router();
const { 
getMyAddresses, 
createAddress
} = require("../controllers/addresses_controller");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/doctor/:doctorId", getMyAddresses);

// CREAR UN NUEVO SERVICO
router.post("/new/doctor/:doctorId", createAddress);

module.exports = router;
