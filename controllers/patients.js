const { Patients } = require("../db_models");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyPatients: async (req, res, next) => {
    try {
      const _id = req.params._id;
      const patients = await Patients.find({ _id });
      res.send(fees);
    } catch (err) {
      next(err);
    }
  },
  createPatient: async (req, res, next) => {
    try {
      const newPatient = new Patients(req.body);
      const savedPatient = await newPatient.save();
      res.send(savedPatient);
    } catch (err) {
      next(err);
    }
  },
};
