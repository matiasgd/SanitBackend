const { Patients, Users, Services } = require("../db_models");
const moment = require("moment");
const xlsx = require("xlsx");
const {
  isValidDate,
  isValidGender,
  isValidEmail,
  checkIdFormat,
} = require("../utils/validations");
const { corsOrigin, sanitEmail } = require("../config");
const transporter = require("../config/transporter");
const { generateResetToken } = require("../utils/token");

module.exports = class PatientService {
  static async findPatients() {
    try {
      const users = await Patients.find();
      return { error: false, data: users };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async findOnePatient(id) {
    try {
      // Validar ID
      const validId = checkIdFormat(id);
      if (validId.error) {
        return validId;
      }
      const patient = await Patients.findById(id);
      if (!patient) {
        return {
          error: true,
          status: 404,
          message: "El paciente no existe en la base de datos.",
        };
      }
      return {
        status: 201,
        error: false,
        data: patient,
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async createPatient(doctorId, patientDTO) {
    try {
      // Validar que se proporcionen todos los campos requeridos
      const { email, name, lastName } = patientDTO;
      if (!email || !name || !lastName) {
        return {
          error: true,
          status: 422,
          message:
            "Información incompleta: Debes proporcionar como minimo el email, nombre y apellido para crear una cuenta.",
        };
      }
      // Validar ID
      const validId = checkIdFormat(doctorId);
      if (validId.error) {
        return validId;
      }

      // validar si el doctor existe
      const doctor = await Users.findById(doctorId);
      if (!doctor) {
        return {
          error: true,
          status: 404,
          message: "El usuario no existe en la base de datos.",
        };
      }

      const id = doctor._id;
      // Validar que el email no esté registrado
      let patient = await Patients.findOne({ email });
      // Crear un nuevo paciente
      if (patient) {
        // El paciente ya existe, verificamos si el médico ya está asignado
        const isDoctorAssigned = patient.doctors.some((docId) =>
          docId.equals(id)
        );
        if (!isDoctorAssigned) {
          // El médico no está asignado al paciente, lo agregamos al array de médicos
          patient.doctors.push(doctorId);
          await patient.save();
          doctor.patients.push(patient._id);
          await doctor.save();
          return {
            error: false,
            status: 201,
            data: patient,
            message:
              "El usuario no tenia asignado al paciente pero el paciente ya se encontraba en la base de datos. Se procedio a asignar el paciente al usuario!",
          };
        }
        return { error: true, message: "El paciente ya existe" };
      } else {
        // El paciente no existe, creamos un nuevo registro
        let patient = await Patients.create({
          ...patientDTO,
          doctors: [doctor._id],
        });
        doctor.patients.push(patient._id);
        await doctor.save();
        return {
          error: false,
          status: 201,
          data: patient,
          message:
            "El paciente no se encontraba previamente en la base de datos. El paciente fue creado y asignado exitosamente al usuario!",
        };
      }
    } catch (error) {
      return {
        error: true,
        status: 500,
        data: error,
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

  static async sendPatientForm(doctorId, patientEmail) {
    try {
      // validar si ya existe el perfil del paciente
      const patient = await Patients.findOne({ email: patientEmail });
      if (!patient) {
        return {
          error: true,
          status: 400,
          message: "El paciente no existe.",
        };
      }

      // Validar ID
      const validId = checkIdFormat(doctorId);
      if (validId.error) {
        return validId;
      }

      // validar si el doctor existe
      const doctor = await Users.findById(doctorId);
      if (!doctor) {
        return {
          error: true,
          status: 404,
          message: "El usuario no existe en la base de datos.",
        };
      }
      let patientId = patient._id.toString();
      let name = doctor.name;
      let lastName = doctor.lastName;
      const token = generateResetToken(patientId);
      console.log(token, "token", patientId, "patientId");
      const loginForm = `${corsOrigin}/patient/complete/${token}`;
      const mailOptions = {
        from: sanitEmail,
        to: patientEmail,
        subject: "Sanit: Formulario de paciente",
        text: `¡Hola ${name} ${lastName}! Por favor completa tu perfil para poder brindarte la mejor atencion, haz clic en el siguiente enlace para acceder al formulario: ${loginForm}`,
      };
      await transporter.sendMail(mailOptions);
      return {
        error: false,
        status: 201,
        message: "Se ha enviado un correo electrónico con el formulario",
      };
    } catch (error) {
      return {
        error: true,
        status: 500,
        data: error,
        message: "Hubo un problema en la creacion del paciente.",
      };
    }
  }

  static async updatePatient(patientId, patientDTO) {
    try {
      const patient = await Patients.findOne({ _id: patientId });
      // verificacion si el ID enviado por params no existe en la DB
      if (!patient) {
        return {
          error: true,
          status: 404,
          data: patient,
          message: "El paciente no existe en la base de datos.",
        };
      }

      if (patient.doctors.length > 1) {
        return {
          error: true,
          status: 400,
          data: patient,
          message:
            "El paciente tiene más de un médico asignado, no se puede actualizar",
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
        status: 201,
        data: updatedPatient,
        message: "El paciente fue actualizado exitosamente!",
      };
    } catch (err) {
      throw err;
    }
  }

  // ASIGNACION DE SERVICIOS PARA PACIENTES RECURRENTES

  static async assignServiceToPatient(patientId, serviceId) {
    try {
      // Verificar si el paciente existe
      const patient = await Patients.findOne({ _id: patientId });
      if (!patient) {
        return {
          error: true,
          status: 404,
          message: "El paciente no existe en la base de datos.",
        };
      }

      // Verificar si el servicio existe
      const service = await Services.findOne({ _id: serviceId });

      if (!service) {
        return {
          error: true,
          status: 404,
          message: "Servicio no encontrado en la base de datos.",
        };
      }

      // Verificar si el paciente tiene al medico asignado
      const userId = service.doctor;
      if (!patient.doctors.some((doctor) => doctor._id.equals(userId))) {
        return {
          error: true,
          status: 400,
          message: "El médico no tiene asignado a al paciente",
        };
      }

      patient.services.push(serviceId);
      await patient.save();
      return {
        error: false,
        data: patient,
        status: 201,
        message: "Servicio asignado correctamente!",
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
};
