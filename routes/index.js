const express = require("express");
const router = express.Router();
const users = require("./users");
const addresses = require("./addresses");
const appointments = require("./appointments");
const services = require("./services");
const patients = require("./patients");
const auth = require("./auth");
const exchangeRate = require("./exchangeRate");
const payments = require("./payments");


router.use("/users", users);
router.use("/address", addresses);
router.use("/appointments", appointments);
router.use("/services", services);
router.use("/patients", patients);
router.use("/auth", auth);
router.use("/fx", exchangeRate);
router.use("/payments", payments);



module.exports = router;
