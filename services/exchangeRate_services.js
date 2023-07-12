const convert = require("xml-js");
const axios = require("axios");
const { ExchangeRate } = require("../db_models");

module.exports = class ExchangeRateService {
  static async getCurrentUSDARS() {
    try {
      let USDARS = await ExchangeRate.find({
        pair: "USD/ARS",
        type: "Parallel",
      }).sort({
        date: -1,
      });
      if (!USDARS) {
        return {
          error: true,
          message: "El dolar no existe",
        };
      }
      return {
        error: false,
        data: USDARS[0],
        message: "El dolar se ha encontrado!",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async getInfoUSDARS() {
    try {
      const dataDolar = await axios.get(
        "https://www.dolarsi.com/api/dolarSiInfo.xml"
      );
      const json = convert.xml2json(dataDolar.data, {
        compact: true,
        spaces: 4,
      });
      const jsonParsed = JSON.parse(json);
      if (!jsonParsed) {
        return {
          error: true,
          message: "El dolar json no existe",
        };
      }
      return {
        error: false,
        data: jsonParsed,
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async createExchangeRate(values) {
    try {
      const { date, type, pair, buyer, seller, average } = values;

      // Crear un nuevo tipo de cambio
      const exchangeRate = new ExchangeRate({
        date: date,
        type: type,
        pair: pair,
        buyer: buyer,
        seller: seller,
        average: average
      });
      const createdExchangeRate = await exchangeRate.save();
      return {
        error: false,
        data: createdExchangeRate,
      };
    } catch (error) {
      return {
        error: true,
        message: error,
      };
    }
  }
};
