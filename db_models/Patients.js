const mongoose = require("mongoose");
const { Schema } = mongoose;
const Addresses = require("./Addresses");


const schema = Schema({
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  localId: { type: String },
  birthdate: { type: Date },
  email: { type: String, required: true, unique: true },
  gender: {
    type: String,
    enum: ["Masculino", "Femenino", "Otro"],
  },
  country: { type: String },
  cellphone: { type: String },
  // datos address
  street: { type: String, required: true },
  streetNumber: { type: Number, required: true },
  floor: { type: Number },
  letter: { type: String },
  country: { type: String },
  province: { type: String },
  neighborhood: { type: String },
  zipCode: { type: Number },
  address: {
    type: Schema.Types.ObjectId,
    ref: "addresses",
    autopopulate: true,
  },
  // datos de doctor
  doctors: {
    type: [String],
  },
  previousDoctors: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      autopopulate: true,
    },
  ],
});

// Hook post-save para crear la dirección después de guardar el paciente
schema.post("save", async function (doc) {
  try {
    if (!doc.address) {
      const address = new Addresses({
        street: doc.street,
        streetNumber: doc.streetNumber,
        floor: doc.floor,
        letter: doc.letter,
        country: doc.country,
        province: doc.province,
        neighborhood: doc.neighborhood,
        zipCode: doc.zipCode,
      });
      await address.save();
      doc.address = address._id;
      await doc.save();
    }
  } catch (error) {
    console.error("Error creating address:", error);
  }
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("patients", schema);

module.exports = model;
