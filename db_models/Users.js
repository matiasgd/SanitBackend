const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, unique: true },
  name: { type: String },
  lastName: { type: String },
  gender: { type: String, required: true },
  role: { type: String, default: "user" },
  address: { type: String },
  country: { type: String },
  cellphone: { type: String },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("users", schema);

module.exports = model;
