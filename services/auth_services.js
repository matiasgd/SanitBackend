const { Users, Patients } = require("../db_models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

module.exports = class AuthService {
  static async userLogin(authDTO) {
    try {
      const { email, password } = authDTO;
      // Validar que se proporcionen todos los campos requeridos
      if (!email || !password) {
        return { 
          error: true, 
          message: "Faltan campos obligatorios" }
      }
      // buscar el usuario en la base de datos
      const user = await Users.findOne({ email: email });
      if (!user) {
          return {
            error: true,
            message: "credenciales incorrectas",
          };
      }
      // comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { 
           error: true, 
           message: "credenciales incorrectas" 
          }
        }
      // Crear el token
      const payload = { id: user._id, email: user.email }
      const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
      return {
        error: false,
        data: { token: token, payload: payload },
      };
    } catch (error) {
      throw error;
    }
  }
}

