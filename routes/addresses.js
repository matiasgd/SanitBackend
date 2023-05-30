const express = require("express");
const router = express.Router();
const { getAll } = require("../controllers/addresses");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/", getAll);

module.exports = router;
