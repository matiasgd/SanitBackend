const { Appointments, Patients, Users } = require("../db_models");
const mongoose = require("mongoose");
const moment = require("moment");
const { checkIdFormat } = require("../utils/validations");

module.exports = class AppointmentsService {
  static async findAppointmentById(appointmentId) {
    try {
      // Validar ID
      const validId = checkIdFormat(appointmentId);
      if (validId.error) {
        return validId;
      }
      const appointment = await Appointments.findById(appointmentId);

      if (!appointment) {
        return {
          error: true,
          status: 404,
          message: "La cita no existe en la base de datos",
        };
      }
      return {
        error: false,
        status: 201,
        data: appointment,
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async getAppointmentByDoctorId(doctorId) {
    try {
      // Validar ID
      const validId = checkIdFormat(doctorId);
      if (validId.error) {
        return validId;
      }
      const appointments = await Appointments.find({ doctorId })
        .populate("patient", "name email")
        .populate("doctor", "name email");
      if (!appointments) {
        return {
          error: true,
          message: "No hay turnos asignados",
        };
      }
      return {
        error: false,
        data: appointments,
        message: "Los turnos fueron encontrados exitosamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async getAvailableAppointments(doctorId, date) {
    try {
      // Validar ID
      const validId = checkIdFormat(doctorId);
      if (validId.error) {
        return validId;
      }
      // buscar al usuario
      const user = await Users.findById(doctorId);
      if (!user) {
        return {
          status: 404,
          error: true,
          message: "El doctor no existe",
        };
      }
      // buscar los turnos del doctor
      const appointments = await Appointments.find({ doctorId })
        .populate("patient", "name email")
        .populate("doctor", "name email");
      if (!appointments) {
        return {
          status: 404,
          error: true,
          message: "No hay turnos asignados",
        };
      }
      return {
        error: false,
        data: appointments,
        message: "Los turnos fueron encontrados exitosamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async createAppointment(appointmentDTO) {
    try {
      const {
        dateOfAppointment,
        timeOfAppointment,
        duration,
        patientId,
        doctorId,
        serviceId,
        address,
        paymentMethod,
        category,
        type,
        servicePrice,
        appointmentPrice,
        currency,
      } = appointmentDTO;

      // Convertir fecha y hora en un solo objeto Moment
      let startDateTime = moment(
        `${dateOfAppointment} ${timeOfAppointment}`,
        "YYYY-MM-DD HH:mm"
      );

      // Calculo de EndTime
      const [durationHours, durationMinutes] = duration.split(":");
      let endDateTime = startDateTime
        .clone()
        .add(Number(durationHours), "hours")
        .add(Number(durationMinutes), "minutes");

      // Formatear fechas en formato ISO 8601 con UTC
      const formattedStartTime = startDateTime.toISOString();
      const formattedEndTime = endDateTime.toISOString();
    
      const patient = await Patients.findById(patientId);
      if (!patient) {
        return {
          status: 404,
          error: true,
          message: "El paciente no existe",
        };
      }

      // validar si el doctor existe
      const doctor = await Users.findById(doctorId);
      if (!doctor) {
        return {
          status: 404,
          error: true,
          message: "El doctor no existe",
        };
      }
      // crear el turno en la base de datos
      const newAppointment = new Appointments({
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        patient: patientId,
        doctor: doctorId,
        service: serviceId,
        address: address,
        category: category,
        type: type,
        servicePrice: parseInt(servicePrice, 10),
        appointmentPrice: parseInt(appointmentPrice),
        currency: currency,
        paymentMethod: paymentMethod,
      });
      await newAppointment.save();

      return {
        status: 201,
        error: false,
        data: newAppointment,
        message: "El turno fue creado exitosamente",
      };
    } catch (error) {
      return {
        status: 500,
        error: true,
        data: error,
      };
    }
  }
  static async updateAppointment(appointmentId, appointmentDTO) {
    try {
      // validar objectId
      if (!mongoose.isValidObjectId(appointmentId)) {
        return {
          error: true,
          message: "El ID es inválido",
        };
      }
      // validar si el turno existe
      const existingAppointment = await Appointments.findById(appointmentId);
      if (!existingAppointment) {
        return {
          error: true,
          message: "El turno no existe",
        };
      }
      if (
        existingAppointment.status === "Cancelada" ||
        existingAppointment.paymentStatus === "Pagado"
      ) {
        return {
          error: true,
          message: "La cita se encuentra cerrada.",
        };
      }
      // actualizacion si el turno existe
      const updatedAppointment = await Appointments.findOneAndUpdate(
        { _id: appointmentId },
        appointmentDTO,
        { new: true }
      );
      return {
        error: false,
        data: updatedAppointment,
        message: "El turno fue modificado exitosamente",
      };
    } catch (err) {
      throw err;
    }
  }
  static async deleteAppointment(appointmentId) {
    try {
      // validar objectId
      const validID = checkIdFormat(appointmentId);
      if (validID.error) {
        return validID;
      }
      const deletedAppointment = await Appointments.findByIdAndDelete(
        appointmentId
      );
      if (!deletedAppointment) {
        return {
          error: true,
          message: "El turno no existe",
        };
      }
      return {
        error: false,
        data: deletedAppointment,
        message: "El turno fue eliminado exitosamente",
      };
    } catch (err) {
      throw err;
    }
  }
};
