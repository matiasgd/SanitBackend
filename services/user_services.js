const { Users, Patients } = require("../db_models");
const mongoose = require("mongoose");

module.exports = class UsersService {
  static async findUsers() {
    try {
      const users = await Users.find();
      return { error: false, data: users };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async findById(userId) {
    try {
      const validId = this.checkIdFormat(userId);
      if (validId.error) {
        return { error: true, message: validId.message };
      }
      const user = await Users.findById(userId);
      if (!user) {
        return { error: true, message: "El usuario no existe" };
      }
      return { error: false, data: user };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async findDoctorPatients(id) {
    try {
      // Validar el formato de _id utilizando mongoose
      const validId = this.checkIdFormat(id);
      if (validId.error) {
        return { error: true, message: validId.message };
      }
      // Buscar el usuario en la base de datos
      const doctor = await Users.findById(id);
      if (!doctor) {
        return { error: true, message: "El usuario no existe" };
      }
      const patientIds = doctor.patients.map((patientId) => {
        return new mongoose.Types.ObjectId(patientId);
      });
      // Buscar los pacientes en la base de datos
      const patientsInfo = await Patients.find({ _id: { $in: patientIds } })
        .populate("doctors", "name lastName")
        .select("-previousDoctors -previousPatients");
      if (patientsInfo.length === 0) {
        return { error: true, message: "No se encontraron pacientes" };
      }
      return { error: false, data: patientsInfo };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async userRegister(userDTO) {
    try {
      const { email, password } = userDTO;
      // Validar que se proporcionen todos los campos requeridos
      if (!email || !password) {
        return {
          error: true,
          message:
            "La información de los campos para la creación de una cuenta es incorrecta.",
        };
      }
      // Validar que el email no esté registrado
      const user = await Users.findOne({ email });
      if (user) {
        return {
          error: true,
          message: "El email ya está registrado.",
        };
      }

      // Crear el usuario
      const newUser = await Users.create({ email, password });
      return {
        error: false,
        data: newUser,
      };
    } catch (error) {
      return {
        error: true,
        message: "Hubo un problema en la creación del usuario.",
      };
    }
  }
  static async updateUser(id, updateFields) {
    try {
      const UpdatableFields = [
        "name",
        "lastName",
        "gender",
        "cellphone",
        "country",
        "province",
        "city",
        "birthdate",
        "field",
        "specialty",
      ];
      const user = await Users.findById(id);
      if (!user) {
        return {
          error: true,
          message: "El usuario no existe",
        };
      }
      // Validar que se proporcionen todos los campos requeridos
      const isValidFields = Object.keys(updateFields).every((field) =>
        UpdatableFields.includes(field)
      );
      if (!isValidFields) {
        return {
          error: true,
          message:
            "Al menos uno de los campos proporcionados no es actualizable",
        };
      }
      // Actualizar los campos del usuario
      Object.keys(updateFields).forEach((field) => {
        user[field] = updateFields[field];
      });
      const updatedUser = await user.save();
      return { error: false, data: updatedUser };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async deleteUser(id) {
    try {
      const doctor = await Users.findById(id);
      // Verificar si el usuario existe
      if (!doctor) {
        return {
          error: true,
          message: "Doctor no encontrado",
        };
      }
      // Eliminar el usuario
      const removedUser = await Users.findOneAndDelete({ _id: id });
      return { error: false, data: removedUser };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async removePatientFromDoctor(doctorId, patientId) {
    // validar los formatos de ID
    const validDoctorID = this.checkIdFormat(doctorId);
    if (validDoctorID.error) {
      return { error: true, message: validDoctorID.message };
    }
    const validPatientID = this.checkIdFormat(patientId);
    if (validPatientID.error) {
      return { error: true, message: validPatientID.message };
    }
    // Encontrar doctor y paciente
    const doctor = await Users.findById(doctorId);
    const patient = await Patients.findById(patientId);
    // verificar si el médico y el paciente existen
    if (!doctor) {
      return { error: true, message: "Médico no encontrado" };
    }
    if (!patient) {
      return { error: true, message: "Paciente no encontrado" };
    }
    // verificar si el paciente está asociado al médico
    const patientIndex = doctor.patients.findIndex((patient) => {
      return (
        patient._id.toString() ==
        new mongoose.Types.ObjectId(patientId)._id.toString()
      );
    });
    if (patientIndex === -1) {
      return {
        error: true,
        message: "El paciente no está asociado a este médico",
      };
    }
    const doctorIndex = patient.doctors.findIndex((doctor) => {
      return (
        doctor._id.toString() ==
        new mongoose.Types.ObjectId(doctorId)._id.toString()
      );
    });
    if (doctorIndex === -1)
      return {
        error: true,
        message: "El médico no está asociado a este paciente",
      };

    // eliminar el paciente del array de pacientes del médico y el médico del array de médicos del paciente
    const removedPatient = doctor.patients.splice(patientIndex, 1)[0];
    await doctor.save();
    const removedDoctor = patient.doctors.splice(doctorIndex, 1)[0];
    await patient.save();
    patient.previousDoctors.push(removedDoctor);
    doctor.previousPatients.push(removedPatient);
    await patient.save();
    await doctor.save();
    return { error: false, data: { removedPatient, removedDoctor } };
  }

  // Formulas de validacion y busqueda adicionales.

  static checkIdFormat(id) {
    if (!mongoose.isValidObjectId(id)) {
      return { error: true, message: "El ID es inválido" };
    }
    return { error: false };
  }
};