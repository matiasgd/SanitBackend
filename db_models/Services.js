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
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ["Particular", "Prepaga", "Obra social", "Otro"],
  },
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("services", schema);

module.exports = model;
