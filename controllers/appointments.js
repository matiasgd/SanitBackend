const { Appointments, Users } = require("../db_models");
const moment = require("moment");

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const users = await Appointments.find();
      res.send(users);
    } catch (err) {
      next(err);
    }
  },
  getAppointmentById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const appointment = await Appointments.findById(id)
        .populate("patient", "name email")
        .populate("doctor", "name email");
      if (!appointment) {
        return res.status(404).send("El turno no existe");
      }
      res.send(appointment);
    } catch (err) {
      next(err);
    }
  },
  createAppointment: async (req, res, next) => {
    try {
      const { date, timeOfAppointment, patientId, doctorId } = req.body;
      // validaciones
      const existingAppointment = await Appointments.findOne({
        date,
        timeOfAppointment,
        doctor: doctorId,
      });
      // si ya existe un turno con esa fecha y hora.
      if (existingAppointment) {
        return res.status(400).send("El turno ya está reservado");
      }

      // si la fecha es anterior a la actual o si la fecha es igual a la actual y la hora es anterior a la actual.
      if (
        moment(date).isBefore(moment()) ||
        (moment(date).isSame(moment()) &&
          moment(timeOfAppointment, "HH:mm").isBefore(moment()))
      ) {
        return res
          .status(400)
          .send("No es posible reservar un turno en el pasado");
      }
      const newAppointment = new Appointments({
        date,
        timeOfAppointment,
        patient: patientId,
        doctor: doctorId,
      });
      console.log(newAppointment, "newAppointment");
      await newAppointment.save();

      res.status(201).send("El turno fue reservado satisfactoriamente.");
    } catch {
      return res
        .status(500)
        .send("No es posible reservar un turno en este momento");
    }
  },
  updateAppointment: async (req, res, next) => {
    try {
      const { appointmentId } = req.params;
      const { date, timeOfAppointment, patientId, doctorId } = req.body;

      const user = await Users.find({ _id: doctorId });
      const existingAppointment = await Appointments.findOne({
        _id: appointmentId,
      });

      if (!existingAppointment) {
        return res.status(400).send("El turno no existe");
      }

      // actualizacion si el turno existe
      const updatedAppointment = await Appointments.findOneAndUpdate(
        { _id: appointmentId },
        req.body,
        { new: true }
      );
      return res.status(200).send(updatedAppointment);
    } catch (error) {
      return res
        .status(500)
        .send(`Error del servidor, no se logro realizar la actualizacion`);
    }
  },
  deleteAppointment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const appointment = await Appointments.findByIdAndDelete(id);
      if (!appointment) {
        return res.status(404).send("El turno no existe");
      }
      res.send("El turno fue eliminado satisfactoriamente.");
    } catch (err) {
      next(err);
    }
  },
};
