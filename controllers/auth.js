const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Users } = require("../db_models");

module.exports = {
  userLogin: async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const user = await Users.findOne({ email: email });

      if (!user) {
        return res.status(401).send("User not found in the database");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send("Wrong password");
      }
      const payload = { id: user._id, email: user.email };
      const token = jwt.sign(payload, "your-secret-key", { expiresIn: "1h" });
      res.cookie("token", token).send(payload);
    } catch (error) {
      next(error);
    }
  },
  userLogout: (req, res) => {
    res.clearCookie("token");
    res.status(200).send({});
  },
  userMe: (req, res) => {
    res.send(req.user);
  },
};
