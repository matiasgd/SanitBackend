const AppointmentsService = require("../services/appointment_services");
const MonthlyMetricsService = require("../services/monthlyMetrics_services");
const DailyMetricsService = require("../services/dailyMetrics_services");
const exchangeRateService = require("../services/exchangeRate_services");
const chance = require("chance").Chance();
const {
  Appointments,
  Users,
  Services,
  Addresses,
} = require("../db_models/index");

module.exports = {
  getAppointmentById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const appointment = await AppointmentsService.findAppointmentById(id);

      if (appointment.error) {
        return res.status(appointment.status).send({
          message: appointment.message,
        });
      }
      res.status(appointment.status).send({
        appointment: appointment.data,
        message: appointment.message,
      });
    } catch (err) {
      next(err);
    }
  },

  getAppointmentByDoctorId: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await AppointmentsService.getAppointmentByDoctorId(id);
      result.error
        ? res.status(result.status).send({
            data: result.data,
            message: result.message,
          })
        : res.status(result.status).send({
            data: result.data,
            message: result.message,
          });
    } catch (err) {
      next(err);
    }
  },

  getAvailableAppointmentsByDoctorId: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { date } = req.body;
      const appointments = await AppointmentsService.getAvailableAppointments(
        id,
        date
      );

      if (appointments.error) {
        return res.status(400).send(appointments.message);
      }
      res.status(201).send({
        appointments: appointments.data,
        message: appointments.message,
      });
    } catch (err) {
      next(err);
    }
  },
  seedAppointments: async (req, res, next) => {
    try {
      const doctorId = req.params.doctorId;
      const user = await Users.findById(doctorId);
      const addresses = await Addresses.find({ doctor: doctorId });
      const services = await Services.find({ doctor: doctorId });
      const patients = await Users.find({ doctor: doctorId });

      const numAppointments = req.body.numAppointments;
      const numPatients = patients.length;
      const numCompletedAppointments = chance.integer({
        min: 0,
        max: numAppointments,
      });

      const appointments = [];

      for (let i = 0; i < numAppointments; i++) {
        const isCompleted = i < numCompletedAppointments;
        const randomPatientIndex = chance.integer({
          min: 0,
          max: numPatients - 1,
        }); // Índice aleatorio para seleccionar paciente

        const oneWeekFromNow = new Date();
        const randomDate = chance.date({
          year: oneWeekFromNow.getFullYear(),
          month: oneWeekFromNow.getMonth(),
          day: oneWeekFromNow.getDate(),
        });

        const appointmentData = {
          startTime: randomDate, // Fecha y hora de inicio aleatoria dentro de la próxima semana
          endTime: new Date(
            randomDate.getTime() + chance.integer({ min: 15, max: 240 }) * 60000
          ), // Agregar entre 15 y 240 minutos

          status: chance.pickone(["Pending", "Completed", "Canceled"]),
          patient: patients[randomPatientIndex]._id,
          doctor: doctorId,
          address: addresses[0]._id, // Asigna una dirección (cambiar esto según tu lógica)
          service: services[0]._id, // Asigna un servicio (cambiar esto según tu lógica)
          category: chance.pickone([
            "Union insurance",
            "Private insurance",
            "Without insurance",
            "Other",
          ]),
          type: chance.pickone(["In office", "Online"]),
          servicePrice: chance.integer({ min: 5000, max: 50000 }), // Cambia según tus necesidades
          appointmentPrice: chance.integer({ min: 5000, max: 50000 }), // Cambia según tus necesidades
          currency: "ARS",
          paymentMethod: chance.pickone([
            "Cash",
            "DebitCard",
            "CreditCard",
            "MercadoPago",
          ]),
          paymentStatus: isCompleted ? "Completed" : "Pending", // Establece aleatoriamente el estado de pago
        };

        const appointment = new Appointments(appointmentData);
        appointments.push(appointment);
      }

      await Promise.all(appointments.map((appointment) => appointment.save()));
      await user.save();

      res.status(201).json({
        message: `${numAppointments} citas generadas y asociadas al doctor.`,
        data: appointments,
      });
    } catch (error) {
      console.error("Error al guardar citas:", error);
      res.status(500).json({
        error: "Error al generar citas.",
      });
    }
  },
  createAppointment: async (req, res, next) => {
    try {
      const appointmentDTO = { ...req.body };
      const result = await AppointmentsService.createAppointment(
        appointmentDTO
      );
      result.error
        ? res.status(result.status).send({
            data: result.data,
            message: result.message,
          })
        : res.status(result.status).send({
            data: result.data,
            message: result.message,
          });
    } catch (err) {
      next(err);
    }
  },
  updateAppointment: async (req, res, next) => {
    try {
      const appointmentId = req.params.appointmentId;
      const appointmentDTO = { ...req.body };
      const updatedAppointment = await AppointmentsService.updateAppointment(
        appointmentId,
        appointmentDTO
      );
      if (updatedAppointment.error) {
        return res.status(400).send(updatedAppointment.message);
      }
      res.status(201).send({
        appointment: updatedAppointment.data,
        message: updatedAppointment.message,
      });
    } catch (err) {
      next(err);
    }
  },
  confirmAppointment: async (req, res, next) => {
    try {
      const appointmentId = req.params.appointmentId;
      const appointmentDTO = { ...req.body };
      // Actualiza la cita
      const updatedAppointment = await AppointmentsService.updateAppointment(
        appointmentId,
        appointmentDTO
      );
      if (updatedAppointment.error) {
        return res.status(400).send(updatedAppointment.message);
      }
      // Actualiza los modelos de métricas mensuales y diarias
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Actualiza el modelo de métricas mensuales
      const updatedMonthlyMetrics = await MonthlyMetricsService.cancelations(
        appointmentId,
        month,
        year
      );
      console.log(updatedMonthlyMetrics);

      // Actualiza el modelo de métricas diarias
      const updateDailyMetrics = await DailyMetricsService.cancelations(
        appointmentId
      );

      if (updatedMonthlyMetrics.error || updateDailyMetrics.error) {
        return res
          .status(400)
          .send(updatedMonthlyMetrics.message || updateDailyMetrics.message);
      }

      res.status(201).send({
        appointment: updatedAppointment.data,
        MonthlyMetrics: updatedMonthlyMetrics.data,
        DailyMetrics: updateDailyMetrics.data,
        message: updatedAppointment.message,
      });
    } catch (err) {
      next(err);
    }
  },
  confirmPayment: async (req, res, next) => {
    try {
      const appointmentId = req.params.appointmentId;
      const appointmentDTO = { ...req.body };

      // Actualiza la cita
      const updatedAppointment = await AppointmentsService.updateAppointment(
        appointmentId,
        appointmentDTO
      );
      if (updatedAppointment.error) {
        return res.status(400).send(updatedAppointment.message);
      }
      // Actualiza los modelos de métricas mensuales y diarias
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      // Obtener tipo de cambio
      const exchangeRate = await exchangeRateService.getCurrentUSDARS();
      const buyerExchangeRate = exchangeRate.data.buyer;

      // Actualiza el modelo de métricas mensuales
      const updatedMonthlyMetrics = await MonthlyMetricsService.payments(
        appointmentId,
        month,
        year,
        buyerExchangeRate
      );

      // Actualiza el modelo de métricas diarias
      const updateDailyMetrics = await DailyMetricsService.updateDailyMetrics(
        appointmentId,
        buyerExchangeRate
      );

      if (updatedMonthlyMetrics.error || updateDailyMetrics.error) {
        return res
          .status(400)
          .send(updatedMonthlyMetrics.message || updateDailyMetrics.message);
      }

      res.status(201).send({
        appointment: updatedAppointment.data,
        MonthlyMetrics: updatedMonthlyMetrics.data,
        DailyMetrics: updateDailyMetrics.data,
        message: updatedAppointment.message,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteAppointment: async (req, res, next) => {
    try {
      const appointmentId = req.params.appointmentId;
      const deletedAppointment = await AppointmentsService.deleteAppointment(
        appointmentId
      );
      if (deletedAppointment.error) {
        return res.status(400).send(deletedAppointment.message);
      }
      res.status(201).send({
        appointment: deletedAppointment.data,
        message: deletedAppointment.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
