const { Patients, Users, Services } = require("../db_models");
const mongoose = require("mongoose");
const moment = require("moment");
const xlsx = require("xlsx");
const { isValidDate, isValidGender, isValidEmail } = require("../utils");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyPatients: async (req, res, next) => {
    try {
      const doctorId = req.params._id;
      const patients = await Patients.find({ doctor: doctorId })
        .populate("address")
        .populate("doctor");
      res.status(200).send(patients);
    } catch (err) {
      next(err);
    }
  },
  // RUTAS GENERALES DE PEDIDO POST
  createPatient: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId.toString();
      const email = req.body.email;
      let patient = await Patients.findOne({ email });
      let doctor = await Users.findOne({ _id: doctorId });

      if (patient) {
        // El paciente ya existe, verificamos si el médico ya está asignado
        const isDoctorAssigned = patient.doctors.some((docId) =>
          docId.equals(doctorId)
        );
        if (!isDoctorAssigned) {
          // El médico no está asignado al paciente, lo agregamos al array de médicos
          patient.doctors.push(doctorId);
          await patient.save();
          doctor.patients.push(patient._id.toString());
          await doctor.save();
        }
      } else {
        // El paciente no existe, creamos un nuevo registro
        patient = await Patients.create({ ...req.body, doctors: [doctorId] });
        doctor.patients.push(patient._id.toString());
        await doctor.save();
      }
      res.status(200).send(patient);
    } catch (err) {
      next(err);
    }
  },

  bulkCreatePatients: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId.toString();
      let doctor = await Users.findOne({ _id: doctorId });
      const file = req.file; // Archivo recibido desde el cliente
      const workbook = xlsx.readFile(file.path);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = xlsx.utils.sheet_to_json(worksheet);

      // Mapear las claves del JSON según las columnas del archivo
      const columnMapping = {
        name: "name",
        lastName: "lastName",
        govermentId: "govermentId",
        birthdate: "birthdate",
        email: "email",
        gender: "gender",
        cellphone: "cellphone",
        country: "country",
        healthInsurance: "healthInsurance",
      };

      const mappedJson = json.map((row) => {
        const mappedRow = {};
        for (const key in row) {
          const trimmedKey = key.trim();
          if (columnMapping.hasOwnProperty(trimmedKey)) {
            mappedRow[columnMapping[trimmedKey]] = row[key];
          }
        }
        return mappedRow;
      });
      console.log(mappedJson, "MAPPED JSON");

      // validar el JSON
      for (const row of mappedJson) {
        // Convertir la fecha al formato YYYY-MM-DD
        if (row.birthdate) {
          const dateJSON = row.birthdate;
          const date = moment("1900-01-01")
            .add(dateJSON, "days")
            .format("MM/DD/YYYY");
          row.birthdate = date;
        }

        // Verificar campos obligatorios
        if (!row.name || !row.lastName || !row.email) {
          throw new Error(
            "Los campos obligatorios están ausentes en uno o más registros."
          );
        }

        // Validar formato de fecha de nacimiento
        if (!isValidDate(row.birthdate)) {
          throw new Error("El formato de la fecha de nacimiento es inválido.");
        }
        // Validar género
        if (!isValidGender(row.gender)) {
          throw new Error("El género es inválido de uno o más registros.");
        }
        // Validar dirección de correo electrónico
        if (!isValidEmail(row.email)) {
          throw new Error(
            "La dirección de correo electrónico de uno o más registros es inválida."
          );
        }

        // Creacion de los pacientes
        let patient = await Patients.findOne({ email: row.email });
        if (patient) {
          // El paciente ya existe, verificamos si el médico ya está asignado
          const isDoctorAssigned = patient.doctors.some((docId) =>
            docId.equals(doctorId)
          );
          if (!isDoctorAssigned) {
            // El médico no está asignado al paciente, lo agregamos al array de médicos
            patient.doctors.push(doctorId);
            await patient.save();
            doctor.patients.push(patient._id.toString());
            await doctor.save();
          }
        } else {
          // El paciente no existe, creamos un nuevo registro
          const patient = await Patients.create({
            ...row,
            doctors: [doctorId],
          });
          doctor.patients.push(patient._id);
          await doctor.save();
        }
      }
      res.status(200).send("Los pacientes del excel se crearon correctamente");
    } catch (err) {
      next(err);
    }
  },

  // ASIGNAR SERVICIO AL PACIENTE
  assignServiceToPatient: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const patient = await Paciente.findOne({ _id: patientId });

      if (!patient) {
        return res.status(404).send("Paciente no encontrado");
      }

      const serviceId = req.body.servicioId;
      const service = await Servicio.findOne({ _id: serviceId });

      if (!service) {
        return res.status(404).send("Servicio no encontrado");
      }

      const medicoId = service.doctor;

      if (!patient.doctors.includes(medicoId)) {
        return res
          .status(404)
          .send("El médico asignado no coincide con el paciente");
      }

      patient.services.push(serviceId);
      await patient.save();

      res.status(200).send(patient);
    } catch (err) {
      next(err);
    }
  },

  // RUTAS GENERALES DE PEDIDO PUT
  updatePatient: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const patient = await Patients.findOne({ _id: patientId });
      // verificacion si el ID enviado por params no existe en la DB
      if (!patient) {
        return res.status(404).send("Paciente no encontrado");
      }
      if (patient.doctors.length > 1) {
        return res
          .status(404)
          .send(
            "El paciente tiene más de un médico asignado, no se puede actualizar"
          );
      }
      // actualizacion si el paciente existe
      const updatedPatient = await Patients.findOneAndUpdate(
        { _id: patientId },
        req.body,
        { new: true }
      );
      res.status(200).send(updatedPatient);
    } catch (err) {
      next(err);
    }
  },

  // RUTAS GENERALES DE PEDIDO DELETE
  removeDoctorFromPatient: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const doctorIdToRemove = req.params.doctorId;

      const patient = await Patients.findById(patientId);
      if (!patient) {
        return res.status(404).send("Paciente no encontrado");
      }

      // Busco si existe el ID del medico en el array de ObjectID de doctors
      const doctorIndex = patient.doctors.findIndex((doctor) => {
        return (
          doctor._id.toString() ==
          new mongoose.Types.ObjectId(doctorIdToRemove)._id.toString()
        );
      });
      // si es -1 significa que no esta asociado
      if (doctorIndex === -1) {
        return res
          .status(404)
          .send("El médico no está asociado a este paciente");
      }
      // si esta asociado procedo a mover el medico a previousDoctors
      patient.previousDoctors.push(patient.doctors[doctorIndex]);
      patient.doctors.splice(doctorIndex, 1);
      await patient.save();
      res.status(200).send("Médico eliminado visualmente del paciente");
    } catch (err) {
      next(err);
    }
  },
};
