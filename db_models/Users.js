const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const { Schema } = mongoose;

const schema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, unique: true },
  name: { type: String },
  lastName: { type: String },
  gender: { type: String, required: true },
  role: { type: String, default: "user" },
  address: { type: String },
  country: { type: String },
  cellphone: { type: String },
});

// Hook pre-save para encriptar la contraseña antes de guardarla
schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(this.password, salt);
    this.password = passwordHash;
    next();
  } catch (error) {
    return next(error);
  }
});

// Método para comparar contraseñas encriptadas
schema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Método para generar un token JWT
schema.methods.generateJWT = function () {
  const payload = {
    id: this._id,
    email: this.email,
  };
  // Generar y retornar el token JWT
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("users", schema);

module.exports = model;
