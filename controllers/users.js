const { Users } = require("../db_models");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getAll: async (req, res, next) => {
    try {
      const users = await Users.find();
      res.send(users);
    } catch (err) {
      next(err);
    }
  },
};
