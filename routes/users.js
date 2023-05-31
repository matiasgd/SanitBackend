const express = require("express");
const router = express.Router();
const { 
getAll, 
findOneUser,
createOneUser
} = require("../controllers/users");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/", getAll);

// OBTENER UN USUARIO ESPECIFICO
router.get("/:_id", findOneUser);

// CREAR UN USUARIO
router.post("/new", createOneUser);

module.exports = router;
