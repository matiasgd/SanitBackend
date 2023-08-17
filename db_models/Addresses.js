const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  doctor: { type: Schema.Types.ObjectId, ref: "users", required: true },
  addressName: { type: String, required: true },
  street: { type: String, required: true },
  number: { type: Number, required: true },
  floor: { type: String },
  addressType: { type: String },
  webAddress: { type: String },
  houseApartment: { type: String },
  country: { type: String },
  province: { type: String },
  city: { type: String },
  closingTime: {
    type: String,
  },
  startingTime: {
    type: String,
  },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("addresses", schema);

module.exports = model;
