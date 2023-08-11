const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  addressName: { type: String, required: true },
  doctor: { type: Schema.Types.ObjectId, ref: "users" },
  street: { type: String },
  number: { type: Number },
  floor: { type: Number },
  addressType: { type: String },
  webAddress: { type: String },
  houseApartment: { type: String },
  country: { type: String },
  province: { type: String },
  city: { type: String },
  zipCode: { type: Number },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("addresses", schema);

module.exports = model;
