const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  appointment: {
    type: Schema.Types.ObjectId,
    ref: "appointments",
    required: true,
  },
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
  patient: { type: Schema.Types.ObjectId, ref: "patients", required: true },
  amount: { type: Number, required: true },
  currency: {
    type: String,
    required: true,
    enum: ["ARS", "USD"],
  },
  amountUSD: { type: Number },
  exchangeRate: { type: Number },
  method: {
    type: String,
    enum: ["Cash", "DebitCard", "CreditCard", "MercadoPago"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Full", "Partial"],
    required: true,
    default: "Pending",
  },
  paymentDate: { type: Date },
  date: { type: Date, default: Date.now() },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("payments", schema);

module.exports = model;
