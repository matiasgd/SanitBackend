const { Services, Users } = require("../db_models");

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

  // RUTAS GENERALES DE PEDIDO POST
  createService: async (req, res, next) => {
    try {
      const newService = new Services(req.body);
      const savedService = await newService.save();
      res.status(200).send(savedService);
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
      // verificacion si el ID enviado por params no existe en la DB
      const service = await Services.findOne({ _id: serviceId });
      if (!service) {
        return res.status(404).send("Servicio no encontrado");
      }
      // eliminacion si el servicio existe
      const removedService = await Services.findOneAndDelete({ _id: serviceId });
      res.status(200).send(removedService);
    } catch (err) {
      next(err);
    }
},
}