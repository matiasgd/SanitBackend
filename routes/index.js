const express = require("express");
const router = express.Router();
const users = require("./users");
const addresses = require("./addresses");
const appointments = require("./appointments");
const services = require("./services");
const patients = require("./patients");
const auth = require("./auth");
const fx = require("./exchangeRate");


router.use("/users", users);
router.use("/address", addresses);
router.use("/appointments", appointments);
router.use("/services", services);
router.use("/patients", patients);
router.use("/auth", auth);
router.use("/fx", fx);



module.exports = router;
