const express = require("express");
const router = express.Router();
const {
  getMyPatients,
  createPatient,
  removeDoctorFromPatient,
  updatePatient,
} = require("../controllers/patients");

  //-----------RUTAS GENERALES-------------//

  // OBTENER MIS PACIENTES
  router.get("/:_id", getMyPatients);

  // CREAR PACIENTES
  router.post("/new/:doctorId", createPatient);

  // ACTUALIZAR UN PACIENTE
  router.put("/:patientId", updatePatient)

  // BORRAR UN PACIENTE
  router.delete("/:patientId/:doctorId", removeDoctorFromPatient);



module.exports = router;
