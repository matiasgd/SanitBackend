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
  static async updateMonthlyMetrics(appointmentId, month, year) {    
    try {      
      const appointment = await Appointments.findById(appointmentId);
      if (!appointment) {
        return {
          error: true,
          message: "La cita no existe", 
        };
      }
      const { doctor, address } = appointment;
      const serviceId = appointment.service
      const service = await Services.findById(serviceId);

      const updatedMonthlyMetrics = await MonthlyMetric.findOneAndUpdate(
        {
          address: address,
          doctor: doctor,
          month: month,
          year: year,
          fees: service.fee,
        },
        {
          $inc: {
            appointments: 1,
            fees: fees,
          },
        },
        { upsert: true }
      );
      return { error: false, data: updatedMonthlyMetrics };
    } catch (error) {
      return { error: true, data: error };
    } 
  }
}

   
     