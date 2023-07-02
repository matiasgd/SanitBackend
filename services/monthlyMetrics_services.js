const { MonthlyMetric } = require("../db_models");


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
  static async updateMonthlyMetrics(addressId, doctorId, month, year, fees) {
    try {
      
      const updatedMonthlyMetrics = await MonthlyMetric.findOneAndUpdate(
        {
          address: addressId,
          doctor: doctorId,
          month: month,
          year: year,
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

   
     