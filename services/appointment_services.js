const { Appointments, Patients, Users } = require("../db_models");
const mongoose = require("mongoose");
const moment = require("moment");

module.exports = class AppointmentsService {
  static async findAppointmentById(appointmentId) {
    try {
      const appointment = await Appointments.findById(appointmentId);
      if (!appointment) {
        return {
          error: true,
          message: "La cita no existe",
        };
      }
      return { error: false, data: appointment };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async getAppointmentByDoctorId(doctorId) {
    try {
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
  static async createAppointment(appointmentDTO) {
    try {
      const { date, timeOfAppointment, patientId, doctorId, serviceId } = appointmentDTO;
      // validar objectId
      if (!mongoose.isValidObjectId(doctorId) || !mongoose.isValidObjectId(patientId) || !mongoose.isValidObjectId(serviceId)) {
        return { error: true, message: "El ID es inválido" };
      }
      // Validar que se proporcionen todos los campos requeridos
      if (!date || !timeOfAppointment || !patientId || !doctorId) {
        return {
          error: true,
          message:
            "La informacion de los campos para la creacion de una cita son incorrectos.",
        };
      }
      // validar si el paciente existe
      const patient = await Patients.findById(patientId);
      if (!patient) {
        return {
          error: true,
          message: "El paciente no existe",
        };
      }
      // validar si el doctor existe
      const doctor = await Users.findById(doctorId);
      if (!doctor) {
        return {
          error: true,
          message: "El doctor no existe",
        };
      }

      // validar si el doctor está asignado al paciente
      const isDoctorAssigned = doctor.patients.some((patId) =>
        patId.equals(patientId)
      );
      if (!isDoctorAssigned) {
        return {
          error: true,
          message: "El doctor no está asignado al paciente",
        };
      }
      // validar si el turno ya está reservado
      const existingAppointment = await Appointments.findOne({
        date,
        timeOfAppointment,
        doctor: doctorId,
      });
      if (existingAppointment) 
        return {
          error: true,
          message: "El turno del doctor ya existe en el horario solicitado",
        };  
      
      // validar si la fecha es anterior a la actual o si la fecha es igual a la actual y la hora es anterior a la actual.
      if (
        moment(date).isBefore(moment()) ||
        (moment(date).isSame(moment()) &&
          moment(timeOfAppointment, "HH:mm").isBefore(moment()))
      )
        return {
          error: true,
          message:
            "La fecha y hora de la cita no pueden ser anteriores a la actual",
        };
      // crear el turno en la base de datos
      const newAppointment = new Appointments({
        date,
        timeOfAppointment,
        patient: patientId,
        doctor: doctorId,
        service: serviceId,
      });
      await newAppointment.save();
      return {
        error: false,
        data: newAppointment,
        message: "El turno fue creado exitosamente",
      };
    } catch (err) {
      throw err;
    }
  }
  static async updateAppointment(appointmentId, appointmentDTO) {
    try {
      // validar si el turno existe
      const existingAppointment = await Appointments.findById(appointmentId);
      if (!existingAppointment) {
        return {
          error: true,
          message: "El turno no existe",
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
