const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  value: { type: Number, required: true },
  currency: { type: String, required: true, default: "AR$" },
  frequency: {
    type: String,
    enum: ["Semanal", "Bisemanal", "Quincenal", "Mensual", "Otro"],
  },
  active: { type: Boolean, required: true },
  createdSince: { type: Date, required: true, default: Date.now },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("fees", schema);

module.exports = model;
