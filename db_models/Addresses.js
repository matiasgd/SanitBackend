const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  idUser: { type: Schema.Types.ObjectId, ref: "users" },
  street: { type: String, required: true },
  streetNumber: { type: Number, required: true },
  floor: { type: Number },
  letter: { type: String },
  country: { type: String },
  province: { type: String },
  neighborhood: { type: String },
  zipCode: { type: Number },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("addresses", schema);

module.exports = model;
