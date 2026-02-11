const express = require("express");
const { verifyAdmin } = require("../utils/verifyAdmin");
const {
  getAllRentDue,
  tenantPendingRent,
  totalCollection,
} = require("../controller/RentDue");
const RentDueSchema = require("../model/RentDueSchema");

const rentDueRouter = express.Router();

rentDueRouter.get("/alldue", verifyAdmin, getAllRentDue);

//pending rent due for tenant side home page
rentDueRouter.get("/tenant/rent", verifyAdmin, tenantPendingRent);

//total collection
rentDueRouter.get("/collection", verifyAdmin, totalCollection);
module.exports = { rentDueRouter };
