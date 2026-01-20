const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  createOrder,
  verifyPayment,
  markCashPayment,
  recentPaid,
  paidRent,
  recentPaidTenant,
} = require("../controller/PaymentController");

const paymentRouter = express.Router();

paymentRouter.post("/create-order", verifyAdmin, createOrder);
paymentRouter.post("/verifyPayment", verifyAdmin, verifyPayment);
//mark cash payment by admin
paymentRouter.post("/cash", verifyAdmin, markCashPayment);

//recent payment for admin dashboard stats
paymentRouter.get("/recent-paid", verifyAdmin, recentPaid);

//recent payment for admin dashboard stats
paymentRouter.get("/recent/tenant/paid", verifyAdmin, recentPaidTenant);
//this api is for paid payment history in tenant side
paymentRouter.get("/tenant/history", verifyAdmin, paidRent);

module.exports = { paymentRouter };
