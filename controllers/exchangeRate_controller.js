const exchangeRate_services = require("../services/exchangeRate_services.js");
const { formatNumber } = require("../utils/exchangeRate.js");

module.exports = {
  createExchangeRateUSDARS: async (req, res, next) => {
    try {
      console.log("cron job running");
      const data = await exchangeRate_services.getInfoUSDARS();
      const oficial = {
        date: new Date(),
        type: "Oficial",
        pair: "USD/ARS",
        buyer: formatNumber(data.data.cotiza.Dolar.casa344.compra._text),
        seller: formatNumber(data.data.cotiza.Dolar.casa344.venta._text),
      };

      const parallel = {
        date: new Date(),
        type: "Parallel",
        pair: "USD/ARS",
        buyer: formatNumber(data.data.cotiza.Dolar.casa380.compra._text),
        seller: formatNumber(data.data.cotiza.Dolar.casa380.venta._text),
      };

      const OfficialFX = await exchangeRate_services.createExchangeRate(
        oficial
      );

      if (OfficialFX.error) {
        return res.status(400).send(OfficialFX.message);
      }

      const ParallelFX = await exchangeRate_services.createExchangeRate(
        parallel
      );

      if (ParallelFX.error) {
        return res.status(400).send(ParallelFX.message);
      }

      res.status(201).send({
        oficialFX: OfficialFX.data,
        parallelFX: ParallelFX.data,
        message: "Exchange rate created successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};
