const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true, min: 0 },
  type: {
    type: String,
    required: true,
    enum: ["Presencial", "Virtual", "Ambos"],
  },
  currency: {
    type: String,
    required: true,
    enum: ["ARS", "USD"],
  },
  price: { type: Number, required: true, min: 0 },
  USDPrice: { type: Number,  },
  category: {
    type: String,
    required: true,
    enum: ["Particular", "Prepaga", "Obra social", "Otro"],
  },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  // relacion con otras colecciones  
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("services", schema);

module.exports = model;
