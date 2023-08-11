const ServicesService = require("../services/service_services");

module.exports = {
  findOneService: async (req, res, next) => {
    try {
      const serviceId = req.params.serviceId;
      const result = await ServicesService.findOneService(serviceId);
      if (result.error) {
        return res.status(result.status).send({
          data: result.data,
          message: result.message,
        });
      }
      return res.status(result.status).send({
        data: result.data,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
  getMyServices: async (req, res, next) => {
    try {
      const id = req.params._id;
      const result = await ServicesService.getMyServices(id);
      result.error
        ? res.status(result.status).send({
            data: result.data,
            message: result.message,
          })
        : res.status(result.status).send({
            data: result.data,
            message: result.message,
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
      const result = await ServicesService.createService(doctorId, serviceDTO);
      result.error
        ? res.status(result.status).send({
            data: result.data,
            message: result.message,
          })
        : res.status(result.status).send({
            data: result.data,
            message: result.message,
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
