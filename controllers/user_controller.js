const { Users, Patients } = require("../db_models");
const UserService = require("../services/user_services");
const emailService = require("../services/auth_services");

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
      // busqueda del usuario en la base de datos
      const user = await UserService.findById(id);
      if (!user.error) {
        return res.status(200).send({
          user: user.data,
          message: "Usuario encontrado exitosamente",
        });
      } else {
        return res.status(400).send({
          user: user.data,
          message: user.message,
        });
      }
    } catch (err) {
      next(err);
    }
  },
  findDoctorPatients: async (req, res, next) => {
    try {
      // Validar el formato de _id utilizando mongoose
      const id = req.params.doctorId;
      // buscar los pacientes en la base de datos
      const result = await UserService.findDoctorPatients(id);
      result.error
        ? res.status(400).send({
            patientsInfo: result.data,
            message: result.message,
          })
        : res.status(201).send({
            patientsInfo: result.data,
            message:
              "Los datos de los pacientes se han encontrado satisfactoriamente!",
          });
    } catch (err) {
      next(err);
    }
  },
  register: async (req, res, next) => {
    try {
      const userDTO = { ...req.body };
      const newUser = await UserService.userRegister(userDTO);
      if (newUser.error) {
        return res.status(400).send(newUser.message);
      }
      res.status(201).send({
        user: newUser.data,
        message: "El usuario fue creado correctamente!",
      });
    } catch (err) {
      next(err);
    }
  },
  completeRegister: async (req, res, next) => {
    try {
      const userDTO = { ...req.body };
      const id = req.params.doctorId;      
      const completeProfile = await UserService.completeRegister(
        id,
        userDTO
      );
      if (completeProfile.error) {
        return res
        .status(400)
        .send({
          user: completeProfile.data,
          message:completeProfile.message
        });
      }
      res.status(201).send({
        user: completeProfile.data,
        message: "El usuario fue creado correctamente!",
      });
    } catch (err) {
      next(err);
    }
  },
  updateUser: async (req, res, next) => {
    try {
      const userDTO = { ...req.body };
      const id = req.params._id;
      const validateId = await UserService.checkIdFormat(id);
      if (validateId.error) {
        return res.status(400).send(validateId.message);
      }
      const updatedUser = await UserService.updateUser(id, userDTO);
      // Verificar si se actualizó el usuario
      if (!updatedUser.error) {
        return res.status(200).send({
          user: updatedUser.data,
          message: "Usuario actualizado exitosamente",
        });
      } else {
        return res.status(400).send({
          user: updatedUser.data,
          message: updatedUser.message,
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
      // Eliminar el usuario
      const removedUser = await UserService.deleteUser(id);
      // Verificar si se eliminó el usuario
      if (!removedUser.error) {
        return res.status(200).send({
          user: removedUser.data,
          message: "Usuario eliminado exitosamente",
        });
      } else {
        return res.status(400).send({
          user: removedUser.data,
          message: removedUser.message,
        });
      }
    } catch (err) {
      next(err);
    }
  },
  removePatientFromDoctor: async (req, res, next) => {
    try {
      const { patientId, doctorId } = req.params;
      const result = await UserService.removePatientFromDoctor(
        doctorId,
        patientId
      );
      // Verificar si se eliminó el paciente del doctor
      if (result.error) {
        return res.status(400).send({
          message: result.message,
        });
      }
      return res.status(200).send({
        removedPatient: result.data.removedPatient,
        removedDoctor: result.data.removedDoctor,
        message: "Paciente eliminado exitosamente",
      });
    } catch (err) {
      next(err);
    }
  },
};
