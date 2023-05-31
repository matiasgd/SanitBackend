const express = require("express");
const router = express.Router();
const { 
getMyServices, 
createService 
} = require("../controllers/services");

//-----------RUTAS GENERALES-------------//

// OBTENER OBTENER MIS SERVICIOS
router.get("/:_id", getMyServices);

// CREAR UN NUEVO SERVICO
router.post("/new", createService);

module.exports = router;
