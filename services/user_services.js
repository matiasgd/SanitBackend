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
      const user = await Users.findById(userId);
      return { error: false, data: user };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async userRegister(body) {
    try {
      const newUser = await Users.create(body);
      return { error: false, data: newUser };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static checkIdFormat(id) {
    if (!mongoose.isValidObjectId(id)) {
      return { error: true, message: "El ID es inválido" };
    }
    return { error: false };
  }

  static async getUserByEmail(email) {
    try {
      const user = await Users.findOne({ email });
      return { error: false, data: user };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async getPatientsInfoByIds(patientIds) {
    try {
      const patientsInfo = await Patients.find({ _id: { $in: patientIds } });
      return { error: false, data: patientsInfo };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  
  static async updateUser(user, updateFields) {
    try {
      Object.keys(updateFields).forEach((field) => {
        user[field] = updateFields[field];
      });

      const updatedUser = await user.save();
      return { error: false, data: updatedUser };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async removePatientFromDoctor(doctor, patient, doctorId, patientId) {
    
    const patientIndex = doctor.patients.findIndex((patient) => {
      return (
        patient._id.toString() ==
        new mongoose.Types.ObjectId(patientId)._id.toString()
      );
    });

    if (patientIndex === -1) {
      return res.status(404).send("El paciente no está asociado a este médico");
    }

    const removedPatient = doctor.patients.splice(patientIndex, 1)[0];
    await doctor.save();

    const doctorIndex = patient.doctors.findIndex((doctor) => {
      return (
        doctor._id.toString() ==
        new mongoose.Types.ObjectId(doctorId)._id.toString()
      );
    });

    if (doctorIndex === -1) {
      return res.status(404).send("El médico no está asociado a este paciente");
    }

    const removedDoctor = patient.doctors.splice(doctorIndex, 1)[0];
    await patient.save();

    patient.previousDoctors.push(removedDoctor);
    doctor.previousPatients.push(removedPatient);

    await patient.save();
    await doctor.save();

    return { removedPatient, removedDoctor };
  }
};

