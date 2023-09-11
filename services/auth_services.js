const { Users } = require("../db_models");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const bcrypt = require("bcrypt");
const transporter = require("../config/transporter");
const { decodeResetToken, generateResetToken } = require("../utils/token");
const {
  registerLoginAttempt,
  validateLoginAttempts,
  deleteLoginAttempts,
} = require("../utils/validations");
const { corsOrigin, sanitEmail } = require("../config");
const mongoose = require("mongoose");

module.exports = class AuthService {
  static async userLogin(authDTO) {
    try {
      const { email, password } = authDTO;
      // Validar que se proporcionen todos los campos requeridos
      if (!email || !password) {
        return {
          error: true,
          message: "Faltan campos obligatorios",
        };
      }
      // Validar que el usuario no haya superado el límite de intentos de inicio de sesión
      const isAllowed = await validateLoginAttempts(email, 3);
      if (!isAllowed) {
        return {
          error: true,
          message: "Se ha superado el límite de intentos de inicio de sesión",
        };
      }

      // buscar el usuario en la base de datos
      const user = await Users.findOne({ email: email });
      if (!user) {
        return {
          error: true,
          message: "Credenciales incorrectas",
        };
      }

      // comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // registrar el intento de inicio de sesión
        await registerLoginAttempt(email);
        return {
          error: true,
          message: "Credenciales incorrectas",
        };
      }

      // Crear el token
      const payload = {
        id: user._id,
        email: user.email,
        profileCompleted: user.profileCompleted,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "1h" });
      // eliminar los intentos de inicio de sesión
      await deleteLoginAttempts(email);
      return {
        error: false,
        data: { token: token, payload: payload },
      };
    } catch (error) {
      throw error;
    }
  }
  // recuperar contraseña por email
  static async recoverPassword(email) {
    try {
      const user = await Users.findOne({ email: email });
      if (!user) {
        return {
          error: true,
          message: "El email no se encuentra registrado",
        };
      }
      const resetToken = generateResetToken(user._id);
      const base64EncodedToken = btoa(resetToken);
      const resetLink = `${corsOrigin}/reset-password/${base64EncodedToken}`;
      const mailOptions = {
        from: sanitEmail,
        to: email,
        subject: "Recuperación de contraseña",
        text: `¡Hola! Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetLink}`,
      };
      await transporter.sendMail(mailOptions);
      return {
        error: false,
        message:
          "Se ha enviado un correo electrónico para restablecer la contraseña",
      };
    } catch (error) {
      throw error;
    }
  }
  static async updatePasswordWithToken(userId, password, confirmedPassword) {
    try {
      if (password !== confirmedPassword) {
        return {
          error: true,
          message: "Las contraseñas no coinciden",
        };
      }
      const user = await Users.findById(userId);
      if (!user) {
        return {
          error: true,
          message: "No se encontró ningún usuario con el ID.",
        };
      }
      user.password = confirmedPassword;
      const updatedUser = await user.save();

      const mailOptions = {
        from: sanitEmail,
        to: user.email,
        subject: "Cambio de contraseña exioso!",
        text: `¡Hola! logras cambiar tu contraseña exitosamente!`,
      };
      await transporter.sendMail(mailOptions);

      return {
        error: false,
        data: updatedUser,
        message: "Contraseña actualizada correctamente.",
      };
    } catch (error) {
      throw error;
    }
  }

  // Cambio de contraseña por usuario
  static async updatePassword(id, oldPassword, newPassword) {
    try {
      console.log(id, "id");
      console.log(oldPassword, "oldPassword");
      console.log(newPassword, "newPassword");
      // Verificar que el usuario exista
      const user = await Users.findById(id);
      if (!user) {
        return {
          error: true,
          message: "El usuario no existe",
        };
      }
      // Verificar que la contraseña antigua coincida
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return {
          error: true,
          message:
            "La contraseña ingresada no coincide con la contraseña actual",
        };
      }
      // Generar el hash de la nueva contraseña
      user.password = newPassword;
      const updatedUser = await user.save();
      return {
        error: false,
        data: updatedUser,
        message: "La contraseña se ha actualizado correctamente",
      };
    } catch (error) {
      throw error;
    }
  }
};
