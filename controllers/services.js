const { Services } = require("../db_models");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyServices: async (req, res, next) => {
    try {
      const _id = req.params._id;
      const fees = await Services.find({ _id });
      res.send(fees);
    } catch (err) {
      next(err);
    }
  },

  createService: async (req, res, next) => {
    try {
      const newFee = new Services(req.body);
      const savedFee = await newFee.save();
      res.send(savedFee);
    } catch (err) {
      next(err);
    }
  },
};
