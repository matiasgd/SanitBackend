const express = require("express");
const router = express.Router();
const {
  getAppointmentById,
  getAppointmentByDoctorId,
  GetPendingPaymentsById,
  seedAppointments,
  createAppointment,
  updateAppointment,
  confirmAppointment,
  deleteAppointment,
} = require("../controllers/appointment_controller");

//-----------RUTAS GENERALES-------------//

// BUSCAR APPOINTMENT POR ID
router.get("/:id", getAppointmentById);

// BUSCAR APPOINTMENTS POR ID DE DOCTOR
router.get("/doctor/:id", getAppointmentByDoctorId);

// BUSCAR PENDING PAYMENTS
router.get("/debts/:doctorId", GetPendingPaymentsById);

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

// BORRAR UN APPOINTMENT
router.delete("/delete/:appointmentId", deleteAppointment);

module.exports = router;
