const formatNumber = (value, decimalPlaces) => {
  let decimals = decimalPlaces || 2;
  let convertedValue = parseFloat(value.replace(".", "").replace(",", "."));
  return !isNaN(convertedValue)
    ? convertedValue.toFixed(decimals)
    : "Not available";
};

module.exports = {
  formatNumber,
};
