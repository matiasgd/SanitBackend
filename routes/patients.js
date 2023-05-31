const express = require("express");
const router = express.Router();
const { 
getMyPatients,
createPatient,
} = require("../controllers/patients");

//-----------RUTAS GENERALES-------------//

// OBTENER MIS PACIENTES
router.get("/:_id", getMyPatients);

// CREAR PACIENTES
router.post("/new", createPatient);


module.exports = router;
