const { Addresses } = require("../db_models");
const AddressService = require("../services/address_services");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyAddresses: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const addresses = await AddressService.findMyAddresses(doctorId);
      if (addresses.error) {
        return res.status(404).send({
          addresses: addresses,
          message: "No se encontraron direcciones para este usuario",
        });
      }
      return res.status(201).send({
        addresses: addresses.data,
        message: "Las direcciones se han encontrado!",
      });
    } catch (err) {
      next(err);
    }
  },
  createAddress: async (req, res, next) => {
    try {
      console.log(req.body)
      const doctorId = req.params.doctorId;
      const addressDTO = { ...req.body };
      // Crear una nueva direccion
      const createdAddress = await AddressService.createAddress(
        doctorId,
        addressDTO
      );
      if (createdAddress.error) {
        return res.status(400).send({
          message: createdAddress.message,
        });
      }
      res.status(201).send({
        address: createdAddress,
        message: createdAddress.message,
      });
    } catch (err) {
      next(err);
    }
  },
  updateAddress: async (req, res, next) => {
    try {
      const addressId = req.params.addressId;
      const addressDTO = { ...req.body };
      // Crear el nuevo servicio
      const updatedAddress = await AddressService.updateAddress(
        addressId,
        addressDTO
      );
      if (updatedAddress.error) {
        return res.status(400).send(updatedAddress.message);
      }
      res.status(201).send({
        address: updatedAddress.data,
        message: updatedAddress.message,
      });
    } catch (err) {
      next(err);
    }
  },
  deleteAddress: async (req, res, next) => {
    try {
      const addressId = req.params.addressId;
      // Eliminar el usuario
      const removedAddress = await AddressService.deleteAddress(addressId);
      // Verificar si se eliminó el usuario
      if (removedAddress.error) {
        return res.status(400).send({
          address: removedAddress.data,
          message: removedAddress.message,
        });
      } else {
        return res.status(201).send({
          address: removedAddress.data,
          message: removedAddress.message,
        });
      }
    } catch (err) {
      next(err);
    }
  },
};
