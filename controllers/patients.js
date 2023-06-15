const { Patients, Users } = require("../db_models");
const mongoose = require("mongoose");

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
      const doctorId = req.params.doctorId.toString();
      const email = req.body.email;
      let patient = await Patients.findOne({ email });
      let doctor = await Users.findOne({ _id: doctorId });

      if (patient) {
        // El paciente ya existe, verificamos si el médico ya está asignado
        const isDoctorAssigned = patient.doctors.some((docId) =>
          docId.equals(doctorId)
        );
        if (!isDoctorAssigned) {
          // El médico no está asignado al paciente, lo agregamos al array de médicos
          patient.doctors.push(doctorId);
          await patient.save();
          doctor.patients.push(patient._id.toString());
          await doctor.save();
        }
      } else {
        // El paciente no existe, creamos un nuevo registro
        patient = await Patients.create({ ...req.body, doctors: [doctorId] })
        doctor.patients.push(patient._id.toString());
        await doctor.save();
      }
      res.status(200).send(patient);
    } catch (err) {
      next(err);
    }
  },

  // RUTAS GENERALES DE PEDIDO PUT
  updatePatient: async (req, res, next) => {
    try {

      const patientId = req.params.patientId;
      const patient = await Patients.findOne({ _id: patientId });
      // verificacion si el ID enviado por params no existe en la DB
      if(!patient){
        return res.status(404).send("Paciente no encontrado");
      }
      if(patient.doctors.length > 1){
        return res.status(404).send("El paciente tiene más de un médico asignado, no se puede actualizar");
      }
      // actualizacion si el paciente existe
      const updatedPatient = await Patients.findOneAndUpdate(
        { _id: patientId },
        req.body,
        { new: true }
      );
      res.status(200).send(updatedPatient);
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

      // Busco si existe el ID del medico en el array de ObjectID de doctors
      const doctorIndex = patient.doctors.findIndex(
        (doctor) => {
          return (
            doctor._id.toString() ==
            new mongoose.Types.ObjectId(doctorIdToRemove)._id.toString()
          );}
      );  
      // si es -1 significa que no esta asociado
      if (doctorIndex === -1) {
        return res
          .status(404)
          .send("El médico no está asociado a este paciente");
      }
      // si esta asociado procedo a mover el medico a previousDoctors
      patient.previousDoctors.push(patient.doctors[doctorIndex]);
      patient.doctors.splice(doctorIndex, 1);
      await patient.save();
      res.status(200).send("Médico eliminado visualmente del paciente");
    } catch (err) {
      next(err);
    }
  },
};
