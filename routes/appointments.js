const express = require("express");
const router = express.Router();
const { 
    getAll, 
    createAppointment,
    updateAppointment,
    deleteAppointment
} = require("../controllers/appointments");

//-----------RUTAS GENERALES-------------//

// BUSCAR TODOS LOS APPOINTMENTS
router.get("/", getAll);

// CREAR UN APPOINTMENT
router.post("/new", createAppointment);

// MODIFICAR UN APPOINTMENT
router.put("/update/:_id", updateAppointment);

// BORRAR UN APPOINTMENT
router.delete("/delete/:_id/:_userId", deleteAppointment);

module.exports = router;
