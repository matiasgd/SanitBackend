const { Fees } = require("../db_models");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyFees: async (req, res, next) => {
    try {
      const _id = req.params._id;
      const fees = await Fees.find({ _id });
      res.send(fees);
    } catch (err) {
      next(err);
    }
  },

  createFee: async (req, res, next) => {
    try {
      const newFee = new Fees(req.body);
      const savedFee = await newFee.save();
      res.send(savedFee);
    } catch (err) {
      next(err);
    }
  },
};
