const express = require("express");
const router = express.Router();
const {
  getAll,
  findOneUser,
  createOneUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const { userLogin, 
        userLogout, 
        userMe 
} = require("../controllers/auth");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/", getAll);

// OBTENER UN USUARIO ESPECIFICO
router.get("/:_id", findOneUser);

// OBTENER EL USUARIO AUTENTICADO
router.get("/me", userMe);

// CREAR UN USUARIO
router.post("/new", createOneUser);

// AUTENTICAR UN USUARIO
router.post("/login", userLogin);

// DESAUTENTICAR UN USUARIO
router.post("/logout", userLogout);

// MODIFICAR UN USUARIO
router.put("/update/:_id", updateUser);

// ELIMINAR UN USUARIO
router.delete("/delete/:_id", deleteUser);

module.exports = router;
