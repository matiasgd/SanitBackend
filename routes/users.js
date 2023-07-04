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
router.get("/:_id", findOneUser);

// OBTENER TODOS LOS PACIENTES DE UN DOCTOR
router.get("/patients/:doctorId", findDoctorPatients);

// CREAR UN USUARIO
router.post("/new", register);

// COMPLETANDO EL REGISTRO DE UN USUARIO
router.post("/complete/:doctorId", completeRegister);

// MODIFICAR UN USUARIO
router.put("/update/:_id", updateUser);

// ELIMINAR UN USUARIO
router.delete("/delete/:_id", deleteUser);

// BORRAR UN PACIENTE DE UN DOCTOR
router.delete("/delete/:patientId/:doctorId", removePatientFromDoctor);


module.exports = router;
