const { Patients, Users } = require("../db_models");
const mongoose = require("mongoose");

module.exports = class PatientService {
  static async findPatients() {
    try {
      const users = await Patients.find();
      return { error: false, data: users };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async findById(id) {
    try {
      const user = await Patients.findById(id);
      return { error: false, data: user };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async createPatient(doctorId, patientDTO) {
    try {
      const id = doctorId.toString();
      const { email, name, lastName } = patientDTO;
      // ver si el doctor existe
      let doctor = await Users.findById(id);
      if (!doctor) {
        return {
          error: true,
          message: "El doctor no existe",
        };
      }
      // Validar que se proporcionen todos los campos requeridos
      if (!email || !name || !lastName) {
        return {
          error: true,
          message:
            "La informacion de los campos para la creacion de una cuenta son incorrectos.",
        };
      }
      // Validar que el email no esté registrado
      let patient = await Patients.findOne({ email });
      console.log(patient, "patient")
      // Crear un nuevo paciente
      if (patient) {
        console.log("no entro al else");
        // El paciente ya existe, verificamos si el médico ya está asignado
        const isDoctorAssigned = patient.doctors.some((docId) =>
          docId.equals(id)
        );
        if (!isDoctorAssigned) {
          // El médico no está asignado al paciente, lo agregamos al array de médicos
          patient.doctors.push(doctorId);
          await patient.save();
          doctor.patients.push(patient._id.toString());
          await doctor.save();
          return { error: false, data: patient };
        }
          return { error: true, message: "El paciente ya existe" };
      } else {
        console.log("entro al else")
        // El paciente no existe, creamos un nuevo registro
        patient = await Patients.create({ ...patientDTO, doctors: [id] });
        doctor.patients.push(patient._id.toString());
        await doctor.save();
        return { error: false, data: patient };
      }
    } catch (error) {
      return {
        error: true,
        message: "Hubo un problema en la creacion del paciente.",
      };
    }
  }
  
};
