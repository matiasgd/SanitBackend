const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../db_models");
const AuthService = require("../services/auth_services");

module.exports = {
  userLogin: async (req, res, next) => {
    try {
      const authDTO = { ...req.body };
      const response = await AuthService.userLogin(authDTO);
      if (!response.error) {        
        res.status(201).cookie("token", response.data.token).send(response.data.payload);
        } else {
        res.status(401).send(response.message);
      }
    } catch (error) {
      next(error);
    }
  },
  userLogout: (req, res) => {
    res.clearCookie("token");
    res.status(200).send("El usuario se ha desconectado correctamente!");
  },
  userMe: (req, res) => {
    res.send(req.user);
  },
};
