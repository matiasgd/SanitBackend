const { Patients } = require("../db_models");

module.exports = {
  // RUTAS GENERALES DE PEDIDO GET
  getMyPatients: async (req, res, next) => {
    try {
      const doctorId = req.params._id;
      const patients = await Patients.find({ doctor: doctorId })
        .populate("address")
        .populate("doctor");
      res.status(200).send(patients);
    } catch (err) {
      next(err);
    }
  },
  // RUTAS GENERALES DE PEDIDO POST
  createPatient: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      // Verificar si el paciente ya existe en el sistema
      let patient = await Patients.findOne({ localId: req.body.localId });
      if (patient) {
        // El paciente ya existe, agregamos el nuevo médico al array de médicos
        patient.doctors.push(doctorId);
        await patient.save();
      } else {
        // El paciente no existe, creamos un nuevo registro
        patient = await Patients.create({ ...req.body, doctors: [doctorId] });
      } 
      res.status(200).send(patient);
    } catch (err) {
      next(err);
    }
  },
  // RUTAS GENERALES DE PEDIDO DELETE
  removeDoctorFromPatient: async (req, res, next) => {
    try {
      const patientId = req.params.patientId;
      const doctorIdToRemove = req.params.doctorId;

      const patient = await Patients.findById(patientId);
      if (!patient) {
        return res.status(404).send("Paciente no encontrado");
      }

      const doctorIndex = patient.doctors.indexOf(doctorIdToRemove);
      if (doctorIndex === -1) {
        return res
          .status(404)
          .send("El médico no está asociado a este paciente");
      }

      patient.previousDoctors.push(patient.doctors[doctorIndex]);
      patient.doctors.splice(doctorIndex, 1);
      await patient.save();

      res.status(200).send("Médico eliminado visualmente del paciente");
    } catch (err) {
      next(err);
    }
  },
};
