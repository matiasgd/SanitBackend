const { Users, Patients } = require("../db_models");
const UserService = require("../services/user_services");
const PatientsService = require("../services/patient_services");

module.exports = {
  
  getAll: async (req, res, next) => {
    try {
      const users = await UserService.findUsers();
      !users.error
        ? res.status(201).send({
            users: users.data,
            message: "Se han encontrado todos los usuarios!",
          })
        : res.status(404).send({
            users: users.data,
            message: "Hubo un error en la busqueda de los usuarios!",
          });
    } catch (err) {
      next(err);
    }
  },

  findOneUser: async (req, res, next) => {
    try {
      const id = req.params._id;
      // Validar el formato de _id utilizando mongoose
      const formatId = await UserService.checkIdFormat(id);
      if (formatId.error) {
        return res.status(404).send(formatId.message);
      }
      // Buscar el usuario en la base de datos
      const user = await UserService.findById(id);
      user.data
        ? res.status(201).send({
            user: user.data,
            message: "El usuario se ha creado correctamente!",
          })
        : res.status(404).send({
            user: user.data,
            message: "Usuario no encontrado",
          });
    } catch (err) {
      next(err);
    }
  },

  findDoctorPatients: async (req, res, next) => {
    try {
      // Validar el formato de _id utilizando mongoose
      const id = req.params.doctorId;
      const formatId = await UserService.checkIdFormat(id);
      if (formatId.error) {
        return res.status(404).send(formatId.message);
      }
      // Buscar el usuario en la base de datos
      const doctor = await UserService.findById(id);
      console.log(doctor, "doctor");
      if (!doctor.data) {
        return res.status(404).send("El usuario no existe");
      }
      // buscar los pacientes en la base de datos
      const result = await UserService.getPatientsInfoByIds(doctor.data.patients);
      console.log(result, "result");
      // Verificar si se encontraron pacientes
      result.data.length > 0
        ? res.status(201).send({
            patientsInfo: result.data,
            message:
              "Los datos de los pacientes se han encontrado satisfactoriamente!",
          })
        : res.status(404).send({
            patientsInfo: result.data,
            message: "Hubo un error en la busqueda de los pacientes!",
          });
    } catch (err) {
      next(err);
    }
  },
  register: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // Validar que se proporcionen todos los campos requeridos
      if (!email || !password) {
        return res
          .status(400)
          .json({ error: "Se deben proporcionar todos los campos requeridos" });
      }
      // Verificar si el correo electrónico ya está en uso
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser.error) {
        return res
          .status(400)
          .json({ error: "El correo electrónico ya está en uso" });
      }
      // Crear un nuevo usuario
      const newUser = await UserService.userRegister(req.body);
      !newUser.error
        ? res.status(201).send({
            user: newUser.data,
            message: "El usuario se ha creado correctamente!",
          })
        : res.status(400).send(newUser.data);
    } catch (err) {
      next(err);
    }
  },

  updateUser: async (req, res, next) => {
    try {
      // Validar el formato de _id utilizando mongoose
      const id = req.params._id;
      const validateId = await UserService.checkIdFormat(id);
      if (validateId.error) {
        return res.status(404).send(validateId.message);
      }
      // Buscar el usuario en la base de datos
      const user = await UserService.findById(id);
      if (!user.data) {
        return res.status(404).send("El usuario no existe");
      }
     // Obtener los campos y sus nuevos valores del cuerpo de la solicitud
      const updateFields = req.body;
      const updatedUser = await UserService.updateUser(
        user.data,
        updateFields
      );
      // Verificar si se actualizó el usuario
      if (!updatedUser.error) {
        return res.status(200).send({
          user: updatedUser.data,
          message: "Usuario actualizado exitosamente",
        });
      } else {
        return res.status(404).send({
          user: updatedUser.data,
          message: "No se pudo actualizar el usuario",
        });
      }
    } catch (err) {
      next(err);
    }
  },
  // RUTAS GENERALES DE PEDIDO DELETE
  deleteUser: async (req, res, next) => {
    try {
      const id = req.params._id;
      const doctor = await await UserService.findById(id);
      // verificacion si el ID enviado por params no existe en la DB
      if (!doctor) {
        return res.status(404).send("Doctor no encontrado");
      }
      // eliminacion si el servicio existe
      const removedUser = await Users.findOneAndDelete({
        _id: id,
      });
      res.status(200).send(removedUser);
    } catch (err) {
      next(err);
    }
  },
  removePatientFromDoctor: async (req, res, next) => {
    try {
      const { patientId, doctorId } = req.params;

      const doctor = await UserService.findById(doctorId);
      if (!doctor.data) {
        return res.status(404).send("El usuario no existe");
      }

      const patient = await PatientsService.findById(patientId);
      if (!patient.data) {
        return res.status(404).send("Paciente no encontrado");
      }

      const { removedPatient, removedDoctor } =
        await UserService.removePatientFromDoctor(
          doctor.data,
          patient.data,
          doctorId,
          patientId
        );

      res.status(200).send({
        doctor: removedDoctor,
        patient: removedPatient,
        message: "Paciente eliminado del médico exitosamente",
      });
    } catch (err) {
      next(err);
    }
  },
};
