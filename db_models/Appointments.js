const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  date: { type: String, required: true },
  timeOfAppointment: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Canceled"],
    required: true,
    default: "Pending",
  },
  cancelReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now() },
  // relacion con otras colecciones
  patient: { type: Schema.Types.ObjectId, ref: "patients", required: true },
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
  address: { type: Schema.Types.ObjectId, ref: "addresses", required: true },
  service: { type: Schema.Types.ObjectId, ref: "services", required: true },
  category: {
    type: String,
    required: true,
    enum: ["Particular", "Prepaga", "Obra social", "Otro"],
  },
  type: {
    type: String,
    required: true,
    enum: ["In person", "Online"],
  },
  // datos de precio
  servicePrice: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
  currency: {
    type: String,
    required: true,
    enum: ["ARS", "USD"],
  },
  // datos de pago
  paymentMethod: {
    type: String,
    enum: ["Cash", "DebitCard", "CreditCard", "MercadoPago"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Rejected"],
    required: true,
    default: "Pending",
  },
  paymentDate: { type: Date, default: null },
});

// Agrega el hook para actualizar la fecha del cambio en operaciones de actualización
schema.pre("findOneAndUpdate", function (next) {
  // Verifica si el campo "paymentStatus" ha sido modificado
  if (this._update.paymentStatus) {
    // Actualiza la fecha del cambio a la fecha actual
    this._update.paymentDate = new Date();
  }
  next();
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("appointments", schema);

module.exports = model;
