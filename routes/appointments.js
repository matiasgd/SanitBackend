const express = require("express");
const router = express.Router();
const {
  getAppointmentById,
  getAppointmentByDoctorId,
  seedAppointments,
  createAppointment,
  updateAppointment,
  confirmAppointment,
  confirmPayment,
  deleteAppointment,
} = require("../controllers/appointment_controller");

//-----------RUTAS GENERALES-------------//

// BUSCAR APPOINTMENT POR ID
router.get("/:id", getAppointmentById);

// BUSCAR APPOINTMENTS POR ID DE DOCTOR
router.get("/doctor/:id", getAppointmentByDoctorId);

// BUSCAR APPOINTMENTS DISPONIBLES POR ID DE DOCTOR
router.get("/doctor/available/:id", getAppointmentByDoctorId);

// SEED DE APPOINTMENTS
router.post("/seed/:doctorId", seedAppointments); 

// CREAR UN APPOINTMENT
router.post("/new", createAppointment);

// MODIFICAR UN APPOINTMENT
router.put("/update/:appointmentId", updateAppointment);

// CONFIRMAR UN APPOINTMENT
router.put("/status/:appointmentId", confirmAppointment);

// CONFIRMAR UN APPOINTMENT
router.put("/payment/:appointmentId", confirmPayment);

// BORRAR UN APPOINTMENT
router.delete("/delete/:appointmentId", deleteAppointment);

module.exports = router;
