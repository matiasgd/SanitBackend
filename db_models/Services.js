const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  type: {
    type: [String], 
    required: true,
    enum: ["Presencial", "Virtual", "Ambos"],
  },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("services", schema);

module.exports = model;
