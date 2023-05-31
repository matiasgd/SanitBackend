const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  patient: { type: Schema.Types.ObjectId, ref: "users", required: true },
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  fee: { type: Schema.Types.ObjectId, ref: "fees", required: true },
  address: { type: Schema.Types.ObjectId, ref: "addresses", required: true },
  services: { type: Schema.Types.ObjectId, ref: "services", required: true },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("appointments", schema);

module.exports = model;

