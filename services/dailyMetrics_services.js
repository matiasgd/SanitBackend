const { DailyMetric, Appointments, Services } = require("../db_models");

module.exports = class MonthlyMetricsService {
  static async findDailyMetrics(doctorId, addressId, fees) {
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
  static async updateDailyMetrics(appointmentId, date) {
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

      const updatedDailyMetrics = await DailyMetric.findOneAndUpdate(
        {
          address: address,
          doctor: doctor,
          date: date,
        },
        {
          $inc: {
            appointments: 1,
            fees: service.price,
          },
        },
        { upsert: true }
      );

      console.log("updatedDailyMetrics", updatedDailyMetrics)
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
