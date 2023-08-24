const express = require("express");
const router = express.Router();
const {
  getAllPayments,
  getPaymentById,
  getPaymentsByDoctorId,
  getPaymentsByPatientId,
  createPayment,
  updatePayment,
  deletePayment,
} = require("../controllers/payment_controller");
const { getAll } = require("../controllers/user_controller");

//-----------RUTAS GENERALES-------------//

// BUSCAR PAGO POR ID
router.get("/", getAllPayments);

// BUSCAR PAGO POR ID
router.get("/:paymentId", getPaymentById);

// BUSCAR PAGOS POR ID DE DOCTOR
router.get("/doctor/:doctorId", getPaymentsByDoctorId);

// BUSCAR PAGOS POR ID DE PACIENTE
router.get("/patient/:patientId", getPaymentsByPatientId);

// CREAR UN PAGO
router.post("/new", createPayment);

// MODIFICAR UN PAGO
router.put("/update/appointment/:appointmentId", updatePayment);

// BORRAR UN APPOINTMENT
router.delete("/delete/:paymentId", deletePayment);

module.exports = router;
