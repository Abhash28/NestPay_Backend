const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  createOrder,
  verifyPayment,
  markCashPayment,
  recentPaid,
  paidRent,
  recentPaidTenant,
  paymentHistory,
  downloadPaymentPdf,
  transactionDetail,
} = require("../controller/PaymentController");

const paymentRouter = express.Router();

paymentRouter.post("/create-order", verifyAdmin, createOrder);
paymentRouter.post("/verifyPayment", verifyAdmin, verifyPayment);
//mark cash payment by admin
paymentRouter.post("/cash", verifyAdmin, markCashPayment);

//recent payment for admin dashboard stats
paymentRouter.get("/recent-paid", verifyAdmin, recentPaid);

//admin payment histroy
paymentRouter.get("/history", verifyAdmin, paymentHistory);

//make pdf for history
paymentRouter.get("/pdf", verifyAdmin, downloadPaymentPdf);

//recent payment for admin dashboard stats
paymentRouter.get("/recent/tenant/paid", verifyAdmin, recentPaidTenant);
//this api is for paid payment history in tenant side
paymentRouter.get("/tenant/history", verifyAdmin, paidRent);

//payment detail
paymentRouter.get(
  "/transaction-detail/:rentDueId",
  verifyAdmin,
  transactionDetail,
);

module.exports = { paymentRouter };
