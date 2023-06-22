const { Services, Users, Patients } = require("../db_models");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyServices: async (req, res, next) => {
    try {
      const _id = req.params._id;
      const user = await Users.findOne({ _id });
      const services = await Services.find({ doctor: user._id });
      res.send(services);
    } catch (err) {
      next(err);
    }
  },

  // CREAR UN NUEVO SERVICIO
  createService: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const { name, duration, type, price, category } = req.body;

      // Verificar si el médico existe
      const doctor = await Users.findOne({ _id: doctorId });

      if (!doctor) {
        return res.status(404).send("Médico no encontrado");
      }

      // Crear el nuevo servicio
      const newService = new Services({
        name,
        duration,
        type,
        price,
        category,
        doctor,
      });

      // Guardar el servicio en la base de datos
      const createdService = await newService.save();

      res.status(201).json(createdService);
    } catch (err) {
      next(err);
    }
  },

  // RUTAS GENERALES DE PEDIDO PUT
  updateService: async (req, res, next) => {
    try {
      const serviceId = req.params.serviceId;
      const doctorId = req.params.doctorId;
      const doctor = await Users.findOne({ _id: doctorId });
      // verificacion si el ID enviado por params no existe en la DB
      if (!doctor) {
        return res.status(404).send("Doctor no encontrado");
      }
      // actualizacion si el paciente existe
      const updatedService = await Services.findOneAndUpdate(
        { _id: serviceId },
        req.body,
        { new: true }
      );
      res.status(200).send(updatedService);
    } catch (err) {
      next(err);
    }
  },

  // RUTAS GENERALES DE PEDIDO DELETE
  deleteService: async (req, res, next) => {
    try {
      const serviceId = req.params.serviceId;
      const doctorId = req.params.doctorId;

      const doctor = await Users.findOne({ _id: doctorId });
      // verificacion si el ID enviado por params no existe en la DB
      if (!doctor) {
        return res.status(404).send("Doctor no encontrado");
      }

      // eliminacion si el servicio existe
      const removedService = await Services.findOneAndDelete({
        _id: serviceId,
        doctor: doctorId,
      });

      if (!removedService) {
        return res.status(404).send("Servicio no encontrado");
      }

      // Eliminar el servicio del array de servicios de los pacientes
      await Patients.updateMany(
        { doctors: doctorId },
        { $pull: { services: serviceId } }
      );

      res.status(200).send(removedService);
    } catch (err) {
      next(err);
    }
  },
};
