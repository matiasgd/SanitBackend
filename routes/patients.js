const express = require("express");
const router = express.Router();
const {
  getPatients,
  createPatient,
  removeDoctorFromPatient,
  updatePatient,
  bulkCreatePatients,
  assignServiceToPatient
} = require("../controllers/patients");

// Configuración de almacenamiento
const multer = require("multer");
const multerConfig = require("../helpers/multerConfig");

// Instancia de Multer con la configuración personalizada
const upload = multer(multerConfig);

//-----------RUTAS GENERALES-------------//

// OBTENER PACIENTES TOTALES DEL SISTEMA
router.get("/", getPatients);

// CREAR PACIENTES
router.post("/new/:doctorId", createPatient);

// CREAR PACIENTES EN BULK
router.post("/bulk/:doctorId", upload.single("file"), bulkCreatePatients);

// ASIGNAR SERVICIO AL PACIENTE
router.put("/assign/:patientId", assignServiceToPatient);

// ACTUALIZAR UN PACIENTE
router.put("/update/:patientId", updatePatient);

// BORRAR UN PACIENTE
router.delete("/:patientId/:doctorId", removeDoctorFromPatient);

module.exports = router;
