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

  findOneUser: async (req, res, next) => {
    try {
      const _id = req.params._id;
      const user = await Users.findOne({ _id });
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.send(user);
    } catch (err) {
      next(err);
    }
  },

  createOneUser: async (req, res, next) => {
    try {
      const newUser = new Users(req.body);
      const savedUser = await newUser.save();
      res.send(savedUser);
    } catch (err) {
      next(err);
    }
  },
};
