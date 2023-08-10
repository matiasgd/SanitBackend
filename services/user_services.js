const { Users, Patients } = require("../db_models");
const mongoose = require("mongoose");
const {
  checkIdFormat,
  validateSpecialCharacters,
  validatePasswordLength,
  isValidEmail,
} = require("../utils/validations");

module.exports = class UsersService {
  static async findUsers() {
    try {
      const users = await Users.find();
      return { error: false, data: users };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async findOneUser(userId) {
    try {
      // Validar ID
      const validId = checkIdFormat(userId);
      if (validId.error) {
        return validId;
      }
      const user = await Users.findById(userId);
      if (!user) {
        return {
          error: true,
          message: "El usuario no existe",
        };
      }
      return { error: false, data: user };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async findDoctorPatients(id) {
    try {
      // Validar ID
      const validId = checkIdFormat(id);
      if (validId.error) {
        return validId;
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
      const validEmail = isValidEmail(email);
      // Validar que el email tenga el formato correcto
      if (!validEmail) {
        console.log("email no valido");
        return {
          error: true,
          message: "El email no tiene el formato correcto.",
        };
      }
      // Validar longitud de la contraseña
      const validPasswordLength = validatePasswordLength(password, 8);
      if (!validPasswordLength) {
        return {
          error: true,
          message: "La contraseña debe tener al menos 8 caracteres.",
        };
      }
      // Validar que la contraseña no contenga caracteres especiales
      const validPasswordCharacters = validateSpecialCharacters(password);
      if (validPasswordCharacters) {
        return {
          error: true,
          message: "La contraseña no puede contener caracteres especiales.",
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
  static async completeRegister(doctorId, doctorDTO) {
    try {
      // Validar ID
      const validId = checkIdFormat(doctorId);
      if (validId.error) {
        return validId;
      }
      // Buscar el usuario en la base de datos
      let doctor = await Users.findById(doctorId);
      if (!doctor) {
        return {
          error: true,
          message: "El usuario no existe",
        };
      }
      if (doctor.profileCompleted === true) {
        return {
          error: true,
          message: "El usuario ya completó su registro",
        };
      }
      // Validar que se proporcionen todos los campos requeridos
      const { name, lastName, gender, cellphone, birthdate, field, specialty } =
        doctorDTO;
      // Actualizar el usuario
      doctor.name = name;
      doctor.lastName = lastName;
      doctor.gender = gender;
      doctor.cellphone = cellphone;
      doctor.birthdate = birthdate;
      doctor.field = field;
      doctor.specialty = specialty;
      doctor.profileCompleted = true;
      const updatedUser = await doctor.save();
      return {
        error: false,
        data: updatedUser,
        message: "El usuario se ha actualizado correctamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async updateUser(id, updateFields) {
    try {
      // Validar ID
      const validId = checkIdFormat(id);
      if (validId.error) {
        return validId;
      }
      const UpdatableFields = [
        "name",
        "lastName",
        "gender",
        "cellphone",
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
      // Validar ID
      const validId = checkIdFormat(id);
      if (validId.error) {
        return validId;
      }
      const doctor = await Users.findById(id);
      // Verificar si el usuario existe
      if (!doctor) {
        return {
          error: true,
          message: "El usuario no existe",
        };
      }
      // Eliminar el usuario
      const removedUser = await Users.findOneAndDelete({ _id: id });
      return {
        error: false,
        data: removedUser,
        message: "El usuario se ha eliminado correctamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async removePatientFromDoctor(userId, patientId) {
    // validar los formatos de ID
    const validDoctorId = checkIdFormat(userId);
    if (validDoctorId.error) {
      return validDoctorId;
    }
    const validPatientID = checkIdFormat(patientId);
    if (validPatientID.error) {
      return validPatientID;
    }

    // Encontrar doctor y paciente
    const doctor = await Users.findById(userId);
    const patient = await Patients.findById(patientId);
    // verificar si el médico y el paciente existen
    if (!doctor) {
      return { error: true, message: "El usuario no existe" };
    }
    if (!patient) {
      return { error: true, message: "Paciente no existe" };
    }
    // verificar asociacion de medico y paciente
    const doctorIndex = patient.doctors.findIndex(
      (doctor) => doctor._id.toString() === userId.toString()
    );
    if (doctorIndex === -1)
      return {
        error: true,
        message: "El médico no está asociado a este paciente",
      };
    // actualiza al doctor y al paciente
    const updatedDoctor = await Users.findOneAndUpdate(
      { _id: userId, patients: patientId },
      {
        $pull: { patients: patientId },
        $push: { previousPatients: patientId },
      },
      { new: true }
    );
    const updatedPatient = await Patients.findOneAndUpdate(
      { _id: patientId, doctors: userId },
      { $pull: { doctors: userId }, $push: { previousDoctors: userId } },
      { new: true }
    );
    return {
      error: false,
      data: { updatedPatient, updatedDoctor },
      message: "El paciente se ha eliminado correctamente",
    };
  }
};
