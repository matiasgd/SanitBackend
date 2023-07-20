const express = require("express");
const router = express.Router();
const {
  getPatients,
  createPatient,
  updatePatient,
  bulkCreatePatients,
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

// CREAR PACIENTES
router.post("/new/:doctorId", createPatient);

// CREAR PACIENTES EN BULK
router.post("/bulk/:doctorId", upload.single("file"), bulkCreatePatients);

// ACTUALIZAR UN PACIENTE
router.put("/update/:patientId", updatePatient);

// ------ VER SI ASIGNAR O NO SERVICIOS A UN PACIENTE ------ //

// ASIGNAR SERVICIO AL PACIENTE
router.put("/assign/:patientId", assignServiceToPatient);

// DESASIGNAR SERVICIO AL PACIENTE
router.put("/unassign/:patientId/:serviceId", unassignServiceFromPatient);


module.exports = router;
