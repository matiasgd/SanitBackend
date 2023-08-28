const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const { Schema } = mongoose;

const schema = Schema({
  // datos obligatorios de registro
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // recupero de password
  passwordResetToken: { type: String, default: null },
  role: { type: String, default: "user" },
  attempts_count: { type: Number, default: 0 },
  last_attempt_time: { type: Date, default: null },
  // datos de primer login y registro
  name: { type: String, default: null },
  lastName: { type: String, default: null },
  identityType: { type: String, default: null },
  identityNumber: { type: Number, default: null },
  birthdate: { type: Date, default: null },
  gender: { type: String, default: null },
  cellphone: { type: String, default: null },
  country: { type: String, default: null },
  province: { type: String, default: null },
  city: { type: String, default: null },
  field: { type: String, default: null },
  specialty: { type: String, default: null },
  medicalRegistration: { type: Number, default: null },
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
