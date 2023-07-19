const mongoose = require("mongoose");
const Users = require("../db_models/Users");

// Función para validar el formato de fecha (MM/DD/YYYY)
function isValidDate(dateString) {
  const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
  return dateRegex.test(dateString);
}

// Función para validar el género (Masculino, Femenino, Otro)
function isValidGender(gender) {
  const validGenders = ["Masculino", "Femenino", "Otro"];
  return validGenders.includes(gender);
}

// Función para validar el formato de dirección de correo electrónico
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar el formato de un ID de MongoDB
function checkIdFormat(id) {
  if (!mongoose.isValidObjectId(id)) {
    return { error: true, message: "El ID es inválido" };
  }
  return { error: false };
}

// Validar caracteres especiales en una cadena
function validateSpecialCharacters(str) {
  const regex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
  return regex.test(str);
}

// Validar longitud mínima del password
function validatePasswordLength(password, minLength) {
  return password.length >= minLength;
}

// Validar cantidad de intentos de inicio de sesión
async function validateLoginAttempts(info, maxAttempts) {
  try {
    const user = await Users.findOne({ email: info });
    const loginAttempts = user.attempts_count;
    if (loginAttempts >= maxAttempts) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return true;
  }
}

// Función para registrar un intento de inicio de sesión
async function registerLoginAttempt(email) {
  try {
    const loginAttempts = await Users.findOne({ email: email });

    if (loginAttempts) {
      loginAttempts.attempts_count += 1;
      loginAttempts.last_attempt_time = new Date();
      await loginAttempts.save();
    } else {
      await Users.updateOne(
        { email: email },
        {
          $set: {
            attempts_count: 1,
            last_attempt_time: new Date(),
          },
        }
      );
    }
  } catch (error) {
    console.error(error);
  }
}

// Función para registrar un intento de inicio de sesión
async function deleteLoginAttempts(email) {
  try {
    const user = await Users.findOne({ email: email });
    user.$set({
      attempts_count: 0,
      last_attempt_time: null,
    });
    await user.save();
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  isValidDate,
  isValidGender,
  isValidEmail,
  checkIdFormat,
  validateSpecialCharacters,
  validatePasswordLength,
  validateLoginAttempts,
  registerLoginAttempt,
  validateLoginAttempts,
  deleteLoginAttempts,
};
