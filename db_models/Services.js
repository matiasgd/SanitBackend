const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  serviceName: { type: String, required: true, unique: true },
  description: { type: String },
  duration: { type: Number, required: true, min: 0 },
  currency: {
    type: String,
    required: true,
    enum: ["ARS", "USD"],
    default: "ARS",
  },
  price: { type: Object, required: true },
  USDPrice: { type: Number },
  createdAt: { type: Date, default: Date.now() },
  // relacion con otras colecciones
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
  status: { type: Boolean, default: true },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("services", schema);

module.exports = model;
