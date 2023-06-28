const jwt = require("jsonwebtoken");
const AuthService = require("../services/auth_services");
const { generateResetToken } = require("../utils/token");
const { secret } = require("../config");


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
      return res.status(200).send(result.message);
    } catch (error) {
      next(error);
    }
  },
  sendPasswordResetEmail: async (req, res, next) => {
    const { userId } = req.params;
    const { email } = req.body;
    try {
      const resetToken = generateResetToken(userId);
      const result = await AuthService.sendPasswordResetEmail(
        email,
        resetToken
      );
      if (result.error) {
        return res.status(401).send(result.message);
      }
      return res.status(200).send(result.message);
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    const { token, newPassword } = req.body;
    try {
        const result = await AuthService.updatePasswordWithToken(
        token,
        newPassword
      )
      if (result.error) {
        return res
        .status(404)
        .send(result.message);
      }
      return res
      .status(200)
      .send(result.message);
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
