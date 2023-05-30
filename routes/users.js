const express = require("express");
const router = express.Router();
const {
getAll,
} = require("../controllers/users");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/", getAll);

module.exports = router;
