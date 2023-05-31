const express = require("express");
const router = express.Router();
const { 
getMyAddresses, 
createAddress
} = require("../controllers/addresses");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/:_id", getMyAddresses);

// CREAR UN NUEVO SERVICO
router.post("/new", createAddress);

module.exports = router;
