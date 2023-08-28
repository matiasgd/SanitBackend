const MonthlyMetricsService = require("../services/dailyMetrics_services");
const DailyMetricsService = require("../services/dailyMetrics_services");

module.exports = {
    findMonthlyMetrics: async (req, res, next) => {
    try {
      const { doctorId, addressId } = req.params;
      const monthlyMetrics = await MonthlyMetricsService.findMonthlyMetrics(doctorId, addressId)
      if (monthlyMetrics.error) {
        return res
        .status(400)
        .send(monthlyMetrics.message);
      }
      res.status(201).send({
        appointment: monthlyMetrics.data,
        message: "El turno fue encontrado exitosamente",
      });
    } catch (err) {
      next(err);
    }
  },
  findDailyMetrics: async (req, res, next) => {
    try {
      const { doctorId, addressId } = req.params;
      const result = await DailyMetricsService.findDailyMetrics(doctorId, addressId);

      if (result.error) {
        return res.status(400).send(result.message);
      }

      res.status(200).send({
        dailyMetrics: result.data,
        message: "Las métricas diarias se encontraron exitosamente.",
      });
    } catch (error) {
      next(error);
    }
  },
};
