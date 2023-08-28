module.exports = {
  nodeENV: process.env.NODE_ENV,
  port: process.env.PORT_DEV,
  port_Test: process.env.PORT_TEST,
  mongoURI: process.env.MONGO_URI_DEV,
  mongoTestURI: process.env.MONGO_URI_TEST,
  corsOrigin: process.env.CORS_ORIGIN,
  secret: process.env.SECRETO,
  sanitEmail: process.env.EMAIL,
  sanitPassword: process.env.EMAIL_PASSWORD,
};
