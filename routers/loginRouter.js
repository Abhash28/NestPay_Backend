const express = require("express");
const {
  signup,
  login,
  changePass,
  checkUser,
} = require("../controller/login");

const loginRouter = express.Router();

loginRouter.post("/signup", signup);
loginRouter.post("/login", login);
loginRouter.post("/check-user", checkUser);
loginRouter.post("/change-pass",changePass);

module.exports = { loginRouter };
