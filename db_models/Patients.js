const mongoose = require("mongoose");
const { Schema } = mongoose;
const Addresses = require("./Addresses");


const schema = Schema({
  email: { type: String, required: true, unique: true },
  govermentId: { type: String },
  name: { type: String},
  lastName: { type: String },
  birthdate: { type: Date },
  gender: {type: String,},
  cellphone: { type: String },
  country: { type: String },
  province: { type: String },
  healthInsurance: { type: String },
  // datos de doctor
  doctors: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      autopopulate: true,
    },
  ],
  previousDoctors: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      autopopulate: true,
    },
  ],
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("patients", schema);

module.exports = model;
