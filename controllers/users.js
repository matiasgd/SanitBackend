const { Users } = require("../db_models");
const mongoose = require("mongoose");

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
      // Validar el formato de _id utilizando mongoose
      if (!mongoose.isValidObjectId(_id)) {
        return res.status(404).send("Invalid user ID");
      }
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
    const { email, password } = req.body;
    // Verificar si el correo electrónico ya está en uso
    const existingUser = await Users.findOne({ email });
    if(existingUser) {
      return res.status(400).json({ error: "El correo electrónico ya está en uso" });
    }
    // Validar que se proporcionen todos los campos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: "Se deben proporcionar todos los campos requeridos" });
    }
    // Crear un nuevo usuario
    const newUser = new Users(req.body);
    await newUser.save();
    res.status(201).send({
      user: newUser,  
      message:"El usuario se ha creado correctamente!"});
  } catch (err) {
    next(err);
  }
},

  updateUser: async (req, res, next) => {
    try {
      const _id = req.params._id;
      // Validar el formato de _id utilizando mongoose
      if (!mongoose.isValidObjectId(_id)) {
        return res.status(404).send("Invalid user ID");
      }
      const user = await Users.findOne({ _id });
      if (!user) {
        return res.status(404).send("User not found");
      }
      // Obtener los campos y sus nuevos valores del cuerpo de la solicitud
      const updateFields = req.body;
      // Recorrer los campos y actualizar el objeto del usuario
      Object.keys(updateFields).forEach((field) => {
        user[field] = updateFields[field];
      });
      const updatedUser = await user.save();
      res.send(updatedUser);
    } catch (err) {
      next(err);
    }
  },

  // RUTAS GENERALES DE PEDIDO DELETE
  deleteUser: async (req, res, next) => {
    try {
      const doctorId = req.params._id;
      const doctor = await Users.findOne({ _id: doctorId });
      // verificacion si el ID enviado por params no existe en la DB
      if (!doctor) {
        return res.status(404).send("Doctor no encontrado");
      }
      // eliminacion si el servicio existe
      const removedUser = await Users.findOneAndDelete({
        _id: doctorId,
      });
      res.status(200).send(removedUser);
    } catch (err) {
      next(err);
    }
  },
};
