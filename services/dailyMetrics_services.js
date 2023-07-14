const { DailyMetric, Appointments, Services } = require("../db_models");

module.exports = class MonthlyMetricsService {
  static async findDailyMetrics(doctorId, addressId, fees, buyerExchangeRate) {
    try {
      const dailyMetrics = await DailyMetric.findOneAndUpdate(
        {
          address: addressId,
          doctor: doctorId,
        },
        {
          $inc: {
            appointments: 1,
            fees: fees,
          },
        },
        { upsert: true }
      );
      return { error: false, data: dailyMetrics };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async updateDailyMetrics(appointmentId, buyerExchangeRate) {
    try {
      const appointment = await Appointments.findById(appointmentId);

      if (!appointment) {
        return {
          error: true,
          message: "La cita no existe",
        };
      }

      const { doctor, address } = appointment;
      const serviceId = appointment.service;
      const service = await Services.findById(serviceId);
      const appointmentDate = new Date(appointment.paymentDate);

      const updatedDailyMetrics = await DailyMetric.findOneAndUpdate(
        {
          address: address,
          doctor: doctor,
          date: appointmentDate.toISOString().split("T")[0],
        },
        {
          $inc: {
            appointments: 1,
            localFees: service.price,
            usdFees: (service.price / buyerExchangeRate).toFixed(2),
            cancelations: appointment.status === "Cancelada" ? 1 : 0,
          },
        },
        { upsert: true }
      );

      return {
        error: false,
        data: updatedDailyMetrics,
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }
  static async cancelations(appointmentId) {
    try {
      const appointment = await Appointments.findById(appointmentId);

      if (!appointment) {
        return {
          error: true,
          message: "La cita no existe",
        };
      }

      const { doctor, address } = appointment;
      const appointmentDate = new Date(appointment.paymentDate);

      const updatedDailyMetrics = await DailyMetric.findOneAndUpdate(
        {
          address: address,
          doctor: doctor,
          date: appointmentDate.toISOString().split("T")[0],
        },
        {
          $inc: {
            appointments: 1,
            cancelations: appointment.status === "Cancelada" ? 1 : 0,
          },
        },
        { upsert: true }
      );
      return {
        error: false,
        data: updatedDailyMetrics,
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }
};
