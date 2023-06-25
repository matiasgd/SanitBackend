const { Patients } = require("../db_models");
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

};
