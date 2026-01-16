const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  createOrder,
  verifyPayment,
} = require("../controller/paymentController");

const paymentRouter = express.Router();

paymentRouter.post("/create-order", verifyAdmin, createOrder);
paymentRouter.post("/verifyPayment", verifyAdmin, verifyPayment);

module.exports = { paymentRouter };
