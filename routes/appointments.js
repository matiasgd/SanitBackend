const express = require("express");
const router = express.Router();
const {
  getAppointmentById,
  getAppointmentByDoctorId,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointment_controller");

//-----------RUTAS GENERALES-------------//

// BUSCAR APPOINTMENT POR ID  
router.get("/:_id", getAppointmentById);

// BUSCAR APPOINTMENTS POR ID DE DOCTOR
router.get("/doctor/:_id", getAppointmentByDoctorId);

// CREAR UN APPOINTMENT
router.post("/new", createAppointment);

// MODIFICAR UN APPOINTMENT
router.put("/update/:appointmentId", updateAppointment);

// BORRAR UN APPOINTMENT
router.delete("/delete/:appointmentId", deleteAppointment);

module.exports = router;
