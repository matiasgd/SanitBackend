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
        number,
        floor,
        addressType,
        webAddress,
        houseApartment,
        country,
        province,
        city,
        zipCode,
      } = addressDTO;

      // validar que los campos obligatorios no esten vacios
      if (!street || !number) {
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
        ...addressDTO,
      });

      // agregar la nueva direccion al medico
      const updatedDoctor = await Users.findOneAndUpdate(
        { _id: doctorId },
        { $push: { addresses: newAddress._id } },
        { new: true }
      );
      if (!updatedDoctor) {
        return { error: true, message: "Médico no encontrado" };
      }
      console.log(updatedDoctor);
      console.log(newAddress);
      return {
        error: false,
        address: newAddress,
        doctor: updatedDoctor,
        message: "La direccion se ha creado exitosamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async updateAddress(addressId, addressDTO) {
    try {
      // actualizacion si el paciente existe
      const updatedAddress = await Addresses.findOneAndUpdate(
        { _id: addressId },
        addressDTO,
        { new: true }
      );
      if (!updatedAddress) {
        return {
          error: true,
          message: "No se pudo actualizar la direccion",
        };
      }
      return {
        error: false,
        data: updatedService,
        message: "la direccion fue actualizada exitosamente!",
      };
    } catch (err) {
      throw err;
    }
  }
  static async deleteAddress(addressId) {
    try {
      // Verificar si la dirección existe
      const address = await Addresses.findOneAndDelete({ _id: addressId });
      if (!address) {
        return {
          error: true,
          message: "La direccion no se encontró",
        };
      }
      const doctorId = address.doctor.toString();
      const doctor = await Users.findOne({ _id: doctorId });
      if (!doctor) {
        return {
          error: true,
          message: "Médico no encontrado",
        };
      }
      // eliminar direccion del medico
      doctor.addresses.pull(addressId);
      await doctor.save();
      return {
        error: false,
        data: address,
        message: "La direccion se ha eliminado exitosamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
};
