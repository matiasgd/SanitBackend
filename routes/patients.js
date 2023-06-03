const express = require("express");
const router = express.Router();
const {
  getMyPatients,
  createPatient,
  removeDoctorFromPatient,
} = require("../controllers/patients");

//-----------RUTAS GENERALES-------------//

// OBTENER MIS PACIENTES
router.get("/:_id", getMyPatients);

// CREAR PACIENTES
router.post("/new/:doctorId", createPatient);

// BORRAR UN PACIENTE
router.delete("/:patientId/:doctorId", removeDoctorFromPatient);



module.exports = router;
