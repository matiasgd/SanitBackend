const express = require("express");
const router = express.Router();
const {
  getAll,
  findOneUser,
  findDoctorPatients,
  register,
  completeRegister,
  updateUser,
  deleteUser,
  removePatientFromDoctor,
} = require("../controllers/user_controller");

//-----------RUTAS GENERALES-------------//

// OBTENER TODOS LOS USUARIOS CHECK PARA CREAR CUENTA
router.get("/", getAll);

// OBTENER UN USUARIO ESPECIFICO
router.get("/:userId", findOneUser);

// OBTENER TODOS LOS PACIENTES DE UN DOCTOR
router.get("/patients/:doctorId", findDoctorPatients);

// CREAR UN USUARIO
router.post("/new", register);

// COMPLETANDO EL REGISTRO DE UN USUARIO
router.post("/complete/:doctorId", completeRegister);

// MODIFICAR UN USUARIO
router.put("/update/:userId", updateUser);

// ELIMINAR UN USUARIO
router.delete("/delete/:userId", deleteUser);

// BORRAR UN PACIENTE DE UN DOCTOR
router.delete("/:userId/patients/:patientId", removePatientFromDoctor);

module.exports = router;
