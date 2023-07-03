const { Addresses } = require("../db_models");
const AddressService = require("../services/address_services");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyAddresses: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const addresses = await AddressService.findMyAddresses(doctorId)
      if (addresses.error) {
        return res.status(404)
          .send({
            addresses: addresses,
            message: "No se encontraron direcciones para este usuario",
          });
      }
      res.send({
        addresses: addresses,
        message: "Las direcciones se han encontrado!",
      })
      return res.status(201).send({
        addresses: addresses,
        message: "Las direcciones se han encontrado!",
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
      const createdAddress = await AddressService.createAddress(
        doctorId,
        addressDTO
      );
      console.log(createdAddress, "createdAddress")
      if (createdAddress.error) {
        return res.status(400).
        send({
          message: createdAddress.message,
        });
      }
      res.status(201).send({
        service: createdAddress,
        message:  createdAddress.message,
      });
    } catch (err) {
      next(err);
    }
}
}
