const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const { Schema } = mongoose;

const schema = Schema({
  // datos obligatorios de registro
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordResetToken: { type: String, default: null },
  role: { type: String, default: "user" },
  // datos de primer login y registro
  name: { type: String },
  lastName: { type: String },
  identityType: { type: String },
  identityNumber: { type: Number },
  birthdate: { type: Date },
  gender: { type: String },
  cellphone: { type: String },
  country: { type: String },
  province: { type: String },
  city: { type: String },
  field: { type: String },
  specialty: { type: String },
  medicalRegistration: { type: Number }, 
  // perfil completo booleano
  profileCompleted: { type: Boolean, default: false },
  // pacientes
  patients: [
    {
      type: Schema.Types.ObjectId,
      ref: "patients",
      //autopopulate: true,
    },
  ],
  previousPatients: [
    {
      type: Schema.Types.ObjectId,
      ref: "patients",
      //autopopulate: true,
    },
  ],
  // consultorios
  addresses: [
    {
      type: Schema.Types.ObjectId,
      ref: "addresses",
    },
  ],
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
