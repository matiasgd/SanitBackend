const { Appointments } = require("../db_models");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getAll: async (req, res, next) => {
    try {
      const users = await Appointments.find();
      res.send(users);
    } catch (err) {
      next(err);
    }
  },
  createAppointment: async (req, res, next) => {
    try {
      const newAppointment = new Appointments(req.body);
      const savedAppointment = await newAppointment.save();
      res.send(savedAppointment);
    } catch (err) {
      next(err);
    }
  },
  updateAppointment: async (req, res, next) => {
    try {
      const _id = req.params._id;
      const appointment = await Appointments.findOne({ _id });
      if (!appointment) {
        return res.status(404).send("Appointment not found");
      }

      // Obtener los campos y sus nuevos valores del cuerpo de la solicitud
      const updateFields = req.body;

      // Recorrer los campos y actualizar el objeto de la cita
      Object.keys(updateFields).forEach((field) => {
        appointment[field] = updateFields[field];
      });

      const updatedAppointment = await appointment.save();
      res.send(updatedAppointment);
    } catch (err) {
      next(err);
    }
  },
  deleteAppointment: async (req, res, next) => {
    try {
      const appointmentId = req.params._id;
      const userId = req.params._userId;
      // Buscar la cita por su ID
      const appointment = await Appointments.findById(appointmentId);
      if (!appointment) {
        return res.status(404).send("Appointment not found");
      }
      if (
        appointment.patient.toString() !== userId.toString() &&
        appointment.doctor.toString() !== userId.toString()
      ) {
        return res.status(404).send("User not authorized");
      }
      // Eliminar la cita
      await Appointments.deleteOne({ _id: appointmentId });

      res.send("Appointment deleted successfully");
    } catch (err) {
      next(err);
    }
  },
};
