const { Users, Patients } = require("../db_models");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const bcrypt = require("bcrypt");
const transporter = require("../config/transporter");
const { decodeResetToken } = require("../utils/token");

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
      const token = jwt.sign(payload, "your-secret-key", { expiresIn: "1h" });
      return {
        error: false,
        data: { token: token, payload: payload },
      };
    } catch (error) {
      throw error;
    }
  }
  // Cambio de contraseña por usuario
  static async updatePassword(id, oldPassword, newPassword) {
    try {
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
  // Cambio de contraseña por token
  static async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetLink = `https://tuaplicacion.com/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: "jlema1990@gmail.com",
        to: email,
        subject: "Recuperación de contraseña",
        text: `¡Hola! Para restablecer tu contraseña, haz clic en el siguiente enlace: ${resetLink}`,
      };

      await transporter.sendMail(mailOptions);
      console.log(
        `Correo electrónico de recuperación de contraseña enviado a ${email}`
      );
    } catch (error) {
      throw error;
    }
  }
  static async updatePasswordWithToken(token, newPassword) {
    try {
      const secretKey = secret;
      const decodedToken = jwt.verify(token, secretKey);
      if (!decodedToken) {
        return {
          error: true,
          message: "Token inválido",
        };
      }
      const { userId } = decodedToken;
      const result = await AuthService.resetPassword(userId, newPassword);
      if (result.error) {
        return {
          error: true,
          message: "No se pudo actualizar la contraseña",
        };
      }
      return {
        error: false,
        message: "Contraseña actualizada exitosamente",
      };
    } catch (error) {
      throw error;
    }
  }
  static async resetPassword(userId, newPassword) {
    try {
      let user = await Users.findById(userId);
      if (!user) {
        return {
          error: true,
          message:
            "No se encontró ningún usuario con ese token de restablecimiento de contraseña.",
        };
      }
      user.password = newPassword;
      await user.save();
      return {
        error: false,
        data: user,
        message: "Contraseña actualizada correctamente.",
      };
    } catch (error) {
      throw error;
    }
  }
};
