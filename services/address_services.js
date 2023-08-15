const { Users, Addresses, Appointments } = require("../db_models");
const moment = require("moment");

module.exports = class AddressesService {
  static async findAllAddresses() {
    try {
      const addresses = await Addresses.find();
      console.log(addresses);
      if (!addresses) {
        return {
          status: 404,
          error: true,
          message: "No se encontraron direcciones",
        };
      }
      return {
        status: 200,
        error: false,
        data: addresses,
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }
  static async findMyAddresses(id) {
    try {
      const user = await Users.findById(id);
      // Verificar si el usuario existe
      if (!user) {
        return {
          status: 404,
          error: true,
          message: "El usuario no existe",
        };
      }

      // Verificar si el usuario es un doctor
      const addresses = await Addresses.find({ doctor: id });
      console.log(addresses, addresses.length);
      if (!addresses) {
        return {
          status: 404,
          error: true,
          message: "No se encontraron direcciones",
        };
      }
      return {
        status: 200,
        error: false,
        data: addresses,
      };
    } catch (error) {
      return {
        error: true,
        data: error,
      };
    }
  }

  static async findSchedule(id, type) {
    try {
      const address = await Addresses.findById(id);
      // Verificar si el usuario existe
      if (!address) {
        return {
          status: 404,
          error: true,
          message: "El consultorio no existe",
        };
      }

      // Definir la fecha de inicio y fin de la semana actual
      const today = moment();
      const startOfWeek = today.clone().startOf("week");
      const endOfWeek = today.clone().endOf("week");

      // Array para almacenar los horarios
      const schedule = [];

      // Obtener los horarios del consultorio
      const appointments = await Appointments.find({
        address: id,
        startTime: { $gte: startOfWeek.toDate(), $lt: endOfWeek.toDate() },
      });

      // Generar los bloques de horarios para toda la semana
      const startOfDay = moment().hours(9).minutes(0); // Hora de apertura
      const endOfDay = moment().hours(18).minutes(0); // Hora de cierre
      const timeIncrement = 30; // Incremento de tiempo en minutos

      // Iterar sobre los bloques de tiempo
      while (startOfDay.isBefore(endOfDay)) {
        const appointmentEndTime = startOfDay
          .clone()
          .add(timeIncrement, "minutes");

        const isAvailable = appointments.every((appointment) => {
          const appointmentStart = moment(appointment.startTime);
          const appointmentEnd = moment(appointment.endTime);
          return (
            startOfDay.isBefore(appointmentStart) ||
            appointmentEndTime.isAfter(appointmentEnd)
          );
        });

        if (type === "available" || type === "allschedule") {
          const blockIsOccupied = appointments.some((appointment) => {
            const appointmentStart = moment(appointment.startTime);
            const appointmentEnd = moment(appointment.endTime);

            // Verificar si el bloque de tiempo se superpone con el turno existente
            const overlaps =
              (startOfDay.isSameOrBefore(appointmentEnd) &&
                startOfDay.isSameOrAfter(appointmentStart)) ||
              (appointmentEndTime.isSameOrBefore(appointmentEnd) &&
                appointmentEndTime.isSameOrAfter(appointmentStart));

            return overlaps;
          });

          schedule.push({
            startTime: startOfDay.toISOString(),
            endTime: appointmentEndTime.toISOString(),
            availability: blockIsOccupied ? "occupied" : "available", // Aquí está el cambio
          });
        }

        startOfDay.add(timeIncrement, "minutes");
      }

      // Retornar el resultado
      if (type === "available") {
        return {
          status: 200,
          error: false,
          data: schedule,
        };
      } else if (type === "allschedule") {
        return {
          status: 200,
          error: false,
          data: schedule.map((item) => ({
            ...item,
            availability:
              item.availability === "available" ? "available" : "occupied",
          })),
        };
      } else {
        return {
          status: 400,
          error: true,
          message: "Tipo de horario no válido",
        };
      }
    } catch (error) {
      return {
        status: 500,
        error: true,
        data: error,
      };
    }
  }

  static async createAddress(doctorId, addressDTO) {
    try {
      const {
        street,
        number,
        floor,
        addressType,
        webAddress,
        houseApartment,
        country,
        province,
        city,
      } = addressDTO;

      // validar que los campos obligatorios no esten vacios
      if (!street || !number) {
        return {
          status: 400,
          error: true,
          message: "Faltan campos obligatorios",
        };
      }
      // Verificar si el médico existe
      const doctor = await Users.findOne({ _id: doctorId });
      if (!doctor) {
        return {
          status: 404,
          error: true,
          message: "Médico no encontrado",
        };
      }
      // Crear el nuevo servicio
      const newAddress = new Addresses({
        doctor: doctorId,
        ...addressDTO,
      });
      // Guardar el servicio en la base de datos
      const createdAddress = await newAddress.save();

      // agregar la nueva direccion al medico
      const updatedDoctor = await Users.findOneAndUpdate(
        { _id: doctorId },
        { $push: { addresses: createdAddress._id } },
        { new: true }
      );
      if (!updatedDoctor) {
        return {
          status: 404,
          error: true,
          message: "Médico no encontrado",
        };
      }
      return {
        status: 201,
        error: false,
        address: createdAddress,
        message: "La direccion se ha creado exitosamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }

  static async updateAddress(addressId, addressDTO) {
    try {
      // actualizacion si el paciente existe
      const updatedAddress = await Addresses.findOneAndUpdate(
        { _id: addressId },
        addressDTO,
        { new: true }
      );
      if (!updatedAddress) {
        return {
          error: true,
          message: "No se pudo actualizar la direccion",
        };
      }
      return {
        error: false,
        data: updatedService,
        message: "la direccion fue actualizada exitosamente!",
      };
    } catch (err) {
      throw err;
    }
  }
  static async deleteAddress(addressId) {
    try {
      // Verificar si la dirección existe
      const address = await Addresses.findOneAndDelete({ _id: addressId });
      if (!address) {
        return {
          error: true,
          message: "La direccion no se encontró",
        };
      }
      const doctorId = address.doctor.toString();
      const doctor = await Users.findOne({ _id: doctorId });
      if (!doctor) {
        return {
          error: true,
          message: "Médico no encontrado",
        };
      }
      // eliminar direccion del medico
      doctor.addresses.pull(addressId);
      await doctor.save();
      return {
        error: false,
        data: address,
        message: "La direccion se ha eliminado exitosamente",
      };
    } catch (error) {
      return { error: true, data: error };
    }
  }
};
