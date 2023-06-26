const { Patients, Users, Services } = require("../db_models");
const moment = require("moment");
const xlsx = require("xlsx");
const { isValidDate, isValidGender, isValidEmail } = require("../utils");

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
      console.log(patient, "patient");
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
        console.log("entro al else");
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
  static async bulkCreatePatients(doctorId, file) {
    try {
      const doctor = await Users.findOne({ _id: doctorId });
      const workbook = xlsx.readFile(file.path);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = xlsx.utils.sheet_to_json(worksheet);

      const columnMapping = {
        name: "name",
        lastName: "lastName",
        governmentId: "governmentId",
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

      for (const row of mappedJson) {
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
            "One or more required fields are missing in the records."
          );
        }
        // Validar formato de fecha de nacimiento
        if (!isValidDate(row.birthdate)) {
          return {
            error: true,
            message: "La fecha es invalida en uno o mas registros.",
          };
        }
        // Validar género
        if (!isValidGender(row.gender)) {
          return {
            error: true,
            message: "El género es inválido en uno o más registros.",
          };
        }
        // Validar dirección de correo electrónico
        if (!isValidEmail(row.email)) {
          return {
            error: true,
            message: "El email es inválido en uno o más registros.",
          };
        }
        let patient = await Patients.findOne({ email: row.email });
        if (patient) {
          const isDoctorAssigned = patient.doctors.some((docId) =>
            docId.equals(doctorId)
          );
          if (!isDoctorAssigned) {
            patient.doctors.push(doctorId);
            await patient.save();
            doctor.patients.push(patient._id.toString());
            await doctor.save();
          }
        } else {
          const newPatient = await Patients.create({
            ...row,
            doctors: [doctorId],
          });
          doctor.patients.push(newPatient._id);
          await doctor.save();
        }
      }
      return {
        error: false,
        message: "Pacientes creados exitosamente!",
        data: mappedJson,
      };
    } catch (err) {
      throw err;
    }
  }
  static async assignServiceToPatient(patientId, serviceId) {
    try {
      // Verificar si el paciente existe
      const patient = await Patients.findOne({ _id: patientId });

      if (!patient) {
        return { error: true, data: null, message: "Paciente no encontrado" };
      }

      // Verificar si el servicio existe
      const service = await Services.findOne({ _id: serviceId });

      if (!service) {
        return { error: true, data: null, message: "Servicio no encontrado" };
      }

      // Verificar si el médico asignado al servicio es el mismo que el del paciente
      const medicoId = service.doctor;
      if (!patient.doctors.some((doctor) => doctor._id.equals(medicoId))) {
        return {
          error: true,
          data: null,
          message: "El médico asignado no coincide con el paciente",
        };
      }
      patient.services.push(serviceId);
      await patient.save();

      return {
        error: false,
        data: patient,
        message: "Servicio asignado correctamente",
      };
    } catch (err) {
      throw err;
    }
  }
  static async unassignServiceFromPatient(patientId, serviceId) {
    try {
      const patient = await Patients.findOne({ _id: patientId });
      const service = await Services.findOne({ _id: serviceId });
      // Verificar si el paciente existe y el servicio existen
      if (!patient) {
        return {
          error: true,
          data: null,
          message: "Paciente no encontrado",
        };
      }
      if (!service) {
        return {
          error: true,
          data: null,
          message: "Servicio no encontrado",
        };
      }
      // Verificar si el médico asignado al servicio es el mismo que el del paciente
      const medicoId = service.doctor;
      if (!patient.doctors.some((doctor) => doctor._id.equals(medicoId))) {
        return {
          error: true,
          data: null,
          message: "El médico asignado no coincide con el paciente",
        };
      }
      // Eliminar el ID del servicio de la lista de servicios del paciente
      patient.services.pull(serviceId);
      await patient.save();
      return {
        error: false,
        data: patient,
        message: "Servicio fue eliminado del paciente correctamente",
      };
    } catch (err) {
      throw err;
    }
  }

  static async updatePatient(patientId, patientDTO) {
    try {
      const patient = await Patients.findOne({ _id: patientId });
      console.log(patient, "patient");
      // verificacion si el ID enviado por params no existe en la DB

      if (!patient) {
        return {
          error: true,
          data: patient,
          message: "El paciente no existe.",
        };
      }

      if (patient.doctors.length > 1) {
        return {
          error: true,
          data: patient,
          message:"El paciente tiene más de un médico asignado, no se puede actualizar",
        };
      }
      // actualizacion si el paciente existe
      const updatedPatient = await Patients.findOneAndUpdate(
        { _id: patientId },
        patientDTO,
        { new: true }
      );
      return {
        error: false,
        data: updatedPatient,
        message: "El paciente fue actualizado exitosamente!",
      };
    } catch (err) {
      throw err;
    }
  }
};
