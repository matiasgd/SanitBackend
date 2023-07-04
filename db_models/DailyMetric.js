const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema({
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "addresses",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  appointments: {
    type: Number,
    required: true,
  },
  fees: {
    type: Number,
    required: true,
  },
});

schema.plugin(require("mongoose-autopopulate"));
const model = mongoose.model("dailyMetrics", schema);

module.exports = model;
