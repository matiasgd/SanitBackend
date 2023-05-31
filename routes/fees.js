const express = require("express");
const router = express.Router();
const { 
getMyFees, 
createFee } = require("../controllers/fees");

//-----------RUTAS GENERALES-------------//

// OBTENER OBTENER TODAS MIS TARIFAS
router.get("/", getMyFees);

// CREAR UNA NUEVA TARIFA DEL CONSULTORIO
router.post("/new", createFee);


module.exports = router;
