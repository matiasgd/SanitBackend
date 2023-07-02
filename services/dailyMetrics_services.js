const { DailyMetric } = require("../db_models");


module.exports = class MonthlyMetricsService {
  static async findDailyMetrics(doctorId, addressId, fees) {
    try {
      const dailyMetrics = await DailyMetric.findOneAndUpdate({
        address: addressId,
        doctor: doctorId,
      },
      {
        $inc: {
          appointments: 1,
          fees: fees,
        },
      },
      { upsert: true });
      return { error: false, data: dailyMetrics};
    } catch (error) {
      return { error: true, data: error };
    }
  }
}


   
     