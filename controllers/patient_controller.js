const { Patients, Users, Services } = require("../db_models");
const moment = require("moment");
const xlsx = require("xlsx");
const { isValidDate, isValidGender, isValidEmail } = require("../utils");
const PatientsService = require("../services/patient_services");

module.exports = {
  getPatients: async (req, res, next) => {
    try {
      const patients = await Patients.find();
      res.status(200).send(patients);
    } catch (err) {
      next(err);
    }
  },  
  createPatient: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const patientDTO = { ...req.body };
      // Crear un nuevo usuario
      const newPatient = await PatientsService.createPatient(
        doctorId,
        patientDTO
      );
      if (newPatient.error) {
        return res.status(400)
        .send({
          data: newPatient.data,
          message:newPatient.message
        });
      }
      res.status(200).send({        
        message:newPatient.message,
        patient:newPatient.data
      });
    } catch (err) {
      next(err);
    }
  },  
  bulkCreatePatients: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId.toString();
      const file = req.file;
      const result = await PatientsService.bulkCreatePatients(doctorId, file);
      if (result.error) {
        return res.status(400).send(result.message);
      }
      res.status(200).send(result);
    } catch (err) {
      next(err);
    }
  },
  assignServiceToPatient: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const serviceId = req.body.serviceId;
      const patient = await PatientsService.assignServiceToPatient(
        patientId,
        serviceId
      );
      if (patient.error) {
        return res.status(400).send(patient.message);
      }
      res.status(200).send(patient);
    } catch (err) {
      next(err);
    }
  },
  unassignServiceFromPatient: async (req, res, next) => {
    try {
      // Obtener el ID del paciente y el ID del servicio
      const { patientId, serviceId } = req.params;
      const patient = await PatientsService.unassignServiceFromPatient(
        patientId,
        serviceId
      );
      if (patient.error) {
        return res.status(400).send(patient.message);
      }
      res.status(200).send(patient);
    } catch (err) {
      next(err);
    }
  },
  updatePatient: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const patientDTO = { ...req.body };

      const updatedPatient = await PatientsService.updatePatient(
        patientId,
        patientDTO
      );
      res.status(200).send(updatedPatient);
    } catch (err) {
      next(err);
    }
  },
};
