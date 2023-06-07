const express = require("express");
const router = express.Router();
const users = require("./users");
const addresses = require("./addresses");
const appointments = require("./appointments");
const fees = require("./fees");
const services = require("./services");
const patients = require("./patients");
const auth = require("./auth");

router.use("/users", users);
router.use("/addresses", addresses);
router.use("/appointments", appointments);
router.use("/fees", fees);
router.use("/services", services);
router.use("/patients", patients);
router.use("/auth", auth);

module.exports = router;
