const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  // datos obligatorios de registro
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  govermentId: { type: String },
  birthdate: { type: Date },
  age: { type: Number }, // Calculado en el hook pre-save
  nationality: { type: String },
  email: { type: String, required: true, unique: true },
  gender: { type: String },
  // phone number
  codCountry: { type: String },
  codArea: { type: String },
  cellphone: { type: String },
  // address
  country: { type: String },
  state: { type: String },
  city: { type: String },
  street: { type: String },
  streetNumber: { type: String },
  addressType: { type: String, enum: ["House", "Appartment"] },
  addressFloor: { type: String },
  zipCode: { type: String },
  // datos seguro medico
  healthInsurance: { type: String },
  healthInsuranceNumber: { type: String },
  privateHealthInsurance: { type: String },
  privateHealthInsuranceNumber: { type: String },
  // datos de contacto de emergencia
  contactName: { type: String },
  contactLastName: { type: String },
  contactRelationship: { type: String },
  contactPhone: { type: String },
  // datos de doctor
  doctors: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      //autopopulate: true,
    },
  ],
  previousDoctors: [
    {
      type: Schema.Types.ObjectId,
      ref: "users",
      //autopopulate: true,
    },
  ],
  createdAt: { type: Date, default: Date.now() },
});

// Hook para calcular la edad antes de guardar
schema.pre("save", function (next) {
  if (this.birthdate) {
    const currentDate = new Date();
    const birthdate = new Date(this.birthdate);
    const age = currentDate.getFullYear() - birthdate.getFullYear();

    // Verificar si el cumpleaños ya pasó en el año actual
    const currentMonth = currentDate.getMonth() + 1;
    const birthMonth = birthdate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    const birthDay = birthdate.getDate();

    if (
      currentMonth < birthMonth ||
      (currentMonth === birthMonth && currentDay < birthDay)
    ) {
      // Restar un año si el cumpleaños no ha pasado
      this.age = age - 1;
    } else {
      this.age = age;
    }
  }
  next();
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("patients", schema);

module.exports = model;
