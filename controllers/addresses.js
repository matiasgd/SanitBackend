const { Addresses } = require("../db_models");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyAddresses: async (req, res, next) => {
    try {
      const _id = req.params._id;
      const addressess = await Addresses.find({ _id });
      res.send(addressess)
    } catch (err) {
      next(err);
    }
  },
  createAddress: async (req, res, next) => {
    try {
      const newAddress = new Addresses(req.body);
      const savedAddress = await newAddress.save();
      res.send(savedAddress);
    } catch (err) {
      next(err);
    }
  },
  
};
