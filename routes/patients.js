const express = require("express");
const router = express.Router();
const {
  getPatients,
  getOnePatient,
  createPatient,
  seedPatients,
  updatePatient,
  bulkCreatePatients,
  createPatientForm,
  assignServiceToPatient,
  unassignServiceFromPatient,
} = require("../controllers/patient_controller");

// Configuración de almacenamiento
const multer = require("multer");
const multerConfig = require("../helpers/multerConfig");

// Instancia de Multer con la configuración personalizada
const upload = multer(multerConfig);

//-----------RUTAS GENERALES-------------//

// OBTENER PACIENTES TOTALES DEL SISTEMA
router.get("/", getPatients);

// OBTENER UN PACIENTE DE LA BASE DE DATOS
router.get("/:patientId", getOnePatient);

// CREAR PACIENTES
router.post("/new/:doctorId", createPatient);

// SEED DE PACIENTES
router.post("/seed/:doctorId", seedPatients);

// CREAR PACIENTES EN BULK
router.post("/bulk/:doctorId", upload.single("file"), bulkCreatePatients);

// CREAR PACIENTE POR MEDIO DE UN LINK QUE COMPLETA EL PACIENTE
router.post("/form/:doctorId", createPatientForm);

// ACTUALIZAR UN PACIENTE
router.put("/update/:patientId", updatePatient);

// ------ VER SI ASIGNAR O NO SERVICIOS A UN PACIENTE ------ //

// ASIGNAR SERVICIO AL PACIENTE
router.put("/assign/:patientId", assignServiceToPatient);

// DESASIGNAR SERVICIO AL PACIENTE
router.put("/unassign/:patientId/:serviceId", unassignServiceFromPatient);

module.exports = router;
