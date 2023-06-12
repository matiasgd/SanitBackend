const express = require("express");
const router = express.Router();
const {
     userLogin, 
     userLogout, 
     userMe } 
= require("../controllers/auth");

//-----------RUTAS GENERALES-------------//

// OBTENER EL USUARIO AUTENTICADO
router.get("/me", userMe);

// AUTENTICAR UN USUARIO
router.post("/login", userLogin);

// DESAUTENTICAR UN USUARIO
router.post("/logout", userLogout);


module.exports = router;