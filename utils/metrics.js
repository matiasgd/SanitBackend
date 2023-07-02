const DailyMetric = require("../db_models/DailyMetric");
const MonthlyMetric = require("../db_models/MonthlyMetric");

// ---------------- MONTHLY ---------------- //

// Calcular el total de citas mensuales

async function findAppointments (doctorId,month,year) {
  const metric = await MonthlyMetric.findOne({
    doctor: doctorId,
    month: month,
    year: year
  });
  
  if (metric) {
    return metric.totalAppointments;
  }
  return 0; 
}

// Actualizar ingresos del consultorio

async function addFees(addressId, doctorId, date, fees) {
  // Obtener el mes y el año
  const month = date.getMonth() + 1; 
  const year = date.getFullYear(); 
  // Actualizar el ingreso mensual
  let monthlyMetric = await MonthlyMetric.findOne({
    address: addressId,
    doctor: doctorId,
    month: month,
    year: year
  });
  if (!monthlyMetric) {
    monthlyMetric = new MonthlyMetric({
      address: addressId,
      doctor: medicoId,
      month: mes,
      year: anio,
      totalFees: 0
    });
  }

  monthlyMetric.totalFees += fees;
  const updatedMonthyMetrics = await monthlyMetric.save();

  // Actualizar el ingreso diario
  let dailyMetric = await DailyMetric.findOne({
    address: addressId,
    doctor: doctorId,
    date: date
  });

  if (!dailyMetric) {
    dailyMetric = new DailyMetric({
      doctor: medicoId,
      date: date,
      appointments: 0,
      fees: 0
    });
  }

  dailyMetric.fees += honorarios;
  await dailyMetric.save();
}