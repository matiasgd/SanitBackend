const { Users, Services, Patients } = require("../db_models");
const validTypes = ["Presencial", "Virtual", "Ambos"];
const validCategories = ["Particular", "Prepaga", "Obra social", "Otro"];
const { checkIdFormat } = require("../utils/validations");

module.exports = class ServicesService {
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
        return { error: true, message: "El usuario no existe" };
      }
      // Verificar si el usuario es un doctor
      const services = await Services.find({ doctor: id });
      if (!services) {
        return { error: true, message: "No se encontraron servicios" };
      }
      return { error: false, data: services };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }
  static async createService(doctorId, serviceDTO) {
    try {
      const { name, duration, type, price, category } = serviceDTO;
      // validar que los campos obligatorios no esten vacios
      if (!name || !duration || !type || !price || !category) {
        return { error: true, message: "Faltan campos obligatorios" };
      }
      // Validar que el tipo y la categoria sean validos
      if (!validTypes.includes(type)) {
        return { error: true, message: "El tipo de servicio es invalido!" };
      }
      if (!validCategories.includes(category)) {
        return { error: true, message: "El tipo de categoria es invalida!" };
      }
      // validar ID
      const validId = checkIdFormat(doctorId);
      if (validId.error) {
        return validId;
      }
      // Verificar si el médico existe
      const doctor = await Users.findOne({ _id: doctorId });
      if (!doctor) {
        return { error: true, message: "Médico no encontrado" };
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
      return {
        error: false,
        data: createdService,
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
        return { error: true, message: "Médico no encontrado" };
      }
      // verificar servicio
      const service = await Services.findOne({ _id: serviceId });
      if (!service) {
        return { error: true, message: "Servicio no encontrado" };
      }
      // actualizacion si el paciente existe
      const updatedService = await Services.findOneAndUpdate(
        { _id: serviceId },
        serviceDTO,
        { new: true }
      ).populate("doctor");

      if (!updatedService) {
        return { error: true, message: "No se pudo actualizar el servicio" };
      }
      return {
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
      })
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
