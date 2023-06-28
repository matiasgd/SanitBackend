const { Appointments, Users } = require("../db_models");
const AppointmentsService = require("../services/appointment_services");
const moment = require("moment");

module.exports = {
  getAppointmentById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const appointment = await AppointmentsService.findById(id)
        .populate("patient", "name email")
        .populate("doctor", "name email");
      if (appointment.error) {
        return res.status(400).send(appointment.message);
      }
      res.status(201).send({
        appointment: appointment.data,
        message: "El turno fue encontrado exitosamente",
      });
    } catch (err) {
      next(err);
    }
  },
  getAppointmentByDoctorId: async (req, res, next) => {
    try {
      const { id } = req.params;
      const appointments = await AppointmentsService.getAppointmentByDoctorId(
        id
      );

      if (appointments.error) {
        return res.status(400).send(appointments.message);
      }
      console.log(appointments.data, "appointments");
      res.status(201).send({
        appointments: appointments.data,
        message: appointments.message,
      });
    } catch (err) {
      next(err);
    }
  },
  createAppointment: async (req, res, next) => {
    try {
      const appointmentDTO = { ...req.body };

      const newAppointment = await AppointmentsService.createAppointment(
        appointmentDTO
      );
      if (newAppointment.error) {
        return res.status(400).send(newAppointment.message);
      }
      res.status(201).send({
        appointment: newAppointment.data,
        message: newAppointment.message,
      });
    } catch {
      next(err);
    }
  },
  updateAppointment: async (req, res, next) => {
    try {
      const appointmentId = req.params.appointmentId;
      const appointmentDTO = { ...req.body };
      const updatedAppointment = await AppointmentsService.updateAppointment(
        appointmentId,
        appointmentDTO
      )
      if (updatedAppointment.error) {
        return res
        .status(400)
        .send(updatedAppointment.message);
      }
      res.status(201).send({
        appointment: updatedAppointment.data,
        message: updatedAppointment.message,
      });
    } catch (err) {
      next(err);
    }
  },
  deleteAppointment: async (req, res, next) => {
    try {
      const appointmentId = req.params.appointmentId;
      const deletedAppointment = await AppointmentsService.deleteAppointment(
        appointmentId
      )
      if (deletedAppointment.error) {
        return res
        .status(400)
        .send(deletedAppointment.message);
      }
      res.status(201).send({
        appointment: deletedAppointment.data,
        message: deletedAppointment.message,
      })
    } catch (err) {
      next(err);
    }
  },
};