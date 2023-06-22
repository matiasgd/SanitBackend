const mongoose = require("mongoose");
const { Schema } = mongoose;
//const { isEmail } = require("validator");

const schema = Schema({
  date: { type: String, required: true },
  timeOfAppointment: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pendiente", "Completada", "Cancelada"],
    required: true,
    default: "Pendiente",
  },
  cancelReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now() },
  // users and patients
  patient: { type: Schema.Types.ObjectId, ref: "patients", required: true },
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("appointments", schema);

module.exports = model;



