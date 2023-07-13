const ServicesService = require("../services/service_services");

module.exports = {
  getMyServices: async (req, res, next) => {
    try {
      const id = req.params._id;
      const services = await ServicesService.getMyServices(id);
      if (services.error) {
        return res
          .status(404)
          .send("No se encontraron servicios para este usuario");
      }
      res.status(201).send({
        services: services,
        message: "Los servicios se han encontrado!",
      });
    } catch (err) {
      next(err);
    }
  },
  createService: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const serviceDTO = { ...req.body };
      // Crear el nuevo servicio
      const createdService = await ServicesService.createService(
        doctorId,
        serviceDTO
      );
      if (createdService.error) {
        return res.status(400).send(createdService.message);
      }
      res.status(201).send({
        service: createdService,
        message: "El servicio fue creado correctamente!",
      });
    } catch (err) {
      next(err);
    }
  },
  updateService: async (req, res, next) => {
    try {
      const serviceId = req.params.serviceId;
      const doctorId = req.params.doctorId;
      const serviceDTO = { ...req.body };
      // Crear el nuevo servicio
      const updatedService = await ServicesService.updateService(
        serviceId,
        doctorId,
        serviceDTO
      );
      if (updatedService.error) {
        return res.status(400).send(updatedService.message);
      }
      res.status(201).send({
        service: updatedService.data,
        message: updatedService.message,
      });
    } catch (err) {
      next(err);
    }
  },
  deleteService: async (req, res, next) => {
    try {
      const serviceId = req.params.serviceId;
      const doctorId = req.params.doctorId;
      const removedService = await ServicesService.deleteService(
        serviceId,
        doctorId
      );
      if (removedService.error) {
        return res.status(400).send(removedService.message);
      }
      res.status(201).send({
        service: removedService.data,
        message: removedService.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
