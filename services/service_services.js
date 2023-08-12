const { Users, Services, Patients } = require("../db_models");
const { checkIdFormat } = require("../utils/validations");

module.exports = class ServicesService {
  static async findOneService(id) {
    try {
      // Validar ID
      const validId = checkIdFormat(id);
      if (validId.error) {
        return validId;
      }
      const service = await Services.findById(id);
      // Verificar si el usuario existe
      if (!service) {
        return {
          status: 404,
          error: true,
          message: "El servicio no existe",
        };
      }
      return {
        status: 201,
        error: false,
        data: service,
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }

  static async getMyServices(id) {
    try {
      // Validar ID
      const validId = checkIdFormat(id);
      if (validId.error) {
        return validId;
      }
      const user = await Users.findById(id);
      // Verificar si el usuario existe
      if (!user) {
        return {
          status: 404,
          error: true,
          message: "El usuario no existe",
        };
      }
      // Verificar si el usuario es un doctor
      const services = await Services.find({ doctor: id });
      if (!services) {
        return {
          status: 404,
          error: true,
          message: "No se encontraron servicios",
        };
      }
      return {
        status: 201,
        error: false,
        data: services,
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }
  static async createService(doctorId, serviceDTO) {
    try {
      const {
        serviceName,
        description,
        hours,
        minutes,
        currency,
        priceInitialDate,
        priceDuration,
        priceValue,
      } = serviceDTO;

      // ajustes para convertir el precio en objeto
      const cleanedServiceName = serviceName.replace(/\s+/g, "_");
      const randomSuffix = Math.floor(Math.random() * 1000);
      const currentDate = new Date();
      const initialDateFormatted = new Date(priceInitialDate);
      const price = {
        name: `${cleanedServiceName}_${randomSuffix}_${currentDate
          .toISOString()
          .replace(/[-:.]/g, "")}`,
        price: priceValue,
        createdAt: Date.now(),
        expireAt:
          initialDateFormatted.getTime() + priceDuration * 24 * 60 * 60 * 1000,
      };

      const duration = hours * 60 + minutes;
      // validar que los campos obligatorios no esten vacios
      if (!serviceName || !duration || !price || !currency) {
        return {
          status: 400,
          error: true,
          message: "Faltan campos obligatorios",
        };
      }
      // validar ID
      const validId = checkIdFormat(doctorId);
      if (validId.error) {
        return validId;
      }
      // Verificar si el médico existe
      const doctor = await Users.findOne({ _id: doctorId });
      if (!doctor) {
        return {
          status: 404,
          error: true,
          message: "Médico no encontrado",
        };
      }

      // Crear el nuevo servicio
      const newService = new Services({
        serviceName,
        description,
        duration,
        price: [price],
        currency,
        doctor,
      });
      // Guardar el servicio en la base de datos
      const createdService = await newService.save();
      return {
        status: 201,
        error: false,
        data: createdService,
        message: "El servicio fue creado exitosamente!",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async updateService(serviceId, doctorId, serviceDTO) {
    try {
      // validar id
      const validId = checkIdFormat(serviceId);
      if (validId.error) {
        return validId;
      }
      // verificar doctor
      const doctor = await Users.findOne({ _id: doctorId });
      if (!doctor) {
        return {
          status: 404,
          error: true,
          message: "Médico no encontrado",
        };
      }
      // verificar servicio
      const service = await Services.findOne({ _id: serviceId });
      if (!service) {
        return {
          status: 404,
          error: true,
          message: "Servicio no encontrado",
        };
      }
      // actualizacion si el paciente existe
      const updatedService = await Services.findOneAndUpdate(
        { _id: serviceId },
        serviceDTO,
        { new: true }
      ).populate("doctor");

      if (!updatedService) {
        return { 
          status: 400,
          error: true, 
          message: "No se pudo actualizar el servicio" };
      }
      return {
        status: 201,
        error: false,
        data: updatedService,
        message: "El servicio fue actualizado exitosamente!",
      };
    } catch (err) {
      throw err;
    }
  }
  static async updatePrice(serviceId, doctorId, priceDTO) {
    try {
      const { priceInitialDate, priceDuration, priceValue } = priceDTO;

      // verificar servicio
      const service = await Services.findOne({ _id: serviceId });
      if (!service) {
        return {
          status: 404,
          error: true,
          message: "Servicio no encontrado",
        };
      }

      if (service.doctor._id.toString() !== doctorId) {
        return {
          status: 404,
          error: true,
          message: "El servicio no pertenece al doctor",
        };
      }
      // ajustes para convertir el precio en objeto
      const serviceName = service.serviceName;
      const cleanedServiceName = serviceName.replace(/\s+/g, "_");
      const randomSuffix = Math.floor(Math.random() * 1000);
      const currentDate = new Date();
      const initialDateFormatted = new Date(priceInitialDate);
      const price = {
        name: `${cleanedServiceName}_${randomSuffix}_${currentDate
          .toISOString()
          .replace(/[-:.]/g, "")}`,
        price: priceValue,
        createdAt: Date.now(),
        expireAt:
          initialDateFormatted.getTime() + priceDuration * 24 * 60 * 60 * 1000,
      };

      // actualizacion si el paciente existe
      service.price.push(price);
      const updatedService = await service.save();

      return {
        status: 201,
        error: false,
        data: updatedService,
        message: "El servicio fue actualizado exitosamente!",
      };
    } catch (err) {
      throw err;
    }
  }
  static async deleteService(serviceId, doctorId) {
    try {
      // Validar ID
      const validId = checkIdFormat(serviceId);
      if (validId.error) {
        return validId;
      }
      // Verificar si el doctor existe
      const doctor = await Users.findOne({ _id: doctorId });
      if (!doctor) {
        return {
          error: true,
          data: null,
          message: "Doctor no encontrado",
        };
      }
      // Borrar el servicio si el doctor existe
      const removedService = await Services.findOneAndDelete({
        _id: serviceId,
        doctor: doctorId,
      });
      // Verificar si el servicio existe
      if (!removedService) {
        return {
          error: true,
          data: null,
          message: "Servicio no encontrado",
        };
      }
      // Remover el servicio del array de pacientes
      await Patients.updateMany(
        { doctors: doctorId },
        { $pull: { services: serviceId } }
      );
      return {
        error: false,
        data: removedService,
        message: "Servicio fue eliminado del paciente correctamente",
      };
    } catch (err) {
      throw err;
    }
  }
};
