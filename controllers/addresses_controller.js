const { Addresses } = require("../db_models");
const AddressService = require("../services/address_services");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getAllAddresses: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const result = await AddressService.findAllAddresses();
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
  getMyAddresses: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const result = await AddressService.findMyAddresses(doctorId);
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
  createAddress: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const addressDTO = { ...req.body };
      // Crear una nueva direccion
      const result = await AddressService.createAddress(doctorId, addressDTO);
      console.log(result, "result")
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
