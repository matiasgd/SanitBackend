const { Payments, Appointments, ExchangeRate } = require("../db_models");
const { checkIdFormat } = require("../utils/validations");
const moment = require("moment");

module.exports = class AppointmentsService {
  static async findAllPayments() {
    try {
      const payments = await Payments.find();
      return {
        status: 201,
        error: false,
        data: payments,
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }
  static async findPaymentById(paymentId) {
    try {
      // Validar ID
      const validId = checkIdFormat(paymentId);
      if (validId.error) {
        return validId;
      }
      const payment = await Payments.findById(paymentId);
      if (!payment) {
        return {
          error: true,
          status: 404,
          message: "La cita no existe en la base de datos",
        };
      }
      return {
        error: false,
        status: 201,
        data: payment,
        message: "El pago fue encontrado exitosamente",
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }
  static async getPaymentsByDoctorId(doctor) {
    try {
      // Validar ID
      const validId = checkIdFormat(doctor);
      if (validId.error) {
        return validId;
      }
      const payments = await Payments.find({ doctor }).populate({
        path: "appointment",
        select: "service patient",
        populate: [
          {
            path: "patient",
            select: "name lastName",
          },
          {
            path: "service",
            select: "serviceName", // Selecciona los campos que deseas traer
          },
        ],
      });
      if (!payments) {
        return {
          status: 404,
          error: true,
          message: "No hay turnos asignados",
        };
      }
      return {
        status: 201,
        error: false,
        data: payments,
        message: "Los pagos fueron encontrados exitosamente!",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async getPaymentsByPatientId(patient) {
    try {
      // Validar ID
      const validId = checkIdFormat(patient);
      if (validId.error) {
        return validId;
      }
      const payments = await Payments.find({ patient }).populate({
        path: "appointment",
        select: "service patient",
        populate: [
          {
            path: "patient",
            select: "name lastName",
          },
          {
            path: "service",
            select: "serviceName",
          },
        ],
      });
      if (!payments) {
        return {
          status: 404,
          error: true,
          message: "No hay turnos asignados para este paciente",
        };
      }
      return {
        status: 201,
        error: false,
        data: payments,
        message: "Los pagos fueron encontrados exitosamente!",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async createPayment(paymentDTO) {
    try {
      const {
        appointmentId,
        doctorId,
        patientId,
        date,
        amount,
        currency,
        method,
        status,
      } = paymentDTO;

      // Convertir fecha y hora en un solo objeto Moment
      const formattedDate = moment(`${date}`, "YYYY-MM-DD");

      // Verificar si la cita existe
      const appointment = await Appointments.findById(appointmentId);
      if (!appointment) {
        return {
          status: 404,
          error: true,
          message: "La cita no existe",
        };
      }
      // Buscar tipo de cambio
      let closestExchangeRate = null;
      if (currency === "ARS") {
        // tipo de cambio
        const exchangeRates = await ExchangeRate.find({ type: "Parallel" });
        // Ordenar los tipos de cambio por fecha en orden descendente
        exchangeRates.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Tipo de cambio más cercano a la fecha de pago
        closestExchangeRate = exchangeRates.reduce((closest, current) => {
          const closestTimeDifference = Math.abs(
            formattedDate - new Date(closest.date)
          );
          const currentTimeDifference = Math.abs(
            formattedDate - new Date(current.date)
          );

          return currentTimeDifference < closestTimeDifference
            ? current
            : closest;
        }, exchangeRates[0]);
      }

      console.log(appointment.paymentStatus, "que viene en el appointment");
      if (appointment.paymentStatus === "Completed") {
        return {
          status: 404,
          error: true,
          message:
            "La cita ya fue pagada previamente, no puede abonarse dos veces!",
        };
      }
      // Crear el nuevo pago
      const UsdPayment = (parseInt(amount) / closestExchangeRate.buyer).toFixed(
        2
      );

      console.log(
        appointmentId,
        doctorId,
        patientId,
        amount,
        currency,
        method,
        status,
        formattedDate
      );

      const newPayment = new Payments({
        appointment: appointmentId,
        doctor: doctorId,
        patient: patientId,
        amount: parseInt(amount),
        currency: currency,
        exchangeRate: currency === "ARS" ? closestExchangeRate.buyer : amount,
        amountUSD: UsdPayment,
        method: method,
        status: status,
        paymentDate: formattedDate,
      });

      // Guardar el pago en la base de datos
      await newPayment.save();

      // Actualizar el estado de la cita
      if (status === "Full") {
        await appointment.updateOne({
          paymentStatus: "Completed",
          paymentDate: formattedDate,
        });
      }
      // caso de citas con pago parcial
      else {
        await appointment.updateOne({
          paymentStatus: "Partial",
          paymentDate: formattedDate,
          partialPayment: parseInt(amount),
        });
      }
      return {
        status: 201,
        error: false,
        data: newPayment,
        message: "El pago fue creado exitosamente",
      };
    } catch (error) {
      return {
        status: 500,
        error: true,
        data: error,
      };
    }
  }
  static async updatePayment(paymentId, paymentDTO) {
    try {
      // actualizacion si el paciente existe
      const updatedPayment = await Payments.findOneAndUpdate(
        { _id: paymentId },
        paymentDTO,
        { new: true }
      );
      if (!updatedPayment) {
        return {
          error: true,
          message: "No se pudo actualizar la direccion",
        };
      }
      return {
        error: false,
        data: updatedPayment,
        message: "la direccion fue actualizada exitosamente!",
      };
    } catch (err) {
      throw err;
    }
  }
  static async deletePayment(paymentId) {
    try {
      // validar objectId
      const validID = checkIdFormat(paymentId);
      if (validID.error) {
        return validID;
      }
      const deletedPayment = await Payments.findByIdAndDelete(paymentId);
      if (!deletedPayment) {
        return {
          status: 404,
          error: true,
          message: "El turno no existe",
        };
      }
      return {
        error: false,
        data: deletedPayment,
        message: "El turno fue eliminado exitosamente",
      };
    } catch (err) {
      throw err;
    }
  }
};
