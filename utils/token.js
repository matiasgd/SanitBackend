const jwt = require("jsonwebtoken");
const { secret } = require("../config");

const generateResetToken = (userId) => {
  const secretKey = secret
  const expiresIn = "1h"
  const token = jwt.sign({ userId }, secretKey, { expiresIn });
  return token;
};

const decodeResetToken = (token) => {
  try {
    const secretKey = secret
    const decodedToken = jwt.verify(token, secretKey);
    return decodedToken;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateResetToken,
  decodeResetToken,
};