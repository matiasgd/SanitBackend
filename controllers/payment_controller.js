const AppointmentsService = require("../services/appointment_services");
const MonthlyMetricsService = require("../services/monthlyMetrics_services");
const DailyMetricsService = require("../services/dailyMetrics_services");
const exchangeRateService = require("../services/exchangeRate_services");
const PaymentsService = require("../services/payment_services");

module.exports = {
  getAllPayments: async (req, res, next) => {
    try {
      const result = await PaymentsService.findAllPayments();
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
  getPaymentById: async (req, res, next) => {
    try {
      const { paymentId } = req.params;
      const result = await PaymentsService.findPaymentById(paymentId);
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
  getPaymentsByDoctorId: async (req, res, next) => {
    try {
      const { doctorId } = req.params;
      const result = await PaymentsService.getPaymentsByDoctorId(doctorId);
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
  createPayment: async (req, res, next) => {
    try {
      const paymentDTO = { ...req.body };
      const result = await PaymentsService.createPayment(paymentDTO);
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
  updatePayment: async (req, res, next) => {
    try {
      const { paymentId } = req.params;
      const addressDTO = { ...req.body };
      // Crear el nuevo servicio
      const result = await PaymentsService.updatePayment(paymentId, addressDTO);
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
  deletePayment: async (req, res, next) => {
    try {
      const paymentId = req.params.paymentId;
      const result = await PaymentsService.deletePayment(paymentId);
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
};
