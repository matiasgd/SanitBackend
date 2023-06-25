const express = require("express");
const router = express.Router();
const {
  getAll,
  createAppointment,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointment_controller");

//-----------RUTAS GENERALES-------------//

// BUSCAR TODOS LOS APPOINTMENTS
router.get("/", getAll);

// BUSCAR APPOINTMENT POR ID
router.get("/:_id", getAppointmentById);

// CREAR UN APPOINTMENT
router.post("/new", createAppointment);

// MODIFICAR UN APPOINTMENT
router.put("/update/:_id", updateAppointment);

// BORRAR UN APPOINTMENT
router.delete("/delete/:_id", deleteAppointment);

module.exports = router;
