const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  getAllRentDue,
  tenantPendingRent,
  currentDue,
} = require("../controller/RentDue");

const rentDueRouter = express.Router();

rentDueRouter.get("/alldue", verifyAdmin, getAllRentDue);

//pending rent due for tenant side home page
rentDueRouter.get("/tenant/rent", verifyAdmin, tenantPendingRent);

module.exports = { rentDueRouter };
