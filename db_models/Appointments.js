const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  startTime: { type: Date, required: true }, // Fecha y hora de inicio de la cita
  endTime: { type: Date, required: true }, // Fecha y hora de fin de la cita
  status: {
    type: String,
    enum: ["Pending", "Completed", "Canceled", "Skipped"],
    required: true,
    default: "Pending",
  },
  cancelReason: { type: String, default: null },
  // relacion con otras colecciones
  patient: { type: Schema.Types.ObjectId, ref: "patients", required: true },
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
  address: { type: Schema.Types.ObjectId, ref: "addresses", required: true },
  service: { type: Schema.Types.ObjectId, ref: "services", required: true },
  category: {
    type: String,
    required: true,
    enum: [
      "Union insurance",
      "Private insurance",
      "Without insurance",
      "Other",
    ],
  },
  type: {
    type: String,
    required: true,
    enum: ["In office", "Online"],
  },
  // datos de precio
  servicePrice: { type: Number, required: true },
  appointmentPrice: { type: Number, required: true },
  currency: {
    type: String,
    required: true,
    enum: ["ARS", "USD"],
  },
  // datos de pago
  paymentStatus: {
    type: String,
    enum: ["Partial", "Completed", "Pending"],
    required: true,
    default: "Pending",
  },
  partialPayment: { type: Number, default: null },
  paymentDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now() },
  notes: { type: String, default: null },
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
