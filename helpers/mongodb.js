const mongoose = require("mongoose");
const { mongoURI, mongoTestURI, nodeENV } = require("../config");

const URI = nodeENV === "development" ? mongoURI : mongoTestURI;

const checkConnection = () => {
  console.log(mongoose.connection.readyState);
  return mongoose.connection.readyState;
};

const connect = async () => {
  try {
    if (!checkConnection()) {
      console.log("Connecting...");
      await mongoose.connect(URI, {});
    }
    console.log("Connected successfully");
  } catch (error) {
    console.error(error);
  }
};

const disconnect = async () => {
  await mongoose.connection.close();
  return checkConnection();
};

module.exports = { connect, checkConnection, disconnect };
