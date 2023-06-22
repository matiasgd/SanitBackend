const { Users, Patients } = require("../db_models");
const mongoose = require("mongoose");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getAll: async (req, res, next) => {
    try {
      const users = await Users.find();
      res.send(users);
    } catch (err) {
      next(err);
    }
  },
  findOneUser: async (req, res, next) => {
    try {
      const _id = req.params._id;
      // Validar el formato de _id utilizando mongoose
      if (!mongoose.isValidObjectId(_id)) {
        return res.status(404).send("el ID es invadido");
      }
      const user = await Users.findOne({ _id });
      if (!user) {
        return res.status(404).send("Usuario no encontrado");
      }
      res.send(user);
    } catch (err) {
      next(err);
    }
  },
  getMyPatients: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const doctor = await Users.findById(doctorId);
      if (!doctor) {
        return res.status(404).send("Doctor no encontrado");
      }

      const patients = doctor.patients; // array of ObjectIDs of the patients assigned to the doctor
      console.log(patients, "patients");
      // Fetch patient information from the database
      const patientsInfo = await Patients.find({ _id: { $in: patients } });

      console.log(patientsInfo, "patientsInfo");
      res.status(200).send(patientsInfo);
    } catch (err) {
      next(err);
    }
  },
  createOneUser: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // Verificar si el correo electrónico ya está en uso
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está en uso" });
      }
      // Validar que se proporcionen todos los campos requeridos
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Se deben proporcionar todos los campos requeridos" });
      }
      // Crear un nuevo usuario
      const newUser = new Users(req.body);
      await newUser.save();
      res.status(201).send({
        user: newUser,
        message: "El usuario se ha creado correctamente!",
      });
    } catch (err) {
      next(err);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      const _id = req.params._id;
      // Validar el formato de _id utilizando mongoose
      if (!mongoose.isValidObjectId(_id)) {
        return res.status(404).send("Invalid user ID");
      }
      const user = await Users.findOne({ _id });
      if (!user) {
        return res.status(404).send("User not found");
      }
      // Obtener los campos y sus nuevos valores del cuerpo de la solicitud
      const updateFields = req.body;
      // Recorrer los campos y actualizar el objeto del usuario
      Object.keys(updateFields).forEach((field) => {
        user[field] = updateFields[field];
      });
      const updatedUser = await user.save();
      res.send(updatedUser);
    } catch (err) {
      next(err);
    }
  },

  // RUTAS GENERALES DE PEDIDO DELETE
  deleteUser: async (req, res, next) => {
    try {
      const doctorId = req.params._id;
      const doctor = await Users.findOne({ _id: doctorId });
      // verificacion si el ID enviado por params no existe en la DB
      if (!doctor) {
        return res.status(404).send("Doctor no encontrado");
      }
      // eliminacion si el servicio existe
      const removedUser = await Users.findOneAndDelete({
        _id: doctorId,
      });
      res.status(200).send(removedUser);
    } catch (err) {
      next(err);
    }
  },
  // RUTAS GENERALES DE PEDIDO DELETE
  removePatientFromDoctor: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const doctorId = req.params.doctorId;

      const doctor = await Users.findById(doctorId);
      if (!doctor) {
        return res.status(404).send("Médico no encontrado");
      }

      // Buscar si existe el ID del paciente en el array de ObjectID de patients del médico
      const patientIndex = doctor.patients.findIndex((patient) => {
        return (
          patient._id.toString() ==
          new mongoose.Types.ObjectId(patientId)._id.toString()
        );
      });

      // Si es -1 significa que no está asociado
      if (patientIndex === -1) {
        return res
          .status(404)
          .send("El paciente no está asociado a este médico");
      }

      // Si está asociado, proceder a eliminar al paciente del array de patients del médico
      const removedPatient = doctor.patients.splice(patientIndex, 1)[0];
      await doctor.save();

      const patient = await Patients.findById(patientId);
      if (!patient) {
        return res.status(404).send("Paciente no encontrado");
      }

      // Buscar si existe el ID del médico en el array de ObjectID de doctors del paciente
      const doctorIndex = patient.doctors.findIndex((doctor) => {
        return (
          doctor._id.toString() ==
          new mongoose.Types.ObjectId(doctorId)._id.toString()
        );
      });

      // Si es -1 significa que no está asociado
      if (doctorIndex === -1) {
        return res
          .status(404)
          .send("El médico no está asociado a este paciente");
      }

      // Si está asociado, proceder a eliminar al médico del array de doctors del paciente
      const removedDoctor = patient.doctors.splice(doctorIndex, 1)[0];
      await patient.save();

      // Agregar al médico al array de previousDoctors del paciente
      patient.previousDoctors.push(removedDoctor);

      // Agregar al paciente al array de previousPatients del médico
      doctor.previousPatients.push(removedPatient);

      await patient.save();
      await doctor.save();

      res.status(200).send("Paciente eliminado del médico exitosamente");
    } catch (err) {
      next(err);
    }
  },
};
