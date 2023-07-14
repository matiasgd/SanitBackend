const { MonthlyMetric, Appointments, Services } = require("../db_models");

module.exports = class MonthlyMetricsService {
  static async findMonthlyMetrics(doctorId, addressId) {
    try {
      const monthlyMetrics = await MonthlyMetric.find({
        address: addressId,
        doctor: doctorId,
      });

      if (monthlyMetrics.length === 0) {
        return {
          error: true,
          message: "Las métricas mensuales no existen.",
        };
      }
      return { error: false, data: monthlyMetrics };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async payments(appointmentId, buyerExchangeRate) {
    try {
      const appointment = await Appointments.findById(appointmentId);
      if (!appointment) {
        return {
          error: true,
          message: "La cita no existe",
        };
      }
      if (appointment.status === "Completada") {
        return {
          error: true,
          message: "La cita ya fue completada y no puede ser modificada.",
        };
      }
      const { doctor, address } = appointment;
      const serviceId = appointment.service;
      const service = await Services.findById(serviceId);

      const updatedMonthlyMetrics = await MonthlyMetric.findOneAndUpdate(
        {
          address: address,
          doctor: doctor,
          month: appointment.paymentDate.getMonth() + 1,
          year: appointment.paymentDate.getFullYear(),
        },
        {
          $inc: {
            appointments: 1,
            localFees: service.price,
            usdFees: (service.price / buyerExchangeRate).toFixed(2),
          },
        },
        { upsert: true }
      );
      return { error: false, data: updatedMonthlyMetrics };
    } catch (error) {
      return { error: true, data: error };
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
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // El mes se indexa desde 0, por lo que se le suma 1
      const currentYear = currentDate.getFullYear();

      const updatedMonthlyMetrics = await MonthlyMetric.findOneAndUpdate(
        {
          address: address,
          doctor: doctor,
          month: currentMonth,
          year: currentYear,
        },
        {
          $inc: {
            appointments: 1,
            cancelations: appointment.status === "Cancelada" ? 1 : 0,
          },
        },
        { upsert: true }
      );
      return { error: false, data: updatedMonthlyMetrics };
    } catch (error) {
      return { error: true, data: error };
    }
  }
};
