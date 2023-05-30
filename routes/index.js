const express = require("express");
const router = express.Router();
const users = require("./users");
const addresses = require("./addresses");


router.use("/users", users);
router.use("/addresses", addresses);


module.exports = router;
