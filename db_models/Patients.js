const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  email: { type: String, required: true, unique: true },
  govermentId: { type: String },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  birthdate: { type: Date },
  age: { type: Number }, // Nueva propiedad para almacenar la edad
  gender: { type: String },
  cellphone: { type: String },
  country: { type: String },
  province: { type: String },
  city: { type: String },
  address: { type: String },
  healthInsurance: { type: String },
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
  services: [
    {
      type: Schema.Types.ObjectId,
      ref: "services",
      //autopopulate: true,
    },
  ],
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
    
    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
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
