const { Users, Addresses } = require("../db_models");
const mongoose = require("mongoose");

module.exports = class AddressesService {
  static async findMyAddresses(id) {
    try {
      const user = await Users.findById(id);
      // Verificar si el usuario existe
      if (!user) {
        return {
          error: true,
          message: "El usuario no existe",
        };
      }
      // Verificar si el usuario es un doctor
      const addresses = await Addresses.find({ doctor: id });
      if (!addresses) {
        return {
          error: true,
          message: "No se encontraron direcciones",
        };
      }
      return {
        error: false,
        data: addresses,
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }
  static async createAddress(doctorId, addressDTO) {
    try {
      const {
        street,
        streetNumber,
        floor,
        letter,
        country,
        province,
        neighborhood,
        zipCode,
      } = addressDTO;

      // validar que los campos obligatorios no esten vacios
      if (!street || !streetNumber || !country || !province || !neighborhood) {
        return {
          error: true,
          message: "Faltan campos obligatorios",
        };
      }
      // Verificar si el médico existe
      const doctor = await Users.findOne({ _id: doctorId });
      if (!doctor) {
        return { error: true, message: "Médico no encontrado" };
      }
      // Crear el nuevo servicio
      const newAddress = new Addresses({
        doctor: doctorId,
        street,
        streetNumber,
        floor,
        letter,
        country,
        province,
        neighborhood,
        zipCode,
      });
      // Guardar el servicio en la base de datos
      const createdAddress = await newAddress.save();
      doctor.addresses.push(createdAddress._id.toString());
      return {
        error: false,
        data: createdAddress,
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
};
