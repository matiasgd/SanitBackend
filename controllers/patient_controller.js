const { Users, Patients } = require("../db_models");
const PatientsService = require("../services/patient_services");
const Chance = require("chance");
const chance = new Chance();

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
  getOnePatient: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const result = await PatientsService.findOnePatient(patientId);
      result.error
        ? res.status(result.status).send({
            data: result.data,
            message: result.message,
          })
        : res.status(result.status).send({
            data: result.data,
            message: result.message,
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
  seedPatients: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const numPatients = req.body.numPatients;
      const user = await Users.findById(doctorId);
      const patients = [];

      for (let i = 0; i < numPatients; i++) {
        const patientData = {
          name: chance.first(),
          lastName: chance.last(),
          govermentId: chance.string({ length: 8, alpha: true, numeric: true }),
          birthdate: chance.birthday({
            year: chance.year({ min: 1950, max: 2000 }),
          }),
          age: chance.age({ type: "adult" }),
          nationality: chance.country(),
          email: chance.email(),
          gender: chance.pickone(["Male", "Female", "Other"]),
          codCountry: chance.country(),
          codArea: chance.integer({ min: 100, max: 999 }).toString(),
          cellphone: chance.phone(),
          country: chance.country(),
          state: chance.state(),
          city: chance.city(),
          street: chance.street(),
          streetNumber: chance.integer({ min: 1, max: 100 }).toString(),
          addressType: chance.pickone(["House", "Appartment"]),
          addressFloor: chance.integer({ min: 1, max: 20 }).toString(),
          zipCode: chance.zip(),
          healthInsurance: chance.company(),
          healthInsuranceNumber: chance.string({
            length: 10,
            alpha: true,
            numeric: true,
          }),
          privateHealthInsurance: chance.company(),
          privateHealthInsuranceNumber: chance.string({
            length: 10,
            alpha: true,
            numeric: true,
          }),
          contactName: chance.first(),
          contactLastName: chance.last(),
          contactRelationship: chance.pickone([
            "Spouse",
            "Parent",
            "Sibling",
            "Friend",
          ]),
          contactPhone: chance.phone(),
          doctors: [doctorId], // Asociar al doctor correspondiente
        };
        const patient = new Patients(patientData);
        patients.push(patient); // Agregar el objeto a la lista de pacientes
        user.patients.push(patient); // Agregar el paciente al usuario
      }

      // Guardar los pacientes en la base de datos
      await Promise.all(patients.map((patient) => patient.save()));
      await user.save();
      console.log(patients, "patients");
      res.status(201).json({
        message: `${numPatients} pacientes generados y asociados al doctor.`,
        data: patients, // Utilizar el array de pacientes generado
      });
    } catch (error) {
      console.error("Error al guardar pacientes:", error);
      res.status(500).json({
        error: "Error al generar pacientes.",
      });
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
