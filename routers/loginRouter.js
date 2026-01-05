const express = require("express");
const {
  signup,
  login,
  logout,
  changePass,
  checkUser,
} = require("../controller/login");
const loginRouter = express.Router();

loginRouter.post("/signup", signup);
loginRouter.post("/login", login);
loginRouter.get("/logout", logout);
loginRouter.post("/check-user", checkUser);
loginRouter.post("/change-pass", changePass);

module.exports = { loginRouter };
