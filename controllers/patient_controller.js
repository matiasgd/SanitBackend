const { Patients } = require("../db_models");
const PatientsService = require("../services/patient_services");

module.exports = {
  getPatients: async (req, res, next) => {
    try {
      const patients = await Patients.find();
      if (!patients) {
        return res.status(401).send({
          message: "No se encontraron pacientes",
        });
      }
      res.status(201).send({
        message: "Pacientes encontrados",
        patients: patients,
      });
    } catch (err) {
      next(err);
    }
  },
  createPatient: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const patientDTO = { ...req.body };
      // Crear un nuevo usuario
      const patient = await PatientsService.createPatient(doctorId, patientDTO);

      if (patient.error) {
        return res.status(patient.status).send({
          data: patient.data,
          message: patient.message,
        });
      }
      res.status(patient.status).send({
        message: patient.message,
        patient: patient.data,
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

  createPatientForm: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const patientEmail = req.body.email;

      const result = await PatientsService.sendPatientForm(
        doctorId,
        patientEmail
      );
      if (result.error) {
        return res.status(result.status).send({
          data: result.data,
          message: result.message,
        });
      }
      console.log(result);
      res.status(result.status).send({
        data: result.data,
        message: result.message,
      });
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
      if (updatedPatient.error) {
        return res.status(updatedPatient.status).send({
          message: updatedPatient.message,
        });
      }
      res.status(updatedPatient.status).send({
        patient: updatedPatient.data,
        message: updatedPatient.message,
      });
    } catch (err) {
      next(err);
    }
  },

  // Asignar un servicio a un paciente
  assignServiceToPatient: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const serviceId = req.body.serviceId;

      const patient = await PatientsService.assignServiceToPatient(
        patientId,
        serviceId
      );

      if (patient.error) {
        return res.status(patient.status).send({
          message: patient.message,
          patient: patient.data,
        });
      }
      res.status(patient.status).send({
        patient: patient.data,
        message: patient.message,
      });
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
        return res.status(400).send({
          message: patient.message,
        });
      }

      res.status(201).send({
        patient: patient.data,
        message: patient.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
