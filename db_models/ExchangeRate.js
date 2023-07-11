const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  date: { type: Date, default: Date.now() },
  type: { type: String, required: true },
  pair: { type: String, required: true },
  buyer: { type: Number, required: true},
  seller: { type: Number, required: true},
  average: { type: Number},
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("ExchangeRate", schema);


schema.pre("save", function (next) {
  const buyer = this.buyer;
  const seller = this.seller;

  // Calcular el promedio solo si buyer y seller tienen valores
  if (buyer !== undefined && seller !== undefined) {
    this.average = (buyer + seller) / 2;
  } else if (buyer !== undefined) {
    this.average = buyer;
  } else if (seller !== undefined) {
    this.average = seller;
  }
  next();
});

module.exports = model;
