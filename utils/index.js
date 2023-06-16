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

module.exports = {
  isValidDate,
  isValidGender,
  isValidEmail,
};
