const jwt = require("jsonwebtoken");
const AuthService = require("../services/auth_services");
const { generateResetToken } = require("../utils/token");

module.exports = {
  userLogin: async (req, res, next) => {
    try {
      const authDTO = { ...req.body };
      const response = await AuthService.userLogin(authDTO);
      if (response.error) {
        return res.status(401).send(response.message);
      }
      res
        .status(201)
        .cookie("token", response.data.token)
        .send(response.data.payload);
    } catch (error) {
      next(error);
    }
  },
  recoverPassword: async (req, res, next) => {
    const { email } = req.body;
    try {
      const result = await AuthService.recoverPassword(email);
      if (result.error) {
        return res.status(400).send({
          error: result.error,
          message: result.message,
        });
      }
      return res.status(201).send({
        error: result.error,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  },
  resetPassword: async (req, res, next) => {
    const { userId, password, confirmPassword } = req.body;
    try {
      const result = await AuthService.updatePasswordWithToken(
        userId,
        confirmPassword,
        password
      );
      if (result.error) {
        return res.status(400).send(result.message);
      }
      return res.status(201).send(result.message);
    } catch (error) {
      next(error);
    }
  },
  updatePassword: async (req, res, next) => {
    try {
      const id = req.params.userId;
      const { oldPassword, newPassword } = req.body;
      const result = await AuthService.updatePassword(
        id,
        oldPassword,
        newPassword
      );
      if (result.error) {
        return res.status(401).send(result.message);
      }
      return res.status(201).send(result.message);
    } catch (error) {
      next(error);
    }
  },
  userLogout: (req, res) => {
    res.clearCookie("token", {
      path: "/",
    });
    res.status(200).send("Sesión finalizada.");
  },
  userMe: (req, res) => {
    res.send(req.user);
  },
};
