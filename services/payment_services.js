const { Payments, Appointments } = require("../db_models");
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
      const payments = await Payments.find({ doctor }).populate(
        "appointment",
        "patient service"
      );
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
        message: "Los turnos fueron encontrados exitosamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
  static async createPayment(paymentDTO) {
    try {
      console.log(paymentDTO, "paymentDTO");
      const {
        appointmentId, // ID de la cita asociada al pago
        date, // Fecha del pago
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
      // Crear el nuevo pago
      console.log(formattedDate, "formattedDate");
      const newPayment = new Payments({
        appointment: appointmentId,
        amount: parseInt(amount),
        currency: currency,
        method: method,
        status: status,
        paymentDate: formattedDate,
      });
      // Guardar el pago en la base de datos
      await newPayment.save();
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
